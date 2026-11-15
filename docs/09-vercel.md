# 09 · Despliegue en Vercel

[← Índice](../README.md) · [GitHub](08-github.md) · [Errores →](10-errores-frecuentes.md)

1. Ingresar a [Vercel](https://vercel.com/) y conectar GitHub.
2. Importar el repositorio `campusaid-uptc`.
3. Revisar el framework detectado, comando de compilación y carpeta de salida del proyecto real.
4. Definir las variables públicas de Supabase que requiere el frontend.
5. Si existe una función backend, configurar allí `N8N_WEBHOOK_URL` y credenciales privadas; nunca usar prefijo `VITE_` para secretos.
6. Ejecutar el despliegue y obtener la URL HTTPS.
7. Ajustar redirecciones autorizadas de Supabase Auth para el dominio publicado, si corresponde.
8. Crear tres solicitudes de prueba desde la URL pública y verificar Supabase y N8N.

**La instancia de N8N no puede depender de `localhost`** en un despliegue de Vercel; debe existir conectividad segura desde el backend publicado.

No registrar contraseñas o tokens en README, capturas, issues ni commits.

[← Índice](../README.md) · [Siguiente: Errores →](10-errores-frecuentes.md)
