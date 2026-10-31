"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Ticket, Users, PlusCircle, RefreshCw, Volume2, VolumeX,
  Maximize2, Clock, CheckCircle2, AlertCircle, Play, Check,
  Phone, Search, ChevronRight, X, Sparkles, Scissors, Car,
  Stethoscope, Utensils, Building2, Flame, ShieldCheck, UserCheck,
  Radio, ArrowRight, QrCode, AlertTriangle
} from 'lucide-react';
import SellerDirectUpiModal from '@/components/seller/SellerDirectUpiModal';

interface SellerQueueTabProps {
  queueData: any;
  isQueueLoading: boolean;
  availableQueues: any[];
  selectedQueueId: string | null;
  activeVertical: string;
  actionLoading: string | null;
  onFetchQueue: (forceId?: string) => Promise<void>;
  onQueueAction: (actionId: string, endpoint: string, method?: string, body?: any) => Promise<void>;
  onOpenWalkIn: () => void;
  onOpenStaffModal: () => void;
  sellerId?: string;
}

// Web Audio API Chime Synthesizer (Works 100% offline with zero assets)
function playQueueChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Notes: C5 -> E5 -> G5 (Pleasant high-credibility airport / service desk chime)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      
      gain.gain.setValueAtTime(0.001, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.14 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.55);
    });
  } catch (e) {
    console.warn('Audio chime failed', e);
  }
}

// Speech Vocal Announcer
function announceToken(tokenNum: string | number, name?: string) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = name 
      ? `Token number ${tokenNum}. ${name}, please proceed.`
      : `Token number ${tokenNum}, please proceed.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis failed', e);
  }
}

export default function SellerQueueTab({
  queueData,
  isQueueLoading,
  availableQueues,
  selectedQueueId,
  activeVertical,
  actionLoading,
  onFetchQueue,
  onQueueAction,
  onOpenWalkIn,
  onOpenStaffModal,
  sellerId,
}: SellerQueueTabProps) {
  // Direct UPI & Barcode Setup Modal
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Sound announcement toggle
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Search query & filter tab
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'APPOINTMENTS' | 'WALKINS' | 'ABSENT'>('ALL');
  
  // Fullscreen TV Lounge Kiosk Display Modal
  const [showKioskModal, setShowKioskModal] = useState(false);

  // Live timer for currently serving client
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const servingToken = queueData?.serving?.[0] || null;

  useEffect(() => {
    if (!servingToken) {
      setElapsedSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [servingToken?.id]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Keyboard shortcut: Spacebar to call next when on queue tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body && !e.repeat) {
        if (!queueData?.resources || queueData.resources.length === 0) {
          e.preventDefault();
          triggerCallNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queueData]);

  // Contextual Terminology
  const terms = useMemo(() => {
    if (activeVertical === 'AUTOWASH') {
      return {
        unit: 'Wash Bay',
        item: 'Vehicle',
        verb: 'Washing',
        standby: 'Bay currently vacant & ready for next vehicle',
        emptyQueue: 'No vehicles waiting in line.',
        icon: Car
      };
    }
    if (activeVertical === 'SALON') {
      return {
        unit: 'Styling Station',
        item: 'Client',
        verb: 'Serving',
        standby: 'Styling chair is ready for next client',
        emptyQueue: 'No clients waiting in line.',
        icon: Scissors
      };
    }
    if (activeVertical === 'DOCTOR') {
      return {
        unit: 'Consultation Room',
        item: 'Patient',
        verb: 'Consulting',
        standby: 'Chamber is ready for next patient',
        emptyQueue: 'No patients in waiting room.',
        icon: Stethoscope
      };
    }
    if (activeVertical === 'FOOD') {
      return {
        unit: 'Dining Table',
        item: 'Guest Party',
        verb: 'Seated',
        standby: 'Table is sanitized & ready for seating',
        emptyQueue: 'No waiting guest parties.',
        icon: Utensils
      };
    }
    return {
      unit: 'Service Counter',
      item: 'Client',
      verb: 'Serving',
      standby: 'Counter is open and ready for next client',
      emptyQueue: 'Queue is currently empty.',
      icon: Ticket
    };
  }, [activeVertical]);

  // Call Next Handler with Sound Alert
  const triggerCallNext = async (resourceId?: string) => {
    if (!queueData?.queue?.id) return;
    
    // Play chime first
    if (soundEnabled) {
      playQueueChime();
    }

    if (resourceId) {
      await onQueueAction(`next-${resourceId}`, `/service-queue/${queueData.queue.id}/next`, 'POST', { resourceId });
    } else {
      await onQueueAction('next-global', `/service-queue/${queueData.queue.id}/next`, 'POST');
    }

    // Announce next token when resolved
    if (soundEnabled && queueData?.waiting?.[0]) {
      const nextToken = queueData.waiting[0];
      setTimeout(() => {
        announceToken(nextToken.tokenNumber || 'Next', nextToken.customerName);
      }, 500);
    }
  };

  // Filter & Search waiting list
  const waitingTokens = useMemo(() => {
    const list: any[] = queueData?.waiting || [];
    return list.filter(t => {
      // Filter tab
      if (activeFilter === 'APPOINTMENTS' && t.bookingMode !== 'APPOINTMENT') return false;
      if (activeFilter === 'WALKINS' && t.bookingMode === 'APPOINTMENT') return false;
      if (activeFilter === 'ABSENT' && t.status !== 'ABSENT') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (t.customerName || '').toLowerCase().includes(q);
        const matchPhone = (t.phone || '').includes(q);
        const matchToken = String(t.tokenNumber || '').includes(q);
        const matchService = (t.service || '').toLowerCase().includes(q);
        return matchName || matchPhone || matchToken || matchService;
      }
      return true;
    });
  }, [queueData?.waiting, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    const list: any[] = queueData?.waiting || [];
    return {
      all: list.length,
      appointments: list.filter(t => t.bookingMode === 'APPOINTMENT').length,
      walkins: list.filter(t => t.bookingMode !== 'APPOINTMENT').length,
      absent: list.filter(t => t.status === 'ABSENT').length
    };
  }, [queueData?.waiting]);

  // Extract HSRP vehicle plate if available
  const extractPlate = (token: any) => {
    if (!token) return '';
    return (token.service || '').match(/\[Plate:\s*([^\]]+)\]/i)?.[1] ||
      (token.customerName || '').match(/\(([^)]+)\)$/)?.[1] || '';
  };

  const cleanName = (token: any) => {
    if (!token) return '';
    const plate = extractPlate(token);
    return plate ? token.customerName.replace(/\s*\([^)]*\)\s*$/, '') : token.customerName;
  };

  const avgMin = queueData?.queue?.avgMinutes || 15;
  const estWaitNext = counts.all > 0 ? `~${counts.all * avgMin}m` : '0m';

  return (
    <div className="max-w-6xl mx-auto space-y-3.5 animate-in fade-in duration-300">

      {/* Commission Suspension Warning Alert Banner */}
      {(queueData?.queue?.commissionSuspended || queueData?.queue?.status === 'SUSPENDED') && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-red-950 shadow-md ring-2 ring-red-400/20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm sm:text-base leading-tight text-red-900">
                Services Suspended (Commission Threshold Reached)
              </h4>
              <p className="text-xs text-red-700/90 mt-0.5 leading-relaxed">
                Customer bookings &amp; digital tokens are paused because platform commission dues exceeded your limit. Settle dues to resume live operations immediately.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowUpiModal(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-red-600/30 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Settle &amp; Resume Services</span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & LIVE COMMAND CONTROLLER (COMPACT)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 sm:p-4 transition-all">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shadow-2xs shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                    Queue & Token Command Center
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Active</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Real-time walk-in dispatching & counter operations.
                </p>
              </div>
            </div>

            {/* Multi-Branch Selector if available */}
            {availableQueues.length > 1 && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5">
                <span className="text-[11px] font-bold text-slate-600">Active Counter:</span>
                <select 
                  className="bg-transparent border-none text-[11px] font-extrabold text-slate-900 outline-none cursor-pointer"
                  value={selectedQueueId || ''} 
                  onChange={(e) => onFetchQueue(e.target.value)}
                >
                  {availableQueues.map(q => (
                    <option key={q.id} value={q.id}>{q.shopName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full lg:w-auto">
            {/* Audio Announcement Switcher */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playQueueChime();
              }}
              title={soundEnabled ? 'Chime & Voice Alert Active' : 'Sound Muted'}
              className={`py-1.5 px-2.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all shadow-2xs ${
                soundEnabled
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'Sound ON' : 'Muted'}</span>
            </button>

            {/* Waiting Lounge TV Kiosk Display */}
            <button
              type="button"
              onClick={() => setShowKioskModal(true)}
              className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1 transition-all shadow-2xs"
              title="Open Fullscreen TV Kiosk Display"
            >
              <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>TV Screen</span>
            </button>

            {/* Manage Staff & Bays */}
            <button
              onClick={onOpenStaffModal}
              className="py-1.5 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Staff & Stations</span>
            </button>

            {/* Direct UPI & Shop QR Barcode Settings */}
            <button
              type="button"
              onClick={() => setShowUpiModal(true)}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                queueData?.queue?.commissionSuspended
                  ? 'bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 ring-2 ring-red-400/40 animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
              title="Configure Seller UPI ID & Shop Standee QR Barcode"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct UPI &amp; QR</span>
              {queueData?.queue?.commissionSuspended && (
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              )}
            </button>

            {/* Add Walk-in */}
            <button
              onClick={onOpenWalkIn}
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all shadow-sm active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Walk-in</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => onFetchQueue()}
              disabled={isQueueLoading}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all disabled:opacity-50"
              title="Refresh queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isQueueLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. ADVANCED METRIC STRIP (4 COMPACT METRIC CARDS)
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-slate-100">
          {/* 1. Waiting in Queue */}
          <div className="bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200/70 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Waiting</span>
              <div className="text-lg font-black text-slate-900 leading-none mt-0.5">
                {counts.all}
              </div>
            </div>
          </div>

          {/* 2. Serving Status */}
          <div className="bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200/70 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Now Serving</span>
              <div className="text-lg font-black text-slate-900 leading-none mt-0.5">
                {servingToken ? `#${servingToken.tokenNumber}` : 'Standby'}
              </div>
            </div>
          </div>

          {/* 3. Est. Next Wait */}
          <div className="bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200/70 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Est. Wait</span>
              <div className="text-lg font-black text-slate-900 leading-none mt-0.5">
                {estWaitNext}
              </div>
            </div>
          </div>

          {/* 4. Done Today */}
          <div className="bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200/70 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Done Today</span>
              <div className="text-lg font-black text-slate-900 leading-none mt-0.5">
                {queueData?.doneToday ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SPOTLIGHT CONSOLE: NOW SERVING (COMPACT EXECUTIVE)
      ───────────────────────────────────────────────────────────── */}
      {queueData?.resources && queueData.resources.length > 0 ? (
        /* Multi-Station / Multi-Bay Grid when multiple resources exist */
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Station & Bay Dispatcher</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                {queueData.resources.length} {terms.unit}s
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {queueData.resources.map((resource: any) => {
              const servingList = Array.isArray(queueData.serving) ? queueData.serving : [];
              const tokenAtRes = servingList.find((s: any) => s.resourceId === resource.id);
              const plate = extractPlate(tokenAtRes);
              const nameClean = cleanName(tokenAtRes);

              return (
                <div 
                  key={resource.id} 
                  className="bg-slate-900 text-white rounded-xl p-3 shadow-md border border-slate-800 flex flex-col justify-between relative overflow-hidden transition-all hover:border-slate-700"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-amber-400 to-sky-400" />
                  
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <terms.icon className="w-3 h-3" />
                        <span>{resource.name}</span>
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                        tokenAtRes ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {tokenAtRes ? 'In Service' : 'Vacant'}
                      </span>
                    </div>

                    {tokenAtRes ? (
                      <div className="my-2 text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Active Token</span>
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-amber-200 mt-0.5">
                          {tokenAtRes.bookingMode === 'APPOINTMENT' ? 'Apt' : `#${tokenAtRes.tokenNumber}`}
                        </div>

                        {plate && (
                          <div className="my-1 inline-flex items-center h-5 bg-white border border-slate-900 rounded-[3px] shadow-2xs overflow-hidden px-1">
                            <span className="text-[7px] text-[#003893] pr-1 border-r border-slate-300 font-black">IND</span>
                            <span className="font-mono font-black text-[10px] text-slate-900 tracking-wider pl-1 uppercase">
                              {plate}
                            </span>
                          </div>
                        )}

                        <div className="text-xs font-extrabold text-white mt-1 truncate">{nameClean || tokenAtRes.customerName}</div>
                        <div className="text-[11px] text-indigo-300 font-medium truncate">{tokenAtRes.service}</div>
                      </div>
                    ) : (
                      <div className="py-3 text-center">
                        <span className="text-xs text-slate-400 font-medium">Station is vacant</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    {tokenAtRes ? (
                      <div className="flex gap-1.5">
                        <button
                          disabled={actionLoading === `done-${tokenAtRes.id}`}
                          onClick={() => onQueueAction(`done-${tokenAtRes.id}`, `/service-queue/token/${tokenAtRes.id}/done`, 'PATCH')}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3 h-3" /> Complete
                        </button>
                        <button
                          disabled={actionLoading === `next-${resource.id}`}
                          onClick={() => triggerCallNext(resource.id)}
                          className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all"
                        >
                          Next
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={actionLoading === `next-${resource.id}`}
                        onClick={() => triggerCallNext(resource.id)}
                        className="w-full py-1.5 bg-slate-800 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border border-slate-700 hover:border-indigo-500"
                      >
                        <Play className="w-3 h-3 fill-current" /> Call Next
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Single Main Counter Spotlight Card (Compact Reduced-Size) */
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-xl p-3 sm:p-4 shadow-md border border-slate-800 relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400" />
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Subheader */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                {servingToken ? `⚡ ACTIVE • NOW ${terms.verb.toUpperCase()}` : `⚡ STANDBY • READY FOR NEXT CLIENT`}
              </span>
            </div>

            {servingToken && (
              <div className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold text-slate-200 border border-white/10">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Elapsed: {formatElapsed(elapsedSeconds)}</span>
              </div>
            )}
          </div>

          {/* Main Serving Centerpiece */}
          <div className="mt-2.5 relative z-10">
            {servingToken ? (
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 text-center md:text-left">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Token</span>
                    <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-amber-200 leading-none mt-0.5">
                      {servingToken.bookingMode === 'APPOINTMENT' ? 'Apt' : `#${servingToken.tokenNumber}`}
                    </div>
                    <div className="mt-1 text-[11px] font-bold text-emerald-400 flex items-center justify-center md:justify-start gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Serving at Counter</span>
                    </div>
                  </div>
                  <div className="h-12 w-px bg-white/10 hidden md:block" />
                </div>

                {/* Customer Details Box */}
                <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3 backdrop-blur-md">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                        {cleanName(servingToken) || servingToken.customerName}
                      </h4>
                      <p className="text-xs text-indigo-300 font-semibold mt-0.5">
                        {servingToken.service}
                      </p>
                    </div>

                    {servingToken.price > 0 && (
                      <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                        ₹{servingToken.price}
                      </span>
                    )}
                  </div>

                  {/* Vehicle Plate if Car Wash */}
                  {extractPlate(servingToken) && (
                    <div className="mt-1.5 inline-flex items-center h-5.5 bg-white border border-slate-900 rounded-[3px] shadow-2xs overflow-hidden px-1.5">
                      <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300">
                        <span className="text-[7px] text-[#003893]">☸</span>
                        <span className="text-[7px] font-black tracking-tighter text-[#003893]">IND</span>
                      </div>
                      <span className="font-mono font-black text-[11px] text-slate-900 tracking-wider pl-1 uppercase">
                        {extractPlate(servingToken)}
                      </span>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{servingToken.phone || 'Walk-in'}</span>
                    </span>
                    <span>
                      {servingToken.bookingMode === 'APPOINTMENT' ? '📅 Advance Slot' : '🎫 Walk-in Token'}
                    </span>
                  </div>
                </div>

                {/* Fast Action Buttons */}
                <div className="flex flex-row md:flex-col gap-1.5 w-full md:w-auto shrink-0">
                  <button
                    disabled={actionLoading === `done-${servingToken.id}`}
                    onClick={() => onQueueAction(`done-${servingToken.id}`, `/service-queue/token/${servingToken.id}/done`, 'PATCH')}
                    className="flex-1 md:flex-none py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-950 active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" />
                    <span>Complete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (soundEnabled) {
                        playQueueChime();
                        announceToken(servingToken.tokenNumber, servingToken.customerName);
                      }
                    }}
                    className="py-1 px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 border border-white/10"
                  >
                    <Volume2 className="w-3 h-3 text-amber-400" />
                    <span>Recall</span>
                  </button>

                  <button
                    disabled={actionLoading === `noshow-${servingToken.id}`}
                    onClick={() => {
                      if (confirm('Mark this customer as No-Show?')) {
                        onQueueAction(`noshow-${servingToken.id}`, `/service-queue/token/${servingToken.id}/no-show`, 'PATCH');
                      }
                    }}
                    className="py-1 px-2 text-red-400 hover:text-red-300 text-[11px] font-semibold hover:underline text-center"
                  >
                    No-Show
                  </button>
                </div>
              </div>
            ) : (
              /* Compact Standby State (Low Profile) */
              <div className="py-2 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0 shadow-inner">
                    <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                      Counter Ready for Next Client
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-normal mt-0.5">
                      {terms.standby}
                    </p>
                  </div>
                </div>

                <button
                  disabled={actionLoading === 'next-global' || counts.all === 0}
                  onClick={() => triggerCallNext()}
                  className="py-2 px-4 sm:px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 w-full sm:w-auto"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Call Next Customer</span>
                  <span className="hidden sm:inline text-[10px] font-mono bg-emerald-700/80 px-1.5 py-0.5 rounded font-normal text-emerald-200">
                    Space
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. INTERACTIVE "UP NEXT" QUEUE FEED & CONTROLS (COMPACT)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden">
        {/* Header with Search and Filter Tabs */}
        <div className="p-3 sm:p-3.5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Up Next in Line
              </h2>
              <span className="text-[11px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full">
                {counts.all} Waiting
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Live waiting queue sorted by arrival & priority appointment slots.
            </p>
          </div>

          {/* Quick Call Next Button */}
          {(!queueData?.resources || queueData.resources.length === 0) && (
            <button
              disabled={actionLoading === 'next-global' || counts.all === 0}
              onClick={() => triggerCallNext()}
              className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-40 active:scale-95 shrink-0"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{actionLoading === 'next-global' ? 'Calling...' : 'Call Next Client'}</span>
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="p-2.5 sm:p-3 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white">
          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap ${
                activeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('APPOINTMENTS')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap ${
                activeFilter === 'APPOINTMENTS'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Appointments ({counts.appointments})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('WALKINS')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap ${
                activeFilter === 'WALKINS'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Walk-ins ({counts.walkins})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('ABSENT')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap ${
                activeFilter === 'ABSENT'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Absent ({counts.absent})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search token #, name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-slate-800 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Queue Items Feed */}
        <div className="divide-y divide-slate-100 p-2 sm:p-3 space-y-1.5">
          {waitingTokens.length === 0 ? (
            /* Premium Compact Empty State */
            <div className="py-6 sm:py-7 text-center flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">
                {searchQuery ? 'No matching tokens found' : 'All Caught Up! Queue is Empty.'}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium max-w-sm mt-0.5">
                {searchQuery 
                  ? 'Try clearing the search query or changing the filter tab.'
                  : terms.emptyQueue}
              </p>
              {!searchQuery && (
                <div className="mt-2.5">
                  <button
                    onClick={onOpenWalkIn}
                    className="py-1 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-lg shadow-2xs transition-all"
                  >
                    + Add First Walk-in Client
                  </button>
                </div>
              )}
            </div>
          ) : (
            waitingTokens.map((token: any, index: number) => {
              const plate = extractPlate(token);
              const name = cleanName(token);
              const isFirst = index === 0;

              return (
                <div
                  key={token.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 gap-3.5 rounded-xl border transition-all ${
                    isFirst
                      ? 'border-indigo-300 bg-indigo-50/40 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Left: Position & Token */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black ${
                        isFirst
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold leading-none">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-black leading-none mt-0.5">
                          {token.bookingMode === 'APPOINTMENT' ? 'Apt' : `#${token.tokenNumber}`}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-sm truncate">
                          {name || token.customerName}
                        </span>

                        {plate && (
                          <span className="inline-flex items-center h-5 bg-white border border-slate-900 rounded-[2px] shadow-2xs overflow-hidden px-1">
                            <span className="text-[7px] text-[#003893] pr-1 border-r border-slate-200 font-black">IND</span>
                            <span className="font-mono font-black text-[9px] text-slate-900 tracking-wider pl-1 uppercase">
                              {plate}
                            </span>
                          </span>
                        )}

                        {token.bookingMode === 'APPOINTMENT' && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {token.appointmentTime ? new Date(token.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Appointment'}
                          </span>
                        )}

                        {token.status === 'ABSENT' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Absent (Late)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                        <span className="truncate">{token.service}</span>
                        {token.price > 0 && (
                          <span className="text-emerald-700 font-bold shrink-0">
                            • ₹{token.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Phone & Action Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{token.phone || 'No phone'}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Call this token directly */}
                      <button
                        disabled={actionLoading === `call-${token.id}`}
                        onClick={async () => {
                          if (soundEnabled) {
                            playQueueChime();
                            announceToken(token.tokenNumber, token.customerName);
                          }
                          await onQueueAction(`call-${token.id}`, `/service-queue/token/${token.id}/start`, 'PATCH');
                        }}
                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Call</span>
                      </button>

                      {/* Absent / Return to Queue */}
                      {token.status !== 'ABSENT' ? (
                        <button
                          disabled={actionLoading === `absent-${token.id}`}
                          onClick={() => onQueueAction(`absent-${token.id}`, `/service-queue/token/${token.id}/absent`, 'PATCH')}
                          className="py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all"
                        >
                          Absent
                        </button>
                      ) : (
                        <button
                          disabled={actionLoading === `waiting-${token.id}`}
                          onClick={() => onQueueAction(`waiting-${token.id}`, `/service-queue/token/${token.id}/waiting`, 'PATCH')}
                          className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all"
                        >
                          Return
                        </button>
                      )}

                      {/* No Show */}
                      <button
                        disabled={actionLoading === `noshow-${token.id}`}
                        onClick={() => {
                          if (confirm('Mark this customer as No-Show? They will be removed from the queue.')) {
                            onQueueAction(`noshow-${token.id}`, `/service-queue/token/${token.id}/no-show`, 'PATCH');
                          }
                        }}
                        className="py-1.5 px-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all"
                        title="Mark No-Show"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. FULLSCREEN TV LOUNGE DISPLAY MODAL (KIOSK MODE)
      ───────────────────────────────────────────────────────────── */}
      {showKioskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col p-6 sm:p-10 animate-in fade-in duration-200 overflow-y-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl">
                MV
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {queueData?.queue?.shopName || 'Customer Waiting Lounge'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  Live Token & Queue Status Screen
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Broadcast</span>
              </span>
              <button
                onClick={() => setShowKioskModal(false)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Kiosk Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-auto py-8">
            {/* Now Serving Big Spotlight */}
            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 rounded-3xl p-8 border border-indigo-800/50 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400" />
              
              <span className="text-sm font-black uppercase tracking-widest text-amber-400 block mb-2">
                NOW SERVING • PLEASE PROCEED
              </span>

              <div className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-indigo-100 my-4 leading-none">
                {servingToken ? (servingToken.bookingMode === 'APPOINTMENT' ? 'Apt' : `#${servingToken.tokenNumber}`) : '—'}
              </div>

              {servingToken ? (
                <div>
                  <h3 className="text-3xl sm:text-4xl font-black text-white">
                    {cleanName(servingToken) || servingToken.customerName}
                  </h3>
                  <p className="text-lg text-indigo-300 font-bold mt-1">
                    {servingToken.service}
                  </p>

                  {extractPlate(servingToken) && (
                    <div className="mt-4 inline-flex items-center h-10 bg-white border-2 border-slate-900 rounded-lg shadow-lg overflow-hidden px-3">
                      <span className="text-[10px] text-[#003893] pr-2 border-r border-slate-300 font-black">IND</span>
                      <span className="font-mono font-black text-lg text-slate-900 tracking-wider pl-2 uppercase">
                        {extractPlate(servingToken)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-lg font-medium">Counter is standing by for next client</p>
              )}
            </div>

            {/* Next in Line */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col">
              <h3 className="text-lg font-black text-white uppercase tracking-wider pb-3 border-b border-slate-800 flex items-center justify-between">
                <span>Next in Line</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                  {counts.all} waiting
                </span>
              </h3>

              <div className="divide-y divide-slate-800/80 mt-2 flex-1 overflow-y-auto max-h-96">
                {waitingTokens.slice(0, 5).map((tok: any, i: number) => (
                  <div key={tok.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl font-black text-amber-400">
                        {tok.bookingMode === 'APPOINTMENT' ? 'Apt' : `#${tok.tokenNumber}`}
                      </span>
                      <div>
                        <div className="font-bold text-white text-sm truncate max-w-[140px]">
                          {cleanName(tok) || tok.customerName}
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-[140px]">
                          {tok.service}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500">#{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500 font-medium">
            Please watch this screen for your token announcement. Powered by MarkatVerse Smart Queue System.
          </div>
        </div>
      )}

      {/* Direct UPI ID & QR Barcode Setup Modal */}
      <SellerDirectUpiModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        sellerId={sellerId || queueData?.queue?.sellerId || ''}
        shopName={queueData?.queue?.shopName || 'Service Desk'}
        onUpdated={() => onFetchQueue()}
      />
    </div>
  );
}
