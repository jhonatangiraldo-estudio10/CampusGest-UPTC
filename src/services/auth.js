/**
 * Módulo de Autenticación y Autorización
 * Gestiona la sesión real mediante Supabase Auth y resolución autorizada de roles.
 * El modo demostración está estrictamente restringido al entorno local de desarrollo (DEV).
 */

import { supabase, isConfigured } from './supabase';

// Variable de entorno para habilitar demo únicamente en desarrollo local si se desea
const IS_DEV = import.meta.env.DEV;
const DEMO_ENABLED = IS_DEV && import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

export const isDemoModeAvailable = () => DEMO_ENABLED;

/**
 * Obtiene el usuario autenticado actual y su perfil con rol autorizado desde Supabase
 */
export async function getAuthenticatedUser() {
  if (!isConfigured || !supabase) {
    return { user: null, isConfigured: false };
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return { user: null, isConfigured: true };
    }

    const authUser = session.user;

    // Obtener rol autorizado desde la tabla perfiles (fuente de verdad del servidor)
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('rol, nombre_completo, codigo_uptc, email_institucional')
      .eq('id', authUser.id)
      .single();

    const rol = (!perfilError && perfil?.rol) ? perfil.rol : 'estudiante';

    return {
      user: {
        id: authUser.id,
        email: authUser.email,
        nombre: perfil?.nombre_completo || authUser.user_metadata?.nombre || authUser.email.split('@')[0],
        codigo: perfil?.codigo_uptc || authUser.user_metadata?.codigo || '',
        rol,
        token: session.access_token,
        isDemo: false
      },
      isConfigured: true
    };
  } catch (err) {
    console.error('[AuthService] Error al consultar sesión:', err.message);
    return { user: null, isConfigured: true, error: err.message };
  }
}

/**
 * Inicio de sesión real con Supabase Auth
 */
export async function loginWithSupabase(email, password) {
  if (!isConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase Auth no está configurado. La autenticación real está pendiente de integración de credenciales.'
    };
  }

  // Validación estricta de dominio antes de contactar el backend
  if (!email.toLowerCase().endsWith('@uptc.edu.co')) {
    return {
      success: false,
      error: 'El correo debe pertenecer exclusivamente al dominio institucional @uptc.edu.co.'
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Consulta del perfil autorizado
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol, nombre_completo, codigo_uptc')
      .eq('id', data.user.id)
      .single();

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        nombre: perfil?.nombre_completo || data.user.email,
        codigo: perfil?.codigo_uptc || '',
        rol: perfil?.rol || 'estudiante',
        token: data.session?.access_token,
        isDemo: false
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Registro de nuevo estudiante (Roles administrativos nunca se asignan públicamente)
 */
export async function registerWithSupabase({ email, password, nombre, codigo }) {
  if (!isConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase Auth no está configurado. El registro real está pendiente de integración.'
    };
  }

  if (!email.toLowerCase().endsWith('@uptc.edu.co')) {
    return {
      success: false,
      error: 'El correo debe ser institucional y terminar en @uptc.edu.co.'
    };
  }

  if (!/^[0-9]{9}$/.test(String(codigo).trim())) {
    return {
      success: false,
      error: 'El código UPTC debe contener exactamente 9 dígitos.'
    };
  }

  try {
    // Por diseño de seguridad: rol siempre es 'estudiante' en autoregistro
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          nombre: nombre.trim(),
          codigo: String(codigo).trim(),
          rol: 'estudiante'
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: 'Registro exitoso. Si la confirmación de correo está activa, revise su bandeja institucional.'
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Cierre de sesión real
 */
export async function logoutUser() {
  if (isConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('[AuthService] Error en signOut:', e.message);
    }
  }
}

/**
 * Modo Demostración Local (Exclusivo para Desarrollo Local)
 * Totalmente inhabilitado en producción.
 */
export function getLocalDemoUser(tipo = 'estudiante') {
  if (!DEMO_ENABLED) {
    console.warn('[Seguridad] Intento de acceso a modo demo en entorno no autorizado.');
    return null;
  }

  if (tipo === 'coordinador') {
    return {
      id: 'demo-coordinador-local',
      nombre: 'Coordinador Demo (Solo Desarrollo)',
      email: 'demo.coordinacion@uptc.edu.co',
      codigo: '999999999',
      rol: 'coordinador_general',
      isDemo: true
    };
  }

  return {
    id: 'demo-estudiante-local',
    nombre: 'Estudiante Demo (Solo Desarrollo)',
    email: 'demo.estudiante@uptc.edu.co',
    codigo: '202410001',
    rol: 'estudiante',
    isDemo: true
  };
}
