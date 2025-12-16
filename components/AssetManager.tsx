
import React, { useState } from 'react';
import { Asset, Currency } from '../types';
import { formatMoney } from '../utils/calculations';

interface AssetManagerProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  viewCurrency: Currency;
  eurRate: number;
}

const AssetManager: React.FC<AssetManagerProps> = ({ assets, setAssets, viewCurrency, eurRate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: 'Banka',
    name: '',
    subType: 'Vadesiz',
    currency: 'TL' as Currency,
    amount: ''
  });

  const handleSave = () => {
    if (!form.name || form.amount === '') return;
    
    if (editingId) {
      setAssets(assets.map(a => a.id === editingId ? {
        ...a,
        type: form.type as any,
        name: form.name,
        subType: form.subType,
        currency: form.currency,
        amount: parseFloat(form.amount)
      } : a));
      setEditingId(null);
    } else {
      const newAsset: Asset = {
        id: Date.now().toString(),
        type: form.type as any,
        name: form.name,
        subType: form.subType,
        currency: form.currency,
        amount: parseFloat(form.amount),
        included: true
      };
      setAssets([...assets, newAsset]);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ type: 'Banka', name: '', subType: 'Vadesiz', currency: 'TL', amount: '' });
    setEditingId(null);
  };

  const editAsset = (a: Asset) => {
    setEditingId(a.id);
    setForm({
      type: a.type,
      name: a.name,
      subType: a.subType,
      currency: a.currency,
      amount: a.amount.toString()
    });
  };

  const deleteAsset = (id: string) => {
    if (confirm("Varlık silinsin mi?")) {
      setAssets(assets.filter(a => a.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const total = assets.reduce((acc, a) => {
    let val = a.amount;
    if (viewCurrency === 'TL' && a.currency === 'EUR') val *= eurRate;
    else if (viewCurrency === 'EUR' && a.currency === 'TL') val /= eurRate;
    return acc + val;
  }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
        <h3 className="font-bold text-slate-800 mb-6">{editingId ? 'Varlığı Düzenle' : 'Yeni Varlık Ekle'}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Varlık Türü</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
            >
              <option value="Banka">Banka</option>
              <option value="Fon">Fon / Yatırım</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Adı / Kurum</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Akbank"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Detay</label>
              <input 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Vadesiz, Vadeli vb."
                value={form.subType}
                onChange={e => setForm({...form, subType: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Para Birimi</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={form.currency}
                onChange={e => setForm({...form, currency: e.target.value as Currency})}
              >
                <option value="TL">TL</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tutar</label>
            <input 
              type="number"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0,00"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className={`flex-1 ${editingId ? 'bg-indigo-600' : 'bg-blue-600'} text-white font-bold p-4 rounded-xl hover:opacity-90 shadow-lg transition-all`}
            >
              {editingId ? 'Güncelle' : 'Varlık Ekle'}
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
            <h3 className="font-bold text-slate-800 text-lg">Varlıklar Listesi</h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{assets.length} Varlık</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tür / Detay</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Açıklama</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Orijinal Tutar</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Değer ({viewCurrency})</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map(a => {
                  let val = a.amount;
                  if (viewCurrency === 'TL' && a.currency === 'EUR') val *= eurRate;
                  else if (viewCurrency === 'EUR' && a.currency === 'TL') val /= eurRate;
                  return (
                    <tr key={a.id} className={`hover:bg-slate-50 transition-colors ${editingId === a.id ? 'bg-blue-50' : ''}`}>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{a.type}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{a.subType}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-600">{a.name}</td>
                      <td className="p-4 text-sm font-bold text-slate-600 text-right">{formatMoney(a.amount, a.currency)}</td>
                      <td className="p-4 text-sm font-black text-blue-700 text-right">{formatMoney(val, viewCurrency)}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => editAsset(a)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                            <i className="fa-solid fa-pencil"></i>
                          </button>
                          <button onClick={() => deleteAsset(a.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-900 text-white">
                <tr>
                  <td colSpan={3} className="p-4 text-sm font-bold text-right uppercase tracking-widest opacity-60">Toplam Değer</td>
                  <td className="p-4 text-lg font-black text-right">{formatMoney(total, viewCurrency)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetManager;
