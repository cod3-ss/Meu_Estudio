import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../AppContext';
import { Search, List, LayoutGrid, Download, Plus, Pencil, Trash2, X, User, Award, Loader2, ChevronDown, Check, MapPin, Calendar, CreditCard, Info, Camera, Clock, PlusCircle, AlertTriangle, Filter, Layers, Activity, FileText } from 'lucide-react';
import StudentCard from './StudentCard';
import { Student, AgendaItem, Transaction } from '../types';
import * as XLSX from 'xlsx';
import { sendWhatsAppMessage } from '../chatbotUtils'; // Importa a função do chatbot

const Students: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { students: mockStudents, instructors, agenda, user, transactions, settings, impersonatingFrom } = state;

  const isAdmin = user?.role === 'admin';

  const setMockStudents = (updater: (prev: Student[]) => Student[]) => {
      const newStudents = updater(mockStudents);
      dispatch({ type: 'UPDATE_STUDENTS', payload: newStudents });
  };
  
  const setAgenda = (newAgenda: AgendaItem[]) => {
    dispatch({ type: 'UPDATE_AGENDA', payload: newAgenda });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativo' | 'Inativo'>('Todos');
  const [levelFilter, setLevelFilter] = useState<'Todos' | 'Iniciante' | 'Intermediário' | 'Avançado'>('Todos');
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [paymentSuccessId, setPaymentSuccessId] = useState<string | null>(null);
  
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);
  const [isInstructorOpen, setIsInstructorOpen] = useState(false);
  
  const statusRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  const instructorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const instructorsList = useMemo(() => instructors.map(i => i.name), [instructors]);
  const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) setIsStatusOpen(false);
      if (levelRef.current && !levelRef.current.contains(event.target as Node)) setIsLevelOpen(false);
      if (instructorRef.current && !instructorRef.current.contains(event.target as Node)) setIsInstructorOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initialFormState = {
    name: '', phone: '', birthDate: '', cpf: '',
    cep: '', street: '', number: '', neighborhood: '', city: '', state: '', complement: '',
    image: null as string | null,
    regDate: new Date().toISOString().split('T')[0],
    expiryDate: '', 
    planType: '1x na semana', 
    level: 'Iniciante' as any, 
    instructor: !isAdmin ? user?.name || '' : '', 
    schedule: [] as string[],
    observations: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [tempDay, setTempDay] = useState('Segunda');
  const [tempTime, setTempTime] = useState('08:00');

  const maskCPF = (v: string) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  const maskPhone = (v: string) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2");
  const maskCEP = (v: string) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2");

  const handleCEPBlur = async () => {
    const cleaned = formData.cep.replace(/\D/g, "");
    if (cleaned.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({ ...prev, street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }));
        }
      } catch (e) { console.error("Erro ao buscar CEP"); } finally { setIsLoadingCep(false); }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const addSchedule = () => {
    const entry = `${tempDay.substring(0, 3)} - ${tempTime}`;
    if (!formData.schedule.includes(entry)) {
      setFormData(prev => ({ ...prev, schedule: [...prev.schedule, entry] }));
    }
  };

  const removeSchedule = (idx: number) => setFormData(prev => ({ ...prev, schedule: prev.schedule.filter((_, i) => i !== idx) }));

  const handleMarkAsPaid = async (studentId: string) => { // Adicionado 'async' aqui
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return;

    // 1. Atualizar dados do aluno
    setMockStudents(prevStudents => 
        prevStudents.map(s => {
            if (s.id === studentId) {
                const [day, month, year] = s.expiryDate.split('/').map(Number);
                const currentExpiry = new Date(year, month - 1, day);
                currentExpiry.setMonth(currentExpiry.getMonth() + 1);
                const newExpiryDateStr = currentExpiry.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                
                // Recalcula os dias restantes com base na data "congelada" do app
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const newExpiryDate = new Date(currentExpiry);
                newExpiryDate.setHours(0,0,0,0);
                const diffTime = newExpiryDate.getTime() - today.getTime();
                const newDaysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return { ...s, expiryDate: newExpiryDateStr, daysToExpiry: newDaysToExpiry, isExpired: newDaysToExpiry < 0 };
            }
            return s;
        })
    );

    // 2. Criar transação financeira com vínculo
    const frequency = student.planType ? student.planType.split('x')[0] : '1';
    const plan = settings.plans.find(p => p.label.includes(`${frequency} aula`));
    const planValue = plan ? parseFloat(plan.value) : 0;

    if (planValue > 0) {
      const newTransaction: Transaction = {
        id: `TR-${student.id}-${Date.now()}`,
        description: `Mensalidade - ${student.name}`,
        amount: planValue,
        date: new Date().toISOString().split('T')[0], // Data "atual" do app
        type: 'Receita',
        category: 'Mensalidade',
        status: 'Pago',
        studentId: student.id, // Vínculo com o aluno
        sourceType: 'student_payment' // Identifica a origem do pagamento
      };
      dispatch({ type: 'UPDATE_TRANSACTIONS', payload: [newTransaction, ...transactions] });
    }

    // Lógica do Chatbot para confirmação de pagamento
    if (settings.chatbotSettings?.paymentConfirmation.isEnabled) {
      await sendWhatsAppMessage({
        student: student,
        templateKey: 'paymentConfirmation',
        studioSettings: settings,
        agendaItems: agenda,
        allStudents: mockStudents,
      });
    }

    // 3. Feedback visual
    setPaymentSuccessId(studentId);
    setTimeout(() => setPaymentSuccessId(null), 3000);
  };

  const handleSaveStudent = async () => { // Adicionado 'async' aqui
    if (!formData.name || !formData.instructor) return;
    const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const formattedExpiry = formData.expiryDate.split('-').reverse().join('/');
    
    const studentData: Student = {
      id: editingStudentId || `AL-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name, initials, status: 'Ativo', level: formData.level,
      expiryDate: formattedExpiry || '01/01/2026', daysToExpiry: 30, instructor: formData.instructor,
      phone: formData.phone, schedule: formData.schedule, birthDate: formData.birthDate, cpf: formData.cpf,
      regDate: formData.regDate, planType: formData.planType, image: formData.image,
      observations: formData.observations,
      address: { cep: formData.cep, street: formData.street, number: formData.number, neighborhood: formData.neighborhood, city: formData.city, state: formData.state, complement: formData.complement }
    };

    let updatedAgenda = [...agenda];
    if (editingStudentId) {
      const originalStudent = mockStudents.find(s => s.id === editingStudentId);
      if (originalStudent) {
        updatedAgenda = updatedAgenda.filter(item => item.student !== originalStudent.name);
      }
    }
    const dayMap: { [key: string]: number } = { 'Seg': 0, 'Ter': 1, 'Qua': 2, 'Qui': 3, 'Sex': 4, 'Sáb': 5, 'Dom': 6 };
    const colorMap: { [key: string]: 'orange' | 'blue' | 'pink' | 'green' } = { 'Ana Silva': 'pink', 'Bruno Santos': 'blue', 'Carla Dias': 'orange', 'Daniel Oliveira': 'green' };
    const studentInstructor = instructors.find(i => i.name === studentData.instructor);
    if (studentInstructor) {
        const newAgendaItems: AgendaItem[] = studentData.schedule.map((scheduleEntry, index) => {
            const [dayAbbr, time] = scheduleEntry.split(' - ');
            const dayIndex = dayMap[dayAbbr.trim()];
            if (dayIndex === undefined || !time) return null;
            return {
                id: `${studentData.id}-schedule-${Date.now()}-${index}`,
                time: time.trim(), day: dayIndex, student: studentData.name,
                instructor: studentInstructor.name, instructorInitials: studentInstructor.initials,
                color: colorMap[studentInstructor.name] || 'blue'
            };
        }).filter((item): item is AgendaItem => item !== null);
        updatedAgenda.push(...newAgendaItems);
        setAgenda(updatedAgenda);
    }

    if (editingStudentId) {
      setMockStudents(prev => prev.map(s => s.id === editingStudentId ? studentData : s));
    } else {
      setMockStudents(prev => [studentData, ...prev]);
      // Lógica do Chatbot para mensagem de boas-vindas
      if (settings.chatbotSettings?.welcomeMessage.isEnabled) {
        await sendWhatsAppMessage({
          student: studentData,
          templateKey: 'welcomeMessage',
          studioSettings: settings,
          agendaItems: updatedAgenda, // Passa a agenda atualizada para buscar próxima aula
          allStudents: mockStudents,
        });
      }
    }
    setIsModalOpen(false); setEditingStudentId(null); setFormData(initialFormState);
  };

  const handleEdit = (s: Student) => {
    setEditingStudentId(s.id);
    setFormData({
      name: s.name, phone: s.phone, birthDate: s.birthDate || '', cpf: s.cpf || '',
      cep: s.address?.cep || '', street: s.address?.street || '', number: s.address?.number || '',
      neighborhood: s.address?.neighborhood || '', city: s.address?.city || '', state: s.address?.state || '',
      complement: s.address?.complement || '', image: s.image || null,
      regDate: s.regDate || new Date().toISOString().split('T')[0],
      expiryDate: s.expiryDate.split('/').reverse().join('-'),
      planType: s.planType || '1x na semana', level: s.level, instructor: s.instructor, schedule: s.schedule,
      observations: s.observations || ''
    });
    setIsModalOpen(true);
  };
  
  const handleToggleStatus = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return;

    const newStatus = student.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setMockStudents(prev => prev.map(st => st.id === studentId ? { ...st, status: newStatus } : st));
    
    let updatedAgenda = [...agenda];
    if (newStatus === 'Inativo') {
      updatedAgenda = updatedAgenda.filter(item => item.student !== student.name);
    } else {
      const dayMap: { [key: string]: number } = { 'Seg': 0, 'Ter': 1, 'Qua': 2, 'Qui': 3, 'Sex': 4, 'Sáb': 5, 'Dom': 6 };
      const colorMap: { [key: string]: 'orange' | 'blue' | 'pink' | 'green' } = { 'Ana Silva': 'pink', 'Bruno Santos': 'blue', 'Carla Dias': 'orange', 'Daniel Oliveira': 'green' };
      const studentInstructor = instructors.find(i => i.name === student.instructor);
      if (studentInstructor) {
        const newAgendaItems: AgendaItem[] = student.schedule.map((scheduleEntry, index) => {
            const [dayAbbr, time] = scheduleEntry.split(' - ');
            const dayIndex = dayMap[dayAbbr.trim()];
            if (dayIndex === undefined || !time) return null;
            return {
                id: `${student.id}-schedule-${Date.now()}-${index}`,
                time: time.trim(), day: dayIndex, student: student.name,
                instructor: studentInstructor.name, instructorInitials: studentInstructor.initials,
                color: colorMap[studentInstructor.name] || 'blue'
            };
        }).filter((item): item is AgendaItem => item !== null);
        updatedAgenda.push(...newAgendaItems);
      }
    }
    setAgenda(updatedAgenda);
  };

  const handleDeleteClick = (student: Student) => { setStudentToDelete(student); setIsDeleteModalOpen(true); };

  const executeDelete = () => {
    if (studentToDelete) {
      const updatedAgenda = agenda.filter(item => item.student !== studentToDelete.name);
      setAgenda(updatedAgenda);
      setMockStudents(prev => prev.filter(st => st.id !== studentToDelete.id));
      setIsDeleteModalOpen(false); setStudentToDelete(null);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const dataToExport = filteredStudents.map(s => ({ 'ID': s.id, 'Nome': s.name, 'Status': s.status, 'Nível': s.level, 'Vencimento': s.expiryDate, 'Instrutor': s.instructor, 'Telefone': s.phone, 'Horários': s.schedule.join(', ') }));
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Alunos');
      XLSX.writeFile(wb, `Alunos_MeuEstudio_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) { console.error('Erro ao exportar:', error); } finally { setIsExporting(false); }
  };

  const filteredStudents = mockStudents.filter(s => {
    // Regra principal: Instrutor só vê os próprios alunos, a menos que a flag esteja ativa
    if (!isAdmin && !settings.instructorSeesAllStudents && s.instructor !== user?.name) {
        return false;
    }

    const mSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const mStatus = statusFilter === 'Todos' || s.status === statusFilter;
    const mLevel = levelFilter === 'Todos' || s.level === levelFilter;
    const mInstr = selectedInstructor ? s.instructor === selectedInstructor : true;
    return mSearch && mStatus && mLevel && mInstr;
  });

  const FilterDropdown = ({ label, value, icon: Icon, isOpen, setIsOpen, options, onSelect, containerRef }: any) => (
    <div className="relative" ref={containerRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 bg-white dark:bg-gray-900/40 border px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${value !== 'Todos' && value !== null ? 'border-sky-500/50 text-sky-500' : 'border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 hover:text-sky-500'}`}>
        <Icon size={14} className={value !== 'Todos' && value !== null ? 'text-sky-500' : 'text-slate-400 dark:text-gray-500'} />
        <span className="truncate max-w-[100px]">{value || label}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[70] overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt: any) => (
            <button key={opt.value} onClick={() => { onSelect(opt.value); setIsOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold uppercase transition-colors ${(value === opt.value || (opt.value === null && value === 'Todos')) ? 'text-sky-500 bg-sky-500/5' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-sky-500'}`}>
              <span>{opt.label}</span>
              {(value === opt.value || (opt.value === null && value === 'Todos')) && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative pt-8 lg:pt-0">
      <div className={`lg:sticky z-[60] bg-slate-50/80 dark:bg-[#0b0e14]/80 backdrop-blur-sm lg:pt-8 pb-6 flex flex-col gap-6 transition-colors duration-300 ${impersonatingFrom ? 'lg:top-9' : 'lg:top-0'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 dark:text-gray-100 uppercase tracking-tighter">Gestão De Alunos</h1>
            <span className="bg-sky-500/10 text-sky-500 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">{filteredStudents.length} Alunos</span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-slate-500 dark:text-gray-400">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={18} />
              <input type="text" placeholder="Nome ou ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full sm:w-64 bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-gray-300 focus:outline-none focus:border-sky-500/50 shadow-sm transition-colors" />
            </div>

            <FilterDropdown label="Status" value={statusFilter} icon={Activity} isOpen={isStatusOpen} setIsOpen={setIsStatusOpen} containerRef={statusRef} onSelect={setStatusFilter} options={[{ label: 'Todos Status', value: 'Todos' }, { label: 'Alunos Ativos', value: 'Ativo' }, { label: 'Alunos Inativos', value: 'Inativo' }]} />
            <FilterDropdown label="Nível" value={levelFilter} icon={Layers} isOpen={isLevelOpen} setIsOpen={setIsLevelOpen} containerRef={levelRef} onSelect={setLevelFilter} options={[{ label: 'Todos Níveis', value: 'Todos' }, { label: 'Iniciante', value: 'Iniciante' }, { label: 'Intermediário', value: 'Intermediário' }, { label: 'Avançado', value: 'Avançado' }]} />
            {(isAdmin || settings.instructorSeesAllStudents) && (
              <FilterDropdown label="Instrutor" value={selectedInstructor} icon={User} isOpen={isInstructorOpen} setIsOpen={setIsInstructorOpen} containerRef={instructorRef} onSelect={setSelectedInstructor} options={[{ label: 'Todos Instrutores', value: null }, ...instructorsList.map(i => ({ label: i, value: i }))]} />
            )}
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
             <button onClick={handleExport} disabled={isExporting} className="p-2.5 bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-sky-500 transition-all shadow-sm group relative">
              {isExporting ? <Loader2 size={20} className="animate-spin text-sky-500" /> : <Download size={20} />}
            </button>
            <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-2.5 bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-sky-500 transition-all shadow-sm">
              {viewMode === 'grid' ? <List size={20} /> : <LayoutGrid size={20} />}
            </button>
            <button onClick={() => { setEditingStudentId(null); setFormData(initialFormState); setIsModalOpen(true); }} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-sky-600/20 whitespace-nowrap">
              <Plus size={18} /> Novo Aluno
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pb-12 animate-in fade-in duration-500">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map(s => (
              <StudentCard 
                key={s.id} student={s} onEdit={handleEdit} onDelete={handleDeleteClick} 
                onToggleStatus={handleToggleStatus}
                onMarkAsPaid={handleMarkAsPaid} paymentSuccessId={paymentSuccessId}
              />
            ))}
          </div>
        ) : (
           <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-gray-900/20 border-b border-slate-200 dark:border-gray-800 text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">
                <tr><th className="px-6 py-4">Aluno</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Vencimento</th><th className="px-6 py-4">Instrutor</th><th className="px-6 py-4 text-right">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${s.status === 'Ativo' ? 'bg-sky-500' : 'bg-slate-300 dark:bg-gray-700'} flex items-center justify-center text-white font-bold text-[10px] uppercase`}>{s.initials}</div>
                      <div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">{s.name}</span>
                        <p className="text-xs text-slate-400 dark:text-gray-500 font-mono">{s.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${s.status === 'Ativo' ? 'text-emerald-500' : 'text-gray-500'}`}><div className={`w-1.5 h-1.5 rounded-full ${s.status === 'Ativo' ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>{s.status}</div></td>
                    <td className="px-6 py-4"><div className={`text-xs font-medium ${s.isExpired ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-gray-400'}`}>{s.expiryDate}{s.isExpired ? <p className="text-[10px]">Vencido há {Math.abs(s.daysToExpiry)}d</p> : <p className="text-[10px]">Vence em {s.daysToExpiry}d</p>}</div></td>
                    <td className="px-6 py-4 text-xs font-medium text-sky-500">{s.instructor}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(s)} className="p-1.5 text-slate-400 dark:text-gray-500 hover:text-sky-500"><Pencil size={14} /></button>
                        <button onClick={() => handleDeleteClick(s)} className="p-1.5 text-slate-400 dark:text-gray-500 hover:text-rose-500"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-gray-800">
              <div><h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">{editingStudentId ? 'Editar Matrícula' : 'Nova Matrícula'}</h2><p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1">Preencha os dados completos do aluno para gestão do estúdio.</p></div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-rose-500"><X size={20} /></button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className={`w-32 h-32 rounded-full bg-slate-100 dark:bg-gray-800 border-2 border-dashed border-slate-300 dark:border-gray-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-sky-500/60`}>{formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-400 dark:text-gray-600 opacity-40" />}</div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-sky-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"><Camera size={16} /></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nome Completo</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" placeholder="Nome do aluno" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Telefone / WhatsApp</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" placeholder="(00) 00000-0000" maxLength={15} /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Data de Nascimento</label><input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">CPF</label><input value={formData.cpf} onChange={e => setFormData({...formData, cpf: maskCPF(e.target.value)})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" placeholder="000.000.000-00" maxLength={14} /></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><MapPin size={14} /> Endereço Residencial</div>{isLoadingCep && <div className="flex items-center gap-2 text-[10px] text-sky-500 font-bold animate-pulse"><Loader2 size={12} className="animate-spin" /> Buscando...</div>}</div>
                <div className="grid grid-cols-12 gap-x-4 gap-y-5">
                  <div className="col-span-12 md:col-span-3 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">CEP</label><input value={formData.cep} onChange={e => setFormData({...formData, cep: maskCEP(e.target.value)})} onBlur={handleCEPBlur} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" placeholder="00000-000" maxLength={9} /></div>
                  <div className="col-span-12 md:col-span-9 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Rua / Logradouro</label><input value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" placeholder="Ex: Av. das Palmeiras" /></div>

                  <div className="col-span-12 md:col-span-2 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nº</label><input value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" placeholder="123" /></div>
                  <div className="col-span-12 md:col-span-5 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Bairro</label><input value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" /></div>
                  <div className="col-span-12 md:col-span-5 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Complemento</label><input value={formData.complement} onChange={e => setFormData({...formData, complement: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" /></div>
                  
                  <div className="col-span-12 md:col-span-8 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Cidade</label><input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" /></div>
                  <div className="col-span-12 md:col-span-4 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Estado</label><input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-2 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm text-center h-[46px]" maxLength={2} placeholder="SP" /></div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-4"><div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><CreditCard size={14} /> Contrato e Nível</div><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Tipo de Plano</label><select value={formData.planType} onChange={e => setFormData({...formData, planType: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]">{[1,2,3,4,5,6].map(n => <option key={n} value={`${n}x na semana`}>{n}x na semana</option>)}</select></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nível Técnica</label><select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as any})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]"><option value="Iniciante">Iniciante</option><option value="Intermediário">Intermediário</option><option value="Avançado">Avançado</option></select></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Próximo Vencimento</label><input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" /></div><div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Instrutor Responsável</label>
                  <select 
                    value={formData.instructor} 
                    onChange={e => setFormData({...formData, instructor: e.target.value})} 
                    disabled={!isAdmin}
                    className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm disabled:opacity-50 h-[46px]"
                  >
                    <option value="">Selecione...</option>
                    {instructorsList.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div></div></div>
                <div className="space-y-4"><div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><Clock size={14} /> Horários das Aulas</div><div className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 space-y-4"><div className="flex gap-4"><select value={tempDay} onChange={e => setTempDay(e.target.value)} className="flex-1 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 dark:text-gray-300 outline-none focus:border-sky-500 h-[46px]">{weekDays.map(d => <option key={d} value={d}>{d}</option>)}</select><input type="time" value={tempTime} onChange={e => setTempTime(e.target.value)} className="w-24 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 dark:text-gray-300 outline-none focus:border-sky-500 h-[46px]" /><button onClick={addSchedule} className="w-10 h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-xl flex items-center justify-center transition-colors h-[46px]"><PlusCircle size={20} /></button></div><div className="flex flex-wrap gap-2">{formData.schedule.length === 0 ? <p className="text-[10px] text-slate-500 dark:text-gray-400 italic py-2">Nenhum horário definido...</p> : formData.schedule.map((entry, idx) => (<div key={idx} className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-bold text-sky-500 flex items-center gap-2">{entry}<button onClick={() => removeSchedule(idx)} className="text-slate-400 dark:text-gray-400 hover:text-rose-500"><X size={12} /></button></div>))}</div></div></div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest">
                  <FileText size={14} /> Observações
                </div>
                <div className="space-y-1.5">
                  <textarea
                    value={formData.observations}
                    onChange={e => setFormData({ ...formData, observations: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                    placeholder="Adicione observações importantes sobre o aluno, como lesões, limitações ou objetivos específicos..."
                  />
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 dark:border-gray-800 flex justify-end gap-3 bg-white dark:bg-gray-900 rounded-b-3xl">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 uppercase tracking-widest h-[46px]">Cancelar</button>
              <button onClick={handleSaveStudent} className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-600/20 uppercase tracking-widest text-xs h-[46px]">{editingStudentId ? 'Atualizar Aluno' : 'Finalizar Matrícula'}</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 text-center"><div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div><h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2">Remover Aluno?</h3><p className="text-sm text-slate-500 dark:text-gray-400">Esta ação é irreversível e removerá permanentemente o cadastro de <span className="font-bold text-slate-700 dark:text-gray-200">{studentToDelete?.name}</span>.</p></div>
            <div className="p-6 bg-slate-50 dark:bg-gray-800/50 flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 uppercase tracking-widest">Cancelar</button>
              <button onClick={executeDelete} className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 uppercase tracking-widest text-xs">Sim, Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// FIX: Changed export from InstructorProfile to Instructors
export default Students;