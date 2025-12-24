import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from './AppContext';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import Dashboard from './components/Dashboard';
import Agenda from './components/Agenda';
import Escala from './components/Escala';
import Students from './components/Students';
import Instructors from './components/Instructors';
import InstructorProfile from './components/InstructorProfile';
import RoomsAndEquipment from './components/RoomsAndEquipment';
import Financial from './components/Financial';
import Settings from './components/Settings';
import BotAvisos from './components/BotAvisos';
import NeuralNetworkBackground from './components/NeuralNetworkBackground';
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import { ShieldQuestion } from 'lucide-react';

const App: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { activeTab, settings, isAuthenticated, user, impersonatingFrom } = state;
  const { isDarkMode, appName } = settings;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null); // Ref para o elemento principal de conteúdo

  // Efeito para rolar para o topo ao mudar de aba
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const setActiveTab = (tab: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    setIsSidebarOpen(false); // Fecha a sidebar ao navegar
  };
  
  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const handleStopImpersonating = () => {
    dispatch({ type: 'STOP_IMPERSONATING' });
  };

  const pageTitles: { [key: string]: string } = {
    painel: 'Painel de Controle',
    agenda: 'Agenda de Aulas',
    escala: 'Escala de Aparelhos',
    alunos: 'Gestão de Alunos',
    instrutores: 'Corpo Docente',
    perfil: 'Meu Perfil Profissional',
    sala: 'Salas & Aparelhos',
    financeiro: 'Controle Financeiro',
    botavisos: 'Configurações do Chatbot',
    configuracoes: 'Ajustes Gerais',
  };

  if (!isAuthenticated) {
    return <Login />;
  }
  
  if (user?.role === 'superadmin' && !impersonatingFrom) {
    return <SuperAdminDashboard />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'painel':
        return <Dashboard />;
      case 'agenda':
        return <Agenda />;
      case 'escala':
        return <Escala />;
      case 'alunos':
        return <Students />;
      case 'instrutores':
        return <Instructors />;
      case 'perfil':
        return <InstructorProfile />;
      case 'sala':
        return <RoomsAndEquipment />;
      case 'financeiro':
        return <Financial />;
      case 'botavisos':
        return <BotAvisos />;
      case 'configuracoes':
        return <Settings />;
      default:
        return (
          <div className="flex items-center justify-center h-[60vh] text-gray-500">
            Módulo {activeTab} em desenvolvimento...
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen text-slate-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden relative bg-slate-50 dark:bg-[#0b0e14]">
      <NeuralNetworkBackground isDarkMode={isDarkMode} />
      
      <Sidebar 
        appName={appName}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />}

      <main ref={mainContentRef} className="flex-1 overflow-y-auto h-screen lg:ml-72 relative custom-scrollbar">
        {impersonatingFrom && (
            <div className="sticky top-0 z-[70] bg-amber-500 text-white py-2 px-4 flex items-center justify-between gap-4 shadow-lg h-9">
                <div className="flex items-center gap-2">
                    <ShieldQuestion size={16} />
                    <p className="text-xs font-bold">
                        Você está personificando <strong>{user?.name}</strong>.
                    </p>
                </div>
                <button onClick={handleStopImpersonating} className="bg-white/20 hover:bg-white/40 text-white font-bold py-1 px-3 rounded-lg text-[10px] uppercase tracking-wider transition-colors flex-shrink-0">
                    Voltar ao Super Admin
                </button>
            </div>
        )}
        <MobileHeader 
          pageTitle={pageTitles[activeTab]} 
          onToggleSidebar={() => setIsSidebarOpen(true)}
          isImpersonating={!!impersonatingFrom}
        />
        <div className="px-4 md:px-8 pb-8">
          {renderContent()}

          <footer className="mt-12 text-center text-xs text-slate-400 dark:text-gray-600 pb-8">
            © 2025 Powered by <a href="https://cod3-ss.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-500 hover:underline">COD3 Software Solution</a>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;