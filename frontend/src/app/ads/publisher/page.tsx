"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Store, DollarSign, Eye, TrendingUp, Layers, 
  CheckCircle2, ArrowUpRight, ShieldCheck, Download
} from 'lucide-react';

export default function PublisherPortalPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-slate-900 border border-pink-500/30 rounded-3xl text-center space-y-4 shadow-2xl backdrop-blur-xl">
        <div className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-400 mx-auto flex items-center justify-center border border-pink-500/20">
          <Store className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-white">Sign In to Access Publisher Network</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Storefront catalog monetization, eCPM yields, and monthly 70/30 revenue share payouts require an authenticated publisher / merchant account.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/ads/login?redirect=/ads/publisher" className="py-2.5 px-6 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all">
            Sign In to Monetize
          </Link>
          <Link href="/ads/login?mode=register&redirect=/ads/publisher" className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700">
            Register Storefront
          </Link>
        </div>
      </div>
    );
  }
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Publisher Portal</h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Monetization Network
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monetize high-traffic store pages and catalog real-estate with programmatic MarkatVerse ad slots.
          </p>
        </div>

        <button 
          onClick={() => alert('Payout request registered. Processed on 1st of month via auto-NEFT.')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <DollarSign className="w-4 h-4" /> Request Payout (₹{totalEarnings.toLocaleString('en-IN')})
        </button>
      </div>

      {/* Publisher Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-950/40 to-slate-900 border border-pink-500/30 relative overflow-hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Estimated Monthly Revenue</span>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Calculated after 70% publisher split + statutory SAC 998319 GST invoice.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Monthly Ad Views</span>
          <div className="text-3xl font-black text-white font-mono mt-1">
            {(slots.reduce((a, s) => a + s.dailyImpressions, 0) * 30).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-400 font-bold mt-1 block">
            100% Filled Ad Inventory
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Blended eCPM</span>
          <div className="text-3xl font-black text-purple-400 font-mono mt-1">
            ₹86.20
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Revenue per 1,000 delivered impressions
          </span>
        </div>
      </div>

      {/* Active Slots Table */}
      <div className="bg-slate-900/60 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-sm font-black text-white">Active Publisher Ad Slots</h3>
          <span className="text-xs text-slate-400">{slots.length} ad inventory units live</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/60 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-4 pl-6">Ad Slot Unit</th>
                <th className="p-4">Slot Type</th>
                <th className="p-4">Daily Views</th>
                <th className="p-4">Avg eCPM</th>
                <th className="p-4">Revenue Split</th>
                <th className="p-4 pr-6 text-right">30-Day Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {slots.map(s => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6 font-bold text-white">
                    <div>{s.name}</div>
                    <span className="text-[10px] font-mono text-slate-500 font-normal">{s.id}</span>
                  </td>
                  <td className="p-4 text-slate-300 font-medium">{s.type}</td>
                  <td className="p-4 font-mono text-slate-200">{s.dailyImpressions.toLocaleString('en-IN')} / day</td>
                  <td className="p-4 font-mono font-bold text-purple-300">₹{s.avgEcpm.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {s.revenueShare}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right font-mono font-black text-emerald-400 text-sm">
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

