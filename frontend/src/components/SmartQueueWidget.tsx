"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {  useRouter } from 'next/navigation';
import {
  MapPin, Clock, Users, Ticket, ChevronRight, Loader2, RefreshCw, CalendarClock, Sparkles, CheckCircle2, PhoneCall
} from 'lucide-react';

// ─── Dynamic Walk-in Services ───────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const WALK_IN_CATEGORIES = ['salon', 'saloon', 'beauty', 'hair', 'barber', 'spa', 'nail', 'massage', 'pedicure', 'doctor', 'clinic', 'medical', 'hospital', 'dentist'];

// ─── Types ────────────────────────────────────────────────────────────────────
interface QueueSummary {
  id: string; shopName: string; currentToken: number; lastToken: number;
  avgMinutes: number; isOpen: boolean;
}
interface QueueStatus {
  queue: { id: string; shopName: string; currentToken: number; lastToken: number; avgMinutes: number; pricePerHour: number; isOpen: boolean; };
  staff?: { id: string; name: string; role: string; isAvailable: boolean }[];
  resources?: { id: string; name: string; type: string; isAvailable: boolean }[];
  serving: { tokenNumber: number; customerName: string } | null;
  waiting: { id: string; tokenNumber: number; customerName: string; service: string }[];
  waitingCount: number; doneToday: number;
}
interface JoinResult {
  token: { id: string; tokenNumber: number; service: string };
  estimatedWaitMin: number; ahead: number;
}

// ─── Queue Widget ─────────────────────────────────────────────────────────────
export default function SmartQueueWidget({ service }: { service: any }) {
  const router = useRouter();
  const { user } = useAuth();
  const isSeller = user && ['seller', 'SELLER', 'business', 'elite', 'ELITE'].includes(user.role);
  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [selected, setSelected] = useState<QueueSummary | null>(null);
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [loadingQ, setLoadingQ] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [step, setStep] = useState<'view' | 'join' | 'done'>('view');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone?.replace(/^\+\d+\s*/, '') || '');
  const [countryCode, setCountryCode] = useState('+91');
  const [bookingMode, setBookingMode] = useState<'TOKEN' | 'APPOINTMENT'>('TOKEN');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (user && !name) {
      setName(user.name || '');
      if (user.phone) {
        // Simple extraction of country code vs phone number if it has a '+'
        const match = user.phone.match(/^(\+\d+)\s*(.*)$/);
        if (match) {
          setCountryCode(match[1]);
          setPhone(match[2].replace(/\D/g, ''));
        } else {
          setPhone(user.phone.replace(/\D/g, ''));
        }
      }
    }
  }, [user]);
  
  interface ServiceItem { label: string; price: number; originalPrice?: number; discount?: number; emoji: string; }
  const cat = service.category?.toLowerCase() || '';
  const subcat = service.subcategory?.toLowerCase() || '';
  const isAuto = cat.includes('car wash') || cat.includes('wash') || cat.includes('automobile') || cat.includes('auto') || cat.includes('vehicle') || cat.includes('mechanic') || subcat.includes('wash') || subcat.includes('automobile');
  const emoji = 
    isAuto ? '🚗' :
    cat.includes('doctor') || cat.includes('clinic') || cat.includes('medical') || cat.includes('hospital') || cat.includes('dentist') ? '🩺' : 
    cat.includes('spa') || cat.includes('massage') ? '💆‍♀️' : 
    cat.includes('salon') || cat.includes('saloon') || cat.includes('beauty') || cat.includes('parlor') || cat.includes('parlour') ? '💇‍♀️' :
    cat.includes('nail') || cat.includes('pedicure') ? '💅' : '✂️';
  let availableServices: ServiceItem[] = [];
  if (service.options && service.options.length > 0) {
    availableServices = service.options.map((opt: { name: string; price: number; discountPercentage?: number }) => {
      const discount = opt.discountPercentage || 0;
      const effectivePrice = discount > 0 ? opt.price - Math.round((opt.price * discount) / 100) : opt.price;
      return { 
        label: opt.name, 
        price: effectivePrice, 
        originalPrice: opt.price,
        discount: discount,
        emoji 
      };
    });
  } else {
    let paramServices: string[] = [];
    if (service.parameters) {
      for (const key of Object.keys(service.parameters)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('amenit') || lowerKey.includes('location') || lowerKey.includes('gender') ||
          lowerKey.includes('setting') || lowerKey.includes('facility') || lowerKey.includes('booking') ||
          lowerKey.includes('focus') || lowerKey.includes('audience') || lowerKey.includes('hygiene') ||
          lowerKey.includes('warranty') || lowerKey.includes('stylist') || lowerKey.includes('chair')
        ) {
          continue;
        }
        if (
          lowerKey.includes('service') || lowerKey.includes('treatment') || lowerKey.includes('package') ||
          lowerKey.includes('menu') || lowerKey.includes('hair') || lowerKey.includes('beauty')
        ) {
          if (Array.isArray(service.parameters[key]) && service.parameters[key].length > 0) {
            paramServices = [...paramServices, ...service.parameters[key]];
          }
        }
      }
    }
    if (paramServices.length > 0) {
      availableServices = paramServices.map(name => ({ label: name, price: service.price, emoji }));
    } else {
      availableServices = [{ label: service.name, price: service.price, emoji }];
    }
  }
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>(availableServices.length > 0 ? [availableServices[0]] : []);
  const totalPrice = selectedServices.reduce((sum: number, s: ServiceItem) => sum + s.price, 0);
  const [result, setResult] = useState<JoinResult | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const isMounted = { current: true };
    const fetchQ = async () => {
      try {
        let list: QueueSummary[] = [];

        // Always try by sellerId first if provided
        if (service.sellerId) {
          const r = await fetch(`${API}/service-queue/seller/${service.sellerId}`);
          const text = await r.text();
          const d = text ? JSON.parse(text) : null;
          if (Array.isArray(d) && d.length > 0) list = d;
          else if (d && d.id) list = [d];
        }

        // If still no queue, search all queues filtered by shopName matching this seller
        if (list.length === 0) {
          const r = await fetch(`${API}/service-queue/queues`);
          const text = await r.text();
          const all: QueueSummary[] = text ? JSON.parse(text) : [];
          const targetShopName = service.seller || service.name || 'Walk-in Service';
          const scoped = Array.isArray(all)
            ? all.filter((q: any) => q.shopName === targetShopName)
            : [];
          if (scoped.length > 0) list = scoped;
        }

        // If still no queue, create one scoped exclusively to this seller
        if (list.length === 0) {
          const createRes = await fetch(`${API}/service-queue/queue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shopName: service.seller || service.name || 'Walk-in Service', // Add strong fallbacks
              sellerId: service.sellerId || null,
            })
          });
          const newQueue = await createRes.json();
          if (newQueue && newQueue.id) list = [newQueue];
        }

        if (isMounted.current) {
          setQueues(list);
          if (list.length > 0) setSelected(list[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted.current) setLoadingQ(false);
      }
    };
    fetchQ();
    return () => {
      isMounted.current = false;
    };
  }, [service.name, service.sellerId, service.seller]);

  const fetchStatus = useCallback(async (showRefresh = false, isMounted = { current: true }) => {
    if (!selected) return;
    if (showRefresh && isMounted.current) setRefreshing(true);
    try {
      const r = await fetch(`${API}/service-queue/${selected.id}/status`);
      if (r.ok) {
        const st = await r.json();
        if (isMounted.current) setStatus(st);
      }
    } catch {} finally {
      if (showRefresh && isMounted.current) setRefreshing(false);
    }
  }, [selected]);

  useEffect(() => {
    const isMounted = { current: true };
    fetchStatus(false, isMounted);
    const i = setInterval(() => fetchStatus(false, isMounted), 12000);
    return () => {
      isMounted.current = false;
      clearInterval(i);
    };
  }, [fetchStatus]);

  const join = async () => {
    if (!user) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }
    if (!name.trim()) { setErr('Please enter your name'); return; }
    if (selectedServices.length === 0) { setErr('Please select at least one service'); return; }
    if (!selected) return;
    setErr(''); setJoining(true);
    try {
      const payload: any = {
        customerName: name.trim(),
        phone: phone.trim() ? `${countryCode}${phone.trim()}` : undefined,
        service: selectedServices.map(s => s.label).join(', '),
        bookingMode: bookingMode,
        price: selectedServices.reduce((sum, s) => sum + s.price, 0)
      };
      
      if (bookingMode === 'APPOINTMENT') {
        if (!appointmentDate || !appointmentTime) {
          setErr('Please select appointment date and time');
          setJoining(false);
          return;
        }
        payload.appointmentTime = `${appointmentDate}T${appointmentTime}:00`;
      }

      if (selectedStaff) payload.staffId = selectedStaff;
      if (selectedResource) payload.resourceId = selectedResource;

      const r = await fetch(`${API}/service-queue/${selected.id}/join`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message ?? 'Failed');
      setResult(d); setStep('done'); fetchStatus();
      
      // Save active token to local storage for global widget
      if (d?.token?.id) {
        localStorage.setItem('markatverse_active_token_id', d.token.id);
        
        // Also save to a list of tokens
        try {
          const existing = localStorage.getItem('markatverse_active_tokens');
          const tokens = existing ? JSON.parse(existing) : [];
          // Avoid duplicates
          if (!tokens.find((t: any) => t.id === d.token.id)) {
            tokens.push({
              id: d.token.id,
              serviceName: service.name || 'Service',
              shopName: service.sellerName || selected?.shopName || 'Store',
              category: service.category || '',
              tokenNumber: d.token.tokenNumber,
              timestamp: new Date().toISOString()
            });
            localStorage.setItem('markatverse_active_tokens', JSON.stringify(tokens));
          }
        } catch (err) {
          console.error('Error saving tokens to local storage', err);
        }
        
        // Dispatch storage event manually for same-tab updates
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Error'); }
    finally { setJoining(false); }
  };

  // Token received
  if (step === 'done' && result) return (
    <div className="space-y-4">
      <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-6 overflow-hidden text-center shadow-2xl shadow-purple-300">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize:'30px 30px'}} />
        
        {/* Header Information added for the booked token */}
        <div className="relative z-10 mb-6 pb-4 border-b border-white/20">
          <div className="flex justify-center mb-2">
            <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Booked Successfully
            </span>
          </div>
          <div className="text-white font-bold text-xl flex items-center justify-center gap-2">
            <span className="text-2xl">{emoji}</span> {service.seller || selected?.shopName || service.name}
          </div>
          <div className="text-purple-200 text-sm font-medium mt-1">
            {selectedServices.map(s => s.label).join(', ')}
          </div>
          {bookingMode === 'APPOINTMENT' && (
            <div className="text-emerald-300 text-xs font-bold mt-2 bg-emerald-900/40 inline-block px-3 py-1 rounded-full border border-emerald-500/30">
              📅 {appointmentDate} at {appointmentTime}
            </div>
          )}
        </div>

        <div className="relative z-10">
          <div className="text-white/60 text-xs font-black uppercase tracking-widest mb-1">Your Token Number</div>
          <div className="text-[5rem] font-black text-white leading-none drop-shadow-2xl">#{result.token.tokenNumber}</div>
          <div className="text-purple-200 text-sm mt-2 font-medium">
            {result.ahead === 0 ? '🎉 You\'re next! Head in now.' : `${result.ahead} ahead · ~${result.estimatedWaitMin} min wait`}
          </div>
        </div>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 relative shadow-sm">
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live</span>
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Queue Status</div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-xl font-black text-slate-800">
            #{status?.serving?.tokenNumber ?? status?.queue?.currentToken ?? 0}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">Now Serving</div>
            <div className="text-xs text-slate-500">{status?.serving?.customerName || 'In Progress'}</div>
          </div>
        </div>
        
        {((status?.serving?.tokenNumber ?? status?.queue?.currentToken ?? 0) > 1) && (
          <div className="mt-2 pt-3 border-t border-slate-200 flex items-center gap-3 opacity-60">
            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
              #{(status?.serving?.tokenNumber ?? status?.queue?.currentToken ?? 1) - 1}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-600">Previous Completed</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/salon/token/${result.token.id}`} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg">
          <Clock className="w-4 h-4" /> Track Live Token
        </Link>
        <a 
          href={`tel:${service?.contactPhone || service?.sellerPhone || '+919876543210'}`}
          className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-1.5 border border-slate-200 shrink-0 shadow-2xs"
          title={`Call ${service?.seller || 'Service Desk'}`}
        >
          <PhoneCall className="w-4 h-4 text-emerald-600" />
          <span>Call</span>
        </a>
      </div>
      <p className="text-center text-slate-400 text-xs">💡 You can leave and return when it&apos;s your turn</p>
    </div>
  );

  // Join form (Compact & High Density)
  if (step === 'join') return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Header with Segmented Switcher on the Right Side (matching Image 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setStep('view')} 
            className="text-slate-500 hover:text-slate-900 font-bold text-xs p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Back to status"
          >
            ← Back
          </button>
          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 leading-tight">
            {bookingMode === 'TOKEN' ? <Ticket className="w-4 h-4 text-emerald-600" /> : <CalendarClock className="w-4 h-4 text-purple-600" />}
            <span>{bookingMode === 'TOKEN' ? 'Get Your Live Token' : 'Book Appointment'}</span>
          </h4>
        </div>

        {/* Compact Segmented Switcher on Right Side */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0 self-end sm:self-auto ml-auto">
          <button 
            type="button"
            onClick={() => setBookingMode('TOKEN')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              bookingMode === 'TOKEN' 
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60 font-black' 
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-600" />
            <span>Walk-in (Token)</span>
          </button>
          <button 
            type="button"
            onClick={() => setBookingMode('APPOINTMENT')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              bookingMode === 'APPOINTMENT' 
                ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60 font-black' 
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Multi-Service Selector */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Services</span>
          <span className="text-[10px] text-slate-400 font-medium">Pick one or more</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {availableServices.map(svc => {
            const isChosen = selectedServices.some(s => s.label === svc.label);
            return (
              <button key={svc.label}
                type="button"
                onClick={() => {
                  if (isChosen && selectedServices.length === 1) return; // Prevent deselecting the only selected service
                  setSelectedServices(prev =>
                    isChosen
                      ? prev.filter(s => s.label !== svc.label)
                      : [...prev, svc]
                  );
                }}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 sm:py-2 sm:px-2 rounded-xl border text-center transition-all cursor-pointer min-h-[56px] sm:min-h-[64px] ${
                  isChosen
                    ? 'border-2 border-violet-600 bg-violet-50 text-violet-900 shadow-xs font-black ring-1 ring-violet-500/20'
                    : 'border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50/30 text-slate-700 font-bold'
                }`}>
                {isChosen && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-violet-600 rounded-full flex items-center justify-center text-white text-[8px] font-black z-10">✓</span>
                )}
                {svc.discount ? (
                  <span className="absolute -top-1.5 -left-1 bg-red-500 text-white text-[8px] font-black px-1 py-0.2 rounded-sm shadow-2xs">
                    {svc.discount}%
                  </span>
                ) : null}
                <span className="text-base sm:text-lg leading-none">{svc.emoji}</span>
                <span className="text-[10px] sm:text-xs leading-tight truncate w-full text-center mt-0.5 font-bold">{svc.label}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  {svc.discount ? (
                    <span className="text-[9px] text-slate-400 line-through">₹{svc.originalPrice}</span>
                  ) : null}
                  <span className={`text-[10px] sm:text-xs font-black ${isChosen ? 'text-violet-700' : 'text-slate-500'}`}>₹{svc.price}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Compact Order Summary Strip */}
        {selectedServices.length > 0 ? (
          <div className="mt-2 bg-violet-50/80 border border-violet-200/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate min-w-0 mr-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Order:</span>
              <span className="font-bold text-violet-950 truncate text-[11px] sm:text-xs">
                {selectedServices.map(s => s.label).join(', ')}
              </span>
            </div>
            <div className="flex items-baseline gap-1 shrink-0">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Total:</span>
              <span className="text-xs sm:text-sm font-black text-violet-700">₹{totalPrice}</span>
            </div>
          </div>
        ) : (
          <div className="mt-2 bg-red-50 border border-red-100 rounded-xl px-3 py-1.5 text-[11px] text-red-500 font-bold text-center">
            ⚠️ Please select at least one service
          </div>
        )}
      </div>

      {/* Staff & Resource Selection */}
      {((status?.resources && status.resources.length > 0) || (status?.staff && status.staff.length > 0)) && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-2">
          {status.resources && status.resources.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{isAuto ? 'Service Bay' : 'Space / Chair'}</p>
              <div className="flex flex-wrap gap-1.5">
                {status.resources.map(r => (
                  <button key={r.id} onClick={() => setSelectedResource(r.id === selectedResource ? null : r.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${selectedResource === r.id ? 'bg-violet-600 text-white border-violet-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'}`}>
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {status.staff && status.staff.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{isAuto ? 'Specialist' : 'Staff'}</p>
              <div className="flex flex-wrap gap-1.5">
                {status.staff.map(s => (
                  <button key={s.id} onClick={() => setSelectedStaff(s.id === selectedStaff ? null : s.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${selectedStaff === s.id ? 'bg-violet-600 text-white border-violet-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'}`}>
                    {s.name} <span className="text-[9px] opacity-70 ml-1">({s.role})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Name and Mobile aligned in one row side by side */}
      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5 truncate">Name *</label>
          <input 
            type="text" 
            placeholder="Your name" 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="w-full h-10 px-3 border border-slate-300 focus:border-violet-500 rounded-xl outline-none text-slate-900 font-semibold bg-white text-xs sm:text-sm transition-colors shadow-2xs" 
          />
        </div>
        <div className="min-w-0">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5 truncate">Mobile *</label>
          <div className="h-10 flex items-center rounded-xl border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:border-violet-500 transition-colors">
            <span className="h-full px-2.5 bg-slate-50 text-slate-600 text-[11px] sm:text-xs font-bold border-r border-slate-200 flex items-center justify-center shrink-0">
              +91
            </span>
            <input 
              type="tel" 
              placeholder="9876543210" 
              value={phone} 
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              className="h-full flex-1 px-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400 min-w-0" 
            />
          </div>
        </div>
      </div>
      
      {/* Appointment Date and Time aligned in one row side by side */}
      {bookingMode === 'APPOINTMENT' && (
        <div className="grid grid-cols-2 gap-2 p-2 bg-violet-50/50 rounded-xl border border-violet-100 animate-in fade-in duration-150">
          <div className="min-w-0">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5 truncate">Date</label>
            <input 
              type="date" 
              min={new Date().toISOString().split('T')[0]} 
              value={appointmentDate} 
              onChange={e => setAppointmentDate(e.target.value)}
              className="w-full h-9 px-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none text-slate-900 font-bold bg-white text-xs" 
            />
          </div>
          <div className="min-w-0">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5 truncate">Time</label>
            <input 
              type="time" 
              value={appointmentTime} 
              onChange={e => setAppointmentTime(e.target.value)}
              className="w-full h-9 px-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none text-slate-900 font-bold bg-white text-xs" 
            />
          </div>
        </div>
      )}

      {err && <p className="text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl font-bold">⚠️ {err}</p>}
      
      <div className="flex items-center gap-2 pt-0.5">
        <button 
          onClick={join} 
          disabled={joining || selectedServices.length === 0}
          className="flex-1 h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-violet-200 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : (bookingMode === 'TOKEN' ? <Ticket className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />)}
          <span>{joining ? 'Processing…' : (bookingMode === 'TOKEN' ? `Pay ₹${totalPrice} & Get Token 🎫` : `Pay ₹${totalPrice} & Book 📅`)}</span>
        </button>

        <a 
          href={`tel:${service?.contactPhone || service?.sellerPhone || '+919876543210'}`}
          className="h-11 px-4 sm:px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200/90 shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
          title={`Call ${service?.seller || 'Service Desk'}`}
        >
          <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Call</span>
        </a>
      </div>
    </div>
  );

  // Default: live status view
  if (loadingQ) return <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>;

  if (queues.length === 0) return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-amber-700 text-sm font-medium">
        ⚡ Queue not yet set up — you can still request a spot!
      </div>
      <input type="text" placeholder="Your name *" value={name} onChange={e => setName(e.target.value)}
        className="w-full px-4 py-3.5 border-2 border-slate-100 focus:border-violet-400 rounded-2xl outline-none text-slate-900 font-medium bg-slate-50 transition-colors" />
      <input type="tel" placeholder="Phone number (optional)" value={phone} onChange={e => setPhone(e.target.value)}
        className="w-full px-4 py-3.5 border-2 border-slate-100 focus:border-violet-400 rounded-2xl outline-none text-slate-900 font-medium bg-slate-50 transition-colors" />
      {err && <p className="text-red-500 text-sm bg-red-50 border border-red-100 px-4 py-3 rounded-xl">⚠️ {err}</p>}
      <div className="flex items-center gap-2">
        <button
          onClick={async () => {
            if (!name.trim()) { setErr('Please enter your name'); return; }
            try {
              // First attempt to fetch the queue by sellerId or shopName
              let queueId = null;
              if (service.sellerId) {
                const r = await fetch(`${API}/service-queue/seller/${service.sellerId}`);
                const d = await r.json().catch(() => null);
                if (Array.isArray(d) && d.length > 0) queueId = d[0].id;
                else if (d && d.id) queueId = d.id;
              }
              if (!queueId) {
                const targetShopName = service.seller || service.name || 'Walk-in Service';
                const r = await fetch(`${API}/service-queue/queues`);
                const all = await r.json().catch(() => []);
                const matched = Array.isArray(all) ? all.find((q: any) => q.shopName === targetShopName) : null;
                if (matched) queueId = matched.id;
              }

              // If still no queue, try to create it
              if (!queueId) {
                const createRes = await fetch(`${API}/service-queue/queue`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    shopName: service.seller || service.name || 'Walk-in Service',
                    sellerId: service.sellerId || null,
                  })
                });
                const newQueue = await createRes.json();
                queueId = newQueue.id;
              }
              
              if (!queueId) throw new Error("Could not find or create a queue for this service.");
              
              // Join the queue
              const joinRes = await fetch(`${API}/service-queue/${queueId}/join`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerName: name.trim(), phone: phone.trim() || undefined, service: service.name }),
              });
              const d = await joinRes.json();
              if (!joinRes.ok) throw new Error(d.message);
              
              setResult(d); 
              setStep('done');
            } catch (e: unknown) {
               setErr(e instanceof Error ? e.message : 'Error joining queue'); 
            }
          }}
          className="flex-1 py-3.5 sm:py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-md shadow-violet-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Ticket className="w-4 h-4" /> Request a Token 🎫
        </button>

        <a 
          href={`tel:${service?.contactPhone || service?.sellerPhone || '+919876543210'}`}
          className="py-3.5 sm:py-4 px-4 sm:px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 border border-slate-200/90 shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
          title={`Call ${service?.seller || 'Service Desk'}`}
        >
          <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Call</span>
        </a>
      </div>
    </div>
  );

  const openQueue = selected;
  const waiting = status?.waitingCount ?? 0;
  const isOpen = status?.queue.isOpen ?? openQueue?.isOpen ?? false;
  const serving = Array.isArray(status?.serving) ? status?.serving[0] : status?.serving;
  const avgMinutes = status?.queue.avgMinutes ?? selected?.avgMinutes ?? 15;
  const estWaitMinutes = waiting === 0 
    ? (serving ? Math.min(avgMinutes, 10) : 0) 
    : (waiting * avgMinutes + (serving ? 5 : 0));
  const estWaitText = estWaitMinutes === 0 ? '0m' : `${estWaitMinutes}m`;

  return (
    <div className="space-y-3.5">
      {/* Top Header with Segmented Switcher on the Right Side (matching Image 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0">
            {bookingMode === 'TOKEN' ? <Ticket className="w-4 h-4" /> : <CalendarClock className="w-4 h-4 text-purple-600" />}
          </div>
          <div>
            <h3 className="text-slate-900 font-extrabold text-sm sm:text-base leading-tight">
              {bookingMode === 'TOKEN' ? 'Walk-in Live Queue' : 'Advance Appointment'}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {bookingMode === 'TOKEN' ? 'Real-time queue tracking & digital tokens' : 'Schedule your date & preferred time slot'}
            </p>
          </div>
        </div>

        {/* Compact Segmented Switcher on the Right Side */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0 self-end sm:self-auto ml-auto">
          <button 
            type="button"
            onClick={() => setBookingMode('TOKEN')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              bookingMode === 'TOKEN' 
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60 font-black' 
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-600" />
            <span>Walk-in (Token)</span>
          </button>
          <button 
            type="button"
            onClick={() => {
              setBookingMode('APPOINTMENT');
              setStep('join');
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              bookingMode === 'APPOINTMENT' 
                ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60 font-black' 
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Queue selector */}
      {queues.length > 1 && (
        <select value={selected?.id ?? ''} onChange={e => { const q = queues.find(x => x.id === e.target.value); if(q) { setSelected(q); setStatus(null); }}}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold outline-none bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white transition-all">
          {queues.map(q => <option key={q.id} value={q.id}>{q.shopName}</option>)}
        </select>
      )}

      {/* Clean & Clear Live Status Card */}
      <div className={`relative overflow-hidden rounded-2xl lg:rounded-3xl p-4 lg:p-5 transition-all ${
        isOpen 
          ? 'bg-gradient-to-b from-emerald-50/70 via-teal-50/30 to-white border border-emerald-200/90 shadow-xs' 
          : 'bg-gradient-to-b from-red-50/70 via-rose-50/30 to-white border border-red-200/90 shadow-xs'
      }`}>
        {/* Soft background aura */}
        {isOpen && <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>}
        
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold tracking-wider uppercase shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-emerald-400' : 'hidden'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-emerald-600' : 'bg-red-500'}`}></span>
            </span>
            <span>{isOpen ? 'Live Queue Active' : 'Queue Closed'}</span>
          </div>

          <button 
            onClick={() => fetchStatus(true)} 
            title="Refresh Live Status"
            className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-emerald-700 border border-emerald-200/60 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* 3 High-Definition Stat Tiles */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 relative z-10">
          {/* SERVING */}
          <div className="bg-white rounded-xl sm:rounded-2xl py-3 px-2 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center hover:border-emerald-300 transition-colors">
            <div className="text-slate-900 font-black text-xl sm:text-2xl leading-none tracking-tight">
              {serving ? `#${serving.tokenNumber}` : '—'}
            </div>
            <div className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mt-1.5">
              Serving
            </div>
            <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">
              {serving ? 'In Chair' : 'Counter Ready'}
            </div>
          </div>

          {/* WAITING */}
          <div className="bg-white rounded-xl sm:rounded-2xl py-3 px-2 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center hover:border-emerald-300 transition-colors">
            <div className="text-slate-900 font-black text-xl sm:text-2xl leading-none tracking-tight">
              {waiting}
            </div>
            <div className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mt-1.5">
              Waiting
            </div>
            <div className={`text-[10px] font-semibold mt-0.5 ${waiting === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {waiting === 0 ? 'No queue' : `${waiting} ahead`}
            </div>
          </div>

          {/* EST WAIT */}
          <div className="bg-white rounded-xl sm:rounded-2xl py-3 px-2 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center hover:border-emerald-300 transition-colors">
            <div className="text-slate-900 font-black text-xl sm:text-2xl leading-none tracking-tight">
              {estWaitText}
            </div>
            <div className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mt-1.5">
              Est Wait
            </div>
            <div className={`text-[10px] font-semibold mt-0.5 ${estWaitMinutes === 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
              {estWaitMinutes === 0 ? 'Instant Entry' : `~${estWaitMinutes} mins`}
            </div>
          </div>
        </div>
      </div>

      {/* Up next list */}
      {status && status.waiting.slice(0, 3).length > 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl px-4 py-2 space-y-1.5 lg:space-y-2">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Up Next</div>
          {status.waiting.slice(0, 3).map((t, i) => (
            <div key={t.id} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${i === 0 ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                {t.tokenNumber}
              </span>
              <span className="text-slate-700 text-sm font-semibold flex-1 truncate">{t.customerName}</span>
              <span className="text-slate-400 text-xs shrink-0">~{(i + 1) * (status.queue.avgMinutes)}m</span>
            </div>
          ))}
          {status.waitingCount > 3 && <p className="text-slate-400 text-xs">+{status.waitingCount - 3} more</p>}
        </div>
      )}

      {/* Action buttons */}
      {isOpen ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setStep('join')}
              className="flex-1 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-extrabold text-base sm:text-lg rounded-xl lg:rounded-2xl transition-all shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 flex items-center justify-center gap-2.5 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <Ticket className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10 tracking-wide font-black">Get Token Now</span>
            </button>

            <a 
              href={`tel:${service?.contactPhone || service?.sellerPhone || '+919876543210'}`}
              className="py-3.5 sm:py-4 px-4 sm:px-5 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-bold text-sm sm:text-base rounded-xl lg:rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-200/90 shadow-xs shrink-0 whitespace-nowrap cursor-pointer"
              title={`Call ${service?.seller || 'Service Desk'}`}
            >
              <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Call</span>
            </a>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-medium pt-0.5">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Free Digital Token
            </span>
            <span className="text-slate-300">•</span>
            <span>Live Queue Tracker</span>
            <span className="text-slate-300">•</span>
            <span>Zero Salon Wait</span>
          </div>
        </div>
      ) : (
        <div className="w-full py-4 bg-slate-100 text-slate-400 font-bold text-base rounded-2xl text-center">
          Queue is Currently Closed
        </div>
      )}
    </div>
  );
}
