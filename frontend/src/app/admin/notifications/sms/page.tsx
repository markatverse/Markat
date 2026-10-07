"use client";
import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';

const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

export default function NotificationsTemplatesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', message: '', status: 'ACTIVE' });

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/notifications/sms`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await fetch(`${API_URL}/admin/notifications/sms/${id}`, { method: 'DELETE' });
        fetchItems();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`${API_URL}/admin/notifications/sms/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus })
      });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Failed to toggle status", error);
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ title: item.title, message: item.message, status: item.status });
    } else {
      setEditingId(null);
      setFormData({ title: '', message: '', status: 'ACTIVE' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', message: '', status: 'ACTIVE' });
  };

  const handleSave = async () => {
    const url = editingId 
      ? `${API_URL}/admin/notifications/sms/${editingId}`
      : `${API_URL}/admin/notifications/sms`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        closeModal();
        fetchItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full relative animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">SMS Notification Templates</h2>
          <p className="text-slate-400 mt-1 text-sm">Create and automate dynamic SMS Notification messages.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2">
          + Add New
        </button>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 pl-6">Trigger Type (Title)</th>
                <th className="p-4">Message Template</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Modified</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-400">Loading templates...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-400">No templates found. Add some like &quot;ORDER_PROCESSING&quot;.</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-700/50 transition-all group">
                    <td className="p-4 pl-6 font-mono text-xs font-bold text-indigo-400">{item.title}</td>
                    <td className="p-4 text-slate-300 max-w-sm truncate" title={item.message}>{item.message}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        item.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Template' : 'Add Template'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Trigger Type</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all uppercase"
                  placeholder="e.g. ORDER_PROCESSING"
                />
                <p className="text-[10px] text-slate-500 mt-1">Must exactly match the system event trigger.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Message Content</label>
                <textarea 
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="e.g. Your order {{orderId}} is processing!"
                />
                <p className="text-[10px] text-slate-500 mt-1">Use curly braces for dynamic variables, e.g. {"{{orderId}}"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
              >
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
