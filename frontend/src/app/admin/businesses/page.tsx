"use client";
import React, { useState, useEffect } from 'react';
import { Search, Store } from 'lucide-react';
import { fastFetch } from '@/utils/api';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchBusinesses = async () => {
      try {
        const data = await fastFetch<any[]>('/admin/businesses', { ttlMs: 15000 });
        if (isMounted && Array.isArray(data)) {
          setBusinesses(data);
        }
      } catch (err) {
        console.error('Failed to fetch businesses:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBusinesses();
    return () => { isMounted = false; };
  }, []);

  const filteredBusinesses = businesses.filter(b =>
    b.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight capitalize">Businesses Management</h1>
          <p className="text-slate-400 mt-2 text-sm">Manage and configure businesses across the platform.</p>
        </div>
      </header>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 w-full text-sm transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 pl-6">Business</th>
                <th className="p-4">Owner / Contact</th>
                <th className="p-4">Type & Sector</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Loading businesses...</td>
                </tr>
              ) : filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No businesses found matching your criteria.</td>
                </tr>
              ) : filteredBusinesses.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-700/30 transition-all group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{b.businessName}</div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">{b.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-300 text-sm">{b.user?.name || 'N/A'}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{b.userId}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{b.user?.email || b.user?.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-300">{b.mainType}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{b.sellerRole} &bull; {b.businessSector}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${b.subscriptionStatus === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                      {b.subscriptionStatus || 'INACTIVE'}
                    </span>
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
