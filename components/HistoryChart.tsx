
import React from 'react';
import { AnalysisResult } from '../types';

interface HistoryChartProps {
  history: AnalysisResult[];
}

const stressLevelToNumber = (level: 'low' | 'moderate' | 'high'): number => {
  switch (level) {
    case 'low': return 1;
    case 'moderate': return 2;
    case 'high': return 3;
    default: return 0;
  }
};

const BarChart = ({ title, data, colorClass, yAxisLabels }: { title: string, data: { value: number; label: string }[], colorClass: string, yAxisLabels: string[] }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

    return (
        <div>
            <h4 className="text-sm font-bold text-gray-300 mb-3 text-center">{title}</h4>
            <div className="flex gap-2 h-40 items-end border-b border-l border-gray-600 pb-1 ps-2 relative">
                {/* Y-Axis Labels */}
                <div className="absolute -left-1 bottom-0 h-full flex flex-col justify-between text-xs text-gray-500 transform -translate-x-full pr-1">
                    <span>{yAxisLabels[1]}</span>
                    <span>{yAxisLabels[0]}</span>
                </div>

                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                         {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {item.value}
                        </div>
                        {/* Bar */}
                        <div
                            className={`w-full rounded-t-sm transition-all duration-500 ease-out ${colorClass}`}
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                            title={`${item.label}: ${item.value}`}
                        ></div>
                         {/* X-Axis Label */}
                        <span className="text-xs text-gray-500 mt-1" dir="ltr">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
  // Show most recent last (chronological order), limit to last 7 for readability
  const chartHistory = [...history].reverse().slice(-7);

  const energyData = chartHistory.map(item => ({
    value: item.formula.summary.energyIndex,
    label: item.formula.code.slice(-4),
  }));

  const stressData = chartHistory.map(item => ({
    value: stressLevelToNumber(item.formula.summary.stressLevel),
    label: item.formula.code.slice(-4),
  }));

  return (
    <div className="space-y-8">
        <BarChart 
            title="روند شاخص انرژی" 
            data={energyData} 
            colorClass="bg-gradient-to-t from-emerald-500 to-green-500"
            yAxisLabels={['۰', '۱۰۰']}
        />
        <BarChart 
            title="روند سطح استرس" 
            data={stressData} 
            colorClass="bg-gradient-to-t from-cyan-500 to-blue-500"
            yAxisLabels={['پایین', 'بالا']}
        />
    </div>
  );
};

export default HistoryChart;
