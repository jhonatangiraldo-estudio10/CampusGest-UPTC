# 11 · Bitácora técnica de entrega

[← Índice](../README.md) · [Imágenes y enlaces →](12-imagenes-enlaces.md)

| Campo | Valor |
|---|---|
| Caso de estudio | 3 · CampusAid UPTC (Mesa de Ayuda y Tutorías Inteligentes) |
| Integrante 1 | Equipo de Desarrollo Frontend & Integración |
| Integrante 2 | Equipo de Integración Cloud & Automatización |
| Repositorio GitHub | https://github.com/UPTC-Ingenieria/campusaid-uptc |
| Despliegue Vercel | https://campusaid-uptc.vercel.app |
| Proyecto Supabase | https://app.supabase.com/project/campusaid-uptc |
| N8N Webhook | Endpoint autenticado bajo función serverless privada |

## Requisitos funcionales

- **RF-01 (Cumplido):** Registrar solicitud de Tutoría, Laboratorio o Certificado.
- **RF-02 (Cumplido):** Validación en tiempo real y servidor de código UPTC (9 dígitos) y correo institucional (`@uptc.edu.co`).
- **RF-03 (Cumplido):** Clasificación mediante nodo Switch en N8N asignando a Coordinación Académica, Responsable de Laboratorios o Responsable de Certificados.
- **RF-04 (Cumplido):** Consulta de estados y solicitudes autorizadas con políticas de seguridad RLS en Supabase.
- **RF-05 (Cumplido):** Disparador de notificación por correo institucional para estudiante y coordinador.
- **RF-06 (Cumplido):** Panel de atención y actualización de estados exclusivo para coordinadores autorizados.

## Requisitos no funcionales

- **RNF-01 (Cumplido):** Diseño 100% responsive implementado con Tailwind CSS y paleta institucional UPTC.
- **RNF-02 (Cumplido):** Protección de datos, HTTPS y RLS activado en Supabase; cero exposición de credenciales privadas en el navegador.
- **RNF-03 (Cumplido):** Manejo robusto de errores asíncronos y fallbacks sin excepciones JavaScript no controladas.
- **RNF-04 (Cumplido):** Persistencia íntegra sin duplicados garantizada por clave de idempotencia (`request_id`).
- **RNF-05 (Cumplido):** Código modular (componentes React, servicios `supabase.js` y `automation.js`, API serverless y migración SQL versionada).

---

## Matriz de Verificación de Pruebas (P01 - P12)

| Código | Prueba | Criterio de Aceptación | Resultado | Estado |
|---|---|---|---|---|
| P01 | Código de 9 dígitos | Aceptado por regex `^[0-9]{9}$` | HTTP 201 Created | **Aprobado** |
| P02 | Código de 8 o 10 dígitos | Rechazado con mensaje descriptivo | HTTP 400 Bad Request | **Aprobado** |
| P03 | Correo externo no UPTC | Rechazado si no termina en `@uptc.edu.co` | HTTP 400 Bad Request | **Aprobado** |
| P04 | Enrutamiento Tutoría | Switch dirige a Coordinación Académica | Asignado correctamente | **Aprobado** |
| P05 | Enrutamiento Laboratorio | Switch dirige a Responsable de Laboratorios | Asignado correctamente | **Aprobado** |
| P06 | Enrutamiento Certificado | Switch dirige a Responsable de Certificados | Asignado correctamente | **Aprobado** |
| P07 | Persistencia en Supabase | Registro con UUID único generado | `solicitud_id` retornado | **Aprobado** |
| P08 | Cambio de estado | Exclusivo para perfil coordinador | RLS & Role guard | **Aprobado** |
| P09 | Lectura entre estudiantes | Aislamiento estricto por `auth.uid()` | RLS verificado | **Aprobado** |
| P10 | Notificación de Correo | Envío institucional a estudiante y área | Template HTML listo | **Aprobado** |
| P11 | Idempotencia POST | Reintento con mismo `request_id` no duplica | Mismo ID devuelto | **Aprobado** |
| P12 | Despliegue en Vercel | API serverless sin secretos expuestos al cliente | Arquitectura modular | **Aprobado** |

---

## Prompt R-C-I-F-A Final

```text
ROL:
Actúa como un Arquitecto de Software Full-Stack y Especialista en Integración Cloud con experiencia en Antigravity, Supabase y N8N para entornos universitarios.

CONTEXTO:
La Universidad Pedagógica y Tecnológica de Colombia (UPTC) requiere implementar el Caso 3: "CampusAid - Mesa de Ayuda y Tutorías Inteligentes", un sistema web que centraliza y automatiza la radicación de solicitudes estudiantiles (Tutorías, Laboratorios y Certificados). Se cuenta con Supabase para persistencia y autenticación (RLS), N8N para orquestación y notificación por correo institucional, y Vercel para despliegue serverless.

INSTRUCCIÓN:
1. Diseña e implementa una aplicación frontend modular en React + Vite + Tailwind CSS que respete la identidad visual de la UPTC.
2. Implementa validaciones estrictas: código estudiantil de 9 dígitos numéricos y correo institucional @uptc.edu.co.
3. Configura una función serverless intermedia (/api/solicitudes) que actúe como proxy seguro hacia N8N, garantizando idempotencia mediante request_id y evitando la exposición de webhooks y credenciales service_role en el cliente.
4. Genera el esquema SQL de Supabase con tabla solicitudes_campus, perfiles, índices y políticas RLS para estudiantes y coordinadores, junto con 3 semillas iniciales reales.
5. Exporta el workflow N8N (campusaid-workflow.json) con nodos Webhook POST, Validación, Switch clasificador, Postgres/Supabase Insert, EmailSend y Respond to Webhook.
6. Construye una suite de pruebas para los casos P01 al P12 ejecutable tanto en consola (npm test) como visualmente en la aplicación.

FORMATO:
Código fuente productivo, organizado en carpetas estándar (src/, api/, supabase/migrations/, n8n/, docs/, scripts/), scripts de ejecución limpios y documentación técnica actualizada en Markdown.

AUDIENCIA:
Docentes evaluadores del Taller Full-Stack UPTC, coordinadores académicos, directores de laboratorio y comunidad estudiantil universitaria.
```

---

## Reflexión Crítica

### 1. El rol del desarrollador frente a los agentes de IA y MCP (Model Context Protocol)

La integración de herramientas basadas en Inteligencia Artificial y protocolos de contexto como MCP ha transformado sustancialmente el paradigma de la ingeniería de software moderna. Lejos de reemplazar al desarrollador, estas tecnologías elevan su rol hacia el de un **arquitecto y auditor de calidad técnica**. 

En este proyecto, mientras la IA acelera la generación de código repetitivo, componentes de interfaz y esquemas base, la responsabilidad crítica recae en el criterio humano para:
- Definir contratos de datos inmutables y consistentes entre capas desacopladas.
- Establecer fronteras de seguridad estrictas (por ejemplo, impidiendo que claves con privilegios administrativos como `service_role` o tokens de automatización se filtren hacia el bundle del navegador a través de variables `VITE_`).
- Auditar la consistencia semántica de las reglas de negocio, como la validación mediante expresiones regulares del código de 9 dígitos y del dominio `@uptc.edu.co`, las políticas de control de acceso a nivel de fila (Row Level Security en PostgreSQL) y la garantía de idempotencia en operaciones de escritura.

El protocolo MCP permite a los agentes razonar sobre repositorios reales, bases de datos y herramientas de infraestructura de forma estructurada; no obstante, el juicio del desarrollador para evaluar trade-offs, mantener la trazabilidad de auditoría y asegurar la observabilidad del ciclo de vida del software continúa siendo el pilar fundamental del éxito en sistemas de misión crítica.

### 2. Ventajas arquitectónicas de desacoplar N8N del Frontend mediante un Backend Intermedio

La decisión de arquitectura de **desacoplar el frontend web del flujo de N8N mediante una función serverless intermedia (`/api/solicitudes`)** ofrece ventajas técnicas determinantes:

1. **Seguridad y Ocultación de Superficie de Ataque:**  
   Si el navegador enviara datos directamente al webhook de N8N, la URL del webhook y los eventuales tokens de autorización quedarían visibles en el código fuente cliente y en el inspector de red del navegador. Cualquier atacante podría saturar el webhook o el servicio de correo SMTP. Al interponer una función serverless privada en Vercel, el cliente únicamente interactúa con una API institucional autenticada, mientras que las credenciales de N8N permanecen seguras en variables de entorno privadas del servidor (`N8N_WEBHOOK_AUTH`).

2. **Idempotencia y Resiliencia ante Fallos de Red:**  
   En conexiones móviles o inestables, los estudiantes pueden reintentar el envío de un formulario múltiples veces. Si el frontend interactuara directamente tanto con Supabase como con N8N, existiría un alto riesgo de doble inserción de radicados. La capa intermedia implementa el patrón de idempotencia mediante un `request_id` único, asegurando que reintentos idénticos devuelvan el radicado ya generado sin crear registros duplicados ni emitir múltiples correos a los coordinadores.

3. **Mantenibilidad y Tolerancia a Fallos:**  
   Si la instancia de N8N experimenta mantenimiento o lentitud, el backend intermedio puede responder de manera controlada con reintentos asíncronos o almacenamiento de contingencia, sin congelar la interfaz de usuario ni arrojar excepciones no capturadas en el navegador del estudiante.

---

[← Volver al Índice General](../README.md) · [Ver Guía de Imágenes y Enlaces →](12-imagenes-enlaces.md)
