"use client";

import React, { useState } from 'react';
import { useAdminRole } from '@/context/AdminRoleContext';
import { ShieldAlert, Search, Ticket, User, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function AdminTokensPage() {
  const { canEdit } = useAdminRole();
  const hasSupportPermission = canEdit('support') || canEdit('transactions'); // Support or Super Admins
  const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

  const [tokenId, setTokenId] = useState('');
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId.trim()) return;

    setLoading(true);
    setError('');
    setTokenData(null);

    try {
      const res = await fetch(`${API_URL}/service-queue/token/${tokenId.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setTokenData(data);
      } else {
        setError("Token not found or invalid.");
      }
    } catch {
      setError("Failed to fetch token data from the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!hasSupportPermission || !tokenData) return;
    
    if (!confirm(`Are you sure you want to mark this token as ${action}?`)) return;

    try {
      const res = await fetch(`${API_URL}/service-queue/token/${tokenData.id}/${action}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        alert(`Token marked as ${action}`);
        // Refresh token data
        const updated = await fetch(`${API_URL}/service-queue/token/${tokenData.id}`);
        setTokenData(await updated.json());
      } else {
        alert(`Failed to execute ${action}`);
      }
    } catch {
      alert("Network error.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300 w-full relative">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Token Lookup & Override</h1>
        <p className="text-slate-400 mt-2 text-sm">Customer Support tool to lookup live queue tokens, override statuses, or handle disputes.</p>
      </header>

      {!hasSupportPermission && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-8">
          <ShieldAlert className="w-5 h-5" />
          <p className="text-sm font-medium">You do not have permission to override token statuses.</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Enter Customer Token ID (e.g. tk_...)" 
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 text-base transition-colors" 
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !tokenId.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Lookup Token'}
          </button>
        </form>
        {error && (
          <div className="mt-4 text-rose-400 text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Token Result */}
      {tokenData && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white font-mono">#{tokenData.tokenNumber}</h3>
                <div className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">{tokenData.id}</div>
              </div>
            </div>
            
            <div className={`px-4 py-2 rounded-lg font-black uppercase tracking-wider text-sm border ${
              tokenData.status === 'WAITING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
              tokenData.status === 'SERVING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
              tokenData.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {tokenData.status}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Customer</div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <User className="w-4 h-4 text-slate-400" />
                  {tokenData.customerName}
                  {tokenData.phone && <span className="text-slate-500 text-sm">({tokenData.phone})</span>}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Service Queue</div>
                <div className="text-slate-300 font-mono text-sm">{tokenData.queueId}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Timing</div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Generated: {new Date(tokenData.createdAt).toLocaleTimeString()}
                </div>
                {tokenData.appointmentTime && (
                  <div className="flex items-center gap-2 text-amber-400 font-medium mt-1">
                    <Clock className="w-4 h-4" />
                    Appt: {new Date(tokenData.appointmentTime).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin Overrides */}
          {hasSupportPermission && tokenData.status !== 'DONE' && tokenData.status !== 'NO_SHOW' && tokenData.status !== 'ABSENT' && (
            <div className="p-6 bg-slate-900/50 border-t border-slate-700">
              <h4 className="text-sm font-bold text-white mb-4">Support Admin Overrides</h4>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => handleAction('done')}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Mark as Done
                </button>
                <button 
                  onClick={() => handleAction('no-show')}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Mark as No-Show
                </button>
                <button 
                  onClick={() => handleAction('absent')}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" /> Mark as Absent (Skip)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
