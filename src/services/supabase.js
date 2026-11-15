import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('TU_PROYECTO') &&
  !supabaseKey.includes('REEMPLAZAR')
);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Semillas iniciales en memoria / localstorage si Supabase aún no tiene credenciales en .env.local
const MOCK_STORAGE_KEY = 'campusaid_solicitudes_mock';
const DEFAULT_SEEDS = [
  {
    id: 'a1111111-1111-4111-a111-111111111111',
    estudiante_id: 'user-demo-estudiante-1',
    estudiante_nombre: 'Laura Marcela Gómez',
    codigo_uptc: '202410045',
    email_institucional: 'laura.gomez@uptc.edu.co',
    tipo_tramite: 'Tutoria',
    asignatura_o_lab: 'Cálculo Diferencial e Integral',
    descripcion: 'Requiero apoyo y tutoría para comprensión de integrales definidas y métodos de sustitución antes del examen parcial final.',
    estado: 'Pendiente',
    area_asignada: 'Coordinación Académica',
    request_id: 'b1111111-1111-4111-b111-111111111111',
    creado_en: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'a2222222-2222-4222-a222-222222222222',
    estudiante_id: 'user-demo-estudiante-2',
    estudiante_nombre: 'Carlos Andrés Salamanca',
    codigo_uptc: '202320112',
    email_institucional: 'carlos.salamanca@uptc.edu.co',
    tipo_tramite: 'Laboratorio',
    asignatura_o_lab: 'Redes de Computadores y Telecomunicaciones',
    descripcion: 'Solicitud de acceso al laboratorio de redes de la Facultad de Ingeniería para configuración física de routers Cisco y switches VLAN.',
    estado: 'En revisión',
    area_asignada: 'Responsable de Laboratorios',
    request_id: 'b2222222-2222-4222-b222-222222222222',
    creado_en: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'a3333333-3333-4333-a333-333333333333',
    estudiante_id: 'user-demo-estudiante-3',
    estudiante_nombre: 'Valentina Rojas Niño',
    codigo_uptc: '202210874',
    email_institucional: 'valentina.rojas@uptc.edu.co',
    tipo_tramite: 'Certificado',
    asignatura_o_lab: 'Certificado de Calificaciones Oficial y Buena Conducta',
    descripcion: 'Expedición de certificado oficial de notas y promedio acumulado para postulación a pasantía de investigación con Colciencias.',
    estado: 'Aprobada',
    area_asignada: 'Responsable de Certificados y Admisiones',
    request_id: 'b3333333-3333-4333-b333-333333333333',
    creado_en: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

function getLocalSolicitudes() {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(DEFAULT_SEEDS));
      return DEFAULT_SEEDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SEEDS;
  }
}

function saveLocalSolicitudes(list) {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error guardando solicitudes locales:', e);
  }
}

/**
 * Consulta solicitudes respetando RLS o fallback mock
 */
export async function fetchSolicitudes(user) {
  if (isConfigured && supabase) {
    try {
      const query = supabase
        .from('solicitudes_campus')
        .select('*')
        .order('creado_en', { ascending: false });

      // RLS de Supabase filtra automáticamente en el servidor para estudiantes
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.warn('Supabase fetch falló, usando datos sincronizados:', err.message);
    }
  }

  // Fallback simulado
  const all = getLocalSolicitudes();
  if (!user) return { data: all, error: null };

  // Si es estudiante, simula RLS mostrando solo las suyas
  if (user.rol === 'estudiante') {
    const propias = all.filter(s => s.estudiante_id === user.id || s.email_institucional === user.email);
    return { data: propias, error: null };
  }

  // Si es coordinador, ve todas o filtra por área
  return { data: all, error: null };
}

/**
 * Agrega solicitud al almacén local cuando no hay Supabase o para sincronizar
 */
export function addLocalSolicitud(solicitud) {
  const current = getLocalSolicitudes();
  const exists = current.some(s => s.request_id === solicitud.request_id || s.id === solicitud.id);
  if (!exists) {
    const updated = [solicitud, ...current];
    saveLocalSolicitudes(updated);
  }
}

/**
 * Actualiza estado de solicitud (Solo para Coordinadores)
 */
export async function updateSolicitudEstado(id, nuevoEstado, observacion = '') {
  if (isConfigured && supabase) {
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

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.warn('Supabase update falló, aplicando en fallback:', err.message);
    }
  }

  // Fallback
  const current = getLocalSolicitudes();
  const updated = current.map(s => {
    if (s.id === id) {
      return {
        ...s,
        estado: nuevoEstado,
        observacion_coordinador: observacion,
        actualizado_en: new Date().toISOString()
      };
    }
    return s;
  });
  saveLocalSolicitudes(updated);
  return { data: updated.find(s => s.id === id), error: null };
}
