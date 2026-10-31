"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, X, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CommercialgtCommissionPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', entityType: 'SECTOR', entityId: '', percentage: 0, fixedFee: 0, isActive: true });
  const [isEditing, setIsEditing] = useState(false);
  const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/commercial/commissions`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch commissions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModal = (item: any = null) => {
    if (item) {
      setFormData({
        id: item.id || '',
        entityType: item.entityType || 'SECTOR',
        entityId: item.entityId || '',
        percentage: item.percentage || 0,
        fixedFee: item.fixedFee || 0,
        isActive: item.isActive ?? true
      });
      setIsEditing(true);
    } else {
      setFormData({ id: '', entityType: 'SECTOR', entityId: '', percentage: 0, fixedFee: 0, isActive: true });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing 
      ? `${API_URL}/commercial/commissions/${formData.id}`
      : `${API_URL}/commercial/commissions`;
    const method = isEditing ? 'PATCH' : 'POST';
    const { id, ...dataToSend } = formData;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      if (res.ok) {
        fetchItems();
        closeModal();
      }
    } catch (error) {
      console.error("Failed to save", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/commercial/commissions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleToggleStatus = async (item: any) => {
    const newStatus = !item.isActive;
    try {
      const res = await fetch(`${API_URL}/commercial/commissions/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Failed to toggle status", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Commercial &gt; Commission</h1>
          <p className="text-slate-400 mt-2 text-sm">Manage platform commission rates.</p>
        </div>
        <button onClick={() => openModal()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Rule
        </button>
      </header>

      {/* Statutory GST on Platform Commission Notice */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/60 border border-indigo-500/30 flex items-start gap-4 text-xs">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-sm">Tax Rule: Platform Fee = Commission + 18% GST (SAC 998319)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              Active GST Rule
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            In accordance with Indian GST regulations for online e-commerce marketplaces, platform commission and fixed transaction charges attract <strong>18% GST</strong> (9% CGST + 9% SGST or 18% IGST). When platform fees are deducted from merchant order payouts, the platform automatically charges: <strong>Base Commission + 18% GST</strong>.
          </p>
          <div className="pt-2">
            <Link href="/admin/settings/tax" className="inline-flex items-center gap-1 text-indigo-300 hover:text-white text-xs font-bold underline underline-offset-4 decoration-indigo-400/50 hover:decoration-white transition-all">
              <span>Configure Statutory GST Sections &amp; Settlement Simulator (Sec 9(1), Sec 52 TCS, Sec 9(5))</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 pl-6">Entity</th>
                <th className="p-4">Target ID</th>
                <th className="p-4">Percentage</th>
                <th className="p-4">Fixed Fee</th>
                <th className="p-4">Effective Deduction (Commission + 18% GST)</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-400">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-400">No commission rules found.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/50 transition-all">
                    <td className="p-4 pl-6 font-bold text-white">{item.entityType}</td>
                    <td className="p-4 text-slate-300">{item.entityId}</td>
                    <td className="p-4 text-emerald-400 font-bold">{item.percentage}%</td>
                    <td className="p-4 text-slate-300">₹{item.fixedFee}</td>
                    <td className="p-4 text-emerald-400 font-bold">
                      {item.percentage > 0 ? (
                        <span>{(item.percentage * 1.18).toFixed(2)}% <span className="text-[10px] text-slate-400 font-normal font-mono">({item.percentage}% + 18% GST)</span></span>
                      ) : null}
                      {item.fixedFee > 0 ? (
                        <span>{item.percentage > 0 ? ' + ' : ''}₹{(item.fixedFee * 1.18).toFixed(2)} <span className="text-[10px] text-slate-400 font-normal font-mono">(₹{item.fixedFee} + 18% GST)</span></span>
                      ) : null}
                      {item.percentage === 0 && item.fixedFee === 0 ? <span className="text-slate-500">0% (Free)</span> : null}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${item.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button onClick={() => handleToggleStatus(item)} className="text-slate-500 hover:text-white px-2 transition-colors">Toggle</button>
                      <button onClick={() => openModal(item)} className="text-slate-500 hover:text-blue-400 px-2 transition-colors"><Edit2 className="w-4 h-4 inline" /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-rose-400 px-2 transition-colors"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">{isEditing ? 'Edit Rule' : 'Add Rule'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Entity Type</label>
                  <select value={formData.entityType} onChange={e => setFormData({...formData, entityType: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                    <option value="SECTOR">SECTOR</option>
                    <option value="BUSINESS_TYPE">BUSINESS_TYPE</option>
                    <option value="GLOBAL">GLOBAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Entity ID</label>
                  <input required placeholder="e.g. Retail, B2B" type="text" value={formData.entityId} onChange={e => setFormData({...formData, entityId: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Percentage (%)</label>
                  <input required type="number" step="0.01" value={formData.percentage} onChange={e => setFormData({...formData, percentage: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fixed Fee (₹)</label>
                  <input required type="number" step="0.01" value={formData.fixedFee} onChange={e => setFormData({...formData, fixedFee: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <select value={formData.isActive ? 'true' : 'false'} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Live Commission + GST Breakdown Preview */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider block text-[10px]">
                  ⚡ Live Tax Calculation Preview (SAC 998319)
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Base Commission:</span>
                    <strong className="text-white">{formData.percentage}% {formData.fixedFee ? `+ ₹${formData.fixedFee}` : ''}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">18% GST on Commission:</span>
                    <strong className="text-indigo-400">+{(formData.percentage * 0.18).toFixed(2)}% {formData.fixedFee ? `+ ₹${(formData.fixedFee * 0.18).toFixed(2)}` : ''}</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Effective Platform Deduction:</span>
                  <span className="font-black text-emerald-400 text-sm">
                    {(formData.percentage * 1.18).toFixed(2)}% {formData.fixedFee ? `+ ₹${(formData.fixedFee * 1.18).toFixed(2)}` : ''}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 pt-1 leading-snug">
                  On a ₹1,000 order: Platform deducts ₹{(formData.percentage * 10 * 1.18 + formData.fixedFee * 1.18).toFixed(2)}. Seller receives ₹{(1000 - (formData.percentage * 10 * 1.18 + formData.fixedFee * 1.18)).toFixed(2)}.
                </p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

