import React, { useState } from 'react';
import { User, Lock, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    email: '',
    password: '',
    rol: 'estudiante'
  });
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validar correo institucional
    if (!formData.email.endsWith('@uptc.edu.co')) {
      setError('El correo debe terminar en @uptc.edu.co.');
      return;
    }

    if (isRegister && !/^[0-9]{9}$/.test(formData.codigo)) {
      setError('El código estudiantil debe contener 9 dígitos.');
      return;
    }

    // Login exitoso
    onLogin({
      id: crypto.randomUUID(),
      nombre: formData.nombre || (formData.email.split('@')[0].replace('.', ' ').toUpperCase()),
      codigo: formData.codigo || '202410045',
      email: formData.email,
      rol: formData.rol
    });

    onClose();
  };

  const loginRapido = (rol) => {
    if (rol === 'estudiante') {
      onLogin({
        id: 'user-demo-estudiante-1',
        nombre: 'Laura Marcela Gómez',
        codigo: '202410045',
        email: 'laura.gomez@uptc.edu.co',
        rol: 'estudiante'
      });
    } else {
      onLogin({
        id: 'user-demo-coordinador-1',
        nombre: 'Dr. Roberto Moreno',
        codigo: '100000001',
        email: 'coordinacion.academica@uptc.edu.co',
        rol: 'coordinador_general'
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
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

        {/* Accesos Rápidos para Evaluación del Taller */}
        <div className="mb-6 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
          <span className="text-slate-400 font-semibold block mb-2">Perfiles de prueba rápida:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => loginRapido('estudiante')}
              className="bg-slate-700 hover:bg-amber-400 hover:text-slate-950 text-slate-200 py-1.5 px-3 rounded-lg font-medium transition text-[11px]"
            >
              Entrar como Estudiante
            </button>
            <button
              type="button"
              onClick={() => loginRapido('coordinador')}
              className="bg-slate-700 hover:bg-amber-400 hover:text-slate-950 text-slate-200 py-1.5 px-3 rounded-lg font-medium transition text-[11px]"
            >
              Entrar como Coordinador
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
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

          {!isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rol a Asumir</label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData(p => ({ ...p, rol: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="estudiante">Estudiante UPTC</option>
                <option value="coordinador_general">Coordinador de Mesa de Ayuda</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition mt-2 shadow-lg shadow-amber-400/20"
          >
            {isRegister ? 'Crear Cuenta Estudiante' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-amber-400 hover:underline"
          >
            {isRegister ? '¿Ya tiene cuenta? Iniciar Sesión' : '¿Nuevo estudiante? Regístrese aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
