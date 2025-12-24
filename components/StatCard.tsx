import React from 'react';
import { StatCardProps } from '../types';

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, iconBg, iconColor }) => {
  return (
    <div className="bg-white dark:bg-gray-900/40 rounded-2xl p-6 border border-slate-200 dark:border-gray-800 hover:border-sky-500/30 dark:hover:border-sky-500/30 transition-all duration-300 flex flex-col justify-between min-h-[140px] shadow-sm shadow-slate-200/50 dark:shadow-none">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;