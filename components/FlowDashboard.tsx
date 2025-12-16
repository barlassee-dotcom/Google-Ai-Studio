
import React, { useState, useMemo } from 'react';
import { FlowPeriod, ProjectionType, Currency, Asset } from '../types';
import { formatMoney } from '../utils/calculations';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface FlowDashboardProps {
  periods: FlowPeriod[];
  projectionType: ProjectionType;
  setProjectionType: (t: ProjectionType) => void;
  viewCurrency: Currency;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  eurRate: number;
}

const FlowDashboard: React.FC<FlowDashboardProps> = ({ 
  periods, projectionType, setProjectionType, viewCurrency, assets, setAssets, eurRate 
}) => {
  const [selectedDetails, setSelectedDetails] = useState<FlowPeriod | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleAsset = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, included: !a.included } : a));
  };

  const filteredPeriods = useMemo(() => {
    if (!searchQuery.trim()) return periods;
    const query = searchQuery.toLowerCase();
    return periods.map(p => {
      const filteredDetails: Record<string, number> = {};
      let hasMatch = p.label.toLowerCase().includes(query);
      
      (Object.entries(p.details) as [string, number][]).forEach(([desc, amount]) => {
        if (desc.toLowerCase().includes(query)) {
          filteredDetails[desc] = amount;
          hasMatch = true;
        }
      });

      if (hasMatch) {
        return { ...p, details: Object.keys(filteredDetails).length > 0 ? filteredDetails : p.details };
      }
      return null;
    }).filter(p => p !== null) as FlowPeriod[];
  }, [periods, searchQuery]);

  const chartData = useMemo(() => {
    return periods.map(p => ({
      label: p.label,
      balance: parseFloat(p.balance.toFixed(2))
    }));
  }, [periods]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-sliders text-blue-600"></i> Projeksiyon
            </h3>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {(['daily', 'weekly', 'monthly'] as ProjectionType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setProjectionType(type)}
                  className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                    projectionType === type ? 'bg-white shadow text-blue-700' : 'text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {type === 'daily' ? 'Günlük' : type === 'weekly' ? 'Haftalık' : 'Aylık'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-vault text-blue-600"></i> Aktif Varlıklar
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {(assets || []).map(asset => (
                <label key={asset.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={asset.included} 
                      onChange={() => toggleAsset(asset.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">{asset.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{asset.subType}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {formatMoney(asset.amount, asset.currency)}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">Başlangıç:</span>
              <span className="text-lg font-black text-blue-700">
                {formatMoney(periods[0]?.balance || 0, viewCurrency)}
              </span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-2xl border shadow-sm h-[450px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Bakiye Projeksiyon Grafiği</h3>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="label" 
                      tick={{fontSize: 9, fill: '#94a3b8'}} 
                      axisLine={false} 
                      tickLine={false} 
                      interval={projectionType === 'daily' ? 7 : 0}
                      height={40}
                    />
                    <YAxis 
                      tick={{fontSize: 10, fill: '#94a3b8'}} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(val) => val >= 1000 || val <= -1000 ? `${(val/1000).toFixed(0)}k` : val}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      formatter={(val: number) => [formatMoney(val, viewCurrency), 'Net Bakiye']}
                    />
                    <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" isAnimationActive={true} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800">Projeksiyon Veri Tablosu</h3>
          </div>
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input 
              type="text" 
              placeholder="İşlem Ara..." 
              className="bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b sticky top-0 z-10 shadow-sm">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dönem</th>
                <th className="p-4 text-xs font-bold text-green-600 uppercase tracking-wider text-right">Giriş</th>
                <th className="p-4 text-xs font-bold text-rose-600 uppercase tracking-wider text-right">Çıkış</th>
                <th className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider text-right">Bakiye</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPeriods.map((p, idx) => (
                <tr key={idx} className={`hover:bg-slate-50 transition-colors ${p.start.getDay() === 0 || p.start.getDay() === 6 ? 'bg-slate-50/30' : ''}`}>
                  <td className="p-4 text-sm font-medium text-slate-600">{p.label}</td>
                  <td className="p-4 text-sm font-bold text-green-600 text-right">{p.incomes > 0 ? formatMoney(p.incomes, viewCurrency) : '-'}</td>
                  <td className="p-4 text-sm font-bold text-rose-600 text-right">{p.expenses > 0 ? formatMoney(p.expenses, viewCurrency) : '-'}</td>
                  <td className="p-4 text-sm font-black text-slate-800 text-right">{formatMoney(p.balance, viewCurrency)}</td>
                  <td className="p-4 text-center">
                    {Object.keys(p.details).length > 0 && (
                      <button onClick={() => setSelectedDetails(p)} className="text-[10px] font-black uppercase text-blue-600 border px-3 py-1.5 rounded-lg">İncele</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h4 className="font-bold text-lg">Dönem İçi İşlemler</h4>
              <button onClick={() => setSelectedDetails(null)} className="p-2 hover:bg-blue-500 rounded-full"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {(Object.entries(selectedDetails.details) as [string, number][]).map(([desc, amount], idx) => (
                  <div key={idx} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <span className="text-sm font-medium text-slate-600">{desc}</span>
                    <span className={`text-sm font-bold ${amount >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                      {amount >= 0 ? '+' : ''}{formatMoney(amount, viewCurrency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowDashboard;
