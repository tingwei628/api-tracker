import React from 'react';
import { AnalysisResult as ResultType } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisResultProps {
  result: ResultType;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  const isDeficient = result.recommendation.status === 'DEFICIENT';
  const progressColor = isDeficient ? 'bg-orange-500' : 'bg-emerald-500';
  const textColor = isDeficient ? 'text-orange-700' : 'text-emerald-700';
  const borderColor = isDeficient ? 'border-orange-200' : 'border-emerald-200';
  const bgColor = isDeficient ? 'bg-orange-50' : 'bg-emerald-50';

  // Prepare data for Recharts
  const chartData = result.breakdown.map((item, index) => ({
    name: item.item.length > 15 ? item.item.substring(0, 12) + '...' : item.item,
    api: item.totalAPI,
    fill: index % 2 === 0 ? '#10b981' : '#34d399' // Alternating green shades
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* SECTION 1: TOTAL API STATUS */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
          🛡️ Total API Status
        </h2>
        
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-2">
            <div>
                <span className="text-4xl font-extrabold text-slate-900">{result.totalScore.toLocaleString()}</span>
                <span className="text-sm font-medium text-slate-500 ml-2">/ {result.targetScore.toLocaleString()} Target</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${bgColor} ${textColor} mt-2 sm:mt-0`}>
                {result.percentage >= 100 ? 'Optimized' : `${result.percentage}% Complete`}
            </span>
        </div>

        {/* Custom Progress Bar */}
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
            <div 
                className={`h-full transition-all duration-1000 ease-out ${progressColor}`} 
                style={{ width: `${Math.min(result.percentage, 100)}%` }}
            />
        </div>
        
        <p className="text-sm text-slate-500">
            Deficiency Focus: <span className="font-semibold text-slate-700">{result.deficiencyCategory}</span>
        </p>
      </section>

      {/* SECTION 2: API BREAKDOWN */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-6">
          📊 API Quantification Breakdown
        </h2>

        {/* Mobile Chart Visualization */}
        <div className="h-48 w-full mb-6">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Bar dataKey="api" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Source</th>
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Portion (g)</th>
                        <th className="px-4 py-3 rounded-tr-lg text-right">Total API</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {result.breakdown.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-slate-500">{item.source}</td>
                            <td className="px-4 py-3 font-medium text-slate-800">{item.item}</td>
                            <td className="px-4 py-3 text-slate-600">{item.portion}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-800">{item.totalAPI.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </section>

      {/* SECTION 3: RECOMMENDATION */}
      <section className={`rounded-2xl shadow-sm border p-6 ${bgColor} ${borderColor} transition-all`}>
        <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${isDeficient ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                 {isDeficient ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                 )}
            </div>
            <div>
                <h2 className={`text-xs font-bold tracking-widest uppercase mb-1 ${textColor}`}>
                    🎯 Action: {isDeficient ? 'Targeted Recommendation' : 'Target Met'}
                </h2>
                <p className={`font-semibold text-lg mb-2 ${isDeficient ? 'text-slate-800' : 'text-emerald-900'}`}>
                    {result.recommendation.message}
                </p>
                {result.recommendation.foodSuggestion && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm mt-1">
                        <span className="text-sm font-medium text-slate-600">Suggested:</span>
                        <span className="text-sm font-bold text-slate-900">{result.recommendation.foodSuggestion}</span>
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
};

export default AnalysisResult;