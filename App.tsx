import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Asset, Check, RecurringRule, Transaction, CustomTab, ProjectionType, Currency } from './types';
import { calculateFlow, toLocalYMD, formatMoney } from './utils/calculations';
import { saveToCloud, loadFromCloud } from './services/firebaseService';

// Sub-components
import Sidebar from './components/Sidebar';
import FlowDashboard from './components/FlowDashboard';
import AssetManager from './components/AssetManager';
import CheckManager from './components/CheckManager';
import RecurringManager from './components/RecurringManager';
import ManualManager from './components/ManualManager';
import ExcelTabs from './components/ExcelTabs';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('flow');
  const [eurRate, setEurRate] = useState(36.50);
  const [usdRate, setUsdRate] = useState(34.20);
  const [viewCurrency, setViewCurrency] = useState<Currency>('TL');
  const [projectionType, setProjectionType] = useState<ProjectionType>('daily');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [checks, setChecks] = useState<Check[]>([]);
  const [manualTransactions, setManualTransactions] = useState<Transaction[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([]);

  // Verileri Firebase'den çek
  useEffect(() => {
    const initData = async () => {
      setSyncStatus('syncing');
      try {
        const cloudData = await loadFromCloud();
        if (cloudData) {
          if (cloudData.assets) setAssets(cloudData.assets);
          if (cloudData.checks) setChecks(cloudData.checks);
          if (cloudData.manualTransactions) setManualTransactions(cloudData.manualTransactions);
          if (cloudData.recurringRules) setRecurringRules(cloudData.recurringRules);
          if (cloudData.customTabs) setCustomTabs(cloudData.customTabs);
        }
        setSyncStatus('synced');
      } catch (e) {
        console.error("Cloud Load Failed:", e);
        setSyncStatus('error');
      } finally {
        setIsInitialLoadDone(true);
      }
    };
    initData();
    fetchRates();

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Herhangi bir veri değiştiğinde Firebase'e kaydet (Debounced Sync)
  useEffect(() => {
    // İlk yükleme bitmeden kayıt yapma (verilerin üzerine yazılmaması için)
    if (!isInitialLoadDone) return;

    const timer = setTimeout(async () => {
      setSyncStatus('syncing');
      const success = await saveToCloud({
        assets,
        checks,
        manualTransactions,
        recurringRules,
        customTabs
      });
      setSyncStatus(success ? 'synced' : 'error');
    }, 2000);

    return () => clearTimeout(timer);
  }, [assets, checks, manualTransactions, recurringRules, customTabs, isInitialLoadDone]);

  const fetchRates = async () => {
    try {
      const [resEur, resUsd] = await Promise.all([
        fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY'),
        fetch('https://api.frankfurter.app/latest?from=USD&to=TRY')
      ]);
      if (resEur.ok) {
        const data = await resEur.json();
        setEurRate(data.rates.TRY);
      }
      if (resUsd.ok) {
        const data = await resUsd.json();
        setUsdRate(data.rates.TRY);
      }
    } catch (e) { console.error("Rate fetch failed", e); }
  };

  const periods = useMemo(() => 
    calculateFlow(projectionType, assets, checks, manualTransactions, recurringRules, eurRate, usdRate, viewCurrency),
    [projectionType, assets, checks, manualTransactions, recurringRules, eurRate, usdRate, viewCurrency]
  );

  const upcomingChecks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today);
    limit.setDate(today.getDate() + 7);
    const limitStr = toLocalYMD(limit);
    const todayStr = toLocalYMD(today);

    return checks.filter(c => {
      return c.effectiveDateStr >= todayStr && c.effectiveDateStr <= limitStr;
    }).sort((a, b) => a.effectiveDateStr.localeCompare(b.effectiveDateStr));
  }, [checks]);

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(id) => {
          setActiveTab(id);
          setIsMobileMenuOpen(false);
        }} 
        customTabs={customTabs}
        setCustomTabs={setCustomTabs}
        onExport={() => {}} 
        onImport={() => {}} 
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto relative w-full">
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8">
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
                {/* Sync Badge */}
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                  syncStatus === 'synced' ? 'bg-green-50 text-green-600' : 
                  syncStatus === 'syncing' ? 'bg-blue-50 text-blue-600 animate-pulse' : 'bg-rose-50 text-rose-600'
                }`}>
                  <i className={`fa-solid ${syncStatus === 'synced' ? 'fa-cloud-check' : syncStatus === 'syncing' ? 'fa-cloud-arrow-up' : 'fa-cloud-exclamation'}`}></i>
                  {syncStatus === 'synced' ? 'Bulut Senkronize' : syncStatus === 'syncing' ? 'Kaydediliyor...' : 'Bağlantı Hatası'}
                </div>
              </div>
              <p className="text-slate-500 text-[11px] md:text-sm font-medium">Primus Finansal Bulut Senkronizasyon v5.2</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100 self-start xl:self-auto">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative ${upcomingChecks.length > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}
              >
                <i className="fa-solid fa-bell"></i>
                {upcomingChecks.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                    {upcomingChecks.length}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute top-full mt-3 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                    <span className="text-sm font-bold text-slate-800">Bildirimler</span>
                    <span className="text-[10px] font-black text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded">Yaklaşan Çekler</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {upcomingChecks.length > 0 ? (
                      upcomingChecks.map(check => (
                        <div key={check.id} className="p-4 border-b hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setActiveTab('checks'); setIsNotificationOpen(false); }}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-700 truncate pr-2">{check.desc}</span>
                            <span className="text-xs font-black text-blue-600 whitespace-nowrap">{formatMoney(check.amount)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <i className="fa-solid fa-calendar-day text-[10px] text-slate-400"></i>
                             <span className="text-[10px] font-bold text-slate-500 uppercase">Vade: {check.effectiveDateStr}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400">
                        <i className="fa-solid fa-check-circle text-2xl mb-2 opacity-20"></i>
                        <p className="text-xs font-medium italic">Yaklaşan çek bulunmuyor.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-100 hidden md:block mx-1"></div>

            <div className="flex items-center gap-2 px-3 border-r border-slate-100 pr-4">
              <span className="text-[10px] font-black text-slate-400 uppercase">1 EUR</span>
              <input type="number" value={eurRate} onChange={(e) => setEurRate(Number(e.target.value))} className="w-16 text-sm font-bold bg-transparent outline-none border-b border-transparent focus:border-blue-500" />
            </div>
            <div className="flex items-center gap-2 px-3 border-r border-slate-100 pr-4">
              <span className="text-[10px] font-black text-slate-400 uppercase">1 USD</span>
              <input type="number" value={usdRate} onChange={(e) => setUsdRate(Number(e.target.value))} className="w-16 text-sm font-bold bg-transparent outline-none border-b border-transparent focus:border-blue-500" />
            </div>
            
            <div className="flex bg-slate-50 p-1 rounded-lg">
              {['TL', 'EUR', 'USD'].map(curr => (
                <button 
                  key={curr}
                  onClick={() => setViewCurrency(curr as Currency)}
                  className={`px-4 py-1.5 rounded-md text-[11px] font-black transition-all ${viewCurrency === curr ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="pb-24">
          {activeTab === 'flow' && (
            <FlowDashboard 
              periods={periods} projectionType={projectionType} setProjectionType={setProjectionType}
              viewCurrency={viewCurrency} assets={assets} setAssets={setAssets} eurRate={eurRate}
            />
          )}
          {activeTab === 'assets' && <AssetManager assets={assets} setAssets={setAssets} viewCurrency={viewCurrency} eurRate={eurRate} usdRate={usdRate} />}
          {activeTab === 'checks' && <CheckManager checks={checks} setChecks={setChecks} />}
          {activeTab === 'recurring' && <RecurringManager rules={recurringRules} setRules={setRecurringRules} />}
          {activeTab === 'manual' && <ManualManager transactions={manualTransactions} setTransactions={setManualTransactions} />}
          {activeTab.startsWith('cust-') && (
            <ExcelTabs 
              tabId={activeTab} transactions={manualTransactions} setTransactions={setManualTransactions} 
              customTabs={customTabs} setCustomTabs={setCustomTabs}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;