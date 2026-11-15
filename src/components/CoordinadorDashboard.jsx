import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Clock, XCircle, RefreshCw, Send, AlertTriangle } from 'lucide-react';
import { fetchSolicitudes, updateSolicitudEstado } from '../services/supabase';

export default function CoordinadorDashboard({ user }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('En revisión');
  const [observacion, setObservacion] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    setLoading(true);
    // Coordinador ve todas las solicitudes
    const { data } = await fetchSolicitudes({ rol: 'coordinador_general' });
    if (data) setSolicitudes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    setFeedback(null);
    const res = await updateSolicitudEstado(selected.id, nuevoEstado, observacion);
    setSaving(false);
    if (!res.error) {
      setFeedback('¡Estado de la solicitud actualizado correctamente!');
      loadData();
      setSelected(null);
      setObservacion('');
    } else {
      setFeedback('Error al actualizar: ' + res.error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Encabezado Mesa de Coordinación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Mesa de Coordinación y Gestión (Caso 3)
            </h2>
            <p className="text-sm text-slate-400">
              Control de estados y atención de solicitudes clasificadas por N8N.
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

      {feedback && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Grid de Solicitudes para Gestión */}
      {loading ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Cargando solicitudes para gestión...</p>
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
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-amber-400">
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Observación para el Estudiante:</label>
                    <textarea
                      rows={2}
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                      placeholder="Indique fecha de atención, horario, aula o motivo de resolución..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUpdate}
                      disabled={saving}
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
