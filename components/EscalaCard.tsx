import React from 'react';
import { EscalaItem } from '../types';
import { Pencil, Trash2, Box } from 'lucide-react';

interface EscalaCardProps {
  item: EscalaItem;
  onEdit: (item: EscalaItem) => void;
  onDelete: (item: EscalaItem) => void;
}

const EscalaCard: React.FC<EscalaCardProps> = ({ item, onEdit, onDelete }) => {
  const colorMap = {
    orange: { bg: 'bg-orange-500' },
    blue: { bg: 'bg-blue-600' },
    pink: { bg: 'bg-rose-500' },
    green: { bg: 'bg-emerald-500' },
  };

  const theme = colorMap[item.color];

  return (
    <div className="bg-white dark:bg-gray-900/30 rounded-lg overflow-hidden border border-slate-200 dark:border-gray-800 shadow-md shadow-slate-200/50 dark:shadow-none mb-1 h-full flex flex-col group transition-all duration-300 hover:border-sky-500/30">
      {/* Header com Instrutor */}
      <div className={`${theme.bg} px-2 py-1 flex items-center gap-1.5`}>
        <div className="w-5 h-5 rounded flex items-center justify-center bg-black/20 text-[10px] font-bold text-white">
          {item.instructorInitials}
        </div>
        <span className="text-[11px] font-bold text-white truncate">{item.instructor}</span>
      </div>
      
      {/* Body com Aparelho */}
      <div className="p-2 flex flex-col justify-center gap-1 bg-white dark:bg-transparent flex-1">
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
                <Box size={12} className="text-slate-500 dark:text-gray-400 flex-shrink-0" />
                <span className="text-[11px] text-slate-700 dark:text-gray-300 font-medium truncate" title={item.equipment}>{item.equipment}</span>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(item)} className="p-1 text-slate-400 dark:text-gray-500 hover:text-sky-500"><Pencil size={12} /></button>
                <button onClick={() => onDelete(item)} className="p-1 text-slate-400 dark:text-gray-500 hover:text-rose-500"><Trash2 size={12} /></button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EscalaCard;
