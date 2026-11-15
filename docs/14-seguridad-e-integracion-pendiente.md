# 14 · Auditoría de Seguridad e Integración Pendiente

[← Índice](../README.md) · [Bitácora de entrega](11-bitacora.md)

Este documento detalla las intervenciones de seguridad implementadas en la rama `feature/seguridad-frontend` de **CampusGest-UPTC**, los riesgos mitigados, los archivos preparados y la hoja de ruta técnica para el responsable de la integración de **Supabase** y **N8N**.

---

## 1. Vulnerabilidades Identificadas y Correcciones Realizadas

### A. Autenticación Ficticia y Escalado de Privilegios en Frontend
- **Problema previo:** `AuthModal.jsx` y `App.jsx` incluían un inicio de sesión simulado que aceptaba contraseñas arbitrarias, cargaba usuarios ficticios por defecto y presentaba un selector público donde cualquier usuario podía autoasignarse el rol `coordinador_general`.
- **Corrección aplicada:**
  - Se eliminó el auto-login y la sesión simulada por defecto.
  - Se eliminó el selector público de roles: todo autoregistro en el frontend crea cuentas estrictamente con rol `estudiante`.
  - Los roles administrativos se resuelven exclusivamente desde la tabla `public.perfiles` del backend de Supabase mediante consultas autenticadas.
  - El modo demostración fue encapsulado en `src/services/auth.js`, condicionado a `import.meta.env.DEV` y con flag explícito `VITE_ENABLE_DEMO_MODE=true`. En compilaciones de producción (`npm run build`), este modo queda inactivo.

### B. Respuestas Falsas de Éxito en API (`api/solicitudes.js`)
- **Problema previo:** Si la variable `N8N_WEBHOOK_URL` no estaba definida o si la llamada fallaba, la API respondía con código HTTP 201 y `status: 'ok'`, generando UUIDs sintéticos y afirmando que la solicitud había sido registrada y notificada por correo.
- **Corrección aplicada:**
  - Se eliminó la simulación de éxito.
  - Cuando `N8N_WEBHOOK_URL` no está configurado, la API responde con **HTTP 503 (Service Unavailable)** y código `N8N_NO_CONFIGURADO`.
  - Si la llamada a N8N supera el tiempo límite o falla, responde con **HTTP 504 (Gateway Timeout)** o **HTTP 502 (Bad Gateway)** respectivamente.
  - No se generan confirmaciones ni identificadores si la persistencia no ha sido confirmada por el servicio backend.

### C. Inyección de Atributos y Denegación de Servicio (DoS) en API
- **Problema previo:** No existía restricción en el tamaño del payload ni filtrado de campos, permitiendo inyección de atributos no contemplados (*Mass Assignment*).
- **Corrección aplicada:**
  - Límite de carga útil de 50 KB con respuesta **HTTP 413 (Payload Too Large)** si se supera.
  - *Whitelisting* estricto de campos permitidos (`estudiante_id`, `estudiante_nombre`, `codigo_uptc`, `email_institucional`, `tipo_tramite`, `asignatura_o_lab`, `descripcion`, `request_id`). Cualquier campo adicional es rechazado con **HTTP 400 (Bad Request)**.
  - Restricción estricta de método: solo se procesa POST (otros métodos reciben **HTTP 405 Method Not Allowed**).
  - Tiempo de espera acotado a 8 segundos mediante `AbortController` para evitar consumo de recursos por conexiones colgadas.

### D. Inyección SQL Potencial en N8N Workflow (`n8n/campusaid-workflow.json`)
- **Problema previo:** El nodo `Supabase / Postgres Insert` construía la consulta mediante interpolación directa de cadenas: `VALUES (NULLIF('{{ $json.estudiante_id }}', '')::uuid, '{{ $json.estudiante_nombre }}', ...)`. Un valor con comillas simples o secuencias SQL maliciosas provocaba fallos de sintaxis o riesgo de inyección.
- **Corrección aplicada:**
  - Se reestructuró el nodo para utilizar **consultas parametrizadas con marcadores posicionales (`$1, $2, ..., $10`)** y el arreglo `queryParams`.
  - Se reemplazaron correos institucionales fijos por variables de entorno del sistema (`$env.EMAIL_COORDINACION_ACADEMICA`, `$env.SMTP_SENDER_EMAIL`).
  - Se condicionó el flujo de notificación por correo a que la inserción en base de datos retorne un registro válido.

### E. Auditoría de Políticas Row Level Security (RLS) en Supabase
- **Hallazgo detectado:** En la migración inicial `20261115_001_initial_schema.sql`, la política `usuarios_actualizan_su_propio_perfil` permitía al usuario autenticado actualizar cualquier columna de su fila en `public.perfiles`:
  ```sql
  create policy "usuarios_actualizan_su_propio_perfil"
    on public.perfiles for update to authenticated
    using (id = (select auth.uid()));
  ```
  Esto permitía a un estudiante ejecutar un `UPDATE` modificando la columna `rol` a `admin`.
- **Recomendación para el integrador:** Al configurar Supabase, se debe restringir la política para que solo permita modificar `nombre_completo` y `actualizado_en`, o implementar un trigger `BEFORE UPDATE` que impida la modificación del campo `rol` por parte de usuarios sin privilegios administrativos.

---

## 2. Archivos Preparados para la Integración

El integrador de backend y servicios cloud debe trabajar sobre los siguientes archivos ya estandarizados:

1. **`supabase/migrations/20261115_001_initial_schema.sql`**:
   - Contiene la estructura DDL de las tablas `perfiles` y `solicitudes_campus`.
   - Contiene los índices de consulta, constraints de validación de 9 dígitos y dominio `@uptc.edu.co`.
   - Contiene la configuración de RLS y los tres registros iniciales de prueba (Tutoría, Laboratorio y Certificado).
2. **`n8n/campusaid-workflow.json`**:
   - Workflow listo para importar en N8N.
   - Nodos organizados: `Webhook POST` → `Validación Code` → `Switch Trámite` → `Postgres Insert Parametrizado` → `EmailSend` → `Respond to Webhook`.
3. **`api/solicitudes.js`**:
   - Función serverless para Vercel. Recibe el payload del formulario, valida las reglas de negocio, aplica idempotencia y reenvía hacia la URL de N8N.
4. **`.env.example`**:
   - Plantilla de variables de entorno públicas y privadas documentadas.

---

## 3. Variables de Entorno Requeridas

### Variables Públicas del Frontend (Vite)
Se configuran en `.env.local` para desarrollo local y en el panel de Vercel como *Environment Variables*:

```dotenv
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA_ANON
VITE_ENABLE_DEMO_MODE=false
```

### Variables Privadas del Servidor (Vercel Serverless / N8N)
**NUNCA deben incluir el prefijo `VITE_`** para evitar su inclusión en el bundle del cliente:

```dotenv
# En el entorno de funciones serverless de Vercel:
N8N_WEBHOOK_URL=https://TU_INSTANCIA_N8N/webhook/campusaid-solicitudes
N8N_WEBHOOK_AUTH=SECRETO_COMPARTIDO_CON_N8N
SUPABASE_SERVICE_ROLE_KEY=CLAVE_PRIVADA_SERVICE_ROLE
APP_URL=https://campusgest-uptc.vercel.app

# En la instancia de N8N:
EMAIL_COORDINACION_ACADEMICA=coordinacion.academica@uptc.edu.co
EMAIL_RESPONSABLE_LABORATORIOS=laboratorios.ingenieria@uptc.edu.co
EMAIL_RESPONSABLE_CERTIFICADOS=admisiones.certificados@uptc.edu.co
SMTP_SENDER_EMAIL=notificaciones.campusgest@uptc.edu.co
```

---

## 4. Pruebas Automatizadas Ejecutadas

Se ejecutó la suite de validación y seguridad mediante `npm test`:

```text
=============================================================
  CAMPUSGEST-UPTC — AUDITORÍA DE SEGURIDAD Y PRUEBAS        
=============================================================

✓ [T01] Método HTTP estricto: APROBADO (Rechazó GET con HTTP 405)
✓ [T02] Validación código UPTC (9 dígitos): APROBADO (Rechazó 7 dígitos con HTTP 400)
✓ [T03] Validación correo institucional: APROBADO (Rechazó correo no UPTC con HTTP 400)
✓ [T04] Whitelisting de trámites: APROBADO (Rechazó tipo no permitido con HTTP 400)
✓ [T05] Protección contra Mass Assignment: APROBADO (Rechazó campo no permitido con HTTP 400)
✓ [T06] Formato UUID de Idempotencia: APROBADO (Rechazó UUID malformado con HTTP 400)
✓ [T07] Respuesta honesta ante servicio no configurado: APROBADO (HTTP 503 Service Unavailable)
✓ [T08] Validación longitud descripción: APROBADO (Rechazó descripción corta con HTTP 400)
✓ [T09] Preflight OPTIONS CORS: APROBADO (HTTP 204 con métodos autorizados)
✓ [T10] Auditoría N8N SQL Injection: APROBADO (Consulta parametrizada con $1...$10 sin interpolación cruda)

=============================================================
  RESUMEN: 10 / 10 PRUEBAS DE SEGURIDAD APROBADAS 
=============================================================
```

Compilación de producción verificada mediante:
```bash
npm run build
```
Resultado: artefactos generados en `dist/` en 1.92s sin errores ni advertencias de sintaxis.

---

## 5. Tareas Pendientes para el Integrador Cloud

1. **Configuración de Supabase:**
   - Crear el proyecto en Supabase Dashboard.
   - Ejecutar la migración SQL `supabase/migrations/20261115_001_initial_schema.sql` en el SQL Editor.
   - Habilitar autenticación por correo y confirmar el dominio de redirección para el despliegue de Vercel.
   - Corregir la política de actualización de `perfiles` para blindar el campo `rol`.
2. **Configuración de N8N:**
   - Importar `n8n/campusaid-workflow.json`.
   - Crear las credenciales de PostgreSQL conectadas a la base de datos de Supabase.
   - Crear las credenciales de servidor SMTP para el nodo de correo.
   - Activar el webhook en producción y copiar la URL generada.
3. **Puesta en Marcha en Vercel:**
   - Asignar `N8N_WEBHOOK_URL` y las claves públicas de Supabase en las variables de entorno de Vercel.
   - Realizar una solicitud de prueba desde la URL pública HTTPS y verificar la recepción en la tabla `solicitudes_campus` y en el historial de ejecuciones de N8N.

---

[← Volver al Índice General](../README.md)
