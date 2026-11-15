import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SolicitudForm from './components/SolicitudForm';
import EstudianteDashboard from './components/EstudianteDashboard';
import CoordinadorDashboard from './components/CoordinadorDashboard';
import ArchitectureViewer from './components/ArchitectureViewer';
import TestMatrixRunner from './components/TestMatrixRunner';
import AuthModal from './components/AuthModal';
import { getAuthenticatedUser, logoutUser } from './services/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('formulario');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Verificar sesión real al cargar
  useEffect(() => {
    async function checkAuth() {
      setAuthLoading(true);
      const { user: current } = await getAuthenticatedUser();
      setUser(current);
      setAuthLoading(false);
    }
    checkAuth();
  }, []);

  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    if (activeTab === 'coordinacion' || activeTab === 'mis-solicitudes') {
      setActiveTab('formulario');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      
      {/* Barra de Navegación */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        authLoading={authLoading}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'formulario' && (
          <SolicitudForm
            user={user}
            onSuccess={() => {
              if (user) setActiveTab('mis-solicitudes');
            }}
          />
        )}

        {activeTab === 'mis-solicitudes' && (
          <EstudianteDashboard
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onNewRequest={() => setActiveTab('formulario')}
          />
        )}

        {activeTab === 'coordinacion' && (
          <CoordinadorDashboard
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
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
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Pie de Página */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">CampusGest-UPTC</span>
            <span>·</span>
            <span>Mesa de Ayuda y Gestión de Solicitudes Académicas</span>
          </div>
          <div className="text-slate-400">
            Universidad Pedagógica y Tecnológica de Colombia · Caso 3
          </div>
        </div>
      </footer>

    </div>
  );
}
