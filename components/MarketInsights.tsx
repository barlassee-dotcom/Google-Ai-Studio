
import React, { useState, useEffect } from 'react';
import { fetchMarketInsights } from '../services/geminiService';

const MarketInsights: React.FC = () => {
  const [data, setData] = useState<{ text: string, sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const getInsights = async () => {
    setLoading(true);
    const result = await fetchMarketInsights();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    getInsights();
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <i className="fa-solid fa-tower-broadcast text-6xl text-indigo-900"></i>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200">
            <i className="fa-solid fa-chart-line-up"></i>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 tracking-tight">AI Piyasa Analizi & Beklentiler</h3>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Canlı Ekonomi Verileri</p>
          </div>
        </div>
        <button 
          onClick={getInsights} 
          disabled={loading}
          className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-100 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-arrows-rotate"></i>}
          Güncelle
        </button>
      </div>

      {loading ? (
        <div className="py-8 space-y-4">
          <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
          <div className="h-4 bg-slate-100 rounded-full w-1/2 animate-pulse"></div>
          <div className="h-4 bg-slate-100 rounded-full w-2/3 animate-pulse"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {data?.text}
          </div>
          
          {data?.sources && data.sources.length > 0 && (
            <div className="pt-4 border-t border-indigo-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kaynaklar</p>
              <div className="flex flex-wrap gap-2">
                {data.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white border border-indigo-50 px-3 py-1.5 rounded-lg text-[10px] font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    <i className="fa-solid fa-link mr-1"></i> {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketInsights;
