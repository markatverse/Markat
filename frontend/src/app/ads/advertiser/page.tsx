"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Megaphone, Plus, Search, Play, Pause, 
  BarChart2, Eye, DollarSign, 
  Target, Calendar, CheckCircle2, AlertCircle, X, Sparkles,
  ExternalLink, Layers, ArrowUpRight, Upload, Wallet,
  Lock, ArrowRight, ShieldCheck, RefreshCw, Check, Trash2,
  TrendingUp, CreditCard, ShoppingBag, MapPin, SlidersHorizontal, Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/api';
import toast from 'react-hot-toast';

interface Campaign {
  id: string;
  name: string;
  placement: string;
  positionCode: string;
  targetCategory: string;
  dailyBudget: number;
  totalBudget: number;
  bidType: 'CPC' | 'CPM';
  bidAmount: number;
  mediaUrl: string;
  linkUrl: string;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  status: 'ACTIVE' | 'PAUSED' | 'PENDING' | 'APPROVED';
  startDate: string;
  targetLocation?: string;
}

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'CMP-801',
    name: 'Super Smart TV Mega Cashback 📺',
    placement: 'Homepage Top Hero Carousel',
    positionCode: 'HOMEPAGE',
    targetCategory: 'Electronics & Appliances',
    dailyBudget: 2500,
    totalBudget: 25000,
    bidType: 'CPC',
    bidAmount: 16.5,
    mediaUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&auto=format&fit=crop&q=80',
    linkUrl: '/search?category=Electronics',
    spent: 18450,
    impressions: 48200,
    clicks: 1840,
    ctr: 3.82,
    status: 'ACTIVE',
    startDate: '2026-10-24',
    targetLocation: 'Delhi NCR (5km Radius)'
  },
  {
    id: 'CMP-802',
    name: 'Flat 50% Off Lunch Combos 🍛',
    placement: 'Homepage Middle Featured Banner',
    positionCode: 'HOMEPAGE_MIDDLE',
    targetCategory: 'Food & Dining',
    dailyBudget: 1200,
    totalBudget: 15000,
    bidType: 'CPM',
    bidAmount: 85,
    mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80',
    linkUrl: '/search?category=Food%20%26%20Dining',
    spent: 7004,
    impressions: 82400,
    clicks: 2890,
    ctr: 3.51,
    status: 'ACTIVE',
    startDate: '2026-10-26',
    targetLocation: 'Connaught Place & Central (4km Radius)'
  },
  {
    id: 'CMP-803',
    name: '1-Hour Screen Replacement at Home 📱',
    placement: 'Search Sponsored Top Product',
    positionCode: 'SEARCH_PAGE',
    targetCategory: 'Home Services & Repairs',
    dailyBudget: 1800,
    totalBudget: 18000,
    bidType: 'CPC',
    bidAmount: 14.0,
    mediaUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
    linkUrl: '/search?service=Mobile%20Repairs',
    spent: 14200,
    impressions: 62400,
    clicks: 2950,
    ctr: 4.73,
    status: 'ACTIVE',
    startDate: '2026-10-20',
    targetLocation: 'South Delhi & Gurugram (7km Radius)'
  },
  {
    id: 'CMP-804',
    name: 'Pure Organic Immunity Kadha 🌿',
    placement: 'Product Page Related Rail',
    positionCode: 'PRODUCT_PAGE',
    targetCategory: 'Health & Wellness',
    dailyBudget: 800,
    totalBudget: 8000,
    bidType: 'CPC',
    bidAmount: 9.5,
    mediaUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop&q=80',
    linkUrl: '/search?category=Health',
    spent: 6850,
    impressions: 18900,
    clicks: 890,
    ctr: 4.71,
    status: 'PAUSED',
    startDate: '2026-10-15',
    targetLocation: 'Pan-City Express Delivery'
  },
  {
    id: 'CMP-805',
    name: 'Diwali Festive Apparel Megasale 🪔',
    placement: 'Category Header Banner',
    positionCode: 'CATEGORY_HEADER',
    targetCategory: 'Fashion & Apparel',
    dailyBudget: 1500,
    totalBudget: 15000,
    bidType: 'CPC',
    bidAmount: 6.0,
    mediaUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
    linkUrl: '/search?category=Fashion',
    spent: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    status: 'PENDING',
    startDate: 'Just now',
    targetLocation: 'Local PIN codes (110001, 110002)'
  }
];

export default function AdvertiserPortalPage() {
  const { user, login } = useAuth();
  const API_URL = getApiUrl();

  // 1. Initial State from LocalStorage or Defaults
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mv_advertiser_campaigns');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_CAMPAIGNS;
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mv_advertiser_wallet');
        if (saved) return Number(saved) || 12500;
      } catch {}
    }
    return 12500;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'PENDING'>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(5000);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    placement: 'Homepage Top Hero Carousel',
    positionCode: 'HOMEPAGE',
    targetCategory: 'Electronics & Appliances',
    dailyBudget: 1500,
    totalBudget: 15000,
    bidType: 'CPC' as 'CPC' | 'CPM',
    bidAmount: 8.5,
    mediaUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
    linkUrl: '/search?category=Electronics',
    targetLocation: 'Your Local City PIN (5km Radius)'
  });

  // Creative Presets for Quick Setup
  const creativePresets = [
    { label: 'Festive Shopping', url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80', cat: 'Fashion & Apparel' },
    { label: 'Electronics & Tech', url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&auto=format&fit=crop&q=80', cat: 'Electronics & Appliances' },
    { label: 'Fresh Grocery', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80', cat: 'Grocery & Gourmet' },
    { label: 'Food & Dining', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80', cat: 'Food & Dining' }
  ];

  // Sync to localStorage and broadcast whenever campaigns change
  const saveCampaigns = (newItems: Campaign[]) => {
    setCampaigns(newItems);
    try {
      localStorage.setItem('mv_advertiser_campaigns', JSON.stringify(newItems));
      
      // Real Storefront Injection: inject active campaigns to homepage carousel cache!
      const activeAds = newItems
        .filter(c => c.status === 'ACTIVE')
        .map(c => ({
          id: c.id,
          title: c.name,
          mediaUrl: c.mediaUrl,
          linkUrl: c.linkUrl,
          position: c.positionCode,
          status: 'ACTIVE'
        }));
      if (activeAds.length > 0) {
        localStorage.setItem('mv_cache_advertisements', JSON.stringify(activeAds));
        localStorage.setItem('mv_cache_ads', JSON.stringify(activeAds));
      }
    } catch {}
  };

  // Sync wallet balance
  const updateWallet = (newBalance: number) => {
    setWalletBalance(newBalance);
    try {
      localStorage.setItem('mv_advertiser_wallet', String(newBalance));
      window.dispatchEvent(new CustomEvent('mv_advertiser_wallet_updated', { detail: { balance: newBalance } }));
    } catch {}
  };

  // Listen for external wallet changes
  useEffect(() => {
    const handleWalletUpdate = (e: any) => {
      if (e.detail?.balance !== undefined) {
        setWalletBalance(e.detail.balance);
      }
    };
    window.addEventListener('mv_advertiser_wallet_updated', handleWalletUpdate);
    return () => window.removeEventListener('mv_advertiser_wallet_updated', handleWalletUpdate);
  }, []);

  // 1-Click Demo Login if user isn't logged in
  const handleQuickDemoLogin = () => {
    const demoUser = {
      id: 'USR-ADV-01',
      markatId: 'MK-ADV-10001',
      name: 'Apex Mobiles & Electronics',
      email: 'advertiser@markatverse.com',
      phone: '+91 98112 88442',
      role: 'business' as any,
      status: 'active' as const,
      business: {
        id: 'BIZ-ADV-01',
        name: 'Apex Mobiles & Electronics',
        isVerified: true,
      }
    };
    login(demoUser, 'demo_token_' + Date.now());
    toast.success('Signed in as Apex Mobiles (Demo Advertiser)!');
  };

  // Toggle Campaign Status (Active <-> Paused, Pending -> Active)
  const handleToggleStatus = (id: string) => {
    const target = campaigns.find(c => c.id === id);
    if (!target) return;

    let nextStatus: 'ACTIVE' | 'PAUSED';
    if (target.status === 'ACTIVE') {
      nextStatus = 'PAUSED';
      toast.success(`Campaign "${target.name}" paused`);
    } else {
      nextStatus = 'ACTIVE';
      toast.success(`Campaign "${target.name}" is now live and running!`);
    }

    const updated = campaigns.map(c => c.id === id ? { ...c, status: nextStatus } : c);
    saveCampaigns(updated);

    // Background sync to backend API if reachable
    fetch(`${API_URL}/commercial/ads/campaigns/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH'
    }).catch(() => {});
  };

  // Delete Campaign
  const handleDeleteCampaign = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete campaign "${name}"?`)) return;
    const updated = campaigns.filter(c => c.id !== id);
    saveCampaigns(updated);
    toast.success(`Campaign "${name}" removed`);
  };

  // Create Campaign Submit
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }
    if (newCampaign.dailyBudget < 500) {
      toast.error('Minimum daily budget is ₹500');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const created: Campaign = {
        id: `CMP-${Math.floor(805 + Math.random() * 200)}`,
        name: newCampaign.name,
        placement: newCampaign.placement,
        positionCode: newCampaign.positionCode,
        targetCategory: newCampaign.targetCategory,
        dailyBudget: Number(newCampaign.dailyBudget),
        totalBudget: Number(newCampaign.totalBudget) || Number(newCampaign.dailyBudget) * 10,
        bidType: newCampaign.bidType,
        bidAmount: Number(newCampaign.bidAmount),
        mediaUrl: newCampaign.mediaUrl,
        linkUrl: newCampaign.linkUrl,
        spent: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        status: 'ACTIVE',
        startDate: new Date().toISOString().slice(0, 10),
        targetLocation: newCampaign.targetLocation
      };

      const updated = [created, ...campaigns];
      saveCampaigns(updated);
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
      toast.success(`Campaign "${created.name}" launched live!`);

      // Reset form
      setNewCampaign({
        name: '',
        placement: 'Homepage Top Hero Carousel',
        positionCode: 'HOMEPAGE',
        targetCategory: 'Electronics & Appliances',
        dailyBudget: 1500,
        totalBudget: 15000,
        bidType: 'CPC',
        bidAmount: 8.5,
        mediaUrl: creativePresets[0].url,
        linkUrl: '/search?category=Electronics',
        targetLocation: 'Your Local City PIN (5km Radius)'
      });

      // Background push to backend
      fetch(`${API_URL}/commercial/ads/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertiserId: user?.id || 'ADV-101',
          advertiserName: user?.business?.name || user?.name || 'Registered Advertiser',
          campaignTitle: created.name,
          placement: created.positionCode,
          targetCategory: created.targetCategory,
          dailyBudget: created.dailyBudget,
          totalBudget: created.totalBudget,
          bidType: created.bidType,
          cpcBid: created.bidAmount,
          creativeUrl: created.mediaUrl,
          linkUrl: created.linkUrl,
        })
      }).catch(() => {});
    }, 400);
  };

  // Top Up Wallet Submit
  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (topupAmount < 500) {
      toast.error('Minimum recharge amount is ₹500');
      return;
    }

    setIsToppingUp(true);

    setTimeout(() => {
      const nextBal = walletBalance + topupAmount;
      updateWallet(nextBal);
      setIsToppingUp(false);
      setIsTopupModalOpen(false);
      toast.success(`₹${topupAmount.toLocaleString('en-IN')} added to Ad Wallet! (+18% GST tax invoice generated)`);

      // Sync backend
      fetch(`${API_URL}/commercial/ads/advertiser/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertiserId: user?.id || 'ADV-101',
          amount: topupAmount
        })
      }).catch(() => {});
    }, 600);
  };

  // Dynamic KPI Metrics (Calculated accurately from current campaigns)
  const totalSpent = useMemo(() => campaigns.reduce((acc, c) => acc + (c.spent || 0), 0), [campaigns]);
  const totalImpressions = useMemo(() => campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0), [campaigns]);
  const totalClicks = useMemo(() => campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0), [campaigns]);
  const avgCtr = useMemo(() => {
    if (totalImpressions === 0) return 0;
    return Number(((totalClicks / totalImpressions) * 100).toFixed(2));
  }, [totalClicks, totalImpressions]);

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.placement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.targetCategory.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === 'ALL') return matchesSearch;
      if (statusFilter === 'ACTIVE') return matchesSearch && (c.status === 'ACTIVE' || c.status === 'APPROVED');
      return matchesSearch && c.status === statusFilter;
    });
  }, [campaigns, searchTerm, statusFilter]);

  // Counts by status
  const counts = useMemo(() => {
    return {
      all: campaigns.length,
      active: campaigns.filter(c => c.status === 'ACTIVE' || c.status === 'APPROVED').length,
      paused: campaigns.filter(c => c.status === 'PAUSED').length,
      pending: campaigns.filter(c => c.status === 'PENDING').length,
    };
  }, [campaigns]);

  // =========================================================================
  // VIEW: UNLOGGED IN (Clean Welcome + 1-Click Demo Login)
  // =========================================================================
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center border border-purple-200 shadow-2xs">
          <Megaphone className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
            <Lock className="w-3.5 h-3.5" />
            <span>Advertiser Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign In to Manage Your Local Ad Campaigns
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Target high-intent shoppers within your store's 5km radius, run real-time bidding, track conversion ROAS, and manage GST tax credits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left py-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-600" /> 5km Radius
            </span>
            <span className="text-[11px] text-slate-500 leading-tight block">Target neighborhood shoppers by PIN code.</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> 18% GST Credit
            </span>
            <span className="text-[11px] text-slate-500 leading-tight block">SAC 998319 invoices for full Input Tax Credit.</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Real-Time ROAS
            </span>
            <span className="text-[11px] text-slate-500 leading-tight block">Instant impressions, clicks, and order attribution.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/ads/login?redirect=/ads/advertiser"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Advertiser Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-900 border border-amber-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>✨ 1-Click Demo Advertiser</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: AUTHENTICATED ADVERTISER DASHBOARD
  // =========================================================================
  return (
    <div className="space-y-8 animate-in fade-in duration-300 py-2 sm:py-4">
      
      {/* 1. Header Card (Crisp, High-Contrast Light Theme) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified Merchant Account</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {user?.markatId || 'MK-ADV-10001'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Advertiser Campaign Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Store: <strong className="text-slate-800 font-bold">{user?.business?.name || user?.name || 'My Local Business'}</strong> • Hyperlocal ad auction, live clicks, and budget control.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Recharge Wallet Button */}
          <button
            type="button"
            onClick={() => setIsTopupModalOpen(true)}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Recharge your advertising balance"
          >
            <Wallet className="w-4 h-4 text-purple-600" />
            <span>Recharge Wallet (₹{walletBalance.toLocaleString('en-IN')})</span>
          </button>

          {/* Create Campaign Button */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Campaign</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Grid (High-Contrast, Mathematically Consistent) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Ad Spend */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Ad Spend</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Across {campaigns.length} campaigns
          </span>
        </div>

        {/* Total Impressions */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Impressions</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 font-mono">
            {totalImpressions.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verified Local Shoppers
          </span>
        </div>

        {/* Total Clicks */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Clicks</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
            {totalClicks.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Avg CTR: <strong className="text-slate-800 font-bold">{avgCtr}%</strong>
          </span>
        </div>

        {/* Wallet Balance */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-purple-50/50 border border-purple-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Wallet Balance</span>
            <button
              onClick={() => setIsTopupModalOpen(true)}
              className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors cursor-pointer text-[10px] font-bold"
              title="Add money"
            >
              + Add
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900 font-mono">
            ₹{walletBalance.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-purple-700 font-semibold block">
            Ready to spend • 18% GST Invoice
          </span>
        </div>

      </div>

      {/* 3. Section Header, Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* High-Contrast Visible Heading */}
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Your Ad Campaigns
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold font-mono">
              {filteredCampaigns.length}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ALL ({counts.all})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ACTIVE ({counts.active})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PAUSED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'PAUSED'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PAUSED ({counts.paused})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'PENDING'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PENDING ({counts.pending})
              </button>
            </div>

            {/* Live Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. Campaigns Management Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Campaign Name & Placement</th>
                <th className="py-3.5 px-4">Daily / Total Budget</th>
                <th className="py-3.5 px-4">Bid Model</th>
                <th className="py-3.5 px-4 text-right">Impressions</th>
                <th className="py-3.5 px-4 text-right">Clicks</th>
                <th className="py-3.5 px-4 text-right">Spent</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-slate-700">No campaigns found</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your filters or create a new campaign.</p>
                    <button
                      type="button"
                      onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => {
                  const isRunning = c.status === 'ACTIVE' || c.status === 'APPROVED';
                  const isPaused = c.status === 'PAUSED';
                  const isPending = c.status === 'PENDING';

                  return (
                    <tr key={c.id} className="hover:bg-purple-50/30 transition-colors">
                      {/* Name & Placement */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/80 font-mono">
                            {c.placement}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {c.targetCategory}
                          </span>
                        </div>
                      </td>

                      {/* Daily / Total Budget */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900">₹{c.dailyBudget.toLocaleString('en-IN')}/day</div>
                        <div className="text-[10px] text-slate-500">Total: ₹{c.totalBudget.toLocaleString('en-IN')}</div>
                      </td>

                      {/* Bid Model */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1">
                          <span className="font-mono text-xs font-bold text-slate-800">{c.bidType}</span>
                          <span className="text-[11px] text-slate-500">@ ₹{c.bidAmount.toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Impressions */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                        {c.impressions.toLocaleString('en-IN')}
                      </td>

                      {/* Clicks */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="font-bold text-emerald-600">{c.clicks.toLocaleString('en-IN')}</div>
                        {c.impressions > 0 && (
                          <div className="text-[10px] text-slate-400">CTR {c.ctr}%</div>
                        )}
                      </td>

                      {/* Spent */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{c.spent.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                          isRunning
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isPaused
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {c.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(c.id)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isRunning
                                ? 'border-amber-300 text-amber-600 hover:bg-amber-50'
                                : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={isRunning ? 'Pause Campaign' : 'Resume Campaign'}
                          >
                            {isRunning ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Preview Ad Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewCampaign(c)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-all cursor-pointer"
                            title="Preview ad creative mockup"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCampaign(c.id, c.name)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Delete campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: CREATE NEW CAMPAIGN (Clean Light Theme)                      */}
      {/* ===================================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Megaphone className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Create New Ad Campaign</h3>
                  <p className="text-xs text-slate-500">Reach high-intent shoppers in your local radius</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsCreateModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title / Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mega Weekend Electronics 20% Cashback"
                  value={newCampaign.name}
                  onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Placement Zone</label>
                  <select
                    value={newCampaign.positionCode}
                    onChange={e => {
                      const pos = e.target.value;
                      let placementName = 'Homepage Top Hero Carousel';
                      if (pos === 'HOMEPAGE_MIDDLE') placementName = 'Homepage Middle Featured Banner';
                      if (pos === 'SEARCH_PAGE') placementName = 'Search Sponsored Top Product';
                      if (pos === 'CATEGORY_HEADER') placementName = 'Category Header Banner';
                      if (pos === 'PRODUCT_PAGE') placementName = 'Product Page Related Rail';
                      setNewCampaign({ ...newCampaign, positionCode: pos, placement: placementName });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 focus:bg-white"
                  >
                    <option value="HOMEPAGE">Homepage Top Hero Carousel</option>
                    <option value="HOMEPAGE_MIDDLE">Homepage Middle Featured Banner</option>
                    <option value="SEARCH_PAGE">Search Sponsored Listing (Top)</option>
                    <option value="CATEGORY_HEADER">Category Header Banner</option>
                    <option value="PRODUCT_PAGE">Product Page Related Rail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Category</label>
                  <select
                    value={newCampaign.targetCategory}
                    onChange={e => setNewCampaign({ ...newCampaign, targetCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 focus:bg-white"
                  >
                    <option value="Electronics & Appliances">Electronics & Appliances</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Grocery & Gourmet">Grocery & Gourmet</option>
                    <option value="Home Services & Repairs">Home Services & Repairs</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="General Retail">General Retail</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Budget (₹)</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    required
                    value={newCampaign.dailyBudget}
                    onChange={e => setNewCampaign({ ...newCampaign, dailyBudget: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Min: ₹500/day</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max CPC Bid (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1.5"
                    required
                    value={newCampaign.bidAmount}
                    onChange={e => setNewCampaign({ ...newCampaign, bidAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Recommended: ₹5 to ₹15</span>
                </div>
              </div>

              {/* Creative Banner URL & Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ad Creative Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  required
                  value={newCampaign.mediaUrl}
                  onChange={e => setNewCampaign({ ...newCampaign, mediaUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 focus:bg-white font-mono"
                />

                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-500">Quick Presets:</span>
                  {creativePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewCampaign({ ...newCampaign, mediaUrl: preset.url, targetCategory: preset.cat })}
                      className="text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-2 py-1 rounded-md border border-purple-200 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Banner Thumbnail Preview */}
                {newCampaign.mediaUrl && (
                  <div className="mt-2.5 p-2 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Creative Preview:</span>
                    <img
                      src={newCampaign.mediaUrl}
                      alt="Creative Preview"
                      className="w-full h-28 object-cover rounded-lg border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination Click URL</label>
                  <input
                    type="text"
                    required
                    placeholder="/search?category=..."
                    value={newCampaign.linkUrl}
                    onChange={e => setNewCampaign({ ...newCampaign, linkUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Geofence / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="PIN Code / 5km radius"
                    value={newCampaign.targetLocation}
                    onChange={e => setNewCampaign({ ...newCampaign, targetLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Launching Campaign...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Launch Campaign Live</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: RECHARGE ADVERTISER WALLET (18% GST SAC 998319)              */}
      {/* ===================================================================== */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Recharge Ad Wallet</h3>
                  <p className="text-xs text-slate-500">Current Balance: ₹{walletBalance.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsTopupModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Choose Amount</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2000, 5000, 10000, 25000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        topupAmount === amt 
                          ? 'bg-purple-600 border-purple-600 text-white shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Custom Amount (₹)</label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={topupAmount}
                  onChange={e => setTopupAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 focus:bg-white font-mono"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('UPI')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      selectedPaymentMethod === 'UPI' 
                        ? 'border-purple-600 bg-purple-50 text-purple-700' 
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    UPI (GPay / PhonePe)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('CARD')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      selectedPaymentMethod === 'CARD' 
                        ? 'border-purple-600 bg-purple-50 text-purple-700' 
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('NETBANKING')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      selectedPaymentMethod === 'NETBANKING' 
                        ? 'border-purple-600 bg-purple-50 text-purple-700' 
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    NetBanking
                  </button>
                </div>
              </div>

              {/* GST Tax Invoice Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Ad Wallet Credit:</span>
                  <span className="text-slate-900 font-bold font-mono">₹{topupAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>18% GST (SAC Code 998319):</span>
                  <span className="text-purple-700 font-bold font-mono">+₹{Math.round(topupAmount * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1.5 mt-1.5">
                  <span>Total Payable:</span>
                  <span className="text-emerald-700 font-black text-sm font-mono">
                    ₹{Math.round(topupAmount * 1.18).toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1">
                  * Full Input Tax Credit (ITC) eligible for GST-registered businesses.
                </span>
              </div>

              <button
                type="submit"
                disabled={isToppingUp}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isToppingUp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{Math.round(topupAmount * 1.18).toLocaleString('en-IN')} &amp; Top Up</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: AD CREATIVE PREVIEW (See Real Site Placement)                */}
      {/* ===================================================================== */}
      {previewCampaign && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Live Placement Preview</span>
                <h3 className="text-base font-black text-slate-900">{previewCampaign.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCampaign(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Placement: <strong className="text-slate-800">{previewCampaign.placement}</strong></span>
                <span>Category: <strong className="text-slate-800">{previewCampaign.targetCategory}</strong></span>
              </div>

              {/* Realistic Ad Card Preview */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-50">
                <div className="relative">
                  <img
                    src={previewCampaign.mediaUrl}
                    alt={previewCampaign.name}
                    className="w-full h-48 sm:h-64 object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Sponsored Ad
                  </span>
                </div>
                <div className="p-4 bg-white flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{previewCampaign.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Delivered to: {previewCampaign.targetLocation || 'Local Shoppers (5km)'}</p>
                  </div>
                  <Link
                    href={previewCampaign.linkUrl}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Visit Offer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewCampaign(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
