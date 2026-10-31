"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Megaphone, Store, BarChart3, ShieldCheck, 
  ArrowRight, TrendingUp, DollarSign, Eye, 
  Lock, CheckCircle2, Zap, Layers, HelpCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdsHeroIllustration from '@/components/ads/AdsHeroIllustration';

export default function AdsPlatformDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const kpis = [
    { label: 'Total Ad Impressions', value: '14.8M', change: '+22.4% MoM', icon: <Eye className="w-5 h-5 text-purple-600" /> },
    { label: 'Average CTR', value: '3.42%', change: '+0.8% vs benchmark', icon: <TrendingUp className="w-5 h-5 text-emerald-600" /> },
    { label: 'Active Campaigns', value: '1,420', change: '+142 this week', icon: <Megaphone className="w-5 h-5 text-pink-600" /> },
    { label: 'Average CPC / CPM', value: '₹4.20 / ₹65', change: 'Optimized bidding', icon: <DollarSign className="w-5 h-5 text-blue-600" /> },
  ];

  const portals = [
    {
      title: 'Advertiser Portal',
      description: 'Create targeted CPC and CPM campaigns, define 5km delivery radius, set daily budgets, and track real-time ROAS.',
      href: user ? '/ads/advertiser' : '/ads/login',
      icon: <Megaphone className="w-6 h-6" />,
      color: 'from-purple-600 to-indigo-600',
      badge: 'For Brands & Retailers',
      buttonText: user ? 'Open Advertiser Portal' : 'Sign In to Advertise',
      features: ['Hyperlocal 5km PIN-code geofencing', 'Dynamic budget pacing & CPC bidding', 'Direct conversion & order attribution']
    },
    {
      title: 'Publisher Portal',
      description: 'Monetize catalog real-estate, listing pages, and category headers with our automated 70/30 revenue share model.',
      href: user ? '/ads/publisher' : '/ads/login',
      icon: <Store className="w-6 h-6" />,
      color: 'from-pink-600 to-rose-600',
      badge: 'For Storefronts & Publishers',
      buttonText: user ? 'Open Publisher Portal' : 'Sign In to Monetize',
      features: ['High-converting banner placements', 'Real-time eCPM yield optimization', 'Automated monthly GST tax invoice payouts']
    },
    {
      title: 'Campaign Engine',
      description: 'Ultra-low-latency 2nd-price programmatic auction matching bids, quality scores, and frequency caps in under 15ms.',
      href: user ? '/ads/campaigns' : '/ads/login',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-blue-600 to-cyan-600',
      badge: 'Programmatic Auction',
      buttonText: user ? 'Open Auction Simulator' : 'Sign In to View Engine',
      features: ['2nd-Price Vickrey auction simulator', 'Anti-fraud bot click filtering', 'Hyperlocal delivery telemetry']
    },
    ...(isAdmin ? [{
      title: 'Ads Admin & Moderation',
      description: 'Creative policy compliance queue, automated brand safety screening, advertiser credit checks, and revenue auditing.',
      href: '/ads/admin',
      icon: <ShieldCheck className="w-6 h-6" />,
      color: 'from-emerald-600 to-teal-600',
      badge: '🛡️ Admin Only',
      buttonText: 'Open Ads Admin & Moderation',
      features: ['1-Click creative approval & rejection', 'Advertiser credit limit management', 'Platform net revenue & GST GSTR-1 reports']
    }] : [])
  ];

  const rateCard = [
    {
      placement: 'Homepage Top Hero Carousel',
      type: 'Desktop 1200×400 / Mobile 600×350',
      pricing: 'CPM ₹65 / CPC ₹4.50',
      reach: 'Maximum platform visibility & brand awareness across all visitors',
      badge: 'High Reach'
    },
    {
      placement: 'Search Sponsored Top Product',
      type: 'Native Sponsored Listing Tile',
      pricing: 'CPC ₹3.50 (Auction Bidding)',
      reach: 'High purchase intent direct buyer clicks when searching products',
      badge: 'Highest Intent'
    },
    {
      placement: 'Category Header Banner',
      type: 'Desktop 728×90 / Mobile 320×100',
      pricing: 'CPM ₹50 / CPC ₹3.00',
      reach: 'Targeted shoppers browsing specific verticals (Fashion, Food, Tech)',
      badge: 'Category Focus'
    },
    {
      placement: 'Cart & Checkout Offers',
      type: 'Featured In-Cart Recommendation',
      pricing: 'CPC ₹5.00',
      reach: 'Immediate buyers ready to complete purchase with 1-click add',
      badge: 'Direct Conversion'
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Hero Section - Clean, Luminous White Background */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Heading, Description & Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              MarkatVerse Advertising Platform
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              High-Impact Hyperlocal Advertising for Modern Commerce.
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Reach high-intent local shoppers exactly when they are searching for products, dining, and professional services across the entire MarkatVerse ecosystem.
            </p>
            
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                <>
                  <Link
                    href="/ads/advertiser"
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>Go to Advertiser Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/ads/campaigns"
                    className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all border border-slate-200 shadow-xs flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Auction Simulator</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/ads/login?mode=register"
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
                  >
                    <span>Start Advertising</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/ads/login"
                    className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all border border-slate-200 shadow-xs"
                  >
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="#placements"
                    className="px-4 py-3 text-slate-500 hover:text-purple-600 font-medium text-sm transition-colors"
                  >
                    <span>View Rate Card ↓</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Clean SVG Illustration */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <AdsHeroIllustration />
          </div>
        </div>
      </div>

      {/* KPI Cards Strip - Clean Enterprise Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx}
            className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                {kpi.icon}
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{kpi.value}</div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              {kpi.change}
            </span>
          </div>
        ))}
      </div>

      {/* Platform Modules */}
      <div className="space-y-5">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-black text-slate-900">Platform Modules</h2>
            <p className="text-xs text-slate-500 mt-1">
              {user ? 'Manage your campaigns, publisher slots, and live auctions.' : 'Dedicated portals designed for advertisers, publishers, and campaign management.'}
            </p>
          </div>
          {!user && (
            <Link href="/ads/login" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
              <span>Sign In Required</span>
              <Lock className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
          {portals.map((p, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center shadow-md`}>
                    {p.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                    {p.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4">
                <Link
                  href={p.href}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    user 
                      ? 'bg-slate-900 hover:bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                  }`}
                >
                  {!user && <Lock className="w-3.5 h-3.5" />}
                  <span>{p.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION: PLACEMENTS & TRANSPARENT RATE CARD */}
      <div id="placements" className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            Transparent Pricing
          </div>
          <h2 className="text-2xl font-black text-slate-900">Ad Placements & Live Rate Card</h2>
          <p className="text-xs text-slate-500 mt-1">
            Transparent floor rates with 18% GST Input Tax Credit (ITC) invoices under SAC Code 998319.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Placement Zone</th>
                <th className="py-3.5 px-4">Format & Dimensions</th>
                <th className="py-3.5 px-4">Starting Rate</th>
                <th className="py-3.5 px-4">Audience & Reach</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {rateCard.map((slot, idx) => (
                <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{slot.placement}</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-medium whitespace-nowrap">
                        {slot.badge}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-500">{slot.type}</td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-700">{slot.pricing}</td>
                  <td className="py-4 px-4 text-slate-600">{slot.reach}</td>
                  <td className="py-4 px-5 text-right">
                    <Link
                      href={user ? '/ads/advertiser' : '/ads/login'}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: HOW IT WORKS */}
      <div id="how-it-works" className="space-y-6 pt-4 border-t border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Simple Onboarding
          </div>
          <h2 className="text-2xl font-black text-slate-900">How to Launch Ads in 3 Steps</h2>
          <p className="text-xs text-slate-500 mt-1">Start reaching local buyers and generating orders in minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-base">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Create Account & Wallet</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sign in with your phone or email. Add your brand details and top up your advertiser wallet starting from ₹500.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-black text-base">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Target Radius & Budget</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Target local PIN codes, radius around your storefront, or target shoppers browsing categories like Electronics, Dining, and Apparel.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-base">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Go Live & Track Real ROAS</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once verified, your ads immediately enter the live auction. Monitor real-time impressions, clicks, orders, and GST invoices.
            </p>
          </div>
        </div>
      </div>

      {/* CALL TO ACTION BANNER */}
      {!user && (
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Ready to grow your sales with MarkatVerse Ads?</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-lg">
              Join over 1,400+ local brands, restaurants, and retail merchants running high-ROI campaigns today.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/ads/login?mode=register"
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              Get Started Now
            </Link>
            <Link
              href="/ads/login"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all border border-slate-200 shadow-xs"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
