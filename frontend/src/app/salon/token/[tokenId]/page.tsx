"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Clock, CheckCircle2, Loader2, RefreshCw, ArrowLeft,
  AlertCircle, Scissors, Users, Car
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface QueueToken {
  id: string;
  tokenNumber: number;
  customerName: string;
  service: string;
  status: string;
  doneAt?: string | null;
}

interface TokenData {
  token: QueueToken & { joinedAt: string };
  queue: { shopName: string; currentToken: number; avgMinutes: number; isOpen: boolean };
  ahead: number;
  serving: QueueToken | null;
  estimatedWaitMin: number;
  recentDone: QueueToken[];
  waitingTokens: QueueToken[];
  doneToday: number;
}

// Helper — time ago
function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

export default function TokenTrackerPage() {
  const params = useParams();
  const tokenId = params?.tokenId as string;
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const fetchStatus = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch(`${API}/service-queue/token/${tokenId}`);
      if (!res.ok) throw new Error("Token not found");
      setData(await res.json());
      setLastUpdated(new Date());
      setCountdown(30);
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tokenId]);

  // Auto-refresh every 30 sec + countdown
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(), 30000);
    const tick = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => { clearInterval(interval); clearInterval(tick); };
  }, [fetchStatus]);

  // ── Smart Notifications (Distance & Travel Time) ────────────────────────────────
  const [hasNotified, setHasNotified] = useState(false);
  const [queueConfig, setQueueConfig] = useState({ travelSpeedKmh: 30, notificationBufferMin: 5 });

  useEffect(() => {
    // Fetch dynamic config from admin settings
    fetch(`${API}/system-config/queue`)
      .then(res => res.json())
      .then(cfg => {
        if (cfg) setQueueConfig({ travelSpeedKmh: cfg.travelSpeedKmh || 30, notificationBufferMin: cfg.notificationBufferMin || 5 });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!data || !data.queue || hasNotified) return;
    
    // Only proceed if queue has location and user is waiting
    if (data.token.status !== 'WAITING' && data.token.status !== 'CHECKED_IN') return;
    const shopLat = (data.queue as any).latitude;
    const shopLng = (data.queue as any).longitude;
    if (!shopLat || !shopLng) return;

    const checkDistance = () => {
      if ('geolocation' in navigator && 'Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            navigator.geolocation.getCurrentPosition(position => {
              const userLat = position.coords.latitude;
              const userLng = position.coords.longitude;
              
              // Haversine formula
              const R = 6371; // km
              const dLat = (shopLat - userLat) * Math.PI / 180;
              const dLng = (shopLng - userLng) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(userLat * Math.PI / 180) * Math.cos(shopLat * Math.PI / 180) *
                        Math.sin(dLng/2) * Math.sin(dLng/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const distanceKm = R * c;
              
              // Estimate travel time
              const travelTimeMin = Math.ceil((distanceKm / queueConfig.travelSpeedKmh) * 60);
              
              // If it takes longer to travel than the wait time (with buffer), notify!
              if (travelTimeMin + queueConfig.notificationBufferMin >= data.estimatedWaitMin) {
                new Notification('Time to go! 🏃', {
                  body: `Your token #${data.token.tokenNumber} is approaching. Travel time is ~${travelTimeMin} mins, and your wait is ${data.estimatedWaitMin} mins.`,
                  icon: '/favicon.ico'
                });
                setHasNotified(true);
              }
            });
          }
        });
      }
    };
    
    checkDistance();
    const locInterval = setInterval(checkDistance, 60000); // Check every minute
    return () => clearInterval(locInterval);
  }, [data, hasNotified, queueConfig]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <p className="text-slate-500 font-bold">Loading your token…</p>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-sm w-full">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-slate-900 font-black text-xl mb-2">Token Not Found</h2>
        <p className="text-slate-500 mb-6 font-medium">{error}</p>
        <Link href="/salon/join" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold block transition-colors">Join a Queue</Link>
      </div>
    </div>
  );

  const { token, queue, ahead, serving, estimatedWaitMin, recentDone, waitingTokens, doneToday } = data;
  const isServing = token.status === "SERVING";
  const isDone    = token.status === "DONE";
  const isNoShow  = token.status === "NO_SHOW";
  const isWaiting = token.status === "WAITING";

  const isWashService = Boolean(
    token.service?.toLowerCase().includes('wash') ||
    token.service?.toLowerCase().includes('automobile') ||
    token.service?.toLowerCase().includes('vehicle') ||
    queue.shopName?.toLowerCase().includes('wash') ||
    queue.shopName?.toLowerCase().includes('automobile') ||
    queue.shopName?.toLowerCase().includes('bay')
  );

  const plateMatch = token.service?.match(/\[Plate:\s*([^\]]+)\]/i) || token.customerName?.match(/\(([^)]+)\)$/);
  const detectedPlate = plateMatch ? plateMatch[1].trim() : null;

  const waitingBefore = waitingTokens.filter(t => t.tokenNumber < token.tokenNumber);
  const waitingAfter  = waitingTokens.filter(t => t.tokenNumber > token.tokenNumber);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/salon/token/active" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold">Back</span>
            </Link>
            
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? `animate-spin ${isWashService ? 'text-cyan-700' : 'text-blue-600'}` : ''}`} />
              <button onClick={() => fetchStatus(true)} className={`transition-colors ${isWashService ? 'hover:text-cyan-700' : 'hover:text-blue-600'}`}>
                Refresh ({countdown}s)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Shop / Bay name */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full mb-3 shadow-sm">
            {isWashService ? (
              <Car className="w-4 h-4 text-cyan-700" />
            ) : (
              <Scissors className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-slate-700 font-bold text-xs sm:text-sm truncate">{queue.shopName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isWashService ? 'Automobile Wash Tracker' : 'Live Tracker'}
          </h1>
        </div>

        {/* ── Your Turn Alert ────────────────────────────────────────────── */}
        {isServing && (
          <div className="mb-6 bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-5 text-center shadow-sm">
            <div className="text-4xl mb-2 animate-bounce">🎉</div>
            <div className="text-emerald-700 font-black text-2xl">It&apos;s Your Turn!</div>
            <div className="text-emerald-600 text-sm mt-1 font-bold">
              {isWashService ? 'Please drive your vehicle directly into the wash bay lane now' : 'Please head to the service counter now'}
            </div>
          </div>
        )}

        {/* ── YOUR TOKEN CARD ────────────────────────────────────────────── */}
        <div className={`rounded-3xl p-6 sm:p-8 mb-6 border shadow-sm relative overflow-hidden bg-white ${
          isServing  ? 'border-emerald-300' :
          isDone     ? 'border-blue-200' :
          isNoShow   ? 'border-red-200' :
          isWashService ? 'border-cyan-700/25' :
                       'border-slate-200'
        }`}>
          {/* Background Accent */}
          <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 pointer-events-none rounded-bl-full ${
            isServing ? 'bg-emerald-500' : isDone ? 'bg-blue-500' : isWashService ? 'bg-cyan-500' : 'bg-slate-400'
          }`} />

          <div className="relative z-10 flex items-start justify-between mb-6">
            {/* Status pill */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border ${
              isServing ? 'bg-emerald-100 border-emerald-200 text-emerald-700' :
              isDone    ? 'bg-blue-100 border-blue-200 text-blue-700' :
              isNoShow  ? 'bg-red-100 border-red-200 text-red-700' :
              isWashService ? 'bg-cyan-50 border-cyan-200 text-cyan-800' :
                          'bg-amber-100 border-amber-200 text-amber-700'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                isServing ? 'bg-emerald-500 animate-pulse' :
                isDone    ? 'bg-blue-500' :
                isNoShow  ? 'bg-red-500' :
                isWashService ? 'bg-cyan-600 animate-pulse' :
                            'bg-amber-500 animate-pulse'
              }`} />
              {isServing ? 'NOW IN WASH BAY' : isDone ? 'COMPLETED' : isNoShow ? 'NO SHOW' : 'WAITING IN QUEUE'}
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Service</div>
              <div className={`font-black text-sm ${isWashService ? 'text-cyan-800' : 'text-slate-900'}`}>{token.service}</div>
              {detectedPlate && (
                <div className="mt-1.5 inline-flex items-center rounded border-2 border-slate-900 bg-white overflow-hidden shadow-2xs">
                  <div className="bg-[#003893] text-white px-1.5 py-0.5 text-[7px] font-black tracking-widest flex items-center gap-1 border-r border-slate-900">
                    <span className="text-[8px]">☸</span>
                    <span>IND</span>
                  </div>
                  <span className="px-2 py-0.5 font-mono font-black text-xs text-slate-950 tracking-wider">
                    {detectedPlate.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Big token number */}
          <div className="relative z-10 flex items-end gap-4 mb-6">
            <div>
              <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Your Token</div>
              <div className={`text-6xl sm:text-7xl font-black leading-none tracking-tighter ${
                isServing ? 'text-emerald-600' : isDone ? 'text-blue-600' : isWashService ? 'text-cyan-700' : 'text-slate-900'
              }`}>
                #{token.tokenNumber}
              </div>
              <div className="text-slate-500 text-sm mt-2 font-bold flex items-center gap-2">
                <Users className="w-4 h-4" /> {token.customerName}
              </div>
            </div>
          </div>

          {/* Stats — only if waiting or serving */}
          {!isDone && !isNoShow && (
            <div className="relative z-10 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 mt-2">
              {[
                { icon: <Users className="w-4 h-4" />, val: ahead, label: 'Ahead of you' },
                { icon: <Clock className="w-4 h-4" />, val: `${estimatedWaitMin}m`, label: 'Est. wait' },
                { icon: <CheckCircle2 className="w-4 h-4" />, val: doneToday, label: 'Done today' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-2xl p-3 text-center">
                  <div className="text-blue-600 flex justify-center mb-1">{s.icon}</div>
                  <div className="text-slate-900 font-black text-lg leading-none">{s.val}</div>
                  <div className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {isDone && (
            <div className="relative z-10 text-center py-4 border-t border-slate-100 mt-2">
              <CheckCircle2 className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <div className="text-blue-600 font-black text-xl">Service Complete 😊</div>
              <div className="text-slate-500 font-bold text-sm mt-1">Thank you for visiting!</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── LEFT COL: TIMELINE ──────────────────────────────────────── */}
          <div>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full">
              <h2 className="text-slate-900 font-black text-lg mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                <span>Queue Timeline</span>
                {lastUpdated && (
                  <span className="text-slate-500 text-xs font-bold">
                    Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </h2>

              <div className="space-y-2 relative">
                
                {/* Vertical line connecting timeline items */}
                <div className="absolute left-[22px] top-4 bottom-4 w-[2px] bg-slate-100 -z-10" />

                {/* ── DONE tokens ─────────────────────────────────────────── */}
                {recentDone.length > 0 && (
                  <>
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 pb-2 mt-2 bg-white inline-block">✅ Completed</div>
                    {recentDone.map(t => {
                      const isYou = t.tokenNumber === token.tokenNumber;
                      return (
                        <div key={t.id} className={`flex items-center gap-3 px-3 py-3 rounded-2xl bg-white ${isYou ? 'border-2 border-blue-200 shadow-sm' : ''}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isYou ? 'bg-blue-100' : 'bg-slate-50 border border-slate-100'}`}>
                            <CheckCircle2 className={`w-5 h-5 ${isYou ? 'text-blue-600' : 'text-slate-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-900 font-black text-sm">#{t.tokenNumber}</span>
                              {isYou && <span className="text-blue-700 text-[10px] font-black bg-blue-100 px-2 py-0.5 rounded-md">YOU</span>}
                              <span className="text-slate-500 text-xs font-bold truncate">{t.customerName}</span>
                            </div>
                            <div className="text-slate-500 font-medium text-[10px] mt-0.5">{t.service}{t.doneAt ? ` · ${timeAgo(t.doneAt)}` : ''}</div>
                          </div>
                          <div className="text-slate-400 text-[10px] font-bold shrink-0">Done</div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* ── NOW SERVING ─────────────────────────────────────────── */}
                {serving && (
                  <>
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 pb-2 pt-4 mt-2 bg-white inline-block">⏳ Now Serving</div>
                    <div className={`flex items-center gap-3 px-3 py-4 rounded-2xl border-2 bg-white shadow-sm ${
                      serving.tokenNumber === token.tokenNumber
                        ? 'border-emerald-300'
                        : 'border-slate-200'
                    }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative ${
                        serving.tokenNumber === token.tokenNumber ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        <Scissors className="w-5 h-5" />
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white animate-pulse ${
                          serving.tokenNumber === token.tokenNumber ? 'bg-emerald-500' : 'bg-blue-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-black text-sm ${serving.tokenNumber === token.tokenNumber ? 'text-emerald-700' : 'text-slate-900'}`}>#{serving.tokenNumber}</span>
                          {serving.tokenNumber === token.tokenNumber && (
                            <span className="text-emerald-700 text-[10px] font-black bg-emerald-100 px-2 py-0.5 rounded-md">YOU 🎉</span>
                          )}
                          <span className="text-slate-600 font-bold text-xs truncate">{serving.customerName}</span>
                        </div>
                        <div className={`text-[10px] font-bold mt-0.5 ${serving.tokenNumber === token.tokenNumber ? 'text-emerald-600' : 'text-blue-600'}`}>✂️ In Service Now</div>
                      </div>
                      <div className="text-slate-400 text-[10px] font-black shrink-0 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        LIVE
                      </div>
                    </div>
                  </>
                )}

                {/* ── If YOU are waiting — show your token in sequence ─────── */}
                {isWaiting && (
                  <>
                    {waitingBefore.length > 0 && <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 pb-2 pt-4 mt-2 bg-white inline-block">🧑‍🤝‍🧑 Waiting Before You</div>}
                    {waitingBefore.map((t, i) => (
                      <div key={t.id} className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white border border-slate-100">
                        <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-slate-600 text-xs font-black">#{t.tokenNumber}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-700 text-sm font-bold truncate">{t.customerName}</div>
                          <div className="text-slate-500 font-medium text-[10px] mt-0.5">{t.service} · ~{(i + 1) * queue.avgMinutes}m wait</div>
                        </div>
                        <div className="text-slate-400 text-[10px] font-bold shrink-0">Waiting</div>
                      </div>
                    ))}

                    {/* ── YOUR TOKEN (highlighted) ───────────────────────── */}
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 pb-2 pt-4 mt-2 bg-white inline-block">🎯 Your Token</div>
                    <div className="flex items-center gap-3 px-3 py-4 rounded-2xl bg-amber-50 border-2 border-amber-200 shadow-sm relative">
                      <div className="w-10 h-10 bg-amber-200 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-xs font-black">#{token.tokenNumber}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-900 font-black text-sm">#{token.tokenNumber}</span>
                          <span className="text-amber-800 text-[10px] font-black bg-amber-200 px-2 py-0.5 rounded-md">👆 YOU</span>
                        </div>
                        <div className="text-amber-700 font-bold text-[10px] mt-0.5">
                          {token.service}
                          {ahead === 0 ? ' · You\'re next!' : ` · ~${estimatedWaitMin}m wait · ${ahead} ahead`}
                        </div>
                      </div>
                      <div className="text-amber-600 text-[10px] font-black shrink-0">Your turn</div>
                    </div>

                    {/* Tokens waiting after you (dimmed) */}
                    {waitingAfter.length > 0 && <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 pb-2 pt-4 mt-2 bg-white inline-block">🚶 Waiting After You</div>}
                    {waitingAfter.slice(0, 3).map(t => (
                      <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-xl opacity-50 bg-white">
                        <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-slate-500 text-xs font-bold">#{t.tokenNumber}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-600 text-xs font-bold truncate">{t.customerName}</div>
                        </div>
                      </div>
                    ))}
                    {waitingAfter.length > 3 && (
                      <div className="text-center text-slate-500 font-bold text-xs py-2 bg-slate-50 rounded-xl mt-2">
                        +{waitingAfter.length - 3} more in queue after you
                      </div>
                    )}
                  </>
                )}

                {/* Empty queue state */}
                {!serving && recentDone.length === 0 && waitingTokens.length === 0 && (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-4xl mb-3">🎉</div>
                    <div className="text-slate-500 font-bold">Queue is empty</div>
                  </div>
                )}
              </div>
            </div>
          </div> {/* End of left col timeline */}

          {/* ── RIGHT COL: ACTIONS ──────────────────────────────────────── */}
          <div className="flex flex-col">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-slate-900 font-black text-lg mb-5 border-b border-slate-100 pb-4">Quick Actions</h3>
              
              {/* ── Bottom action strip ────────────────────────────────────────── */}
              <div className="flex flex-col gap-3 mb-6">
                <Link href="/salon/token/active"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-sm">
                  🎟️ My Tokens Dashboard
                </Link>
              </div>

              {/* Auto-refresh note */}
              {isWaiting && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-center">
                  <p className="text-blue-700 text-xs font-bold flex flex-col items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Auto-refreshes every 30s. Come back in <strong className="text-blue-800">{estimatedWaitMin} min</strong>.</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div> {/* End of two column layout */}

      </div>
    </div>
  );
}
