-- ====================================================================
-- MIGRACIÓN INICIAL: CampusAid UPTC - Caso 3: Mesa de Ayuda y Tutorías
-- Versión: 20261115_001_initial_schema.sql
-- ====================================================================

-- 1. Extensión para generación de UUIDs si no está habilitada
create extension if not exists "pgcrypto";

-- 2. Tabla de perfiles de usuario para control de roles
create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo varchar(150) not null,
  codigo_uptc varchar(9) check (codigo_uptc ~ '^[0-9]{9}$'),
  email_institucional varchar(255) not null check (lower(email_institucional) ~ '^[^@[:space:]]+@uptc\.edu\.co$'),
  rol varchar(30) not null default 'estudiante' check (rol in ('estudiante', 'coordinador_tutoria', 'coordinador_laboratorio', 'coordinador_certificados', 'coordinador_general', 'admin')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- 3. Tabla principal: solicitudes_campus
create table if not exists public.solicitudes_campus (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid references auth.users(id) on delete set null,
  estudiante_nombre varchar(150) not null,
  codigo_uptc varchar(9) not null check (codigo_uptc ~ '^[0-9]{9}$'),
  email_institucional varchar(255) not null check (lower(email_institucional) ~ '^[^@[:space:]]+@uptc\.edu\.co$'),
  tipo_tramite varchar(30) not null check (tipo_tramite in ('Tutoria', 'Laboratorio', 'Certificado')),
  asignatura_o_lab varchar(200),
  descripcion text not null,
  estado varchar(30) not null default 'Pendiente' check (estado in ('Pendiente', 'En revisión', 'Aprobada', 'Rechazada', 'Finalizada')),
  request_id uuid unique, -- Llave de idempotencia para prevenir duplicados
  area_asignada varchar(100),
  observacion_coordinador text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- 4. Índices para optimizar consultas frecuentes
create index if not exists idx_solicitudes_estudiante on public.solicitudes_campus(estudiante_id);
create index if not exists idx_solicitudes_estado on public.solicitudes_campus(estado);
create index if not exists idx_solicitudes_tipo on public.solicitudes_campus(tipo_tramite);
create index if not exists idx_solicitudes_codigo on public.solicitudes_campus(codigo_uptc);
create index if not exists idx_solicitudes_request_id on public.solicitudes_campus(request_id);

-- 5. Habilitar Row Level Security (RLS)
alter table public.perfiles enable row level security;
alter table public.solicitudes_campus enable row level security;

-- Políticas de Seguridad para Perfiles
create policy "usuarios_leen_su_propio_perfil"
  on public.perfiles for select to authenticated
  using (id = (select auth.uid()));

create policy "usuarios_actualizan_su_propio_perfil"
  on public.perfiles for update to authenticated
  using (id = (select auth.uid()));

-- Políticas de Seguridad para Solicitudes Campus
-- Estudiantes autenticados solo leen sus solicitudes
create policy "estudiante_lee_propias"
  on public.solicitudes_campus for select to authenticated
  using (
    estudiante_id = (select auth.uid())
    or exists (
      select 1 from public.perfiles p
      where p.id = (select auth.uid())
      and p.rol in ('coordinador_tutoria', 'coordinador_laboratorio', 'coordinador_certificados', 'coordinador_general', 'admin')
    )
  );

-- Estudiantes autenticados pueden crear sus propias solicitudes
create policy "estudiante_crea_propias"
  on public.solicitudes_campus for insert to authenticated
  with check (
    estudiante_id = (select auth.uid())
    or estudiante_id is null
  );

-- Coordinadores autorizados pueden actualizar estado
create policy "coordinador_actualiza_estado"
  on public.solicitudes_campus for update to authenticated
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = (select auth.uid())
      and p.rol in ('coordinador_tutoria', 'coordinador_laboratorio', 'coordinador_certificados', 'coordinador_general', 'admin')
    )
  );

-- 6. Trigger para actualizar automáticamente actualizado_en
create or replace function public.actualizar_timestamp_modificacion()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_actualizar_timestamp_solicitudes
  before update on public.solicitudes_campus
  for each row execute function public.actualizar_timestamp_modificacion();

-- 7. Datos de prueba reales / Semillas exigidas para el Taller (Caso 3)
-- Contempla los tres tipos de trámite: Tutoria, Laboratorio, Certificado
insert into public.solicitudes_campus (
  id,
  estudiante_nombre,
  codigo_uptc,
  email_institucional,
  tipo_tramite,
  asignatura_o_lab,
  descripcion,
  estado,
  area_asignada,
  request_id
) values 
(
  'a1111111-1111-4111-a111-111111111111',
  'Laura Marcela Gómez',
  '202410045',
  'laura.gomez@uptc.edu.co',
  'Tutoria',
  'Cálculo Diferencial e Integral',
  'Requiero apoyo y tutoría para comprensión de integrales definidas y métodos de sustitución antes del examen parcial final.',
  'Pendiente',
  'Coordinación Académica',
  'b1111111-1111-4111-b111-111111111111'
),
(
  'a2222222-2222-4222-a222-222222222222',
  'Carlos Andrés Salamanca',
  '202320112',
  'carlos.salamanca@uptc.edu.co',
  'Laboratorio',
  'Redes de Computadores y Telecomunicaciones',
  'Solicitud de acceso al laboratorio de redes de la Facultad de Ingeniería para configuración física de routers Cisco y switches VLAN.',
  'En revisión',
  'Responsable de Laboratorios',
  'b2222222-2222-4222-b222-222222222222'
),
(
  'a3333333-3333-4333-a333-333333333333',
  'Valentina Rojas Niño',
  '202210874',
  'valentina.rojas@uptc.edu.co',
  'Certificado',
  'Certificado de Calificaciones Oficial y Buena Conducta',
  'Expedición de certificado oficial de notas y promedio acumulado para postulación a pasantía de investigación con Colciencias.',
  'Aprobada',
  'Responsable de Certificados y Admisiones',
  'b3333333-3333-4333-b333-333333333333'
)
on conflict (request_id) do nothing;
