import React from 'react';
import { Layers, ArrowRight, ShieldCheck, Database, Server, Mail, GitBranch, Cpu, Lock, CheckCircle2 } from 'lucide-react';
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
              Arquitectura Segura del Sistema · CampusGest UPTC
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Separación estricta de responsabilidades: React + Vercel Serverless Gateway + N8N + Supabase RLS.
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
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">Capa 1 · Frontend</span>
            <h4 className="font-bold text-white text-sm mt-1">CampusGest React UI</h4>
            <p className="text-xs text-slate-400 mt-2">
              Validación en tiempo real (código de 9 dígitos, dominio institucional @uptc.edu.co) y generación de <code className="text-amber-300">request_id</code>.
            </p>
            <div className="mt-3 text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
              POST /api/solicitudes
            </div>
          </div>

          {/* Paso 2: Backend Vercel */}
          <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-5 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider block">Capa 2 · API Gateway</span>
            <h4 className="font-bold text-white text-sm mt-1">Vercel Serverless Function</h4>
            <p className="text-xs text-slate-400 mt-2">
              Límite de payload (50KB), whitelisting de campos, idempotencia, timeout (8s) y proxy sin exponer webhooks secretos.
            </p>
            <div className="mt-3 text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
              N8N_WEBHOOK_AUTH (privado)
            </div>
          </div>

          {/* Paso 3: N8N Workflow */}
          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <GitBranch className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">Capa 3 · Automatización</span>
            <h4 className="font-bold text-white text-sm mt-1">N8N Switch Parametrizado</h4>
            <p className="text-xs text-slate-400 mt-2">
              Clasifica (Tutoría / Laboratorio / Certificado), inserta parametrizado en PostgreSQL y dispara notificaciones.
            </p>
            <div className="mt-3 text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
              SQL Parametrizado ($1...$10)
            </div>
          </div>

          {/* Paso 4: Supabase RLS */}
          <div className="bg-slate-900 border border-purple-500/40 rounded-xl p-5 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block">Capa 4 · Persistencia</span>
            <h4 className="font-bold text-white text-sm mt-1">Supabase DB & RLS</h4>
            <p className="text-xs text-slate-400 mt-2">
              PostgreSQL con RLS: estudiantes acceden únicamente a sus registros; coordinadores atienden su área asignada.
            </p>
            <div className="mt-3 text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
              solicitudes_campus (RLS)
            </div>
          </div>

        </div>
      </div>

      {/* Fortalecimiento y Auditoría de Seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6">
          <h3 className="font-bold text-white text-base flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Controles de Seguridad Implementados (OWASP)
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Sin Autenticación Ficticia:</strong> Eliminado el auto-login simulado y la selección pública de roles administrativos.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>API Honesta (HTTP 503):</strong> La API no simula respuestas falsas de éxito si el webhook N8N no está configurado.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Protección contra DoS y Type Pollution:</strong> Whitelisting de campos permitidos y límite de tamaño de carga (50 KB).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>SQL Parametrizado en N8N:</strong> Eliminada la concatenación de variables en PostgreSQL para prevenir inyecciones SQL.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6">
          <h3 className="font-bold text-white text-base flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-amber-400" />
            Puntos de Integración Pendientes
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Supabase Auth & PostgreSQL:</strong> Configuración de proyecto, ejecución de migraciones en SQL Editor y roles.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Instancia N8N & Webhooks:</strong> Importación de <code className="text-amber-300 font-mono">n8n/campusaid-workflow.json</code> y credenciales SMTP / Postgres.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Variables de Producción en Vercel:</strong> Cargar las claves privadas del servidor sin prefijo <code className="text-amber-300 font-mono">VITE_</code>.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
