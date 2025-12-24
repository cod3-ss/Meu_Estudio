import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface FinancialChartProps {
  transactions: Transaction[];
}

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const data: { month: string; revenue: number; expense: number }[] = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
      const year = date.getFullYear();
      const monthYear = `${month}/${String(year).slice(2)}`;

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date + 'T00:00:00');
        return tDate.getUTCFullYear() === date.getFullYear() && tDate.getUTCMonth() === date.getMonth() && t.status === 'Pago';
      });

      const revenue = monthTransactions.filter(t => t.type === 'Receita').reduce((acc, t) => acc + t.amount, 0);
      const expense = monthTransactions.filter(t => t.type === 'Despesa').reduce((acc, t) => acc + t.amount, 0);

      data.push({ month: monthYear, revenue, expense });
    }
    return data;
  }, [transactions]);

  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.flatMap(d => [d.revenue, d.expense]));
    return Math.ceil(max / 1000) * 1000 || 5000;
  }, [chartData]);

  const formatCurrencyAxis = (value: number) => {
    if (value >= 1000) return `R$${value / 1000}k`;
    return `R$${value}`;
  };

  const formatCurrencyPoint = (value: number) => {
    if (value >= 1000) return `R$${(value / 1000).toFixed(1).replace('.', ',')}k`;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const chartHeight = 300;
  const chartWidth = 600; // Base width for calculation
  const padding = { top: 40, right: 20, bottom: 40, left: 60 };

  const points = useMemo(() => {
    const revenuePoints: [number, number][] = [];
    const expensePoints: [number, number][] = [];
    chartData.forEach((d, i) => {
        const x = padding.left + i * ((chartWidth - padding.left - padding.right) / (chartData.length - 1));
        const revenueY = padding.top + (chartHeight - padding.top - padding.bottom) * (1 - d.revenue / maxValue);
        const expenseY = padding.top + (chartHeight - padding.top - padding.bottom) * (1 - d.expense / maxValue);
        revenuePoints.push([x, revenueY]);
        expensePoints.push([x, expenseY]);
    });
    return { revenuePoints, expensePoints };
  }, [chartData, maxValue]);


  const createSmoothPath = (points: [number, number][]): string => {
    if (points.length < 2) return '';
    const controlPoint = (current: [number, number], previous: [number, number] | null, next: [number, number] | null, reverse: boolean) => {
        const p = previous || current;
        const n = next || current;
        const smoothing = 0.2;
        const o = { length: Math.sqrt(Math.pow(n[0] - p[0], 2) + Math.pow(n[1] - p[1], 2)), angle: Math.atan2(n[1] - p[1], n[0] - p[0]) };
        const angle = o.angle + (reverse ? Math.PI : 0);
        const length = o.length * smoothing;
        const x = current[0] + Math.cos(angle) * length;
        const y = current[1] + Math.sin(angle) * length;
        return [x, y];
    };
    const pathParts = points.map((point, i, a) => {
        if (i === 0) return `M ${point[0]},${point[1]}`;
        const [cpsX, cpsY] = controlPoint(a[i-1], a[i-2], point, false);
        const [cpeX, cpeY] = controlPoint(point, a[i-1], a[i+1], true);
        return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
    });
    return pathParts.join(' ');
  };

  const revenueLinePath = createSmoothPath(points.revenuePoints);
  const expenseLinePath = createSmoothPath(points.expensePoints);

  const createAreaPath = (linePath: string, points: [number, number][]) => {
    if (points.length < 2) return '';
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    return `${linePath} L ${lastPoint[0]},${chartHeight - padding.bottom} L ${firstPoint[0]},${chartHeight - padding.bottom} Z`;
  }
  
  const revenueAreaPath = createAreaPath(revenueLinePath, points.revenuePoints);
  const expenseAreaPath = createAreaPath(expenseLinePath, points.expensePoints);

  return (
    <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-4">Balanço dos Últimos 6 Meses</h3>
      <div className="w-full overflow-x-auto custom-scrollbar">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height={chartHeight} className="min-w-[500px]">
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-emerald-300)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-emerald-300)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-rose-300)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-rose-300)" stopOpacity="0" />
            </linearGradient>
            <style>{`
              :root {
                --color-emerald-300: #6ee7b7; --color-emerald-500: #10b981;
                --color-rose-300: #fda4af; --color-rose-500: #f43f5e;
              }
              .dark:root {
                --color-emerald-300: #34d399; --color-rose-300: #fb7185;
              }
            `}</style>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map(tick => {
            const y = padding.top + (chartHeight - padding.top - padding.bottom) * (1 - tick);
            return (
              <g key={tick} className="text-[10px] font-medium text-slate-400 dark:text-gray-500">
                <text x="0" y={y} dy="0.32em" className="fill-current">{formatCurrencyAxis(tick * maxValue)}</text>
                <line x1={padding.left - 8} x2={chartWidth - padding.right} y1={y} y2={y} className="stroke-current text-slate-100 dark:text-gray-800" strokeWidth="1" strokeDasharray="2,3" />
              </g>
            )
          })}
          
          <path d={revenueAreaPath} fill="url(#revenueGradient)" />
          <path d={expenseAreaPath} fill="url(#expenseGradient)" />
          
          <path d={revenueLinePath} stroke="var(--color-emerald-500)" strokeWidth="2.5" fill="none" />
          <path d={expenseLinePath} stroke="var(--color-rose-500)" strokeWidth="2.5" fill="none" />
          
          {chartData.map((d, i) => {
            const [revenueX, revenueY] = points.revenuePoints[i];
            const [expenseX, expenseY] = points.expensePoints[i];
            const revenueLabelY = revenueY - 12;
            const expenseLabelY = expenseY + 22;

            return (
              <g key={i}>
                <circle cx={revenueX} cy={revenueY} r="4" fill="white" stroke="var(--color-emerald-500)" strokeWidth="2" />
                <text x={revenueX} y={revenueLabelY} textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-xs font-bold">{formatCurrencyPoint(d.revenue)}</text>
                
                <circle cx={expenseX} cy={expenseY} r="4" fill="white" stroke="var(--color-rose-500)" strokeWidth="2" />
                <text x={expenseX} y={expenseLabelY} textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 text-xs font-bold">{formatCurrencyPoint(d.expense)}</text>

                <text x={revenueX} y={chartHeight - 5} textAnchor="middle" className="fill-current text-xs font-bold text-slate-500 dark:text-gray-400">
                  {d.month}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="flex justify-center items-center gap-6 mt-4 text-xs font-medium text-slate-500 dark:text-gray-400">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-400"></div>Receita</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-rose-400"></div>Despesa</div>
      </div>
    </div>
  );
};

export default FinancialChart;
