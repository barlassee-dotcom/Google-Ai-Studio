
import React, { useState } from 'react';
import { RecurringRule, Currency } from '../types';
import { formatMoney } from '../utils/calculations';

interface RecurringManagerProps {
  rules: RecurringRule[];
  setRules: React.Dispatch<React.SetStateAction<RecurringRule[]>>;
}

const RecurringManager: React.FC<RecurringManagerProps> = ({ rules, setRules }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<RecurringRule>>({
    type: 'expense',
    startDate: '',
    amount: 0,
    desc: '',
    currency: 'TL',
    freq: 'monthly',
    weekDays: [],
    monthType: 'fixed',
    fixedDay: 1,
    specialOrd: '1',
    specialDay: '1'
  });

  const getRuleDescription = (r: RecurringRule) => {
    if (r.freq === 'weekly') {
      const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
      return `Her hafta ${r.weekDays?.map(d => days[d - 1]).join(', ')} günleri`;
    }
    if (r.monthType === 'fixed') return `Her ayın ${r.fixedDay}. günü`;
    return `Özel aylık kural`;
  };

  const handleSave = () => {
    if (!form.startDate || !form.amount || !form.desc) {
      alert("Eksik bilgi."); return;
    }
    
    const ruleData = {
      type: form.type as any,
      startDate: form.startDate,
      amount: form.amount,
      desc: form.desc,
      currency: (form.currency || 'TL') as Currency,
      freq: form.freq as any,
      weekDays: form.weekDays,
      monthType: form.monthType as any,
      fixedDay: form.fixedDay,
      specialOrd: form.specialOrd,
      specialDay: form.specialDay
    };

    if (editingId) {
      setRules(rules.map(r => r.id === editingId ? { ...r, ...ruleData } : r));
      setEditingId(null);
    } else {
      setRules([...rules, { id: Date.now().toString(), ...ruleData }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ type: 'expense', startDate: '', amount: 0, desc: '', currency: 'TL', freq: 'monthly', weekDays: [], monthType: 'fixed', fixedDay: 1, specialOrd: '1', specialDay: '1' });
    setEditingId(null);
  };

  const editRule = (r: RecurringRule) => {
    setEditingId(r.id);
    setForm({ ...r });
  };

  const deleteRule = (id: string) => {
    if (confirm("Silinsin mi?")) {
      setRules(rules.filter(r => r.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const toggleDay = (day: number) => {
    const current = form.weekDays || [];
    if (current.includes(day)) setForm({...form, weekDays: current.filter(d => d !== day)});
    else setForm({...form, weekDays: [...current, day]});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
           <i className="fa-solid fa-rotate text-amber-500"></i> {editingId ? 'Düzenle' : 'Yeni Kural'}
        </h3>
        <div className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button onClick={() => setForm({...form, type: 'income'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.type === 'income' ? 'bg-white shadow text-green-600' : 'text-slate-500'}`}>GELİR</button>
             <button onClick={() => setForm({...form, type: 'expense'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.type === 'expense' ? 'bg-white shadow text-rose-600' : 'text-slate-500'}`}>GİDER</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Başlangıç</label>
              <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tutar</label>
              <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.amount || ''} onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Sıklık</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.freq} onChange={e => setForm({...form, freq: e.target.value as any})}>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Para Birimi</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.currency} onChange={e => setForm({...form, currency: e.target.value as Currency})}>
                <option value="TL">TL</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Açıklama</label>
            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" placeholder="Kira, Maaş, Tahsilat..." value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
          </div>

          {form.freq === 'weekly' && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
               <div className="flex flex-wrap gap-2">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((label, idx) => (
                    <button key={idx} type="button" onClick={() => toggleDay(idx + 1)} className={`w-9 h-9 rounded-lg text-xs font-bold border ${ (form.weekDays || []).includes(idx + 1) ? 'bg-blue-600 text-white' : 'bg-white text-slate-500' }`}>{label}</button>
                  ))}
               </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 bg-amber-500 text-white font-bold p-4 rounded-xl shadow-lg">Kaydet</button>
            {editingId && <button onClick={resetForm} className="bg-slate-100 p-4 rounded-xl">İptal</button>}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Kurallar Listesi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Açıklama</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Kural</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Tutar</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-4 text-sm font-bold text-slate-700">
                      <span className={`mr-2 px-2 py-0.5 rounded text-[10px] ${r.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                        {r.type === 'income' ? 'GELİR' : 'GİDER'}
                      </span>
                      {r.desc}
                    </td>
                    <td className="p-4 text-xs text-slate-500">{getRuleDescription(r)}</td>
                    <td className="p-4 text-sm font-black text-right">{formatMoney(r.amount, r.currency)}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => editRule(r)} className="text-blue-500 mr-2"><i className="fa-solid fa-pencil"></i></button>
                      <button onClick={() => deleteRule(r.id)} className="text-rose-500"><i className="fa-solid fa-trash-can"></i></button>
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

export default RecurringManager;
