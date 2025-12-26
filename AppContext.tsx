
import React, { createContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { Student, Instructor, Room, Equipment, Transaction, EscalaItem, AgendaItem, UserSession, StudioSettings, SubscriptionPlan, Addon } from './types';
import { superAdminSubscriptionPlans, superAdminAddons } from './superAdminMockData';
import { 
  mockStudentsData, 
  mockInstructorsData, 
  mockRoomsData, 
  mockEquipmentsData, 
  mockTransactionsData, 
  mockAgendaData, 
  mockEscalaData 
} from './mockData';
import { api } from './services/api';

interface SettingsData extends StudioSettings {
  isDarkMode: boolean;
}

interface SuperAdminSettings {
  defaultTrialDays: number;
  defaultCommission: number;
  defaultAlertDays: number;
  supportLink: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: UserSession | null;
  impersonatingFrom: UserSession | null;
  students: Student[];
  instructors: Instructor[];
  rooms: Room[];
  equipments: Equipment[];
  transactions: Transaction[];
  escala: EscalaItem[];
  agenda: AgendaItem[];
  settings: SettingsData;
  superAdminSettings: SuperAdminSettings;
  subscriptionPlans: SubscriptionPlan[];
  addons: Addon[];
  activeTab: string;
  passwordJustChanged: boolean;
  isLoading: boolean;
}

type Action = 
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'UPDATE_STUDENTS'; payload: Student[] }
  | { type: 'UPDATE_INSTRUCTORS'; payload: Instructor[] }
  | { type: 'UPDATE_ROOMS'; payload: Room[] }
  | { type: 'UPDATE_EQUIPMENTS'; payload: Equipment[] }
  | { type: 'UPDATE_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'UPDATE_ESCALA'; payload: EscalaItem[] }
  | { type: 'UPDATE_AGENDA'; payload: AgendaItem[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<SettingsData> }
  | { type: 'UPDATE_SUPER_ADMIN_SETTINGS'; payload: Partial<SuperAdminSettings> }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'TOGGLE_THEME' }
  | { type: 'LOGIN'; payload: { user: UserSession, settings?: StudioSettings, token: string } }
  | { type: 'LOGOUT' }
  | { type: 'PASSWORD_CHANGED' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: { planId: string, purchasedAddons: { financialModule?: boolean; whatsappBot?: boolean; } } }
  | { type: 'IMPERSONATE'; payload: { user: UserSession, settings: StudioSettings } }
  | { type: 'STOP_IMPERSONATING' }
  | { type: 'UPDATE_SUBSCRIPTION_PLANS'; payload: SubscriptionPlan[] }
  | { type: 'UPDATE_ADDONS'; payload: Addon[] };

const initialSettings: SettingsData = {
  isDarkMode: true,
  appName: 'Meu Estúdio',
  logo: null,
  phone: '',
  email: '',
  modality: 'Pilates',
  documentType: 'CNPJ',
  document: '',
  adminPassword: '',
  address: { cep: '', street: '', number: '', neighborhood: '', city: '', state: '', complement: '' },
  plans: [
    { label: 'Valor para 1 aula por semana', value: '150' },
    { label: 'Valor para 2 aulas por semana', value: '250' },
    { label: 'Valor para 3 aulas por semana', value: '320' },
    { label: 'Valor para 4 aulas por semana', value: '380' },
    { label: 'Valor para 5 aulas por semana', value: '420' },
  ],
  commission: '40',
  alertDays: '7',
  autoInactiveDays: '30',
  instructorSeesAllStudents: false,
  metaFaturamento: 10000,
};

const initialState: AppState = {
  isAuthenticated: !!localStorage.getItem('auth_token'),
  user: null,
  impersonatingFrom: null,
  // Populando com mockData para garantir funcionamento offline/dev
  students: mockStudentsData,
  instructors: mockInstructorsData,
  rooms: mockRoomsData,
  equipments: mockEquipmentsData,
  transactions: mockTransactionsData,
  escala: mockEscalaData,
  agenda: mockAgendaData,
  settings: initialSettings,
  superAdminSettings: { defaultTrialDays: 30, defaultCommission: 40, defaultAlertDays: 7, supportLink: '' },
  subscriptionPlans: superAdminSubscriptionPlans,
  addons: superAdminAddons,
  activeTab: 'painel',
  passwordJustChanged: false,
  isLoading: false
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE': return { ...state, ...action.payload };
    case 'UPDATE_STUDENTS': return { ...state, students: action.payload };
    case 'UPDATE_INSTRUCTORS': return { ...state, instructors: action.payload };
    case 'UPDATE_ROOMS': return { ...state, rooms: action.payload };
    case 'UPDATE_EQUIPMENTS': return { ...state, equipments: action.payload };
    case 'UPDATE_TRANSACTIONS': return { ...state, transactions: action.payload };
    case 'UPDATE_ESCALA': return { ...state, escala: action.payload };
    case 'UPDATE_AGENDA': return { ...state, agenda: action.payload };
    case 'UPDATE_SETTINGS': return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_SUPER_ADMIN_SETTINGS': return { ...state, superAdminSettings: { ...state.superAdminSettings, ...action.payload } };
    case 'SET_ACTIVE_TAB': return { ...state, activeTab: action.payload };
    case 'TOGGLE_THEME': return { ...state, settings: { ...state.settings, isDarkMode: !state.settings.isDarkMode } };
    case 'LOGIN': 
      localStorage.setItem('auth_token', action.payload.token);
      return { ...state, isAuthenticated: true, user: action.payload.user, settings: action.payload.settings ? { ...initialSettings, ...action.payload.settings, isDarkMode: state.settings.isDarkMode } : state.settings };
    case 'LOGOUT': 
      localStorage.removeItem('auth_token');
      // Ao deslogar, resetamos para o initialState (que contém os mocks)
      return { ...initialState, isAuthenticated: false, settings: state.settings };
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    case 'IMPERSONATE': return { ...state, impersonatingFrom: state.user, user: action.payload.user, settings: { ...state.settings, ...action.payload.settings }, activeTab: 'painel' };
    case 'STOP_IMPERSONATING': return { ...state, user: state.impersonatingFrom, impersonatingFrom: null, activeTab: 'clients' };
    default: return state;
  }
};

export const AppContext = createContext<{ state: AppState; dispatch: Dispatch<Action> }>({ state: initialState, dispatch: () => null });

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  useEffect(() => {
    if (state.isAuthenticated) {
        const syncData = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                // Tentamos buscar os dados reais. Se falhar (404), o catch individual garante que a UI use os mocks já carregados.
                const [students, instructors, rooms, equipments, transactions, agenda, settings] = await Promise.all([
                    api.get('/students').catch(() => null),
                    api.get('/instructors').catch(() => null),
                    api.get('/rooms').catch(() => null),
                    api.get('/equipments').catch(() => null),
                    api.get('/transactions').catch(() => null),
                    api.get('/agenda').catch(() => null),
                    api.get('/settings').catch(() => null),
                ]);

                if (students) dispatch({ type: 'UPDATE_STUDENTS', payload: students });
                if (instructors) dispatch({ type: 'UPDATE_INSTRUCTORS', payload: instructors });
                if (rooms) dispatch({ type: 'UPDATE_ROOMS', payload: rooms });
                if (equipments) dispatch({ type: 'UPDATE_EQUIPMENTS', payload: equipments });
                if (transactions) dispatch({ type: 'UPDATE_TRANSACTIONS', payload: transactions });
                if (agenda) dispatch({ type: 'UPDATE_AGENDA', payload: agenda });
                if (settings) dispatch({ type: 'UPDATE_SETTINGS', payload: settings });

            } catch (error) {
                // Erro silencioso no console para não assustar o usuário/dev
                console.info("Servidor offline ou rotas não implementadas. Operando com dados locais.");
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };
        syncData();
    }
  }, [state.isAuthenticated]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.isDarkMode);
  }, [state.settings.isDarkMode]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};
