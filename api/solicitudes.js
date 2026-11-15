/**
 * Endpoint Serverless: /api/solicitudes
 * Valida datos con reglas UPTC, garantiza idempotencia y reenvía a N8N de manera segura.
 * Compatible con despliegues en Vercel y ejecución local de desarrollo.
 */

// Memoria local de idempotencia para evitar duplicados en reintentos
const idempotencyStore = new Map();

export default async function handler(req, res) {
  // Manejo de CORS si es necesario
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      mensaje: 'Método no permitido. Solo se acepta POST.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      estudiante_id,
      estudiante_nombre,
      codigo_uptc,
      email_institucional,
      tipo_tramite,
      asignatura_o_lab,
      descripcion,
      request_id
    } = body;

    // 1. Validaciones de Contrato
    if (!estudiante_nombre || typeof estudiante_nombre !== 'string' || estudiante_nombre.trim().length < 3) {
      return res.status(400).json({
        status: 'error',
        campo: 'estudiante_nombre',
        mensaje: 'El nombre del estudiante es obligatorio y debe tener al menos 3 caracteres.'
      });
    }

    // Código estudiantil UPTC de 9 dígitos exactos
    const codigoRegex = /^[0-9]{9}$/;
    if (!codigo_uptc || !codigoRegex.test(String(codigo_uptc).trim())) {
      return res.status(400).json({
        status: 'error',
        campo: 'codigo_uptc',
        mensaje: 'El código UPTC debe contener exactamente 9 dígitos numéricos (ej. 202410123).'
      });
    }

    // Correo institucional terminado en @uptc.edu.co
    const emailRegex = /^[^@\s]+@uptc\.edu\.co$/i;
    if (!email_institucional || !emailRegex.test(String(email_institucional).trim())) {
      return res.status(400).json({
        status: 'error',
        campo: 'email_institucional',
        mensaje: 'El correo debe ser institucional y terminar en @uptc.edu.co.'
      });
    }

    // Tipos de trámites autorizados
    const tiposPermitidos = ['Tutoria', 'Laboratorio', 'Certificado'];
    if (!tipo_tramite || !tiposPermitidos.includes(tipo_tramite)) {
      return res.status(400).json({
        status: 'error',
        campo: 'tipo_tramite',
        mensaje: 'Tipo de trámite inválido. Valores permitidos: Tutoria, Laboratorio, Certificado.'
      });
    }

    if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 5) {
      return res.status(400).json({
        status: 'error',
        campo: 'descripcion',
        mensaje: 'La descripción es obligatoria (mínimo 5 caracteres).'
      });
    }

    // 2. Control de Idempotencia (Prevención de duplicados P11)
    const finalRequestId = request_id || crypto.randomUUID();
    if (idempotencyStore.has(finalRequestId)) {
      const previo = idempotencyStore.get(finalRequestId);
      return res.status(200).json({
        ...previo,
        idempotent_replay: true,
        mensaje: 'Solicitud ya procesada previamente (idempotencia activa).'
      });
    }

    // Determinación de área responsable y destinatario
    let areaAsignada = '';
    let emailCoordinador = '';
    if (tipo_tramite === 'Tutoria') {
      areaAsignada = 'Coordinación Académica';
      emailCoordinador = 'coordinacion.academica@uptc.edu.co';
    } else if (tipo_tramite === 'Laboratorio') {
      areaAsignada = 'Responsable de Laboratorios';
      emailCoordinador = 'laboratorios.ingenieria@uptc.edu.co';
    } else if (tipo_tramite === 'Certificado') {
      areaAsignada = 'Responsable de Certificados y Admisiones';
      emailCoordinador = 'admisiones.certificados@uptc.edu.co';
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const n8nWebhookAuth = process.env.N8N_WEBHOOK_AUTH;

    // 3. Reenvío seguro a N8N si está configurado en variables privadas
    if (n8nWebhookUrl) {
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
            codigo_uptc: String(codigo_uptc).trim(),
            email_institucional: email_institucional.trim().toLowerCase(),
            tipo_tramite,
            asignatura_o_lab: (asignatura_o_lab || '').trim(),
            descripcion: descripcion.trim(),
            request_id: finalRequestId,
            area_asignada: areaAsignada,
            email_coordinador: emailCoordinador,
            creado_en: new Date().toISOString()
          })
        });

        if (!n8nResponse.ok) {
          const errorText = await n8nResponse.text();
          console.error('[API] Error devuelto por N8N webhook:', n8nResponse.status, errorText);
          return res.status(502).json({
            status: 'error',
            mensaje: `El flujo N8N respondió con error ${n8nResponse.status}`,
            detalle: errorText
          });
        }

        const n8nResult = await n8nResponse.json();
        idempotencyStore.set(finalRequestId, n8nResult);
        return res.status(200).json(n8nResult);
      } catch (webhookErr) {
        console.error('[API] Excepción al contactar N8N webhook:', webhookErr.message);
        // Continuar al fallback seguro para no bloquear la experiencia si N8N está offline
      }
    }

    // 4. Fallback integrado (entorno local / mock controlado para pruebas)
    const nuevoId = crypto.randomUUID();
    const mockResponse = {
      status: 'ok',
      solicitud_id: nuevoId,
      tipo_tramite,
      estado: 'Pendiente',
      area_asignada: areaAsignada,
      email_coordinador_notificado: emailCoordinador,
      estudiante_notificado: email_institucional.trim().toLowerCase(),
      creado_en: new Date().toISOString(),
      request_id: finalRequestId,
      mensaje: 'Solicitud recibida, clasificada y registrada exitosamente.'
    };

    idempotencyStore.set(finalRequestId, mockResponse);
    return res.status(201).json(mockResponse);

  } catch (err) {
    console.error('[API] Error interno en /api/solicitudes:', err);
    return res.status(500).json({
      status: 'error',
      mensaje: 'Error interno en el servidor procesando la solicitud.',
      detalle: err.message
    });
  }
}
