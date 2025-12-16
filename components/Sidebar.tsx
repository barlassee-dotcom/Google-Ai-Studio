import React from 'react';
import { CustomTab } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  customTabs: CustomTab[];
  setCustomTabs: React.Dispatch<React.SetStateAction<CustomTab[]>>;
  onExport: () => void;
  onImport: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  customTabs, 
  setCustomTabs, 
  onExport, 
  onImport,
  isMobileOpen = false,
  setIsMobileOpen
}) => {
  const menuItems = [
    { id: 'flow', label: 'Nakit Akışı', icon: 'fa-chart-line' },
    { id: 'ai-analysis', label: 'AI Finansal Analiz', icon: 'fa-wand-magic-sparkles' },
    { id: 'assets', label: 'Varlıklar', icon: 'fa-vault' },
    { id: 'checks', label: 'Çekler', icon: 'fa-money-check-dollar' },
    { id: 'recurring', label: 'Tekrarlı İşlemler', icon: 'fa-rotate' },
    { id: 'manual', label: 'Manuel İşlemler', icon: 'fa-keyboard' },
  ];

  const handleAddTab = () => {
    const name = prompt("Müşteri/Proje Adı Giriniz:", "Yeni Müşteri");
    if (!name) return;
    const newTab = { id: `cust-${Date.now()}`, name };
    setCustomTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] transition-opacity duration-300"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-[80] w-72 bg-white border-r flex flex-col transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:h-screen lg:z-auto
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Header with Close button for mobile */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <i className="fa-solid fa-layer-group text-white"></i>
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight leading-none text-slate-800">Primus Coating</span>
                <span className="text-blue-600 font-black text-xs">CASHFLOW</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsMobileOpen?.(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Yönetim</p>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`}></i>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}

          {/* Custom Tabs Section */}
          <div className="pt-6">
            <div className="flex items-center justify-between px-3 py-2 mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Özel Takip</p>
              <button 
                onClick={handleAddTab}
                className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white w-6 h-6 rounded-lg flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
              </button>
            </div>
            <div className="space-y-1">
              {customTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${
                    activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <i className={`fa-solid fa-folder-open w-5 text-center ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`}></i>
                  <span className="truncate text-sm">{tab.name}</span>
                </button>
              ))}
              {customTabs.length === 0 && (
                <div className="px-3 py-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold italic">Kayıtlı müşteri yok</p>
                </div>
              )}
            </div>
          </div>

          {/* Backup & Import Section */}
          <div className="pt-6">
            <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Yedekleme</p>
            <button 
              onClick={onExport}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors"
            >
              <i className="fa-solid fa-download w-5 text-center text-slate-400"></i>
              Verileri Yedekle
            </button>
            <button 
              onClick={onImport}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors"
            >
              <i className="fa-solid fa-upload w-5 text-center text-slate-400"></i>
              Yedeği Yükle
            </button>
          </div>
        </nav>

        {/* Footer info box */}
        <div className="p-4 mt-auto">
          <div className="bg-slate-900 rounded-2xl p-4 text-white flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Sistem</p>
              <p className="text-xs font-black">CLOUDSYNC Live</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <i className="fa-solid fa-cloud text-[12px]"></i>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;