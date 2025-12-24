import React from 'react';
import { AgendaItem } from '../types';
import { History, Trash2, Box } from 'lucide-react';

interface GroupedAgendaCardProps {
  items: AgendaItem[];
  onEdit: (item: AgendaItem) => void;
  onDelete: (item: AgendaItem) => void;
}

const GroupedAgendaCard: React.FC<GroupedAgendaCardProps> = ({ items, onEdit, onDelete }) => {
  if (!items || items.length === 0) {
    return null;
  }

  const firstItem = items[0];
  const { instructor, instructorInitials, color } = firstItem;

  const colorMap = {
    orange: { bg: 'bg-orange-500', dot: 'bg-indigo-500' },
    blue: { bg: 'bg-blue-600', dot: 'bg-sky-500' },
    pink: { bg: 'bg-rose-500', dot: 'bg-emerald-500' },
    green: { bg: 'bg-emerald-500', dot: 'bg-indigo-500' },
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
      
      {/* Body com Aparelho e Alunos */}
      <div className="p-2 flex flex-col justify-start bg-white dark:bg-transparent">
        {firstItem.equipment && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 mb-2 px-1 border-b border-slate-100 dark:border-gray-800 pb-1.5">
            <Box size={12} className="flex-shrink-0 text-sky-500" />
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-slate-600 dark:text-gray-300 truncate" title={firstItem.equipment}>
                    {firstItem.equipment}
                </span>
                {firstItem.roomName && (
                    <span className="text-[9px] font-medium text-slate-400 dark:text-gray-500 truncate" title={firstItem.roomName}>
                        {firstItem.roomName}
                    </span>
                )}
            </div>
          </div>
        )}
        <div className="space-y-1">
          {items.map(item => (
            <div key={item.id} className="relative rounded-md -mx-1 px-1 py-0.5 hover:bg-slate-50 dark:hover:bg-white/5">
              <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${theme.dot} flex-shrink-0`}></div>
                      
                      {item.status === 'rescheduled_source' ? (
                        <span className="text-[11px] text-rose-500/90 dark:text-rose-500/80 font-medium truncate line-through" title={`${item.student} (Aula remarcada)`}>
                            {item.student}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 min-w-0">
                           {item.status === 'rescheduled_target' && <span title="Aula de reposição"><History size={10} className="text-sky-500 flex-shrink-0" /></span>}
                           <span className="text-[11px] text-slate-700 dark:text-gray-300 font-medium truncate" title={item.student}>
                               {item.student}
                           </span>
                        </div>
                      )}
                  </div>
                  <div className="flex items-center gap-0.5 transition-opacity">
                      {/* Botão "Repor": visível para qualquer aula que não seja a "origem" de uma reposição. */}
                      {item.status !== 'rescheduled_source' && (
                          <button onClick={() => onEdit(item)} title="Repor / Remarcar Aula" className="p-1 text-slate-400 dark:text-gray-500 hover:text-sky-500"><History size={12} /></button>
                      )}
                      {/* Botão "Remover": visível APENAS para aulas de reposição. */}
                      {item.status === 'rescheduled_target' && (
                          <button onClick={() => onDelete(item)} title="Remover Aula de Reposição" className="p-1 text-slate-400 dark:text-gray-500 hover:text-rose-500"><Trash2 size={12} /></button>
                      )}
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupedAgendaCard;