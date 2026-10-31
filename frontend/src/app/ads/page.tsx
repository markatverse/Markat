"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Megaphone, Store, BarChart3, ShieldCheck, 
  ArrowRight, TrendingUp, DollarSign, Eye, 
  CheckCircle2, Zap, Layers, Sparkles, MapPin, Target, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdsHeroIllustration from '@/components/ads/AdsHeroIllustration';
import toast from 'react-hot-toast';

export default function AdsPlatformDashboard() {
  const router = useRouter();
  const { user, login } = useAuth();

  // If user is already authenticated, take them directly to their Campaign Manager
  useEffect(() => {
    if (user) {
      router.replace('/ads/advertiser');
    }
  }, [user, router]);

  // Quick 1-Click Demo Login as Manish Kumar
  const handleQuickDemoLogin = () => {
    const demoUser = {
      id: 'USR-ADV-01',
      markatId: 'MV-0000000048',
      name: 'Manish Kumar',
      email: 'manishtarjan9798.mk@gmail.com',
      phone: '+91 98112 88442',
      role: 'business' as any,
      status: 'active' as const,
      business: {
        id: 'BIZ-ADV-01',
        name: 'Manish Kumar',
        isVerified: true,
      }
    };
    login(demoUser, 'demo_token_' + Date.now());
    toast.success('Signed in as Manish Kumar (Verified Merchant)!');
    router.push('/ads/advertiser');
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300 py-2 sm:py-6 max-w-7xl mx-auto">
      
      {/* 1. Hero Section (Public Overview) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              <span>MarkatVerse Hyperlocal Advertising Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              High-Impact Hyperlocal Advertising for Modern Commerce.
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Reach high-intent local shoppers in your city and neighborhood exactly when they are searching for products, dining, and professional services across the MarkatVerse ecosystem.
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
                title="Instant access demo account"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>✨ 1-Click Demo Login</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Graphic Preview */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <AdsHeroIllustration />
          </div>
        </div>
      </div>

      {/* 2. Platform Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-black">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-base font-black text-slate-900">5km Hyperlocal Radius</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Target buyers searching within your immediate storefront vicinity or delivery PIN codes when they look for nearby goods, services, and live bookings.
          </p>
        </div>

        <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-base font-black text-slate-900">Fair Pay-for-Performance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Set your daily budgets starting from ₹500. Pay only when verified local shoppers click, call, or browse your products. Zero hidden fees.
          </p>
        </div>

        <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-black">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-base font-black text-slate-900">Live ROAS Attribution</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Track real impressions, clicks, store direction navigations, and order revenues in real time from your verified merchant portal.
          </p>
        </div>
      </div>

      {/* 3. Transparent Placement Inventory & Live Floor Rates */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Transparent Pricing</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">Ad Placements &amp; Live Rate Card</h2>
            <p className="text-xs text-slate-500">
              Standard floor rates with 18% GST Input Tax Credit (ITC) invoices under SAC Code 998319.
            </p>
          </div>

          <Link
            href="/ads/login?mode=register"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 shrink-0"
          >
            <span>Book Placement Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Placement Zone</th>
                <th className="py-3 px-4">Format &amp; Dimensions</th>
                <th className="py-3 px-4">Starting Rate</th>
                <th className="py-3 px-4">Audience &amp; Reach</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span>Homepage Top Hero Carousel</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">High Reach</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-500 font-mono">Desktop 1200x480 / Mobile 400x250</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">CPM ₹85 / CPC ₹4.50</td>
                <td className="py-3.5 px-4 text-slate-600">Maximum platform visibility &amp; brand awareness across all visitors</td>
                <td className="py-3.5 px-4 text-right">
                  <Link href="/ads/login" className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs">
                    Book Slot →
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span>Search Sponsored Top Product</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Highest Intent</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-500 font-mono">Native Sponsored Listing Tile</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">CPC ₹3.50 (Auction Bidding)</td>
                <td className="py-3.5 px-4 text-slate-600">High-purchase intent direct buyer clicks when searching products</td>
                <td className="py-3.5 px-4 text-right">
                  <Link href="/ads/login" className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs">
                    Book Slot →
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span>Category Header Banner</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">Category Focus</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-500 font-mono">Desktop 1200x200 / Mobile 320x100</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">CPM ₹50 / CPC ₹3.00</td>
                <td className="py-3.5 px-4 text-slate-600">Targeted shoppers browsing specific verticals (Fashion, Food, Tech)</td>
                <td className="py-3.5 px-4 text-right">
                  <Link href="/ads/login" className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs">
                    Book Slot →
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Simple 3-Step Onboarding */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Simple Onboarding</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">How to Launch Ads in 3 Steps</h2>
          <p className="text-xs text-slate-500">Start reaching local buyers and generating orders in minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-2xs">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Create Account &amp; Wallet</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in with your phone or email. Add your brand details and top up your advertiser wallet starting from ₹500.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-2xs">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Target Radius &amp; Budget</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Target local PIN codes, radius around your storefront, or target shoppers browsing categories like Electronics, Dining, and Apparel.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-2xs">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Go Live &amp; Track Real ROAS</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Once verified, your ads immediately enter the live auction. Monitor real-time impressions, clicks, orders, and GST invoices.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Call to Action Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">Ready to grow your sales with MarkatVerse Ads?</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-lg">
            Join over 1,400+ local brands, restaurants, and retail merchants running high-ROI campaigns today.
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
            ✨ Try Demo
          </button>
        </div>
      </div>

    </div>
  );
}
