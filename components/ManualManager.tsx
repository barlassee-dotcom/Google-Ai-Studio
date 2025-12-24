
import React, { useState } from 'react';
import { Transaction, Currency } from '../types';
import { formatMoney } from '../utils/calculations';

interface ManualManagerProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const ManualManager: React.FC<ManualManagerProps> = ({ transactions, setTransactions }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Transaction>>({
    type: 'expense',
    date: '',
    amount: 0,
    desc: '',
    currency: 'TL'
  });

  const handleSave = () => {
    const parsedAmount = parseFloat(form.amount?.toString() || '0');
    if (!form.date || !form.desc || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Geçersiz veri."); return;
    }

    const transData: Omit<Transaction, 'id'> = {
      type: (form.type || 'expense') as 'income' | 'expense',
      date: form.date,
      amount: parsedAmount,
      desc: form.desc,
      currency: (form.currency || 'TL') as Currency,
      source: 'manual' as const
    };

    if (editingId) {
      setTransactions(prev => prev.map(t => t.id === editingId ? { ...t, ...transData } : t));
      setEditingId(null);
    } else {
      setTransactions(prev => [...prev, { id: `manual-${Date.now()}`, ...transData }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ type: 'expense', date: '', amount: 0, desc: '', currency: 'TL' });
    setEditingId(null);
  };

  const editTrans = (t: Transaction) => {
    setEditingId(t.id);
    setForm({ type: t.type, date: t.date, amount: t.amount, desc: t.desc, currency: t.currency });
  };

  const deleteTrans = (id: string) => {
    if (confirm("Silinsin mi?")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-keyboard text-slate-400"></i> {editingId ? 'Düzenle' : 'Manuel İşlem'}
        </h3>
        <div className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button onClick={() => setForm({...form, type: 'income'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.type === 'income' ? 'bg-white shadow text-green-600' : 'text-slate-500'}`}>GELİR</button>
             <button onClick={() => setForm({...form, type: 'expense'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.type === 'expense' ? 'bg-white shadow text-rose-600' : 'text-slate-500'}`}>GİDER</button>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tarih</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tutar</label>
              <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" value={form.amount || ''} onChange={e => setForm({...form, amount: e.target.value as any})} placeholder="0,00" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Birim</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" value={form.currency} onChange={e => setForm({...form, currency: e.target.value as Currency})}>
                <option value="TL">TL</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Açıklama</label>
            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Firma / Detay" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className={`flex-1 ${editingId ? 'bg-indigo-600' : 'bg-slate-800'} text-white font-bold p-4 rounded-xl hover:opacity-90 shadow-lg`}>Kaydet</button>
            {editingId && <button onClick={resetForm} className="bg-slate-100 text-slate-600 font-bold p-4 rounded-xl">İptal</button>}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">İşlemler Listesi</h3>
            <span className="text-xs font-bold bg-white border text-slate-500 px-3 py-1 rounded-full">{transactions.length} İşlem</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Tarih</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Açıklama</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Tutar</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                  <tr key={t.id} className={`hover:bg-slate-50 ${editingId === t.id ? 'bg-indigo-50' : ''}`}>
                    <td className="p-4 text-sm text-slate-500">{t.date}</td>
                    <td className="p-4 text-sm font-bold text-slate-700">
                      <span className={`mr-2 inline-block w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-rose-500'}`}></span>
                      {t.desc}
                    </td>
                    <td className="p-4 text-sm font-black text-right">
                      <span className={t.type === 'income' ? 'text-green-600' : 'text-rose-600'}>
                        {formatMoney(t.amount, t.currency)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => editTrans(t)} className="text-blue-500 mr-2"><i className="fa-solid fa-pencil"></i></button>
                      <button onClick={() => deleteTrans(t.id)} className="text-rose-500"><i className="fa-solid fa-trash-can"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualManager;
