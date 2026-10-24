"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car, Clock, Ticket, RefreshCw, CheckCircle2,
  Calendar, ShieldCheck, AlertCircle
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface VehicleOption {
  id: string;
  name: 'Bike' | 'Car' | 'Truck' | 'Bus' | 'JCB' | 'Heavy Automobile' | string;
  icon: string;
  price: number;
  estMinutes: number;
}

export const VEHICLE_OPTIONS: VehicleOption[] = [
  { id: 'bike', name: 'Bike', icon: '🏍️', price: 150, estMinutes: 15 },
  { id: 'car', name: 'Car', icon: '🚗', price: 350, estMinutes: 30 },
  { id: 'truck', name: 'Truck', icon: '🚚', price: 800, estMinutes: 45 },
  { id: 'bus', name: 'Bus', icon: '🚌', price: 1000, estMinutes: 50 },
  { id: 'jcb', name: 'JCB', icon: '🚜', price: 1200, estMinutes: 60 },
  { id: 'heavy', name: 'Heavy Automobile', icon: '🚛', price: 1500, estMinutes: 75 }
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
  
  // 1. Vehicle Type (Bike, Car, Truck, Bus, JCB, Heavy Automobile)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption>(VEHICLE_OPTIONS[1]); // Default to Car
  
  // 2. Number Plate & Contact
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
  const [refreshing, setRefreshing] = useState(false);
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
        const matched = service.options.find((opt: any) => 
          opt.name?.toLowerCase().includes(v.name.toLowerCase()) || 
          v.name.toLowerCase().includes(opt.name?.toLowerCase())
        );
        if (matched && matched.price > 0) {
          return { ...v, price: matched.price };
        }
        return v;
      });
    }
    return VEHICLE_OPTIONS;
  }, [service]);

  // Update selected vehicle reference if vehicleList updated
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

  const handleRefreshStatus = async () => {
    if (!queueId) return;
    setRefreshing(true);
    try {
      const res = await fetch(`${API}/service-queue/${queueId}/status`);
      if (res.ok) {
        const st = await res.json();
        setStatus(st);
      }
    } catch {} finally {
      setRefreshing(false);
    }
  };

  const handleBookWash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }
    if (!plateNumber.trim()) {
      setErr('Please enter vehicle registration number (e.g. DL 01 AB 1234)');
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
      
      // Save in local storage
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
  // RENDER: DIGITAL PASS & TOKEN RECEIPT (AFTER BOOKING)
  // ─────────────────────────────────────────────────────────────
  if (bookingResult) {
    const token = bookingResult.token;
    const estWait = bookingResult.estimatedWaitMin ?? (currentVehicle.estMinutes * Math.max(1, bookingResult.ahead || 0));

    return (
      <div className="w-full bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/30">
              {currentVehicle.icon}
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Wash Token Confirmed
              </span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">{service.seller || service.name}</h3>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {bookingMode === 'TOKEN' ? 'Live Queue Pass' : 'Reserved Slot'}
          </span>
        </div>

        {/* Token Number Display */}
        <div className="my-6 text-center relative z-10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Live Token</span>
          <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white mt-1 drop-shadow-md tracking-tight">
            #{token.tokenNumber || 'Confirmed'}
          </div>
          <p className="text-sm font-semibold text-cyan-200 mt-2">
            {bookingResult.ahead === 0 
              ? '🟢 Your turn! Drive directly into the wash bay.' 
              : `🚗 ${bookingResult.ahead} vehicles ahead · ~${estWait} mins wait`}
          </p>
        </div>

        {/* Vehicle & Plate Info */}
        <div className="grid grid-cols-2 gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 relative z-10 text-xs">
          <div>
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Vehicle</div>
            <div className="text-white font-extrabold text-sm mt-0.5">{currentVehicle.icon} {currentVehicle.name}</div>
            <div className="text-cyan-400 font-mono font-bold tracking-wider mt-0.5">{plateNumber.toUpperCase()}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Wash Fee</div>
            <div className="text-emerald-400 font-extrabold text-xl mt-0.5">₹{activePrice}</div>
            <div className="text-slate-400 text-[10px]">Pay on completion</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3 relative z-10">
          <Link
            href={`/salon/token/${token.id}`}
            className="flex-1 py-3.5 px-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm rounded-xl text-center shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" /> Track Live Token
          </Link>
          <button
            onClick={() => setBookingResult(null)}
            className="py-3.5 px-5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition-all"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: CLEAN, MINIMAL WASH BOOKING INTERFACE
  // ─────────────────────────────────────────────────────────────
  const servingToken = status?.serving?.tokenNumber;
  const waitingCount = status?.waitingCount ?? 0;
  const estWaitMin = (waitingCount + 1) * (currentVehicle.estMinutes || 25);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all">
      {/* ── Sleek Compact Header ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white p-5 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                  Express Wash
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Queue Active
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                Book Automobile Wash
              </h3>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-800/90 border border-slate-700 rounded-xl self-start sm:self-center">
            <button
              type="button"
              onClick={() => setBookingMode('TOKEN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                bookingMode === 'TOKEN'
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Drive-in (Live)</span>
            </button>
            <button
              type="button"
              onClick={() => setBookingMode('APPOINTMENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                bookingMode === 'APPOINTMENT'
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Slot</span>
            </button>
          </div>
        </div>

        {/* Live Queue Counter */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-800/60 rounded-xl py-2 px-2 border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Now Serving</div>
            <div className="text-base font-black text-cyan-400 mt-0.5">
              {servingToken ? `#${servingToken}` : 'Ready'}
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-xl py-2 px-2 border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Waiting</div>
            <div className="text-base font-black text-white mt-0.5">
              {waitingCount}
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-xl py-2 px-2 border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Est. Wait</div>
            <div className="text-base font-black text-emerald-400 mt-0.5">
              ~{estWaitMin}m
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Form: Clean & Focused on Vehicle + Plate ── */}
      <form onSubmit={handleBookWash} className="p-5 sm:p-6 space-y-5">

        {/* OPTION 1: SELECT VEHICLE (BIKE, CAR, TRUCK, BUS, JCB, HEAVY AUTOMOBILE) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              Select Vehicle
            </label>
            <span className="text-xs font-bold text-cyan-700">
              Selected: {currentVehicle.icon} {currentVehicle.name} • ₹{activePrice}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {vehicleList.map(v => {
              const isSelected = selectedVehicle.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVehicle(v)}
                  className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-cyan-600 bg-cyan-50/80 text-slate-900 shadow-md shadow-cyan-600/15 scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-cyan-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl mb-0.5">{v.icon}</span>
                  <span className="text-xs font-black leading-tight">{v.name}</span>
                  <span className={`text-[11px] font-black mt-1 ${isSelected ? 'text-cyan-700' : 'text-slate-500'}`}>
                    ₹{v.price}
                  </span>
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-cyan-600 text-white rounded-full flex items-center justify-center text-[8px] font-black">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* OPTION 2: VEHICLE NUMBER PLATE (IND EMBOSSED PLATE) */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Vehicle Number Plate (Registration) <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center rounded-2xl border-2 border-slate-300 bg-white shadow-inner focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-100 overflow-hidden">
            <div className="bg-blue-800 text-white px-3 py-3 text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center border-r border-blue-900 shrink-0">
              <span>🇮🇳</span>
              <span className="text-[8px] leading-tight mt-0.5">IND</span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. DL 01 AB 1234"
              value={plateNumber}
              onChange={e => setPlateNumber(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 text-base sm:text-lg font-black font-mono tracking-widest text-slate-900 outline-none uppercase placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* OPTIONAL DRIVER / CONTACT INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Driver / Contact Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-100 outline-none text-slate-900 text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Mobile Number (SMS Updates)
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-xs font-bold">
                +91
              </span>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2.5 rounded-r-xl border border-slate-300 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-100 outline-none text-slate-900 text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* APPOINTMENT PICKER (ONLY WHEN SCHEDULE SLOT IS CHOSEN) */}
        {bookingMode === 'APPOINTMENT' && (
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Wash Date</label>
              <input
                type="date"
                min={todayStr}
                value={appointmentDate}
                onChange={e => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-sm outline-none focus:border-cyan-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Arrival Time</label>
              <select
                value={appointmentTime}
                onChange={e => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-sm outline-none focus:border-cyan-600"
              >
                <option value="09:00">09:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="17:00">05:00 PM</option>
                <option value="18:30">06:30 PM</option>
              </select>
            </div>
          </div>
        )}

        {/* Error notification */}
        {err && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {/* ── Summary & Single Instant Button ── */}
        <div className="pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Wash Rate</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-900">₹{activePrice}</span>
                <span className="text-xs text-slate-600 font-bold">
                  • {currentVehicle.name} Wash
                </span>
              </div>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Pay directly after vehicle wash
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="py-3.5 px-7 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <span>Generating Token...</span>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  <span>
                    {bookingMode === 'TOKEN' ? `Get Wash Token (₹${activePrice})` : `Confirm Slot (₹${activePrice})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
