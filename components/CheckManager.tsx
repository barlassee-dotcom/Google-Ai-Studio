
import React, { useState } from 'react';
import { Check } from '../types';
import { formatMoney, getNextBusinessDay, toLocalYMD } from '../utils/calculations';

interface CheckManagerProps {
  checks: Check[];
  setChecks: React.Dispatch<React.SetStateAction<Check[]>>;
}

const CheckManager: React.FC<CheckManagerProps> = ({ checks, setChecks }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: '',
    amount: '',
    desc: '',
    valor: '0'
  });

  const handleSave = () => {
    if (!form.date || form.amount === '') return;
    
    const dueDate = new Date(form.date);
    dueDate.setDate(dueDate.getDate() + parseInt(form.valor));
    const effectiveDate = getNextBusinessDay(dueDate);

    const checkData = {
      dueDateStr: form.date,
      valor: parseInt(form.valor),
      effectiveDateStr: toLocalYMD(effectiveDate),
      amount: parseFloat(form.amount),
      desc: form.desc || 'Müşteri Çeki'
    };

    if (editingId) {
      setChecks(checks.map(c => c.id === editingId ? { ...c, ...checkData } : c));
      setEditingId(null);
    } else {
      const newCheck: Check = {
        id: Date.now().toString(),
        ...checkData
      };
      setChecks([...checks, newCheck]);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ date: '', amount: '', desc: '', valor: '0' });
    setEditingId(null);
  };

  const editCheck = (c: Check) => {
    setEditingId(c.id);
    setForm({
      date: c.dueDateStr,
      amount: c.amount.toString(),
      desc: c.desc,
      valor: c.valor.toString()
    });
  };

  const deleteCheck = (id: string) => {
    if (confirm("Çek silinsin mi?")) {
      setChecks(checks.filter(c => c.id !== id));
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
        <h3 className="font-bold text-slate-800 mb-6">{editingId ? 'Çeki Düzenle' : 'Çek Girişi'}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Vade Tarihi</label>
            <input 
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.date}
              onChange={e => setForm({...form, date: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tutar (TL)</label>
            <input 
              type="number"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0,00"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Açıklama</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Firma Adı / Banka"
              value={form.desc}
              onChange={e => setForm({...form, desc: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Valör (Gün)</label>
            <input 
              type="number"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.valor}
              onChange={e => setForm({...form, valor: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className={`flex-1 ${editingId ? 'bg-indigo-600' : 'bg-indigo-600'} text-white font-bold p-4 rounded-xl hover:opacity-90 shadow-lg transition-all`}
            >
              {editingId ? 'Güncelle' : 'Çek Kaydet'}
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
          <div className="p-5 border-b flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Aktif Çekler</h3>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{checks.length} Adet</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vade</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valör</th>
                  <th className="p-4 text-xs font-bold text-indigo-600 uppercase tracking-wider">Tahsilat</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Açıklama</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Tutar</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checks.sort((a,b) => new Date(a.effectiveDateStr).getTime() - new Date(b.effectiveDateStr).getTime()).map(c => (
                  <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${editingId === c.id ? 'bg-indigo-50' : ''}`}>
                    <td className="p-4 text-sm text-slate-500">{c.dueDateStr}</td>
                    <td className="p-4 text-sm text-slate-400">{c.valor} G</td>
                    <td className="p-4 text-sm font-bold text-indigo-700">{c.effectiveDateStr}</td>
                    <td className="p-4 text-sm font-medium text-slate-700">{c.desc}</td>
                    <td className="p-4 text-sm font-black text-slate-800 text-right">{formatMoney(c.amount)}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => editCheck(c)} className="text-indigo-500 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <button onClick={() => deleteCheck(c.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {checks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 italic">Kayıtlı çek bulunmuyor.</td>
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

export default CheckManager;
