
import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Search, List, LayoutGrid, Download, Plus, Pencil, Trash2, X, User, Award, Loader2, ChevronDown, Check, Phone, FileText, Camera, CreditCard, Info, AlertTriangle, MapPin, Calendar, Clock, Timer, Lock, KeySquare, RefreshCw, Eye, EyeOff, CheckCircle, Copy, Link } from 'lucide-react';
import InstructorCard from './InstructorCard';
import { Instructor, Student } from '../types';
import * as XLSX from 'xlsx';

const Instructors: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { instructors: mockInstructors, students: mockStudentsData, settings, impersonatingFrom } = state;

  const setMockInstructors = (updater: (prev: Instructor[]) => Instructor[]) => {
      const newInstructors = updater(mockInstructors);
      dispatch({ type: 'UPDATE_INSTRUCTORS', payload: newInstructors });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState<Instructor | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [editingInstructorId, setEditingInstructorId] = useState<string | null>(null);
  const [cpfError, setCpfError] = useState(false);
  
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);

  // Estados para modais de senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [generatedPasswordInfo, setGeneratedPasswordInfo] = useState<{ name: string; cpf: string; pass: string } | null>(null);
  const [credentialsCopySuccess, setCredentialsCopySuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const weekDays = [
    { label: 'Segunda', value: 'Seg' },
    { label: 'Terça', value: 'Ter' },
    { label: 'Quarta', value: 'Qua' },
    { label: 'Quinta', value: 'Qui' },
    { label: 'Sexta', value: 'Sex' },
    { label: 'Sábado', value: 'Sáb' },
    { label: 'Domingo', value: 'Dom' }
  ];
  
  const initialFormState = {
    name: '', phone: '', birthDate: '', cpf: '', regDate: new Date().toISOString().split('T')[0],
    cep: '', street: '', number: '', neighborhood: '', city: '', state: '', complement: '',
    specialties: '', avatarColor: 'bg-sky-500', image: null as string | null,
    workingDays: [] as string[], workStart: '07:00', workEnd: '21:00', classDuration: 50, password: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  
  const generateRandomPassword = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const calculateEarnings = (instructorName: string | null) => {
    if (!instructorName) { setEstimatedEarnings(0); return; }
    const instructorStudents = mockStudentsData.filter(student => student.instructor === instructorName && student.status === 'Ativo');
    let totalRevenue = 0;
    instructorStudents.forEach(student => {
        if (student.planType) {
            const frequency = student.planType.split('x')[0];
            const plan = settings.plans.find(p => p.label.includes(`${frequency} aula`));
            if (plan && plan.value) { totalRevenue += parseFloat(plan.value); }
        }
    });
    const commissionRate = parseFloat(settings.commission) / 100;
    setEstimatedEarnings(totalRevenue * commissionRate);
  };

  const openNewInstructorModal = () => {
    setEditingInstructorId(null); setFormData(initialFormState); calculateEarnings(null); setIsModalOpen(true);
  };

  const openEditInstructorModal = (instructor: Instructor) => {
    setEditingInstructorId(instructor.id);
    setFormData({
      name: instructor.name, phone: instructor.phone, specialties: instructor.specialties, avatarColor: instructor.avatarColor,
      workingDays: instructor.workingDays || [], workStart: instructor.workStart || '07:00', workEnd: instructor.workEnd || '21:00',
      classDuration: instructor.classDuration || 50, birthDate: instructor.birthDate || '', cpf: instructor.cpf || '',
      regDate: instructor.regDate || new Date().toISOString().split('T')[0], cep: instructor.address?.cep || '', street: instructor.address?.street || '',
      number: instructor.address?.number || '', neighborhood: instructor.address?.neighborhood || '', city: instructor.address?.city || '',
      state: instructor.address?.state || '', complement: instructor.address?.complement || '', image: instructor.image || null, password: instructor.password || ''
    });
    calculateEarnings(instructor.name); setIsModalOpen(true);
  };

  const validateCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, ''); if (cleaned.length !== 11) return false; if (/^(\d)\1+$/.test(cleaned)) return false; let sum = 0; let remainder;
    for (let i = 1; i <= 9; i++) sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i); remainder = (sum * 10) % 11; if ((remainder === 10) || (remainder === 11)) remainder = 0; if (remainder !== parseInt(cleaned.substring(9, 10))) return false; sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i); remainder = (sum * 10) % 11; if ((remainder === 10) || (remainder === 11)) remainder = 0; if (remainder !== parseInt(cleaned.substring(10, 11))) return false; return true;
  };

  const maskPhone = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  const maskCPF = (v: string) => { const masked = v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1'); const cleaned = v.replace(/\D/g, ''); if (cleaned.length === 11) setCpfError(!validateCPF(cleaned)); else setCpfError(false); return masked; };
  const maskCEP = (v: string) => { const cleaned = v.replace(/\D/g, ''); if (cleaned.length === 8) handleFetchAddress(cleaned); return cleaned.replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1'); };

  const handleFetchAddress = async (cep: string) => {
    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`); const data = await response.json();
      if (!data.erro) { setFormData(prev => ({ ...prev, street: data.logradouro || '', neighborhood: data.bairro || '', city: data.localidade || '', state: data.uf || '' })); }
    } catch (error) { console.error("Erro ao buscar CEP:", error); } finally { setIsLoadingCep(false); }
  };

  const instructorsWithDynamicCount = useMemo(() => mockInstructors.map(i => ({...i, studentsCount: mockStudentsData.filter(s => s.instructor === i.name && s.status === 'Ativo').length})), [mockInstructors, mockStudentsData]);

  const colorOptions = [ { name: 'Rose', class: 'bg-rose-600' }, { name: 'Azul', class: 'bg-blue-600' }, { name: 'Laranja', class: 'bg-orange-500' }, { name: 'Verde', class: 'bg-emerald-600' }, { name: 'Céu', class: 'bg-sky-500' }, { name: 'Roxo', class: 'bg-purple-600' }, { name: 'Âmbar', class: 'bg-amber-500' }, { name: 'Slate', class: 'bg-slate-600' }];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setFormData({ ...formData, image: reader.result as string }); reader.readAsDataURL(file); } };
  const toggleDay = (day: string) => { setFormData(prev => ({...prev, workingDays: prev.workingDays.includes(day) ? prev.workingDays.filter(d => d !== day) : [...prev.workingDays, day]})); };

  const handleExport = () => { setIsExporting(true); try { const data = filteredInstructors.map(i => ({ 'Nome': i.name, 'Especialidades': i.specialties, 'WhatsApp': i.phone, 'Alunos Ativos': i.studentsCount, 'Dias de Trabalho': i.workingDays?.join(', ') || 'N/A', 'Expediente': `${i.workStart} - ${i.workEnd}` })); const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Instrutores'); XLSX.writeFile(wb, `Instrutores_${new Date().toISOString().split('T')[0]}.xlsx`); } catch (e) { console.error(e); } finally { setIsExporting(false); } };
  
  const handlePasswordUpdate = (instructorId: string, newPasswordValue: string) => {
    setMockInstructors(prev => prev.map(i => i.id === instructorId ? { ...i, password: newPasswordValue } : i));
    if (editingInstructorId === instructorId) { setFormData(prev => ({...prev, password: newPasswordValue})); }
  };
  
  const handleGenerateRandomPasswordForEdit = () => { if (!editingInstructorId) return; const newPass = generateRandomPassword(); handlePasswordUpdate(editingInstructorId, newPass); };
  
  const closePasswordModal = () => { setIsPasswordModalOpen(false); setNewPassword(''); setConfirmPassword(''); setPasswordError(null); };
  
  const handleManualPasswordChange = () => {
    if (!editingInstructorId) return;
    if (!newPassword || !confirmPassword) { setPasswordError('Por favor, preencha ambos os campos.'); return; }
    if (newPassword.length < 8) { setPasswordError('A senha deve ter no mínimo 8 caracteres.'); return; }
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) { setPasswordError('A senha deve conter letras e números.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('As senhas não coincidem.'); return; }
    handlePasswordUpdate(editingInstructorId, newPassword);
    closePasswordModal();
  };
  
  const handleSaveInstructor = () => {
    if (!formData.name || cpfError) return; const initials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const instructorData = {
      name: formData.name, initials, phone: formData.phone, specialties: formData.specialties, avatarColor: formData.avatarColor,
      workingDays: formData.workingDays, workStart: formData.workStart, workEnd: formData.workEnd, classDuration: formData.classDuration,
      cpf: formData.cpf, birthDate: formData.birthDate, regDate: formData.regDate, image: formData.image,
      address: { cep: formData.cep, street: formData.street, number: formData.number, neighborhood: formData.neighborhood, city: formData.city, state: formData.state, complement: formData.complement }
    };

    if (editingInstructorId) { setMockInstructors(prev => prev.map(i => i.id === editingInstructorId ? { ...i, ...instructorData, password: formData.password } : i));
    } else { const newPassword = generateRandomPassword(); const newInstructor: Instructor = { id: Math.random().toString(36).substring(2, 9), studentsCount: 0, ...instructorData, password: newPassword }; setMockInstructors(prev => [newInstructor, ...prev]); setGeneratedPasswordInfo({ name: newInstructor.name, cpf: newInstructor.cpf || 'N/A', pass: newPassword }); }
    
    setIsModalOpen(false); setEditingInstructorId(null); setFormData(initialFormState); setCpfError(false);
  };
  
  const handleDeleteClick = (i: Instructor) => { setInstructorToDelete(i); setIsDeleteModalOpen(true); };
  const executeDelete = () => { if (instructorToDelete) { setMockInstructors(prev => prev.filter(i => i.id !== instructorToDelete.id)); setIsDeleteModalOpen(false); setInstructorToDelete(null); } };

  const handleCopyCredentials = () => {
    if (!generatedPasswordInfo) return;
    const accessLink = "https://pilates-studio-test.vercel.app/";
    // FIX: Declare textToCopy with const to fix compilation errors
    const textToCopy = `Olá ${generatedPasswordInfo.name}!\n\nSeu acesso à plataforma Meu Estúdio foi liberado.\n\nLink de Acesso: ${accessLink}\nLogin (CPF): ${generatedPasswordInfo.cpf}\nSenha: ${generatedPasswordInfo.pass}\n\nRecomendamos alterar a senha no primeiro acesso.`;
    navigator.clipboard.writeText(textToCopy).then(() => { setCredentialsCopySuccess(true); setTimeout(() => setCredentialsCopySuccess(false), 2000); });
  };
  
  const filteredInstructors = instructorsWithDynamicCount.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.specialties.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="relative pt-8 lg:pt-0">
      <div className={`lg:sticky z-[60] bg-slate-50/80 dark:bg-[#0b0e14]/80 backdrop-blur-sm lg:pt-8 pb-6 flex flex-col gap-6 transition-colors duration-300 ${impersonatingFrom ? 'lg:top-9' : 'lg:top-0'}`}>
        <div className="flex justify-between items-center"><div className="flex items-center gap-3"><h1 className="text-xl font-bold text-slate-800 dark:text-gray-100 uppercase tracking-tighter">Corpo Docente</h1><span className="bg-sky-500/10 text-sky-500 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">{filteredInstructors.length} Instrutores</span></div><span className="hidden sm:block text-sm font-medium text-slate-500 dark:text-gray-400">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={18} /><input type="text" placeholder="Pesquisar por nome ou especialidade..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-gray-300 focus:outline-none focus:border-sky-500/50 transition-colors shadow-sm" /></div>
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <button onClick={handleExport} disabled={isExporting} className="p-2.5 bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-sky-500 transition-all shadow-sm group relative">{isExporting ? <Loader2 size={20} className="animate-spin text-sky-500" /> : <Download size={20} />}</button>
            <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-2.5 bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-sky-500 transition-all shadow-sm">{viewMode === 'grid' ? <List size={20} /> : <LayoutGrid size={20} />}</button>
            <button onClick={openNewInstructorModal} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-sky-600/20 whitespace-nowrap"><Plus size={18} /> Novo Instrutor</button>
          </div>
        </div>
      </div>

      <div className="mt-4 pb-12">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto animate-in fade-in duration-500">{filteredInstructors.map(i => (<InstructorCard key={i.id} instructor={i} onEdit={() => openEditInstructorModal(i)} onDelete={() => handleDeleteClick(i)} />))}</div>
        ) : (
          <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-2xl"><table className="w-full text-left"><thead><tr className="bg-slate-50 dark:bg-gray-900/20 border-b border-slate-200 dark:border-gray-800 text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest"><th className="px-6 py-4">Instrutor</th><th className="px-6 py-4">Especialidade</th><th className="px-6 py-4 text-center">Alunos</th><th className="px-6 py-4">Expediente</th><th className="px-6 py-4 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-gray-800">{filteredInstructors.map(i => (<tr key={i.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5"><td className="px-6 py-4 flex items-center gap-3"><div className={`w-8 h-8 rounded-full ${i.avatarColor} flex items-center justify-center text-white font-bold text-[10px]`}>{i.initials}</div><span className="text-sm font-semibold text-slate-700 dark:text-gray-200">{i.name}</span></td><td className="px-6 py-4 text-xs text-slate-500 dark:text-gray-400 max-w-[200px] truncate">{i.specialties}</td><td className="px-6 py-4 text-center"><span className="bg-sky-500/10 text-sky-500 px-2 py-0.5 rounded-full text-[10px] font-bold">{i.studentsCount}</span></td><td className="px-6 py-4 text-xs text-slate-500 dark:text-gray-400">{i.workingDays && i.workingDays.length > 0 ? `${i.workingDays.join(', ')} • ${i.workStart}-${i.workEnd}` : 'Não definido'}</td><td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEditInstructorModal(i)} className="p-1.5 text-slate-400 dark:text-gray-500 hover:text-sky-500 transition-colors"><Pencil size={14} /></button><button onClick={() => handleDeleteClick(i)} className="p-1.5 text-slate-400 dark:text-gray-500 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button></div></td></tr>))}</tbody></table></div>
        )}
      </div>

      {isDeleteModalOpen && (<div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"><div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"><div className="p-8 text-center"><div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div><h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2">Remover Instrutor?</h3><p className="text-sm text-slate-500 dark:text-gray-400">Você está prestes a remover o acesso de <span className="font-bold text-slate-700 dark:text-gray-200">{instructorToDelete?.name}</span>.</p></div><div className="p-6 bg-slate-50 dark:bg-gray-800/50 flex gap-3"><button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors uppercase tracking-widest">Cancelar</button><button onClick={executeDelete} className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-600/20 uppercase tracking-widest text-xs">Sim, Remover</button></div></div></div>)}

      {isModalOpen && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"><div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]"><div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-gray-800"><div><h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">{editingInstructorId ? 'Editar Instrutor' : 'Novo Instrutor'}</h2><p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1">Gestão de corpo docente e comissões.</p></div><button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-rose-500 transition-colors"><X size={20} /></button></div><div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
        {/* Bloco de Dados Pessoais */}
        <div className="space-y-4"><div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><Info size={14} /> Dados Pessoais</div><div className="flex flex-col md:flex-row items-center gap-8"><div className="relative group"><div className={`w-32 h-32 rounded-full ${formData.avatarColor} border-2 border-white dark:border-gray-800 shadow-xl flex items-center justify-center overflow-hidden`}>{formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <User size={40} className="text-white opacity-40" />}</div><button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-sky-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"><Camera size={16} /></button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} /></div><div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-end"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nome Completo</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 h-[46px]" /></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Telefone / WhatsApp</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" maxLength={15} /></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Data de Nascimento</label><input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]" /></div><div className="space-y-1.5"><div className="flex justify-between items-center ml-1"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase">CPF</label>{cpfError && <span className="text-[9px] font-bold text-rose-500 animate-pulse">INVÁLIDO</span>}</div><input value={formData.cpf} onChange={e => setFormData({...formData, cpf: maskCPF(e.target.value)})} className={`w-full bg-slate-50 dark:bg-gray-800 border ${cpfError ? 'border-rose-500':'border-slate-200 dark:border-gray-700'} rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm h-[46px]`} maxLength={14} /></div></div></div></div>
        
        {/* Bloco de Segurança */}
        {editingInstructorId && (<div className="space-y-4"><div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><Lock size={14}/> Segurança & Acesso</div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-slate-200 dark:border-gray-800"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Senha de Acesso</label><div className="relative"><input type={showCurrentPassword ? 'text':'password'} value={formData.password} readOnly className="w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-400 dark:text-gray-500 cursor-not-allowed h-[46px]" /><button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500">{showCurrentPassword ? <EyeOff size={16}/>:<Eye size={16}/>}</button></div></div><div className="flex items-end gap-4 h-[46px]"><button onClick={() => setIsPasswordModalOpen(true)} className="flex-1 h-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 dark:text-gray-300"><KeySquare size={14}/> Alterar</button><button onClick={handleGenerateRandomPasswordForEdit} className="flex-1 h-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 dark:text-gray-300"><RefreshCw size={14}/> Gerar Nova</button></div></div></div>)}

        <div className="space-y-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><MapPin size={14} /> Endereço</div>{isLoadingCep && <div className="flex items-center gap-2 text-[10px] text-sky-500 font-bold animate-pulse"><Loader2 size={12} className="animate-spin" /> Buscando...</div>}</div><div className="grid grid-cols-12 gap-x-4 gap-y-4"><div className="col-span-12 md:col-span-3 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">CEP</label><input value={formData.cep} onChange={e => setFormData({...formData, cep: maskCEP(e.target.value)})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm h-[46px]" maxLength={9} /></div><div className="col-span-12 md:col-span-9 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Rua</label><input value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm h-[46px]"/></div><div className="col-span-12 md:col-span-2 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nº</label><input value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm h-[46px]"/></div><div className="col-span-12 md:col-span-5 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Bairro</label><input value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm h-[46px]"/></div><div className="col-span-12 md:col-span-5 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Complemento</label><input value={formData.complement} onChange={e => setFormData({...formData, complement: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm h-[46px]"/></div><div className="col-span-12 md:col-span-8 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Cidade</label><input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm h-[46px]"/></div><div className="col-span-12 md:col-span-4 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Estado</label><input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm h-[46px] text-center" maxLength={2} /></div></div></div>
        
        <div className="space-y-4"><div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><Clock size={14} /> Jornada de Trabalho</div><div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-slate-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-slate-200 dark:border-gray-800"><div className="space-y-4"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Dias da Semana</label><div className="grid grid-cols-3 lg:grid-cols-4 gap-2">{weekDays.map(d => (<button key={d.value} type="button" onClick={() => toggleDay(d.value)} className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${formData.workingDays.includes(d.value) ? 'bg-sky-500 text-white border-sky-500 shadow-lg' : 'bg-white dark:bg-gray-700 text-slate-500 dark:text-gray-300 border-slate-200 dark:border-gray-600'}`}>{d.label}</button>))}</div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Início</label><input type="time" value={formData.workStart} onChange={e => setFormData({...formData, workStart: e.target.value})} className="w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm h-[46px]" /></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Fim</label><input type="time" value={formData.workEnd} onChange={e => setFormData({...formData, workEnd: e.target.value})} className="w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm h-[46px]" /></div><div className="col-span-2 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1 flex items-center gap-1"><Timer size={10} /> Tempo de Aula (min)</label><input type="number" value={formData.classDuration} onChange={e => setFormData({...formData, classDuration: parseInt(e.target.value)})} className="w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm h-[46px]" /></div></div></div></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4"><div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><Award size={14} /> Dados Profissionais</div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Especialidades</label><input value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm h-[46px]" /></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Cor do Perfil</label><div className="grid grid-cols-4 gap-2">{colorOptions.map(c => (<button key={c.class} onClick={() => setFormData({...formData, avatarColor: c.class})} className={`h-10 rounded-lg border-2 ${formData.avatarColor===c.class ? 'border-sky-500 scale-105':'border-transparent opacity-60'} ${c.class}`} />))}</div></div></div><div className="space-y-4"><div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><CreditCard size={14} /> Ganhos</div><div className="bg-slate-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-slate-200 dark:border-gray-800 h-full flex flex-col justify-around"><div className="text-center"><p className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">Comissão Global</p><div className="flex items-baseline justify-center mt-1"><span className="text-3xl font-bold text-slate-700 dark:text-gray-200">{settings.commission}</span><span className="text-lg font-bold text-slate-500 dark:text-gray-400 ml-1">%</span></div></div><div className="w-full h-[1px] bg-slate-200 dark:bg-gray-700 my-3"></div><div className="text-center"><p className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">Ganho Mensal Estimado</p><p className="text-3xl font-bold text-emerald-500 mt-1">{estimatedEarnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><p className="text-[9px] text-slate-500 dark:text-gray-500 mt-2 italic">* Baseado nos alunos ativos.</p></div></div></div></div>

      </div><div className="p-8 border-t border-slate-100 dark:border-gray-800 flex justify-end gap-3 bg-white dark:bg-gray-900 rounded-b-3xl"><button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 uppercase tracking-widest h-[46px]">Cancelar</button><button onClick={handleSaveInstructor} disabled={cpfError} className={`px-8 py-3 font-bold rounded-xl transition-all shadow-lg uppercase tracking-widest text-xs h-[46px] ${cpfError ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'}`}>{editingInstructorId ? 'Atualizar' : 'Contratar'}</button></div></div></div>)}

      {isPasswordModalOpen && (<div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"><div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"><div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center"><h3 className="font-bold text-slate-800 dark:text-gray-100">Alterar Senha</h3><button onClick={closePasswordModal} className="text-gray-500 hover:text-rose-500"><X size={20} /></button></div><div className="p-6 space-y-4"><div className="bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs p-3 rounded-lg flex items-start gap-2"><Info size={14} className="flex-shrink-0 mt-0.5"/><span>A senha deve ter no mínimo 8 caracteres, com letras e números.</span></div>{passwordError && <div className="bg-rose-500/10 text-rose-500 text-xs font-bold p-3 rounded-lg">{passwordError}</div>}<div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nova Senha</label><div className="relative"><input type={showNewPassword ? 'text':'password'} value={newPassword} onChange={e => {setNewPassword(e.target.value); setPasswordError(null);}} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm pr-10 h-[46px]" /><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500">{showNewPassword ? <EyeOff size={16}/>:<Eye size={16}/>}</button></div></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Confirmar</label><div className="relative"><input type={showNewPassword ? 'text':'password'} value={confirmPassword} onChange={e => {setConfirmPassword(e.target.value); setPasswordError(null);}} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm pr-10 h-[46px]" /><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500">{showNewPassword ? <EyeOff size={16}/>:<Eye size={16}/>}</button></div></div></div><div className="p-4 bg-slate-50 dark:bg-gray-800/50 flex justify-end gap-3"><button onClick={closePasswordModal} className="px-4 py-2 rounded-lg text-xs font-bold">Cancelar</button><button onClick={handleManualPasswordChange} className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs h-[46px]">Salvar</button></div></div></div>)}

      {generatedPasswordInfo && (<div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"><div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95"><div className="p-8 text-center"><div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={32} /></div><h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2">Instrutor Contratado!</h3><p className="text-sm text-slate-500 dark:text-gray-400">Os dados de acesso para <span className="font-bold">{generatedPasswordInfo.name}</span> foram gerados.</p></div><div className="px-8 pb-8 space-y-4"><div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><Link size={12}/> Link de Acesso</label><div className="w-full bg-slate-100 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono text-slate-600 dark:text-gray-300">https://pilates-studio-test.vercel.app/</div></div><div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Login (CPF)</label><div className="w-full bg-slate-100 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono text-slate-600 dark:text-gray-300">{generatedPasswordInfo.cpf}</div></div><div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Senha Gerada</label><div className="w-full bg-slate-100 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono text-slate-600 dark:text-gray-300">{generatedPasswordInfo.pass}</div></div></div><div className="p-6 bg-slate-50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-3"><button onClick={() => setGeneratedPasswordInfo(null)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 uppercase tracking-widest">Fechar</button><button onClick={handleCopyCredentials} className="flex-1 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2 h-[46px]">{credentialsCopySuccess ? <><Check size={16}/> Copiado!</> : <><Copy size={14}/> Copiar Dados</>}</button></div></div></div>)}

    </div>
  );
};
// FIX: Changed export from InstructorProfile to Instructors
export default Instructors;
