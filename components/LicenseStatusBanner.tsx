import React from 'react';
import { License } from '../types';
import { AlertTriangle, CheckCircle, ShieldAlert, CreditCard } from 'lucide-react';

interface LicenseStatusBannerProps {
  license: License;
}

const LicenseStatusBanner: React.FC<LicenseStatusBannerProps> = ({ license }) => {
  if (!license || license.status === 'active') {
    return null; // Não mostra nada se a licença estiver ativa e sem avisos
  }
  
  const expiresDate = new Date(license.expiresAt);
  const today = new Date();
  const diffTime = expiresDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let config = {
    icon: <CheckCircle size={20} />,
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    title: 'Licença Ativa',
    message: 'Sua licença está em dia. Aproveite todos os recursos do Pilates Flow.',
    buttonText: 'Gerenciar Assinatura',
  };

  switch (license.status) {
    case 'expiring_soon':
      config = {
        icon: <AlertTriangle size={20} />,
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        textColor: 'text-amber-600 dark:text-amber-400',
        title: 'Sua Licença está prestes a Expirar!',
        message: `Sua assinatura expira em ${diffDays} dia(s). Renove agora para não perder acesso aos recursos.`,
        buttonText: 'Renovar Agora',
      };
      break;
    case 'expired':
      config = {
        icon: <ShieldAlert size={20} />,
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/20',
        textColor: 'text-rose-600 dark:text-rose-400',
        title: 'Sua Licença Expirou!',
        message: 'Seu acesso aos recursos foi limitado. Regularize sua assinatura para voltar a usar o sistema normalmente.',
        buttonText: 'Regularizar Assinatura',
      };
      break;
    case 'trial':
       config = {
        icon: <CheckCircle size={20} />,
        bgColor: 'bg-sky-500/10',
        borderColor: 'border-sky-500/20',
        textColor: 'text-sky-600 dark:text-sky-400',
        title: 'Você está em um Período de Teste',
        message: `Aproveite para explorar todos os recursos! Seu teste gratuito termina em ${diffDays} dia(s).`,
        buttonText: 'Fazer Upgrade',
      };
      break;
  }
  
  return (
    <div className={`p-4 rounded-2xl border ${config.bgColor} ${config.borderColor} flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in`}>
        <div className="flex items-center gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full hidden md:flex items-center justify-center ${config.textColor} ${config.bgColor}`}>
                {config.icon}
            </div>
            <div>
                <h4 className={`font-bold text-sm ${config.textColor}`}>{config.title}</h4>
                <p className="text-xs text-slate-600 dark:text-gray-300 font-medium">{config.message}</p>
            </div>
        </div>
        <button className="flex-shrink-0 w-full md:w-auto flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-lg shadow-sky-600/20 whitespace-nowrap">
            <CreditCard size={14} />
            {config.buttonText}
        </button>
    </div>
  );
};

export default LicenseStatusBanner;
