/**
 * Servicio de Automatización Frontend
 * Se comunica exclusivamente con el endpoint seguro /api/solicitudes (Vercel Serverless / Backend).
 * NUNCA contacta webhooks privados ni escribe silenciosamente en almacenamiento local falso.
 */

export async function enviarSolicitud(formData, user) {
  const requestId = formData.request_id || crypto.randomUUID();

  const payload = {
    estudiante_id: user?.id || null,
    estudiante_nombre: formData.estudiante_nombre?.trim(),
    codigo_uptc: String(formData.codigo_uptc || '').trim(),
    email_institucional: formData.email_institucional?.trim().toLowerCase(),
    tipo_tramite: formData.tipo_tramite,
    asignatura_o_lab: (formData.asignatura_o_lab || '').trim(),
    descripcion: formData.descripcion?.trim(),
    request_id: requestId
  };

  try {
    const res = await fetch('/api/solicitudes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        codigo: data.codigo || 'ERROR_PETICION',
        error: data.mensaje || `Error HTTP ${res.status} al procesar la solicitud.`
      };
    }

    return {
      success: true,
      status: res.status,
      data
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      codigo: 'ERROR_CONEXION',
      error: 'No se pudo contactar el servidor de la API (/api/solicitudes). Verifique su conexión de red.'
    };
  }
}
