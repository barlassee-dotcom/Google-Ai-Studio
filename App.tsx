import React, { useState, useEffect, useMemo } from 'react';
import { Asset, Check, RecurringRule, Transaction, CustomTab, ProjectionType, Currency } from './types';
import { calculateFlow } from './utils/calculations';
import { syncPath, updatePath } from './services/firebaseService';

// Sub-components
import Sidebar from './components/Sidebar';
import FlowDashboard from './components/FlowDashboard';
import AssetManager from './components/AssetManager';
import CheckManager from './components/CheckManager';
import RecurringManager from './components/RecurringManager';
import ManualManager from './components/ManualManager';
import ExcelTabs from './components/ExcelTabs';
import AIChatAssistant from './components/AIChatAssistant';
import AIAnalysisTab from './components/AIAnalysisTab';

const App: React.FC = () => {
  // Firestore Paths
  const FB_PATHS = {
    ASSETS: 'cashflow/assets',
    CHECKS: 'cashflow/checks',
    MANUAL: 'cashflow/manual_trans',
    RULES: 'cashflow/recurring_rules',
    TABS: 'cashflow/custom_tabs'
  };

  // State
  const [activeTab, setActiveTab] = useState('flow');
  const [eurRate, setEurRate] = useState(36.50);
  const [viewCurrency, setViewCurrency] = useState<Currency>('TL');
  const [projectionType, setProjectionType] = useState<ProjectionType>('daily');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [checks, setChecks] = useState<Check[]>([]);
  const [manualTransactions, setManualTransactions] = useState<Transaction[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([]);

  // Live Sync from Firestore
  useEffect(() => {
    const unsubAssets = syncPath(FB_PATHS.ASSETS, (val) => setAssets(val || []));
    const unsubChecks = syncPath(FB_PATHS.CHECKS, (val) => setChecks(val || []));
    const unsubManual = syncPath(FB_PATHS.MANUAL, (val) => setManualTransactions(val || []));
    const unsubRules = syncPath(FB_PATHS.RULES, (val) => setRecurringRules(val || []));
    const unsubTabs = syncPath(FB_PATHS.TABS, (val) => setCustomTabs(val || []));

    fetchEurRate();

    return () => {
      unsubAssets();
      unsubChecks();
      unsubManual();
      unsubRules();
      unsubTabs();
    };
  }, []);

  // Update Wrappers for Firestore
  const handleSetAssets = (val: any) => {
    const next = typeof val === 'function' ? val(assets) : val;
    setAssets(next);
    updatePath(FB_PATHS.ASSETS, next);
  };

  const handleSetChecks = (val: any) => {
    const next = typeof val === 'function' ? val(checks) : val;
    setChecks(next);
    updatePath(FB_PATHS.CHECKS, next);
  };

  const handleSetManual = (val: any) => {
    const next = typeof val === 'function' ? val(manualTransactions) : val;
    setManualTransactions(next);
    updatePath(FB_PATHS.MANUAL, next);
  };

  const handleSetRules = (val: any) => {
    const next = typeof val === 'function' ? val(recurringRules) : val;
    setRecurringRules(next);
    updatePath(FB_PATHS.RULES, next);
  };

  const handleSetTabs = (val: any) => {
    const next = typeof val === 'function' ? val(customTabs) : val;
    setCustomTabs(next);
    updatePath(FB_PATHS.TABS, next);
  };

  const fetchEurRate = async () => {
    try {
      const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY');
      if (response.ok) {
        const data = await response.json();
        setEurRate(data.rates.TRY);
      }
    } catch (e) { console.error("Rate fetch failed", e); }
  };

  const periods = useMemo(() => 
    calculateFlow(projectionType, assets, checks, manualTransactions, recurringRules, eurRate, viewCurrency),
    [projectionType, assets, checks, manualTransactions, recurringRules, eurRate, viewCurrency]
  );

  const handleExport = () => {
    const data = { assets, checks, manualTransactions, recurringRules, customTabs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `primus-cashflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (re: any) => {
        try {
          const data = JSON.parse(re.target.result as string);
          if (data.assets) handleSetAssets(data.assets);
          if (data.checks) handleSetChecks(data.checks);
          if (data.manualTransactions) handleSetManual(data.manualTransactions);
          if (data.recurringRules) handleSetRules(data.recurringRules);
          if (data.customTabs) handleSetTabs(data.customTabs);
          alert("Veriler Firebase Firestore'a aktarıldı.");
        } catch (err) { alert("Geçersiz yedek dosyası."); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(id) => {
          setActiveTab(id);
          setIsMobileMenuOpen(false);
        }} 
        customTabs={customTabs}
        setCustomTabs={handleSetTabs}
        onExport={handleExport}
        onImport={handleImport}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto relative w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden bg-white p-3 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 shadow-sm transition-all active:scale-95"
            >
              <i className="fa-solid fa-bars-staggered text-lg"></i>
            </button>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                  Primus Coating <span className="text-blue-600 underline decoration-blue-200 underline-offset-4 font-black">CASHFLOW</span>
                </h1>
                <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full border border-indigo-100">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Firestore Sync</span>
                </div>
              </div>
              <p className="text-slate-500 text-[11px] md:text-sm font-medium">Kurumsal Bulut Projeksiyon Sistemi v4.2</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3 border-r border-slate-100 pr-4">
              <span className="text-[10px] font-black text-slate-400 uppercase">1 EUR</span>
              <input 
                type="number" 
                value={eurRate} 
                onChange={(e) => setEurRate(Number(e.target.value))}
                className="w-16 text-sm font-bold bg-transparent outline-none border-b border-transparent focus:border-blue-500 transition-all"
              />
              <span className="text-xs font-bold text-slate-500">TL</span>
            </div>
            
            <div className="flex bg-slate-50 p-1 rounded-lg">
              <button 
                onClick={() => setViewCurrency('TL')}
                className={`px-4 py-1.5 rounded-md text-[11px] font-black transition-all ${viewCurrency === 'TL' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                TL
              </button>
              <button 
                onClick={() => setViewCurrency('EUR')}
                className={`px-4 py-1.5 rounded-md text-[11px] font-black transition-all ${viewCurrency === 'EUR' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                EUR
              </button>
            </div>
          </div>
        </header>

        <div className="pb-24">
          {activeTab === 'flow' && (
            <FlowDashboard 
              periods={periods} 
              projectionType={projectionType} 
              setProjectionType={setProjectionType}
              viewCurrency={viewCurrency}
              assets={assets}
              setAssets={handleSetAssets}
              eurRate={eurRate}
            />
          )}

          {activeTab === 'ai-analysis' && (
            <AIAnalysisTab periods={periods} viewCurrency={viewCurrency} />
          )}

          {activeTab === 'assets' && (
            <AssetManager assets={assets} setAssets={handleSetAssets} viewCurrency={viewCurrency} eurRate={eurRate} />
          )}

          {activeTab === 'checks' && (
            <CheckManager checks={checks} setChecks={handleSetChecks} />
          )}

          {activeTab === 'recurring' && (
            <RecurringManager rules={recurringRules} setRules={handleSetRules} />
          )}

          {activeTab === 'manual' && (
            <ManualManager transactions={manualTransactions} setTransactions={handleSetManual} />
          )}

          {activeTab.startsWith('cust-') && (
            <ExcelTabs 
              tabId={activeTab} 
              transactions={manualTransactions} 
              setTransactions={handleSetManual} 
              customTabs={customTabs}
              setCustomTabs={handleSetTabs}
            />
          )}
        </div>
      </main>

      <AIChatAssistant assets={assets} periods={periods} />
    </div>
  );
};

export default App;