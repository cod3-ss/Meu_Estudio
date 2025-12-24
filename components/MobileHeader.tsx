import React from 'react';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  pageTitle: string;
  onToggleSidebar: () => void;
  isImpersonating: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ pageTitle, onToggleSidebar, isImpersonating }) => {
  return (
    <div className={`sticky z-30 flex items-center justify-between p-4 bg-slate-50/80 dark:bg-[#0b0e14]/80 backdrop-blur-sm border-b border-slate-200 dark:border-gray-800 lg:hidden ${isImpersonating ? 'top-9' : 'top-0'}`}>
      <button 
        onClick={onToggleSidebar} 
        className="p-2 text-slate-500 dark:text-gray-400"
        aria-label="Abrir menu"
      >
        <Menu size={24} />
      </button>
      <h1 className="text-sm font-bold text-slate-800 dark:text-gray-100 uppercase tracking-wider">
        {pageTitle}
      </h1>
      <div className="w-10"></div> {/* Placeholder for alignment */}
    </div>
  );
};

export default MobileHeader;