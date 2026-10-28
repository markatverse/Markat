"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ExternalLink, 
  RotateCcw, 
  FileCode, 
  Eye, 
  Calendar,
  Lock,
  Globe
} from 'lucide-react';
import { getApiUrl } from '@/utils/api';
import MascotState from '@/components/MascotState';

const API_URL = getApiUrl();
const STORAGE_KEY = 'mv_cache_cms_pages';

export interface CmsPageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'PUBLISHED' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_CMS_PAGES: CmsPageItem[] = [
  {
    id: 'cms-about',
    title: 'About MarkatVerse',
    slug: 'about',
    content: `<h2>Welcome to MarkatVerse</h2><p>India's leading unified marketplace combining hyperlocal neighborhood commerce, live salon & queue booking, and nationwide B2B trade.</p><h3>Our Mission</h3><p>To empower 10M+ local retailers, salons, and MSMEs with state-of-the-art digital storefronts and instant escrow payments.</p>`,
    status: 'PUBLISHED',
    createdAt: '2026-10-20T08:00:00.000Z',
    updatedAt: '2026-10-27T10:00:00.000Z',
  },
  {
    id: 'cms-terms',
    title: 'Terms of Service',
    slug: 'terms',
    content: `<h2>Terms of Service</h2><p>Please read these Terms of Service carefully before using the MarkatVerse platform. By using our website or mobile applications, you agree to these terms.</p><h3>1. User Accounts</h3><p>You must maintain the confidentiality of your login credentials.</p><h3>2. Transactions & Escrow</h3><p>Payments are securely escrowed until delivery confirmation or service completion.</p>`,
    status: 'PUBLISHED',
    createdAt: '2026-10-18T09:00:00.000Z',
    updatedAt: '2026-10-26T12:00:00.000Z',
  },
  {
    id: 'cms-privacy',
    title: 'Privacy Policy',
    slug: 'privacy',
    content: `<h2>Privacy Policy</h2><p>At MarkatVerse, we are committed to safeguarding your personal data and sensitive transaction details in full compliance with the Digital Personal Data Protection (DPDP) Act of India.</p>`,
    status: 'PUBLISHED',
    createdAt: '2026-10-18T09:30:00.000Z',
    updatedAt: '2026-10-25T15:00:00.000Z',
  },
  {
    id: 'cms-refund',
    title: 'Refund & Cancellation Policy',
    slug: 'refund-policy',
    content: `<h2>Refund & Cancellation Policy</h2><p>Customers can cancel appointments up to 30 minutes before the scheduled time for full refund. Physical product returns are honored within 7 days of verified delivery.</p>`,
    status: 'PUBLISHED',
    createdAt: '2026-10-19T11:00:00.000Z',
    updatedAt: '2026-10-24T14:20:00.000Z',
  },
  {
    id: 'cms-seller-guide',
    title: 'Seller Onboarding Guidelines',
    slug: 'seller-guidelines',
    content: `<h2>Seller Onboarding Guidelines</h2><p>Guidelines for verified GSTIN merchants, salon operators, and B2B wholesale suppliers joining the MarkatVerse network.</p>`,
    status: 'DRAFT',
    createdAt: '2026-10-22T14:00:00.000Z',
    updatedAt: '2026-10-27T09:30:00.000Z',
  },
];

export default function ContentCmsPage() {
  const [pages, setPages] = useState<CmsPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [previewPage, setPreviewPage] = useState<CmsPageItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveToStorage = (data: CmsPageItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };

  const getStoredPages = (): CmsPageItem[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_CMS_PAGES;
  };

  const fetchPages = async (isBackground = false) => {
    if (!isBackground && pages.length === 0) setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${API_URL}/content/cms`, {
        cache: 'no-store',
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPages(data);
          saveToStorage(data);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend CMS fetch error or offline, using cached pages', e);
    } finally {
      setLoading(false);
    }

    const fallback = getStoredPages();
    setPages(fallback);
    saveToStorage(fallback);
  };

  useEffect(() => {
    const initial = getStoredPages();
    setPages(initial);
    setLoading(false);
    fetchPages(true);
  }, []);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      status: 'PUBLISHED',
    });
    setShowModal(true);
  };

  const handleEdit = (page: CmsPageItem) => {
    setEditingId(page.id);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      status: page.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a page title.');
      return;
    }

    const slug = formData.slug.trim() || generateSlug(formData.title);
    const payload: CmsPageItem = {
      id: editingId || 'cms-' + Date.now(),
      title: formData.title.trim(),
      slug,
      content: formData.content.trim(),
      status: formData.status,
      createdAt: editingId ? (pages.find(p => p.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIsSaving(true);

    setPages(prev => {
      let next: CmsPageItem[];
      if (editingId) {
        next = prev.map(p => (p.id === editingId ? payload : p));
      } else {
        next = [payload, ...prev];
      }
      saveToStorage(next);
      return next;
    });

    setShowModal(false);
    showToast(editingId ? 'CMS page updated successfully!' : 'New CMS page created!');

    try {
      const url = editingId ? `${API_URL}/content/cms/${editingId}` : `${API_URL}/content/cms`;
      const method = editingId ? 'PATCH' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Backend sync deferred; stored locally', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CMS page?')) return;

    const next = pages.filter(p => p.id !== id);
    setPages(next);
    saveToStorage(next);
    showToast('CMS page deleted.');

    try {
      await fetch(`${API_URL}/content/cms/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend delete error, updated locally', e);
    }
  };

  const handleToggleStatus = async (page: CmsPageItem) => {
    const newStatus: 'PUBLISHED' | 'DRAFT' = page.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const updated = pages.map(p => (p.id === page.id ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p));
    setPages(updated);
    saveToStorage(updated);
    showToast(`Page marked as ${newStatus}.`);

    try {
      await fetch(`${API_URL}/content/cms/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
  };

  const handleRestoreDefaults = () => {
    if (!confirm('Restore default legal and information CMS pages?')) return;
    setPages(DEFAULT_CMS_PAGES);
    saveToStorage(DEFAULT_CMS_PAGES);
    showToast('Default CMS pages restored.');
  };

  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        page.title.toLowerCase().includes(q) ||
        page.slug.toLowerCase().includes(q) ||
        page.content.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || page.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pages, searchTerm, statusFilter]);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full relative pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400/30 animate-in slide-in-from-top-4 duration-200">
          <Check className="w-5 h-5 text-emerald-200 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black tracking-widest uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Information Architecture
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Content &gt; CMS Pages</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700 font-semibold">
              {pages.length} Pages
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Manage legal policies, about pages, guidelines, and static informational pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Default Pages</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2 cursor-pointer active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Page</span>
          </button>
        </div>
      </header>

      {/* Table Container */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search pages by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500 w-full text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
            >
              <option value="ALL">All Status ({pages.length})</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Draft Only</option>
            </select>
          </div>
        </div>

        {/* Content list or Mascot */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <span>Loading CMS pages...</span>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
              {searchTerm || statusFilter !== 'ALL' ? (
                <div className="bg-white rounded-2xl p-6 shadow-inner max-w-md w-full">
                  <MascotState
                    state="no-search"
                    title="No Matching Pages"
                    description={`No CMS pages match "${searchTerm}".`}
                    actionText="Clear Filters"
                    onAction={() => {
                      setSearchTerm('');
                      setStatusFilter('ALL');
                    }}
                    compact={true}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-inner max-w-md w-full">
                  <MascotState
                    state="cart-empty"
                    title="No CMS Pages Found"
                    description="No static or legal pages found. Restore default legal pages or add a new page."
                    actionText="+ Add New Page"
                    onAction={handleOpenAdd}
                    secondaryText="Restore Defaults"
                    onSecondaryAction={handleRestoreDefaults}
                    compact={true}
                  />
                </div>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                <tr>
                  <th className="p-4 pl-6">Title & Slug</th>
                  <th className="p-4">Public URL</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date Modified</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-700/40 transition-all group">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                        {page.title}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        /{page.slug}
                      </div>
                    </td>

                    <td className="p-4">
                      <Link
                        href={`/${page.slug}`}
                        target="_blank"
                        className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        <span>/{page.slug}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </Link>
                    </td>

                    <td className="p-4">
                      {page.status === 'PUBLISHED' ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-xs text-slate-400">
                      {new Date(page.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-4 pr-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewPage(page)}
                        title="Preview Content"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(page)}
                        className="text-xs font-bold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-all border border-slate-700/60 cursor-pointer"
                      >
                        {page.status === 'PUBLISHED' ? 'Draft' : 'Publish'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(page)}
                        className="text-xs font-bold text-slate-400 hover:text-indigo-400 bg-slate-900/60 hover:bg-indigo-500/10 px-2.5 py-1.5 rounded-lg transition-all border border-slate-700/60 cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(page.id)}
                        className="text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition-all border border-slate-700/60 cursor-pointer"
                      >
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingId ? 'Edit CMS Page' : 'Add New CMS Page'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId ? 'Modify page content, HTML markup, and status' : 'Create a new static page'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Return Policy or Seller Agreement"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title: newTitle,
                      slug: !editingId ? generateSlug(newTitle) : prev.slug,
                    }));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. return-policy"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm font-mono text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Publish Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                  >
                    <option value="PUBLISHED">Published (Live)</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  HTML / Markdown Content
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="<h2>Heading</h2><p>Page description...</p>"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer text-sm flex items-center gap-2 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : editingId ? 'Update Page' : 'Save Page'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                CMS Render Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewPage(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">{previewPage.title}</h2>
            <div className="text-xs text-slate-400 font-mono mb-4 pb-3 border-b border-slate-800">
              Route: /{previewPage.slug}
            </div>

            <div
              className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewPage.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
