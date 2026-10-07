"use client";

import React, { useState, useEffect } from 'react';
import { useAdminRole } from '@/context/AdminRoleContext';
import { ShieldAlert, Search, CalendarClock, Clock, Activity, Power, PowerOff } from 'lucide-react';

export default function AdminBookingsPage() {
  const { canEdit } = useAdminRole();
  const hasEditPermission = canEdit('transactions');
  const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/service-queue/queues`)
      .then(res => res.json())
      .then(data => {
        setQueues(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleToggleStatus = async (queueId: string, currentStatus: boolean) => {
    if (!hasEditPermission) return;
    try {
      const res = await fetch(`${API_URL}/service-queue/${queueId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: !currentStatus })
      });
      if (res.ok) {
        setQueues(queues.map(q => q.id === queueId ? { ...q, isOpen: !currentStatus } : q));
      } else {
        alert("Failed to update queue status");
      }
    } catch {
      alert("Error updating queue");
    }
  };

  const filteredQueues = queues.filter(q => 
    q.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.sellerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full relative">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Service Queues & Bookings</h1>
          <p className="text-slate-400 mt-2 text-sm">Monitor live service queues, current load, and manage queue availability across the platform.</p>
        </div>
      </header>

      {!hasEditPermission && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-8">
          <ShieldAlert className="w-5 h-5" />
          <p className="text-sm font-medium">You do not have permission to modify service queue statuses.</p>
        </div>
      )}

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by shop or seller ID..." 
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
                <th className="p-4 pl-6">Service Point</th>
                <th className="p-4">Metrics</th>
                <th className="p-4">Current Load</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse">
                    Loading live queues...
                  </td>
                </tr>
              ) : filteredQueues.map((queue) => (
                <tr key={queue.id} className="hover:bg-slate-700/30 transition-all group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                        <CalendarClock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{queue.shopName || 'Unknown Shop'}</div>
                        <div className="text-[10px] mt-1 font-mono flex items-center">
                          <span className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/50">USR-{queue.seller?.markatId || queue.sellerId?.slice(0, 5)?.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        ~{queue.avgMinutes} min avg
                      </div>
                      <div className="font-mono text-emerald-400">
                        ₹{queue.pricePerHour}/hr
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${queue.currentTokens > 5 ? 'text-rose-400' : 'text-emerald-400'}`} />
                      <span className="font-bold text-white">{queue.currentTokens || 0}</span>
                      <span className="text-xs text-slate-500">waiting</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      queue.isOpen 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {queue.isOpen ? 'Accepting Tokens' : 'Closed'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {hasEditPermission && (
                      <button 
                        onClick={() => handleToggleStatus(queue.id, queue.isOpen)}
                        className={`p-2 rounded-lg transition-colors border flex items-center gap-2 ml-auto ${
                          queue.isOpen 
                            ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10' 
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                        title={queue.isOpen ? 'Close Queue' : 'Open Queue'}
                      >
                        {queue.isOpen ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        <span className="text-[10px] font-black uppercase">{queue.isOpen ? 'Force Close' : 'Open'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filteredQueues.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No active service queues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
