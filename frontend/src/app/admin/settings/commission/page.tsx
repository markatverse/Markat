"use client";
import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

import { getApiUrl } from '@/utils/api';

const API = getApiUrl();

interface Commission {
  id: string;
  type: string;
  rate: number;
  conditions: string | null;
  status: string;
  updatedAt: string;
}

export default function SettingsCommissionPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Commission | null>(null);
  
  // Form State
  const [type, setType] = useState('SELLER');
  const [rate, setRate] = useState(5);
  const [conditions, setConditions] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/commercial/commissions`);
      const data = await res.json();
      setCommissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item?: Commission) => {
    if (item) {
      setEditing(item);
      setType(item.type);
      setRate(item.rate);
      setConditions(item.conditions || '');
      setStatus(item.status);
    } else {
      setEditing(null);
      setType('SELLER');
      setRate(5);
      setConditions('');
      setStatus('ACTIVE');
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = { type, rate: Number(rate), conditions, status };
    try {
      if (editing) {
        await fetch(`${API}/commercial/commissions/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`${API}/commercial/commissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setModalOpen(false);
      fetchCommissions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this commission rule?')) return;
    try {
      await fetch(`${API}/commercial/commissions/${id}`, { method: 'DELETE' });
      fetchCommissions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings &gt; Commission</h1>
          <p className="text-slate-400 mt-2 text-sm">Manage global and custom commission rates.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </header>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading rules...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                <tr>
                  <th className="p-4 pl-6">Type</th>
                  <th className="p-4">Rate (%)</th>
                  <th className="p-4">Conditions</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {commissions.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-500">No commission rules found.</td></tr>
                ) : commissions.map(c => (
                  <tr key={c.id} className="hover:bg-slate-700/50 transition-all">
                    <td className="p-4 pl-6 font-bold text-white">{c.type}</td>
                    <td className="p-4 text-emerald-400 font-bold">{c.rate}%</td>
                    <td className="p-4 text-slate-400 text-sm truncate max-w-[200px]">{c.conditions || '-'}</td>
                    <td className="p-4">
                      <span className={`border px-2.5 py-1 rounded-full text-xs font-bold ${
                        c.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right flex justify-end gap-2">
                      <button onClick={() => openModal(c)} className="text-slate-500 hover:text-blue-400 p-1"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="text-slate-500 hover:text-rose-400 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editing ? 'Edit Commission Rule' : 'New Commission Rule'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Rule Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500">
                  <option value="SELLER">SELLER (Global Default)</option>
                  <option value="CATEGORY">CATEGORY</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Rate (%)</label>
                <input type="number" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Conditions (Optional)</label>
                <input type="text" placeholder="e.g. For electronics only" value={conditions} onChange={e => setConditions(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-700">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">Save Rule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

