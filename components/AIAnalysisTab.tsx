
import React, { useState } from 'react';
import { FlowPeriod, Currency } from '../types';
import { analyzeCashFlow } from '../services/geminiService';
import MarketInsights from './MarketInsights';

interface AIAnalysisTabProps {
  periods: FlowPeriod[];
  viewCurrency: Currency;
}

const AIAnalysisTab: React.FC<AIAnalysisTabProps> = ({ periods, viewCurrency }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeCashFlow(periods);
    setAiAnalysis(result.text);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
         <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
         </div>
         <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Finansal Analiz Merkezi</h2>
            <p className="text-slate-500 text-sm">Primus Coating için özelleştirilmiş piyasa verileri ve projeksiyon analizi.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Real-time Market Data Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Piyasa Görünümü</h3>
          </div>
          <MarketInsights />
        </section>

        {/* Custom Flow Analysis Section */}
        <section className="bg-white p-8 rounded-3xl border shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
               <div className="bg-slate-100 p-4 rounded-2xl text-slate-700">
                  <i className="fa-solid fa-chart-pie text-2xl"></i>
               </div>
               <div>
                  <h3 className="font-bold text-slate-800 text-lg">Projeksiyon Analizi</h3>
                  <p className="text-slate-500 text-sm">Mevcut nakit akışı verileriniz üzerinden risk ve fırsat değerlendirmesi.</p>
               </div>
            </div>
            
            <button 
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
              className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-xl ${
                isAnalyzing 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-slate-200'
              }`}
            >
              {isAnalyzing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-brain"></i>}
              {isAnalyzing ? 'Analiz Yapılıyor...' : 'Akış Analizi Oluştur'}
            </button>
          </div>

          {aiAnalysis ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                 <i className="fa-solid fa-message-check text-green-500"></i>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Raporu Sonuçları</span>
              </div>
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed prose prose-slate max-w-none">
                {aiAnalysis}
              </div>
              <div className="mt-8 pt-6 border-t flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span>Primus Coating Finansal Zekası v3.5</span>
                <span>Son Güncelleme: {new Date().toLocaleTimeString('tr-TR')}</span>
              </div>
            </div>
          ) : !isAnalyzing && (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
               <i className="fa-solid fa-chart-line text-6xl mb-4"></i>
               <p className="text-lg font-medium text-slate-600">Analiz butonuna basarak mevcut projeksiyonunuzun<br/>AI tarafından değerlendirilmesini sağlayabilirsiniz.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
               <div className="flex gap-2 mb-6">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
                  <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
               </div>
               <p className="text-slate-600 font-bold animate-pulse tracking-wide">Primus Coating verileri işleniyor...</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AIAnalysisTab;
