import React from 'react';
import { Pencil, Trash2, Users, Phone, FileText } from 'lucide-react';
import { Instructor } from '../types';

interface InstructorCardProps {
  instructor: Instructor;
  onEdit: () => void;
  onDelete: () => void;
}

const InstructorCard: React.FC<InstructorCardProps> = ({ instructor, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-900/40 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 hover:border-sky-500/30 dark:hover:border-sky-500/30 transition-all duration-300 group flex flex-col gap-5 shadow-xl dark:shadow-none">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full ${instructor.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-black/10`}>
            {instructor.initials}
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-slate-800 dark:text-white group-hover:text-sky-500 transition-colors">
              {instructor.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Instrutor(a) • Pilates Flow</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-all">
          <button onClick={onEdit} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md text-gray-400 dark:text-gray-500 hover:text-sky-500 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-rose-500/10 rounded-md text-gray-400 dark:text-gray-500 hover:text-rose-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="h-[1px] bg-slate-100 dark:bg-gray-800 w-full"></div>

      {/* Info Rows */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
            <Users size={16} />
          </div>
          <span className="font-bold text-slate-700 dark:text-gray-300">{instructor.studentsCount} alunos ativos</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <Phone size={16} />
          </div>
          <span className="font-medium text-slate-600 dark:text-gray-300">{instructor.phone}</span>
        </div>

        <div className="flex items-start gap-3 text-xs">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 mt-0.5">
            <FileText size={16} />
          </div>
          <span className="font-medium text-slate-600 dark:text-gray-300 leading-relaxed flex-1">
            {instructor.specialties}
          </span>
        </div>
      </div>
      
      {/* Footer Badge */}
      <div className="mt-2 flex justify-end">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-100 dark:border-gray-800">ID: {instructor.id.slice(0, 4)}</span>
      </div>
    </div>
  );
};

export default InstructorCard;