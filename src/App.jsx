import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SolicitudForm from './components/SolicitudForm';
import EstudianteDashboard from './components/EstudianteDashboard';
import CoordinadorDashboard from './components/CoordinadorDashboard';
import ArchitectureViewer from './components/ArchitectureViewer';
import TestMatrixRunner from './components/TestMatrixRunner';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('formulario');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Usuario por defecto para permitir interactuar de inmediato
  const [user, setUser] = useState({
    id: 'user-demo-estudiante-1',
    nombre: 'Laura Marcela Gómez',
    codigo: '202410045',
    email: 'laura.gomez@uptc.edu.co',
    rol: 'estudiante'
  });

  const handleLogin = (newUser) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleSuccessForm = () => {
    // Tras enviar, permitir pasar a mis-solicitudes
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      
      {/* Barra de Navegación Superior */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'formulario' && (
          <SolicitudForm
            user={user}
            onSuccess={handleSuccessForm}
          />
        )}

        {activeTab === 'mis-solicitudes' && (
          <EstudianteDashboard
            user={user}
            onNewRequest={() => setActiveTab('formulario')}
          />
        )}

        {activeTab === 'coordinacion' && (
          <CoordinadorDashboard
            user={user}
          />
        )}

        {activeTab === 'pruebas' && (
          <TestMatrixRunner />
        )}

        {activeTab === 'arquitectura' && (
          <ArchitectureViewer />
        )}

      </main>

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
      />

      {/* Pie de Página Institucional */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">CampusAid UPTC</span>
            <span>·</span>
            <span>Taller Full-Stack: Antigravity + Supabase + N8N</span>
          </div>
          <div className="text-slate-400">
            Universidad Pedagógica y Tecnológica de Colombia · Caso 3
          </div>
        </div>
      </footer>

    </div>
  );
}
