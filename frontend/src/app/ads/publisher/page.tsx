"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Store, DollarSign, Eye, TrendingUp, Layers, 
  CheckCircle2, ArrowUpRight, ShieldCheck, Download, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublisherPortalPage() {
  const { user, login } = useAuth();

  const [slots] = useState([
    {
      id: 'SLOT-01',
      name: 'Storefront Header Banner Slot',
      type: 'Desktop 728x90 & Mobile 320x50',
      dailyImpressions: 48500,
      avgEcpm: 68.5,
      revenueShare: '70% Publisher / 30% Platform',
      thisMonthEarnings: 3320,
      status: 'ACTIVE'
    },
    {
      id: 'SLOT-02',
      name: 'Product Details Related Rail Slot',
      type: 'Native Product Card Sponsored',
      dailyImpressions: 32400,
      avgEcpm: 84.0,
      revenueShare: '70% Publisher / 30% Platform',
      thisMonthEarnings: 2720,
      status: 'ACTIVE'
    },
    {
      id: 'SLOT-03',
      name: 'Order Confirmation Thank-You Placement',
      type: 'High-Intent Banner Card',
      dailyImpressions: 14200,
      avgEcpm: 120.0,
      revenueShare: '70% Publisher / 30% Platform',
      thisMonthEarnings: 1704,
      status: 'ACTIVE'
    }
  ]);

  const totalEarnings = slots.reduce((acc, s) => acc + s.thisMonthEarnings, 0);

  const handleQuickDemoLogin = () => {
    const demoUser = {
      id: 'USR-PUB-01',
      markatId: 'MK-PUB-10002',
      name: 'Delhi Retail Storefront',
      email: 'publisher@markatverse.com',
      phone: '+91 98112 00000',
      role: 'business' as any,
      status: 'active' as const,
      business: {
        id: 'BIZ-PUB-01',
        name: 'Delhi Retail Storefront',
        isVerified: true,
      }
    };
    login(demoUser, 'demo_token_' + Date.now());
    toast.success('Signed in as Demo Storefront Publisher!');
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-14 p-8 bg-white border border-slate-200/90 rounded-3xl text-center space-y-5 shadow-xs animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 mx-auto flex items-center justify-center border border-pink-200 shadow-2xs">
          <Store className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900">Publisher Monetization Network</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Storefront catalog monetization, eCPM yields, and monthly 70/30 revenue share payouts require an authenticated publisher / merchant account.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link href="/ads/login?redirect=/ads/publisher" className="py-2.5 px-5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
            Sign In to Monetize
          </Link>
          <button 
            type="button"
            onClick={handleQuickDemoLogin}
            className="py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Try 1-Click Demo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 py-2 sm:py-4">
      
      {/* Header */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
              Monetization Network
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Publisher Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monetize high-traffic store pages and catalog real-estate with programmatic MarkatVerse ad slots.
          </p>
        </div>

        <button 
          onClick={() => toast.success(`Payout request of ₹${totalEarnings.toLocaleString('en-IN')} registered! Processed via auto-NEFT on 1st of month.`)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <DollarSign className="w-4 h-4" /> 
          <span>Request Payout (₹{totalEarnings.toLocaleString('en-IN')})</span>
        </button>
      </div>

      {/* Publisher Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-50 via-white to-pink-50/50 border border-pink-200/90 shadow-2xs relative overflow-hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Estimated Monthly Revenue</span>
          <div className="text-3xl font-black text-emerald-700 font-mono mt-1">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Calculated after 70% publisher split + statutory SAC 998319 GST invoice.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Monthly Ad Views</span>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">
            {(slots.reduce((a, s) => a + s.dailyImpressions, 0) * 30).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
            100% Filled Ad Inventory
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Average Blended eCPM</span>
          <div className="text-3xl font-black text-purple-700 font-mono mt-1">
            ₹86.20
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Revenue per 1,000 delivered impressions
          </span>
        </div>
      </div>

      {/* Active Slots Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-900">Active Publisher Ad Slots</h3>
          <span className="text-xs text-slate-500">{slots.length} ad inventory units live</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Ad Slot Unit</th>
                <th className="p-4">Slot Type</th>
                <th className="p-4">Daily Views</th>
                <th className="p-4">Avg eCPM</th>
                <th className="p-4">Revenue Split</th>
                <th className="p-4 pr-6 text-right">30-Day Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slots.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-900">
                    <div>{s.name}</div>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">{s.id}</span>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{s.type}</td>
                  <td className="p-4 font-mono text-slate-800">{s.dailyImpressions.toLocaleString('en-IN')} / day</td>
                  <td className="p-4 font-mono font-bold text-purple-700">₹{s.avgEcpm.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.revenueShare}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right font-mono font-black text-emerald-700 text-sm">
                    ₹{s.thisMonthEarnings.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
