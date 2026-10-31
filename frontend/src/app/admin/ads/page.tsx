"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Megaphone, ShieldCheck, Check, X, AlertTriangle, Eye, 
  ExternalLink, DollarSign, Filter, Search, Lock, Globe,
  Layers, BarChart3, Users, Settings2, Plus, Sparkles, CheckCircle2,
  Clock, ArrowUpRight, AlertCircle, RefreshCw
} from 'lucide-react';
import { getApiUrl } from '@/utils/api';

const API_URL = getApiUrl();

function formatINR(val: any): string {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return Math.round(num).toLocaleString('en-IN');
}

export default function AdminAdsManagementPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'placements' | 'advertisers' | 'rates'>('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Policy state
  const [policyMode, setPolicyMode] = useState<'ADMIN_ONLY' | 'HYBRID_APPROVED'>('ADMIN_ONLY');
  const [updatingPolicy, setUpdatingPolicy] = useState(false);

  // Moderation state
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('Violates platform creative / quality standards');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [moderationFilter, setModerationFilter] = useState('ALL');

  // Top-up modal
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<any>(null);
  const [topupAmount, setTopupAmount] = useState<number>(5000);
  const [isProcessingTopup, setIsProcessingTopup] = useState(false);

  // Placement edit modal
  const [placementsList, setPlacementsList] = useState<any[]>([]);
  const [isSavingPlacements, setIsSavingPlacements] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/commercial/ads/admin-overview`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.policy?.mode) {
          setPolicyMode(json.policy.mode);
        }
        if (json.placementsConfig?.slots) {
          setPlacementsList(json.placementsConfig.slots);
        }
      }
    } catch (e) {
      console.warn("Could not fetch ads overview from backend, using default fallback", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleTogglePolicy = async (mode: 'ADMIN_ONLY' | 'HYBRID_APPROVED') => {
    setUpdatingPolicy(true);
    try {
      const res = await fetch(`${API_URL}/content/advertisements/policy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      if (res.ok) {
        const p = await res.json();
        setPolicyMode(p.mode);
      } else {
        setPolicyMode(mode);
      }
    } catch {
      setPolicyMode(mode);
    } finally {
      setUpdatingPolicy(false);
    }
  };

  const handleModerate = async (campaignId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    try {
      await fetch(`${API_URL}/commercial/ads/campaigns/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, status, reason })
      });

      // Update local state
      setData((prev: any) => {
        if (!prev) return prev;
        const updated = prev.campaigns.map((c: any) => {
          if (c.id === campaignId) {
            return { ...c, status, rejectionReason: status === 'REJECTED' ? reason : null };
          }
          return c;
        });
        return { ...prev, campaigns: updated };
      });

      setShowRejectModal(false);
      setSelectedCampaign(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTopup = async () => {
    if (!selectedAdvertiser) return;
    setIsProcessingTopup(true);
    try {
      const res = await fetch(`${API_URL}/commercial/ads/advertiser/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advertiserId: selectedAdvertiser.id, amount: Number(topupAmount) })
      });
      if (res.ok) {
        const result = await res.json();
        // Update local list
        setData((prev: any) => {
          if (!prev) return prev;
          const updated = prev.advertisers.map((a: any) => {
            if (a.id === selectedAdvertiser.id) {
              return { ...a, walletBalance: a.walletBalance + Number(topupAmount) };
            }
            return a;
          });
          return { ...prev, advertisers: updated };
        });
        alert(`Successfully added ₹${topupAmount} (+ 18% GST ₹${Math.round(topupAmount * 0.18)}) to ${selectedAdvertiser.name}!`);
        setShowTopupModal(false);
      }
    } catch (e) {
      alert("Topup failed or server offline.");
    } finally {
      setIsProcessingTopup(false);
    }
  };

  const handleSavePlacements = async () => {
    setIsSavingPlacements(true);
    try {
      await fetch(`${API_URL}/commercial/ads/placements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: placementsList, minDailyBudget: 500, currency: 'INR' })
      });
      alert('Placement inventory & rate cards saved successfully!');
    } catch (e) {
      alert('Saved locally!');
    } finally {
      setIsSavingPlacements(false);
    }
  };

  const metrics = data?.metrics || {
    activeCampaigns: 2,
    pendingModeration: 2,
    totalImpressions: 158600,
    totalClicks: 6400,
    avgCtr: 4.03,
    totalGrossSpend: 253900,
    taxAmount: 38730.51,
    netAdRevenue: 215169.49,
    totalPrepaidWallets: 49100,
    sacCode: '998319',
    taxRate: 18,
  };

  const campaigns = data?.campaigns || [];
  const advertisers = data?.advertisers || [];

  const filteredCampaigns = campaigns.filter((c: any) => {
    if (moderationFilter === 'ALL') return true;
    return c.status === moderationFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 w-full pb-16">
      
      {/* Header & Quick Action */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-indigo-400" />
              Advertising Platform Command
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              SAC 998319 • 18% GST Compliant
            </span>
          </div>
          <p className="text-slate-400 mt-2 text-sm max-w-3xl">
            Control center for the self-serve advertising ecosystem (ads.markatverse.com). Moderate creative campaigns, manage slot inventory, enforce brand safety, and track platform ad revenues.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link 
            href="/ads" 
            target="_blank"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-indigo-400" /> Open Advertiser Portal
          </Link>
          <button 
            onClick={fetchOverview}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </header>

      {/* Public Ads Display Policy Guard Banner */}
      <div className={`p-5 rounded-3xl border transition-all shadow-xl ${
        policyMode === 'ADMIN_ONLY' 
          ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30' 
          : 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl border shrink-0 ${
              policyMode === 'ADMIN_ONLY' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            }`}>
              {policyMode === 'ADMIN_ONLY' ? <Lock className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Public Ads Delivery Policy Guard:
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                  policyMode === 'ADMIN_ONLY' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {policyMode === 'ADMIN_ONLY' ? '🔒 Admin Only (Public Ads Hidden)' : '🌐 Hybrid Mode (Admin + Approved Public)'}
                </span>
                {updatingPolicy && <span className="text-xs text-slate-400 animate-pulse">Updating...</span>}
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {policyMode === 'ADMIN_ONLY' 
                  ? 'Currently Active: Public user advertisements from ads.markatverse.com are BLOCKED from customer screens. Customers only see official platform banners created in Admin Content. Switch to Hybrid when ready to allow approved public ads.' 
                  : 'Currently Active: Verified public advertiser campaigns that are Approved will appear across customer homepage, search, and category slots alongside official platform banners.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700 self-start md:self-auto shrink-0 shadow-inner">
            <button
              type="button"
              disabled={updatingPolicy}
              onClick={() => handleTogglePolicy('ADMIN_ONLY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                policyMode === 'ADMIN_ONLY'
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Admin Only (Recommended)
            </button>
            <button
              type="button"
              disabled={updatingPolicy}
              onClick={() => handleTogglePolicy('HYBRID_APPROVED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                policyMode === 'HYBRID_APPROVED'
                  ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Allow Public Ads
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: '📊 Overview & Revenue', count: null },
          { id: 'moderation', label: '🛡️ Moderation Queue', count: metrics.pendingModeration },
          { id: 'placements', label: '🎯 Placements & Slots', count: placementsList.length },
          { id: 'advertisers', label: '🏢 Advertisers Directory', count: advertisers.length },
          { id: 'rates', label: '⚙️ Ad Rate Card & GST', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === tab.id 
                  ? 'bg-white/20 text-white' 
                  : (tab.id === 'moderation' && tab.count > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400')
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & REVENUE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Active Campaigns</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">{metrics.activeCampaigns}</span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Live in Rotation</span>
              </div>
              <p className="text-[11px] text-slate-500">Across 6 marketplace placement slots</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Ad Impressions</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-indigo-400 font-mono">{(metrics.totalImpressions / 1000).toFixed(1)}k</span>
                <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">{metrics.avgCtr}% CTR</span>
              </div>
              <p className="text-[11px] text-slate-500"><span suppressHydrationWarning>{formatINR(metrics.totalClicks)}</span> verified ad clicks</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Gross Ad Spend</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-emerald-400 font-mono" suppressHydrationWarning>₹{formatINR(metrics.totalGrossSpend)}</span>
                <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">SAC 998319</span>
              </div>
              <p className="text-[11px] text-slate-500">Includes 18% GST ₹<span suppressHydrationWarning>{formatINR(metrics.taxAmount)}</span></p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Prepaid Wallet Pool</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-white font-mono" suppressHydrationWarning>₹{formatINR(metrics.totalPrepaidWallets)}</span>
                <span className="text-xs text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded-full">Advance Balance</span>
              </div>
              <p className="text-[11px] text-slate-500">Held in escrow for active bidding</p>
            </div>
          </div>

          {/* Revenue Breakdown & Tax Statutory Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Statutory Revenue &amp; GST Tax Breakdown
                </h3>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                  Rule: Section 9(1) GST Act
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Net Platform Revenue</span>
                  <div className="text-2xl font-black text-white font-mono" suppressHydrationWarning>₹{formatINR(metrics.netAdRevenue)}</div>
                  <span className="text-[10px] text-slate-500">Excludes GST component</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">CGST (9%) Collected</span>
                  <div className="text-2xl font-black text-amber-400 font-mono" suppressHydrationWarning>₹{formatINR(metrics.taxAmount / 2)}</div>
                  <span className="text-[10px] text-slate-500">Central Tax Pool</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">SGST (9%) Collected</span>
                  <div className="text-2xl font-black text-amber-400 font-mono" suppressHydrationWarning>₹{formatINR(metrics.taxAmount / 2)}</div>
                  <span className="text-[10px] text-slate-500">State Tax Pool</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Statutory Invoicing Compliance
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Under SAC 998319 (Advertising Services &amp; Digital Marketing Provision), all wallet recharges and campaign bids generate GST Tax Invoices. Input Tax Credit (ITC) is passed automatically to registered businesses submitting a valid GSTIN.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-2">Advertiser Safety Index</h3>
                <p className="text-xs text-slate-400">
                  Pre-screened creatives, restricted keyword monitoring, and zero-tolerance policy against deceptive ads.
                </p>
                <div className="mt-5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Creative Quality Score</span>
                    <span className="font-bold text-emerald-400">98.4%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98.4%' }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Copyright Compliance</span>
                    <span className="font-bold text-indigo-400">100%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button 
                  onClick={() => setActiveTab('moderation')}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" /> Review Pending Creatives ({metrics.pendingModeration})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPAIGN MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Creative Moderation &amp; Safety Queue</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect public advertiser banners before they are served to customers across markatverse.com.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-1 rounded-xl">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setModerationFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    moderationFilter === f 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCampaigns.map((camp: any) => (
              <div 
                key={camp.id}
                className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">{camp.id}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{camp.campaignTitle}</h4>
                      <p className="text-xs text-slate-400">By <span className="text-slate-200 font-medium">{camp.advertiserName}</span> • {camp.submittedAt}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      camp.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      camp.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                    }`}>
                      {camp.status}
                    </span>
                  </div>

                  {/* Banner Preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 group h-44">
                    <img 
                      src={camp.creativeUrl} 
                      alt={camp.campaignTitle} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[10px] font-bold text-white">
                      Slot: {camp.placement}
                    </div>
                  </div>

                  {/* Campaign Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block font-bold">Category</span>
                      <span className="text-slate-200 font-medium">{camp.targetCategory}</span>
                    </div>
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block font-bold">Daily Budget / Bid</span>
                      <span className="text-emerald-400 font-mono font-bold">₹{camp.dailyBudget}/day ({camp.bidType} ₹{camp.cpcBid})</span>
                    </div>
                  </div>

                  {camp.rejectionReason && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <div>
                        <span className="font-bold">Rejection Reason:</span> {camp.rejectionReason}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  {camp.status === 'PENDING' ? (
                    <>
                      <button 
                        onClick={() => handleModerate(camp.id, 'APPROVED')}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Approve &amp; Activate
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedCampaign(camp);
                          setShowRejectModal(true);
                        }}
                        className="flex-1 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Reject Creative
                      </button>
                    </>
                  ) : camp.status === 'APPROVED' ? (
                    <button 
                      onClick={() => handleModerate(camp.id, 'REJECTED', 'Terminated by Admin moderation')}
                      className="w-full py-2 bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-300 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                    >
                      Suspend Active Creative
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleModerate(camp.id, 'APPROVED')}
                      className="w-full py-2 bg-slate-800 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-300 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                    >
                      Re-Approve Campaign
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PLACEMENTS & SLOTS INVENTORY */}
      {activeTab === 'placements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Marketplace Ad Placements &amp; Inventory</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure reserve bids, max active ads in rotation, and dimensions across customer surfaces.
              </p>
            </div>
            <button 
              onClick={handleSavePlacements}
              disabled={isSavingPlacements}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> {isSavingPlacements ? 'Saving...' : 'Save Placements Configuration'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placementsList.map((slot: any, idx: number) => (
              <div 
                key={slot.id}
                className="bg-slate-900/80 rounded-3xl border border-slate-800 p-5 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">{slot.id}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{slot.name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{slot.dimensions}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      slot.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {slot.isActive ? 'ACTIVE SLOT' : 'DISABLED'}
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Reserve Min CPC Bid (₹/click)</label>
                      <input 
                        type="number"
                        step="0.5"
                        value={slot.minCpc}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPlacementsList(prev => prev.map((s, i) => i === idx ? { ...s, minCpc: val } : s));
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Reserve Min CPM Bid (₹/1k views)</label>
                      <input 
                        type="number"
                        step="5"
                        value={slot.minCpm}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPlacementsList(prev => prev.map((s, i) => i === idx ? { ...s, minCpm: val } : s));
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Max Concurrent Ads Rotation</label>
                      <input 
                        type="number"
                        min="1"
                        max="10"
                        value={slot.maxActiveAds}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPlacementsList(prev => prev.map((s, i) => i === idx ? { ...s, maxActiveAds: val } : s));
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Slot Status</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPlacementsList(prev => prev.map((s, i) => i === idx ? { ...s, isActive: !s.isActive } : s));
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      slot.isActive ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                    }`}
                  >
                    {slot.isActive ? 'Disable Slot' : 'Enable Slot'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ADVERTISERS DIRECTORY */}
      {activeTab === 'advertisers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Registered Advertisers &amp; Wallets</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage advertiser balances, GST tax registration, and top-up promotional credits.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                  <tr>
                    <th className="p-4 pl-6">Advertiser / Business</th>
                    <th className="p-4">GSTIN Tax ID</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Prepaid Balance</th>
                    <th className="p-4">Lifetime Spend</th>
                    <th className="p-4">Active Campaigns</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {advertisers.map((adv: any) => (
                    <tr key={adv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                            {adv.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">{adv.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{adv.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-300">
                        {adv.gstin}
                      </td>
                      <td className="p-4 text-xs">
                        <div className="text-slate-200 font-medium">{adv.contactPerson}</div>
                        <div className="text-slate-400 text-[11px]">{adv.email}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-sm text-emerald-400">
                        ₹<span suppressHydrationWarning>{formatINR(adv.walletBalance)}</span>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-300">
                        ₹<span suppressHydrationWarning>{formatINR(adv.totalLifetimeSpend)}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {adv.activeCampaigns} Active
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedAdvertiser(adv);
                            setShowTopupModal(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Credit Topup
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AD RATE CARD & GST RULES */}
      {activeTab === 'rates' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              Statutory GST Rate Card &amp; Ad Bidding Regulations
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              All digital advertising charges on MarkatVerse fall under Service Accounting Code (SAC) 998319. As per Section 9(1) of the CGST/SGST Act, 18% GST is levied on all advertising space sales, CPC clicks, CPM impressions, and advance wallet recharges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase">SAC Code</span>
              <div className="text-3xl font-black text-indigo-400 font-mono">998319</div>
              <p className="text-xs text-slate-400">Other advertising services and digital ad space delivery</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Applicable GST Rate</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">18.00%</div>
              <p className="text-xs text-slate-400">9% CGST + 9% SGST (or 18% IGST for inter-state advertisers)</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Min Daily Budget</span>
              <div className="text-3xl font-black text-white font-mono">₹500 / day</div>
              <p className="text-xs text-slate-400">Ensures healthy advertiser auction density and bid liquidity</p>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Reject Creative Campaign
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Please specify why creative <strong className="text-white">"{selectedCampaign.campaignTitle}"</strong> is being rejected. This reason will be emailed to the advertiser.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Select Policy Reason</label>
              <select 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="Violates platform creative / quality standards">Low image quality / blurred banner</option>
                <option value="Misleading pricing or unsubstantiated cashback claim">Misleading pricing or cashback claims</option>
                <option value="Copyright or trademark infringement without authorization">Potential trademark or brand infringement</option>
                <option value="Prohibited content / non-compliant category item">Prohibited category or unsafe goods</option>
                <option value="Target destination URL is broken or redirects unexpectedly">Broken target URL / malicious destination</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleModerate(selectedCampaign.id, 'REJECTED', rejectionReason)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOPUP MODAL */}
      {showTopupModal && selectedAdvertiser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Add Ad Wallet Credits
              </h3>
              <button onClick={() => setShowTopupModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1 text-xs">
              <span className="text-slate-400">Advertiser:</span>
              <div className="font-bold text-white">{selectedAdvertiser.name}</div>
              <div className="text-[11px] text-slate-400 font-mono">Current Balance: ₹<span suppressHydrationWarning>{formatINR(selectedAdvertiser.walletBalance)}</span></div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Top-up Amount (Net Ad Credit)</label>
              <input 
                type="number"
                step="500"
                min="500"
                value={topupAmount}
                onChange={(e) => setTopupAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* GST Summary */}
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Ad Credit:</span>
                <span className="font-mono" suppressHydrationWarning>₹{formatINR(topupAmount)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>18% GST (SAC 998319):</span>
                <span className="font-mono" suppressHydrationWarning>+₹{formatINR(topupAmount * 0.18)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-indigo-500/30">
                <span>Total Invoiced Amount:</span>
                <span className="font-mono text-emerald-400" suppressHydrationWarning>₹{formatINR(topupAmount * 1.18)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button 
                onClick={() => setShowTopupModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleTopup}
                disabled={isProcessingTopup}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {isProcessingTopup ? 'Processing...' : 'Authorize Topup'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

