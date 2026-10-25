"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  Info, 
  Check, 
  Compass, 
  ShoppingBag, 
  Wrench, 
  ShieldCheck, 
  Newspaper, 
  Activity, 
  Image as ImageIcon,
  Flame,
  LayoutGrid
} from 'lucide-react';
import { getApiUrl } from '@/utils/api';

export interface HomepageSection {
  id: string;
  label: string;
  description: string;
  badge: string;
  category: 'banner' | 'navigation' | 'products' | 'services' | 'trust' | 'content';
  visible: boolean;
  order: number;
}

export const INITIAL_HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    id: 'banners',
    label: 'Promo & Hero Banners',
    description: 'Top rotating campaign and announcement banners slideshow',
    badge: 'Hero',
    category: 'banner',
    visible: true,
    order: 1,
  },
  {
    id: 'advertisements',
    label: 'Sponsored Advertisements',
    description: 'Targeted ad campaigns and marketplace brand highlights',
    badge: 'Ads',
    category: 'banner',
    visible: true,
    order: 2,
  },
  {
    id: 'live_booking',
    label: 'Live Token & Queue Status',
    description: 'Real-time live queue tracking and quick booking widget',
    badge: 'Interactive',
    category: 'services',
    visible: true,
    order: 3,
  },
  {
    id: 'quick_shortcuts',
    label: 'Quick Category Shortcuts',
    description: 'Circular top category links (Deals, Food, Salon, Services, Mobiles)',
    badge: 'Navigation',
    category: 'navigation',
    visible: true,
    order: 4,
  },
  {
    id: 'dual_hero',
    label: 'Dual Hero Hub (B2B, B2C, Services)',
    description: 'Split hero gateway banners with direct portal shortcuts',
    badge: 'Featured',
    category: 'navigation',
    visible: true,
    order: 5,
  },
  {
    id: 'categories_services',
    label: 'Browse Categories & Services',
    description: 'Everything You Need & Solutions That Drive Your Success panels',
    badge: 'Core Hub',
    category: 'navigation',
    visible: true,
    order: 6,
  },
  {
    id: 'recommendations',
    label: 'AI Recommendations',
    description: 'Personalized product and service recommendations for visitors',
    badge: 'Smart AI',
    category: 'products',
    visible: true,
    order: 7,
  },
  {
    id: 'top_picks',
    label: 'Top Picks For You',
    description: 'Trending and curated product collection grid',
    badge: 'Products',
    category: 'products',
    visible: true,
    order: 8,
  },
  {
    id: 'services_for_you',
    label: 'Services For You',
    description: 'Verified salon, dining, repair, and professional services',
    badge: 'Services',
    category: 'services',
    visible: true,
    order: 9,
  },
  {
    id: 'recently_viewed',
    label: 'Recently Viewed Products',
    description: 'Horizontal scrollable row preserving customer browsing history',
    badge: 'History',
    category: 'products',
    visible: true,
    order: 10,
  },
  {
    id: 'global_hubs',
    label: 'Global Markets & Hubs',
    description: 'Specialized enterprise cards for B2B, Construction, Events & Logistics',
    badge: 'Hubs',
    category: 'navigation',
    visible: true,
    order: 11,
  },
  {
    id: 'trust_badges',
    label: 'Trust & Assurance Badges',
    description: 'Secure payment, quality assured, and 7-day refund policy row',
    badge: 'Assurance',
    category: 'trust',
    visible: true,
    order: 12,
  },
  {
    id: 'blog_posts',
    label: 'Latest News & From Our Blog',
    description: 'Marketplace news, helpful merchant tips, and customer guides',
    badge: 'Editorial',
    category: 'content',
    visible: true,
    order: 13,
  },
];

export default function HomepageLayoutAdmin() {
  const [sections, setSections] = useState<HomepageSection[]>(INITIAL_HOMEPAGE_SECTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const API_URL = getApiUrl();

  // Load layout configuration from API / localStorage
  useEffect(() => {
    async function loadLayout() {
      setIsLoading(true);
      try {
        const local = localStorage.getItem('markat_homepage_layout');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSections(parsed);
              setIsLoading(false);
            }
          } catch { }
        }

        const res = await fetch(`${API_URL}/content/homepage-layout`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSections(data);
            localStorage.setItem('markat_homepage_layout', JSON.stringify(data));
          }
        }
      } catch (err) {
        console.warn('Using local homepage layout settings', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadLayout();
  }, [API_URL]);

  // Sort sections by their active order
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

  const visibleCount = useMemo(() => sections.filter(s => s.visible).length, [sections]);
  const hiddenCount = sections.length - visibleCount;

  // Toggle Section Visibility
  const toggleVisibility = (id: string) => {
    setSections(prev =>
      prev.map(item => item.id === id ? { ...item, visible: !item.visible } : item)
    );
  };

  // Move Section Up
  const moveUp = (index: number) => {
    if (index === 0) return;
    const currentList = [...sortedSections];
    const prevIndex = index - 1;

    // Swap order values
    const tempOrder = currentList[index].order;
    currentList[index].order = currentList[prevIndex].order;
    currentList[prevIndex].order = tempOrder;

    setSections(currentList);
  };

  // Move Section Down
  const moveDown = (index: number) => {
    if (index >= sortedSections.length - 1) return;
    const currentList = [...sortedSections];
    const nextIndex = index + 1;

    // Swap order values
    const tempOrder = currentList[index].order;
    currentList[index].order = currentList[nextIndex].order;
    currentList[nextIndex].order = tempOrder;

    setSections(currentList);
  };

  // Bulk actions
  const showAll = () => {
    setSections(prev => prev.map(s => ({ ...s, visible: true })));
  };

  const hideAll = () => {
    setSections(prev => prev.map(s => ({ ...s, visible: false })));
  };

  const resetDefaults = () => {
    if (confirm('Reset homepage layout back to initial default order and show all sections?')) {
      setSections(INITIAL_HOMEPAGE_SECTIONS);
    }
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // Normalize order index 1..N
    const normalized = sortedSections.map((sec, idx) => ({
      ...sec,
      order: idx + 1,
    }));

    try {
      localStorage.setItem('markat_homepage_layout', JSON.stringify(normalized));
      window.dispatchEvent(new Event('homepage_layout_updated'));

      await fetch(`${API_URL}/content/homepage-layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      }).catch(e => console.warn('Backend sync failed, saved locally', e));

      setSections(normalized);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save layout', err);
      alert('Failed to save layout to server. Local copy saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'banners': return <ImageIcon className="w-4 h-4 text-indigo-400" />;
      case 'advertisements': return <Flame className="w-4 h-4 text-amber-400" />;
      case 'live_booking': return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'quick_shortcuts': return <Compass className="w-4 h-4 text-sky-400" />;
      case 'dual_hero': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'categories_services': return <LayoutGrid className="w-4 h-4 text-teal-400" />;
      case 'recommendations': return <Sparkles className="w-4 h-4 text-rose-400" />;
      case 'top_picks': return <ShoppingBag className="w-4 h-4 text-blue-400" />;
      case 'services_for_you': return <Wrench className="w-4 h-4 text-emerald-400" />;
      case 'recently_viewed': return <Layers className="w-4 h-4 text-cyan-400" />;
      case 'global_hubs': return <Compass className="w-4 h-4 text-orange-400" />;
      case 'trust_badges': return <ShieldCheck className="w-4 h-4 text-green-400" />;
      case 'blog_posts': return <Newspaper className="w-4 h-4 text-fuchsia-400" />;
      default: return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Homepage Layout & Sections</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Control which sections appear on the public homepage, toggle visibility, and rearrange layout order.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={resetDefaults}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset to original order"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-bold border border-slate-700/80 transition-all flex items-center gap-1.5 no-underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Home</span>
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
              saveSuccess 
                ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-indigo-600/30'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : saveSuccess ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Published!
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="w-4 h-4" />
                Save & Publish
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Metrics & Quick Filters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Sections</span>
          <span className="text-xl font-extrabold text-white mt-1 block">{sections.length}</span>
        </div>
        <div className="bg-emerald-950/30 border border-emerald-900/40 p-3.5 rounded-xl">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Active on Home</span>
          <span className="text-xl font-extrabold text-emerald-300 mt-1 block">{visibleCount}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hidden Sections</span>
          <span className="text-xl font-extrabold text-slate-400 mt-1 block">{hiddenCount}</span>
        </div>
        <div className="bg-indigo-950/30 border border-indigo-900/40 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">Quick Toggle</span>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={showAll}
                className="text-xs font-bold text-indigo-300 hover:text-white underline cursor-pointer"
              >
                Show All
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={hideAll}
                className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer"
              >
                Hide All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Work Area: Left = Controls, Right = Live Interactive Device Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT: SECTION CONTROL CARDS (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Drag & Arrange Sections ({sortedSections.length})
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              Use Up/Down arrows to reorder
            </span>
          </div>

          <div className="space-y-2.5">
            {sortedSections.map((sec, index) => {
              const isFirst = index === 0;
              const isLast = index === sortedSections.length - 1;
              const isHighlighted = highlightedId === sec.id;

              return (
                <div
                  key={sec.id}
                  onMouseEnter={() => setHighlightedId(sec.id)}
                  onMouseLeave={() => setHighlightedId(null)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                    isHighlighted
                      ? 'bg-slate-800/90 border-indigo-500/80 shadow-md shadow-indigo-500/10'
                      : sec.visible
                        ? 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                        : 'bg-slate-950/60 border-slate-900/80 opacity-60 hover:opacity-90'
                  }`}
                >
                  {/* Left: Position & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Position Number Pill */}
                    <div className="w-7 h-7 rounded-lg bg-slate-800/90 text-slate-300 font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-700/60">
                      #{index + 1}
                    </div>

                    {/* Icon container */}
                    <div className="w-8 h-8 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-center shrink-0">
                      {getSectionIcon(sec.id)}
                    </div>

                    {/* Labels & Description */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">{sec.label}</span>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/70 tracking-tight">
                          {sec.badge}
                        </span>
                        {sec.id === 'categories_services' && (
                          <span className="text-[10px] font-extrabold bg-teal-950 text-teal-300 border border-teal-800/80 px-1.5 py-0.5 rounded-full">
                            ★ User Highlight
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{sec.description}</p>
                    </div>
                  </div>

                  {/* Right: Controls (Move Up/Down & Visibility Toggle) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Reorder Buttons */}
                    <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700/70 p-0.5">
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        disabled={isFirst}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isFirst ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white hover:bg-slate-700/80 cursor-pointer'
                        }`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(index)}
                        disabled={isLast}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isLast ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white hover:bg-slate-700/80 cursor-pointer'
                        }`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Visibility Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => toggleVisibility(sec.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        sec.visible
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700/70 hover:bg-slate-800'
                      }`}
                    >
                      {sec.visible ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Show</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          <span>Hide</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: LIVE INTERACTIVE HOMEPAGE PREVIEW (5 Cols) ── */}
        <div className="lg:col-span-5 sticky top-4 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden">
            {/* Preview Header & Device Selector */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Live Layout Preview
                </span>
              </div>

              {/* Device Toggle */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    previewDevice === 'desktop'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    previewDevice === 'mobile'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Simulated Frame */}
            <div 
              className={`mx-auto bg-slate-950 rounded-2xl border border-slate-800 p-2.5 transition-all shadow-inner max-h-[640px] overflow-y-auto custom-scrollbar ${
                previewDevice === 'mobile' ? 'max-w-[320px]' : 'w-full'
              }`}
            >
              {/* Simulated Navigation Bar */}
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-blue-500"></div>
                  <span className="text-[10px] font-black text-white">MARKATVERSE</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                </div>
              </div>

              {/* Render Preview Section Blocks in Configured Order */}
              <div className="space-y-2">
                {sortedSections.map((sec, idx) => {
                  if (!sec.visible) return null;

                  const isHighlighted = highlightedId === sec.id;

                  return (
                    <div
                      key={sec.id}
                      onMouseEnter={() => setHighlightedId(sec.id)}
                      onMouseLeave={() => setHighlightedId(null)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isHighlighted
                          ? 'bg-indigo-950/70 border-indigo-400 scale-[1.02] shadow-sm'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-extrabold text-slate-500">#{idx + 1}</span>
                          <span className="text-[11px] font-bold text-white">{sec.label}</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold uppercase">
                          {sec.badge}
                        </span>
                      </div>

                      {/* Mini Visual Simulation */}
                      {sec.id === 'categories_services' && (
                        <div className="grid grid-cols-2 gap-1.5 mt-1.5 pt-1.5 border-t border-slate-800">
                          <div className="p-1.5 bg-white/10 rounded-lg text-left">
                            <span className="text-[9px] font-bold text-white block">Everything You Need</span>
                            <span className="text-[8px] text-slate-400">Explore Markets →</span>
                          </div>
                          <div className="p-1.5 bg-emerald-950/50 border border-emerald-800/40 rounded-lg text-left">
                            <span className="text-[9px] font-bold text-emerald-300 block">Solutions That Drive</span>
                            <span className="text-[8px] text-emerald-400">Explore Services →</span>
                          </div>
                        </div>
                      )}

                      {sec.id === 'banners' && (
                        <div className="w-full h-8 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg flex items-center justify-center text-[9px] text-blue-300 font-medium">
                          Rotating Campaign Slideshow
                        </div>
                      )}

                      {sec.id === 'quick_shortcuts' && (
                        <div className="flex items-center gap-1.5 overflow-hidden py-1">
                          {['Deals', 'Food', 'Salon', 'Services', 'Mobiles'].map((item, i) => (
                            <span key={i} className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-300 whitespace-nowrap">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}

                      {sec.id === 'dual_hero' && (
                        <div className="grid grid-cols-3 gap-1 py-1">
                          <div className="bg-blue-950/40 p-1 rounded text-[8px] text-center text-blue-300 font-bold">B2B</div>
                          <div className="bg-amber-950/40 p-1 rounded text-[8px] text-center text-amber-300 font-bold">B2C</div>
                          <div className="bg-emerald-950/40 p-1 rounded text-[8px] text-center text-emerald-300 font-bold">Services</div>
                        </div>
                      )}

                      {sec.id === 'top_picks' && (
                        <div className="grid grid-cols-4 gap-1 py-1">
                          {[1, 2, 3, 4].map(n => (
                            <div key={n} className="h-6 bg-slate-800/60 rounded flex items-center justify-center text-[8px] text-slate-400">
                              Item {n}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {visibleCount === 0 && (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    All sections are currently hidden. Toggle sections ON to display them here.
                  </div>
                )}
              </div>

              {/* Simulated Footer */}
              <div className="mt-4 pt-2 border-t border-slate-900 text-center text-[9px] text-slate-600">
                MarkatVerse Footer & System Links
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
