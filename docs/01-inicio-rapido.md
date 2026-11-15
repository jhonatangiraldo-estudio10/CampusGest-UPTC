# 01 · Inicio rápido

[← Índice](../README.md) · [Windows →](02-windows-powershell.md) · [Linux →](03-linux.md)

## Antes de empezar

- Git, Node.js LTS y npm instalados.
- Acceso de colaborador al repositorio GitHub de CampusAid.
- Proyecto Supabase con permisos de administración.
- Instancia N8N accesible por HTTPS (para producción).
- Cuenta o servicio de correo conectado a N8N.
- Frontend creado con Antigravity y contrato del formulario acordado.

**No crear una segunda aplicación**: integrar los servicios dentro del repositorio existente.

## Orden recomendado

1. Clonar y ejecutar el frontend ([Windows](02-windows-powershell.md) / [Linux](03-linux.md)).
2. Crear rama `feature/integracion-supabase-n8n`.
3. Revisar las variables reales de `.env.example` y el servicio de solicitudes.
4. Preparar base de datos, Auth y RLS ([Supabase](04-supabase.md)).
5. Crear y probar los nodos ([N8N](05-n8n.md)).
6. Conectar el frontend y un backend autenticado, sin dobles inserciones ([Integración](06-integracion.md)).
7. Probar y registrar resultados ([Pruebas](07-pruebas.md)).
8. Abrir Pull Request y desplegar ([GitHub](08-github.md), [Vercel](09-vercel.md)).

## Variables de entorno

Usar [`../ejemplos/.env.example`](../ejemplos/.env.example) como referencia, **no** sustituir automáticamente las variables que ya usa Antigravity. La clave pública de Supabase puede utilizarse en el navegador con RLS correcto; el secreto de N8N y las claves privilegiadas solo deben existir del lado servidor.

[← Índice](../README.md) · [Siguiente: PowerShell →](02-windows-powershell.md)
