import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, FileText, BookOpen, FlaskConical, Clock, CheckCircle, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { fetchSolicitudes } from '../services/supabase';

export default function EstudianteDashboard({ user, onNewRequest }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const { data } = await fetchSolicitudes(user);
    if (data) {
      setSolicitudes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const getBadgeStyle = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-amber-400/20 text-amber-300 border-amber-400/30';
      case 'En revisión':
        return 'bg-blue-400/20 text-blue-300 border-blue-400/30';
      case 'Aprobada':
        return 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30';
      case 'Rechazada':
        return 'bg-rose-400/20 text-rose-300 border-rose-400/30';
      case 'Finalizada':
        return 'bg-purple-400/20 text-purple-300 border-purple-400/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'Tutoria':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'Laboratorio':
        return <FlaskConical className="w-4 h-4 text-blue-400" />;
      case 'Certificado':
        return <FileText className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const filtered = solicitudes.filter(item => {
    const matchTipo = filterTipo === 'Todos' || item.tipo_tramite === filterTipo;
    const matchEstado = filterEstado === 'Todos' || item.estado === filterEstado;
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (item.asignatura_o_lab || '').toLowerCase().includes(q) ||
      (item.descripcion || '').toLowerCase().includes(q) ||
      (item.codigo_uptc || '').toLowerCase().includes(q) ||
      (item.id || '').toLowerCase().includes(q);
    return matchTipo && matchEstado && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Banner Superior y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Mis Solicitudes y Trámites
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Consulta en tiempo real del estado de sus trámites con validación RLS de Supabase.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Recargar datos"
            className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button
            onClick={onNewRequest}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 transition"
          >
            + Nueva Solicitud
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por radicado, asunto, código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
          >
            <option value="Todos">Todos los Trámites</option>
            <option value="Tutoria">Tutoría</option>
            <option value="Laboratorio">Laboratorio</option>
            <option value="Certificado">Certificado</option>
          </select>
        </div>

        <div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
          >
            <option value="Todos">Todos los Estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En revisión">En revisión</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Rechazada">Rechazada</option>
            <option value="Finalizada">Finalizada</option>
          </select>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      {loading ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Consultando base de datos Supabase...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800">
          <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">No se encontraron solicitudes</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || filterTipo !== 'Todos' || filterEstado !== 'Todos'
              ? 'Pruebe ajustando los filtros de búsqueda.'
              : 'Aún no ha radicado solicitudes. Inicie una nueva desde el formulario.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-amber-400/40 rounded-xl p-4 sm:p-5 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getTipoIcon(item.tipo_tramite)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm sm:text-base">
                      {item.asignatura_o_lab || item.tipo_tramite}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeStyle(item.estado)}`}>
                      {item.estado}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                    {item.descripcion}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                    <span>Rad: {item.id.slice(0, 8)}...</span>
                    <span>•</span>
                    <span>Área: {item.area_asignada || 'Mesa Central'}</span>
                    <span>•</span>
                    <span>{new Date(item.creado_en).toLocaleDateString('es-CO')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs text-amber-400 hidden sm:inline font-medium">Ver detalle</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalle */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(selectedItem.estado)}`}>
                  {selectedItem.estado}
                </span>
                <h3 className="font-bold text-lg text-white mt-2">
                  {selectedItem.asignatura_o_lab || selectedItem.tipo_tramite}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 block text-xs">Estudiante:</span>
                <span className="text-white font-medium">{selectedItem.estudiante_nombre} ({selectedItem.codigo_uptc})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Correo Institucional:</span>
                <span className="text-amber-400 font-mono">{selectedItem.email_institucional}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Área Asignada (N8N):</span>
                <span className="text-slate-200">{selectedItem.area_asignada || 'Por asignar'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Descripción Radicada:</span>
                <p className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl text-slate-200 text-xs sm:text-sm leading-relaxed mt-1">
                  {selectedItem.descripcion}
                </p>
              </div>
              {selectedItem.observacion_coordinador && (
                <div>
                  <span className="text-amber-400 block text-xs font-semibold">Observación del Coordinador:</span>
                  <p className="bg-amber-950/30 border border-amber-600/40 p-3 rounded-xl text-amber-200 text-xs sm:text-sm leading-relaxed mt-1">
                    {selectedItem.observacion_coordinador}
                  </p>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                <span>UUID: {selectedItem.id}</span>
                <span>{new Date(selectedItem.creado_en).toLocaleString('es-CO')}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-xl text-xs sm:text-sm transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
