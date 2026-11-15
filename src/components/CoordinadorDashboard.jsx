import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, Clock, XCircle, RefreshCw, Send, AlertTriangle, Lock } from 'lucide-react';
import { fetchSolicitudes, updateSolicitudEstado, isConfigured } from '../services/supabase';

export default function CoordinadorDashboard({ user, onOpenAuth }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState(null);
  const [isDemoData, setIsDemoData] = useState(false);

  const [selected, setSelected] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('En revisión');
  const [observacion, setObservacion] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Verificación estricta de autorización de rol
  const isAuthorized = user && (user.rol?.startsWith('coordinador') || user.rol === 'admin');

  const loadData = async () => {
    if (!isAuthorized) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorInfo(null);
    const { data, error, isDemo } = await fetchSolicitudes(user);
    setIsDemoData(Boolean(isDemo));

    if (error) {
      setErrorInfo(error.message);
      setSolicitudes([]);
    } else if (data) {
      setSolicitudes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    setFeedback(null);
    const res = await updateSolicitudEstado(selected.id, nuevoEstado, observacion);
    setSaving(false);

    if (res.error) {
      setFeedback({ tipo: 'error', mensaje: res.error.message || 'Error al actualizar estado.' });
    } else {
      setFeedback({ tipo: 'success', mensaje: 'Estado de la solicitud actualizado en base de datos.' });
      loadData();
      setSelected(null);
      setObservacion('');
    }
  };

  // 1. Caso: Usuario no autenticado o sin rol de coordinador
  if (!user || !isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 text-center backdrop-blur-sm shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white">Acceso Denegado · Área Administrativa</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          La mesa de coordinación y gestión de trámites requiere una cuenta institucional con rol asignado de coordinador o administrador.
        </p>
        <div className="mt-4 text-xs font-mono text-slate-500 bg-slate-900/60 p-2.5 rounded-lg max-w-sm mx-auto border border-slate-800">
          Rol actual: {user ? user.rol : 'No autenticado'}
        </div>
        {!user && (
          <button
            onClick={onOpenAuth}
            className="mt-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-amber-400/20"
          >
            Iniciar Sesión con Cuenta Autorizada
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Encabezado Mesa de Coordinación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Mesa de Coordinación y Gestión Académica
              </h2>
              {isDemoData && (
                <span className="bg-amber-500/20 text-amber-300 text-[11px] font-mono font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                  Modo Demo Local
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">
              Sesión autorizada: <span className="text-amber-400 font-mono">{user.nombre}</span> ({user.rol})
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition flex items-center gap-2 text-xs font-semibold self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Lista</span>
        </button>
      </div>

      {/* Notificación si Supabase no está configurado */}
      {!isConfigured && !isDemoData && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block">Conexión a Base de Datos Supabase Pendiente</span>
            <p className="mt-0.5 text-amber-200/90">
              Las credenciales de Supabase deben ser provistas en las variables de entorno para consultar y actualizar los trámites reales con RLS.
            </p>
          </div>
        </div>
      )}

      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          feedback.tipo === 'success'
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
        }`}>
          <span>{feedback.mensaje}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      {errorInfo && (
        <div className="p-4 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{errorInfo}</span>
        </div>
      )}

      {/* Grid de Solicitudes */}
      {loading ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Cargando solicitudes autorizadas...</p>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800">
          <Clock className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">No hay solicitudes pendientes de atención</p>
          <p className="text-xs text-slate-400 mt-1">Los trámites asignados por N8N aparecerán en esta vista.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {solicitudes.map((s) => (
            <div
              key={s.id}
              className={`p-5 rounded-2xl border transition ${
                selected?.id === s.id
                  ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/20 shadow-xl'
                  : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-amber-400 font-mono">
                  {s.tipo_tramite}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  s.estado === 'Aprobada' ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300' :
                  s.estado === 'En revisión' ? 'bg-blue-950 border-blue-500/50 text-blue-300' :
                  s.estado === 'Rechazada' ? 'bg-rose-950 border-rose-500/50 text-rose-300' :
                  s.estado === 'Finalizada' ? 'bg-purple-950 border-purple-500/50 text-purple-300' :
                  'bg-amber-950 border-amber-500/50 text-amber-300'
                }`}>
                  {s.estado}
                </span>
              </div>

              <h4 className="font-bold text-white text-base mb-1">
                {s.asignatura_o_lab || s.tipo_tramite}
              </h4>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                {s.descripcion}
              </p>

              <div className="text-xs space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-4 font-mono">
                <div className="text-slate-300"><span className="text-slate-500">Estudiante:</span> {s.estudiante_nombre}</div>
                <div className="text-slate-300"><span className="text-slate-500">Código UPTC:</span> {s.codigo_uptc}</div>
                <div className="text-slate-300 truncate"><span className="text-slate-500">Correo:</span> {s.email_institucional}</div>
                <div className="text-amber-400 truncate"><span className="text-slate-500">Área:</span> {s.area_asignada || 'No asignada'}</div>
              </div>

              {selected?.id === s.id ? (
                <div className="space-y-3 pt-2 border-t border-slate-700 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nuevo Estado:</label>
                    <select
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En revisión">En revisión</option>
                      <option value="Aprobada">Aprobada</option>
                      <option value="Rechazada">Rechazada</option>
                      <option value="Finalizada">Finalizada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Observación Oficial para el Estudiante:</label>
                    <textarea
                      rows={2}
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                      placeholder="Indique detalles de atención, horario, aula o motivo de resolución..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUpdate}
                      disabled={saving || !isConfigured}
                      className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Confirmar Cambio de Estado'}
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelected(s);
                    setNuevoEstado(s.estado);
                    setObservacion(s.observacion_coordinador || '');
                  }}
                  className="w-full py-2 bg-slate-700/80 hover:bg-amber-400 hover:text-slate-950 text-slate-200 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <span>Atender Solicitud</span>
                </button>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
