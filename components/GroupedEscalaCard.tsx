import React from 'react';
import { EscalaItem } from '../types';
import { Pencil, Trash2, Box } from 'lucide-react';

interface GroupedEscalaCardProps {
  items: EscalaItem[];
  onEdit: (item: EscalaItem) => void;
  onDelete: (item: EscalaItem) => void;
}

const GroupedEscalaCard: React.FC<GroupedEscalaCardProps> = ({ items, onEdit, onDelete }) => {
  if (!items || items.length === 0) {
    return null;
  }

  const firstItem = items[0];
  const { instructor, instructorInitials, color } = firstItem;

  const colorMap = {
    orange: { bg: 'bg-orange-500' },
    blue: { bg: 'bg-blue-600' },
    pink: { bg: 'bg-rose-500' },
    green: { bg: 'bg-emerald-500' },
  };

  const theme = colorMap[color];

  return (
    <div className="bg-white dark:bg-gray-900/30 rounded-lg overflow-hidden border border-slate-200 dark:border-gray-800 shadow-md shadow-slate-200/50 dark:shadow-none mb-1 flex flex-col transition-all duration-300 hover:border-sky-500/30">
      {/* Header com Instrutor */}
      <div className={`${theme.bg} px-2 py-1 flex items-center gap-1.5`}>
        <div className="w-5 h-5 rounded flex items-center justify-center bg-black/20 text-[10px] font-bold text-white">
          {instructorInitials}
        </div>
        <span className="text-[11px] font-bold text-white truncate">{instructor}</span>
      </div>
      
      {/* Body com Aparelhos */}
      <div className="p-2 flex flex-col justify-start bg-white dark:bg-transparent">
        <div className="space-y-1">
          {items.map(item => (
            <div key={item.id} className="relative rounded-md -mx-1 px-1 py-0.5 hover:bg-slate-50 dark:hover:bg-white/5">
              <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                      <Box size={12} className={`text-slate-500 dark:text-gray-400 flex-shrink-0`} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] text-slate-700 dark:text-gray-300 font-medium truncate" title={item.equipment}>
                            {item.equipment}
                        </span>
                         <span className="text-[9px] text-slate-400 dark:text-gray-500 font-semibold truncate" title={item.roomName}>
                            {item.roomName}
                        </span>
                      </div>
                  </div>
                  <div className="flex items-center gap-0.5 transition-opacity">
                      <button onClick={() => onEdit(item)} title="Editar Alocação" className="p-1 text-slate-400 dark:text-gray-500 hover:text-sky-500"><Pencil size={12} /></button>
                      <button onClick={() => onDelete(item)} title="Remover Alocação" className="p-1 text-slate-400 dark:text-gray-500 hover:text-rose-500"><Trash2 size={12} /></button>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupedEscalaCard;