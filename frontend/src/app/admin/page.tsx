"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Activity, Users, Store, TrendingUp, DollarSign } from 'lucide-react';
import { useAdminRole } from '@/context/AdminRoleContext';

const defaultSettings = {
  sectors: [
    { id: 'b2b', name: 'B2B Wholesale', isActive: true },
    { id: 'b2c', name: 'B2C Retail', isActive: true },
    { id: 'services', name: 'Services & Bookings', isActive: true }
  ]
};

export default function AdminDashboardPage() {
  const { allUsers } = useAuth();
  const { currentAdminRole, canEdit } = useAdminRole();
  
  // States for real data aggregation
  const [metrics, setMetrics] = useState({
    totalSellers: 0,
    totalBuyers: 0,
    totalVolume: 0,
    totalPlatformRevenue: 0,
    activeOrders: 0,
    openExceptions: 0,
    recentTransactions: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

  // Calculate metrics
  const { totalSellers: activeSellers, totalBuyers: activeBuyers, totalVolume, totalPlatformRevenue, activeOrders, openExceptions } = metrics;
  const totalProducts = 124; // Static for now, as products API isn't globally fetching all

  useEffect(() => {
    const fetchGlobalData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/admin/analytics/dashboard`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (e) {
        console.error("Failed to fetch live aggregated data", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalData();
  }, []);

  // Sector controls and dummy toggles removed
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full relative pb-10">
      
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Platform Health</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Real-time metrics for MarkatVerse ecosystem.</p>
        </div>
      </header>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-10 relative z-10">
        <div className="group bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 hover:from-indigo-500/20 hover:to-indigo-600/10 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-indigo-500/20 hover:border-indigo-500/40 shadow-xl hover:shadow-indigo-500/20 relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors"></div>
          <div className="flex justify-between items-start mb-2 md:mb-4 relative z-10">
            <div className="text-indigo-400 font-bold text-[10px] md:text-sm flex items-center gap-1 md:gap-2">
              <TrendingUp className="w-3 h-3 md:w-5 md:h-5" /> Gross Vol
            </div>
          </div>
          <div className="text-xl md:text-3xl font-black text-white mb-2 relative z-10 drop-shadow-md">₹{totalVolume.toLocaleString()}</div>
          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full w-fit flex items-center gap-1.5 relative z-10">
            <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]"></span> Live
          </div>
        </div>
        
        <div className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 hover:from-emerald-500/20 hover:to-emerald-600/10 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-emerald-500/20 hover:border-emerald-500/40 shadow-xl hover:shadow-emerald-500/20 relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors"></div>
          <div className="flex justify-between items-start mb-2 md:mb-4 relative z-10">
            <div className="text-emerald-400 font-bold text-[10px] md:text-sm flex items-center gap-1 md:gap-2">
              <DollarSign className="w-3 h-3 md:w-5 md:h-5" /> Revenue
            </div>
          </div>
          <div className="text-xl md:text-3xl font-black text-white mb-2 relative z-10 drop-shadow-md">₹{totalPlatformRevenue.toLocaleString()}</div>
          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full w-fit flex items-center gap-1.5 relative z-10">
            <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> @ 5%
          </div>
        </div>

        <div className="group bg-gradient-to-br from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 hover:to-amber-600/10 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-amber-500/20 hover:border-amber-500/40 shadow-xl hover:shadow-amber-500/20 relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-colors"></div>
          <div className="flex justify-between items-start mb-2 md:mb-4 relative z-10">
            <div className="text-amber-400 font-bold text-[10px] md:text-sm flex items-center gap-1 md:gap-2">
              <Store className="w-3 h-3 md:w-5 md:h-5" /> Sellers
            </div>
          </div>
          <div className="text-xl md:text-3xl font-black text-white mb-2 relative z-10 drop-shadow-md">{activeSellers}</div>
          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full w-fit flex items-center gap-1.5 relative z-10">
            <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span> Live
          </div>
        </div>

        <div className="group bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 hover:from-cyan-500/20 hover:to-cyan-600/10 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-cyan-500/20 hover:border-cyan-500/40 shadow-xl hover:shadow-cyan-500/20 relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/30 transition-colors"></div>
          <div className="flex justify-between items-start mb-2 md:mb-4 relative z-10">
            <div className="text-cyan-400 font-bold text-[10px] md:text-sm flex items-center gap-1 md:gap-2">
              <Users className="w-3 h-3 md:w-5 md:h-5" /> Buyers
            </div>
          </div>
          <div className="text-xl md:text-3xl font-black text-white mb-2 relative z-10 drop-shadow-md">{activeBuyers}</div>
          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full w-fit flex items-center gap-1.5 relative z-10">
            <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span> Live
          </div>
        </div>
      </div>

      <div className="relative z-10">
        
        {/* Main Feed: Recent Transactions */}
        <div className="w-full bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative min-h-[400px]">
          <div className="absolute inset-0 opacity-[0.03] z-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
          
          <div className="p-4 md:p-6 border-b border-white/5 bg-slate-900/50 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-3">
              Recent Transactions 
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> LIVE
              </span>
            </h3>
          </div>

          <div className="p-0 overflow-x-auto relative z-10 flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50 py-20 min-w-[500px]">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="font-bold text-white">Aggregating live ledgers...</div>
              </div>
            ) : metrics.recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50 py-20 min-w-[500px]">
                <Activity className="w-12 h-12 mb-4 text-slate-500" />
                <div className="font-bold text-white">Waiting for transactions</div>
                <div className="text-sm text-slate-400 mt-1 text-center px-4">New transactions will appear here in real-time as they are processed on the platform.</div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="bg-slate-900/80 sticky top-0 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                  <tr>
                    <th className="p-4 pl-4 md:pl-6">Seller</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 pr-4 md:pr-6 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {metrics.recentTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 pl-4 md:pl-6 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-indigo-500 transition-colors"></div>
                        <div className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">{tx.sellerName}</div>
                        <div className="text-[10px] mt-1 font-mono flex items-center">
                          <span className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/50">TX-{tx.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md inline-flex ${
                          tx.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          tx.type === 'DEBIT' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {tx.type}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`font-black text-sm ${
                          tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-slate-300'
                        }`}>
                          {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.grossAmount}
                        </div>
                      </td>
                      <td className="p-4 pr-4 md:pr-6 text-right text-xs font-medium text-slate-500">
                        {new Date(tx.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
