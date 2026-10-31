"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TrendingUp, DollarSign, Users, Activity, CalendarDays, RefreshCcw, ShieldCheck } from 'lucide-react';
import { useAdminRole } from '@/context/AdminRoleContext';
import { fastFetch } from '@/utils/api';

export default function AnalyticsPage() {
  const { allUsers } = useAuth();
  const { currentAdminRole, canEdit } = useAdminRole();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        const json = await fastFetch('/admin/analytics', { ttlMs: 15000 });
        if (isMounted && json) {
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load analytics", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchAnalytics();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="font-bold text-white">Aggregating Economic Engine Data...</div>
      </div>
    );
  }

  const gmv = data?.gmv || 0;
  const commission = data?.commission || 0;
  const bookings = data?.bookings || 0;
  const retention = data?.retentionRate || '0%';

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-300 pb-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Economic Engine</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Phase 2: GMV, Commissions, Bookings, and Retention Tracking.</p>
        </div>
      </header>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        
        {/* GMV */}
        <div className="group bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 hover:from-indigo-500/20 hover:to-indigo-600/10 p-6 rounded-3xl border border-indigo-500/20 hover:border-indigo-500/40 shadow-xl relative overflow-hidden transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="text-indigo-400 font-bold text-sm flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Gross Merchandise Value
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-2">₹{gmv.toLocaleString()}</div>
          <div className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full w-fit">Total Value Processed</div>
        </div>
        
        {/* Commission */}
        <div className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 hover:from-emerald-500/20 hover:to-emerald-600/10 p-6 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/40 shadow-xl relative overflow-hidden transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Platform Revenue (Commission)
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-2">₹{commission.toLocaleString()}</div>
          <div className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full w-fit">Realized Earnings</div>
        </div>

        {/* Bookings / Transactions */}
        <div className="group bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 hover:from-cyan-500/20 hover:to-cyan-600/10 p-6 rounded-3xl border border-cyan-500/20 hover:border-cyan-500/40 shadow-xl relative overflow-hidden transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="text-cyan-400 font-bold text-sm flex items-center gap-2">
              <CalendarDays className="w-5 h-5" /> Total Bookings & Orders
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-2">{bookings.toLocaleString()}</div>
          <div className="text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full w-fit">Completed Engagements</div>
        </div>

        {/* Retention */}
        <div className="group bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-600/5 hover:from-fuchsia-500/20 hover:to-fuchsia-600/10 p-6 rounded-3xl border border-fuchsia-500/20 hover:border-fuchsia-500/40 shadow-xl relative overflow-hidden transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-fuchsia-500/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="text-fuchsia-400 font-bold text-sm flex items-center gap-2">
              <RefreshCcw className="w-5 h-5" /> Customer Retention
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-2">{retention}</div>
          <div className="text-[10px] font-black uppercase tracking-wider bg-fuchsia-500/20 text-fuchsia-400 px-2 py-1 rounded-full w-fit">Repeat Customers</div>
        </div>

      </div>

      {/* Detailed Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        
        {/* Economic Funnel */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">Phase 2 Economic Engine</h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 shrink-0"><Users className="w-5 h-5"/></div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">Customer Acquisition</div>
                <div className="text-xs text-slate-400">Total Users: {data?.totalUsers || 0}</div>
              </div>
            </div>

            <div className="flex justify-center"><Activity className="w-5 h-5 text-slate-600" /></div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 shrink-0"><CalendarDays className="w-5 h-5"/></div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">Bookings / Orders</div>
                <div className="text-xs text-slate-400">Total Engagements: {bookings}</div>
              </div>
            </div>

            <div className="flex justify-center"><Activity className="w-5 h-5 text-slate-600" /></div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0"><DollarSign className="w-5 h-5"/></div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">GMV & Commission Engine</div>
                <div className="text-xs text-slate-400">GMV: ₹{gmv.toLocaleString()} | Revenue: ₹{commission.toLocaleString()}</div>
              </div>
            </div>

          </div>
        </div>

        {/* Growth Diagnostics */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Growth Diagnostics</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-slate-300">Repeat Bookings Target</span>
                <span className="text-emerald-400 font-bold">In Progress</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[60%]"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-slate-300">Seller Retention Score</span>
                <span className="text-blue-400 font-bold">Excellent</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[85%]"></div>
              </div>
            </div>
            
            <div className="mt-8 bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
              <div className="flex gap-3 text-amber-400">
                <ShieldCheck className="w-6 h-6 shrink-0" />
                <div className="text-sm">
                  <span className="font-bold block mb-1">Phase 2 Objective Active</span>
                  The economic engine requires active transactions. Focus on enabling the customer booking and cart checkout flow to generate real GMV and Commissions!
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
