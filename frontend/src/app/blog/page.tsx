"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Tag, 
  Share2, 
  Clock,
  ArrowLeft
} from 'lucide-react';
import MascotState from '@/components/MascotState';

interface BlogPost {
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
    content: 'Shopping locally has never been easier or more reliable. Learn how to discover hidden local stores, compare real-time prices within 5km, and skip waiting lines with digital tokens.',
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
    content: 'Traditional salon visits often mean sitting in crowded waiting areas with uncertain turnaround times. MarkatVerse changes the game with digital token management that lets you arrive right on time.',
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
    content: 'Micro, Small and Medium Enterprises (MSMEs) drive India\'s trade economy. Discover how digital RFQ pipelines enable higher margins through tiered bulk pricing and verified wholesale suppliers.',
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
    content: 'Security and speed are the pillars of modern commerce. Read how MarkatVerse integrates seamless UPI payments with milestone-based buyer escrow protection.',
    author: 'Engineering Team',
    featuredImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    tags: ['Fintech', 'UPI', 'Security'],
    status: 'PUBLISHED',
    createdAt: '2026-10-26T12:00:00.000Z',
    updatedAt: '2026-10-27T09:10:00.000Z',
  },
];

export default function PublicBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(DEFAULT_POSTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  useEffect(() => {
    try {
      const cached = localStorage.getItem('mv_cache_blog_posts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const published = parsed.filter((p: any) => p.status === 'PUBLISHED');
          if (published.length > 0) {
            setPosts(published);
            return;
          }
        }
      }
    } catch {}
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.author?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesTag = selectedTag === 'ALL' || p.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [posts, searchTerm, selectedTag]);

  const featured = filteredPosts[0];
  const remaining = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-850 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full text-blue-400 text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MarkatVerse Editorial & Insights</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            Guides, News & Hyperlocal Stories
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Discover neighborhood shopping secrets, service booking innovations, and growth guides for Indian merchants and buyers.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mt-8 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search articles by title, category, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xl text-sm"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setSelectedTag('ALL')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedTag === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              All Topics
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="bg-white rounded-3xl p-8 max-w-md mx-auto shadow-sm border border-slate-200">
              <MascotState
                state="no-search"
                title="No Articles Found"
                description={`We couldn't find any articles matching "${searchTerm}".`}
                actionText="Reset Search"
                onAction={() => {
                  setSearchTerm('');
                  setSelectedTag('ALL');
                }}
                compact={true}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Featured Hero Article */}
            {featured && (
              <div className="mb-12">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all group grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-7 h-64 lg:h-auto min-h-[300px] overflow-hidden relative bg-slate-100">
                    <img
                      src={featured.featuredImage}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        Featured Story
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(featured.tags || []).map((t, i) => (
                          <span
                            key={i}
                            className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-4">
                        <Link href={`/blog/${featured.slug}`}>
                          {featured.title}
                        </Link>
                      </h2>

                      <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                        {featured.excerpt || featured.content}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-500 font-medium">
                        By <span className="font-bold text-slate-700">{featured.author || 'MarkatVerse'}</span>
                        <span className="mx-1.5">•</span>
                        <span>{new Date(featured.createdAt).toLocaleDateString()}</span>
                      </div>

                      <Link
                        href={`/blog/${featured.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 group/link"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Grid */}
            {remaining.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Recent Publications</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {remaining.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between"
                    >
                      <div>
                        {post.featuredImage && (
                          <div className="w-full h-48 overflow-hidden bg-slate-100 relative">
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex flex-wrap gap-1.5 mb-2.5">
                            {(post.tags || []).slice(0, 2).map((t, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>

                          <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                            <Link href={`/blog/${post.slug}`}>
                              {post.title}
                            </Link>
                          </h4>

                          <p className="text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4">
                            {post.excerpt || post.content}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-2">
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                          <span className="text-slate-400 font-medium">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                          >
                            <span>Read</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
