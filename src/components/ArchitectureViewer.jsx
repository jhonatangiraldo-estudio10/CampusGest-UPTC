import React from 'react';
import { Layers, ArrowRight, ShieldCheck, Database, Server, Mail, GitBranch, Cpu } from 'lucide-react';
import { isConfigured } from '../services/supabase';

export default function ArchitectureViewer() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Banner de Arquitectura */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Arquitectura del Sistema · CampusAid UPTC
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Caso 3 — Separación de responsabilidades: Google Antigravity + Vercel Serverless + N8N + Supabase RLS.
            </p>
          </div>
        </div>

        {/* Diagrama de Flujo Interactivo */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          
          {/* Paso 1: Frontend */}
          <div className="bg-slate-900 border border-amber-400/40 rounded-xl p-5 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">Paso 1 · Cliente</span>
            <h4 className="font-bold text-white text-sm mt-1">Antigravity Frontend</h4>
            <p className="text-xs text-slate-400 mt-2">
              Validación en tiempo real (código 9 dígitos, @uptc.edu.co), generación de <code className="text-amber-300">request_id</code> y envío a backend.
            </p>
            <div className="mt-3 text-[11px] font-mono text-slate-500 bg-slate-950 p-2 rounded border border-slate-800">
              POST /api/solicitudes
            </div>
          </div>

          {/* Paso 2: Backend Vercel */}
          <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-5 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider block">Paso 2 · Servidor</span>
            <h4 className="font-bold text-white text-sm mt-1">Vercel API Gateway</h4>
            <p className="text-xs text-slate-400 mt-2">
              Verifica sesión, aplica idempotencia y reenvía con secreto al webhook privado de N8N.
            </p>
            <div className="mt-3 text-[11px] font-mono text-slate-500 bg-slate-950 p-2 rounded border border-slate-800">
              N8N_WEBHOOK_AUTH (secreto)
            </div>
          </div>

          {/* Paso 3: N8N Workflow */}
          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <GitBranch className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">Paso 3 · Automatización</span>
            <h4 className="font-bold text-white text-sm mt-1">N8N Workflow Switch</h4>
            <p className="text-xs text-slate-400 mt-2">
              Clasifica trámite (Tutoría / Laboratorio / Certificado), inserta en Supabase y dispara correo institucional.
            </p>
            <div className="mt-3 text-[11px] font-mono text-slate-500 bg-slate-950 p-2 rounded border border-slate-800">
              Switch → Insert → Mail
            </div>
          </div>

          {/* Paso 4: Supabase RLS */}
          <div className="bg-slate-900 border border-purple-500/40 rounded-xl p-5 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block">Paso 4 · Persistencia</span>
            <h4 className="font-bold text-white text-sm mt-1">Supabase DB & RLS</h4>
            <p className="text-xs text-slate-400 mt-2">
              PostgreSQL con políticas RLS: el estudiante consulta solo sus trámites; coordinadores gestionan su área.
            </p>
            <div className="mt-3 text-[11px] font-mono text-slate-500 bg-slate-950 p-2 rounded border border-slate-800">
              solicitudes_campus (RLS)
            </div>
          </div>

        </div>
      </div>

      {/* Reglas de Seguridad y Buenas Prácticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6">
          <h3 className="font-bold text-white text-base flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Ruta Única de Escritura e Idempotencia
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Sin Doble Inserción:</strong> Se respeta la decisión de diseño de que N8N y el backend sean los responsables de crear la solicitud.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Idempotencia con request_id:</strong> Reintentos ante cortes de red retornan el registro existente sin duplicar filas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Secretos Protegidos:</strong> No se exponen claves <code className="text-amber-300">service_role</code> ni tokens N8N en variables públicas de Vite.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6">
          <h3 className="font-bold text-white text-base flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-amber-400" />
            Enrutamiento de Notificaciones por Trámite
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-amber-400">Tutoria</span>
              <span className="text-slate-300">coordinacion.academica@uptc.edu.co</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-blue-400">Laboratorio</span>
              <span className="text-slate-300">laboratorios.ingenieria@uptc.edu.co</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-purple-400">Certificado</span>
              <span className="text-slate-300">admisiones.certificados@uptc.edu.co</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
