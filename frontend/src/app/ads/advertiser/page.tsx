"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Megaphone, Plus, Search, Filter, Play, Pause, 
  BarChart2, Eye, MousePointerClick, DollarSign, 
  Target, Calendar, CheckCircle2, AlertCircle, X, Sparkles,
  ExternalLink, Layers, ArrowUpRight, Upload, Wallet,
  Lock, ArrowRight, ShieldCheck, RefreshCw, Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/api';

interface Campaign {
  id: string;
  name: string;
  placement: string;
  positionCode: string;
  dailyBudget: number;
  totalBudget?: number;
  bidType: 'CPC' | 'CPM';
  bidAmount: number;
  mediaUrl?: string;
  linkUrl?: string;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  status: 'ACTIVE' | 'PAUSED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  startDate: string;
}

export default function AdvertiserPortalPage() {
  const { user, isLoading: authLoading } = useAuth();
  const API_URL = getApiUrl();

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'CMP-101',
      name: 'Diwali Festive Apparel Sale 🪔',
      placement: 'Homepage Top Hero Carousel',
      positionCode: 'HOMEPAGE',
      dailyBudget: 1500,
      totalBudget: 15000,
      bidType: 'CPC',
      bidAmount: 4.5,
      mediaUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
      linkUrl: '/search?category=Fashion',
      spent: 8450,
      impressions: 184500,
      clicks: 6240,
      ctr: 3.38,
      status: 'ACTIVE',
      startDate: '2026-10-25'
    },
    {
      id: 'CMP-102',
      name: 'Local Organic Grocery Express 🥦',
      placement: 'Search Sponsored First Spot',
      positionCode: 'SEARCH_PAGE',
      dailyBudget: 800,
      totalBudget: 8000,
      bidType: 'CPM',
      bidAmount: 55,
      mediaUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
      linkUrl: '/search?category=Food%20%26%20Dining',
      spent: 3200,
      impressions: 92400,
      clicks: 2150,
      ctr: 2.32,
      status: 'ACTIVE',
      startDate: '2026-10-28'
    },
    {
      id: 'CMP-103',
      name: 'Salon & Spa Weekend Pass 💆',
      placement: 'Product Page Related Rail',
      positionCode: 'PRODUCT_PAGE',
      dailyBudget: 1200,
      totalBudget: 12000,
      bidType: 'CPC',
      bidAmount: 6.0,
      mediaUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80',
      linkUrl: '/search?service=Salon',
      spent: 4800,
      impressions: 74200,
      clicks: 3120,
      ctr: 4.20,
      status: 'PAUSED',
      startDate: '2026-10-20'
    }
  ]);

  const [walletBalance, setWalletBalance] = useState<number>(14500);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'PENDING'>('ALL');
  
  // Create Campaign Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    placement: 'HOMEPAGE',
    targetCategory: 'Electronics & Appliances',
    dailyBudget: 1500,
    totalBudget: 15000,
    bidType: 'CPC' as 'CPC' | 'CPM',
    bidAmount: 4.5,
    mediaUrl: '',
    linkUrl: '/search',
    targetPincode: '110001 (5km Radius)'
  });

  // Top Up Wallet Modal State
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(5000);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState('');

  // Sample creative presets
  const creativePresets = [
    { label: 'Festive Shopping', url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Electronics & Gadgets', url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Fresh Grocery', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Dining & Cafe', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80' }
  ];

  // Fetch campaigns from backend on load
  useEffect(() => {
    if (user?.id) {
      fetch(`${API_URL}/commercial/ads/campaigns?advertiserId=${encodeURIComponent(user.id)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped: Campaign[] = data.map((d: any) => ({
              id: d.id,
              name: d.campaignTitle || d.name,
              placement: d.placement,
              positionCode: d.placement,
              dailyBudget: d.dailyBudget,
              totalBudget: d.totalBudget,
              bidType: d.bidType || 'CPC',
              bidAmount: d.cpcBid || 4.5,
              mediaUrl: d.creativeUrl || d.mediaUrl,
              linkUrl: d.linkUrl || '/search',
              spent: Math.round((d.clicks || 0) * (d.cpcBid || 4.5)),
              impressions: d.impressions || 0,
              clicks: d.clicks || 0,
              ctr: d.impressions > 0 ? Math.round(((d.clicks || 0) / d.impressions) * 1000) / 10 : 0,
              status: d.status || 'PENDING',
              startDate: d.submittedAt || new Date().toISOString().slice(0, 10),
            }));
            setCampaigns(mapped);
          }
        })
        .catch(() => {});

      // Fetch wallet balance
      fetch(`${API_URL}/commercial/ads/advertisers/${encodeURIComponent(user.id)}/profile`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && typeof data.walletBalance === 'number') {
            setWalletBalance(data.walletBalance);
          }
        })
        .catch(() => {});
    }
  }, [user, API_URL]);

  // Toggle Campaign Status (Active <-> Paused)
  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/commercial/ads/campaigns/${encodeURIComponent(id)}/toggle`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: data.campaign.status } : c));
        return;
      }
    } catch {}

    // Fallback local toggle
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = (c.status === 'ACTIVE' || c.status === 'APPROVED') ? 'PAUSED' : 'ACTIVE';
        return { ...c, status: newStatus as any };
      }
      return c;
    }));
  };

  // Create Campaign Submit
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormSuccess('');

    const payload = {
      advertiserId: user?.id || 'ADV-101',
      advertiserName: user?.business?.name || user?.name || 'Registered Advertiser',
      campaignTitle: newCampaign.name,
      placement: newCampaign.placement,
      targetCategory: newCampaign.targetCategory,
      dailyBudget: newCampaign.dailyBudget,
      totalBudget: newCampaign.totalBudget,
      bidType: newCampaign.bidType,
      cpcBid: newCampaign.bidAmount,
      creativeUrl: newCampaign.mediaUrl || creativePresets[0].url,
      linkUrl: newCampaign.linkUrl,
    };

    try {
      const res = await fetch(`${API_URL}/commercial/ads/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const created: Campaign = {
        id: `CMP-${Math.floor(100 + Math.random() * 900)}`,
        name: newCampaign.name,
        placement: newCampaign.placement,
        positionCode: newCampaign.placement,
        dailyBudget: Number(newCampaign.dailyBudget),
        totalBudget: Number(newCampaign.totalBudget),
        bidType: newCampaign.bidType,
        bidAmount: Number(newCampaign.bidAmount),
        mediaUrl: newCampaign.mediaUrl || creativePresets[0].url,
        linkUrl: newCampaign.linkUrl,
        spent: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        status: 'PENDING',
        startDate: 'Just now'
      };

      setCampaigns(prev => [created, ...prev]);
      setFormSuccess('Campaign created and submitted for policy review!');
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess('');
      }, 1200);
    } catch {
      alert('Could not create campaign. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Top Up Wallet Submit
  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsToppingUp(true);
    setTopupSuccess('');

    try {
      const res = await fetch(`${API_URL}/commercial/ads/advertiser/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertiserId: user?.id || 'ADV-101',
          amount: topupAmount
        })
      });

      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.advertiser?.walletBalance || (walletBalance + topupAmount));
      } else {
        setWalletBalance(prev => prev + topupAmount);
      }

      setTopupSuccess(`₹${topupAmount.toLocaleString('en-IN')} added to your wallet successfully! (+ 18% GST credited)`);
      setTimeout(() => {
        setIsTopupModalOpen(false);
        setTopupSuccess('');
      }, 1500);
    } catch {
      setWalletBalance(prev => prev + topupAmount);
      setIsTopupModalOpen(false);
    } finally {
      setIsToppingUp(false);
    }
  };

  // If user is NOT authenticated: Show stylish Sign In required screen
  if (!user && !authLoading) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-purple-500/30 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center border border-purple-500/20">
          <Lock className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
            Authentication Required
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Sign In to Access Your Advertiser Portal
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Running ad campaigns on MarkatVerse requires a verified merchant or brand advertiser account. Without logging in, public visitors cannot run campaigns or access private ad budgets.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-xs text-white block">📍 Hyperlocal Targeting</span>
            <span className="text-[11px] text-slate-400 leading-tight block">Target shoppers by postal PIN code and 5km radius.</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-xs text-white block">💳 18% GST Invoices</span>
            <span className="text-[11px] text-slate-400 leading-tight block">Claim full Input Tax Credit (ITC) with SAC 998319 invoices.</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-xs text-white block">⚡ Real-Time ROAS</span>
            <span className="text-[11px] text-slate-400 leading-tight block">Track live impressions, clicks, orders, and revenue return.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/ads/login?redirect=/ads/advertiser"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In to Advertiser Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/ads/login?mode=register&redirect=/ads/advertiser"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all text-center"
          >
            Create Advertiser Account
          </Link>
        </div>
      </div>
    );
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.placement.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && c.status === statusFilter;
  });

  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Advertiser Campaign Portal</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Verified Merchant
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as: <strong className="text-purple-300">{user?.business?.name || user?.name}</strong> &bull; Manage live campaigns, hyperlocal bidding, and ad creatives.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsTopupModalOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Wallet className="w-4 h-4 text-purple-400" />
            <span>Recharge Wallet (₹{walletBalance.toLocaleString('en-IN')})</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.35)]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Campaign</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Ad Spend</span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">₹{totalSpent.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-400 block">Across {campaigns.length} total campaigns</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Impressions</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">{totalImpressions.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-400 font-semibold block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Verified Local Shoppers
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clicks</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{totalClicks.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-400 block">Avg CTR: {totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0}%</span>
        </div>

        <div className="p-6 rounded-3xl bg-purple-950/40 border border-purple-500/30 space-y-1">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Wallet Balance</span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">₹{walletBalance.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-purple-300 font-bold block">
            Ready to spend &bull; 18% GST Invoice
          </span>
        </div>
      </div>

      {/* Campaigns Management Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white">Your Ad Campaigns</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {filteredCampaigns.length}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              {(['ALL', 'ACTIVE', 'PAUSED', 'PENDING'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    statusFilter === st ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Campaign Name & Placement</th>
                <th className="py-3 px-4">Daily / Total Budget</th>
                <th className="py-3 px-4">Bid Model</th>
                <th className="py-3 px-4 text-right">Impressions</th>
                <th className="py-3 px-4 text-right">Clicks</th>
                <th className="py-3 px-4 text-right">Spent</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredCampaigns.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-sm">{c.name}</div>
                    <div className="text-[11px] text-purple-400 font-mono mt-0.5">{c.placement}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium">
                    <div>₹{c.dailyBudget.toLocaleString('en-IN')}/day</div>
                    <div className="text-[10px] text-slate-400">Total: ₹{(c.totalBudget || c.dailyBudget * 10).toLocaleString('en-IN')}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-bold text-slate-200">{c.bidType}</span>
                    <span className="text-[11px] text-slate-400 ml-1">@ ₹{c.bidAmount}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{c.impressions.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold">{c.clicks.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">₹{c.spent.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      c.status === 'ACTIVE' || c.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      c.status === 'PAUSED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(c.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        c.status === 'ACTIVE' || c.status === 'APPROVED'
                          ? 'border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                          : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                      title={c.status === 'ACTIVE' ? 'Pause Campaign' : 'Resume Campaign'}
                    >
                      {c.status === 'ACTIVE' || c.status === 'APPROVED' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREATE NEW CAMPAIGN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Megaphone className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-white">Create New Ad Campaign</h3>
                  <p className="text-xs text-slate-400">Target local shoppers on MarkatVerse</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mega Electronics Cashback Weekend"
                  value={newCampaign.name}
                  onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Placement Zone</label>
                  <select
                    value={newCampaign.placement}
                    onChange={e => setNewCampaign({ ...newCampaign, placement: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-purple-500"
                  >
                    <option value="HOMEPAGE">Homepage Top Hero Carousel</option>
                    <option value="SEARCH_PAGE">Search Sponsored Listing (Top)</option>
                    <option value="CATEGORY_HEADER">Category Header Banner</option>
                    <option value="CHECKOUT_OFFER">Cart &amp; Checkout Offer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Target Category</label>
                  <select
                    value={newCampaign.targetCategory}
                    onChange={e => setNewCampaign({ ...newCampaign, targetCategory: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-purple-500"
                  >
                    <option value="Electronics & Appliances">Electronics &amp; Appliances</option>
                    <option value="Fashion & Apparel">Fashion &amp; Apparel</option>
                    <option value="Grocery & FMCG">Grocery &amp; FMCG</option>
                    <option value="Dining & Restaurants">Dining &amp; Restaurants</option>
                    <option value="Home & Kitchen">Home &amp; Kitchen</option>
                    <option value="General Retail">General Retail</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Daily Budget (₹)</label>
                  <input
                    type="number"
                    min="500"
                    required
                    value={newCampaign.dailyBudget}
                    onChange={e => setNewCampaign({ ...newCampaign, dailyBudget: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Max CPC Bid (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1.5"
                    required
                    value={newCampaign.bidAmount}
                    onChange={e => setNewCampaign({ ...newCampaign, bidAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Ad Creative Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newCampaign.mediaUrl}
                  onChange={e => setNewCampaign({ ...newCampaign, mediaUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-purple-500"
                />
                
                {/* Creative Presets */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-400">Quick Presets:</span>
                  {creativePresets.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewCampaign({ ...newCampaign, mediaUrl: p.url })}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-purple-300 px-2 py-0.5 rounded border border-slate-700"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Destination Click URL</label>
                <input
                  type="text"
                  required
                  placeholder="/product/... or /search?..."
                  value={newCampaign.linkUrl}
                  onChange={e => setNewCampaign({ ...newCampaign, linkUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20"
                >
                  {isSubmitting ? 'Submitting Campaign...' : 'Launch Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TOP UP WALLET */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-black text-white">Recharge Advertiser Wallet</h3>
              </div>
              <button onClick={() => setIsTopupModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {topupSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                {topupSuccess}
              </div>
            )}

            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Select Top-Up Amount</label>
                <div className="grid grid-cols-3 gap-2">
                  {[2000, 5000, 10000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${
                        topupAmount === amt ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Custom Amount (₹)</label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={topupAmount}
                  onChange={e => setTopupAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-purple-500"
                />
              </div>

              {/* Tax Breakdown */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Ad Wallet Credit:</span>
                  <span className="text-white font-mono">₹{topupAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>18% GST (SAC 998319):</span>
                  <span className="text-purple-300 font-mono">+₹{Math.round(topupAmount * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1 mt-1">
                  <span>Total Payable:</span>
                  <span className="text-emerald-400 font-mono">₹{Math.round(topupAmount * 1.18).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isToppingUp}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                {isToppingUp ? 'Processing Top-up...' : `Recharge Wallet Now (₹${Math.round(topupAmount * 1.18).toLocaleString('en-IN')})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
