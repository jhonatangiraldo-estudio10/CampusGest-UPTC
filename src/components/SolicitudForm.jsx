import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, BookOpen, FlaskConical, FileText, Sparkles, RefreshCw, Lock, Info } from 'lucide-react';
import { enviarSolicitud } from '../services/automation';

export default function SolicitudForm({ user, onSuccess }) {
  const [formData, setFormData] = useState({
    estudiante_nombre: user?.nombre || '',
    codigo_uptc: user?.codigo || '',
    email_institucional: user?.email || '',
    tipo_tramite: 'Tutoria',
    asignatura_o_lab: '',
    descripcion: ''
  });

  // Si el usuario cambia o se autentica, actualizar automáticamente datos fijados
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        estudiante_nombre: user.nombre || prev.estudiante_nombre,
        codigo_uptc: user.codigo || prev.codigo_uptc,
        email_institucional: user.email || prev.email_institucional
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Validación estricta en tiempo real
  const validateField = (name, value) => {
    let err = '';
    if (name === 'codigo_uptc') {
      if (!/^[0-9]{9}$/.test(String(value).trim())) {
        err = 'El código UPTC debe contener exactamente 9 dígitos numéricos (ej. 202410123).';
      }
    } else if (name === 'email_institucional') {
      if (!/^[^@\s]+@uptc\.edu\.co$/i.test(String(value).trim())) {
        err = 'Debe ser un correo institucional válido terminado en @uptc.edu.co.';
      }
    } else if (name === 'estudiante_nombre') {
      if (String(value).trim().length < 3) {
        err = 'El nombre debe tener al menos 3 caracteres.';
      }
    } else if (name === 'descripcion') {
      if (String(value).trim().length < 5) {
        err = 'La descripción debe tener al menos 5 caracteres.';
      }
    }
    setErrors(prev => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setResultado(null);

    const v1 = validateField('estudiante_nombre', formData.estudiante_nombre);
    const v2 = validateField('codigo_uptc', formData.codigo_uptc);
    const v3 = validateField('email_institucional', formData.email_institucional);
    const v4 = validateField('descripcion', formData.descripcion);

    if (!v1 || !v2 || !v3 || !v4) {
      setApiError({
        mensaje: 'Por favor corrija los campos requeridos antes de enviar.'
      });
      return;
    }

    setSubmitting(true);
    const res = await enviarSolicitud(formData, user);
    setSubmitting(false);

    if (res.success) {
      setResultado(res.data);
      if (onSuccess) onSuccess(res.data);
    } else {
      setApiError({
        status: res.status,
        codigo: res.codigo,
        mensaje: res.error
      });
    }
  };

  const getTramiteLabel = () => {
    switch (formData.tipo_tramite) {
      case 'Tutoria': return 'Asignatura o Tema a Reforzar';
      case 'Laboratorio': return 'Laboratorio, Espacio o Práctica';
      case 'Certificado': return 'Tipo de Certificado o Trámite Específico';
      default: return 'Detalle o Asunto';
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl mb-6">
        
        {/* Encabezado */}
        <div className="border-b border-slate-700/70 pb-5 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Radicación de Trámites Académicos
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Los trámites se procesan a través de la API institucional con enrutamiento hacia N8N y persistencia en Supabase.
          </p>
        </div>

        {/* Mensaje de Resultado Confirmado */}
        {resultado && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-xl p-5 mb-6 text-emerald-200 animate-fadeIn">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-emerald-300 text-base">¡Trámite radicado exitosamente!</h4>
                <p className="text-sm mt-1 text-emerald-200/90">{resultado.mensaje || 'Solicitud procesada por el servidor.'}</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-emerald-900/40 p-3 rounded-lg border border-emerald-700/40 font-mono">
                  {resultado.solicitud_id && (
                    <div><span className="text-emerald-400 font-semibold">ID Solicitud:</span> {resultado.solicitud_id}</div>
                  )}
                  <div><span className="text-emerald-400 font-semibold">Trámite:</span> {resultado.tipo_tramite || formData.tipo_tramite}</div>
                  <div><span className="text-emerald-400 font-semibold">Estado:</span> {resultado.estado || 'Pendiente'}</div>
                  {resultado.area_asignada && (
                    <div><span className="text-emerald-400 font-semibold">Área:</span> {resultado.area_asignada}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de Error / Servicio Pendiente de Configuración */}
        {apiError && (
          <div className="bg-rose-950/60 border border-rose-500/50 rounded-xl p-4 mb-6 text-rose-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300 block">
                  {apiError.status === 503 ? 'Servicio N8N Pendiente de Integración' : 'Error en la solicitud'}
                </span>
                <p className="text-xs text-rose-200/90 mt-1">{apiError.mensaje}</p>
                {apiError.codigo === 'N8N_NO_CONFIGURADO' && (
                  <p className="text-[11px] text-amber-300/90 mt-2 bg-rose-900/40 p-2 rounded border border-rose-700/40">
                    ℹ️ Nota para el equipo de integración: configure la variable <code className="font-mono text-white">N8N_WEBHOOK_URL</code> en el servidor para habilitar el flujo completo.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Selección Visual del Tipo de Trámite */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Tipo de Trámite Institucional <span className="text-amber-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, tipo_tramite: 'Tutoria' }))}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.tipo_tramite === 'Tutoria'
                    ? 'border-amber-400 bg-amber-400/10 text-white shadow-md shadow-amber-400/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600 text-slate-300'
                }`}
              >
                <BookOpen className={`w-5 h-5 mb-2 ${formData.tipo_tramite === 'Tutoria' ? 'text-amber-400' : 'text-slate-400'}`} />
                <div className="font-bold text-sm">Tutoría</div>
                <div className="text-xs text-slate-400 mt-1">Refuerzo académico y asesoría docente</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, tipo_tramite: 'Laboratorio' }))}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.tipo_tramite === 'Laboratorio'
                    ? 'border-amber-400 bg-amber-400/10 text-white shadow-md shadow-amber-400/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600 text-slate-300'
                }`}
              >
                <FlaskConical className={`w-5 h-5 mb-2 ${formData.tipo_tramite === 'Laboratorio' ? 'text-amber-400' : 'text-slate-400'}`} />
                <div className="font-bold text-sm">Laboratorio</div>
                <div className="text-xs text-slate-400 mt-1">Espacios y equipos de práctica</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, tipo_tramite: 'Certificado' }))}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.tipo_tramite === 'Certificado'
                    ? 'border-amber-400 bg-amber-400/10 text-white shadow-md shadow-amber-400/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600 text-slate-300'
                }`}
              >
                <FileText className={`w-5 h-5 mb-2 ${formData.tipo_tramite === 'Certificado' ? 'text-amber-400' : 'text-slate-400'}`} />
                <div className="font-bold text-sm">Certificado</div>
                <div className="text-xs text-slate-400 mt-1">Notas, matrícula y documentos</div>
              </button>

            </div>
          </div>

          {/* Datos del Estudiante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nombre Completo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Nombre Completo <span className="text-amber-400">*</span></span>
                {user && <span className="text-[10px] text-amber-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Verificado</span>}
              </label>
              <input
                type="text"
                name="estudiante_nombre"
                value={formData.estudiante_nombre}
                onChange={handleChange}
                readOnly={Boolean(user)}
                placeholder="Ej. Laura Marcela Gómez"
                className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                  user ? 'bg-slate-900/60 border-slate-800 text-slate-300 cursor-not-allowed' :
                  errors.estudiante_nombre
                    ? 'border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-700 focus:border-amber-400 focus:ring-amber-400/20'
                }`}
              />
              {errors.estudiante_nombre && (
                <p className="text-xs text-rose-400 mt-1">{errors.estudiante_nombre}</p>
              )}
            </div>

            {/* Código UPTC */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Código UPTC (9 dígitos) <span className="text-amber-400">*</span></span>
                {user && <span className="text-[10px] text-amber-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Verificado</span>}
              </label>
              <input
                type="text"
                name="codigo_uptc"
                maxLength={9}
                value={formData.codigo_uptc}
                onChange={handleChange}
                readOnly={Boolean(user?.codigo)}
                placeholder="Ej. 202410045"
                className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 transition ${
                  user?.codigo ? 'bg-slate-900/60 border-slate-800 text-slate-300 cursor-not-allowed' :
                  errors.codigo_uptc
                    ? 'border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-700 focus:border-amber-400 focus:ring-amber-400/20'
                }`}
              />
              {errors.codigo_uptc && (
                <p className="text-xs text-rose-400 mt-1">{errors.codigo_uptc}</p>
              )}
            </div>

          </div>

          {/* Correo Institucional */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Correo Institucional (@uptc.edu.co) <span className="text-amber-400">*</span></span>
              {user && <span className="text-[10px] text-amber-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Verificado</span>}
            </label>
            <input
              type="email"
              name="email_institucional"
              value={formData.email_institucional}
              onChange={handleChange}
              readOnly={Boolean(user?.email)}
              placeholder="nombre.apellido@uptc.edu.co"
              className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                user?.email ? 'bg-slate-900/60 border-slate-800 text-slate-300 cursor-not-allowed' :
                errors.email_institucional
                  ? 'border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-amber-400 focus:ring-amber-400/20'
              }`}
            />
            {errors.email_institucional && (
              <p className="text-xs text-rose-400 mt-1">{errors.email_institucional}</p>
            )}
          </div>

          {/* Campo Dinámico */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {getTramiteLabel()}
            </label>
            <input
              type="text"
              name="asignatura_o_lab"
              value={formData.asignatura_o_lab}
              onChange={handleChange}
              placeholder="Especificar materia, laboratorio o nombre del documento requerido"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Motivo o Justificación Detallada <span className="text-amber-400">*</span>
            </label>
            <textarea
              name="descripcion"
              rows={4}
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Explique detalladamente el motivo de su solicitud para que el área encargada pueda atenderla..."
              className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                errors.descripcion
                  ? 'border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-amber-400 focus:ring-amber-400/20'
              }`}
            />
            {errors.descripcion && (
              <p className="text-xs text-rose-400 mt-1">{errors.descripcion}</p>
            )}
          </div>

          {/* Botón de Envío */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Enviando a API Serverless...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Radicar Trámite Académico</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-3">
              Cada radicación genera un identificador de idempotencia UUID único para prevenir duplicados.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
