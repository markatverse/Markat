"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Search, CreditCard } from 'lucide-react';

export default function SettingsPaymentPage() {
  const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active',
    config: ''
  });

  const fetchMethods = async () => {
    try {
      const res = await fetch(`${API_URL}/system-config/payment`);
      const data = await res.json();
      setMethods(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch payment methods', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleOpenModal = (method?: any) => {
    if (method) {
      setEditingId(method.id);
      setFormData({
        name: method.name,
        status: method.status,
        config: method.config || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', status: 'Active', config: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name) return alert('Name is required');
    try {
      if (editingId) {
        await fetch(`${API_URL}/system-config/payment/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch(`${API_URL}/system-config/payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      handleCloseModal();
      fetchMethods();
    } catch (e) {
      console.error(e);
      alert('Error saving payment method');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    try {
      await fetch(`${API_URL}/system-config/payment/${id}`, {
        method: 'DELETE'
      });
      fetchMethods();
    } catch (e) {
      console.error(e);
      alert('Error deleting payment method');
    }
  };

  const filteredMethods = (methods || []).filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-400" />
            Payment Settings
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Configure available payment gateways and their API keys.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New
        </button>
      </header>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search gateways..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500 w-64" 
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Gateway Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Modified</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse">Loading settings...</td>
                </tr>
              ) : filteredMethods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No payment gateways configured.</td>
                </tr>
              ) : filteredMethods.map((method) => (
                <tr key={method.id} className="hover:bg-slate-700/50 transition-all group">
                  <td className="p-4 pl-6 font-mono text-[10px] text-slate-500">
                    <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">{method.id}</span>
                  </td>
                  <td className="p-4 font-bold text-white text-sm">{method.name}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      method.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {method.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-xs">
                    {new Date(method.updatedAt).toLocaleString()}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button 
                      onClick={() => handleOpenModal(method)}
                      className="text-slate-500 hover:text-blue-400 px-2 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(method.id)}
                      className="text-slate-500 hover:text-rose-400 px-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-[500px] shadow-2xl relative">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? 'Edit Gateway' : 'Add New Gateway'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gateway Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Stripe, Razorpay"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Configuration / API Keys</label>
                <textarea 
                  value={formData.config}
                  onChange={e => setFormData({...formData, config: e.target.value})}
                  placeholder="Paste JSON config or API keys here"
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={handleCloseModal}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

