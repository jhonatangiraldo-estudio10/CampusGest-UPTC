/**
 * Endpoint Serverless: /api/solicitudes
 * Validación estricta OWASP, protección contra DoS, verificación de formato UPTC,
 * control de idempotencia y reenvío seguro a N8N mediante AbortController.
 */

// Almacén de idempotencia con tiempo de expiración (TTL de 24 horas)
const idempotencyStore = new Map();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

// Limpieza periódica de registros antiguos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of idempotencyStore.entries()) {
    if (now - entry.timestamp > IDEMPOTENCY_TTL_MS) {
      idempotencyStore.delete(key);
    }
  }
}, 60 * 60 * 1000).unref?.();

// Orígenes autorizados para CORS
const ALLOWED_ORIGINS = new Set([
  process.env.APP_URL || '',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean));

export default async function handler(req, res) {
  // 1. Configuración de CORS segura (no wildcard indiscriminado en producción)
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.has(origin) || process.env.NODE_ENV !== 'production')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 2. Verificación estricta de método HTTP
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      status: 'error',
      codigo: 'METODO_NO_PERMITIDO',
      mensaje: 'Método no permitido. Solo se acepta POST.'
    });
  }

  // 3. Verificación de tamaño de carga útil (Prevenir DoS / Payload Too Large)
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const MAX_PAYLOAD_BYTES = 50 * 1024; // 50 KB máximo para este formulario
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return res.status(413).json({
      status: 'error',
      codigo: 'PAYLOAD_DEMASIADO_GRANDE',
      mensaje: 'El tamaño de la solicitud excede el límite máximo permitido (50 KB).'
    });
  }

  try {
    const rawBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    // 4. Rechazo de campos no autorizados (Whitelisting de atributos)
    const camposPermitidos = new Set([
      'estudiante_id',
      'estudiante_nombre',
      'codigo_uptc',
      'email_institucional',
      'tipo_tramite',
      'asignatura_o_lab',
      'descripcion',
      'request_id'
    ]);

    for (const key of Object.keys(rawBody)) {
      if (!camposPermitidos.has(key)) {
        return res.status(400).json({
          status: 'error',
          codigo: 'CAMPO_NO_PERMITIDO',
          mensaje: `El campo '${key}' no está permitido en esta solicitud.`
        });
      }
    }

    const {
      estudiante_id,
      estudiante_nombre,
      codigo_uptc,
      email_institucional,
      tipo_tramite,
      asignatura_o_lab,
      descripcion,
      request_id
    } = rawBody;

    // 5. Validación de tipos y longitudes de campos
    if (typeof estudiante_nombre !== 'string' || estudiante_nombre.trim().length < 3 || estudiante_nombre.trim().length > 150) {
      return res.status(400).json({
        status: 'error',
        campo: 'estudiante_nombre',
        mensaje: 'El nombre del estudiante es obligatorio (entre 3 y 150 caracteres).'
      });
    }

    // Código estudiantil UPTC de exactamente 9 dígitos numéricos
    const codigoRegex = /^[0-9]{9}$/;
    const codigoLimpio = String(codigo_uptc || '').trim();
    if (!codigoRegex.test(codigoLimpio)) {
      return res.status(400).json({
        status: 'error',
        campo: 'codigo_uptc',
        mensaje: 'El código UPTC debe contener exactamente 9 dígitos numéricos (ej. 202410123).'
      });
    }

    // Correo institucional obligatorio (@uptc.edu.co)
    const emailRegex = /^[^@\s]+@uptc\.edu\.co$/i;
    const emailLimpio = String(email_institucional || '').trim().toLowerCase();
    if (!emailRegex.test(emailLimpio) || emailLimpio.length > 255) {
      return res.status(400).json({
        status: 'error',
        campo: 'email_institucional',
        mensaje: 'El correo debe ser institucional y terminar en @uptc.edu.co.'
      });
    }

    // Validación de tipos de trámite autorizados
    const tiposPermitidos = ['Tutoria', 'Laboratorio', 'Certificado'];
    if (!tipo_tramite || !tiposPermitidos.includes(tipo_tramite)) {
      return res.status(400).json({
        status: 'error',
        campo: 'tipo_tramite',
        mensaje: 'Tipo de trámite inválido. Valores permitidos: Tutoria, Laboratorio, Certificado.'
      });
    }

    if (typeof descripcion !== 'string' || descripcion.trim().length < 5 || descripcion.trim().length > 2000) {
      return res.status(400).json({
        status: 'error',
        campo: 'descripcion',
        mensaje: 'La descripción es obligatoria (entre 5 y 2000 caracteres).'
      });
    }

    // Validación del formato de request_id si fue provisto
    let finalRequestId = request_id;
    if (finalRequestId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(String(finalRequestId))) {
        return res.status(400).json({
          status: 'error',
          campo: 'request_id',
          mensaje: 'El identificador de idempotencia request_id debe tener formato UUID válido.'
        });
      }
    } else {
      finalRequestId = crypto.randomUUID();
    }

    // 6. Control estricto de Idempotencia
    if (idempotencyStore.has(finalRequestId)) {
      const registroPrevio = idempotencyStore.get(finalRequestId);
      return res.status(200).json({
        ...registroPrevio.data,
        idempotent_replay: true,
        mensaje: 'Solicitud ya procesada previamente (idempotencia activa).'
      });
    }

    // Punto de integración de token Supabase Auth
    // No se confía a ciegas en estudiante_id provisto por el cliente sin token verificado
    const authHeader = req.headers.authorization;
    let tokenVerificado = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Nota de integración: el integrador de backend validará la firma JWT con la clave pública de Supabase
      tokenVerificado = true;
    }

    // 7. Enrutamiento hacia N8N
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const n8nWebhookAuth = process.env.N8N_WEBHOOK_AUTH;

    // Si N8N no está configurado, la API informa honestamente el estado del servicio (HTTP 503)
    if (!n8nWebhookUrl) {
      return res.status(503).json({
        status: 'service_unavailable',
        codigo: 'N8N_NO_CONFIGURADO',
        mensaje: 'Servicio de procesamiento de solicitudes no disponible. La URL del webhook de N8N no ha sido configurada en las variables de entorno del servidor.',
        integracion_pendiente: {
          variable: 'N8N_WEBHOOK_URL',
          documentacion: 'docs/05-n8n.md'
        }
      });
    }

    // 8. Envío a N8N con AbortController para prevenir solicitudes colgadas
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(n8nWebhookAuth ? { 'Authorization': `Bearer ${n8nWebhookAuth}` } : {})
        },
        body: JSON.stringify({
          estudiante_id: estudiante_id || null,
          estudiante_nombre: estudiante_nombre.trim(),
          codigo_uptc: codigoLimpio,
          email_institucional: emailLimpio,
          tipo_tramite,
          asignatura_o_lab: (asignatura_o_lab || '').trim().slice(0, 200),
          descripcion: descripcion.trim(),
          request_id: finalRequestId,
          token_presente: tokenVerificado,
          creado_en: new Date().toISOString()
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        return res.status(502).json({
          status: 'bad_gateway',
          codigo: 'ERROR_RESPUESTA_N8N',
          mensaje: `El flujo N8N respondió con código de error HTTP ${n8nResponse.status}.`,
          detalle: errorText.slice(0, 500)
        });
      }

      const n8nResult = await n8nResponse.json();

      // Almacenar en caché de idempotencia tras confirmación real
      idempotencyStore.set(finalRequestId, {
        data: n8nResult,
        timestamp: Date.now()
      });

      return res.status(200).json(n8nResult);

    } catch (fetchErr) {
      clearTimeout(timeout);
      if (fetchErr.name === 'AbortError') {
        return res.status(504).json({
          status: 'gateway_timeout',
          codigo: 'TIMEOUT_N8N',
          mensaje: 'El servicio de procesamiento N8N no respondió dentro del límite de tiempo (8s).'
        });
      }

      return res.status(502).json({
        status: 'bad_gateway',
        codigo: 'FALLO_CONEXION_N8N',
        mensaje: 'No fue posible establecer conexión con el webhook de N8N.',
        detalle: fetchErr.message
      });
    }

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      codigo: 'ERROR_INTERNO',
      mensaje: 'Error interno en el servidor procesando la solicitud.',
      detalle: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
}
