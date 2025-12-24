import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../AppContext';
import { X, CheckCircle, Bot, DollarSign, Users, Check } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useContext(AppContext);
  const { user, settings, subscriptionPlans, addons, superAdminSettings } = state;

  const [selectedPlanId, setSelectedPlanId] = useState(user?.subscriptionPlanId || 'plan_basic');
  const [selectedAddons, setSelectedAddons] = useState(settings.purchasedAddons || {});

  useEffect(() => {
    if (isOpen) {
      setSelectedPlanId(user?.subscriptionPlanId || 'plan_basic');
      setSelectedAddons(settings.purchasedAddons || {});
    }
  }, [isOpen, user, settings]);

  const handleConfirm = () => {
    const previousPlan = subscriptionPlans.find(p => p.id === user?.subscriptionPlanId);
    const newPlan = selectedPlan;

    const previousAddons = settings.purchasedAddons || {};
    const newlyAddedAddons = addons.filter(addon => 
        selectedAddons[addon.id as keyof typeof selectedAddons] && !previousAddons[addon.id as keyof typeof previousAddons]
    );

    // Constrói a mensagem com formatação Markdown
    let message = `*Alteração de Plano Solicitada*\n\n`;
    message += `*Cliente:* ${user?.name}\n`;
    message += `*${settings.documentType}:* ${settings.document}\n\n`;
    
    if (previousPlan?.name !== newPlan?.name) {
        message += `*Plano Anterior:* ${previousPlan?.name || 'Nenhum'}\n`;
        message += `*Novo Plano:* ${newPlan?.name}\n\n`;
    } else {
        message += `*Plano Mantido:* ${newPlan?.name}\n\n`;
    }

    if (newlyAddedAddons.length > 0) {
        message += `*Adicionais Solicitados:*\n`;
        newlyAddedAddons.forEach(addon => {
            message += `- ${addon.name}\n`;
        });
        message += `\n`;
    }

    message += `*Total Mensal Atualizado:* ${formatCurrency(totalPrice)}`;

    // Define o número de suporte correto
    const supportPhone = '5564993407329';
    
    const whatsappUrl = `https://wa.me/${supportPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Mantém a lógica original
    dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: { planId: selectedPlanId, purchasedAddons: selectedAddons } });
    onClose();
  };

  const handleToggleAddon = (addonId: 'financialModule' | 'whatsappBot') => {
    setSelectedAddons((prev: any) => ({
      ...prev,
      [addonId]: !prev[addonId],
    }));
  };
  
  const selectedPlan = useMemo(() => subscriptionPlans.find(p => p.id === selectedPlanId), [selectedPlanId, subscriptionPlans]);
  const planPrice = selectedPlan?.price || 0;
  
  const addonsPrice = useMemo(() => {
    let price = 0;
    if (selectedAddons.financialModule && !selectedPlan?.features.financialModule) {
      price += addons.find(a => a.id === 'financialModule')?.price || 0;
    }
    if (selectedAddons.whatsappBot && !selectedPlan?.features.whatsappBot) {
      price += addons.find(a => a.id === 'whatsappBot')?.price || 0;
    }
    return price;
  }, [selectedAddons, selectedPlan, addons]);
  
  const totalPrice = planPrice + addonsPrice;
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 dark:text-gray-100">Gerenciar Assinatura</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-rose-500"><X size={20} /></button>
        </div>
        
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
          {/* Planos de Assinatura */}
          <div>
            <h4 className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-4">Escolha seu plano</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subscriptionPlans.map(plan => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedPlanId === plan.id ? 'border-sky-500 bg-sky-500/5' : 'border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 hover:border-slate-300 dark:hover:border-gray-600'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="text-sm font-bold text-slate-800 dark:text-gray-100 whitespace-nowrap">{plan.name}</h5>
                    <div className="w-5 h-5 flex-shrink-0">
                      {selectedPlanId === plan.id && <CheckCircle size={20} className="text-sky-500" />}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-700 dark:text-gray-200">{formatCurrency(plan.price)}<span className="text-xs font-medium text-slate-400">/mês</span></p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 mt-2">
                    <Users size={14} />
                    <span>Até {plan.studentLimit === 'unlimited' ? 'ilimitados' : plan.studentLimit} alunos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Módulos & Integrações */}
          <div>
            <h4 className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-4">Módulos & Integrações</h4>
            <div className="space-y-4">
              {addons.map(addon => {
                  const isIncludedInPlan = !!selectedPlan?.features[addon.id];
                  const isCourtesy = !!settings.courtesyFeatures?.[addon.id];
                  const isPurchased = selectedAddons[addon.id as keyof typeof selectedAddons];
                  const isActive = isIncludedInPlan || isCourtesy || isPurchased;
                  const isDisabled = isIncludedInPlan || isCourtesy;

                  let statusPill;
                  if (isIncludedInPlan) {
                      statusPill = <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">INCLUSO NO PLANO</span>;
                  } else if (isCourtesy) {
                      statusPill = <span className="text-[9px] font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">CORTESIA</span>;
                  }

                  return (
                      <div key={addon.id} className={`p-4 rounded-xl border transition-all ${isActive ? 'bg-slate-50 dark:bg-gray-800/50 border-slate-200 dark:border-gray-700' : 'bg-white dark:bg-gray-900/40 border-slate-200 dark:border-gray-800'}`}>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                      <h4 className="font-bold text-slate-800 dark:text-gray-100">{addon.name}</h4>
                                      {statusPill}
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-md">{addon.description}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                  <div className="text-right">
                                      <p className="font-bold text-slate-700 dark:text-gray-200">+{formatCurrency(addon.price)}</p>
                                      <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">/mês na sua fatura</p>
                                  </div>
                                  <button
                                      type="button"
                                      role="switch"
                                      aria-checked={isActive}
                                      disabled={isDisabled}
                                      onClick={() => handleToggleAddon(addon.id)}
                                      className={`${isActive ? 'bg-sky-500' : 'bg-slate-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900/40 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                      <span aria-hidden="true" className={`${isActive ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400">TOTAL MENSAL</span>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-800 dark:text-gray-100">{formatCurrency(totalPrice)}</span>
                <span className="text-sm font-medium text-slate-500 dark:text-gray-400">({formatCurrency(planPrice)} do plano + {formatCurrency(addonsPrice)} de adicionais)</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 w-full md:w-auto">
            <button onClick={onClose} className="px-6 py-3 rounded-lg text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5">Cancelar</button>
            <button onClick={handleConfirm} className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-sky-600/20">Confirmar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
