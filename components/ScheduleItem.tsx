import React from 'react';
import { User } from 'lucide-react';
import { ClassItem } from '../types';

interface ScheduleItemProps {
  item: ClassItem;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({ item }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-700 dark:text-gray-300">{item.time}</span>
        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-gray-800"></div>
      </div>
      
      <div className="bg-slate-50 dark:bg-gray-900/40 rounded-xl p-4 border border-slate-200 dark:border-gray-800 flex items-center justify-between group hover:border-sky-500/30 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center text-slate-400">
            <User size={18} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-gray-200 group-hover:text-sky-600 dark:group-hover:text-sky-500 transition-colors">{item.student}</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">{item.instructor}</p>
          </div>
        </div>
        
        <button className="px-3 py-1.5 rounded-lg border border-sky-500/20 text-[11px] font-semibold text-sky-600 dark:text-sky-500 hover:bg-sky-500 hover:text-white transition-all duration-300">
          Remarcar
        </button>
      </div>
    </div>
  );
};

export default ScheduleItem;