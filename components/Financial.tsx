import React, { useState, useMemo, useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { Plus, Pencil, Trash2, X, AlertTriangle, ArrowUpRight, ArrowDownLeft, DollarSign, CheckCircle2, Clock, Filter, Search, Target, TrendingUp, BarChart3, Receipt, FileText, XCircle } from 'lucide-react';
import { Transaction } from '../types';
import FinancialChart from './FinancialChart';
import CategoryPieChart from './CategoryPieChart';

const Financial: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { transactions, instructors, students, settings } = state;

  const [activeTab, setActiveTab] = useState<'overview' | 'projections' | 'commissions'>('overview');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  
  const initialFormState = { description: '', amount: '', date: new Date().toISOString().split('T')[0], type: 'Receita' as 'Receita' | 'Despesa', category: 'Mensalidade', status: 'Pago' as 'Pago' | 'Pendente' };
  const [formData, setFormData] = useState(initialFormState);

  const [typeFilter, setTypeFilter] = useState<'Todas' | 'Receita' | 'Despesa'>('Todas');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'Todas' | 'Pago' | 'Pendente'>('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [localMeta, setLocalMeta] = useState(settings.metaFaturamento);

  useEffect(() => {
    setLocalMeta(settings.metaFaturamento);
  }, [settings.metaFaturamento]);

  const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMeta(Number(e.target.value));
  };

  const handleMetaSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { metaFaturamento: localMeta } });
  };
  
  const handleOpenModal = (transaction: Transaction | null, type: 'Receita' | 'Despesa' = 'Receita') => {
    setEditingTransaction(transaction);
    if (transaction) {
      setFormData({ description: transaction.description, amount: String(transaction.amount), date: transaction.date, type: transaction.type, category: transaction.category, status: transaction.status });
    } else {
      setFormData({ ...initialFormState, type });
    }
    setIsModalOpen(true);
  };

  const handleSaveTransaction = () => {
    if (!formData.description || !formData.amount || !formData.category) return;
    const newTransactionData: Transaction = {
      id: editingTransaction ? editingTransaction.id : Date.now().toString(),
      description: formData.description, amount: parseFloat(formData.amount), date: formData.date, type: formData.type, category: formData.category, status: formData.status, studentId: editingTransaction?.studentId, sourceType: editingTransaction?.sourceType || 'manual'
    };
    const updatedTransactions = editingTransaction ? transactions.map(t => t.id === editingTransaction.id ? newTransactionData : t) : [newTransactionData, ...transactions];
    dispatch({ type: 'UPDATE_TRANSACTIONS', payload: updatedTransactions });
    setIsModalOpen(false);
  };

  const handleDeleteClick = (transaction: Transaction) => { setTransactionToDelete(transaction); setIsDeleteModalOpen(true); };
  
  const executeDelete = () => {
    if (!transactionToDelete) return;
    if (transactionToDelete.studentId && transactionToDelete.sourceType === 'student_payment') {
      const studentToRevert = students.find(s => s.id === transactionToDelete.studentId);
      if (studentToRevert) {
        const updatedStudents = students.map(s => {
          if (s.id === studentToRevert.id) {
            const [day, month, year] = s.expiryDate.split('/').map(Number);
            const currentExpiry = new Date(year, month - 1, day);
            currentExpiry.setMonth(currentExpiry.getMonth() - 1);
            const revertedExpiryDateStr = currentExpiry.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const today = new Date(); today.setHours(0, 0, 0, 0); const revertedExpiryDate = new Date(currentExpiry); revertedExpiryDate.setHours(0,0,0,0);
            const diffTime = revertedExpiryDate.getTime() - today.getTime(); const newDaysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { ...s, expiryDate: revertedExpiryDateStr, daysToExpiry: newDaysToExpiry, isExpired: newDaysToExpiry < 0 };
          }
          return s;
        });
        dispatch({ type: 'UPDATE_STUDENTS', payload: updatedStudents });
      }
    }
    const updatedTransactions = transactions.filter(t => t.id !== transactionToDelete.id);
    dispatch({ type: 'UPDATE_TRANSACTIONS', payload: updatedTransactions });
    setIsDeleteModalOpen(false); setTransactionToDelete(null);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = typeFilter === 'Todas' || t.type === typeFilter;
      const matchesStatus = statusFilter === 'Todas' || t.status === statusFilter;
      const matchesSearch = searchTerm === '' || t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || t.category === categoryFilter;
      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        const transactionDate = new Date(t.date + 'T00:00:00');
        const startDate = new Date(dateRange.start + 'T00:00:00');
        const endDate = new Date(dateRange.end + 'T00:00:00');
        matchesDate = transactionDate >= startDate && transactionDate <= endDate;
      }
      return matchesType && matchesStatus && matchesSearch && matchesDate && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, statusFilter, searchTerm, dateRange, categoryFilter]);

  const financialSummary = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthlyTransactions = transactions.filter(t => { const d = new Date(t.date + 'T00:00:00'); return d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear; });
    const revenue = monthlyTransactions.filter(t => t.type === 'Receita' && t.status === 'Pago').reduce((acc, t) => acc + t.amount, 0);
    const expense = monthlyTransactions.filter(t => t.type === 'Despesa' && t.status === 'Pago').reduce((acc, t) => acc + t.amount, 0);
    return { revenue, expense, balance: revenue - expense, monthlyTransactions };
  }, [transactions]);
  
  const projections = useMemo(() => {
    const today = new Date();
    let totalRevenue = 0, totalExpense = 0;
    for (let i = 1; i <= 3; i++) {
        const month = today.getMonth() - i;
        const year = today.getFullYear();
        const d = new Date(year, month, 1);
        const monthTransactions = transactions.filter(t => { const tDate = new Date(t.date + 'T00:00:00'); return tDate.getUTCMonth() === d.getMonth() && tDate.getUTCFullYear() === d.getFullYear() && t.status === 'Pago'; });
        totalRevenue += monthTransactions.filter(t => t.type === 'Receita').reduce((a,c) => a+c.amount, 0);
        totalExpense += monthTransactions.filter(t => t.type === 'Despesa').reduce((a,c) => a+c.amount, 0);
    }
    const avgRevenue = totalRevenue / 3; const avgExpense = totalExpense / 3; const avgBalance = avgRevenue - avgExpense;
    return { avgRevenue, avgExpense, avgBalance, proj1: avgBalance, proj3: avgBalance * 3, proj6: avgBalance * 6 };
  }, [transactions]);

  const instructorCommissions = useMemo(() => instructors.map(instructor => {
    const instructorStudents = students.filter(s => s.instructor === instructor.name && s.status === 'Ativo'); let totalRevenue = 0;
    instructorStudents.forEach(student => { if (student.planType) { const freq = student.planType.split('x')[0]; const plan = settings.plans.find(p => p.label.includes(`${freq} aula`)); if (plan && plan.value) totalRevenue += parseFloat(plan.value); }});
    const commissionRate = parseFloat(settings.commission) / 100; const commissionValue = totalRevenue * commissionRate;
    return { instructor, totalRevenue, commissionRate, commissionValue };
  }).sort((a, b) => b.commissionValue - a.commissionValue), [instructors, students, settings]);
  
  const categoryData = (type: 'Receita' | 'Despesa') => financialSummary.monthlyTransactions.filter(t => t.type === type && t.status === 'Pago').reduce((acc, t) => { const existing = acc.find(i => i.name === t.category); if(existing) { existing.value += t.amount } else { acc.push({ name: t.category, value: t.amount })} return acc; }, [] as {name: string, value: number}[]);
  
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const commonCategories = ['Mensalidade', 'Aula Avulsa', 'Avaliação', 'Salários', 'Aluguel', 'Infraestrutura', 'Marketing', 'Equipamentos'];

  return (
    <div className="relative pt-8">
      <div className="flex justify-between items-center"><div className="flex items-center gap-3"><h1 className="text-xl font-bold text-slate-800 dark:text-gray-100 uppercase tracking-tighter">Controle Financeiro</h1></div><div className="flex items-center gap-2"><button onClick={() => handleOpenModal(null, 'Receita')} className="flex items-center gap-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold py-2 px-3 rounded-lg text-[10px] transition-all whitespace-nowrap"><Plus size={12} /> Nova Receita</button><button onClick={() => handleOpenModal(null, 'Despesa')} className="flex items-center gap-1.5 bg-rose-600/80 hover:bg-rose-600 text-white font-bold py-2 px-3 rounded-lg text-[10px] transition-all whitespace-nowrap"><Plus size={12} /> Nova Despesa</button></div></div>
      <div className="mt-6 border-b border-slate-200 dark:border-gray-800 flex items-center gap-4"><button onClick={() => setActiveTab('overview')} className={`py-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-sky-500 text-sky-500' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-sky-500'}`}>Visão Geral</button><button onClick={() => setActiveTab('projections')} className={`py-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'projections' ? 'border-sky-500 text-sky-500' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-sky-500'}`}>Projeções & Metas</button><button onClick={() => setActiveTab('commissions')} className={`py-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'commissions' ? 'border-sky-500 text-sky-500' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-sky-500'}`}>Comissões</button></div>

      {activeTab === 'overview' && (<div className="mt-6 space-y-8 animate-in fade-in">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-gray-400 max-w-2xl">Acompanhe a saúde financeira do seu estúdio, analise tendências e gerencie todas as transações de entrada e saída.</p>
        </div>
        <FinancialChart transactions={transactions} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><CategoryPieChart title="Origem das Receitas (Mês)" data={categoryData('Receita')} onSliceClick={(cat) => setCategoryFilter(cat)} /><CategoryPieChart title="Distribuição das Despesas (Mês)" data={categoryData('Despesa')} onSliceClick={(cat) => setCategoryFilter(cat)} /></div>
        <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl">
          <div className="p-4 border-b border-slate-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input type="text" placeholder="Buscar por descrição..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm"/></div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2 w-full"><input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="w-full bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm text-slate-500 dark:text-gray-400"/><span className="text-slate-400">-</span><input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="w-full bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm text-slate-500 dark:text-gray-400"/></div>
              <div className="flex items-center bg-slate-100 dark:bg-gray-900/30 rounded-lg border border-slate-200 dark:border-gray-700 p-1 shadow-sm w-full"><button onClick={() => setTypeFilter('Todas')} className={`flex-1 px-2 py-1 text-[10px] font-bold rounded-md ${typeFilter === 'Todas' ? 'bg-sky-500/10 text-sky-500' : 'text-slate-500'}`}>Todas</button><button onClick={() => setTypeFilter('Receita')} className={`flex-1 px-2 py-1 text-[10px] font-bold rounded-md ${typeFilter === 'Receita' ? 'bg-sky-500/10 text-sky-500' : 'text-slate-500'}`}>Receitas</button><button onClick={() => setTypeFilter('Despesa')} className={`flex-1 px-2 py-1 text-[10px] font-bold rounded-md ${typeFilter === 'Despesa' ? 'bg-sky-500/10 text-sky-500' : 'text-slate-500'}`}>Despesas</button></div>
            </div>
          </div>
          {categoryFilter && (<div className="p-2 bg-sky-500/5 text-center text-xs font-bold text-sky-500 flex justify-center items-center gap-2">Filtrando por: {categoryFilter} <button onClick={() => setCategoryFilter(null)}><XCircle size={14}/></button></div>)}
          <div className="overflow-x-auto"><table className="w-full text-left"><thead className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest"><tr><th className="px-6 py-3">Descrição</th><th className="px-6 py-3 text-right">Valor</th><th className="px-6 py-3">Categoria</th><th className="px-6 py-3">Data</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Ações</th></tr></thead><tbody>{filteredTransactions.map(t => (<tr key={t.id} className="border-t border-slate-100 dark:border-gray-800 hover:bg-slate-50/50 dark:hover:bg-white/5"><td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-gray-200">{t.description}</td><td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'Receita' ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(t.amount)}</td><td className="px-6 py-4"><span className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-gray-700">{t.category}</span></td><td className="px-6 py-4 text-xs text-slate-500 dark:text-gray-400 font-medium">{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td><td className="px-6 py-4"><span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${t.status === 'Pago' ? 'text-emerald-500' : 'text-amber-500'}`}>{t.status === 'Pago' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {t.status}</span></td><td className="px-6 py-4"><div className="flex justify-end gap-2"><button onClick={() => handleOpenModal(t)} className="p-1.5 text-gray-500 hover:text-sky-500"><Pencil size={14} /></button><button onClick={() => handleDeleteClick(t)} className="p-1.5 text-gray-500 hover:text-rose-500"><Trash2 size={14} /></button></div></td></tr>))}</tbody></table></div>
        </div>
      </div>)}
      
      {activeTab === 'projections' && (<div className="mt-6 space-y-8 animate-in fade-in">
        <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl"><div className="flex items-center gap-3 mb-2"><TrendingUp size={16} className="text-sky-500" /><h3 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider">Projeção de Fluxo de Caixa</h3></div><p className="text-xs text-slate-500 dark:text-gray-400 mb-6">Estimativas baseadas na média de receitas e despesas pagas dos últimos 3 meses.</p><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-slate-50 dark:bg-gray-800/50 p-4 rounded-lg"><p className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase">Saldo Projetado (1 Mês)</p><p className={`text-xl font-bold ${projections.proj1 > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(projections.proj1)}</p></div><div className="bg-slate-50 dark:bg-gray-800/50 p-4 rounded-lg"><p className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase">Saldo Projetado (3 Meses)</p><p className={`text-xl font-bold ${projections.proj3 > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(projections.proj3)}</p></div><div className="bg-slate-50 dark:bg-gray-800/50 p-4 rounded-lg"><p className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase">Saldo Projetado (6 Meses)</p><p className={`text-xl font-bold ${projections.proj6 > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(projections.proj6)}</p></div></div></div>
        <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl"><div className="flex items-center gap-3 mb-2"><Target size={16} className="text-sky-500" /><h3 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider">Metas de Faturamento</h3></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"><div className="space-y-4"><label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase ml-1">Definir Meta Mensal de Receita</label><div className="flex items-center gap-2"><div className="relative flex-1"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-gray-500">R$</span><input type="number" value={localMeta} onChange={handleMetaChange} className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm font-medium" /></div><button onClick={handleMetaSave} className="bg-sky-600 text-white font-bold px-4 py-3 rounded-xl text-xs">Salvar</button></div></div><div><p className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase text-center mb-2">Progresso do Mês</p><div className="text-center mb-2"><span className="font-bold text-2xl text-slate-700 dark:text-gray-200">{formatCurrency(financialSummary.revenue)}</span><span className="text-sm font-medium text-slate-500 dark:text-gray-400"> de {formatCurrency(localMeta)}</span></div><div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-4"><div className="bg-emerald-500 h-4 rounded-full" style={{ width: `${Math.min((financialSummary.revenue/localMeta)*100, 100)}%` }}></div></div><p className="text-center text-xs font-bold text-emerald-500 mt-2">{((financialSummary.revenue/localMeta)*100).toFixed(1)}% Atingido</p></div></div></div>
      </div>)}

      {activeTab === 'commissions' && (<div className="mt-6 space-y-8 animate-in fade-in"><div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl"><div className="p-4 border-b border-slate-200 dark:border-gray-800"><h3 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">Relatório de Comissões - Mês Atual</h3></div><div className="overflow-x-auto"><table className="w-full text-left"><thead className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest"><tr><th className="px-6 py-3">Instrutor</th><th className="px-6 py-3 text-right">Faturamento Gerado</th><th className="px-6 py-3 text-center">Comissão</th><th className="px-6 py-3 text-right">Valor a Pagar</th></tr></thead><tbody>{instructorCommissions.map(({ instructor, totalRevenue, commissionRate, commissionValue }) => (<tr key={instructor.id} className="border-t border-slate-100 dark:border-gray-800"><td className="px-6 py-4 flex items-center gap-3"><div className={`w-8 h-8 rounded-full ${instructor.avatarColor} flex items-center justify-center text-white font-bold text-[10px]`}>{instructor.initials}</div><span className="text-sm font-semibold text-slate-700 dark:text-gray-200">{instructor.name}</span></td><td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300 font-medium text-right">{formatCurrency(totalRevenue)}</td><td className="px-6 py-4 text-center"><span className="bg-sky-500/10 text-sky-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{(commissionRate * 100).toFixed(0)}%</span></td><td className="px-6 py-4 text-sm font-bold text-emerald-500 text-right">{formatCurrency(commissionValue)}</td></tr>))}</tbody></table></div></div></div>)}
      
      {isModalOpen && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"><div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95"><div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center"><h3 className="font-bold text-slate-800 dark:text-gray-100">{editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-rose-500"><X size={20} /></button></div><div className="p-8 space-y-6"><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Tipo</label><div className="flex items-center bg-slate-100 dark:bg-gray-800 rounded-xl p-1"><button onClick={() => setFormData({...formData, type: 'Receita'})} className={`flex-1 py-2 text-xs font-bold rounded-lg ${formData.type === 'Receita' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400'}`}>Receita</button><button onClick={() => setFormData({...formData, type: 'Despesa'})} className={`flex-1 py-2 text-xs font-bold rounded-lg ${formData.type === 'Despesa' ? 'bg-rose-500 text-white shadow-lg' : 'text-gray-400'}`}>Despesa</button></div></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Valor</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium">R$</span><input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} autoFocus className="w-full bg-slate-50 dark:bg-gray-800 border rounded-xl px-4 py-3 pl-10 text-sm" /></div></div></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Descrição</label><input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border rounded-xl px-4 py-3 text-sm" /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Categoria</label><input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} list="categories" className="w-full bg-slate-50 dark:bg-gray-800 border rounded-xl px-4 py-3 text-sm" /><datalist id="categories">{commonCategories.map(c => <option key={c} value={c} />)}</datalist></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Data</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 dark:bg-gray-800 border rounded-xl px-4 py-3 text-sm" /></div></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Status</label><div className="flex items-center bg-slate-100 dark:bg-gray-800 rounded-xl p-1"><button onClick={() => setFormData({...formData, status: 'Pago'})} className={`flex-1 py-2 text-xs font-bold rounded-lg ${formData.status === 'Pago' ? 'bg-sky-500 text-white' : 'text-slate-500'}`}>Pago</button><button onClick={() => setFormData({...formData, status: 'Pendente'})} className={`flex-1 py-2 text-xs font-bold rounded-lg ${formData.status === 'Pendente' ? 'bg-amber-500 text-white' : 'text-slate-500'}`}>Pendente</button></div></div></div><div className="p-4 bg-slate-50 dark:bg-gray-800/50 flex justify-end gap-3"><button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold">Cancelar</button><button onClick={handleSaveTransaction} className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs">Salvar Lançamento</button></div></div></div>)}
      
      {isDeleteModalOpen && (<div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"><div className="p-8 text-center"><div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div><h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2">Remover Lançamento?</h3><p className="text-sm text-slate-500 dark:text-gray-400">Esta ação é irreversível. Deseja remover o lançamento <span className="font-bold text-slate-700 dark:text-gray-200">"{transactionToDelete?.description}"</span>?</p></div><div className="p-6 bg-slate-50 dark:bg-gray-800/50 flex gap-3"><button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest">Cancelar</button><button onClick={executeDelete} className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg uppercase tracking-widest text-xs">Sim, Remover</button></div></div></div>)}
    </div>
  );
};

export default Financial;