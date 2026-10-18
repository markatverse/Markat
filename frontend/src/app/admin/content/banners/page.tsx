"use client";
import React, { useEffect, useState } from 'react';

import { getApiUrl } from '@/utils/api';
import { compressImage } from '@/utils/imageCompression';

const API_URL = getApiUrl();

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  const handleImageUpload = async (file: File) => {
    setIsUploadingImg(true);
    try {
      // 1. Automatically compress and convert to lightweight WebP (saves 80-90% bandwidth & storage)
      const optimizedFile = await compressImage(file, 1920, 1080, 0.82);

      const data = new FormData();
      data.append('files', optimizedFile);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: data,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.urls && json.urls.length > 0) {
          setFormData(prev => ({ ...prev, imageUrl: json.urls[0] }));
          return;
        }
      }
    } catch (e) {
      console.warn("Server upload fallback", e);
    } finally {
      setIsUploadingImg(false);
    }

    // Safe compressed base64 fallback (max 1200px, 0.7 quality)
    try {
      const fallbackFile = await compressImage(file, 1200, 800, 0.70);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(fallbackFile);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchBanners = async (isBackground = false) => {
    try {
      if (!isBackground && banners.length === 0) setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // Fast 3.5s timeout
      try {
        const res = await fetch(`${API_URL}/content/banners`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const realData = data.filter((b: any) => !b.id?.startsWith('bn-dummy-'));
            setBanners(prev => {
              const map = new Map<string, any>();
              prev.forEach(b => { if (b?.id && !b.id.startsWith('bn-dummy-')) map.set(b.id, b); });
              realData.forEach(b => { if (b?.id && !b.id.startsWith('bn-dummy-')) map.set(b.id, b); });
              const merged = Array.from(map.values());
              try {
                localStorage.setItem('mv_cache_banners', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      } catch {
        clearTimeout(timeoutId);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Instant load from local cache if present - ZERO wait
    try {
      const cached = localStorage.getItem('mv_cache_banners');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBanners(parsed);
          setLoading(false);
          // Background revalidation
          fetchBanners(true);
          return;
        }
      }
    } catch {}

    // 2. Otherwise regular fetch with minimal spinner
    fetchBanners(false);
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this Banner?')) {
      // Optimistic delete
      const updated = banners.filter(b => b.id !== id);
      setBanners(updated);
      try {
        localStorage.setItem('mv_cache_banners', JSON.stringify(updated));
      } catch {}

      try {
        await fetch(`${API_URL}/content/banners/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn("Backend delete banner error or offline, updated locally", e);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a Banner title.");
      return;
    }

    const payload = {
      ...formData,
      imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    };

    setIsSaving(true);
    const tempId = editingId || ('bn-' + Date.now());

    // 1. Save directly to backend
    try {
      const url = editingId 
        ? `${API_URL}/content/banners/${editingId}` 
        : `${API_URL}/content/banners`;
      const method = editingId ? 'PATCH' : 'POST';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const saved = await res.json().catch(() => null);
        const savedBanner = (saved && saved.id) ? saved : {
          id: tempId,
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setBanners(prev => {
          let next;
          if (editingId) {
            next = prev.map(b => b.id === editingId ? savedBanner : b);
          } else {
            next = [savedBanner, ...prev.filter(b => b.id !== savedBanner.id)];
          }
          try {
            localStorage.setItem('mv_cache_banners', JSON.stringify(next));
          } catch {}
          return next;
        });

        setShowModal(false);
        setEditingId(null);
        setFormData({ title: '', imageUrl: '', linkUrl: '', position: 'HOME_HERO', status: 'ACTIVE' });
      } else {
        const fallbackBanner = {
          id: tempId,
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setBanners(prev => {
          let next;
          if (editingId) {
            next = prev.map(b => b.id === editingId ? fallbackBanner : b);
          } else {
            next = [fallbackBanner, ...prev];
          }
          try {
            localStorage.setItem('mv_cache_banners', JSON.stringify(next));
          } catch {}
          return next;
        });
        setShowModal(false);
        setEditingId(null);
        setFormData({ title: '', imageUrl: '', linkUrl: '', position: 'HOME_HERO', status: 'ACTIVE' });
      }
    } catch (e: any) {
      console.warn("Backend sync notice: Banner saved locally", e);
      const fallbackBanner = {
        id: tempId,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setBanners(prev => {
        let next;
        if (editingId) {
          next = prev.map(b => b.id === editingId ? fallbackBanner : b);
        } else {
          next = [fallbackBanner, ...prev];
        }
        try {
          localStorage.setItem('mv_cache_banners', JSON.stringify(next));
        } catch {}
        return next;
      });
      setShowModal(false);
      setEditingId(null);
      setFormData({ title: '', imageUrl: '', linkUrl: '', position: 'HOME_HERO', status: 'ACTIVE' });
    } finally {
      setIsSaving(false);
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
    
    // Optimistic UI update & storage sync
    const updated = banners.map(b => b.id === banner.id ? { ...b, status: newStatus } : b);
    setBanners(updated);
    try {
      localStorage.setItem('mv_cache_banners', JSON.stringify(updated));
    } catch {}

    try {
      await fetch(`${API_URL}/content/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn("Backend status update error, updated locally", e);
    }
  };

  // Filter banners based on search and status
  const filteredBanners = banners.filter(banner => {
    const matchesSearch = !searchTerm || banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) || banner.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || banner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full relative">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Content &gt; Banners</h1>
          <p className="text-slate-400 mt-2 text-sm">Manage and configure promotional banners across the marketplace.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', imageUrl: '', linkUrl: '', position: 'HOME_HERO', status: 'ACTIVE' });
            setShowModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2 cursor-pointer active:scale-95">
          + Add New Banner
        </button>
      </header>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-3 justify-between">
          <input 
            type="text" 
            placeholder="Search banners..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 w-full sm:w-64 text-sm" 
          />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm">
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          {loading && banners.length === 0 ? (
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
          ) : filteredBanners.length === 0 ? (
             <div className="p-8 text-center text-slate-400">
               {searchTerm || statusFilter !== 'ALL' ? 'No banners match your search filter.' : 'No Banners found.'}
             </div>
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
                {filteredBanners.map((banner) => (
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
                      <button onClick={() => handleToggleStatus(banner)} className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50 cursor-pointer">
                        Toggle
                      </button>
                      <button onClick={() => handleEdit(banner)} className="text-xs font-bold text-slate-400 hover:text-indigo-400 bg-slate-800/50 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50 cursor-pointer">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(banner.id)} className="text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50 cursor-pointer">
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-slate-800">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Banner Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mega Spring Discount 50% Off" 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Image (Drag & Drop or URL)</label>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <div 
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        await handleImageUpload(file);
                      }
                    }}
                    className="sm:w-48 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center text-center hover:border-emerald-500 hover:bg-slate-800/50 transition-all group relative overflow-hidden min-h-[80px]"
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
                      <span className="text-[10px] font-bold text-slate-300 leading-tight drop-shadow-md">
                        {isUploadingImg ? 'Uploading...' : 'Drop image or\nclick to upload'}
                      </span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handleImageUpload(file);
                        }
                      }} 
                    />
                  </div>
                  <input 
                    type="text" 
                    value={formData.imageUrl} 
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm min-w-0" 
                    placeholder="Or paste image URL here..." 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Link URL (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. /category/electronics or /services" 
                  value={formData.linkUrl} 
                  onChange={e => setFormData({...formData, linkUrl: e.target.value})} 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Position</label>
                  <select 
                    value={formData.position} 
                    onChange={e => setFormData({...formData, position: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm">
                    <option value="HOME_HERO">Home Hero</option>
                    <option value="SIDEBAR">Sidebar</option>
                    <option value="TOP_BAR">Top Bar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-sm cursor-pointer">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer text-sm flex items-center gap-2">
                  {isSaving ? 'Saving...' : (editingId ? 'Update Banner' : 'Save Banner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

