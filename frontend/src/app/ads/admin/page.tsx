"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Check, X, AlertTriangle, Eye, 
  ExternalLink, FileText, DollarSign, Filter, Search,
  Lock, ShieldAlert, ArrowLeft, RefreshCw, Layers
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/api';

interface ModerationItem {
  id: string;
  advertiserName: string;
  campaignTitle: string;
  creativeUrl: string;
  placement: string;
  positionCode?: string;
  targetCategory: string;
  dailyBudget: number;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const DEFAULT_MODERATION_ITEMS: ModerationItem[] = [
  {
    id: 'CMP-805',
    advertiserName: 'Manish Kumar',
    campaignTitle: 'Diwali Festive Apparel Megasale 🪔',
    creativeUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
    placement: 'Category Header Banner',
    positionCode: 'CATEGORY_HEADER',
    targetCategory: 'Fashion & Apparel',
    dailyBudget: 1500,
    submittedAt: 'Just now',
    status: 'PENDING'
  },
  {
    id: 'CMP-801',
    advertiserName: 'Shree Balaji Electronics',
    campaignTitle: 'Super Smart TV Mega Cashback 📺',
    creativeUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
    placement: 'Homepage Top Hero Carousel',
    positionCode: 'HOMEPAGE',
    targetCategory: 'Electronics & Appliances',
    dailyBudget: 2500,
    submittedAt: '10 mins ago',
    status: 'PENDING'
  },
  {
    id: 'CMP-802',
    advertiserName: 'Gourmet Curry Express',
    campaignTitle: 'Flat 50% Off Lunch Combos 🍛',
    creativeUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    placement: 'Homepage Middle Featured Banner',
    positionCode: 'HOMEPAGE_MIDDLE',
    targetCategory: 'Dining & Restaurants',
    dailyBudget: 1200,
    submittedAt: '25 mins ago',
    status: 'PENDING'
  },
  {
    id: 'CMP-803',
    advertiserName: 'FastFix Mobile Repairs',
    campaignTitle: '1-Hour Screen Replacement at Home 📱',
    creativeUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    placement: 'Search Sponsored Top Product',
    positionCode: 'SEARCH_PAGE',
    targetCategory: 'Home Services & Repairs',
    dailyBudget: 1800,
    submittedAt: '1 hour ago',
    status: 'APPROVED'
  },
  {
    id: 'CMP-804',
    advertiserName: 'Vedic Ayurveda Herbs',
    campaignTitle: 'Pure Organic Immunity Kadha 🌿',
    creativeUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop&q=80',
    placement: 'Product Page Related Rail',
    positionCode: 'PRODUCT_PAGE',
    targetCategory: 'Health & Wellness',
    dailyBudget: 800,
    submittedAt: '3 hours ago',
    status: 'APPROVED'
  }
];

function getMergedModerationItems(backendItems?: ModerationItem[]): ModerationItem[] {
  let base = (backendItems && backendItems.length > 0) ? backendItems : DEFAULT_MODERATION_ITEMS;
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('mv_advertiser_campaigns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, ModerationItem>();
          base.forEach(item => map.set(item.id, { ...item }));
          parsed.forEach((c: any) => {
            const existing = map.get(c.id);
            const mapped: ModerationItem = {
              id: c.id,
              advertiserName: existing?.advertiserName || 'Manish Kumar',
              campaignTitle: c.name || existing?.campaignTitle || c.title || 'Campaign',
              creativeUrl: c.mediaUrl || existing?.creativeUrl,
              placement: c.placement || existing?.placement,
              positionCode: c.positionCode || existing?.positionCode,
              targetCategory: c.targetCategory || existing?.targetCategory,
              dailyBudget: c.dailyBudget || existing?.dailyBudget,
              submittedAt: c.startDate || existing?.submittedAt || 'Just now',
              status: c.status === 'ACTIVE' ? 'APPROVED' : c.status === 'PAUSED' ? 'APPROVED' : c.status,
            };
            map.set(c.id, mapped);
          });
          return Array.from(map.values());
        }
      }
    } catch {}
  }
  return base;
}

export default function AdsAdminPage() {
  const { user, login, isLoading: authLoading } = useAuth();
  const API_URL = getApiUrl();
  const [demoBypass, setDemoBypass] = useState(false);

  const [items, setItems] = useState<ModerationItem[]>(() => getMergedModerationItems());
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch live moderation items from backend and merge
  useEffect(() => {
    fetch(`${API_URL}/commercial/ads/admin-overview`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data.campaigns)) {
          const mapped: ModerationItem[] = data.campaigns.map((c: any) => ({
            id: c.id,
            advertiserName: c.advertiserName,
            campaignTitle: c.campaignTitle,
            creativeUrl: c.creativeUrl,
            placement: c.placement,
            positionCode: c.positionCode,
            targetCategory: c.targetCategory,
            dailyBudget: c.dailyBudget,
            submittedAt: c.submittedAt,
            status: c.status === 'ACTIVE' ? 'APPROVED' : c.status
          }));
          setItems(getMergedModerationItems(mapped));
        } else {
          setItems(getMergedModerationItems());
        }
      })
      .catch(() => {
        setItems(getMergedModerationItems());
      });

    const handleExternalUpdate = () => {
      setItems(getMergedModerationItems());
    };
    window.addEventListener('mv_advertiser_campaigns_updated', handleExternalUpdate);
    window.addEventListener('storage', handleExternalUpdate);
    return () => {
      window.removeEventListener('mv_advertiser_campaigns_updated', handleExternalUpdate);
      window.removeEventListener('storage', handleExternalUpdate);
    };
  }, [API_URL]);

  // Handle Approve / Reject action with 2-way sync across both Admin & Advertiser views
  const handleAction = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setActionLoading(id);

    // 1. Update local state
    const updated = items.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setItems(updated);

    // 2. Sync to localStorage mv_advertiser_campaigns
    try {
      const savedAdv = localStorage.getItem('mv_advertiser_campaigns');
      let advList: any[] = [];
      if (savedAdv) {
        try { advList = JSON.parse(savedAdv); } catch {}
      }
      if (Array.isArray(advList) && advList.length > 0) {
        const updatedAdv = advList.map((c: any) => {
          if (c.id === id) {
            return {
              ...c,
              status: newStatus === 'APPROVED' ? 'ACTIVE' : 'REJECTED',
              rejectionReason: newStatus === 'REJECTED' ? 'Violates creative guidelines' : null
            };
          }
          return c;
        });
        localStorage.setItem('mv_advertiser_campaigns', JSON.stringify(updatedAdv));
        window.dispatchEvent(new CustomEvent('mv_advertiser_campaigns_updated', {
          detail: { campaigns: updatedAdv }
        }));
      }

      // If approved, update storefront carousel
      if (newStatus === 'APPROVED') {
        const approvedItem = items.find(i => i.id === id);
        if (approvedItem) {
          const cachedAdsStr = localStorage.getItem('mv_cache_advertisements');
          let cachedAds: any[] = [];
          if (cachedAdsStr) {
            try { cachedAds = JSON.parse(cachedAdsStr); } catch {}
          }
          const newAd = {
            id: approvedItem.id,
            title: approvedItem.campaignTitle,
            mediaUrl: approvedItem.creativeUrl,
            linkUrl: '/search',
            position: approvedItem.positionCode || 'HOMEPAGE',
            status: 'ACTIVE'
          };
          const filtered = cachedAds.filter((a: any) => a.id !== approvedItem.id);
          const newCached = [newAd, ...filtered];
          localStorage.setItem('mv_cache_advertisements', JSON.stringify(newCached));
          localStorage.setItem('mv_cache_ads', JSON.stringify(newCached));
          window.dispatchEvent(new CustomEvent('mv_advertisements_updated'));
        }
      }
    } catch {}

    // 3. Sync to Backend API
    try {
      await fetch(`${API_URL}/commercial/ads/campaigns/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: id,
          status: newStatus,
          reason: newStatus === 'APPROVED' ? 'Compliant with advertising standards' : 'Creative policy violation'
        })
      });
    } catch {}

    setActionLoading(null);
  };

  const handleDemoAdminLogin = () => {
    login({
      id: 'USR-ADMIN-01',
      markatId: 'MK-ADM-0001',
      name: 'Platform Administrator',
      phone: '+91 99999 88888',
      role: 'ADMIN',
      status: 'active'
    });
    setDemoBypass(true);
  };

  const isAdmin = demoBypass || (user && (
    user.role === 'ADMIN' || 
    user.role === 'super_admin' || 
    user.role === 'catalog_admin' || 
    user.role === 'onboarding_admin' ||
    user.role === 'business'
  ));

  // If user is not logged in or is not an ADMIN, provide quick demo switch or redirect
  if (!authLoading && !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-rose-500/30 rounded-3xl text-center space-y-5 shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Access Restricted
          </span>
          <h2 className="text-xl font-black text-white">Administrator Access Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Ads Moderation &amp; Governance Center is restricted to platform administrators. Unlock demo admin access or sign in to moderate campaigns.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleDemoAdminLogin}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Unlock Admin Review Mode</span>
          </button>
          <Link
            href="/admin/ads"
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md text-center"
          >
            Open Full Ads Command Center →
          </Link>
          <Link
            href="/ads/advertiser"
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700 text-center"
          >
            Back to Advertiser Portal
          </Link>
        </div>
      </div>
    );
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.advertiserName.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'ALL') return matchesSearch;
    return matchesSearch && item.status === filter;
  });

  const pendingCount = items.filter(i => i.status === 'PENDING').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Ads Administration &amp; Moderation</h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Admin Role Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review creative submissions, brand safety, budget adherence, and approve campaigns before they run live.
          </p>
        </div>

        {/* Public Policy Badge */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs flex items-center gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Public Display Policy:</span>
            <span className="text-amber-400 font-bold">Admin Ads Only (Public Ads Hidden)</span>
          </div>
          <Link
            href="/admin/ads"
            className="text-[11px] text-purple-400 hover:text-purple-300 underline font-semibold"
          >
            Configure →
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab}</span>
              {tab === 'PENDING' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search advertiser or title..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Moderation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div 
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl relative group hover:border-purple-500/40 transition-all"
          >
            <div>
              {/* Creative Image Preview */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                <img 
                  src={item.creativeUrl} 
                  alt={item.campaignTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                    item.status === 'APPROVED' ? 'bg-emerald-500/80 text-white' :
                    item.status === 'REJECTED' ? 'bg-rose-500/80 text-white' :
                    'bg-amber-500/80 text-white'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-black/60 text-slate-300 backdrop-blur-md">
                    {item.id}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div>
                  <span className="text-[11px] text-purple-400 font-bold block">{item.advertiserName}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-2">{item.campaignTitle}</h3>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Placement:</span>
                    <span className="font-semibold text-white">{item.placement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Category:</span>
                    <span className="font-semibold text-slate-200">{item.targetCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Daily Budget:</span>
                    <span className="font-mono font-bold text-emerald-400">₹{item.dailyBudget.toLocaleString('en-IN')}/day</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-white/5">
                    <span>Submitted:</span>
                    <span>{item.submittedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Moderation Actions */}
            <div className="p-5 pt-0 border-t border-white/5 mt-2">
              {item.status === 'PENDING' ? (
                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => handleAction(item.id, 'APPROVED')}
                    disabled={actionLoading === item.id}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'REJECTED')}
                    disabled={actionLoading === item.id}
                    className="flex-1 py-2 px-3 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Status updated:</span>
                  <button
                    onClick={() => handleAction(item.id, item.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-bold underline"
                  >
                    Change to {item.status === 'APPROVED' ? 'Rejected' : 'Approved'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
