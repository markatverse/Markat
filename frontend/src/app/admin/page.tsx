"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Activity, Users, Store, TrendingUp, DollarSign,
  AlertTriangle, ArrowRight, PhoneCall, ShieldCheck, User,
  Sparkles, ShoppingBag, Layers
} from 'lucide-react';
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
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
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

    const fetchPendingSellers = async () => {
      try {
        const res = await fetch(`${API_URL}/sellers`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const pending = data.filter((s: any) => 
              s.verificationStatus === 'PENDING' || !s.verified || s.kycCallStatus === 'PENDING'
            );
            setPendingSellers(pending);
          }
        }
      } catch (err) {
        console.error("Failed to fetch pending sellers", err);
      }
    };

    fetchGlobalData();
    fetchPendingSellers();
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

      {/* Pending KYC & Approvals Alert Queue */}
      {pendingSellers.length > 0 && (
        <section className="mb-10 relative z-10 animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-slate-900 border border-amber-500/30 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">KYC Verification & Onboarding Action Queue</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 font-bold">
                      {pendingSellers.length} Pending
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sellers awaiting telephone verification call and store activation approval.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/businesses/sellers"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0 self-start sm:self-auto"
              >
                Open Full Onboarding Queue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {pendingSellers.slice(0, 6).map((seller) => (
                <div
                  key={seller.id}
                  className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/70 hover:border-amber-500/40 rounded-2xl p-4 transition-all flex flex-col justify-between gap-3 shadow-sm group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors line-clamp-1">
                        {seller.name}
                      </div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        {seller.kycCallStatus || 'Call Pending'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                      <User className="w-3 h-3 text-slate-500" /> {seller.ownerName || 'Store Owner'}
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                      <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                        GST: {seller.gstNumber ? `${seller.gstNumber.slice(0, 7)}...` : 'Exempt'}
                      </span>
                      <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                        PAN: {seller.panNumber || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                    {seller.phone && !seller.phone.startsWith('missing-phone') ? (
                      <a
                        href={`tel:${seller.phone}`}
                        className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" /> Call Seller
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">No phone</span>
                    )}

                    <Link
                      href="/admin/businesses/sellers"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Review & Approve
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Executive Platform Hub */}
      <section className="mb-10 relative z-10">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" /> Platform Management Hub
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Link
            href="/admin/users/sellers"
            className="group bg-slate-900/60 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/40 p-4 rounded-2xl transition-all shadow-md flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Sellers & Stores</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Manage merchants, KYC profiles & store status</p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-indigo-400 flex items-center gap-1">
              View Sellers →
            </div>
          </Link>

          <Link
            href="/admin/users/customers"
            className="group bg-slate-900/60 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/40 p-4 rounded-2xl transition-all shadow-md flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Customer Base</div>
              <p className="text-[11px] text-slate-400 mt-0.5">View buyers, order history & account profiles</p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-cyan-400 flex items-center gap-1">
              View Customers →
            </div>
          </Link>

          <Link
            href="/admin/marketplace/categories"
            className="group bg-slate-900/60 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl transition-all shadow-md flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Taxonomies & Relations</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Category hierarchy, emojis & business workflows</p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              Manage Categories →
            </div>
          </Link>

          <Link
            href="/admin/transactions/orders"
            className="group bg-slate-900/60 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl transition-all shadow-md flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Orders & Escrow</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Track live settlements, commissions & receipts</p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-amber-400 flex items-center gap-1">
              View Orders →
            </div>
          </Link>
        </div>
      </section>

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
