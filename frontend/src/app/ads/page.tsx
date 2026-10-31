"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Megaphone, Store, BarChart3, ShieldCheck, 
  ArrowRight, TrendingUp, DollarSign, Eye, 
  CheckCircle2, Zap, Layers, PlusCircle, Wallet,
  Pause, Play, Sparkles, MapPin, Target, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdsHeroIllustration from '@/components/ads/AdsHeroIllustration';
import toast from 'react-hot-toast';

export default function AdsPlatformDashboard() {
  const { user, login } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // State for live interactive campaigns on the authenticated dashboard
  const [campaigns, setCampaigns] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mv_advertiser_campaigns');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [
      {
        id: 'CMP-801',
        name: 'Super Smart TV Mega Cashback 📺',
        placement: 'Homepage Top Hero Carousel',
        dailyBudget: 2500,
        spent: 18450,
        impressions: 48200,
        clicks: 1840,
        ctr: '3.82%',
        status: 'ACTIVE',
        mediaUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&auto=format&fit=crop&q=80',
      },
      {
        id: 'CMP-802',
        name: 'Flat 50% Off Lunch Combos 🍛',
        placement: 'Homepage Middle Featured Banner',
        dailyBudget: 1200,
        spent: 7004,
        impressions: 82400,
        clicks: 2890,
        ctr: '3.51%',
        status: 'ACTIVE',
        mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80',
      },
      {
        id: 'CMP-803',
        name: '1-Hour Screen Replacement at Home 📱',
        placement: 'Search Sponsored Top Product',
        dailyBudget: 1800,
        spent: 14200,
        impressions: 62400,
        clicks: 2950,
        ctr: '4.73%',
        status: 'ACTIVE',
        mediaUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
      },
      {
        id: 'CMP-804',
        name: 'Pure Organic Immunity Kadha 🌿',
        placement: 'Product Page Related Rail',
        dailyBudget: 800,
        spent: 6850,
        impressions: 18900,
        clicks: 890,
        ctr: '4.71%',
        status: 'PAUSED',
        mediaUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop&q=80',
      }
    ];
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

  // Listen for real-time wallet and campaign updates
  React.useEffect(() => {
    const handleWalletUpdate = (e: any) => {
      if (e.detail?.balance !== undefined) setWalletBalance(e.detail.balance);
    };
    window.addEventListener('mv_advertiser_wallet_updated', handleWalletUpdate);
    return () => window.removeEventListener('mv_advertiser_wallet_updated', handleWalletUpdate);
  }, []);

  // Instant 1-Click Demo Login to experience full advertiser functionality
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

  // Toggle Campaign Live / Paused
  const toggleCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        toast.success(`Campaign "${c.name}" is now ${nextStatus}`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const activeCount = campaigns.filter(c => c.status === 'ACTIVE').length;

  // =========================================================================
  // VIEW 1: BEFORE LOGIN (Simple, Clean, High-Impact & Zero Clutter)
  // =========================================================================
  if (!user) {
    return (
      <div className="space-y-10 animate-in fade-in duration-300 py-2 sm:py-4">
        {/* Clean Hero Section */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: Heading, Description & Simple Action Buttons */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 text-purple-600" />
                <span>MarkatVerse Hyperlocal Advertising</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                High-Impact Hyperlocal Advertising for Modern Commerce.
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Reach high-intent local shoppers in your city and neighborhood exactly when they are searching for products, dining, and professional services.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/ads/login?mode=register"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Start Advertising</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/ads/login"
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all border border-slate-200 shadow-2xs cursor-pointer"
                >
                  <span>Sign In</span>
                </Link>

                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="px-4 py-3 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-900 border border-amber-200 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Test dashboard immediately without login credentials"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>? 1-Click Demo Dashboard</span>
                </button>
              </div>
            </div>

            {/* Right Column: Hero Graphic Preview */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <AdsHeroIllustration />
            </div>
          </div>
        </div>

        {/* 3 Simple Value Pillars (No locked modules or clutter) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-black">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-base font-black text-slate-900">5km Hyperlocal Radius</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Target buyers searching within your immediate storefront vicinity or delivery PIN codes when they look for nearby goods and services.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-black text-slate-900">Fair Pay-for-Performance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Set your own daily budgets starting from ?500. Pay only when shoppers genuinely click, call, or browse your products. Zero hidden fees.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-black">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-base font-black text-slate-900">Live Order & ROAS Attribution</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track real impressions, clicks, store direction clicks, and order revenues in real time from your dedicated advertiser portal.
            </p>
          </div>
        </div>

        {/* Clean, Simple Call to Action Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Ready to grow your local sales with MarkatVerse Ads?</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-lg">
              Join local brands, restaurants, and retail merchants running high-ROI campaigns today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/ads/login?mode=register"
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              Get Started Now
            </Link>
            <Link
              href="/ads/login"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all border border-slate-200 shadow-2xs"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="px-4 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all border border-amber-200 cursor-pointer"
            >
              ? Try Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED ADVERTISER DASHBOARD (Fully Functional & Interactive)
  // =========================================================================
  return (
    <div className="space-y-8 animate-in fade-in duration-300 py-2 sm:py-4">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Advertiser Account Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Welcome back, {user.name || 'Advertiser'}! ??
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your live campaigns, inspect auction telemetry, and top up your wallet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/ads/advertiser"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Campaign</span>
          </Link>
          <Link
            href="/ads/advertiser"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-purple-600" />
            <span>Top Up Wallet</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ad Wallet Balance</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            ?{walletBalance.toLocaleString('en-IN')}
          </div>
          <Link href="/ads/advertiser" className="text-[11px] font-bold text-purple-600 hover:text-purple-700 mt-1 block">
            + Add Funds ?
          </Link>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Campaigns</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {activeCount} Live
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
            Running in 5km Radius
          </span>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Impressions</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            276.9K
          </div>
          <span className="text-[11px] font-semibold text-blue-600 mt-1 block">
            +18.4% this week
          </span>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average CTR</span>
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            3.15%
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
            High buyer intent
          </span>
        </div>
      </div>

      {/* Active Campaigns Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Your Campaigns</h2>
            <p className="text-xs text-slate-500">Live delivery status, clicks, and real-time controls</p>
          </div>
          <Link
            href="/ads/advertiser"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>Full Campaign Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Placement</th>
                <th className="py-3 px-4">Daily Budget</th>
                <th className="py-3 px-4">Spent</th>
                <th className="py-3 px-4">Impressions / Clicks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <img 
                        src={camp.mediaUrl} 
                        alt={camp.name} 
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" 
                      />
                      <div>
                        <div className="font-bold text-slate-900">{camp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{camp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{camp.placement}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">?{camp.dailyBudget}/day</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">?{camp.spent.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-slate-900">{camp.impressions.toLocaleString('en-IN')}</span> imps �{' '}
                    <span className="font-bold text-emerald-600">{camp.clicks.toLocaleString('en-IN')}</span> clicks ({camp.ctr})
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      camp.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${camp.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      {camp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleCampaign(camp.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs ${
                        camp.status === 'ACTIVE'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {camp.status === 'ACTIVE' ? (
                        <>
                          <Pause className="w-3 h-3 text-slate-500" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fully Unlocked Platform Portals */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Platform Portals & Tools</h2>
          <p className="text-xs text-slate-500">Direct access to your advertising, monetization, and simulation modules.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Advertiser Portal Card */}
          <Link
            href="/ads/advertiser"
            className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                Advertiser Portal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create new campaigns, manage creatives, configure 5km PIN-code geo-fences, and review ROAS.
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
              <span>Open Advertiser Portal</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Campaign Engine Card */}
          <Link
            href="/ads/campaigns"
            className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center shadow-xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                Campaign Engine & Auction
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Test the programmatic 2nd-price Vickrey auction simulator and evaluate real-time bid pacing telemetry.
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Open Auction Simulator</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Publisher Portal Card */}
          <Link
            href="/ads/publisher"
            className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-pink-300 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 text-white flex items-center justify-center shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-pink-600 transition-colors">
                Publisher Network
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monetize your storefront catalog real-estate, listing pages, and headers with automated 70/30 revenue share.
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center text-xs font-bold text-pink-600 group-hover:translate-x-1 transition-transform">
              <span>Open Publisher Portal</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Admin Moderation (If Admin) */}
          {isAdmin && (
            <Link
              href="/ads/admin"
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Ads Admin & Moderation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Creative compliance queue, brand safety approvals, advertiser credit limits, and GST tax auditing.
                </p>
              </div>
              <div className="pt-4 mt-2 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                <span>Open Moderation Queue</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
