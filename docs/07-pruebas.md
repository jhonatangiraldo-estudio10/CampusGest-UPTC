# 07 · Pruebas y evidencias

[← Índice](../README.md) · [Integración](06-integracion.md) · [GitHub →](08-github.md)

## Matriz de pruebas

| Código | Prueba | Resultado esperado | Estado |
|---|---|---|---|
| P01 | Código de 9 dígitos | Aceptado | **Aprobado** |
| P02 | Código de 8/10 dígitos | Rechazado con HTTP 400 | **Aprobado** |
| P03 | Correo externo no UPTC | Rechazado con HTTP 400 | **Aprobado** |
| P04 | Tutoría | Enruta a Coordinación Académica | **Aprobado** |
| P05 | Laboratorio | Enruta a Responsable de Laboratorios | **Aprobado** |
| P06 | Certificado | Enruta a Responsable de Certificados | **Aprobado** |
| P07 | Persistencia | Un registro en Supabase con UUID | **Aprobado** |
| P08 | Cambio de estado | Solo coordinador autorizado | **Aprobado** |
| P09 | Lectura entre usuarios | Acceso denegado (RLS activo) | **Aprobado** |
| P10 | Envío de correo | Mensaje al destinatario configurado | **Aprobado** |
| P11 | Reintento de POST | No crea duplicado (idempotencia) | **Aprobado** |
| P12 | Vercel / Serverless | Funciona desde URL HTTPS pública | **Aprobado** |

> Las 12 pruebas se ejecutan de manera automática con `npm test` o directamente en la interfaz web desde la pestaña **Matriz QA**.

## Evidencias exigidas por el taller

1. Tabla `solicitudes_campus` con **tres registros reales** creados desde la aplicación publicada.
2. Workflow N8N documentado y ejecución exitosa en **Executions**.
3. Copia del prompt final R-C-I-F-A (registrado en [11-bitacora.md](11-bitacora.md)).
4. URLs de GitHub, Vercel y Supabase.
5. Reflexión crítica de **mínimo 250 palabras**: papel del desarrollador con agentes/MCP y ventajas de separar N8N del frontend.

## Cómo guardar las capturas

Usar la carpeta [`../assets/capturas/`](../assets/capturas/) y estos nombres:

- `01-supabase-tres-registros.png`
- `02-n8n-workflow.png`
- `03-n8n-ejecucion.png`
- `04-formulario-web.png`
- `05-vercel-produccion.png`

**No publicar** nombres, correos reales, tokens o información sensible en capturas públicas. Usar datos sintéticos de prueba.

[← Índice](../README.md) · [Siguiente: GitHub →](08-github.md)
