import React, { useState } from 'react';

interface PieChartProps {
  title: string;
  data: { name: string; value: number }[];
  onSliceClick: (category: string | null) => void;
}

const CategoryPieChart: React.FC<PieChartProps> = ({ title, data, onSliceClick }) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const colors = [
    '#0ea5e9', '#f97316', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6', '#ef4444'
  ];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  if(data.length === 0) {
    return (
        <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center h-full">
            <h3 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-4 text-center">{title}</h3>
            <p className="text-xs text-slate-400 dark:text-gray-500">Nenhum dado para exibir no mês atual.</p>
        </div>
    )
  }

  let cumulativePercent = 0;
  const slices = data.map((item, index) => {
    const percent = item.value / total;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = percent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX * 0.8} ${startY * 0.8}`,
      `A 0.8 0.8 0 ${largeArcFlag} 1 ${endX * 0.8} ${endY * 0.8}`,
      `L ${endX * 0.5} ${endY * 0.5}`,
      `A 0.5 0.5 0 ${largeArcFlag} 0 ${startX * 0.5} ${startY * 0.5}`,
      'Z'
    ].join(' ');

    return {
      path: pathData,
      color: colors[index % colors.length],
      name: item.name,
      value: item.value
    };
  });

  return (
    <div className="bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="relative">
          <svg viewBox="-1 -1 2 2" className="w-full h-auto transform -rotate-90">
            {slices.map((slice, index) => (
              <path
                key={index}
                d={slice.path}
                fill={slice.color}
                onMouseEnter={() => setHoveredSlice(slice.name)}
                onMouseLeave={() => setHoveredSlice(null)}
                onClick={() => onSliceClick(slice.name)}
                className="cursor-pointer transition-transform duration-200"
                style={{ transform: hoveredSlice === slice.name ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'center' }}
              />
            ))}
          </svg>
          {hoveredSlice && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs font-bold text-slate-600 dark:text-gray-300 text-center max-w-[80px] truncate">{hoveredSlice}</p>
              <p className="text-lg font-black text-slate-800 dark:text-white">
                {((data.find(d => d.name === hoveredSlice)?.value || 0) / total * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {data.sort((a,b) => b.value - a.value).map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between text-xs cursor-pointer p-1 -m-1 rounded hover:bg-slate-100 dark:hover:bg-white/5"
              onClick={() => onSliceClick(item.name)}
              onMouseEnter={() => setHoveredSlice(item.name)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: colors[index % colors.length] }} className="w-3 h-3 rounded-sm" />
                <span className="font-medium text-slate-600 dark:text-gray-300">{item.name}</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-gray-200">{item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPieChart;