/**
 * Servicio de Automatización Frontend
 * Se comunica con la ruta segura /api/solicitudes (Vercel / Backend).
 * NUNCA llama directamente al webhook privado de N8N desde el navegador.
 */

import { addLocalSolicitud } from './supabase.js';

export async function enviarSolicitud(formData, user) {
  const requestId = formData.request_id || crypto.randomUUID();

  const payload = {
    estudiante_id: user?.id || null,
    estudiante_nombre: formData.estudiante_nombre,
    codigo_uptc: formData.codigo_uptc,
    email_institucional: formData.email_institucional,
    tipo_tramite: formData.tipo_tramite,
    asignatura_o_lab: formData.asignatura_o_lab,
    descripcion: formData.descripcion,
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

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.mensaje || `Error ${res.status} al procesar la solicitud`);
    }

    // Registra en el almacén sincronizado para reflejo visual inmediato en UI
    addLocalSolicitud({
      id: data.solicitud_id || requestId,
      estudiante_id: payload.estudiante_id,
      estudiante_nombre: payload.estudiante_nombre,
      codigo_uptc: payload.codigo_uptc,
      email_institucional: payload.email_institucional,
      tipo_tramite: payload.tipo_tramite,
      asignatura_o_lab: payload.asignatura_o_lab,
      descripcion: payload.descripcion,
      estado: data.estado || 'Pendiente',
      area_asignada: data.area_asignada || 'Área asignada por N8N',
      request_id: requestId,
      creado_en: new Date().toISOString()
    });

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('[AutomationService] Error al enviar solicitud:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
