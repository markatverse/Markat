"use client";
import React, { useEffect, useState } from 'react';
import { Users, Store, Package, ShoppingBag, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import { fastFetch } from '@/utils/api';

export default function AnalyticsgtMarketplacePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        const json = await fastFetch<any>('/admin/analytics/summary', { ttlMs: 15000 });
        if (isMounted && json) {
          setData(json);
        }
      } catch (e) {
        console.error("Failed to fetch analytics", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => { isMounted = false; };
  }, []);

  const stats = [
    { title: 'Total Users', value: data?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Total Sellers', value: data?.totalSellers || 0, icon: Store, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Total Products', value: data?.totalProducts || 0, icon: Package, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Total Orders', value: data?.totalOrders || 0, icon: ShoppingBag, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { title: 'Service Queues', value: data?.totalQueues || 0, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'B2B Leads', value: data?.totalLeads || 0, icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics &gt; Marketplace</h1>
          <p className="text-slate-400 mt-2 text-sm">Real-time overview of marketplace metrics and performance.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all border border-slate-700 flex items-center gap-2">
          Refresh Data
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg hover:border-slate-600 transition-colors group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">{stat.title}</p>
                  <h3 className="text-4xl font-black text-white">{stat.value.toLocaleString()}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full w-max font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>Up-to-date</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
