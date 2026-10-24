"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car, Clock, Ticket, CheckCircle2, Calendar, ShieldCheck, AlertCircle
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface VehicleOption {
  id: string;
  name: 'Bike' | 'Car' | 'Truck' | 'Bus' | 'Heavy Vehicle (JCB)' | string;
  icon: string;
  price: number;
  estMinutes: number;
}

export const VEHICLE_OPTIONS: VehicleOption[] = [
  { id: 'bike', name: 'Bike', icon: '🏍️', price: 150, estMinutes: 15 },
  { id: 'car', name: 'Car', icon: '🚗', price: 350, estMinutes: 25 },
  { id: 'truck', name: 'Truck', icon: '🚚', price: 800, estMinutes: 40 },
  { id: 'bus', name: 'Bus', icon: '🚌', price: 1000, estMinutes: 45 },
  { id: 'heavy', name: 'Heavy Vehicle (JCB)', icon: '🚜', price: 1200, estMinutes: 55 }
];

interface QueueStatus {
  queue: { id: string; shopName: string; currentToken: number; lastToken: number; avgMinutes: number; isOpen: boolean };
  serving: { tokenNumber: number; customerName: string } | null;
  waiting: { id: string; tokenNumber: number; customerName: string; service: string }[];
  waitingCount: number;
  doneToday: number;
}

export default function CarWashBookingWidget({ service }: { service: any }) {
  const router = useRouter();
  const { user } = useAuth();

  // Mode: Live Token vs Advance Slot
  const [bookingMode, setBookingMode] = useState<'TOKEN' | 'APPOINTMENT'>('TOKEN');
  
  // 1. Vehicle Selection
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption>(VEHICLE_OPTIONS[1]); // Default to Car
  
  // 2. Plate Number & Contact
  const [plateNumber, setPlateNumber] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone?.replace(/^\+\d+\s*/, '') || '');
  
  // Advance Appointment slot
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [appointmentDate, setAppointmentDate] = useState(todayStr);
  const [appointmentTime, setAppointmentTime] = useState('11:00');

  // Queue state
  const [queueId, setQueueId] = useState<string | null>(null);
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  
  // Post booking result
  const [bookingResult, setBookingResult] = useState<any | null>(null);

  // Sync user info
  useEffect(() => {
    if (user) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!phone && user.phone) setPhone(user.phone.replace(/\D/g, ''));
    }
  }, [user, customerName, phone]);

  // If seller specified custom vehicle prices in options, map them
  const vehicleList = useMemo(() => {
    if (service?.options && service.options.length > 0) {
      return VEHICLE_OPTIONS.map(v => {
        const matched = service.options.find((opt: any) => {
          const optLower = (opt.name || '').toLowerCase();
          const vLower = v.name.toLowerCase();
          if (v.id === 'heavy' && (optLower.includes('jcb') || optLower.includes('heavy') || optLower.includes('earthmover') || optLower.includes('trailer'))) {
            return true;
          }
          return optLower.includes(vLower) || vLower.includes(optLower);
        });
        if (matched && matched.price > 0) {
          return { ...v, price: matched.price };
        }
        return v;
      });
    }
    return VEHICLE_OPTIONS;
  }, [service]);

  const currentVehicle = useMemo(() => {
    return vehicleList.find(v => v.id === selectedVehicle.id) || vehicleList[1];
  }, [vehicleList, selectedVehicle.id]);

  const activePrice = currentVehicle.price;

  // Fetch or initialize queue
  const fetchQueueData = useCallback(async (isMounted = { current: true }) => {
    try {
      let qId = null;
      if (service.sellerId) {
        const r = await fetch(`${API}/service-queue/seller/${service.sellerId}`);
        const d = await r.json().catch(() => null);
        if (Array.isArray(d) && d.length > 0) qId = d[0].id;
        else if (d && d.id) qId = d.id;
      }

      if (!qId) {
        const targetShop = service.seller || service.name || 'Automobile Wash Center';
        const r = await fetch(`${API}/service-queue/queues`);
        const all = await r.json().catch(() => []);
        const found = Array.isArray(all) ? all.find((q: any) => q.shopName === targetShop) : null;
        if (found) qId = found.id;
      }

      if (!qId) {
        const createRes = await fetch(`${API}/service-queue/queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopName: service.seller || service.name || 'Automobile & Car Wash Bay',
            sellerId: service.sellerId || null,
            avgMinutes: currentVehicle.estMinutes || 25
          })
        });
        const created = await createRes.json().catch(() => null);
        if (created?.id) qId = created.id;
      }

      if (isMounted.current && qId) {
        setQueueId(qId);
        const statusRes = await fetch(`${API}/service-queue/${qId}/status`);
        if (statusRes.ok) {
          const st = await statusRes.json();
          if (isMounted.current) setStatus(st);
        }
      }
    } catch (e) {
      console.error('CarWashQueue sync error:', e);
    }
  }, [service, currentVehicle.estMinutes]);

  useEffect(() => {
    const isMounted = { current: true };
    fetchQueueData(isMounted);
    const interval = setInterval(() => {
      if (queueId) {
        fetch(`${API}/service-queue/${queueId}/status`)
          .then(r => r.json())
          .then(st => { if (isMounted.current) setStatus(st); })
          .catch(() => {});
      }
    }, 12000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchQueueData, queueId]);

  const handleBookWash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }
    if (!plateNumber.trim()) {
      setErr('Please enter vehicle plate number (e.g. DL 01 AB 1234)');
      return;
    }

    setErr('');
    setSubmitting(true);

    try {
      const cleanPlate = plateNumber.toUpperCase().trim();
      const serviceDescription = `${currentVehicle.icon} ${currentVehicle.name} Wash [Plate: ${cleanPlate}]`;

      const payload: any = {
        customerName: `${(customerName.trim() || user.name || 'Customer')} (${cleanPlate})`,
        phone: phone.trim() ? `+91${phone.trim()}` : undefined,
        service: serviceDescription,
        bookingMode: bookingMode,
        price: activePrice
      };

      if (bookingMode === 'APPOINTMENT') {
        if (!appointmentDate || !appointmentTime) {
          setErr('Please select appointment date and time');
          setSubmitting(false);
          return;
        }
        payload.appointmentTime = `${appointmentDate}T${appointmentTime}:00`;
      }

      let activeQ = queueId;
      if (!activeQ) {
        const createRes = await fetch(`${API}/service-queue/queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopName: service.seller || service.name || 'Automobile & Car Wash Bay',
            sellerId: service.sellerId || null,
            avgMinutes: currentVehicle.estMinutes
          })
        });
        const created = await createRes.json();
        activeQ = created?.id;
        setQueueId(activeQ);
      }

      if (!activeQ) throw new Error('Could not establish service queue connection.');

      const r = await fetch(`${API}/service-queue/${activeQ}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Failed to generate token');

      setBookingResult(data);
      
      if (data?.token?.id) {
        localStorage.setItem('markatverse_active_token_id', data.token.id);
        try {
          const existing = localStorage.getItem('markatverse_active_tokens');
          const tokens = existing ? JSON.parse(existing) : [];
          tokens.push({
            id: data.token.id,
            serviceName: `Wash: ${currentVehicle.name} (${cleanPlate})`,
            shopName: service.seller || 'Car Wash Express Bay',
            category: 'Car Wash & Automobile',
            tokenNumber: data.token.tokenNumber,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('markatverse_active_tokens', JSON.stringify(tokens));
        } catch {}
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e: any) {
      setErr(e.message || 'Error booking wash bay');
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: DIGITAL TOKEN PASS (COMPACT)
  // ─────────────────────────────────────────────────────────────
  if (bookingResult) {
    const token = bookingResult.token;
    const estWait = bookingResult.estimatedWaitMin ?? (currentVehicle.estMinutes * Math.max(1, bookingResult.ahead || 0));

    return (
      <div className="w-full bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-cyan-500/30 animate-in fade-in duration-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500" />
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentVehicle.icon}</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Token Confirmed
              </span>
              <div className="text-sm font-extrabold text-white leading-tight">{service.seller || service.name}</div>
            </div>
          </div>
          <div className="inline-flex items-center rounded border-2 border-slate-900 bg-white overflow-hidden shadow-xs shrink-0">
            <div className="bg-[#003893] text-white px-1.5 py-1 text-[8px] font-black tracking-widest flex items-center gap-1 border-r border-slate-900">
              <span className="text-[9px]">☸</span>
              <span>IND</span>
            </div>
            <span className="px-2 py-0.5 font-mono font-black text-xs sm:text-sm text-slate-950 tracking-wider">
              {plateNumber.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="my-4 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Token Number</span>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white leading-none mt-1">
            #{token.tokenNumber || 'Confirmed'}
          </div>
          <p className="text-xs font-semibold text-cyan-200 mt-1.5">
            {bookingResult.ahead === 0 
              ? '🟢 Ready! Drive directly into the wash bay lane.' 
              : `🚗 ${bookingResult.ahead} vehicles ahead · ~${estWait}m wait`}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/salon/token/${token.id}`}
            className="flex-1 py-2.5 px-3 bg-cyan-700 hover:bg-cyan-800 text-white font-extrabold text-xs rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950"
          >
            <Clock className="w-3.5 h-3.5" /> Track Live Token
          </Link>
          <button
            onClick={() => setBookingResult(null)}
            className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: ULTRA COMPACT, HIGH-DENSITY INTERFACE
  // ─────────────────────────────────────────────────────────────
  const servingToken = status?.serving?.tokenNumber;
  const waitingCount = status?.waitingCount ?? 0;
  const estWaitMin = (waitingCount + 1) * (currentVehicle.estMinutes || 20);

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-cyan-700/20 shadow-sm shadow-cyan-900/5 p-3.5 sm:p-4 transition-all relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-600 via-cyan-700 to-teal-600" />

      {/* ── Compact Header Bar ── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-700 text-white flex items-center justify-center shadow-xs">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-900 block leading-tight">Automobile & Wash Bay</span>
            <div className="text-[10px] text-cyan-800 font-bold flex items-center gap-1.5 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-pulse" />
              Live Queue: {servingToken ? `Serving #${servingToken}` : 'Ready'} · {waitingCount} Waiting · ~{estWaitMin}m
            </div>
          </div>
        </div>

        {/* Compact Mode Toggle */}
        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-[11px] font-bold border border-slate-200/70">
          <button
            type="button"
            onClick={() => setBookingMode('TOKEN')}
            className={`px-3 py-1 rounded-md transition-all ${
              bookingMode === 'TOKEN'
                ? 'bg-white text-cyan-700 shadow-xs font-black border border-cyan-300 ring-1 ring-cyan-700/20'
                : 'text-slate-500 hover:text-cyan-700'
            }`}
          >
            Walk-in (Live)
          </button>
          <button
            type="button"
            onClick={() => setBookingMode('APPOINTMENT')}
            className={`px-3 py-1 rounded-md transition-all ${
              bookingMode === 'APPOINTMENT'
                ? 'bg-white text-cyan-700 shadow-xs font-black border border-cyan-300 ring-1 ring-cyan-700/20'
                : 'text-slate-500 hover:text-cyan-700'
            }`}
          >
            Schedule Slot
          </button>
        </div>
      </div>

      <form onSubmit={handleBookWash} className="pt-3 space-y-3">
        {/* COMPACT VEHICLE SELECTOR: 5 CHIPS IN A TIGHT ROW */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold">
            <span className="text-slate-600 uppercase tracking-wider">Select Vehicle Type</span>
            <span className="text-cyan-700 font-extrabold">
              {currentVehicle.icon} {currentVehicle.name} • ₹{activePrice}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {vehicleList.map(v => {
              const isSelected = selectedVehicle.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVehicle(v)}
                  className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-cyan-700 bg-cyan-50 text-cyan-900 shadow-xs font-black ring-1 ring-cyan-700'
                      : 'border-slate-200 bg-slate-50/60 hover:border-cyan-300 text-slate-700 font-bold'
                  }`}
                >
                  <span className="text-lg leading-none">{v.icon}</span>
                  <span className="text-[11px] mt-0.5 leading-tight">{v.name}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-cyan-700 font-black' : 'text-slate-500'}`}>
                    ₹{v.price}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COMPACT INPUTS: NUMBER PLATE & MOBILE NUMBER ON SINGLE ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Authentic Indian HSRP Number Plate */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <span>Vehicle Plate No.</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                HSRP Standard
              </span>
            </div>

            <div className="relative flex items-center rounded-lg border-2 border-slate-900 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-cyan-600 focus-within:border-slate-950 transition-all">
              {/* Left HSRP Sovereign Blue Band */}
              <div className="bg-[#003893] text-white px-2 py-1.5 flex flex-col items-center justify-center shrink-0 border-r border-slate-900 select-none">
                {/* Ashoka Chakra Hologram */}
                <div className="w-3.5 h-3.5 rounded-full bg-blue-900/60 border border-blue-300/80 flex items-center justify-center mb-0.5 shadow-inner">
                  <svg className="w-2.5 h-2.5 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
                  </svg>
                </div>
                {/* IND Country Code */}
                <span className="text-[9px] font-black tracking-widest text-white leading-none font-sans">
                  IND
                </span>
              </div>

              {/* Number Plate Text Input */}
              <div className="relative flex-1 flex items-center bg-white">
                <input
                  type="text"
                  required
                  maxLength={13}
                  placeholder="DL 01 AB 1234"
                  value={plateNumber}
                  onChange={e => setPlateNumber(e.target.value.toUpperCase())}
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-black font-mono tracking-widest text-slate-950 outline-none uppercase bg-transparent placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
                />
                {/* Corner Security Rivet */}
                <div className="pr-2 flex items-center gap-1 shrink-0 pointer-events-none select-none">
                  <div className="w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner" title="Security Rivet" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5 tracking-wider">
              Mobile (Updates)
            </label>
            <div className="flex items-center rounded-lg border-2 border-slate-300 bg-white focus-within:border-cyan-700 focus-within:ring-2 focus-within:ring-cyan-100 overflow-hidden shadow-xs transition-all">
              <span className="px-2.5 py-2 bg-slate-50 text-slate-600 text-xs font-bold border-r border-slate-200">
                +91
              </span>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-2.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* APPOINTMENT PICKER (ONLY WHEN SCHEDULE SLOT IS ACTIVE) */}
        {bookingMode === 'APPOINTMENT' && (
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <input
              type="date"
              min={todayStr}
              value={appointmentDate}
              onChange={e => setAppointmentDate(e.target.value)}
              className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-semibold outline-none focus:border-cyan-700"
            />
            <select
              value={appointmentTime}
              onChange={e => setAppointmentTime(e.target.value)}
              className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-semibold outline-none focus:border-cyan-700"
            >
              <option value="09:00">09:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="13:00">01:00 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="17:00">05:00 PM</option>
              <option value="19:00">07:00 PM</option>
            </select>
          </div>
        )}

        {err && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {/* COMPACT BOTTOM ACTION BAR */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase leading-none">Total Rate</div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900 leading-none">₹{activePrice}</span>
              <span className="text-[11px] text-cyan-700 font-bold">({currentVehicle.name})</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="py-2.5 px-6 bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-cyan-700/25 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <span>Generating...</span>
            ) : (
              <>
                <Ticket className="w-3.5 h-3.5" />
                <span>
                  {bookingMode === 'TOKEN' ? `Get Wash Token (₹${activePrice})` : `Confirm Slot (₹${activePrice})`}
                </span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
