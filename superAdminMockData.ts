import { Client, StudioSettings, SubscriptionPlan, Addon } from './types';

// FIX: Added missing metaFaturamento property to satisfy the StudioSettings type.
const createDefaultSettings = (appName: string): StudioSettings => ({
  appName,
  logo: null,
  phone: '(11) 91234-5678',
  email: 'contato@email.com',
  documentType: 'CNPJ',
  document: '00.000.000/0001-00',
  adminPassword: 'admin123',
  address: {
    cep: '01001-000', street: 'Praça da Sé', number: '1', neighborhood: 'Sé', city: 'São Paulo', state: 'SP', complement: ''
  },
  plans: [
    { label: 'Valor para 1 aula por semana', value: '150' },
    { label: 'Valor para 2 aulas por semana', value: '250' },
    { label: 'Valor para 3 aulas por semana', value: '320' },
    { label: 'Valor para 4 aulas por semana', value: '380' },
    { label: 'Valor para 5 aulas por semana', value: '420' },
    { label: 'Valor para 6 aulas por semana', value: '440' },
    { label: 'Valor para 7 aulas por semana', value: '450' },
  ],
  commission: '40',
  alertDays: '7',
  autoInactiveDays: '30',
  instructorSeesAllStudents: false,
  metaFaturamento: 10000,
  courtesyFeatures: {},
  purchasedAddons: {},
});

export const superAdminClients: Client[] = [
    {
        id: 'CLI-001',
        studioName: 'Pilates Flow - Moema',
        adminName: 'Ana Clara Souza',
        adminPassword: 'admin123',
        licenseStatus: 'Ativa',
        expiresAt: '15/01/2026',
        studentCount: 52,
        instructorCount: 4,
        mrr: 299.90,
        subscriptionPlanId: 'plan_premium',
        settings: createDefaultSettings('Pilates Flow - Moema'),
        courtesyFeatures: {},
        purchasedAddons: {},
    },
    {
        id: 'CLI-002',
        studioName: 'Studio Zen Pilates',
        adminName: 'Roberto Martins',
        adminPassword: 'admin123',
        licenseStatus: 'Teste',
        expiresAt: '28/12/2025',
        studentCount: 12,
        instructorCount: 2,
        mrr: 0,
        subscriptionPlanId: 'trial',
        settings: createDefaultSettings('Studio Zen Pilates'),
        courtesyFeatures: {},
        purchasedAddons: {},
    },
    {
        id: 'CLI-003',
        studioName: 'Corpo & Mente Pilates',
        adminName: 'Juliana Ferreira',
        adminPassword: 'admin123',
        licenseStatus: 'Ativa',
        expiresAt: '10/06/2026',
        studentCount: 89,
        instructorCount: 7,
        mrr: 199.90,
        subscriptionPlanId: 'plan_pro',
        settings: createDefaultSettings('Corpo & Mente Pilates'),
        courtesyFeatures: {},
        purchasedAddons: {},
    },
    {
        id: 'CLI-004',
        studioName: 'Vitality Studio',
        adminName: 'Carlos Andrade',
        adminPassword: 'admin123',
        licenseStatus: 'Expirada',
        expiresAt: '01/11/2025',
        studentCount: 34,
        instructorCount: 3,
        mrr: 159.90,
        subscriptionPlanId: 'plan_intermediate',
        settings: createDefaultSettings('Vitality Studio'),
        courtesyFeatures: {},
        purchasedAddons: {},
    },
    {
        id: 'CLI-005',
        studioName: 'Studio Harmonia',
        adminName: 'Fernanda Lima',
        adminPassword: 'admin123',
        licenseStatus: 'Pendente',
        expiresAt: '12/12/2025',
        studentCount: 41,
        instructorCount: 4,
        mrr: 159.90, // 119.90 (plano) + 40.00 (addon financeiro)
        subscriptionPlanId: 'plan_basic',
        settings: createDefaultSettings('Studio Harmonia'),
        courtesyFeatures: {},
        purchasedAddons: {
            financialModule: true,
        },
    },
    {
        id: 'CLI-006',
        studioName: 'Pilates Premium',
        adminName: 'Gustavo Borges',
        adminPassword: 'admin123',
        licenseStatus: 'Ativa',
        expiresAt: '20/08/2026',
        studentCount: 120,
        instructorCount: 10,
        mrr: 299.90,
        subscriptionPlanId: 'plan_premium',
        settings: createDefaultSettings('Pilates Premium'),
        courtesyFeatures: {},
        purchasedAddons: {},
    },
];

export const superAdminSubscriptionPlans: SubscriptionPlan[] = [
    {
        id: 'plan_basic',
        name: 'Plano Básico',
        price: 119.90,
        studentLimit: 200,
        features: {
            dashboard: true,
            detailedAgenda: true,
            scale: true,
            studentManagement: true,
            instructorManagement: true,
            roomsManagement: true,
            bulkAllocation: true,
            financialModule: false,
            whatsappBot: false,
        }
    },
    {
        id: 'plan_intermediate',
        name: 'Plano Intermediário',
        price: 159.90,
        studentLimit: 300,
        features: {
            dashboard: true,
            detailedAgenda: true,
            scale: true,
            studentManagement: true,
            instructorManagement: true,
            roomsManagement: true,
            bulkAllocation: true,
            financialModule: true,
            whatsappBot: false,
        }
    },
    {
        id: 'plan_pro',
        name: 'Plano Pro',
        price: 199.90,
        studentLimit: 500,
        features: {
            dashboard: true,
            detailedAgenda: true,
            scale: true,
            studentManagement: true,
            instructorManagement: true,
            roomsManagement: true,
            bulkAllocation: true,
            financialModule: true,
            whatsappBot: true,
        }
    },
    {
        id: 'plan_premium',
        name: 'Plano Premium',
        price: 299.90,
        studentLimit: 'unlimited',
        features: {
            dashboard: true,
            detailedAgenda: true,
            scale: true,
            studentManagement: true,
            instructorManagement: true,
            roomsManagement: true,
            bulkAllocation: true,
            financialModule: true,
            whatsappBot: true,
        }
    }
];

export const superAdminAddons: Addon[] = [
  {
    id: 'financialModule',
    name: 'Módulo Financeiro',
    description: 'Controle total de receitas, despesas, fluxo de caixa e comissões de instrutores.',
    price: 39.90
  },
  {
    id: 'whatsappBot',
    name: 'Chatbot WhatsApp',
    description: 'Automatize agendamentos, confirmações e lembretes de aulas diretamente pelo WhatsApp.',
    price: 39.90
  }
];