"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  BarChart3, Zap, Shield, Target, Cpu, 
  CheckCircle2, ArrowRight, Play, RefreshCw, Layers, Sparkles, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CampaignEnginePage() {
  const { user, login } = useAuth();

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
    toast.success('Signed in as Demo Advertiser!');
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-14 p-8 bg-white border border-slate-200/90 rounded-3xl text-center space-y-5 shadow-xs animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border border-blue-200 shadow-2xs">
          <Zap className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900">Campaign Auction Engine</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The programmatic 2nd-price auction simulator and real-time bid pacing telemetry require an authenticated advertiser account.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link href="/ads/login?redirect=/ads/campaigns" className="py-2.5 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
            Sign In
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

  const [isSimulating, setIsSimulating] = useState(false);
  const [auctionLog, setAuctionLog] = useState([
    {
      id: 'REQ-98124',
      userContext: 'PIN 110001 • Category: Electronics & Gadgets',
      bidders: [
        { name: 'Apex Mobiles Store', bid: 6.5, qualityScore: 9.2, rank: 59.8, status: 'WINNER', clearingPrice: 5.82 },
        { name: 'Digital Express Delhi', bid: 5.8, qualityScore: 8.5, rank: 49.3, status: 'OUTBID', clearingPrice: 0 },
        { name: 'GadgetZone Premier', bid: 4.0, qualityScore: 9.0, rank: 36.0, status: 'OUTBID', clearingPrice: 0 },
      ],
      decisionTimeMs: 11
    },
    {
      id: 'REQ-98123',
      userContext: 'PIN 560001 • Category: Dining & Restaurants',
      bidders: [
        { name: 'Tandoor Grill House', bid: 4.8, qualityScore: 9.5, rank: 45.6, status: 'WINNER', clearingPrice: 4.25 },
        { name: 'Urban Burger Bar', bid: 4.2, qualityScore: 8.8, rank: 36.9, status: 'OUTBID', clearingPrice: 0 }
      ],
      decisionTimeMs: 9
    }
  ]);

  const triggerLiveAuctionSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const newSim = {
        id: `REQ-${Math.floor(98125 + Math.random() * 1000)}`,
        userContext: `PIN 400001 • Category: Festive Apparel`,
        bidders: [
          { name: 'Silk Traditions Mumbai', bid: 7.2, qualityScore: 9.4, rank: 67.6, status: 'WINNER', clearingPrice: 6.1 },
          { name: 'Ethnic Vogue Store', bid: 6.0, qualityScore: 8.9, rank: 53.4, status: 'OUTBID', clearingPrice: 0 },
          { name: 'Khadi Crafts India', bid: 4.5, qualityScore: 9.1, rank: 40.9, status: 'OUTBID', clearingPrice: 0 }
        ],
        decisionTimeMs: Math.floor(8 + Math.random() * 8)
      };
      setAuctionLog([newSim, ...auctionLog.slice(0, 3)]);
      setIsSimulating(false);
      toast.success('Live auction resolved in ' + newSim.decisionTimeMs + 'ms');
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 py-2 sm:py-4">
      
      {/* Header */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Low-Latency Programmatic
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Campaign &amp; Auction Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time second-price Vickrey auction, frequency capping, and hyper-local radius delivery in under 15ms.
          </p>
        </div>

        <button
          onClick={triggerLiveAuctionSimulation}
          disabled={isSimulating}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Executing Auction...' : 'Simulate Live Ad Bid'}</span>
        </button>
      </div>

      {/* Engine Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Auction Latency</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 font-mono">11.4 ms</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Sub-15ms SLA target</span>
        </div>
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Auction Algorithm</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">2nd-Price</div>
          <span className="text-[11px] text-blue-600 mt-0.5 block">Vickrey clearing rule</span>
        </div>
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bot Filter Catch</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 mt-1 font-mono">99.8%</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Anti-fraud invalid click check</span>
        </div>
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Default Frequency Cap</span>
          <div className="text-2xl sm:text-3xl font-black text-pink-600 mt-1 font-mono">3 / user / hr</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Prevents ad fatigue</span>
        </div>
      </div>

      {/* Live Auction Logs & Bidding Telemetry */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> 
          <span>Live Auction Telemetry Feed</span>
        </h3>

        <div className="space-y-4">
          {auctionLog.map((log) => (
            <div 
              key={log.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-3 shadow-2xs"
            >
              <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">{log.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-medium">{log.userContext}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Solved in {log.decisionTimeMs}ms
                  </span>
                </div>
              </div>

              {/* Bidders in this round */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {log.bidders.map((b, idx) => (
                  <div 
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      b.status === 'WINNER'
                        ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                        : 'bg-slate-50/80 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold truncate text-slate-900">{b.name}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        b.status === 'WINNER' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-[11px] font-mono">
                      <span>Max Bid: ₹{b.bid.toFixed(2)}</span>
                      <span>Quality: {b.qualityScore}/10</span>
                    </div>

                    <div className="flex justify-between items-baseline font-mono pt-1.5 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-500">Ad Rank: <strong className="text-slate-900">{b.rank.toFixed(1)}</strong></span>
                      {b.status === 'WINNER' && (
                        <span className="text-emerald-700 font-bold">Clearing: ₹{b.clearingPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
