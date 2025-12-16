
import React, { useState } from 'react';
import { RecurringRule } from '../types';
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
      const activeDays = r.weekDays?.map(d => days[d - 1]).join(', ');
      return `Her hafta ${activeDays || '-'} günleri`;
    }
    if (r.monthType === 'fixed') {
      return `Her ayın ${r.fixedDay}. günü`;
    }
    const ords: any = { '1': '1.', '2': '2.', '3': '3.', '4': '4.', '5': 'Son' };
    const days: any = { '1': 'Pazartesi', '2': 'Salı', '3': 'Çarşamba', '4': 'Perşembe', '5': 'Cuma' };
    return `Her ayın ${ords[r.specialOrd || '1']} ${days[r.specialDay || '1']} günü`;
  };

  const handleSave = () => {
    if (!form.startDate || !form.amount || !form.desc) {
      alert("Lütfen zorunlu alanları doldurun.");
      return;
    }
    
    const ruleData = {
      type: form.type as any,
      startDate: form.startDate,
      amount: form.amount,
      desc: form.desc,
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
      const newRule: RecurringRule = {
        id: Date.now().toString(),
        ...ruleData
      };
      setRules([...rules, newRule]);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({
      type: 'expense',
      startDate: '',
      amount: 0,
      desc: '',
      freq: 'monthly',
      weekDays: [],
      monthType: 'fixed',
      fixedDay: 1,
      specialOrd: '1',
      specialDay: '1'
    });
    setEditingId(null);
  };

  const editRule = (r: RecurringRule) => {
    setEditingId(r.id);
    setForm({
      type: r.type,
      startDate: r.startDate,
      amount: r.amount,
      desc: r.desc,
      freq: r.freq,
      weekDays: r.weekDays || [],
      monthType: r.monthType,
      fixedDay: r.fixedDay,
      specialOrd: r.specialOrd || '1',
      specialDay: r.specialDay || '1'
    });
  };

  const deleteRule = (id: string) => {
    if (confirm("Bu kuralı silmek istediğinize emin misiniz?")) {
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
           <i className="fa-solid fa-rotate text-amber-500"></i> {editingId ? 'Kuralı Düzenle' : 'Yeni Tekrarlı Kural'}
        </h3>
        <div className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button 
                onClick={() => setForm({...form, type: 'income'})}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.type === 'income' ? 'bg-white shadow text-green-600' : 'text-slate-500'}`}
             >GELİR</button>
             <button 
                onClick={() => setForm({...form, type: 'expense'})}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.type === 'expense' ? 'bg-white shadow text-rose-600' : 'text-slate-500'}`}
             >GİDER</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Başlangıç</label>
              <input 
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={form.startDate}
                onChange={e => setForm({...form, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tutar (TL)</label>
              <input 
                type="number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={form.amount || ''}
                onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Açıklama</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kira, Maaş, Düzenli Ödeme..."
              value={form.desc}
              onChange={e => setForm({...form, desc: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tekrar Sıklığı</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.freq}
              onChange={e => setForm({...form, freq: e.target.value as any})}
            >
              <option value="weekly">Haftalık</option>
              <option value="monthly">Aylık</option>
            </select>
          </div>

          {form.freq === 'weekly' && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
               <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Hangi Günler?</label>
               <div className="flex flex-wrap gap-2">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((label, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx + 1)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                        (form.weekDays || []).includes(idx + 1) ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-slate-500'
                      }`}
                    >{label}</button>
                  ))}
               </div>
            </div>
          )}

          {form.freq === 'monthly' && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
               <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={form.monthType === 'fixed'} onChange={() => setForm({...form, monthType: 'fixed'})} />
                    <span className="text-xs font-bold text-slate-600">Belirli Gün</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={form.monthType === 'special'} onChange={() => setForm({...form, monthType: 'special'})} />
                    <span className="text-xs font-bold text-slate-600">Özel Gün</span>
                  </label>
               </div>
               {form.monthType === 'fixed' ? (
                 <input 
                    type="number" 
                    min="1" max="31" 
                    placeholder="Gün (1-31)" 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none" 
                    value={form.fixedDay || ''}
                    onChange={e => setForm({...form, fixedDay: parseInt(e.target.value) || 1})}
                  />
               ) : (
                 <div className="flex gap-2">
                    <select 
                      className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"
                      value={form.specialOrd}
                      onChange={e => setForm({...form, specialOrd: e.target.value})}
                    >
                      <option value="1">1.</option><option value="2">2.</option><option value="3">3.</option><option value="4">4.</option><option value="5">Son</option>
                    </select>
                    <select 
                      className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"
                      value={form.specialDay}
                      onChange={e => setForm({...form, specialDay: e.target.value})}
                    >
                      <option value="1">Pazartesi</option><option value="2">Salı</option><option value="3">Çarşamba</option><option value="4">Perşembe</option><option value="5">Cuma</option>
                    </select>
                 </div>
               )}
            </div>
          )}

          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className={`flex-1 ${editingId ? 'bg-indigo-600' : 'bg-amber-500'} text-white font-bold p-4 rounded-xl hover:opacity-90 shadow-lg transition-all`}
            >
              {editingId ? 'Güncelle' : 'Kuralı Kaydet'}
            </button>
            {editingId && (
              <button onClick={resetForm} className="bg-slate-100 text-slate-600 font-bold p-4 rounded-xl hover:bg-slate-200 transition-all">
                Vazgeç
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-lg">Aktif Tekrarlı Kurallar</h3>
            <span className="text-xs font-bold bg-white border text-amber-600 px-3 py-1 rounded-full">{rules.length} Kural</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tip</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Açıklama</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kural Detayı</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Tutar</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map(r => (
                  <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${editingId === r.id ? 'bg-blue-50' : ''}`}>
                    <td className="p-4 text-sm font-bold">
                       <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider ${r.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                         {r.type === 'income' ? 'Gelir' : 'Gider'}
                       </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700">{r.desc}</td>
                    <td className="p-4 text-xs text-slate-500 font-medium">
                      {getRuleDescription(r)}
                    </td>
                    <td className="p-4 text-sm font-black text-slate-800 text-right">{formatMoney(r.amount)}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => editRule(r)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Düzenle">
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <button onClick={() => deleteRule(r.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors" title="Sil">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-slate-400 italic">Henüz tanımlı bir kural bulunmuyor.</td>
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

export default RecurringManager;
