"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Share2, 
  Bookmark, 
  Check, 
  Clock, 
  Tag, 
  ArrowRight,
  BookOpen
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
    content: `Shopping locally has never been easier or more reliable. India's retail ecosystem thrives on relationships, freshness, and neighborhood trust. Here are the top ways to find the best local deals and fresh produce right in your neighborhood.\n\n### 1. Leverage Real-Time Neighborhood Discovery\nWith MarkatVerse's geospatial radius search, you can see inventory available within a 5km radius. No more ordering goods that take 3 days to travel across the state when a merchant around the corner has it on the shelf.\n\n### 2. Live Token Tracking for Queue-Free Visits\nSkip waiting lines at local stores and salons by booking a live token. You can track your position in line directly from your phone and arrive exactly when it's your turn.\n\n### 3. Direct Merchant Chat & Verification\nChat directly with the local shopkeeper to verify product dimensions, expiration dates, or ask for custom spice blends before checking out.\n\n### 4. Zero-Friction UPI & Escrow Protection\nEvery transaction is safeguarded by MarkatVerse Escrow Protection. Your payment is released only after you receive and verify your order.`,
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
    content: `Traditional salon visits often mean sitting in crowded waiting areas with uncertain turnaround times. MarkatVerse changes the game with digital token management that lets you arrive right on time.\n\n### The Problem with Walk-ins\nWeekend peak hours frequently cause 45-60 minute delays, leading to frustrated customers and rushed stylists.\n\n### The Digital Token Solution\n1. **Live Queue Board**: View how many chairs are occupied and active queue numbers.\n2. **Virtual Check-In**: Reserve your spot while finishing groceries or commuting.\n3. **Smart ETA Alerts**: Receive a push notification 10 minutes before your chair is ready.`,
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
    content: `Micro, Small and Medium Enterprises (MSMEs) drive India's trade economy. Discover how digital RFQ pipelines enable higher margins through tiered bulk pricing and verified wholesale suppliers.\n\n### Cutting Out Multiple Middlemen\nBy connecting retail stores directly with verified regional manufacturers, businesses reduce procurement costs by 15-28%.\n\n### Transparent RFQs & Escrow\nRequest Custom Quotes (RFQs), set minimum order quantities (MOQ), and pay securely through milestone escrow release.`,
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
    content: `Security and speed are the pillars of modern commerce. Read how MarkatVerse integrates seamless UPI payments with milestone-based buyer escrow protection.\n\n### Instant UPI Intent\nPay directly through Google Pay, PhonePe, Paytm, or BHIM with automatic deep-linking and zero card-entry latency.\n\n### Buyer Protection Guarantee\nFunds remain protected until delivery confirmation or service satisfaction.`,
    author: 'Engineering Team',
    featuredImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    tags: ['Fintech', 'UPI', 'Security'],
    status: 'PUBLISHED',
    createdAt: '2026-10-26T12:00:00.000Z',
    updatedAt: '2026-10-27T09:10:00.000Z',
  },
];

export default function BlogPostReaderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>(DEFAULT_POSTS);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let sourcePosts = DEFAULT_POSTS;
    try {
      const raw = localStorage.getItem('mv_cache_blog_posts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sourcePosts = parsed;
        }
      }
    } catch {}

    setAllPosts(sourcePosts);

    const found = sourcePosts.find((p) => p.slug === slug);
    if (found) {
      setPost(found);
    } else {
      setPost(null);
    }
    setLoading(false);
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If post not found, render 404 MascotState
  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-sm border border-slate-200">
          <MascotState
            state="404"
            title="Article Not Found"
            description="The blog post you are looking for may have been moved or unpublished."
            actionText="Browse All Articles"
            actionHref="/blog"
          />
        </div>
      </div>
    );
  }

  const related = allPosts.filter((p) => p.id !== post.id && p.status === 'PUBLISHED').slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Article Header & Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Category Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(post.tags || []).map((tag, i) => (
            <span
              key={i}
              className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pb-6 mb-8 border-b border-slate-200 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {post.author ? post.author.substring(0, 1).toUpperCase() : 'M'}
            </div>
            <span className="text-slate-800 font-bold">{post.author || 'MarkatVerse Team'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>4 min read</span>
          </div>
        </div>

        {/* Featured Cover Image */}
        {post.featuredImage && (
          <div className="w-full h-64 sm:h-96 rounded-3xl overflow-hidden mb-10 shadow-lg border border-slate-200 bg-slate-100">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Excerpt Callout */}
        {post.excerpt && (
          <div className="bg-blue-50/70 border-l-4 border-blue-600 p-5 rounded-r-2xl mb-8">
            <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed italic">
              &ldquo;{post.excerpt}&rdquo;
            </p>
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-slate max-w-none text-slate-700 text-base sm:text-lg leading-relaxed space-y-6">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl sm:text-2xl font-bold text-slate-900 mt-8 mb-3">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={index} className="text-2xl sm:text-3xl font-black text-slate-900 mt-10 mb-4">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('# ')) {
              return (
                <h2 key={index} className="text-2xl sm:text-3xl font-black text-slate-900 mt-10 mb-4">
                  {paragraph.replace('# ', '')}
                </h2>
              );
            }
            return (
              <p key={index} className="leading-relaxed whitespace-pre-line">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Article Footer & Return */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </Link>

          <button
            onClick={handleShare}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share This Article</span>
          </button>
        </div>

        {/* Related Articles Section */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>More Stories You Might Like</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <article
                  key={rel.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    {rel.featuredImage && (
                      <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 bg-slate-100">
                        <img
                          src={rel.featuredImage}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                    </h4>
                  </div>
                  <Link
                    href={`/blog/${rel.slug}`}
                    className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 mt-3"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
