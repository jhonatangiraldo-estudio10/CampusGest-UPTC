import React from 'react';
import { School, User, LogOut, CheckCircle, ShieldCheck, Activity, Terminal } from 'lucide-react';
import { isConfigured } from '../services/supabase';

export default function Navbar({ activeTab, setActiveTab, user, onOpenAuth, onLogout }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Nombre UPTC */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-amber-400/20">
              <School className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">CampusAid</span>
                <span className="bg-amber-400/20 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-400/30">
                  UPTC
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Mesa de Ayuda y Tutorías Inteligentes · Caso 3</p>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('formulario')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'formulario'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-md shadow-amber-400/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Nuevo Trámite
            </button>
            
            <button
              onClick={() => setActiveTab('mis-solicitudes')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'mis-solicitudes'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-md shadow-amber-400/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Mis Solicitudes
            </button>

            <button
              onClick={() => setActiveTab('coordinacion')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'coordinacion'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-md shadow-amber-400/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Mesa Coordinación
            </button>

            <button
              onClick={() => setActiveTab('pruebas')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'pruebas'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-md shadow-amber-400/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Matriz QA
              </span>
            </button>

            <button
              onClick={() => setActiveTab('arquitectura')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all hidden md:flex items-center gap-1.5 ${
                activeTab === 'arquitectura'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-md shadow-amber-400/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Arquitectura
            </button>
          </nav>

          {/* Usuario / Estado */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indicador Supabase */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-slate-300 font-mono text-[11px]">
                {isConfigured ? 'Supabase Live' : 'Modo Seguro / Mock'}
              </span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight">{user.nombre}</div>
                  <div className="text-[10px] text-amber-400 font-mono capitalize">{user.rol}</div>
                </div>
                <button
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>Ingresar</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
