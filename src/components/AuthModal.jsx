import React, { useState } from 'react';
import { User, Lock, Mail, Shield, AlertCircle, Info, KeyRound } from 'lucide-react';
import { isConfigured } from '../services/supabase';
import { loginWithSupabase, registerWithSupabase, isDemoModeAvailable, getLocalDemoUser } from '../services/auth';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    // Validación básica de frontend
    if (!formData.email.toLowerCase().endsWith('@uptc.edu.co')) {
      setError('El correo debe pertenecer exclusivamente al dominio @uptc.edu.co.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (isRegister && !/^[0-9]{9}$/.test(formData.codigo)) {
      setError('El código estudiantil debe contener exactamente 9 dígitos numéricos.');
      return;
    }

    if (!isConfigured) {
      setError('Servicio de autenticación no configurado. El administrador debe integrar las credenciales de Supabase en .env.');
      return;
    }

    setLoading(true);
    if (isRegister) {
      const res = await registerWithSupabase({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        codigo: formData.codigo
      });
      setLoading(false);
      if (res.success) {
        setInfoMessage(res.message);
        setIsRegister(false);
      } else {
        setError(res.error);
      }
    } else {
      const res = await loginWithSupabase(formData.email, formData.password);
      setLoading(false);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.error);
      }
    }
  };

  const handleDemoAccess = (tipo) => {
    const demoUser = getLocalDemoUser(tipo);
    if (demoUser) {
      onLoginSuccess(demoUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-3 font-bold">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {isRegister ? 'Registro de Estudiante' : 'Acceso Institucional UPTC'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Autenticación segura para radicación y seguimiento de trámites
          </p>
        </div>

        {/* Notificación si Supabase no está configurado */}
        {!isConfigured && (
          <div className="mb-5 p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-amber-300">Conexión a Supabase Auth Pendiente</span>
              <p className="mt-0.5 text-amber-200/80">
                El backend de autenticación aún no tiene credenciales configuradas en las variables de entorno.
              </p>
            </div>
          </div>
        )}

        {/* Modo Demostración solo visible en DEV si está explícitamente activado */}
        {isDemoModeAvailable() && (
          <div className="mb-5 p-3 bg-slate-800/90 rounded-xl border border-dashed border-amber-400/50 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Modo Demostración Local [DEV ONLY]</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Uso restringido al entorno local de desarrollo para revisión visual.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoAccess('estudiante')}
                className="bg-slate-700 hover:bg-amber-400 hover:text-slate-950 text-slate-200 py-1 px-2.5 rounded text-[11px] font-medium transition"
              >
                Simular Estudiante
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccess('coordinador')}
                className="bg-slate-700 hover:bg-amber-400 hover:text-slate-950 text-slate-200 py-1 px-2.5 rounded text-[11px] font-medium transition"
              >
                Simular Coordinador
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Andrés Pérez"
                  value={formData.nombre}
                  onChange={(e) => setFormData(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Código Estudiantil (9 dígitos)</label>
                <input
                  type="text"
                  required
                  maxLength={9}
                  placeholder="202410123"
                  value={formData.codigo}
                  onChange={(e) => setFormData(p => ({ ...p, codigo: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Institucional (@uptc.edu.co)</label>
            <input
              type="email"
              required
              placeholder="estudiante@uptc.edu.co"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isConfigured}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition mt-2 shadow-lg shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : (isRegister ? 'Registrar Estudiante' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
              setInfoMessage(null);
            }}
            className="text-xs text-amber-400 hover:underline"
          >
            {isRegister ? '¿Ya tiene cuenta? Iniciar Sesión' : '¿Nuevo estudiante? Regístrese aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
