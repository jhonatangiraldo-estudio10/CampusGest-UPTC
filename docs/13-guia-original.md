# 13 · Guía de instalación anterior

[← Índice](../README.md)

# CampusAid UPTC — Instalación de Supabase y N8N

## 1. Alcance

Este procedimiento permite integrar Supabase y N8N al proyecto web **CampusAid UPTC** existente en GitHub. No se debe crear una segunda aplicación web.

- **Supabase:** PostgreSQL, autenticación y políticas de acceso (RLS).
- **N8N:** recepción de solicitudes, clasificación por tipo de trámite y notificaciones.
- **GitHub:** colaboración mediante una rama y Pull Request (PR).

**Antes de empezar:** solicitar al responsable del frontend la URL del repositorio, la rama base, el contenido de `.env.example` y el contrato de datos del formulario. Las rutas de este documento son propuestas: adaptar los nombres si el proyecto usa otros.

## 2. Requisitos

- Git y Node.js LTS (con npm) instalados.
- Una cuenta de GitHub con acceso al repositorio.
- Una cuenta de Supabase con permiso para crear/configurar un proyecto.
- Una instancia de N8N accesible por HTTPS para la integración publicada (N8N Cloud o servidor propio).
- Acceso al proveedor de correo que se conectará a N8N.

Comprobar herramientas:

**Windows — PowerShell**

```powershell
git --version
node --version
npm --version
```

**Linux — terminal**

```bash
git --version
node --version
npm --version
```

Si falta alguna, instalarla mediante los canales oficiales y repetir las comprobaciones.

## 3. Clonar el repositorio y crear una rama

Reemplazar `USUARIO` por la cuenta u organización propietaria y `RAMA_BASE` por la rama acordada (`main`, si corresponde).

**Windows — PowerShell**

```powershell
cd "$HOME\Documents"
git clone https://github.com/USUARIO/campusaid-uptc.git
cd .\campusaid-uptc
git fetch origin
git switch RAMA_BASE
git pull --ff-only origin RAMA_BASE
git switch -c feature/integracion-supabase-n8n
npm ci
npm run
```

**Linux — terminal**

```bash
cd "$HOME"
git clone https://github.com/USUARIO/campusaid-uptc.git
cd campusaid-uptc
git fetch origin
git switch RAMA_BASE
git pull --ff-only origin RAMA_BASE
git switch -c feature/integracion-supabase-n8n
npm ci
npm run
```

`npm ci` solo funciona si existen `package.json` y `package-lock.json`. Si el proyecto aún no dispone de lockfile, usar `npm install` y confirmar con el responsable del frontend antes de subir cambios de dependencias. `npm run` muestra los scripts disponibles; iniciar el proyecto con el script real (por ejemplo, `npm run dev` si existe).

## 4. Crear y configurar Supabase

1. Ingresar a https://supabase.com/dashboard e iniciar sesión.
2. Crear un proyecto y elegir región y contraseña de la base de datos.
3. En **Project Settings / API** (o **Connect**, según la interfaz) identificar:
   - **Project URL**.
   - **Publishable key** o clave pública heredada `anon`.
4. En **SQL Editor**, ejecutar las migraciones del repositorio, en orden. Si aún no existen, crear `supabase/migrations/` y agregar una migración con el siguiente esquema inicial.

### Esquema SQL de referencia

```sql
create table if not exists public.solicitudes_campus (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references auth.users(id) on delete cascade,
  estudiante_nombre varchar(150) not null,
  codigo_uptc varchar(9) not null
    check (codigo_uptc ~ '^[0-9]{9}$'),
  email_institucional varchar(255) not null
    check (lower(email_institucional) ~ '^[^@[:space:]]+@uptc\.edu\.co$'),
  tipo_tramite varchar(30) not null
    check (tipo_tramite in ('Tutoria', 'Laboratorio', 'Certificado')),
  asignatura_o_lab varchar(200),
  descripcion text not null,
  estado varchar(30) not null default 'Pendiente'
    check (estado in ('Pendiente', 'En revisión', 'Aprobada', 'Rechazada', 'Finalizada')),
  creado_en timestamptz not null default now()
);

create index if not exists idx_solicitudes_estudiante
  on public.solicitudes_campus(estudiante_id);
create index if not exists idx_solicitudes_estado
  on public.solicitudes_campus(estado);

alter table public.solicitudes_campus enable row level security;

-- Cada usuario autenticado consulta únicamente sus solicitudes.
create policy "estudiante_lee_propias"
  on public.solicitudes_campus for select to authenticated
  using (estudiante_id = (select auth.uid()));

-- Las inserciones desde el navegador solo se permiten para el propio usuario.
-- Si N8N es el único responsable de insertar, esta política puede omitirse.
create policy "estudiante_crea_propias"
  on public.solicitudes_campus for insert to authenticated
  with check (estudiante_id = (select auth.uid()));
```

**Notas sobre este SQL:** es un punto de partida, no un sistema completo de roles. El coordinador, la asignación por área, los cambios de estado y el historial requieren tablas/políticas adicionales. No habilitar una política pública `FOR ALL USING (true)`. La comprobación del dominio del correo no demuestra por sí sola pertenencia a la universidad: configurar autenticación/verificación de correo y autorización por usuario.

**Decisión obligatoria para evitar duplicados:** definir si el alta de solicitudes la ejecutará N8N (recomendado para este flujo) o Supabase desde el navegador; **no insertar el mismo trámite por las dos rutas**. Si N8N crea el registro, el frontend utiliza el SDK para autenticación y consultas, y la creación pasa por un backend autenticado que llama a N8N.

## 5. Configurar variables de entorno

En la raíz debe existir `.env.example` con valores de muestra y sin secretos. Comprobar primero los nombres de variables usados en el código. Si el frontend usa Vite, se puede trabajar con:

```dotenv
VITE_SUPABASE_URL=https://PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=CLAVE_PUBLICA
```

Crear un archivo local desde el ejemplo:

**Windows — PowerShell**

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

**Linux — terminal**

```bash
cp .env.example .env.local
nano .env.local
```

Reemplazar los ejemplos por la URL y la clave pública del proyecto. Si el código ya utiliza `VITE_SUPABASE_ANON_KEY`, mantener ese nombre en vez de introducir otra variable sin actualizar el código.

**Nunca usar** en el frontend claves `service_role`, `secret`, tokens de acceso de Supabase, credenciales de correo ni claves de N8N. Las variables `VITE_` quedan visibles en el navegador. Las credenciales privadas pertenecen al servidor, a las funciones backend o al almacén seguro de credenciales de N8N.

Verificar que `.gitignore` excluya `.env`, `.env.local` y variantes con secretos. Sí se debe versionar `.env.example`.

## 6. Configurar N8N

1. Abrir una instancia de N8N por HTTPS.
2. Crear un workflow nuevo o importar `n8n/campusaid-workflow.json` si ya está incluido en el repositorio.
3. Configurar los nodos en este orden:

   `Webhook POST` → `Validación` → `Switch (tipo_tramite)` → `Supabase/Postgres` → `Notificación por correo` → `Respond to Webhook`.

4. Usar una ruta de webhook identificable, por ejemplo `campusaid-solicitudes`.
5. En el nodo Switch, contemplar únicamente `Tutoria`, `Laboratorio` y `Certificado`.
6. Configurar en N8N las credenciales de Supabase/Postgres y del proveedor de correo; no escribirlas en el workflow exportado.
7. Configurar los responsables reales de cada área; no utilizar direcciones ficticias.
8. Asegurarse de que cada ruta termine con una respuesta JSON válida y códigos HTTP apropiados.
9. Probar el flujo con la **Test URL** mientras se escucha el webhook de prueba; después publicar/activar el workflow y utilizar su **Production URL**.

Ejemplo de respuesta:

```json
{
  "status": "ok",
  "solicitud_id": "UUID_REGISTRADO",
  "tipo_tramite": "Tutoria",
  "estado": "Pendiente"
}
```

### Protección del webhook

No colocar credenciales privadas de N8N en JavaScript público. Para producción, el navegador debe enviar la solicitud a una función backend (por ejemplo, función serverless en Vercel o Supabase Edge Function). Esa función verifica el token de sesión y llama al webhook N8N usando una credencial del servidor. En N8N, validar la autenticación de la llamada y los datos antes de escribir. Aplicar idempotencia con un identificador de solicitud para evitar duplicados al reintentar.

Conservar el webhook real como **variable de entorno privada del backend**, por ejemplo `N8N_WEBHOOK_URL`, nunca como `VITE_N8N_WEBHOOK_URL` si contiene un endpoint que requiere protección.

## 7. Pruebas desde PowerShell y Linux

La prueba siguiente es apropiada **solo para la URL de prueba y un entorno local controlado**. Si se configuró autenticación del webhook, incluir el mecanismo de autenticación correspondiente; para producción, probar preferiblemente desde la aplicación autenticada, a través de su backend.

**Windows — PowerShell**

```powershell
$webhook = "https://TU-N8N/webhook-test/campusaid-solicitudes"
$body = @{
    estudiante_nombre = "Estudiante de Prueba"
    codigo_uptc = "123456789"
    email_institucional = "prueba@uptc.edu.co"
    tipo_tramite = "Tutoria"
    asignatura_o_lab = "Programacion II"
    descripcion = "Solicitud de tutoria de prueba"
} | ConvertTo-Json

Invoke-RestMethod -Uri $webhook -Method Post -ContentType "application/json" -Body $body
```

**Linux — terminal**

```bash
curl -i -X POST 'https://TU-N8N/webhook-test/campusaid-solicitudes' \
  -H 'Content-Type: application/json' \
  -d '{
    "estudiante_nombre":"Estudiante de Prueba",
    "codigo_uptc":"123456789",
    "email_institucional":"prueba@uptc.edu.co",
    "tipo_tramite":"Tutoria",
    "asignatura_o_lab":"Programacion II",
    "descripcion":"Solicitud de tutoria de prueba"
  }'
```

**Advertencia:** si el flujo exige `estudiante_id`, token de sesión o datos firmados por el backend, estas solicitudes directas deben ser rechazadas. En ese caso, la prueba correcta es registrar la solicitud en el frontend después de iniciar sesión. No desactivar la seguridad para hacer pasar una prueba.

Confirmar en este orden:

1. El envío devuelve el código HTTP y JSON esperados.
2. La ejecución aparece en **N8N → Executions**, sin errores.
3. El registro existe en **Supabase → Table Editor → solicitudes_campus**.
4. El tipo de trámite siguió la rama correcta del Switch.
5. Se envió el correo al destinatario configurado.
6. El estudiante autenticado puede consultar su solicitud, pero no la de otros estudiantes.
7. Tres solicitudes de prueba distintas quedan almacenadas para la evidencia académica.

## 8. Conectar la aplicación y desplegar

- Revisar el servicio JavaScript que utiliza Supabase (por ejemplo `src/services/supabase.js`) y confirmar la lectura de las variables públicas.
- Revisar el servicio que envía solicitudes (por ejemplo `src/services/automation.js`) y conectarlo con el backend autenticado, **no** con el webhook privado desde el navegador.
- Verificar los nombres de campos y estados; deben coincidir entre formulario, SQL, N8N y respuesta JSON.
- Ejecutar el proyecto con el script disponible (`npm run dev`, si está definido) y probar todos los formularios.
- En Vercel, importar el repositorio y configurar las variables públicas del frontend y las variables privadas del backend en los entornos correspondientes.
- Configurar en Supabase Auth las URL de redirección autorizadas para el dominio de Vercel, si el flujo de autenticación lo requiere.
- Desplegar, probar desde la URL HTTPS pública y documentar las URLs de GitHub, Vercel y Supabase sin revelar secretos.

La instancia de N8N debe permanecer accesible públicamente por HTTPS o mediante una conectividad segura adecuada. `localhost` no funciona como webhook desde una aplicación alojada en Vercel.

## 9. Subir cambios mediante GitHub

No trabajar directamente sobre la rama principal. Revisar primero los cambios:

**PowerShell y Linux**

```bash
git status
git diff
git add supabase/ n8n/ src/ docs/ .env.example README.md
git status
git commit -m "feat: integrar supabase y automatizacion n8n"
git push -u origin feature/integracion-supabase-n8n
```

Las rutas del comando `git add` son orientativas: incluir únicamente archivos que realmente existan y hayan sido modificados. Si alguna no existe, quitarla del comando antes de ejecutarlo. No subir `.env.local` ni archivos de secretos.

En GitHub:

1. Abrir el repositorio.
2. Seleccionar **Compare & pull request** para `feature/integracion-supabase-n8n` hacia la rama base.
3. Describir los archivos cambiados, pruebas realizadas y configuraciones pendientes.
4. Solicitar revisión al responsable del frontend.
5. Fusionar después de validar la integración.

Si la rama base recibió cambios durante el trabajo, actualizarla mediante `fetch` y resolver los conflictos antes de abrir o completar el PR.

## 10. Evidencias para el taller

Guardar capturas reales de:

- **Supabase:** `solicitudes_campus` con al menos tres registros creados desde la aplicación desplegada en Vercel.
- **N8N:** workflow con nodos documentados y pestaña **Executions** mostrando una ejecución exitosa.
- **Aplicación:** formulario, tabla de solicitudes y resultado de la automatización.

Registrar en la bitácora: integrantes, Caso 3, URLs de GitHub/Vercel/Supabase, requisitos funcionales y no funcionales y pruebas verificadas. La guía también solicita el prompt R-C-I-F-A final y una reflexión crítica de mínimo 250 palabras.

## 11. Lista de verificación de entrega

- [ ] El repositorio se clonó y se trabajó en una rama propia.
- [ ] Las migraciones SQL están versionadas y se ejecutaron correctamente.
- [ ] RLS está habilitado y las políticas impiden acceso ajeno.
- [ ] Supabase Auth identifica al estudiante.
- [ ] El frontend consulta datos reales desde Supabase.
- [ ] N8N clasifica los tres tipos de trámites.
- [ ] No se insertan solicitudes duplicadas.
- [ ] El correo de notificación llega al destinatario real.
- [ ] El webhook está protegido y no expone secretos en el navegador.
- [ ] La aplicación funciona desde Vercel con HTTPS.
- [ ] Se comprobaron tres registros reales y una ejecución correcta en N8N.
- [ ] Se abrió un Pull Request y se revisaron los cambios.
