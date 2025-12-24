import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Palette, DollarSign, Bell, Save, UploadCloud, Image, Loader2, CheckCircle, Phone, Mail, MapPin, FileText, AlertTriangle, ShieldAlert, CreditCard, Lock, Eye, EyeOff, RefreshCw, X, KeySquare, Info, Zap, Bot, LayoutGrid, Calendar, Layers, Users, GraduationCap, Dumbbell, XCircle } from 'lucide-react';
import SubscriptionModal from './SubscriptionModal';

const Settings: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { settings, user, subscriptionPlans } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const debounceTimeout = useRef<number | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados para o modal de senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const currentPlan = subscriptionPlans.find(p => p.id === user?.subscriptionPlanId);

  const featureList: { key: keyof (typeof subscriptionPlans)[0]['features']; label: string; icon: React.ReactNode; }[] = [
    { key: 'dashboard', label: 'Painel Gerencial', icon: <LayoutGrid size={14} /> },
    { key: 'detailedAgenda', label: 'Agenda Detalhada', icon: <Calendar size={14} /> },
    { key: 'scale', label: 'Escala de Aparelhos', icon: <Layers size={14} /> },
    { key: 'studentManagement', label: 'Gestão de Alunos', icon: <Users size={14} /> },
    { key: 'instructorManagement', label: 'Gestão de Instrutores', icon: <GraduationCap size={14} /> },
    { key: 'roomsManagement', label: 'Salas & Aparelhos', icon: <Dumbbell size={14} /> },
    { key: 'bulkAllocation', label: 'Alocação Rápida', icon: <Zap size={14} /> },
    { key: 'financialModule', label: 'Módulo Financeiro', icon: <DollarSign size={14} /> },
    { key: 'whatsappBot', label: 'Chatbot WhatsApp', icon: <Bot size={14} /> },
  ];

  const showSaveSuccess = () => {
    setSaveSuccess(true);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = window.setTimeout(() => {
        setSaveSuccess(false);
    }, 2000);
  };

  const handleSettingsChange = (updatedSettings: Partial<typeof settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updatedSettings });
    showSaveSuccess();
  };
  
  const handlePlanChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newPlans = [...settings.plans];
    newPlans[index] = { ...newPlans[index], value: e.target.value };
    handleSettingsChange({ plans: newPlans });
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSettingsChange({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const maskPhone = (v: string) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2");
  const maskCEP = (v: string) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2");
  const maskCNPJ = (v: string) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
  const maskCPF = (v: string) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  
  const generateRandomPassword = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    handleSettingsChange({ adminPassword: newPassword });
    dispatch({ type: 'PASSWORD_CHANGED' });
  };
  
  const handleCEPBlur = async () => {
    const cleaned = settings.address.cep.replace(/\D/g, "");
    if (cleaned.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await response.json();
        if (!data.erro) {
            handleSettingsChange({ 
                address: {
                    ...settings.address,
                    street: data.logouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf
                }
            });
        }
      } catch (e) { console.error("Erro ao buscar CEP"); } finally { setIsLoadingCep(false); }
    }
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
    handleSettingsChange({ adminPassword: newPassword });
    dispatch({ type: 'PASSWORD_CHANGED' });
    handleClosePasswordModal();
  };
  
  useEffect(() => {
    return () => {
        if(debounceTimeout.current) clearTimeout(debounceTimeout.current);
    }
  }, []);

  return (
    <div className="pt-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-slate-800 dark:text-gray-100 uppercase tracking-tighter">Ajustes Gerais</h1>
         {saveSuccess && (
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold animate-in fade-in">
              <CheckCircle size={14} />
              <span>Salvo!</span>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Informações do Estúdio e Licença */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center overflow-hidden border border-sky-500/20`}>
                {settings.logo ? <img src={settings.logo} className="w-full h-full object-cover" /> : <Image size={24} className="text-sky-500" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-gray-100">{settings.appName}</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">Perfil do Estúdio</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
              Aqui você personaliza a identidade, os planos e as regras de negócio do seu estúdio. As alterações são salvas automaticamente.
            </p>
          </div>
          
          {/* Card de Status da Licença */}
          {user?.license && (() => {
            const { license } = user;
            const expiresDate = new Date(license.expiresAt);

            let config = {
                icon: <CheckCircle size={24} />,
                borderColor: 'border-emerald-500/20',
                textColor: 'text-emerald-500',
                title: 'Licença Ativa',
                buttonText: 'Gerenciar Assinatura',
                buttonClass: 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-200 hover:bg-slate-300 dark:hover:bg-white/20'
            };
            
            if (license.status === 'trial') {
                config = { ...config, icon: <CheckCircle size={24} />, borderColor: 'border-sky-500/20', textColor: 'text-sky-500', title: 'Período de Teste', buttonText: 'Fazer Upgrade', buttonClass: 'bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/20' }
            } else if (license.status === 'expiring_soon') {
                config = { ...config, icon: <AlertTriangle size={24} />, borderColor: 'border-amber-500/20', textColor: 'text-amber-500', title: 'Licença Expirando', buttonText: 'Renovar Agora', buttonClass: 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20' };
            } else if (license.status === 'expired') {
                config = { ...config, icon: <ShieldAlert size={24} />, borderColor: 'border-rose-500/20', textColor: 'text-rose-500', title: 'Licença Expirada', buttonText: 'Regularizar Assinatura', buttonClass: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20' };
            }

            return (
                <div className={`bg-white dark:bg-gray-900/40 border ${config.borderColor} rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-in fade-in flex flex-col`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-lg ${config.textColor}/10 flex items-center justify-center`}><div className={config.textColor}>{config.icon}</div></div>
                        <div><h3 className="font-bold text-slate-800 dark:text-gray-100">Status da Licença</h3><p className={`text-xs font-bold ${config.textColor}`}>{config.title}</p></div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed mb-4">Sua assinatura é válida até <strong className="text-slate-700 dark:text-gray-200">{expiresDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>.</p>
                    
                    {currentPlan && (
                        <div className="my-4 pt-4 border-t border-slate-200 dark:border-gray-700 space-y-3">
                            <p className="text-xs font-bold text-slate-500 dark:text-gray-400">Seu Plano: <span className="text-sky-500">{currentPlan.name}</span><span className="ml-2 font-medium text-slate-400">(Até {currentPlan.studentLimit === 'unlimited' ? 'alunos ilimitados' : `${currentPlan.studentLimit} alunos`})</span></p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                               {featureList.map(feature => {
                                    const featureKey = feature.key as keyof typeof settings.purchasedAddons;
                                    const isIncludedInPlan = !!currentPlan?.features[featureKey];
                                    const isPurchased = !!settings.purchasedAddons?.[featureKey];
                                    const isCourtesy = !!settings.courtesyFeatures?.[featureKey];
                                    const isEnabled = isIncludedInPlan || isPurchased || isCourtesy;

                                    let icon;
                                    if (isIncludedInPlan) {
                                        icon = <CheckCircle size={14} className="text-emerald-500" />;
                                    } else if (isCourtesy) {
                                        icon = <CheckCircle size={14} className="text-amber-500" />;
                                    } else if (isPurchased) {
                                        icon = <CheckCircle size={14} className="text-sky-500" />;
                                    } else {
                                        icon = <XCircle size={14} className="text-rose-500/50" />;
                                    }

                                    return (
                                        <li key={feature.key} className={`flex items-center text-xs font-medium ${isEnabled ? 'text-slate-600 dark:text-gray-300' : 'text-slate-400 dark:text-gray-500 line-through'}`}>
                                            <div className="flex items-center gap-2">
                                                {icon}
                                                <span>{feature.label}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="!mt-5 pt-3 border-t border-slate-100 dark:border-gray-800">
                                <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2">Legenda:</p>
                                <div className="space-y-1.5 text-xs text-slate-500 dark:text-gray-400 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle size={12} className="text-emerald-500" />
                                        <span>Incluso no Plano</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle size={12} className="text-amber-500" />
                                        <span>Cortesia</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle size={12} className="text-sky-500" />
                                        <span>Avulso (Contratado)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button onClick={() => setIsSubscriptionModalOpen(true)} className={`mt-auto w-full py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 ${config.buttonClass}`}><CreditCard size={14} /> {config.buttonText}</button>
                </div>
            );
          })()}
        </div>

        {/* Coluna Direita: Configurações */}
        <div className="lg:col-span-2 space-y-8">
          {/* Identidade Visual */}
          <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center gap-3"><Palette size={16} className="text-sky-500" /><h3 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider">Identidade Visual</h3></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nome do Estúdio</label><input type="text" value={settings.appName} onChange={(e) => handleSettingsChange({ appName: e.target.value })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-gray-200 focus:outline-none focus:border-sky-500" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Logo</label><button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-gray-800 border-2 border-dashed border-slate-200 dark:border-gray-700 hover:border-sky-500 rounded-xl px-4 py-3 text-sm text-slate-500 dark:text-gray-400 font-medium transition-all"><UploadCloud size={16} />{settings.logo ? 'Alterar Logo' : 'Enviar Logo'}</button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} /></div>
            </div>
          </div>
          
          {/* Contato e Endereço */}
          <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center gap-3"><MapPin size={16} className="text-sky-500" /><h3 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider">Contato & Endereço</h3></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Telefone / WhatsApp</label><input value={settings.phone} onChange={e => handleSettingsChange({ phone: maskPhone(e.target.value) })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" placeholder="(00) 00000-0000" maxLength={15} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">E-mail de Contato</label><input type="email" value={settings.email} onChange={e => handleSettingsChange({ email: e.target.value })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" placeholder="contato@seudominio.com"/></div>
              </div>
              <div className="grid grid-cols-12 gap-x-4 gap-y-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                <div className="col-span-12 md:col-span-3 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1 flex justify-between items-center">CEP {isLoadingCep && <Loader2 size={12} className="animate-spin" />}</label><input value={settings.address.cep} onChange={e => handleSettingsChange({ address: { ...settings.address, cep: maskCEP(e.target.value) }})} onBlur={handleCEPBlur} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" placeholder="00000-000" maxLength={9} /></div>
                <div className="col-span-12 md:col-span-9 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Rua / Logradouro</label><input value={settings.address.street} onChange={e => handleSettingsChange({ address: { ...settings.address, street: e.target.value } })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" placeholder="Preenchido automaticamente"/></div>
                <div className="col-span-12 md:col-span-2 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nº</label><input value={settings.address.number} onChange={e => handleSettingsChange({ address: { ...settings.address, number: e.target.value } })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" placeholder="123"/></div>
                <div className="col-span-12 md:col-span-5 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Bairro</label><input value={settings.address.neighborhood} onChange={e => handleSettingsChange({ address: { ...settings.address, neighborhood: e.target.value } })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" /></div>
                <div className="col-span-12 md:col-span-5 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Complemento</label><input value={settings.address.complement} onChange={e => handleSettingsChange({ address: { ...settings.address, complement: e.target.value } })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" /></div>
                <div className="col-span-12 md:col-span-8 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Cidade</label><input value={settings.address.city} onChange={e => handleSettingsChange({ address: { ...settings.address, city: e.target.value } })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" /></div>
                <div className="col-span-12 md:col-span-4 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Estado</label><input value={settings.address.state} onChange={e => handleSettingsChange({ address: { ...settings.address, state: e.target.value } })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" maxLength={2} placeholder="SP"/></div>
              </div>
            </div>
          </div>
          
          {/* Dados Fiscais e Senha */}
          <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center gap-3"><FileText size={16} className="text-sky-500" /><h3 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider">Dados Fiscais & Acesso</h3></div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Tipo de Documento</label><div className="flex items-center bg-slate-100 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-1"><button onClick={() => handleSettingsChange({ documentType: 'CNPJ' })} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.documentType === 'CNPJ' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 dark:text-gray-400'}`}>CNPJ</button><button onClick={() => handleSettingsChange({ documentType: 'CPF' })} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.documentType === 'CPF' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 dark:text-gray-400'}`}>CPF</button></div></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">{settings.documentType}</label><input value={settings.document} onChange={e => handleSettingsChange({ document: settings.documentType === 'CNPJ' ? maskCNPJ(e.target.value) : maskCPF(e.target.value) })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm" placeholder={settings.documentType === 'CNPJ' ? "00.000.000/0000-00" : "000.000.000-00"} maxLength={settings.documentType === 'CNPJ' ? 18 : 14} /></div>
                </div>
                <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-gray-800">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Senha de Acesso do Administrador</label>
                    <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1.2 text-slate-400" size={16}/><input type={showPassword ? 'text' : 'password'} value={settings.adminPassword} readOnly className="w-full bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-400 dark:text-gray-500 focus:outline-none cursor-not-allowed" /><button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
                     <div className="flex items-center gap-2 pt-1"><button onClick={() => setIsPasswordModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-gray-300"><KeySquare size={14}/> Alterar Manualmente</button><button onClick={handleGeneratePassword} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-gray-300"><RefreshCw size={14}/> Gerar Aleatória</button></div>
                </div>
            </div>
          </div>
          
          {/* Financeiro */}
          <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center gap-3"><DollarSign size={16} className="text-emerald-500" /><h3 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider">Financeiro</h3></div>
            <div className="p-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{settings.plans.map((plan, idx) => (<div key={idx} className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">{plan.label}</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-gray-500">R$</span><input type="number" value={plan.value} onChange={(e) => handlePlanChange(e, idx)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-700 dark:text-gray-200 focus:outline-none focus:border-sky-500 font-medium"/></div></div>))}</div>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-800"><div className="space-y-1.5 max-w-xs"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Comissão Padrão (Instrutores)</label><div className="relative"><input type="number" value={settings.commission} onChange={(e) => handleSettingsChange({ commission: e.target.value })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-700 dark:text-gray-200 focus:outline-none focus:border-sky-500 font-medium" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-gray-500">%</span></div></div></div>
            </div>
          </div>
          
          {/* Sistema */}
          <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center gap-3"><Bell size={16} className="text-amber-500" /><h3 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider">Sistema & Alertas</h3></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Alertar vencimento com antecedência de</label><div className="relative"><input type="number" value={settings.alertDays} onChange={(e) => handleSettingsChange({ alertDays: e.target.value })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl pl-4 pr-16 py-3 text-sm text-slate-700 dark:text-gray-200 focus:outline-none focus:border-sky-500 font-medium" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-gray-500">dias</span></div></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Inativar aluno automaticamente após</label><div className="relative"><input type="number" value={settings.autoInactiveDays} onChange={(e) => handleSettingsChange({ autoInactiveDays: e.target.value })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl pl-4 pr-28 py-3 text-sm text-slate-700 dark:text-gray-200 focus:outline-none focus:border-sky-500 font-medium" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-gray-500">dias de vencido</span></div></div>
               <div className="md:col-span-2 pt-6 border-t border-slate-100 dark:border-gray-800"><div className="flex items-center justify-between bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3"><div><label className="text-sm font-bold text-slate-700 dark:text-gray-200">Visão Ampla para Instrutores</label><p className="text-xs text-slate-500 dark:text-gray-400">Se ativado, instrutores podem ver todos os alunos do estúdio.</p></div><button type="button" role="switch" aria-checked={settings.instructorSeesAllStudents} onClick={() => handleSettingsChange({ instructorSeesAllStudents: !settings.instructorSeesAllStudents })} className={`${settings.instructorSeesAllStudents ? 'bg-sky-500' : 'bg-slate-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900/40`}><span aria-hidden="true" className={`${settings.instructorSeesAllStudents ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/></button></div></div>
            </div>
          </div>
        </div>
      </div>
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center"><h3 className="font-bold text-slate-800 dark:text-gray-100">Alterar Senha Manualmente</h3><button onClick={handleClosePasswordModal} className="text-gray-500 dark:text-gray-400 hover:text-rose-500"><X size={20} /></button></div>
            <div className="p-6 space-y-4"><div className="bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-medium p-3 rounded-lg flex items-start gap-2"><Info size={14} className="flex-shrink-0 mt-0.5"/><span>A senha deve ter no mínimo 8 caracteres, contendo letras e números.</span></div>{passwordError && <div className="bg-rose-500/10 text-rose-500 text-xs font-bold p-3 rounded-lg">{passwordError}</div>}
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nova Senha</label><div className="relative"><input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => { setNewPassword(e.target.value); setPasswordError(null); }} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm pr-10" /><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500">{showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Confirmar Nova Senha</label><div className="relative"><input type={showNewPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setPasswordError(null); }} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500 text-sm pr-10" /><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500">{showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-gray-800/50 flex justify-end gap-3"><button onClick={handleClosePasswordModal} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5">Cancelar</button><button onClick={handleManualPasswordChange} className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs">Salvar Nova Senha</button></div>
          </div>
        </div>
      )}
      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </div>
  );
};

export default Settings;
