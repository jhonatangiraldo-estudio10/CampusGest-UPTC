-- Esquema inicial de referencia; revisar antes de ejecutar.
-- La gestion de roles de coordinador y cambios de estado requiere migraciones adicionales.
create table if not exists public.solicitudes_campus (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references auth.users(id),
  estudiante_nombre varchar(150) not null,
  codigo_uptc varchar(9) not null check (codigo_uptc ~ '^[0-9]{9}$'),
  email_institucional varchar(255) not null
    check (lower(email_institucional) ~ '^[^@[:space:]]+@uptc\.edu\.co$'),
  tipo_tramite varchar(30) not null check (tipo_tramite in ('Tutoria','Laboratorio','Certificado')),
  asignatura_o_lab varchar(200),
  descripcion text not null,
  estado varchar(30) not null default 'Pendiente'
    check (estado in ('Pendiente','En revisión','Aprobada','Rechazada','Finalizada')),
  creado_en timestamptz not null default now()
);
create index if not exists idx_solicitudes_campus_estudiante on public.solicitudes_campus(estudiante_id);
alter table public.solicitudes_campus enable row level security;
create policy "estudiante_lee_propias" on public.solicitudes_campus
  for select to authenticated using (estudiante_id = (select auth.uid()));
-- Si N8N es el unico responsable de insertar, no otorgar INSERT desde el navegador.
