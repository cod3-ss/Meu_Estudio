import React from 'react';
import { Pencil, Trash2, Box, Home } from 'lucide-react';
import { Equipment } from '../types';

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-900/40 rounded-2xl border border-slate-200 dark:border-gray-800 hover:border-sky-500/30 dark:hover:border-sky-500/30 transition-all duration-300 group flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-gray-400 flex-shrink-0">
              <Box size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-gray-200">{equipment.name}</h4>
          </div>
          <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={() => onEdit(equipment)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md text-gray-400 dark:text-gray-500 hover:text-sky-500">
              <Pencil size={14} />
            </button>
            <button onClick={() => onDelete(equipment)} className="p-1.5 hover:bg-rose-500/10 rounded-md text-gray-400 dark:text-gray-500 hover:text-rose-500">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-4 pt-2 mt-2 border-t border-slate-100 dark:border-gray-800/50 flex flex-wrap gap-2">
        <span className="text-[10px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 px-2 py-0.5 rounded font-bold border border-slate-200 dark:border-gray-700">
          {equipment.type}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] bg-sky-500/10 text-sky-500 px-2 py-0.5 rounded font-bold border border-sky-500/20">
          <Home size={12} />
          {equipment.roomName}
        </span>
      </div>
    </div>
  );
};

export default EquipmentCard;