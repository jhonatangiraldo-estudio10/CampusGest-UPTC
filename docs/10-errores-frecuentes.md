# 10 · Solución de errores frecuentes

[← Índice](../README.md) · [Bitácora →](11-bitacora.md)

| Síntoma | Revisar | Acción |
|---|---|---|
| `npm ci` falla | Falta `package-lock.json` | Usar `npm install` si el responsable lo autoriza |
| El frontend no inicia | Scripts de `package.json` | Ejecutar `npm run` y usar un script disponible |
| Supabase devuelve 401 | Sesión y clave pública | Revisar autenticación y entorno |
| Supabase devuelve 403 o RLS | Políticas y usuario | Revisar RLS, sin desactivarlo para simular éxito |
| El registro aparece dos veces | Doble inserción o reintentos | Mantener una sola ruta de escritura e idempotencia |
| N8N dice webhook no registrado | URL de prueba o workflow apagado | Verificar Test/Production URL y activación |
| El correo no llega | Nodo, credenciales o proveedor | Revisar Executions y registros del proveedor |
| Funciona local pero no Vercel | Variables y conectividad | Configurar entornos de despliegue, HTTPS y CORS |
| `git push` rechazado | Permisos o rama | Revisar acceso y sincronización con GitHub |
| Enlace de imagen roto | Mayúsculas, ruta relativa | Comprobar rutas sensibles a mayúsculas en Linux |

Usar siempre el mensaje exacto de error y registrar qué prueba se hizo para corregirlo.

[← Índice](../README.md) · [Siguiente: Bitácora →](11-bitacora.md)
