"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  BarChart3, Zap, Shield, Target, Cpu, 
  CheckCircle2, ArrowRight, Play, RefreshCw, Layers
} from 'lucide-react';

export default function CampaignEnginePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-slate-900 border border-blue-500/30 rounded-3xl text-center space-y-4 shadow-2xl backdrop-blur-xl">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/20">
          <Zap className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-white">Sign In to Access Campaign Auction Engine</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The programmatic 2nd-price auction simulator and real-time bid pacing telemetry require an authenticated advertiser account.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/ads/login?redirect=/ads/campaigns" className="py-2.5 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all">
            Sign In
          </Link>
          <Link href="/ads/login?mode=register&redirect=/ads/campaigns" className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700">
            Register Account
          </Link>
        </div>
      </div>
    );
  }
  const [isSimulating, setIsSimulating] = useState(false);
  const [auctionLog, setAuctionLog] = useState([
    {
      id: 'REQ-98124',
      userContext: 'PIN 110001 • Category: Electronics',
      bidders: [
        { name: 'Apex Mobiles Store', bid: 6.5, qualityScore: 9.2, rank: 59.8, status: 'WINNER', clearingPrice: 5.82 },
        { name: 'Digital Express Delhi', bid: 5.8, qualityScore: 8.5, rank: 49.3, status: 'OUTBID', clearingPrice: 0 },
        { name: 'GadgetZone Premier', bid: 4.0, qualityScore: 9.0, rank: 36.0, status: 'OUTBID', clearingPrice: 0 },
      ],
      decisionTimeMs: 11
    },
    {
      id: 'REQ-98123',
      userContext: 'PIN 560001 • Category: Dining & Food',
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
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Campaign &amp; Auction Engine</h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Low-Latency Programmatic
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time second-price Vickrey auction, frequency capping, and hyper-local radius delivery in under 15ms.
          </p>
        </div>

        <button
          onClick={triggerLiveAuctionSimulation}
          disabled={isSimulating}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          {isSimulating ? 'Executing Auction...' : 'Simulate Live Ad Bid'}
        </button>
      </div>

      {/* Engine Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auction Latency</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">11.4 ms</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Sub-15ms SLA target</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auction Algorithm</span>
          <div className="text-2xl font-black text-white mt-1">2nd-Price</div>
          <span className="text-[11px] text-blue-400 mt-0.5 block">Vickrey clearing rule</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bot Filter Catch</span>
          <div className="text-2xl font-black text-purple-400 mt-1 font-mono">99.8%</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Anti-fraud invalid click check</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Default Frequency Cap</span>
          <div className="text-2xl font-black text-pink-400 mt-1 font-mono">3 / user / hr</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Prevents ad fatigue</span>
        </div>
      </div>

      {/* Live Auction Logs & Bidding Telemetry */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Live Auction Telemetry Feed
        </h3>

        <div className="space-y-4">
          {auctionLog.map((log) => (
            <div 
              key={log.id}
              className="bg-slate-900/80 rounded-2xl border border-white/10 p-5 space-y-3"
            >
              <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-400">{log.id}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 font-medium">{log.userContext}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-emerald-400 font-bold">Solved in {log.decisionTimeMs}ms</span>
                </div>
              </div>

              {/* Bidders in this round */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {log.bidders.map((b, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                      b.status === 'WINNER'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                        : 'bg-slate-950/40 border-white/5 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold truncate">{b.name}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        b.status === 'WINNER' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-[11px] font-mono">
                      <span>Max Bid: ₹{b.bid.toFixed(2)}</span>
                      <span>Quality: {b.qualityScore}/10</span>
                    </div>

                    <div className="flex justify-between items-baseline font-mono pt-1 border-t border-white/5 text-[11px]">
                      <span className="text-slate-400">Ad Rank: <strong className="text-white">{b.rank.toFixed(1)}</strong></span>
                      {b.status === 'WINNER' && (
                        <span className="text-emerald-300 font-bold">Clearing: ₹{b.clearingPrice.toFixed(2)}</span>
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

