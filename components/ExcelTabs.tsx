
import React, { useState } from 'react';
import { CustomTab, Transaction } from '../types';
import { formatMoney, toLocalYMD, calculateBoschDate } from '../utils/calculations';
import * as XLSX from 'xlsx';

interface ExcelTabsProps {
  tabId: string;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  customTabs: CustomTab[];
  setCustomTabs: React.Dispatch<React.SetStateAction<CustomTab[]>>;
}

const ExcelTabs: React.FC<ExcelTabsProps> = ({ tabId, transactions, setTransactions, customTabs, setCustomTabs }) => {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [boschRule, setBoschRule] = useState(false);
  const [vadeGun, setVadeGun] = useState(60);
  const [file, setFile] = useState<File | null>(null);

  const tab = customTabs.find(t => t.id === tabId);

  const getColIndex = (val: string) => {
    if (!val) return -1;
    val = val.toUpperCase();
    let sum = 0;
    for (let i = 0; i < val.length; i++) {
      sum *= 26;
      sum += (val.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return sum - 1;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const previewExcel = async () => {
    if (!file) { alert("Dosya seçiniz."); return; }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const colCust = getColIndex("F");
      const colDate = getColIndex("I");
      const colAmt = getColIndex("Y");

      const preview: any[] = [];
      jsonData.forEach((row, idx) => {
        if (idx === 0) return;
        let rawDate = row[colDate];
        if (!rawDate) return;
        
        let invDate: Date;
        if (typeof rawDate === 'number') {
           const utc_days = Math.floor(rawDate - 25569);
           const utc_value = utc_days * 86400;
           invDate = new Date(utc_value * 1000);
        } else {
           invDate = new Date(rawDate);
        }

        if (isNaN(invDate.getTime())) return;

        let dueDate = new Date(invDate);
        dueDate.setDate(dueDate.getDate() + vadeGun);
        
        let finalDate = boschRule ? calculateBoschDate(dueDate) : dueDate;
        
        preview.push({
          cust: row[colCust] || "Bilinmeyen",
          invDate: toLocalYMD(invDate),
          dueDate: toLocalYMD(dueDate),
          finalDate: toLocalYMD(finalDate),
          amt: parseFloat(row[colAmt]) || 0
        });
      });

      setPreviewData(preview.sort((a,b) => new Date(a.finalDate).getTime() - new Date(b.finalDate).getTime()));
    };
    reader.readAsArrayBuffer(file);
  };

  const transferData = () => {
    if (previewData.length === 0) return;
    
    const grouped: Record<string, number> = {};
    previewData.forEach(item => {
      const key = `${item.finalDate}|${item.cust}`;
      grouped[key] = (grouped[key] || 0) + item.amt;
    });

    const newTrans: Transaction[] = Object.entries(grouped).map(([key, amount]) => {
      const [date, cust] = key.split('|');
      return {
        id: `excel-${Date.now()}-${Math.random()}`,
        type: 'income',
        date,
        amount,
        desc: cust,
        currency: 'TL',
        source: 'excel',
        sourceTab: tabId
      };
    });

    setTransactions([...transactions, ...newTrans]);
    setPreviewData([]);
    alert("Veriler nakit akışına başarıyla aktarıldı.");
  };

  const clearTransferredData = () => {
    if (confirm("Bu sekmeden daha önce aktarılan TÜM verileri nakit akışından silmek istediğinize emin misiniz?")) {
      const filtered = transactions.filter(t => t.sourceTab !== tabId);
      const deletedCount = transactions.length - filtered.length;
      setTransactions(filtered);
      alert(`${deletedCount} adet işlem nakit akışından temizlendi.`);
    }
  };

  const deleteTab = () => {
    if (confirm("Bu sekmeyi ve bu sekmeden aktarılan verileri silmek istediğinize emin misiniz?")) {
      setTransactions(transactions.filter(t => t.sourceTab !== tabId));
      setCustomTabs(customTabs.filter(t => t.id !== tabId));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
          <span>{tab?.name} Veri Girişi</span>
          <button onClick={deleteTab} className="text-rose-500 text-xs font-bold hover:underline">Sekmeyi Sil</button>
        </h3>
        
        <div className="space-y-5">
           <div className="border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center hover:border-blue-400 transition-all">
              <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-300 mb-3"></i>
              <p className="text-sm text-slate-500 font-medium mb-4">{file ? file.name : 'Excel dosyasını sürükleyin veya seçin'}</p>
              <input type="file" onChange={handleFileChange} className="text-xs text-slate-400 w-full" accept=".xlsx,.xls" />
           </div>

           <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Vade (Gün)</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={vadeGun}
                onChange={e => setVadeGun(parseInt(e.target.value))}
              />
           </div>

           <label className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={boschRule} 
                onChange={() => setBoschRule(!boschRule)}
                className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-rose-800">Bosch Özel Kuralı Uygula</span>
                <span className="text-[10px] text-rose-600 font-medium leading-tight">Perşembe-Cuma vadesi Perşembe, diğer günler Pazartesi tahsil edilir.</span>
              </div>
           </label>

           <div className="space-y-2">
             <button 
               onClick={previewExcel}
               className="w-full bg-blue-600 text-white font-bold p-4 rounded-xl hover:bg-blue-700 shadow-lg transition-all"
             >
               Verileri Önizle
             </button>
             <button 
               onClick={clearTransferredData}
               className="w-full bg-white text-rose-600 border border-rose-200 font-bold p-3 rounded-xl hover:bg-rose-50 transition-all text-sm"
             >
               Aktarılan Verileri Temizle (Geri Al)
             </button>
           </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 className="font-bold text-slate-800">Aktarım Önizlemesi</h3>
            <button 
              onClick={transferData}
              disabled={previewData.length === 0}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                previewData.length > 0 ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Bakiyeye Aktar
            </button>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b sticky top-0">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Müşteri</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fatura T.</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vade T.</th>
                  <th className="p-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Tahsilat T.</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-bold text-slate-700">{item.cust}</td>
                    <td className="p-4 text-xs text-slate-500">{item.invDate}</td>
                    <td className="p-4 text-xs text-slate-500">{item.dueDate}</td>
                    <td className="p-4 text-sm font-bold text-blue-700">{item.finalDate}</td>
                    <td className="p-4 text-sm font-black text-slate-800 text-right">{formatMoney(item.amt)}</td>
                  </tr>
                ))}
                {previewData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <i className="fa-solid fa-table-list text-6xl text-slate-100 mb-4 block"></i>
                      <p className="text-slate-400 font-medium">Önizlenecek veri bulunmuyor.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelTabs;
