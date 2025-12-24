import React from 'react';
import { Pencil, Trash2, Calendar, User, Phone, CheckCircle } from 'lucide-react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onToggleStatus: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  paymentSuccessId: string | null;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onEdit, onDelete, onToggleStatus, onMarkAsPaid, paymentSuccessId }) => {
  const levelStyles = {
    'Iniciante': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'Intermediário': 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    'Avançado': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  return (
    <div className={`bg-white dark:bg-gray-900/40 rounded-2xl border ${student.status === 'Inativo' ? 'border-slate-200/80 dark:border-gray-800/80 opacity-75' : 'border-slate-200 dark:border-gray-800'} p-5 hover:border-sky-500/30 dark:hover:border-sky-500/30 transition-all duration-300 group flex flex-col gap-4 shadow-xl shadow-slate-200/50 dark:shadow-none`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-12 h-12 rounded-full ${student.status === 'Inativo' ? 'bg-slate-300 dark:bg-gray-700' : 'bg-sky-500'} flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-lg ${student.status === 'Inativo' ? 'shadow-slate-500/10' : 'shadow-sky-500/20'} uppercase`}>
            {student.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-gray-100 truncate" title={student.name}>
              {student.name}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button 
            onClick={() => onEdit(student)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md text-gray-400 dark:text-gray-500 hover:text-sky-500 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => onDelete(student)}
            className="p-1.5 hover:bg-rose-500/10 rounded-md text-gray-400 dark:text-gray-500 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Badges Section - Compactada */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 ml-1">
            <div className={`w-1.5 h-1.5 rounded-full ${student.status === 'Ativo' ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${student.status === 'Ativo' ? 'text-emerald-500' : 'text-gray-500'}`}>
              {student.status}
            </span>
          </div>
          <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-gray-700 font-mono">
            {student.id}
          </span>
        </div>
        <div>
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border inline-block ${levelStyles[student.level] || levelStyles['Iniciante']}`}>
            <span className="mr-1">📊</span> {student.level || 'Iniciante'}
          </span>
        </div>
      </div>

      {/* Info Rows */}
      <div className="space-y-3 py-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
          <Calendar size={14} className={student.isExpired ? 'text-rose-500' : 'text-gray-500'} />
          <span className="truncate">Vencimento: <span className="text-slate-700 dark:text-gray-300 font-medium">{student.expiryDate}</span> 
            <span className={student.isExpired ? 'text-rose-500 ml-1 font-bold' : student.daysToExpiry === 0 ? 'text-amber-500 ml-1 font-bold' : 'text-gray-500 ml-1'}>
              ({student.isExpired 
                ? `Vencido há ${Math.abs(student.daysToExpiry)} dia(s)` 
                : (student.daysToExpiry === 0 ? 'Vence hoje' : `Vence em ${student.daysToExpiry} dia(s)`)})
            </span>
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Calendar size={14} className="text-gray-500 dark:text-gray-400 mr-0.5 flex-shrink-0" />
          {student.schedule.map((item, idx) => (
            <span key={idx} className="bg-slate-100 dark:bg-white/5 text-[10px] text-slate-600 dark:text-gray-300 font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-gray-700 whitespace-nowrap">
              {item}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
          <User size={14} className="text-sky-500 flex-shrink-0" />
          <span className="text-sky-500 font-medium truncate">{student.instructor}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
          <Phone size={14} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <span>{student.phone}</span>
        </div>
      </div>

      {/* Action Footer - Limpo */}
      <div className="pt-4 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between mt-auto">
        {student.status === 'Ativo' ? (
            paymentSuccessId === student.id ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold animate-pulse">
                    <CheckCircle size={14} />
                    Pagamento Confirmado!
                </div>
            ) : (
                <button onClick={() => onMarkAsPaid(student.id)} className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold hover:text-emerald-400 transition-colors">
                    <CheckCircle size={14} />
                    Marcar como Pago
                </button>
            )
        ) : <div />} {/* Placeholder to keep alignment */}
        
        <button 
          onClick={() => onToggleStatus(student.id)}
          className={`text-xs font-bold transition-colors ${student.status === 'Ativo' ? 'text-sky-500 hover:text-sky-400' : 'text-emerald-500 hover:text-emerald-400'}`}
        >
          {student.status === 'Ativo' ? 'Desativar Aluno' : 'Ativar Aluno'}
        </button>
      </div>
    </div>
  );
};

export default StudentCard;