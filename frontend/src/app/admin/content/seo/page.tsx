"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { getApiUrl } from '@/utils/api';
import { Search, Plus, Filter, Edit2, Trash2, Check, X, Globe, Sparkles } from 'lucide-react';

const COMMON_PAGE_URLS = [
  { label: 'Home Page', url: '/' },
  { label: 'About Us', url: '/about' },
  { label: 'Explore Marketplace', url: '/explore' },
  { label: 'Categories', url: '/categories' },
  { label: 'Services & Salon', url: '/services' },
  { label: 'Shopping Cart', url: '/cart' },
  { label: 'Secure Checkout', url: '/checkout' },
  { label: 'Contact Support', url: '/contact' },
  { label: 'Terms of Service', url: '/terms' },
  { label: 'Privacy Policy', url: '/privacy' },
];

export default function ContentSeoPage() {
  const [seoData, setSeoData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [formData, setFormData] = useState({ pageUrl: '', title: '', description: '', keywords: '', status: 'ACTIVE' });
  const [saving, setSaving] = useState(false);

  const fetchSeoData = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/content/seo`);
      if (res.ok) {
        const data = await res.json();
        setSeoData(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch SEO metadata:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoData();
  }, []);

  const filteredSeoData = useMemo(() => {
    return seoData.filter((item) => {
      const matchesSearch = 
        !searchQuery.trim() ||
        item.pageUrl?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [seoData, searchQuery, statusFilter]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this SEO entry?')) {
      try {
        const apiUrl = getApiUrl();
        await fetch(`${apiUrl}/content/seo/${id}`, { method: 'DELETE' });
        fetchSeoData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const apiUrl = getApiUrl();
      const url = editingId 
        ? `${apiUrl}/content/seo/${editingId}` 
        : `${apiUrl}/content/seo`;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        setFormData({ pageUrl: '', title: '', description: '', keywords: '', status: 'ACTIVE' });
        fetchSeoData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (seo: any) => {
    setFormData({
      pageUrl: seo.pageUrl,
      title: seo.title,
      description: seo.description || '',
      keywords: seo.keywords || '',
      status: seo.status || 'ACTIVE',
    });
    setEditingId(seo.id);
    setShowModal(true);
  };

  const handleToggleStatus = async (seo: any) => {
    const newStatus = seo.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/content/seo/${seo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchSeoData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full relative">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" /> Search Engine Optimization
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Content &gt; SEO</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage dynamic meta tags, titles, descriptions, and keywords per page URL.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ pageUrl: '', title: '', description: '', keywords: '', status: 'ACTIVE' });
            setShowModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> Add New SEO Entry
        </button>
      </header>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-700/80 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-850">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search URLs, titles, keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 w-full transition-colors" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 w-full sm:w-auto cursor-pointer">
              <option value="ALL">All Status ({seoData.length})</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        
        {/* SEO Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 text-center text-slate-400">Loading SEO metadata...</div>
          ) : filteredSeoData.length === 0 ? (
             <div className="p-12 text-center text-slate-400">
               {seoData.length === 0 ? 'No SEO entries found. Click "+ Add New SEO Entry" to create one.' : 'No entries matching your filter.'}
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/90 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                <tr>
                  <th className="p-4 pl-6">Page URL</th>
                  <th className="p-4">Meta Title & Description</th>
                  <th className="p-4">Keywords</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredSeoData.map((seo) => (
                  <tr key={seo.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-bold text-white font-mono text-sm bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                        {seo.pageUrl}
                      </span>
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="font-semibold text-slate-200 text-sm mb-1 leading-snug">{seo.title}</div>
                      {seo.description && (
                        <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{seo.description}</div>
                      )}
                    </td>
                    <td className="p-4 max-w-xs">
                      {seo.keywords ? (
                        <div className="flex flex-wrap gap-1">
                          {seo.keywords.split(',').slice(0, 3).map((kw: string, i: number) => (
                            <span key={i} className="text-[11px] bg-slate-900 text-indigo-300 border border-slate-700 px-2 py-0.5 rounded-md font-medium">
                              {kw.trim()}
                            </span>
                          ))}
                          {seo.keywords.split(',').length > 3 && (
                            <span className="text-[10px] text-slate-500 self-center">
                              +{seo.keywords.split(',').length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      {seo.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-bold">
                          <X className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleStatus(seo)} 
                          title="Toggle Active/Inactive"
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer">
                          Toggle
                        </button>
                        <button 
                          onClick={() => handleEdit(seo)} 
                          title="Edit Metadata"
                          className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(seo.id)} 
                          title="Delete Entry"
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                {editingId ? 'Edit SEO Metadata' : 'Add New SEO Metadata'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Page URL Path</label>
                <input 
                  type="text" 
                  placeholder="e.g. /about or /explore" 
                  required 
                  value={formData.pageUrl} 
                  onChange={e => setFormData({...formData, pageUrl: e.target.value})} 
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 w-full" 
                />
                {/* Quick URL Suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_PAGE_URLS.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => setFormData({ ...formData, pageUrl: item.url })}
                      className="text-[11px] bg-slate-900 hover:bg-slate-700 border border-slate-700/80 text-slate-300 px-2 py-0.5 rounded-md cursor-pointer transition-colors">
                      {item.url}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Meta Title</label>
                <input 
                  type="text" 
                  placeholder="SEO Title displayed in Google Search results..." 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 w-full" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Meta Description</label>
                <textarea 
                  placeholder="Compelling description summarizing the page for search engines (approx 150-160 characters)..." 
                  required 
                  rows={3} 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 w-full leading-relaxed"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Keywords (Comma Separated)</label>
                <input 
                  type="text" 
                  placeholder="keyword1, keyword2, keyword3..." 
                  value={formData.keywords} 
                  onChange={e => setFormData({...formData, keywords: e.target.value})} 
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 w-full" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Status</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})} 
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 w-full cursor-pointer">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm font-semibold cursor-pointer">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer">
                  {saving ? 'Saving...' : editingId ? 'Update SEO' : 'Save SEO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
