import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../AppContext';
import { Bot, Power, Clock, Calendar, Cake, CheckCircle, Save, CheckCircle2, PartyPopper, History } from 'lucide-react';
import { ChatbotSettings } from '../types';

const BotAvisos: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { settings } = state;
    
    // Assegura que chatbotSettings tenha um valor inicial
    const initialChatbotSettings = settings.chatbotSettings || {
        isEnabled: false,
        classReminder: { isEnabled: false, hoursBefore: 0, template: '' },
        expiryWarning: { isEnabled: false, daysBefore: 0, template: '' },
        birthdayMessage: { isEnabled: false, template: '', sendTime: '09:00' },
        paymentConfirmation: { isEnabled: false, template: '' },
        welcomeMessage: { isEnabled: false, template: '' },
        rescheduleNotification: { isEnabled: false, template: '' },
    };

    const [localSettings, setLocalSettings] = useState<ChatbotSettings>(initialChatbotSettings);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const debounceTimeout = useRef<number | null>(null);

    useEffect(() => {
        // Atualiza o estado local se as configurações globais mudarem
        setLocalSettings(settings.chatbotSettings || initialChatbotSettings);
    }, [settings.chatbotSettings]);
    
    const showSaveSuccess = () => {
        setSaveSuccess(true);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = window.setTimeout(() => {
            setSaveSuccess(false);
        }, 2000);
    };

    const handleSettingsChange = (updatedChatbotSettings: Partial<ChatbotSettings>) => {
        const newSettings = { ...localSettings, ...updatedChatbotSettings };
        setLocalSettings(newSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: { chatbotSettings: newSettings } });
        showSaveSuccess();
    };

    const handleSubSettingChange = <T extends keyof Omit<ChatbotSettings, 'isEnabled'>>(key: T, value: Partial<ChatbotSettings[T]>) => {
        handleSettingsChange({ [key]: { ...localSettings[key], ...value } });
    };
    
    const AutomationCard = ({ icon, title, description, isEnabled, onToggle, children }: { icon: React.ReactNode, title: string, description: string, isEnabled: boolean, onToggle: (enabled: boolean) => void, children?: React.ReactNode }) => (
        <div className={`bg-white dark:bg-gray-900/40 border ${isEnabled ? 'border-slate-200 dark:border-gray-800' : 'border-slate-200/50 dark:border-gray-800/50'} rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none transition-all`}>
            <div className="p-6 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isEnabled ? 'bg-sky-500/10 text-sky-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>{icon}</div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-gray-100">{title}</h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400">{description}</p>
                    </div>
                </div>
                <button 
                    type="button" 
                    role="switch" 
                    aria-checked={isEnabled} 
                    onClick={() => onToggle(!isEnabled)}
                    className={`${isEnabled ? 'bg-sky-500' : 'bg-slate-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900/40`}
                >
                    <span aria-hidden="true" className={`${isEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                </button>
            </div>
            {children && <div className={`px-6 pb-6 pt-4 border-t border-slate-100 dark:border-gray-800 space-y-4 transition-opacity ${!isEnabled ? 'opacity-50 pointer-events-none' : ''}`}>{children}</div>}
        </div>
    );

    return (
        <div className="pt-8 pb-12 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-gray-100 uppercase tracking-tighter">Configurações do Chatbot</h1>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1">Automatize a comunicação com seus alunos via WhatsApp.</p>
                </div>
                {saveSuccess && (
                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold animate-in fade-in">
                        <CheckCircle2 size={14} />
                        <span>Salvo!</span>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                <AutomationCard
                    icon={<Power size={20} />}
                    title="Status Geral do Chatbot"
                    description="Ative ou desative todas as automações de uma só vez."
                    isEnabled={localSettings.isEnabled}
                    onToggle={(enabled) => handleSettingsChange({ isEnabled: enabled })}
                />
                <div className={`space-y-8 transition-opacity ${!localSettings.isEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <AutomationCard
                        icon={<PartyPopper size={20} />}
                        title="Mensagem de Boas-Vindas"
                        description="Envie uma saudação para novos alunos com os detalhes da sua primeira aula."
                        isEnabled={localSettings.welcomeMessage.isEnabled}
                        onToggle={(enabled) => handleSubSettingChange('welcomeMessage', { isEnabled: enabled })}
                    >
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Modelo da Mensagem</label>
                            <textarea value={localSettings.welcomeMessage.template} onChange={(e) => handleSubSettingChange('welcomeMessage', { template: e.target.value })} rows={3} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm resize-none" />
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 ml-1">Use as variáveis <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-sky-500">{'{aluno}'}</code>, <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-sky-500">{'{estudio}'}</code> e <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-sky-500">{'{proxima_aula}'}</code>.</p>
                        </div>
                    </AutomationCard>

                    <AutomationCard
                        icon={<Clock size={20} />}
                        title="Lembretes de Aula"
                        description="Envie um lembrete automático antes de cada aula agendada."
                        isEnabled={localSettings.classReminder.isEnabled}
                        onToggle={(enabled) => handleSubSettingChange('classReminder', { isEnabled: enabled })}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1 space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Enviar com antecedência de</label>
                                <div className="relative"><input type="number" value={localSettings.classReminder.hoursBefore} onChange={(e) => handleSubSettingChange('classReminder', { hoursBefore: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-16 text-sm" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">hora(s)</span></div>
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Modelo da Mensagem</label>
                                <textarea value={localSettings.classReminder.template} onChange={(e) => handleSubSettingChange('classReminder', { template: e.target.value })} rows={3} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm resize-none" />
                            </div>
                        </div>
                    </AutomationCard>

                    <AutomationCard
                        icon={<History size={20} />}
                        title="Aviso de Remarcação de Aula"
                        description="Notifique o aluno imediatamente quando uma aula for remarcada."
                        isEnabled={localSettings.rescheduleNotification.isEnabled}
                        onToggle={(enabled) => handleSubSettingChange('rescheduleNotification', { isEnabled: enabled })}
                    >
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Modelo da Mensagem</label>
                            <textarea value={localSettings.rescheduleNotification.template} onChange={(e) => handleSubSettingChange('rescheduleNotification', { template: e.target.value })} rows={3} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm resize-none" />
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 ml-1">Use as variáveis <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-sky-500">{'{aluno}'}</code> e <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-sky-500">{'{novo_horario}'}</code>.</p>
                        </div>
                    </AutomationCard>
                    
                    <AutomationCard
                        icon={<CheckCircle size={20} />}
                        title="Confirmação de Pagamento"
                        description="Envie uma mensagem de agradecimento ao marcar um aluno como pago."
                        isEnabled={localSettings.paymentConfirmation.isEnabled}
                        onToggle={(enabled) => handleSubSettingChange('paymentConfirmation', { isEnabled: enabled })}
                    >
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Modelo da Mensagem</label>
                            <textarea value={localSettings.paymentConfirmation.template} onChange={(e) => handleSubSettingChange('paymentConfirmation', { template: e.target.value })} rows={3} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm resize-none" />
                        </div>
                    </AutomationCard>

                    <AutomationCard
                        icon={<Calendar size={20} />}
                        title="Avisos de Vencimento"
                        description="Notifique os alunos quando a mensalidade estiver próxima de vencer."
                        isEnabled={localSettings.expiryWarning.isEnabled}
                        onToggle={(enabled) => handleSubSettingChange('expiryWarning', { isEnabled: enabled })}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1 space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Enviar com antecedência de</label>
                                <div className="relative"><input type="number" value={localSettings.expiryWarning.daysBefore} onChange={(e) => handleSubSettingChange('expiryWarning', { daysBefore: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-16 text-sm" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">dia(s)</span></div>
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Modelo da Mensagem</label>
                                <textarea value={localSettings.expiryWarning.template} onChange={(e) => handleSubSettingChange('expiryWarning', { template: e.target.value })} rows={3} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm resize-none" />
                            </div>
                        </div>
                    </AutomationCard>

                    <AutomationCard
                        icon={<Cake size={20} />}
                        title="Mensagens de Aniversário"
                        description="Envie uma mensagem de felicitações no dia do aniversário do aluno."
                        isEnabled={localSettings.birthdayMessage.isEnabled}
                        onToggle={(enabled) => handleSubSettingChange('birthdayMessage', { isEnabled: enabled })}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="md:col-span-1 space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Horário de Envio</label>
                                <input type="time" value={localSettings.birthdayMessage.sendTime} onChange={(e) => handleSubSettingChange('birthdayMessage', { sendTime: e.target.value })} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm" />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Modelo da Mensagem</label>
                                <textarea value={localSettings.birthdayMessage.template} onChange={(e) => handleSubSettingChange('birthdayMessage', { template: e.target.value })} rows={3} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm resize-none" />
                                <p className="text-[10px] text-slate-400 dark:text-gray-500 ml-1">Use as variáveis <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-sky-500">{'{aluno}'}</code> e <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-sky-500">{'{estudio}'}</code> para personalizar.</p>
                            </div>
                        </div>
                    </AutomationCard>
                </div>
            </div>
        </div>
    );
};

export default BotAvisos;
