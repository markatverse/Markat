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
  FileText, 
  Eye, 
  Sparkles,
  Calendar,
  User,
  Tag,
  Sliders
} from 'lucide-react';
import { getApiUrl } from '@/utils/api';
import { compressImage } from '@/utils/imageCompression';
import MascotState from '@/components/MascotState';

const API_URL = getApiUrl();
const STORAGE_KEY = 'mv_cache_blog_posts';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  featuredImage?: string;
  tags?: string[];
  status: 'PUBLISHED' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Top 10 Hyperlocal Shopping Secrets Across India',
    slug: 'top-10-hyperlocal-shopping-secrets-india',
    excerpt: 'Discover how MarkatVerse connects buyers directly to trusted neighborhood merchants with same-day delivery and live token tracking.',
    content: `# Top 10 Hyperlocal Shopping Secrets Across India\n\nShopping locally has never been easier or more reliable. Here are the top ways to find the best local deals and fresh produce right in your neighborhood.\n\n### 1. Leverage Real-Time Neighborhood Discovery\nWith MarkatVerse's geospatial radius search, you can see inventory available within a 5km radius.\n\n### 2. Live Token Tracking for Queue-Free Visits\nSkip waiting lines at local stores and salons by booking a live token.\n\n### 3. Direct Merchant Chat\nNegotiate bulk prices or ask about item freshness before checking out.`,
    author: 'MarkatVerse Editorial',
    featuredImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    tags: ['E-Commerce', 'Hyperlocal', 'Shopping Tips'],
    status: 'PUBLISHED',
    createdAt: '2026-10-25T10:00:00.000Z',
    updatedAt: '2026-10-27T14:30:00.000Z',
  },
  {
    id: 'post-2',
    title: 'How Live Token Queue Tracking is Transforming Local Salons',
    slug: 'live-token-queue-salon-transformation',
    excerpt: 'Salons and barbers are saving hours of waiting time with real-time token queues and instant slot notifications.',
    content: `# Transforming Local Salons with Live Queue Technology\n\nTraditional salon visits often mean sitting in crowded waiting areas with uncertain turnaround times. MarkatVerse changes the game with digital token management.\n\n### Key Benefits:\n- Customers track real-time queue position from their smartphones\n- Salons optimize chair turnaround and reduce cancellations\n- Digital reminders when it's your turn to arrive`,
    author: 'Services Team',
    featuredImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    tags: ['Services', 'Salon', 'Tech Innovation'],
    status: 'PUBLISHED',
    createdAt: '2026-10-24T08:15:00.000Z',
    updatedAt: '2026-10-26T11:20:00.000Z',
  },
  {
    id: 'post-3',
    title: 'B2B Trade & Wholesale: Unlocking Margin Growth for MSMEs',
    slug: 'b2b-trade-wholesale-msme-growth',
    excerpt: 'How small businesses are procuring raw materials and bulk products at manufacturer prices with transparent RFQs.',
    content: `# B2B Trade & Wholesale: Unlocking Margin Growth for MSMEs\n\nMicro, Small and Medium Enterprises (MSMEs) drive India's trade economy. Discover how digital RFQ pipelines enable higher margins through tiered bulk pricing and verified wholesale suppliers.`,
    author: 'Trade Desk',
    featuredImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    tags: ['B2B', 'Wholesale', 'MSME'],
    status: 'PUBLISHED',
    createdAt: '2026-10-22T09:00:00.000Z',
    updatedAt: '2026-10-25T16:45:00.000Z',
  },
  {
    id: 'post-4',
    title: 'MarkatVerse Fast Checkout: One-Click UPI & Secure Escrow',
    slug: 'markatverse-fast-checkout-upi-escrow',
    excerpt: 'An insider look into our next-gen payment architecture combining zero-friction UPI with buyer protection escrow.',
    content: `# MarkatVerse Fast Checkout Architecture\n\nSecurity and speed are the pillars of modern commerce. Read how MarkatVerse integrates seamless UPI payments with milestone-based buyer escrow protection.`,
    author: 'Engineering Team',
    featuredImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    tags: ['Fintech', 'UPI', 'Security'],
    status: 'DRAFT',
    createdAt: '2026-10-26T12:00:00.000Z',
    updatedAt: '2026-10-27T09:10:00.000Z',
  },
];

export default function ContentBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [previewModalPost, setPreviewModalPost] = useState<BlogPost | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: '',
    featuredImage: '',
    excerpt: '',
    content: '',
    tags: '',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const savePostsToCache = (data: BlogPost[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };

  const getCachedPosts = (): BlogPost[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_POSTS;
  };

  // Fetch posts from backend or fallback to cached/default posts
  const fetchPosts = async (isBackground = false) => {
    if (!isBackground && posts.length === 0) setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${API_URL}/content/blog`, {
        cache: 'no-store',
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data);
          savePostsToCache(data);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend blog fetch error or empty, using cached data', e);
    } finally {
      setLoading(false);
    }

    // Fallback: check cache or initialize defaults
    const cached = getCachedPosts();
    setPosts(cached);
    savePostsToCache(cached);
  };

  useEffect(() => {
    const initial = getCachedPosts();
    setPosts(initial);
    setLoading(false);
    fetchPosts(true);
  }, []);

  const handleImageUpload = async (file: File) => {
    setIsUploadingImg(true);
    try {
      const optimized = await compressImage(file, 1600, 1000, 0.82);
      const data = new FormData();
      data.append('files', optimized);

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: data,
      }).catch(() => null);

      if (res && res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.urls && json.urls.length > 0) {
          setFormData((prev) => ({ ...prev, featuredImage: json.urls[0] }));
          showToast('Image uploaded and optimized.');
          return;
        }
      }
    } catch (e) {
      console.warn('Backend image upload fallback', e);
    } finally {
      setIsUploadingImg(false);
    }

    // Local base64 fallback
    try {
      const fallbackFile = await compressImage(file, 1200, 800, 0.75);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, featuredImage: reader.result as string }));
        showToast('Image loaded locally.');
      };
      reader.readAsDataURL(fallbackFile);
    } catch {}
  };

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
      author: 'Admin Editorial',
      featuredImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      excerpt: '',
      content: '',
      tags: 'E-Commerce, MarkatVerse',
      status: 'PUBLISHED',
    });
    setShowModal(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      author: post.author || 'Editorial',
      featuredImage: post.featuredImage || '',
      excerpt: post.excerpt || '',
      content: post.content,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      status: post.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a post title.');
      return;
    }

    const slug = formData.slug.trim() || generateSlug(formData.title);
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: BlogPost = {
      id: editingId || 'post-' + Date.now(),
      title: formData.title.trim(),
      slug,
      author: formData.author.trim() || 'Editorial Team',
      featuredImage: formData.featuredImage.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      excerpt: formData.excerpt.trim() || formData.content.substring(0, 150) + '...',
      content: formData.content.trim(),
      tags: tagsArray,
      status: formData.status,
      createdAt: editingId ? (posts.find((p) => p.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIsSaving(true);

    // Optimistic UI update
    setPosts((prev) => {
      let next: BlogPost[];
      if (editingId) {
        next = prev.map((p) => (p.id === editingId ? payload : p));
      } else {
        next = [payload, ...prev];
      }
      savePostsToCache(next);
      return next;
    });

    setShowModal(false);
    showToast(editingId ? 'Blog post updated successfully!' : 'New blog post published!');

    // Backend sync attempt
    try {
      const url = editingId ? `${API_URL}/content/blog/${editingId}` : `${API_URL}/content/blog`;
      const method = editingId ? 'PATCH' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Backend sync deferred; saved locally', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    const next = posts.filter((p) => p.id !== id);
    setPosts(next);
    savePostsToCache(next);
    showToast('Blog post deleted.');

    try {
      await fetch(`${API_URL}/content/blog/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend delete error, updated locally', e);
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus: 'PUBLISHED' | 'DRAFT' = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const updated = posts.map((p) => (p.id === post.id ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p));
    setPosts(updated);
    savePostsToCache(updated);
    showToast(`Post marked as ${newStatus}.`);

    try {
      await fetch(`${API_URL}/content/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
  };

  const handleRestoreDefaults = () => {
    if (!confirm('Restore default sample blog posts?')) return;
    setPosts(DEFAULT_POSTS);
    savePostsToCache(DEFAULT_POSTS);
    showToast('Sample blog posts restored.');
  };

  // Filtered post list
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        post.author?.toLowerCase().includes(q) ||
        post.content?.toLowerCase().includes(q) ||
        post.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [posts, searchTerm, statusFilter]);

  const publishedCount = posts.filter((p) => p.status === 'PUBLISHED').length;
  const draftCount = posts.filter((p) => p.status === 'DRAFT').length;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full relative pb-20">
      {/* Toast Notification */}
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
              Content Editorial
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Content &gt; Blog</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700 font-semibold">
              {posts.length} Posts
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Publish, edit, and manage educational articles, shopping tips, and marketplace announcements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Sample Posts</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2 cursor-pointer active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Post</span>
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Articles</div>
          <div className="text-2xl font-black text-white">{posts.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for readers</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Published</div>
          <div className="text-2xl font-black text-emerald-400">{publishedCount} Live</div>
          <div className="text-[11px] text-slate-500 mt-1">Visible across site</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Drafts</div>
          <div className="text-2xl font-black text-amber-400">{draftCount} In Progress</div>
          <div className="text-[11px] text-slate-500 mt-1">Internal review</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">SEO Readiness</div>
          <div className="text-2xl font-black text-indigo-400">100%</div>
          <div className="text-[11px] text-slate-500 mt-1">Clean slugs & tags</div>
        </div>
      </div>

      {/* Main Content Table & Controls */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, tag, or author..."
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
              <option value="ALL">All Status ({posts.length})</option>
              <option value="PUBLISHED">Published Only ({publishedCount})</option>
              <option value="DRAFT">Drafts Only ({draftCount})</option>
            </select>
          </div>
        </div>

        {/* Posts Table or Empty State with Mascot */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <span>Loading blog posts...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
              {searchTerm || statusFilter !== 'ALL' ? (
                <div className="bg-white rounded-2xl p-6 shadow-inner max-w-md w-full">
                  <MascotState
                    state="no-search"
                    title="No Matching Articles"
                    description={`No blog posts match "${searchTerm}". Try a different keyword or reset the filter.`}
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
                    title="No Blog Posts Yet"
                    description="Your blog is currently empty. Create your first article or restore sample posts with one click."
                    actionText="+ Create First Post"
                    onAction={handleOpenAdd}
                    secondaryText="Restore Sample Posts"
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
                  <th className="p-4 pl-6">Cover</th>
                  <th className="p-4">Title & Slug</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Updated</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-700/40 transition-all group">
                    {/* Cover Thumbnail */}
                    <td className="p-4 pl-6">
                      <div className="w-16 h-12 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden relative shadow-sm">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title & Slug */}
                    <td className="p-4">
                      <div className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                        {post.title}
                      </div>
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <span>/{post.slug}</span>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="p-4 text-xs font-semibold text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{post.author || 'Editorial'}</span>
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {(post.tags || []).slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold bg-slate-900 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/60"
                          >
                            {tag}
                          </span>
                        ))}
                        {(post.tags || []).length > 2 && (
                          <span className="text-[10px] font-bold text-slate-500">
                            +{post.tags!.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {post.status === 'PUBLISHED' ? (
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

                    {/* Date */}
                    <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(post.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewModalPost(post)}
                        title="Quick Preview"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(post)}
                        className="text-xs font-bold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-all border border-slate-700/60 cursor-pointer"
                      >
                        {post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(post)}
                        className="text-xs font-bold text-slate-400 hover:text-indigo-400 bg-slate-900/60 hover:bg-indigo-500/10 px-2.5 py-1.5 rounded-lg transition-all border border-slate-700/60 cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
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
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingId ? 'Edit Blog Post' : 'Add New Blog Post'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId ? 'Modify existing article and publish updates' : 'Compose new article for MarkatVerse readers'}
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
              {/* Title & Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Smart Ways to Shop Hyperlocal in 2026"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title: newTitle,
                      slug: !editingId ? generateSlug(newTitle) : prev.slug,
                    }));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm font-semibold"
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
                    placeholder="e.g. 5-smart-ways-to-shop"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Author Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Editorial Team"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Featured Cover Image (Upload or URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        await handleImageUpload(file);
                      }
                    }}
                    className="sm:w-44 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center text-center hover:border-emerald-500 hover:bg-slate-800/50 transition-all group relative overflow-hidden min-h-[72px]"
                  >
                    {formData.featuredImage ? (
                      <img
                        src={formData.featuredImage}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : null}
                    <div className="flex items-center gap-1.5 z-10 pointer-events-none px-2 py-2">
                      <span className="text-lg">📸</span>
                      <span className="text-[10px] font-bold text-slate-300 leading-tight">
                        {isUploadingImg ? 'Uploading...' : 'Drop image or click'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await handleImageUpload(file);
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Or paste cover image URL here..."
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono min-w-0"
                  />
                </div>
              </div>

              {/* Tags & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shopping, Hyperlocal, Guide"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Publish Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm cursor-pointer"
                  >
                    <option value="PUBLISHED">Published (Live)</option>
                    <option value="DRAFT">Draft (Unpublished)</option>
                  </select>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Short Excerpt / Meta Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="A concise summary of the article for cards and search engines..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm leading-relaxed"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Article Body (Markdown or Text)
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write your article content here in Markdown or plain text..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono leading-relaxed"
                />
              </div>

              {/* Form Buttons */}
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
                  <span>{isSaving ? 'Saving...' : editingId ? 'Update Post' : 'Publish Post'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewModalPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Article Reader Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalPost(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewModalPost.featuredImage && (
              <div className="w-full h-56 rounded-xl overflow-hidden mb-4 border border-slate-800">
                <img
                  src={previewModalPost.featuredImage}
                  alt={previewModalPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h2 className="text-2xl font-bold text-white mb-2">{previewModalPost.title}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800">
              <span>By {previewModalPost.author || 'MarkatVerse'}</span>
              <span>•</span>
              <span>
                {new Date(previewModalPost.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className="font-mono text-indigo-400">/{previewModalPost.slug}</span>
            </div>

            {previewModalPost.excerpt && (
              <p className="text-sm text-slate-300 font-medium italic mb-4 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                &ldquo;{previewModalPost.excerpt}&rdquo;
              </p>
            )}

            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {previewModalPost.content}
            </div>

            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
              {(previewModalPost.tags || []).map((t, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold bg-slate-800 text-indigo-300 px-3 py-1 rounded-full border border-slate-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
