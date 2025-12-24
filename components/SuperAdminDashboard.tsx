import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../AppContext';
import { DollarSign, Users, Activity, Search, Plus, Settings2, ShieldQuestion, Trash2, X, AlertTriangle, Calendar, Award, Loader2, MapPin, FileText, CreditCard, Lock, RefreshCw, Copy, Check, CheckCircle, Link, Zap, Bot } from 'lucide-react';
import NeuralNetworkBackground from './NeuralNetworkBackground';
import SuperAdminSettings from './SuperAdminSettings';
import SuperAdminSidebar from './SuperAdminSidebar';
import MobileHeader from './MobileHeader';
import { Client, License, StudioSettings, UserSession } from '../types';
import { superAdminClients } from '../superAdminMockData';

const SuperAdminDashboard: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { settings: appSettings, user, superAdminSettings, subscriptionPlans, addons } = state;
    const { isDarkMode } = appSettings;

    const [clients, setClients] = useState<Client[]>(superAdminClients);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSuperAdminTab, setActiveSuperAdminTab] = useState('clients');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState<Partial<Client> & { settings?: Partial<StudioSettings> } | null>(null);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [passwordCopySuccess, setPasswordCopySuccess] = useState(false);
    const [credentialsCopySuccess, setCredentialsCopySuccess] = useState(false);
    const [generatedPasswordInfo, setGeneratedPasswordInfo] = useState<{ adminName: string; document: string; pass: string } | null>(null);
    const [credentialsModalTitle, setCredentialsModalTitle] = useState('Cliente Criado com Sucesso!');

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const generateRandomPassword = (length = 8) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let password = '';
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };
    
    const maskPhone = (v: string) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2");
    const maskCEP = (v: string) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2");
    const maskCNPJ = (v: string) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
    const maskCPF = (v: string) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    const handleLogout = () => dispatch({ type: 'LOGOUT' });

    const handleOpenModal = (client: Client | null) => {
        setEditingClient(client);
        if (client) {
            setFormData({ 
                ...client, 
                expiresAt: client.expiresAt.split('/').reverse().join('-'),
                settings: { ...client.settings },
                courtesyFeatures: client.courtesyFeatures || {},
                purchasedAddons: client.purchasedAddons || {},
            });
        } else {
            const trialDays = superAdminSettings.defaultTrialDays;
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + trialDays);

            // FIX: Added missing metaFaturamento property to satisfy the StudioSettings type.
            const defaultSettings: StudioSettings = {
              appName: 'Novo Estúdio', logo: null, phone: '', email: '',
              documentType: 'CNPJ', document: '',
              address: { cep: '', street: '', number: '', neighborhood: '', city: '', state: '', complement: '' },
              plans: [
                { label: 'Valor para 1 aula por semana', value: '150' },
                { label: 'Valor para 2 aulas por semana', value: '250' },
                { label: 'Valor para 3 aulas por semana', value: '320' },
                { label: 'Valor para 4 aulas por semana', value: '380' },
                { label: 'Valor para 5 aulas por semana', value: '420' },
              ],
              commission: String(superAdminSettings.defaultCommission),
              alertDays: String(superAdminSettings.defaultAlertDays), 
              autoInactiveDays: '30', instructorSeesAllStudents: false,
              metaFaturamento: 10000,
              courtesyFeatures: {}, purchasedAddons: {}
            };
            setFormData({
                studioName: 'Novo Estúdio', adminName: '', licenseStatus: 'Teste', mrr: 0, adminPassword: '',
                expiresAt: expirationDate.toISOString().split('T')[0],
                subscriptionPlanId: 'trial',
                settings: defaultSettings,
                courtesyFeatures: {},
                purchasedAddons: {},
            });
        }
        setIsModalOpen(true);
    };

    const handlePlanSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const planId = e.target.value;
        if (planId === 'trial') {
            setFormData(prev => ({...prev!, subscriptionPlanId: 'trial', licenseStatus: 'Teste'}));
        } else {
            const selectedPlan = subscriptionPlans.find(p => p.id === planId);
            if (selectedPlan) {
                setFormData(prev => ({...prev!, subscriptionPlanId: planId, licenseStatus: 'Ativa'}));
            }
        }
    };
    
    const setFormValue = (key: keyof Client, value: any) => setFormData(prev => ({...prev!, [key]: value}));
    const setSettingsValue = (key: keyof StudioSettings, value: any) => setFormData(prev => ({...prev!, settings: {...prev!.settings!, [key]: value}}));
    const setAddressValue = (key: keyof StudioSettings['address'], value: any) => setFormData(prev => ({...prev!, settings: {...prev!.settings!, address: {...prev!.settings!.address!, [key]: value}}}));
    
     const handleCEPBlur = async () => {
        if(!formData?.settings?.address?.cep) return;
        const cleaned = formData.settings.address.cep.replace(/\D/g, "");
        if (cleaned.length === 8) {
          setIsLoadingCep(true);
          try {
            const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({...prev!, settings: {...prev!.settings!, address: {
                    ...prev!.settings!.address!,
                    street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf,
                }}}));
            }
          } catch (e) { console.error("Erro ao buscar CEP"); } finally { setIsLoadingCep(false); }
        }
    };

    const handleSaveClient = () => {
        if (!formData || !formData.studioName || !formData.adminName || !formData.settings) return;

        const passwordWasChanged = editingClient && formData.adminPassword !== editingClient.adminPassword;
        
        let password = formData.adminPassword;
        if (!editingClient) { // É um novo cliente
            password = generateRandomPassword();
        } else if (!password) { // É um cliente existente, mas o campo senha está vazio (não deve acontecer, mas por segurança)
            password = editingClient.adminPassword;
        }
        
        const planPrice = subscriptionPlans.find(p => p.id === formData.subscriptionPlanId)?.price || 0;
        let addonsPrice = 0;
        if (formData.purchasedAddons?.financialModule) { addonsPrice += addons.find(a => a.id === 'financialModule')?.price || 0; }
        if (formData.purchasedAddons?.whatsappBot) { addonsPrice += addons.find(a => a.id === 'whatsappBot')?.price || 0; }
        const finalMrr = formData.licenseStatus === 'Teste' ? 0 : planPrice + addonsPrice;

        const formattedExpiresAt = formData.expiresAt ? new Date(formData.expiresAt + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '';
        const finalClientData: Client = {
            id: editingClient?.id || `CLI-${Math.floor(100 + Math.random() * 900)}`,
            studioName: formData.studioName, adminName: formData.adminName, adminPassword: password,
            licenseStatus: formData.licenseStatus || 'Teste', expiresAt: formattedExpiresAt,
            mrr: finalMrr, studentCount: editingClient?.studentCount || 0,
            instructorCount: editingClient?.instructorCount || 0,
            subscriptionPlanId: formData.subscriptionPlanId || 'trial',
            settings: { ...formData.settings, appName: formData.studioName } as StudioSettings,
            courtesyFeatures: formData.courtesyFeatures,
            purchasedAddons: formData.purchasedAddons,
        };

        if (editingClient) { 
            setClients(clients.map(c => c.id === editingClient.id ? finalClientData : c));
            if (passwordWasChanged) {
                 setCredentialsModalTitle('Senha do Cliente Atualizada!');
                 setGeneratedPasswordInfo({
                    adminName: finalClientData.adminName,
                    document: finalClientData.settings.document || 'N/A',
                    pass: password!
                });
            }
        } else { // Novo cliente
            setClients([finalClientData, ...clients]);
            setCredentialsModalTitle('Cliente Criado com Sucesso!');
            setGeneratedPasswordInfo({
                adminName: finalClientData.adminName,
                document: finalClientData.settings.document || 'N/A',
                pass: password!
            });
        }
        setIsModalOpen(false);
    };

    const handleDeleteClick = (client: Client) => { setClientToDelete(client); setIsDeleteModalOpen(true); };
    const executeDelete = () => { if (clientToDelete) { setClients(clients.filter(c => c.id !== clientToDelete.id)); setIsDeleteModalOpen(false); setClientToDelete(null); }};
    
    const handleImpersonate = (client: Client) => {
        const licenseStatusMap: { [key in Client['licenseStatus']]: License['status'] } = { 'Ativa': 'active', 'Teste': 'trial', 'Expirada': 'expired', 'Pendente': 'expiring_soon' };
        const [day, month, year] = client.expiresAt.split('/');
        const isoDate = new Date(`${year}-${month}-${day}T00:00:00Z`).toISOString();
        const impersonatedUser: UserSession = { 
            id: 'impersonated_admin', 
            name: client.adminName, 
            role: 'admin' as const, 
            license: { status: licenseStatusMap[client.licenseStatus], expiresAt: isoDate },
            subscriptionPlanId: client.subscriptionPlanId,
        };
        const settingsForImpersonation = { ...client.settings, courtesyFeatures: client.courtesyFeatures, purchasedAddons: client.purchasedAddons };
        dispatch({ 
            type: 'IMPERSONATE', 
            payload: { user: impersonatedUser, settings: settingsForImpersonation } 
        });
    };
    
    const handleCopyPassword = () => {
        if(!formData?.adminPassword) return;
        navigator.clipboard.writeText(formData.adminPassword).then(() => {
            setPasswordCopySuccess(true);
            setTimeout(() => setPasswordCopySuccess(false), 2000);
        });
    };

    const handleCopyCredentials = () => {
        if (!generatedPasswordInfo) return;
        const accessLink = "https://pilates-studio-test.vercel.app/";
        const textToCopy = `Olá ${generatedPasswordInfo.adminName}!\n\nSeu acesso à plataforma Pilates Flow foi liberado.\n\nLink de Acesso: ${accessLink}\nLogin: ${generatedPasswordInfo.document}\nSenha: ${generatedPasswordInfo.pass}\n\nRecomendamos alterar a senha no primeiro acesso.`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCredentialsCopySuccess(true);
            setTimeout(() => setCredentialsCopySuccess(false), 2000);
        });
    };
    
    const handleAddonSelection = (key: 'financialModule' | 'whatsappBot', type: 'none' | 'purchased' | 'courtesy') => {
        if (!formData) return;
        const newPurchased = { ...formData.purchasedAddons };
        const newCourtesy = { ...formData.courtesyFeatures };

        if (type === 'none') {
            newPurchased[key] = false;
            newCourtesy[key] = false;
        } else if (type === 'purchased') {
            newPurchased[key] = true;
            newCourtesy[key] = false;
        } else if (type === 'courtesy') {
            newPurchased[key] = false;
            newCourtesy[key] = true;
        }
        
        setFormData(prev => ({ ...prev!, purchasedAddons: newPurchased, courtesyFeatures: newCourtesy }));
    };

    const clientsWithCalculatedMrr = clients.map(c => {
        const planPrice = subscriptionPlans.find(p => p.id === c.subscriptionPlanId)?.price || 0;
        let addonsPrice = 0;
        if (c.purchasedAddons?.financialModule) { addonsPrice += addons.find(a => a.id === 'financialModule')?.price || 0; }
        if (c.purchasedAddons?.whatsappBot) { addonsPrice += addons.find(a => a.id === 'whatsappBot')?.price || 0; }
        const totalMrr = c.licenseStatus === 'Teste' ? 0 : planPrice + addonsPrice;
        return { ...c, mrr: totalMrr };
    });

    const filteredClients = clientsWithCalculatedMrr.filter(c => c.studioName.toLowerCase().includes(searchTerm.toLowerCase()) || c.adminName.toLowerCase().includes(searchTerm.toLowerCase()));
    const summary = { mrr: filteredClients.reduce((acc, client) => acc + (client.licenseStatus === 'Ativa' || client.licenseStatus === 'Pendente' ? client.mrr : 0), 0), totalClients: filteredClients.length, activeSubscriptions: filteredClients.filter(c => c.licenseStatus === 'Ativa').length };
    
    const statusStyles: { [key in Client['licenseStatus']]: string } = { 'Ativa': 'bg-emerald-500/10 text-emerald-500', 'Teste': 'bg-sky-500/10 text-sky-500', 'Expirada': 'bg-rose-500/10 text-rose-500', 'Pendente': 'bg-amber-500/10 text-amber-500' };
    
    const featuresToToggle: {key: keyof NonNullable<Client['courtesyFeatures']>, label: string, icon: React.ReactNode}[] = [
        { key: 'financialModule', label: 'Módulo Financeiro', icon: <DollarSign size={16} /> },
        { key: 'whatsappBot', label: 'Chatbot WhatsApp', icon: <Bot size={16} /> }
    ];

    return (
        <div className="flex min-h-screen text-slate-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden relative bg-slate-50 dark:bg-[#0b0e14]">
            <NeuralNetworkBackground isDarkMode={isDarkMode} />
            <SuperAdminSidebar
                activeTab={activeSuperAdminTab}
                setActiveTab={setActiveSuperAdminTab}
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />}

            <main className="flex-1 overflow-y-auto h-screen lg:ml-72 relative custom-scrollbar">
                <MobileHeader
                  pageTitle={activeSuperAdminTab === 'clients' ? 'Gestão de Clientes' : 'Configurações Globais'}
                  onToggleSidebar={() => setIsSidebarOpen(true)}
                  isImpersonating={false}
                />
                 <div className="hidden lg:flex justify-end items-center h-16 px-8">
                    <div className="flex items-center gap-4">
                       <span className="text-xs font-bold text-slate-600 dark:text-gray-300">Bem-vindo, {user?.name}!</span>
                    </div>
                 </div>

                <div className="px-4 md:px-8 pb-8">
                    {activeSuperAdminTab === 'clients' && (
                        <div className="animate-in fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div className="bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg"><div className="flex justify-between items-start"><div><p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Receita Mensal (MRR)</p><p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(summary.mrr)}</p></div><div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><DollarSign size={20}/></div></div></div><div className="bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg"><div className="flex justify-between items-start"><div><p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Total de Clientes</p><p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{summary.totalClients}</p></div><div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center"><Users size={20}/></div></div></div><div className="bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg"><div className="flex justify-between items-start"><div><p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Assinaturas Ativas</p><p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{summary.activeSubscriptions}</p></div><div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><Activity size={20}/></div></div></div></div>
                            <div className="bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden"><div className="p-4 border-b border-slate-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4"><div className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" placeholder="Buscar estúdio ou administrador..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm" /></div><button onClick={() => handleOpenModal(null)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-lg"><Plus size={14} /> Novo Cliente</button></div>
                                <div className="overflow-x-auto"><table className="w-full text-left"><thead className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest border-b border-slate-200 dark:border-gray-800"><tr><th className="px-6 py-4">Estúdio</th><th className="px-6 py-4">Status da Licença</th><th className="px-6 py-4">Expira em</th><th className="px-6 py-4">MRR</th><th className="px-6 py-4 text-center">Alunos</th><th className="px-6 py-4 text-center">Instrutores</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-gray-800">{filteredClients.map(client => (<tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                                        <td className="px-6 py-4"><p className="text-sm font-bold text-slate-800 dark:text-gray-100">{client.studioName}</p><p className="text-xs text-slate-500 dark:text-gray-400">{client.adminName}</p></td>
                                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyles[client.licenseStatus]}`}>{client.licenseStatus}</span></td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-gray-300">{client.expiresAt}</td><td className="px-6 py-4 text-xs font-bold text-emerald-500">{formatCurrency(client.mrr)}</td><td className="px-6 py-4 text-center text-sm font-bold">{client.studentCount}</td><td className="px-6 py-4 text-center text-sm font-bold">{client.instructorCount}</td>
                                        <td className="px-6 py-4"><div className="flex justify-end gap-2"><button onClick={() => handleOpenModal(client)} className="p-2 text-slate-400 hover:text-sky-500" title="Gerenciar"><Settings2 size={14}/></button><button onClick={() => handleImpersonate(client)} className="p-2 text-slate-400 hover:text-amber-500" title="Personificar"><ShieldQuestion size={14}/></button><button onClick={() => handleDeleteClick(client)} className="p-2 text-slate-400 hover:text-rose-500" title="Remover"><Trash2 size={14}/></button></div></td>
                                    </tr>))}</tbody>
                                </table></div>
                            </div>
                        </div>
                    )}
                    {activeSuperAdminTab === 'settings' && <SuperAdminSettings />}
                </div>
                <footer className="mt-12 text-center text-xs text-slate-400 dark:text-gray-600 pb-8 relative z-10">
                    © 2025 Powered by <a href="https://cod3-ss.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-500 hover:underline">COD3 Software Solution</a>
                </footer>
            </main>

            {isModalOpen && formData && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                  <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center"><h3 className="font-bold text-slate-800 dark:text-gray-100">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-rose-500"><X size={20} /></button></div>
                  <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                    <div className="space-y-4"><h4 className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><CreditCard size={14} /> Informações Principais</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nome do Estúdio</label><input value={formData.studioName} onChange={e => setFormValue('studioName', e.target.value)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm" /></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Nome do Admin</label><input value={formData.adminName} onChange={e => setFormValue('adminName', e.target.value)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm" /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1 flex items-center gap-1.5"><Award size={12}/> Plano de Assinatura</label><select value={formData.subscriptionPlanId} onChange={handlePlanSelectionChange} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm"><option value="trial">Plano de Teste - {formatCurrency(0)}</option>{subscriptionPlans.map(plan => (<option key={plan.id} value={plan.id}>{plan.name} - {formatCurrency(plan.price)}</option>))}</select></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1 flex items-center gap-1.5"><Award size={12}/> Status da Licença</label><input value={formData.licenseStatus} disabled className="w-full bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-slate-400 dark:text-gray-500"/></div><div className="col-span-1 md:col-span-2 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1 flex items-center gap-1.5"><Calendar size={12}/> Data de Expiração</label><input type="date" value={formData.expiresAt} onChange={e => setFormValue('expiresAt', e.target.value)} className="w-full md:w-1/2 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm" /></div></div></div>
                    {(() => {
                        const selectedPlan = subscriptionPlans.find(p => p.id === formData.subscriptionPlanId);
                        const planFeatures = selectedPlan?.features || { financialModule: false, whatsappBot: false };
                        return (
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                              <h4 className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><Zap size={14}/> Funcionalidades Adicionais</h4>
                              <div className="grid grid-cols-1 gap-4">
                                {featuresToToggle.map(feature => {
                                  const featureKey = feature.key as 'financialModule' | 'whatsappBot';
                                  const isIncludedInPlan = !!planFeatures[featureKey];
                                  const isCourtesy = !!formData.courtesyFeatures?.[featureKey];
                                  // FIX: Access purchasedAddons from formData
                                  const isPurchased = !!formData.purchasedAddons?.[featureKey];
                                  
                                  return (
                                    <div key={feature.key} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${isIncludedInPlan || isPurchased || isCourtesy ? 'bg-sky-500/10 text-sky-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>{feature.icon}</span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-gray-200">{feature.label}</p>
                                                {isIncludedInPlan && <p className="text-[10px] font-bold text-emerald-500">INCLUSO NO PLANO</p>}
                                            </div>
                                        </div>
                                        {!isIncludedInPlan && (
                                            <div className="flex items-center bg-slate-100 dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-1">
                                                <button onClick={() => handleAddonSelection(featureKey, 'none')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${!isPurchased && !isCourtesy ? 'bg-white dark:bg-gray-700/50 text-slate-600 dark:text-gray-200' : 'text-slate-500 dark:text-gray-400 hover:bg-white/50'}`}>Nenhum</button>
                                                <button onClick={() => handleAddonSelection(featureKey, 'purchased')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${isPurchased ? 'bg-sky-500 text-white shadow' : 'text-slate-500 dark:text-gray-400 hover:bg-white/50'}`}>Contratado (+{formatCurrency(addons.find(a => a.id === featureKey)?.price || 0)})</button>
                                                <button onClick={() => handleAddonSelection(featureKey, 'courtesy')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${isCourtesy ? 'bg-amber-500 text-white shadow' : 'text-slate-500 dark:text-gray-400 hover:bg-white/50'}`}>Cortesia</button>
                                            </div>
                                        )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                        );
                    })()}
                    {editingClient && (<div className="space-y-4 pt-4 border-t border-slate-100 dark:border-gray-800"><h4 className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><Lock size={14}/> Acesso do Administrador</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Senha de Acesso</label><div className="relative"><input type="text" readOnly value={formData.adminPassword || ''} className="w-full bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-slate-400 dark:text-gray-500 pr-10 cursor-not-allowed" /><button onClick={handleCopyPassword} className="absolute right-0 top-0 h-full px-3 flex items-center text-slate-400 hover:text-sky-500">{passwordCopySuccess ? <Check size={16} className="text-emerald-500" /> : <Copy size={14}/>}</button></div></div><button onClick={() => setFormValue('adminPassword', generateRandomPassword())} className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 dark:text-gray-300"><RefreshCw size={14}/> Gerar Nova Senha</button></div></div>)}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                        <h4 className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest"><MapPin size={14} /> Contato, Documento & Endereço</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase ml-1">Telefone</label><input value={formData.settings?.phone} onChange={e => setSettingsValue('phone', maskPhone(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm" maxLength={15} /></div>
                            <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase ml-1">E-mail</label><input type="email" value={formData.settings?.email} onChange={e => setSettingsValue('email', e.target.value)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm"/></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase ml-1">Tipo de Documento</label>
                                <div className="flex items-center bg-slate-100 dark:bg-gray-800/50 rounded-xl border border-slate-200 dark:border-gray-700 p-1">
                                    <button onClick={() => setSettingsValue('documentType', 'CNPJ')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.settings?.documentType === 'CNPJ' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 dark:text-gray-400'}`}>CNPJ</button>
                                    <button onClick={() => setSettingsValue('documentType', 'CPF')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.settings?.documentType === 'CPF' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 dark:text-gray-400'}`}>CPF</button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase ml-1">{formData.settings?.documentType}</label>
                                <input 
                                    value={formData.settings?.document}
                                    onChange={e => setSettingsValue('document', formData.settings?.documentType === 'CNPJ' ? maskCNPJ(e.target.value) : maskCPF(e.target.value))}
                                    className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm"
                                    placeholder={formData.settings?.documentType === 'CNPJ' ? "00.000.000/0000-00" : "000.000.000-00"}
                                    maxLength={formData.settings?.documentType === 'CNPJ' ? 18 : 14}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-12 gap-x-4 gap-y-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                            <div className="col-span-12 md:col-span-3 space-y-1.5"><label className="text-[10px] font-bold uppercase ml-1 flex justify-between items-center">CEP {isLoadingCep && <Loader2 size={12} className="animate-spin" />}</label><input value={formData.settings?.address?.cep} onChange={e => setAddressValue('cep', maskCEP(e.target.value))} onBlur={handleCEPBlur} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm" maxLength={9} /></div>
                            <div className="col-span-12 md:col-span-9 space-y-1.5"><label className="text-[10px] font-bold uppercase ml-1">Rua</label><input value={formData.settings?.address?.street} onChange={e => setAddressValue('street', e.target.value)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm"/></div>
                            <div className="col-span-12 md:col-span-2 space-y-1.5"><label className="text-[10px] font-bold uppercase ml-1">Nº</label><input value={formData.settings?.address?.number} onChange={e => setAddressValue('number', e.target.value)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm"/></div>
                            <div className="col-span-12 md:col-span-5 space-y-1.5"><label className="text-[10px] font-bold uppercase ml-1">Bairro</label><input value={formData.settings?.address?.neighborhood} onChange={e => setAddressValue('neighborhood', e.target.value)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm"/></div>
                            <div className="col-span-12 md:col-span-5 space-y-1.5"><label className="text-[10px] font-bold uppercase ml-1">Complemento</label><input value={formData.settings?.address?.complement} onChange={e => setAddressValue('complement', e.target.value)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm"/></div>
                            <div className="col-span-12 md:col-span-8 space-y-1.5"><label className="text-[10px] font-bold uppercase ml-1">Cidade</label><input value={formData.settings?.address?.city} onChange={e => setAddressValue('city', e.target.value)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm"/></div>
                            <div className="col-span-12 md:col-span-4 space-y-1.5"><label className="text-[10px] font-bold uppercase ml-1">Estado</label><input value={formData.settings?.address?.state} onChange={e => setAddressValue('state', e.target.value)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm" maxLength={2} /></div>
                        </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-gray-800/50 flex justify-end gap-3"><button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5">Cancelar</button><button onClick={handleSaveClient} className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs">Salvar</button></div>
                </div>
              </div>
            )}
            {generatedPasswordInfo && (<div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
                    <div className="p-8 text-center"><div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={32} /></div><h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2">{credentialsModalTitle}</h3><p className="text-sm text-slate-500 dark:text-gray-400">Os dados de acesso para <span className="font-bold">{generatedPasswordInfo.adminName}</span> foram gerados.</p></div>
                    <div className="px-8 pb-8 space-y-4">
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><Link size={12}/> Link de Acesso</label><div className="w-full bg-slate-100 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono text-slate-600 dark:text-gray-300">https://pilates-studio-test.vercel.app/</div></div>
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Login (CPF/CNPJ)</label><div className="w-full bg-slate-100 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono text-slate-600 dark:text-gray-300">{generatedPasswordInfo.document}</div></div>
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Senha Gerada</label><div className="w-full bg-slate-100 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono text-slate-600 dark:text-gray-300">{generatedPasswordInfo.pass}</div></div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-3">
                        <button onClick={() => setGeneratedPasswordInfo(null)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 uppercase tracking-widest">Fechar</button>
                        <button onClick={handleCopyCredentials} className="flex-1 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2">{credentialsCopySuccess ? <><Check size={16}/> Copiado!</> : <><Copy size={14}/> Copiar Dados</>}</button>
                    </div>
                </div>
            </div>)}
            {isDeleteModalOpen && (<div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"><div className="p-8 text-center"><div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div><h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2">Remover Cliente?</h3><p className="text-sm text-slate-500 dark:text-gray-400">Esta ação removerá permanentemente o estúdio <span className="font-bold">{clientToDelete?.studioName}</span>.</p></div><div className="p-6 bg-slate-50 dark:bg-gray-800/50 flex gap-3"><button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest">Cancelar</button><button onClick={executeDelete} className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg uppercase tracking-widest text-xs">Sim, Remover</button></div></div></div>)}
        </div>
    );
};

export default SuperAdminDashboard;