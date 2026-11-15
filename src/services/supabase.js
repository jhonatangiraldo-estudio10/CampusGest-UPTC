/**
 * Módulo de Integración con Supabase
 * Manejo de cliente, consultas con RLS y gestión transparente de estados.
 * No sustituye silenciosamente la base de datos con localStorage en caso de fallos.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Determinación limpia de si Supabase tiene credenciales reales configuradas
export const isConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('TU_PROYECTO') &&
  !supabaseKey.includes('REEMPLAZAR') &&
  !supabaseKey.includes('TU_SUPABASE')
);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Semillas estáticas de demostración para revisión académica local (SOLO DEV)
const DEMO_SEEDS = [
  {
    id: 'a1111111-1111-4111-a111-111111111111',
    estudiante_id: 'demo-estudiante-local',
    estudiante_nombre: 'Laura Marcela Gómez',
    codigo_uptc: '202410045',
    email_institucional: 'laura.gomez@uptc.edu.co',
    tipo_tramite: 'Tutoria',
    asignatura_o_lab: 'Cálculo Diferencial e Integral',
    descripcion: 'Requiero apoyo y tutoría para comprensión de integrales definidas y métodos de sustitución antes del examen parcial final.',
    estado: 'Pendiente',
    area_asignada: 'Coordinación Académica',
    request_id: 'b1111111-1111-4111-b111-111111111111',
    creado_en: '2026-11-14T10:00:00.000Z'
  },
  {
    id: 'a2222222-2222-4222-a222-222222222222',
    estudiante_id: 'demo-estudiante-2',
    estudiante_nombre: 'Carlos Andrés Salamanca',
    codigo_uptc: '202320112',
    email_institucional: 'carlos.salamanca@uptc.edu.co',
    tipo_tramite: 'Laboratorio',
    asignatura_o_lab: 'Redes de Computadores y Telecomunicaciones',
    descripcion: 'Solicitud de acceso al laboratorio de redes de la Facultad de Ingeniería para configuración física de routers Cisco y switches VLAN.',
    estado: 'En revisión',
    area_asignada: 'Responsable de Laboratorios',
    request_id: 'b2222222-2222-4222-b222-222222222222',
    creado_en: '2026-11-14T14:30:00.000Z'
  },
  {
    id: 'a3333333-3333-4333-a333-333333333333',
    estudiante_id: 'demo-estudiante-3',
    estudiante_nombre: 'Valentina Rojas Niño',
    codigo_uptc: '202210874',
    email_institucional: 'valentina.rojas@uptc.edu.co',
    tipo_tramite: 'Certificado',
    asignatura_o_lab: 'Certificado de Calificaciones Oficial y Buena Conducta',
    descripcion: 'Expedición de certificado oficial de notas y promedio acumulado para postulación a pasantía de investigación con Colciencias.',
    estado: 'Aprobada',
    area_asignada: 'Responsable de Certificados y Admisiones',
    request_id: 'b3333333-3333-4333-b333-333333333333',
    creado_en: '2026-11-15T09:15:00.000Z'
  }
];

/**
 * Consulta solicitudes respetando RLS
 * Si Supabase no está configurado, devuelve estado informativo claro
 * Si hay error en Supabase, propaga el error sin ocultarlo
 */
export async function fetchSolicitudes(user) {
  if (!isConfigured || !supabase) {
    // Si estamos en modo demo local explícito, provee los datos estáticos de demostración
    if (import.meta.env.DEV && user?.isDemo) {
      if (user.rol === 'estudiante') {
        const propias = DEMO_SEEDS.filter(s => s.estudiante_id === user.id || s.email_institucional === user.email);
        return { data: propias, error: null, isDemo: true };
      }
      return { data: DEMO_SEEDS, error: null, isDemo: true };
    }

    return {
      data: null,
      error: {
        code: 'SUPABASE_NOT_CONFIGURED',
        message: 'Base de datos no configurada. Las credenciales de Supabase deben definirse en .env.'
      },
      isDemo: false
    };
  }

  try {
    const { data, error } = await supabase
      .from('solicitudes_campus')
      .select('*')
      .order('creado_en', { ascending: false });

    if (error) {
      return { data: null, error, isDemo: false };
    }

    return { data, error: null, isDemo: false };
  } catch (err) {
    return {
      data: null,
      error: { message: `Error de red contactando Supabase: ${err.message}` },
      isDemo: false
    };
  }
}

/**
 * Actualiza el estado de una solicitud (Operación autorizada exclusivamente para Coordinadores)
 */
export async function updateSolicitudEstado(id, nuevoEstado, observacion = '') {
  if (!isConfigured || !supabase) {
    return {
      data: null,
      error: {
        code: 'SUPABASE_NOT_CONFIGURED',
        message: 'No es posible actualizar el estado: Supabase no está conectado.'
      }
    };
  }

  try {
    const { data, error } = await supabase
      .from('solicitudes_campus')
      .update({
        estado: nuevoEstado,
        observacion_coordinador: observacion,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
}
