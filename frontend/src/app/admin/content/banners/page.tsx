"use client";
import React, { useEffect, useState } from 'react';

const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

const getFullImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('/') && !url.startsWith('//')) {
    return `${API_URL}${url}`;
  }
  return url;
};

export default function ContentBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', linkUrl: '', position: 'HOME_HERO', status: 'ACTIVE' });

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/content/banners`);
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this Banner?')) {
      try {
        await fetch(`${API_URL}/content/banners/${id}`, { method: 'DELETE' });
        fetchBanners();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${API_URL}/content/banners/${editingId}` 
        : `${API_URL}/content/banners`;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        setFormData({ title: '', imageUrl: '', linkUrl: '', position: 'HOME_HERO', status: 'ACTIVE' });
        fetchBanners();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (banner: any) => {
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      position: banner.position,
      status: banner.status,
    });
    setEditingId(banner.id);
    setShowModal(true);
  };

  const handleToggleStatus = async (banner: any) => {
    const newStatus = banner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    // Optimistic UI update for instant feedback
    setBanners(currentBanners => 
      currentBanners.map(b => b.id === banner.id ? { ...b, status: newStatus } : b)
    );

    try {
      const res = await fetch(`${API_URL}/content/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        // Revert on server error
        fetchBanners();
      }
    } catch (e) {
      console.error("Failed to toggle status", e);
      // Revert on network error
      fetchBanners();
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full relative">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Content &gt; Banners</h1>
          <p className="text-slate-400 mt-2 text-sm">Manage and configure promotional banners.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', imageUrl: '', linkUrl: '', position: 'HOME_HERO', status: 'ACTIVE' });
            setShowModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2">
          + Add New Banner
        </button>
      </header>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between">
          <input type="text" placeholder="Search banners..." className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 w-64" />
          <select className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <table className="w-full text-left border-collapse">
               <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                 <tr>
                   <th className="p-4 pl-6">Title</th>
                   <th className="p-4">Banner Preview</th>
                   <th className="p-4">Position</th>
                   <th className="p-4">Status</th>
                   <th className="p-4 pr-6 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/50">
                 {Array.from({ length: 3 }).map((_, i) => (
                   <tr key={`skeleton-${i}`} className="animate-pulse">
                     <td className="p-4 pl-6"><div className="h-4 bg-slate-700/50 rounded w-32"></div></td>
                     <td className="p-4"><div className="h-12 w-24 bg-slate-700/50 rounded-md"></div></td>
                     <td className="p-4"><div className="h-6 bg-slate-700/50 rounded w-24"></div></td>
                     <td className="p-4"><div className="h-6 bg-slate-700/50 rounded-full w-16"></div></td>
                     <td className="p-4 pr-6 flex justify-end gap-2"><div className="h-8 w-16 bg-slate-700/50 rounded"></div><div className="h-8 w-12 bg-slate-700/50 rounded"></div><div className="h-8 w-16 bg-slate-700/50 rounded"></div></td>
                   </tr>
                 ))}
               </tbody>
             </table>
          ) : banners.length === 0 ? (
             <div className="p-8 text-center text-slate-400">No Banners found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                <tr>
                  <th className="p-4 pl-6">Title</th>
                  <th className="p-4">Banner Preview</th>
                  <th className="p-4">Position</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-slate-700/50 transition-all group">
                    <td className="p-4 pl-6 font-bold text-white text-base">{banner.title}</td>
                    <td className="p-4">
                      {banner.imageUrl ? (
                        <img 
                          src={getFullImageUrl(banner.imageUrl)} 
                          alt={banner.title} 
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
                       <div className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg inline-block border border-slate-700">{banner.position}</div>
                    </td>
                    <td className="p-4">
                      {banner.status === 'ACTIVE' ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold">Active</span>
                      ) : (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-bold">Inactive</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button onClick={() => handleToggleStatus(banner)} className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50">
                        Toggle
                      </button>
                      <button onClick={() => handleEdit(banner)} className="text-xs font-bold text-slate-400 hover:text-indigo-400 bg-slate-800/50 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(banner.id)} className="text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-[500px] shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">{editingId ? 'Edit Banner' : 'Add Banner'}</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <input type="text" placeholder="Banner Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
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
                        reader.onloadend = () => setFormData({...formData, imageUrl: reader.result as string});
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="sm:w-48 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center text-center hover:border-emerald-500 hover:bg-slate-800/50 transition-all group relative overflow-hidden"
                  >
                    {formData.imageUrl ? (
                      <img 
                        src={getFullImageUrl(formData.imageUrl)} 
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
                          reader.onloadend = () => setFormData({...formData, imageUrl: reader.result as string});
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </div>
                  <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm min-w-0" placeholder="Or paste image URL here..." />
                </div>
              </div>
              <div>
                <input type="text" placeholder="Link URL (e.g. /category/shoes)" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
                <option value="HOME_HERO">Home Hero</option>
                <option value="SIDEBAR">Sidebar</option>
                <option value="TOP_BAR">Top Bar</option>
              </select>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
                <option value="INACTIVE">Inactive</option>
                <option value="ACTIVE">Active</option>
              </select>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-bold">{editingId ? 'Update Banner' : 'Save Banner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

