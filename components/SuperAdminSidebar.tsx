import React, { useState } from 'react';
import { Users2, Settings, LogOut, X } from 'lucide-react';

interface SuperAdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const mainNav = [
    { id: 'clients', label: 'Clientes', icon: <Users2 size={20} /> },
    { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false); // Fecha a sidebar na navegação em mobile
  };

  return (
    <>
      <aside className={`fixed left-0 top-0 h-screen w-72 bg-white dark:bg-[#0d121d] border-r border-slate-200 dark:border-gray-800 flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 mb-4 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">SA</div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">Super Admin</h1>
              <p className="text-[10px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-widest">Painel SaaS</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-rose-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {mainNav.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
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

        <div className="p-3 border-t border-slate-200 dark:border-gray-800">
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-rose-500 hover:bg-rose-500/10"
          >
            <span><LogOut size={20} /></span>
            <span className="text-[15px] font-medium">Sair</span>
          </button>
        </div>
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
                </div>
                <div className="p-6 bg-slate-50 dark:bg-gray-800/50 flex gap-3">
                    <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors uppercase tracking-widest">Cancelar</button>
                    <button onClick={onLogout} className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-600/20 uppercase tracking-widest text-xs">Sim, Sair</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default SuperAdminSidebar;