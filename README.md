# CampusAid UPTC

**Caso 3 — Mesa de Ayuda y Tutorías Inteligentes**  
Taller Full-Stack · Google Antigravity + Supabase + N8N · UPTC

![Arquitectura de CampusAid](assets/diagramas/arquitectura.svg)

> **Alcance:** esta carpeta contiene la documentación de colaboración e integración. Se debe incorporar al repositorio de la aplicación creada en Antigravity. No incluye ni reemplaza el código fuente del frontend, credenciales, ni una automatización ya configurada.

## Navegación

| Documento | Contenido |
|---|---|
| [Inicio rápido](docs/01-inicio-rapido.md) | Orden de trabajo y prerrequisitos |
| [Windows PowerShell](docs/02-windows-powershell.md) | Clonar, configurar, ejecutar y enviar cambios |
| [Linux](docs/03-linux.md) | Comandos Bash equivalentes |
| [Supabase](docs/04-supabase.md) | Proyecto, SQL, Auth y RLS |
| [N8N](docs/05-n8n.md) | Workflow, credenciales, webhooks y correo |
| [Integración](docs/06-integracion.md) | Contrato de datos y flujo sin duplicados |
| [Pruebas](docs/07-pruebas.md) | Casos de verificación y evidencias |
| [GitHub](docs/08-github.md) | Ramas, Pull Request y conflictos |
| [Vercel](docs/09-vercel.md) | Variables, despliegue y validación pública |
| [Solución de errores](docs/10-errores-frecuentes.md) | Diagnóstico básico |
| [Bitácora de entrega](docs/11-bitacora.md) | URLs, requisitos y checklist |
| [Guía de imágenes y enlaces](docs/12-imagenes-enlaces.md) | Capturas, rutas relativas y anclas |
| [Guía previa de instalación](docs/13-guia-original.md) | Procedimiento de base ampliado |

## Flujo de trabajo

![Secuencia de integración](assets/diagramas/flujo.svg)

1. El responsable del frontend crea el proyecto con Antigravity y publica el repositorio.
2. El integrador clona el repositorio, crea una rama y configura Supabase.
3. El integrador configura N8N, conecta la aplicación y ejecuta pruebas.
4. Ambos revisan un Pull Request y despliegan en Vercel.
5. Se documentan evidencias verificadas y las URLs finales.

## Responsabilidades

| Frente | Responsable sugerido | Entrega |
|---|---|---|
| Interfaz y validaciones | Desarrollo frontend | Formularios y panel de solicitudes |
| Supabase | Integración | Migraciones, Auth, RLS y consultas |
| N8N | Integración | Workflow importable y correo |
| Integración y pruebas | Ambos | Tres registros reales y ejecución exitosa |
| GitHub y Vercel | Ambos | PR revisado y despliegue público |

## Requisitos mínimos del caso 3

- Trámites: **Tutoría**, **Laboratorio** y **Certificado**.
- Código estudiantil: **9 dígitos**; correo terminado en `@uptc.edu.co`.
- Tabla principal: `solicitudes_campus`.
- Flujo: Webhook POST → Validación → Switch → Supabase → Correo → Respuesta JSON.
- Interfaz web responsive, persistencia real y acceso protegido.

## Rutas importantes

- [Supabase](https://supabase.com/dashboard)
- [N8N](https://docs.n8n.io/)
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download)
- [Vercel](https://vercel.com/)

## Evidencias

Añadir capturas **reales** en [`assets/capturas/`](assets/capturas/) cuando termine la integración. Se indican los nombres previstos en [Pruebas](docs/07-pruebas.md). No subir capturas con claves o datos personales de estudiantes reales.

---

[Ir al inicio rápido →](docs/01-inicio-rapido.md)
