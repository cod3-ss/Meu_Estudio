import React, { useContext, useState } from 'react';
import { 
  LayoutGrid, 
  Calendar, 
  Layers, 
  Users, 
  GraduationCap, 
  Dumbbell, 
  DollarSign,
  Moon,
  Sun,
  Settings,
  LogOut,
  X,
  LifeBuoy,
  UserCircle,
  ShieldCheck,
  User,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { AppContext } from '../AppContext';

interface SidebarProps {
  appName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ appName, activeTab, setActiveTab, isDarkMode, toggleTheme, isOpen, setIsOpen }) => {
  const { state, dispatch } = useContext(AppContext);
  const { user, instructors, superAdminSettings, passwordJustChanged, subscriptionPlans, settings } = state;
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const currentPlan = subscriptionPlans.find(p => p.id === user?.subscriptionPlanId);
  
  const isFinancialModuleEnabled = !!currentPlan?.features.financialModule || !!settings.courtesyFeatures?.financialModule || !!settings.purchasedAddons?.financialModule;
  const isWhatsappBotEnabled = !!currentPlan?.features.whatsappBot || !!settings.courtesyFeatures?.whatsappBot || !!settings.purchasedAddons?.whatsappBot;
  
  // Busca os dados completos do instrutor logado para pegar a foto
  const currentUserData = !isAdmin ? instructors.find(i => i.id === user?.id) : null;

  // Navegação filtrada por Role (Removido 'perfil' daqui)
  const mainNav = [
    { id: 'painel', label: 'Painel', icon: <LayoutGrid size={20} />, visible: true },
    { id: 'agenda', label: 'Agenda', icon: <Calendar size={20} />, visible: true },
    { id: 'escala', label: 'Escala', icon: <Layers size={20} />, visible: true },
    { id: 'alunos', label: 'Alunos', icon: <Users size={20} />, visible: true },
    { id: 'instrutores', label: 'Instrutores', icon: <GraduationCap size={20} />, visible: isAdmin },
    { id: 'sala', label: 'Sala / Aparelhos', icon: <Dumbbell size={20} />, visible: isAdmin },
    { id: 'financeiro', label: 'Financeiro', icon: <DollarSign size={20} />, visible: isAdmin && isFinancialModuleEnabled },
    { id: 'botavisos', label: 'Bot Avisos', icon: <Bot size={20} />, visible: isAdmin && isWhatsappBotEnabled },
  ].filter(item => item.visible);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <>
      <aside className={`fixed left-0 top-0 h-screen w-72 bg-white dark:bg-[#0d121d] border-r border-slate-200 dark:border-gray-800 flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Brand & User Info */}
        <div className="p-6 mb-4 flex justify-between items-start">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-sky-500">{appName}</h2>
            </div>
            
            {/* SEÇÃO DO USUÁRIO LOGADO COM FOTO */}
            <div className="mt-4 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-gray-800 flex items-center gap-3">
               <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-gray-700 ${isAdmin ? 'bg-sky-500' : (currentUserData?.avatarColor || 'bg-slate-500')}`}>
                  {isAdmin ? (
                    <ShieldCheck size={20} className="text-white" />
                  ) : currentUserData?.image ? (
                    <img src={currentUserData.image} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-xs">{currentUserData?.initials || user?.name?.substring(0,2).toUpperCase()}</span>
                  )}
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-widest font-bold mb-0.5">Logado como:</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-gray-200 truncate">{user?.name}</p>
                  <p className="text-[9px] text-sky-500 font-bold uppercase mt-0.5">{isAdmin ? 'Administrador' : 'Instrutor'}</p>
               </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-rose-500">
            <X size={24} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {mainNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-500 shadow-sm' 
                  : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-gray-200'
              }`}
            >
              <span className={activeTab === item.id ? 'text-sky-600 dark:text-sky-500' : 'text-slate-400 dark:text-gray-400 group-hover:text-slate-600 dark:group-hover:text-gray-200'}>
                {item.icon}
              </span>
              <span className="text-[15px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <nav className="p-3 border-t border-slate-200 dark:border-gray-800 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-gray-200"
          >
            <span>{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</span>
            <span className="text-[15px] font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('configuracoes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeTab === 'configuracoes'
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-500 shadow-sm' 
                  : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-gray-200'
              }`}
            >
              <span><Settings size={20} /></span>
              <span className="text-[15px] font-medium">Configurações</span>
            </button>
          )}

          {!isAdmin && (
            <button 
              onClick={() => setActiveTab('perfil')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeTab === 'perfil'
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-500 shadow-sm' 
                  : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-gray-200'
              }`}
            >
              <span><UserCircle size={20} /></span>
              <span className="text-[15px] font-medium">Meu Perfil</span>
            </button>
          )}
          
          <a
            href={superAdminSettings.supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-gray-200"
          >
            <span><LifeBuoy size={20} /></span>
            <span className="text-[15px] font-medium">Suporte</span>
          </a>

          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-rose-500 hover:bg-rose-500/10"
            title={passwordJustChanged ? "Sua senha foi alterada nesta sessão." : ""}
          >
            <span><LogOut size={20} /></span>
            <span className="text-[15px] font-medium">Sair</span>
            {passwordJustChanged && (
              <AlertTriangle size={16} className="text-amber-400 ml-auto animate-pulse" />
            )}
          </button>
        </nav>
      </aside>
      {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                          <LogOut size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2">Confirmar Saída?</h3>
                      <p className="text-sm text-slate-500 dark:text-gray-400">Tem certeza de que deseja encerrar sua sessão no sistema?</p>
                      {passwordJustChanged && (
                        <div className="mt-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold p-3 rounded-lg flex items-center gap-2 text-left">
                            <AlertTriangle size={24} className="flex-shrink-0" />
                            <span>Lembrete: Sua senha foi alterada nesta sessão. É uma boa prática sair e entrar novamente.</span>
                        </div>
                      )}
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-gray-800/50 flex gap-3">
                      <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors uppercase tracking-widest">Cancelar</button>
                      <button onClick={handleLogout} className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-600/20 uppercase tracking-widest text-xs">Sim, Sair</button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default Sidebar;