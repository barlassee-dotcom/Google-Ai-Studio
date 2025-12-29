import React, { useState } from 'react';
import { Asset, Currency } from '../types';
import { formatMoney, convertCurrency } from '../utils/calculations';

interface AssetManagerProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  viewCurrency: Currency;
  eurRate: number;
  usdRate: number;
}

const AssetManager: React.FC<AssetManagerProps> = ({ assets, setAssets, viewCurrency, eurRate, usdRate }) => {
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
    const amount = parseFloat(form.amount);
    if (editingId) {
      setAssets(assets.map(a => a.id === editingId ? { ...a, type: form.type as any, name: form.name, subType: form.subType, currency: form.currency, amount } : a));
    } else {
      setAssets([...assets, { id: Date.now().toString(), type: form.type as any, name: form.name, subType: form.subType, currency: form.currency, amount, included: true }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ type: 'Banka', name: '', subType: 'Vadesiz', currency: 'TL', amount: '' });
    setEditingId(null);
  };

  const editAsset = (a: Asset) => {
    setEditingId(a.id);
    setForm({ type: a.type, name: a.name, subType: a.subType, currency: a.currency, amount: a.amount.toString() });
  };

  const deleteAsset = (id: string) => {
    if (confirm("Silinsin mi?")) setAssets(assets.filter(a => a.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
        <h3 className="font-bold text-slate-800 mb-6">{editingId ? 'Düzenle' : 'Yeni Varlık'}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Kurum Adı</label>
            <input className="w-full bg-slate-50 border rounded-xl p-3 outline-none" placeholder="Örn: Garanti BBVA" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Birim</label>
              <select className="w-full bg-slate-50 border rounded-xl p-3 outline-none" value={form.currency} onChange={e => setForm({...form, currency: e.target.value as Currency})}>
                <option value="TL">TL</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Tutar</label>
              <input type="number" className="w-full bg-slate-50 border rounded-xl p-3 outline-none" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
          </div>
          <button onClick={handleSave} className="w-full bg-blue-600 text-white font-bold p-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors">Kaydet</button>
        </div>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Varlık</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Orijinal Bakiye</th>
                <th className="p-4 text-xs font-bold text-blue-600 uppercase tracking-wider text-right">Mevcut ({viewCurrency})</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assets.map(a => {
                const converted = convertCurrency(a.amount, a.currency, viewCurrency, eurRate, usdRate);
                return (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{a.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{a.subType}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-right text-slate-500 font-medium">
                      {formatMoney(a.amount, a.currency)}
                    </td>
                    <td className="p-4 text-sm font-black text-right text-blue-700">
                      {formatMoney(converted, viewCurrency)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => editAsset(a)} className="text-slate-400 hover:text-blue-500 transition-colors"><i className="fa-solid fa-pencil"></i></button>
                        <button onClick={() => deleteAsset(a.id)} className="text-slate-400 hover:text-rose-500 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 italic">Varlık kaydı bulunmuyor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetManager;