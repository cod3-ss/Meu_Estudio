import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { CreditCard, Users, Bot, Zap, DollarSign, LayoutGrid, Calendar, Layers, GraduationCap, Dumbbell, Settings2, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';
import { SubscriptionPlan, SuperAdminSettings as SuperAdminSettingsType } from '../types';

const SuperAdminSettings: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { subscriptionPlans, superAdminSettings, addons } = state;

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [systemSettings, setSystemSettings] = useState<SuperAdminSettingsType>(superAdminSettings);
    const [localAddons, setLocalAddons] = useState(addons);
    const [showFeatures, setShowFeatures] = useState(true);
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const plansDebounceTimeout = useRef<number | null>(null);
    const systemSettingsDebounceTimeout = useRef<number | null>(null);
    const addonsDebounceTimeout = useRef<number | null>(null);

    useEffect(() => {
        setPlans(JSON.parse(JSON.stringify(subscriptionPlans)));
        setSystemSettings(superAdminSettings);
        setLocalAddons(JSON.parse(JSON.stringify(addons)));
    }, [subscriptionPlans, superAdminSettings, addons]);

    const handlePlanChange = (planId: string, field: 'price' | 'studentLimit' | keyof SubscriptionPlan['features'], value: any) => {
        const updatedPlans = plans.map(p => {
            if (p.id === planId) {
                if (field === 'price') {
                    return { ...p, price: parseFloat(value) || 0 };
                }
                if (field === 'studentLimit') {
                    return { ...p, studentLimit: value };
                }
                const featureKey = field as keyof SubscriptionPlan['features'];
                return { ...p, features: { ...p.features, [featureKey]: value } };
            }
            return p;
        });
        setPlans(updatedPlans);

        if (plansDebounceTimeout.current) clearTimeout(plansDebounceTimeout.current);
        plansDebounceTimeout.current = window.setTimeout(() => {
            dispatch({ type: 'UPDATE_SUBSCRIPTION_PLANS', payload: updatedPlans });
        }, 500);
    };
    
    const handleAddonPriceChange = (addonId: 'financialModule' | 'whatsappBot', value: string) => {
      const updatedAddons = localAddons.map(a => 
          a.id === addonId ? { ...a, price: parseFloat(value) || 0 } : a
      );
      setLocalAddons(updatedAddons);

      if (addonsDebounceTimeout.current) clearTimeout(addonsDebounceTimeout.current);
      addonsDebounceTimeout.current = window.setTimeout(() => {
          dispatch({ type: 'UPDATE_ADDONS', payload: updatedAddons });
      }, 500);
    }

    const handleSystemSettingsChange = (field: keyof SuperAdminSettingsType, value: string | number) => {
        const newSettings = { ...systemSettings, [field]: value };
        setSystemSettings(newSettings);

        if (systemSettingsDebounceTimeout.current) clearTimeout(systemSettingsDebounceTimeout.current);
        systemSettingsDebounceTimeout.current = window.setTimeout(() => {
            dispatch({ type: 'UPDATE_SUPER_ADMIN_SETTINGS', payload: newSettings });
        }, 500);
    };

     const handleCopySupportLink = () => {
      if (systemSettings.supportLink) {
        navigator.clipboard.writeText(systemSettings.supportLink).then(() => {
          setIsLinkCopied(true);
          setTimeout(() => setIsLinkCopied(false), 2000);
        });
      }
    };

    const featureList: { key: keyof SubscriptionPlan['features']; label: string; icon: React.ReactNode; isToggle: boolean; }[] = [
        { key: 'dashboard', label: 'Painel Gerencial', icon: <LayoutGrid size={14} />, isToggle: false },
        { key: 'detailedAgenda', label: 'Agenda Detalhada', icon: <Calendar size={14} />, isToggle: false },
        { key: 'scale', label: 'Escala de Instrutores / Aparelhos', icon: <Layers size={14} />, isToggle: false },
        { key: 'studentManagement', label: 'Gerenciamento de Alunos', icon: <Users size={14} />, isToggle: false },
        { key: 'instructorManagement', label: 'Gerenciamento de Instrutores', icon: <GraduationCap size={14} />, isToggle: false },
        { key: 'roomsManagement', label: 'Cadastro de Salas / Aparelhos', icon: <Dumbbell size={14} />, isToggle: false },
        { key: 'bulkAllocation', label: 'Alocação Rápida', icon: <Zap size={14} />, isToggle: false },
        { key: 'financialModule', label: 'Módulo Financeiro', icon: <DollarSign size={14} />, isToggle: true },
        { key: 'whatsappBot', label: 'Chatbot WhatsApp', icon: <Bot size={14} />, isToggle: true },
    ];
    
    const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
        <button onClick={onClick} className="focus:outline-none">
            {active ? (
                <div className="w-5 h-5 rounded-full border-2 border-sky-500 flex items-center justify-center bg-sky-500/10 transition-all"><div className="w-2 h-2 bg-sky-500 rounded-full"></div></div>
            ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-400 dark:border-gray-600 transition-all"></div>
            )}
        </button>
    );

    const StaticToggleOn = () => (
         <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-emerald-500/10" title="Sempre incluso"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div></div>
    );

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in space-y-8">
             <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-gray-100">Configurações Globais</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400">
                    Ajuste as regras de negócio e parâmetros padrão para todos os clientes da plataforma.
                </p>
            </div>
            
            <div className="bg-white dark:bg-[#111827]/40 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl">
                <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard size={16} className="text-sky-500" />
                      <h3 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider">Planos de Assinatura</h3>
                    </div>
                    <button onClick={() => setShowFeatures(!showFeatures)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-sky-500 transition-colors">
                        {showFeatures ? 'Ocultar Funcionalidades' : 'Mostrar Funcionalidades'}
                        {showFeatures ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-slate-50 dark:bg-[#0d121d] border border-slate-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-6">
                            <p className="font-bold text-slate-800 dark:text-gray-100">{plan.name}</p>
                            <div className="space-y-4">
                                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-gray-500">R$</span><input type="number" value={plan.price} onChange={(e) => handlePlanChange(plan.id, 'price', e.target.value)} className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-gray-700 rounded-lg pl-10 pr-16 py-3 text-sm font-medium focus:border-sky-500 focus:ring-0 outline-none" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-gray-500">/mês</span></div>
                                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1 flex items-center gap-1.5"><Users size={12}/> Limite de Alunos</label><input type="text" value={plan.studentLimit} onChange={(e) => handlePlanChange(plan.id, 'studentLimit', e.target.value)} className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm font-medium focus:border-sky-500 focus:ring-0 outline-none" placeholder="Nº ou 'unlimited'" /></div>
                            </div>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showFeatures ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-gray-700">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Funcionalidades Inclusas</p>
                                    {featureList.map(feature => (
                                        <div key={feature.key} className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2">{feature.icon} {feature.label}</label>
                                            {feature.isToggle ? (<Toggle active={plan.features[feature.key]} onClick={() => handlePlanChange(plan.id, feature.key, !plan.features[feature.key])} />) : (<StaticToggleOn />)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-[#111827]/40 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl">
                <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center gap-3">
                    <Zap size={16} className="text-sky-500" />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider">Módulos Adicionais (Add-ons)</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {localAddons.map(addon => (
                        <div key={addon.id} className="bg-slate-50 dark:bg-[#0d121d] border border-slate-200 dark:border-gray-800 rounded-xl p-4 flex flex-col">
                            <div>
                                <p className="font-bold text-sm text-slate-700 dark:text-gray-200">{addon.name}</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 mb-4">{addon.description}</p>
                            </div>
                            <div className="relative mt-auto">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-gray-500">R$</span>
                                <input 
                                    type="number" 
                                    value={addon.price} 
                                    onChange={(e) => handleAddonPriceChange(addon.id, e.target.value)} 
                                    className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-gray-700 rounded-lg pl-10 pr-16 py-2 text-sm font-medium focus:border-sky-500 focus:ring-0 outline-none" 
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-gray-500">/mês</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-[#111827]/40 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl">
                <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center gap-3">
                    <Settings2 size={16} className="text-sky-500" />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider">Parâmetros do Sistema</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Dias de Teste Padrão</label>
                        <div className="relative"><input type="number" value={systemSettings.defaultTrialDays} onChange={(e) => handleSystemSettingsChange('defaultTrialDays', parseInt(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-16 text-sm text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-gray-500">dias</span></div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Comissão Padrão (Instrutores)</label>
                        <div className="relative"><input type="number" value={systemSettings.defaultCommission} onChange={(e) => handleSystemSettingsChange('defaultCommission', parseInt(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-12 text-sm text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-gray-500">%</span></div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Alerta de Vencimento Padrão</label>
                        <div className="relative"><input type="number" value={systemSettings.defaultAlertDays} onChange={(e) => handleSystemSettingsChange('defaultAlertDays', parseInt(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-28 text-sm text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-gray-500">dias de antecedência</span></div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Link de Suporte (WhatsApp)</label>
                        <div className="relative">
                            <input type="text" value={systemSettings.supportLink} onChange={(e) => handleSystemSettingsChange('supportLink', e.target.value)} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-12 text-sm text-slate-700 dark:text-gray-200 outline-none focus:border-sky-500" placeholder="https://wa.me/..." />
                            <button
                                onClick={handleCopySupportLink}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 dark:text-gray-500 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
                                title="Copiar link"
                            >
                                {isLinkCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSettings;
