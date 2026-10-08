"use client";
import React, { useEffect, useState } from 'react';
import { Clock, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface LiveBookingWidgetProps {
  compact?: boolean;
  onClose?: () => void;
}

export default function LiveBookingWidget({ compact = false, onClose }: LiveBookingWidgetProps) {
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initial read
  useEffect(() => {
    const id = localStorage.getItem('markatverse_active_token_id');
    if (id && id !== 'undefined' && id !== 'null') {
      setTokenId(id);
    } else {
      localStorage.removeItem('markatverse_active_token_id');
      setLoading(false);
    }
    
    // Listen for storage events in case joined in another tab
    const handleStorage = () => {
      const newId = localStorage.getItem('markatverse_active_token_id');
      if (newId !== tokenId) {
        setTokenId(newId);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [tokenId]);

  // Poll for updates
  useEffect(() => {
    if (!tokenId) return;
    
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API}/service-queue/token/${tokenId}`);
        if (!res.ok) {
          localStorage.removeItem('markatverse_active_token_id');
          setTokenId(null);
          return;
        }
        const json = await res.json();
        
        if (json.token.status === 'DONE' || json.token.status === 'NO_SHOW') {
          localStorage.removeItem('markatverse_active_token_id');
          setTokenId(null);
        } else {
          setData(json);
        }
      } catch (err: any) {
        // Use warn to prevent Next.js from throwing the red error overlay during dev if backend is offline
        console.warn("Failed to fetch token status:", err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // 15 sec poll
    return () => clearInterval(interval);
  }, [tokenId]);

  if (loading) return null;
  if (!tokenId || !data) return null;

  const { token, ahead, estimatedWaitMin, queue } = data;

  if (compact) {
    return (
      <div className="w-[300px] bg-white border border-slate-200 rounded-2xl p-4 shadow-xl flex flex-col gap-3 relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Queue</span>
          </div>
          <div className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
            #{token.tokenNumber}
          </div>
        </div>
        <div>
          <div className="font-bold text-slate-900 text-sm truncate" title={queue?.shopName}>{queue?.shopName || 'Shop'}</div>
          <div className="text-sm font-bold text-blue-600 mt-1">
            {ahead === 0 ? "🎉 You're next!" : `${ahead} people ahead`}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" /> ~{estimatedWaitMin} min wait
          </div>
        </div>
        <Link 
          href={`/salon/token/${token.id}`} 
          onClick={onClose}
          className="mt-1 w-full bg-[#0d0d14] hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl text-center transition-colors shadow-md"
        >
          Track Live Status
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-3 sm:p-5 text-white shadow-xl relative overflow-hidden w-full group animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_80%,_white_1px,_transparent_1px)]" style={{backgroundSize:'30px 30px'}} />
      <div className="relative z-10 flex flex-row justify-between items-center gap-2 sm:gap-4">
        
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30 text-lg sm:text-2xl font-black shadow-sm group-hover:scale-105 transition-transform shrink-0">
            {token.bookingMode === 'APPOINTMENT' ? 'Apt' : `#${token.tokenNumber}`}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-purple-200 font-bold uppercase tracking-widest hidden sm:inline">Live Queue • {queue?.shopName}</span>
              <span className="text-[10px] text-purple-200 font-bold uppercase tracking-widest sm:hidden">Live • {queue?.shopName}</span>
            </div>
            <div className="text-sm sm:text-lg font-bold flex items-center gap-2 leading-tight">
              {ahead === 0 ? "🎉 You're next in line!" : `${ahead} people ahead of you`}
            </div>
            <div className="text-xs text-white/80 mt-1 flex items-center gap-1 font-medium bg-black/20 w-fit px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" /> Estimated wait: ~{estimatedWaitMin} min
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link href={`/salon/token/${token.id}`} className="bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-bold px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-2 border border-white/20 backdrop-blur shadow-lg whitespace-nowrap">
            <span className="hidden sm:inline">Track Live</span>
            <span className="sm:hidden">Track</span> <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
          <button 
            onClick={() => {
              localStorage.removeItem('markatverse_active_token_id');
              setTokenId(null);
            }}
            className="p-2.5 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
