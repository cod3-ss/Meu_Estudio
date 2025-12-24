import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../AppContext';
import { Save, User, Camera, MapPin, Info, Phone, Award, Loader2, CheckCircle, Eye, EyeOff, Lock, DollarSign, TrendingUp, Users, KeySquare, RefreshCw, X } from 'lucide-react';
import { Instructor } from '../types';

const InstructorProfile: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { instructors, students, user, settings, subscriptionPlans } = state;
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para o modal de senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const currentPlan = subscriptionPlans.find(p => p.id === user?.subscriptionPlanId);
  const isFinancialModuleEnabled = !!currentPlan?.features.financialModule;

  // Busca o instrutor correspondente ao usuário logado
  const currentInstructor = instructors.find(i => i.id === user?.id);

  // Cálculo de Faturamento do Instrutor
  const financialData = useMemo(() => {
    if (!currentInstructor) return { totalRevenue: 0, estimatedEarnings: 0, activeStudents: 0 };

    const instructorStudents = students.filter(
      s => s.instructor === currentInstructor.name && s.status === 'Ativo'
    );

    let totalRevenue = 0;
    instructorStudents.forEach(student => {
      if (student.planType) {
        const frequency = student.planType.split('x')[0];
        const plan = settings.plans.find((p: any) => p.label.includes(`${frequency} aula`));
        if (plan && plan.value) {
          totalRevenue += parseFloat(plan.value);
        }
      }
    });

    const commissionRate = parseFloat(settings.commission) / 100;
    const estimatedEarnings = totalRevenue * commissionRate;

    return {
      totalRevenue,
      estimatedEarnings,
      activeStudents: instructorStudents.length
    };
  }, [currentInstructor, students, settings]);

  const initialFormState = {
    name: currentInstructor?.name || '',
    phone: currentInstructor?.phone || '',
    birthDate: currentInstructor?.birthDate || '',
    cpf: currentInstructor?.cpf || '',
    regDate: currentInstructor?.regDate || '',
    cep: currentInstructor?.address?.cep || '',
    street: currentInstructor?.address?.street || '',
    number: currentInstructor?.address?.number || '',
    neighborhood: currentInstructor?.address?.neighborhood || '',
    city: currentInstructor?.address?.city || '',
    state: currentInstructor?.address?.state || '',
    specialties: currentInstructor?.specialties || '',
    avatarColor: currentInstructor?.avatarColor || 'bg-sky-500',
    image: currentInstructor?.image || null,
    password: currentInstructor?.password || '123456'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (currentInstructor) {
      setFormData({
        name: currentInstructor.name,
        phone: currentInstructor.phone,
        birthDate: currentInstructor.birthDate || '',
        cpf: currentInstructor.cpf || '',
        regDate: currentInstructor.regDate || '',
        cep: currentInstructor.address?.cep || '',
        street: currentInstructor.address?.street || '',
        number: currentInstructor.address?.number || '',
        neighborhood: currentInstructor.address?.neighborhood || '',
        city: currentInstructor.address?.city || '',
        state: currentInstructor.address?.state || '',
        specialties: currentInstructor.specialties,
        avatarColor: currentInstructor.avatarColor,
        image: currentInstructor.image || null,
        password: currentInstructor.password || '123456'
      });
    }
  }, [currentInstructor]);

  const maskPhone = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 8) handleFetchAddress(cleaned);
    return cleaned.replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleFetchAddress = async (cep: string) => {
    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || ''
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const showSaveSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordUpdate = (newPasswordValue: string) => {
    if (!currentInstructor) return;
    const updatedInstructor = {
        ...currentInstructor,
        password: newPasswordValue,
    };
    const newInstructors = instructors.map(i => i.id === currentInstructor.id ? updatedInstructor : i);
    dispatch({ type: 'UPDATE_INSTRUCTORS', payload: newInstructors });
    dispatch({ type: 'PASSWORD_CHANGED' });
    setFormData(prev => ({ ...prev, password: newPasswordValue }));
    showSaveSuccess();
  };

  const generateRandomPassword = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPass = generateRandomPassword();
    handlePasswordUpdate(newPass);
  };
  
  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setShowNewPassword(false);
  };

  const handleManualPasswordChange = () => {
    if (!newPassword || !confirmPassword) {
        setPasswordError('Por favor, preencha ambos os campos.');
        return;
    }
    if (newPassword.length < 8) {
        setPasswordError('A senha deve ter no mínimo 8 caracteres.');
        return;
    }
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
        setPasswordError('A senha deve conter letras e números.');
        return;
    }
    if (newPassword !== confirmPassword) {
        setPasswordError('As senhas não coincidem. Tente novamente.');
        return;
    }
    handlePasswordUpdate(newPassword);
    handleClosePasswordModal();
  };


  const handleSave = () => {
    if (!currentInstructor) return;

    const initials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const updatedInstructor: Instructor = {
      ...currentInstructor,
      name: formData.name,
      initials,
      phone: formData.phone,
      specialties: formData.specialties,
      avatarColor: formData.avatarColor,
      cpf: formData.cpf,
      password: formData.password,
      birthDate: formData.birthDate,
      regDate: formData.regDate,
      image: formData.image,
      address: {
        cep: formData.cep,
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state
      }
    };

    const newInstructors = instructors.map(i => i.id === currentInstructor.id ? updatedInstructor : i);
    dispatch({ type: 'UPDATE_INSTRUCTORS', payload: newInstructors });
    
    showSaveSuccess();
  };

  const colorOptions = [
    { name: 'Rose', class: 'bg-rose-600' },
    { name: 'Azul', class: 'bg-blue-600' },
    { name: 'Laranja', class: 'bg-orange-500' },
    { name: 'Verde', class: 'bg-emerald-600' },
    { name: 'Céu', class: 'bg-sky-500' },
    { name: 'Roxo', class: 'bg-purple-600' },
    { name: 'Âmbar', class: 'bg-amber-500' },
    { name: 'Slate', class: 'bg-slate-600' }
  ];

  if (!currentInstructor) {
    return <div className="p-8 text-center text-slate-500">Instrutor não encontrado no sistema.</div>;
  }

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="pt-8 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-gray-100 uppercase tracking-tighter">Meu Perfil</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1">Mantenha seus dados profissionais e de acesso atualizados.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-sky-600/20"
        >
          {saveSuccess ? <CheckCircle size={18} /> : <Save size={18} />}
          {saveSuccess ? 'Salvo com Sucesso!' : 'Salvar Alterações'}
        </button>
      </div>

      {isFinancialModuleEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">Meu Faturamento Bruto</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-gray-100">{formatCurrency(financialData.totalRevenue)}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-emerald-500">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-bold uppercase">Referente a alunos ativos</span>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between border-l-4 border-l-sky-500">
                <div>
                    <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-1">Minha Comissão ({settings.commission}%)</p>
                    <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{formatCurrency(financialData.estimatedEarnings)}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-slate-400">
                    <DollarSign size={14} />
                    <span className="text-[10px] font-bold uppercase">Ganho mensal estimado</span>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">Meus Alunos Ativos</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-gray-100">{financialData.activeStudents}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-slate-400">
                    <Users size={14} />
                    <span className="text-[10px] font-bold uppercase">Base de cálculo atual</span>
                </div>
            </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Cabeçalho de Perfil */}
        <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className={`w-32 h-32 rounded-full ${formData.avatarColor} border-4 border-white dark:border-gray-800 shadow-2xl flex items-center justify-center overflow-hidden`}>
                {formData.image ? (
                  <img src={formData.image} className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-white opacity-40" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-sky-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="flex-1 w-full space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nome Completo</label>
                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 transition-colors text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Telefone / WhatsApp</label>
                        <input value={formData.phone} onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 transition-colors text-sm" maxLength={15} />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Cor do Perfil</label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map(color => (
                        <button 
                          key={color.class} 
                          onClick={() => setFormData({...formData, avatarColor: color.class})} 
                          className={`w-8 h-8 rounded-full transition-all border-2 ${formData.avatarColor === color.class ? 'border-sky-500 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'} ${color.class}`} 
                        />
                      ))}
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Dados de Acesso */}
        <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest mb-6">
                <Lock size={14} /> Segurança & Acesso
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">CPF (Apenas Visualização)</label>
                    <input value={formData.cpf} readOnly className="w-full bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-400 dark:text-gray-500 outline-none text-sm cursor-not-allowed" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Senha de Acesso</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            value={formData.password}
                            readOnly
                            className="w-full bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-400 dark:text-gray-500 focus:outline-none cursor-not-allowed"
                        />
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                  </div>
                   <div className="flex items-center gap-2">
                      <button onClick={() => setIsPasswordModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-gray-300">
                          <KeySquare size={14}/> Alterar Manualmente
                      </button>
                      <button onClick={handleGeneratePassword} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-gray-300">
                         <RefreshCw size={14}/> Gerar Aleatória
                      </button>
                  </div>
                </div>
            </div>
        </div>

        {/* Informações Profissionais */}
        <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest mb-6">
            <Award size={14} /> Especialidades Profissionais
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Suas Formações e Especialidades</label>
            <textarea 
              value={formData.specialties} 
              onChange={e => setFormData({...formData, specialties: e.target.value})} 
              rows={3}
              className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 transition-colors text-sm resize-none"
              placeholder="Ex: Pilates Clássico, Fisioterapia Ortopédica, RPG..."
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest">
              <MapPin size={14} /> Endereço Residencial
            </div>
            {isLoadingCep && <div className="flex items-center gap-2 text-[10px] text-sky-500 font-bold animate-pulse"><Loader2 size={12} className="animate-spin" /> Buscando...</div>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">CEP</label>
              <input value={formData.cep} onChange={e => setFormData({...formData, cep: maskCEP(e.target.value)})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 transition-colors text-sm" placeholder="00000-000" maxLength={9} />
            </div>
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Rua / Logradouro</label>
              <input value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 transition-colors text-sm" placeholder="Preenchido automaticamente" />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nº</label>
              <input value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 transition-colors text-sm" placeholder="123" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Bairro</label>
              <input value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 transition-colors text-sm" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Cidade</label>
              <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 transition-colors text-sm" />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">UF</label>
              <input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 transition-colors text-sm" maxLength={2} placeholder="SP" />
            </div>
          </div>
        </div>
      </div>
       {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-gray-100">Alterar Minha Senha</h3>
              <button onClick={handleClosePasswordModal} className="text-gray-500 dark:text-gray-400 hover:text-rose-500"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-medium p-3 rounded-lg flex items-start gap-2">
                <Info size={14} className="flex-shrink-0 mt-0.5"/>
                <span>A senha deve ter no mínimo 8 caracteres, contendo letras e números.</span>
              </div>
              {passwordError && <div className="bg-rose-500/10 text-rose-500 text-xs font-bold p-3 rounded-lg">{passwordError}</div>}
              <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nova Senha</label>
                  <div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => { setNewPassword(e.target.value); setPasswordError(null); }} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm pr-10" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500">
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
              </div>
              <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Confirmar Nova Senha</label>
                  <div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setPasswordError(null); }} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm pr-10" />
                     <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500">
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button onClick={handleClosePasswordModal} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5">Cancelar</button>
              <button onClick={handleManualPasswordChange} className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs">Salvar Nova Senha</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorProfile;