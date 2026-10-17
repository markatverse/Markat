"use client";
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

export default function ContentgtAdvertisementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', title: '', mediaUrl: '', linkUrl: '', position: 'HOMEPAGE', status: 'ACTIVE' });
  const [isEditing, setIsEditing] = useState(false);
  const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();
  const getFullImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('/') && !url.startsWith('//')) {
      return `${API_URL}${url}`;
    }
    return url;
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/commercial/advertisements`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch advertisements", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModal = (item: any = null) => {
    if (item) {
      setFormData(item);
      setIsEditing(true);
    } else {
      setFormData({ id: '', title: '', mediaUrl: '', linkUrl: '', position: 'HOMEPAGE', status: 'ACTIVE' });
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
      ? `${API_URL}/commercial/advertisements/${formData.id}`
      : `${API_URL}/commercial/advertisements`;
    
    const method = isEditing ? 'PATCH' : 'POST';

    const { id, ...dataToSend } = formData;
    
    // Auto-extract real image URL if a Google Images/imgres link was pasted
    if (dataToSend.mediaUrl && dataToSend.mediaUrl.includes('google.com/imgres')) {
      try {
        const parsed = new URL(dataToSend.mediaUrl);
        const realImg = parsed.searchParams.get('imgurl');
        if (realImg) {
          dataToSend.mediaUrl = realImg;
        }
      } catch (err) {
        // keep original if parse fails
      }
    }
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
      const res = await fetch(`${API_URL}/commercial/advertisements/${id}`, { method: 'DELETE' });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    // Optimistic UI update for instant feedback
    setItems(currentItems => 
      currentItems.map(i => i.id === item.id ? { ...i, status: newStatus } : i)
    );

    try {
      const res = await fetch(`${API_URL}/commercial/advertisements/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        // Revert on server error
        fetchItems();
      }
    } catch (error) {
      console.error("Failed to toggle status", error);
      // Revert on network error
      fetchItems();
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Content &gt; Advertisements</h1>
          <p className="text-slate-400 mt-2 text-sm">Manage and configure promotional advertisements across the website.</p>
        </div>
        <button onClick={() => openModal()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add New Advertisement
        </button>
      </header>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Advertisement Preview</th>
                <th className="p-4">Position</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="p-4 pl-6"><div className="h-4 bg-slate-700/50 rounded w-32"></div></td>
                    <td className="p-4"><div className="h-12 w-24 bg-slate-700/50 rounded-md"></div></td>
                    <td className="p-4"><div className="h-6 bg-slate-700/50 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-6 bg-slate-700/50 rounded-full w-16"></div></td>
                    <td className="p-4 pr-6 flex justify-end gap-2"><div className="h-8 w-16 bg-slate-700/50 rounded"></div><div className="h-8 w-12 bg-slate-700/50 rounded"></div><div className="h-8 w-16 bg-slate-700/50 rounded"></div></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-400">No advertisements found.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/50 transition-all group">
                    <td className="p-4 pl-6 font-bold text-white text-base">{item.title}</td>
                    <td className="p-4">
                      {item.mediaUrl ? (
                        <img 
                          src={getFullImageUrl(item.mediaUrl)} 
                          alt={item.title} 
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = 'https://placehold.co/120x60/1e293b/94a3b8?text=No+Preview';
                          }}
                          className="h-12 w-24 object-cover rounded-md border border-slate-700 bg-slate-900 group-hover:border-emerald-500 transition-colors shadow-sm" 
                        />
                      ) : (
                        <div className="h-12 w-24 rounded-md border border-slate-700 bg-slate-900 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                       <div className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg inline-block border border-slate-700">{item.position}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${item.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button onClick={() => handleToggleStatus(item)} className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50">
                        Toggle
                      </button>
                      <button onClick={() => openModal(item)} className="text-xs font-bold text-slate-400 hover:text-indigo-400 bg-slate-800/50 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50">
                        Delete
                      </button>
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
              <h3 className="text-xl font-bold text-white">{isEditing ? 'Edit Advertisement' : 'Add Advertisement'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="Enter title" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Image (Drag & Drop or URL)</label>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <div 
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onloadend = () => setFormData({...formData, mediaUrl: reader.result as string});
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="sm:w-48 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center text-center hover:border-emerald-500 hover:bg-slate-800/50 transition-all group relative overflow-hidden"
                  >
                    {formData.mediaUrl ? (
                      <img 
                        src={getFullImageUrl(formData.mediaUrl)} 
                        alt="Preview" 
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" 
                      />
                    ) : null}
                    <div className="flex items-center gap-2 z-10 pointer-events-none px-2 py-3">
                      <span className="text-xl drop-shadow-md">📸</span>
                      <span className="text-[10px] font-bold text-slate-300 leading-tight drop-shadow-md">Drop image or<br/>click to upload</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setFormData({...formData, mediaUrl: reader.result as string});
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </div>
                  <input type="text" value={formData.mediaUrl} onChange={e => setFormData({...formData, mediaUrl: e.target.value})} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm min-w-0" placeholder="Or paste image URL here..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link URL (Optional)</label>
                <input type="text" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Position</label>
                <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                  <option value="HOMEPAGE">Homepage</option>
                  <option value="SIDEBAR">Sidebar</option>
                  <option value="TOP_BAR">Top Bar</option>
                  <option value="SEARCH_PAGE">Search Page</option>
                  <option value="PRODUCT_PAGE">Product Page</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
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
