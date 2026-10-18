"use client";
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { getApiUrl } from '@/utils/api';
import { compressImage } from '@/utils/imageCompression';

export default function CommercialgtAdvertisementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', title: '', mediaUrl: '', linkUrl: '', position: 'HOMEPAGE', status: 'ACTIVE' });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  const API_URL = getApiUrl();
  const getFullImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('/') && !url.startsWith('//')) {
      return `${API_URL}${url}`;
    }
    return url;
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImg(true);
    try {
      const optimizedFile = await compressImage(file, 1600, 1200, 0.82);
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
          setFormData(prev => ({ ...prev, mediaUrl: json.urls[0] }));
          return;
        }
      }
    } catch (e) {
      console.warn("Server upload fallback to base64", e);
    } finally {
      setIsUploadingImg(false);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, mediaUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const fetchItems = async (isBackground = false) => {
    try {
      if (!isBackground && items.length === 0) setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      try {
        let res = await fetch(`${API_URL}/commercial/advertisements`, {
          cache: 'no-store',
          signal: controller.signal,
        }).catch(() => null);

        if (!res || !res.ok) {
          res = await fetch(`${API_URL}/content/advertisements`, {
            cache: 'no-store',
            signal: controller.signal,
          }).catch(() => null);
        }
        clearTimeout(timeoutId);
        if (res && res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const realItems = data.filter((item: any) => !item.id?.startsWith('ad-default-'));
            setItems(prev => {
              const map = new Map<string, any>();
              prev.forEach(it => { if (it?.id && !it.id.startsWith('ad-default-')) map.set(it.id, it); });
              realItems.forEach(it => { if (it?.id && !it.id.startsWith('ad-default-')) map.set(it.id, it); });
              const merged = Array.from(map.values());
              try {
                localStorage.setItem('mv_cache_advertisements', JSON.stringify(merged));
                localStorage.setItem('mv_cache_ads', JSON.stringify(merged));
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
    // 1. Instant load from local cache if present
    try {
      const cached = localStorage.getItem('mv_cache_advertisements') || localStorage.getItem('mv_cache_ads');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const realCached = parsed.filter((item: any) => !item.id?.startsWith('ad-default-'));
          setItems(realCached);
          setLoading(false);
          fetchItems(true);
          return;
        }
      }
    } catch {}

    // 2. Refresh from backend
    fetchItems(false);
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
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

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

    const payload = {
      ...dataToSend,
      mediaUrl: dataToSend.mediaUrl.trim() || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80',
    };

    setIsSaving(true);

    // 1. Save directly to backend
    try {
      const url = isEditing 
        ? `${API_URL}/commercial/advertisements/${formData.id}`
        : `${API_URL}/commercial/advertisements`;
      
      const method = isEditing ? 'PATCH' : 'POST';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Also mirror write to /content/advertisements for dual endpoint compatibility
      try {
        const contentUrl = isEditing
          ? `${API_URL}/content/advertisements/${formData.id}`
          : `${API_URL}/content/advertisements`;
        fetch(contentUrl, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {});
      } catch {}

      if (res.ok) {
        const saved = await res.json().catch(() => null);
        const savedItem = (saved && saved.id) ? saved : {
          id: (isEditing && formData.id) ? formData.id : ('ad-' + Date.now()),
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setItems(prev => {
          let next;
          if (isEditing && formData.id) {
            next = prev.map(i => i.id === formData.id ? savedItem : i);
          } else {
            next = [savedItem, ...prev.filter(i => i.id !== savedItem.id)];
          }
          try {
            localStorage.setItem('mv_cache_advertisements', JSON.stringify(next));
            localStorage.setItem('mv_cache_ads', JSON.stringify(next));
          } catch {}
          return next;
        });

        closeModal();
      } else {
        const fallbackItem = {
          id: (isEditing && formData.id) ? formData.id : ('ad-' + Date.now()),
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setItems(prev => {
          let next;
          if (isEditing && formData.id) {
            next = prev.map(i => i.id === formData.id ? fallbackItem : i);
          } else {
            next = [fallbackItem, ...prev];
          }
          try {
            localStorage.setItem('mv_cache_advertisements', JSON.stringify(next));
            localStorage.setItem('mv_cache_ads', JSON.stringify(next));
          } catch {}
          return next;
        });
        closeModal();
      }
    } catch (error: any) {
      console.warn("Backend sync notice: Advertisement saved locally", error);
      const fallbackItem = {
        id: (isEditing && formData.id) ? formData.id : ('ad-' + Date.now()),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setItems(prev => {
        let next;
        if (isEditing && formData.id) {
          next = prev.map(i => i.id === formData.id ? fallbackItem : i);
        } else {
          next = [fallbackItem, ...prev];
        }
        try {
          localStorage.setItem('mv_cache_advertisements', JSON.stringify(next));
          localStorage.setItem('mv_cache_ads', JSON.stringify(next));
        } catch {}
        return next;
      });
      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    // Optimistic delete
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    try {
      localStorage.setItem('mv_cache_advertisements', JSON.stringify(updated));
      localStorage.setItem('mv_cache_ads', JSON.stringify(updated));
    } catch {}

    try {
      await fetch(`${API_URL}/commercial/advertisements/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.warn("Backend delete error, updated locally", error);
    }
  };

  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    // Optimistic UI update and storage sync
    const updated = items.map(i => i.id === item.id ? { ...i, status: newStatus } : i);
    setItems(updated);
    try {
      localStorage.setItem('mv_cache_advertisements', JSON.stringify(updated));
      localStorage.setItem('mv_cache_ads', JSON.stringify(updated));
    } catch {}

    try {
      await fetch(`${API_URL}/commercial/advertisements/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.warn("Backend status toggle error, updated locally", error);
    }
  };

  // Filter items based on search and status
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Commercial &gt; Advertisements</h1>
          <p className="text-slate-400 mt-2 text-sm">Manage and configure promotional advertisements.</p>
        </div>
        <button onClick={() => openModal()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2 cursor-pointer active:scale-95">
          <Plus className="w-5 h-5" /> Add New
        </button>
      </header>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-3 justify-between">
          <input 
            type="text" 
            placeholder="Search advertisements..." 
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
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    {searchTerm || statusFilter !== 'ALL' ? 'No advertisements match your search filter.' : 'No advertisements found.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
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
                      <button onClick={() => handleToggleStatus(item)} className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50 cursor-pointer">
                        Toggle
                      </button>
                      <button onClick={() => openModal(item)} className="text-xs font-bold text-slate-400 hover:text-indigo-400 bg-slate-800/50 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50 cursor-pointer">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50 cursor-pointer">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">{isEditing ? 'Edit Advertisement' : 'Add Advertisement'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm" placeholder="Enter advertisement title" />
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
                      <span className="text-xl drop-shadow-md">{isUploadingImg ? '⏳' : '📸'}</span>
                      <span className="text-[10px] font-bold text-slate-300 leading-tight drop-shadow-md">
                        {isUploadingImg ? 'Compressing & uploading...' : <>Drop image or<br/>click to upload</>}
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
                  <input type="text" value={formData.mediaUrl} onChange={e => setFormData({...formData, mediaUrl: e.target.value})} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm min-w-0" placeholder="Or paste image URL here..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link URL (Optional)</label>
                <input type="text" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm" placeholder="https://... or /search" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Position</label>
                  <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm">
                    <option value="HOMEPAGE">Homepage</option>
                    <option value="SIDEBAR">Sidebar</option>
                    <option value="TOP_BAR">Top Bar</option>
                    <option value="SEARCH_PAGE">Search Page</option>
                    <option value="PRODUCT_PAGE">Product Page</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-sm">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer text-sm">
                  {isSaving ? 'Saving...' : (isEditing ? 'Update Advertisement' : 'Save Advertisement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

