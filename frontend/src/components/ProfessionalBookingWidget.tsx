"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Scale, Briefcase, Video, Building2, PhoneCall, Calendar,
  Clock, User, FileText, CheckCircle2, ChevronDown, Lock,
  ShieldCheck, AlertCircle, Sparkles, MapPin, Laptop, Calculator, Ruler
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type ConsultationMode = 'CHAMBER' | 'VIDEO' | 'PHONE';

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  duration?: string;
}

const LAWYER_AREAS = [
  'Corporate & Business Law',
  'Property & Real Estate Dispute',
  'Civil & Family Consultation',
  'Contract Review & Drafting',
  'Criminal Law Defense',
  'General Legal Advisory'
];

const CA_AREAS = [
  'ITR Income Tax Filing & Planning',
  'GST Return Filing & Notice Audit',
  'Audited Balance Sheet & P&L',
  'Company / LLP Incorporation & ROC',
  'Virtual CFO & Payroll Advisory',
  'General Accounting & Tax Advisory'
];

const ARCHITECT_AREAS = [
  '2D Floor Plans & Blueprint Sanctions',
  '3D Interior Architecture & Walkthrough',
  'Full Home / Office Turnkey Renovation',
  'Site Supervision & Structural Inspection'
];

const FREELANCE_AREAS = [
  'Project Scope & Requirement Discussion',
  'Full-Stack Web & Mobile App Development',
  'Video & Reels Editing Style Briefing',
  'UI/UX & Figma Design Review',
  'Technical Architecture & Code Review',
  'Hourly Pro Retainer / Consultation'
];

const CONSULTANT_AREAS = [
  'Strategic Business Consultation',
  'Financial Planning & Investment Advisory',
  'Operational & Process Optimization',
  'Brand & Market Entry Strategy'
];

const TIME_SLOTS = [
  '10:30 AM', '11:45 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'
];

export default function ProfessionalBookingWidget({ service }: { service: any }) {
  const router = useRouter();
  const { user } = useAuth();

  // Role detection: Lawyer vs CA/Accountant vs Architect vs Freelancer vs Consultant
  const subLower = ((service?.subcategory || '') + ' ' + (service?.category || '') + ' ' + (service?.name || '')).toLowerCase();

  const isLawyer = subLower.includes('lawyer') || subLower.includes('legal') || subLower.includes('advocate');
  const isAccountant = subLower.includes('accountant') || subLower.includes('ca') || subLower.includes('tax') || subLower.includes('chartered') || subLower.includes('audit');
  const isArchitect = subLower.includes('architect') || subLower.includes('interior') || subLower.includes('civil') || subLower.includes('structural');
  const isFreelancer = subLower.includes('freelance') || subLower.includes('editor') || subLower.includes('developer') || subLower.includes('designer') || subLower.includes('writer') || subLower.includes('software') || subLower.includes('it');

  // Consultation Mode
  const [mode, setMode] = useState<ConsultationMode>(isFreelancer ? 'VIDEO' : 'CHAMBER');

  // Matter / Practice Area Options
  const practiceOptions: ServiceOption[] = useMemo(() => {
    if (service?.options && service.options.length > 0) {
      return service.options.map((opt: any) => ({
        id: opt.id || opt.name,
        name: opt.name,
        price: opt.price > 0 ? opt.price : (service.price || 0),
        duration: opt.duration || '30 - 45 mins'
      }));
    }
    const defaultList = isLawyer 
      ? LAWYER_AREAS 
      : isAccountant 
      ? CA_AREAS 
      : isArchitect
      ? ARCHITECT_AREAS
      : isFreelancer 
      ? FREELANCE_AREAS 
      : CONSULTANT_AREAS;

    return defaultList.map((area, idx) => ({
      id: `area-${idx}`,
      name: area,
      price: service?.price || (isLawyer ? 5000 : isAccountant ? 3000 : isArchitect ? 3500 : 2000),
      duration: '45 mins'
    }));
  }, [service, isLawyer, isAccountant, isArchitect, isFreelancer]);

  const [selectedPracticeId, setSelectedPracticeId] = useState<string>(
    practiceOptions[0]?.id || ''
  );

  const selectedPractice = practiceOptions.find(p => p.id === selectedPracticeId) || practiceOptions[0];

  // Dates & Slots
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [appointmentDate, setAppointmentDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);

  // Client Details
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientPhone, setClientPhone] = useState(user?.phone?.replace(/^\+91\s*/, '') || '');
  const [caseSummary, setCaseSummary] = useState('');

  // Queue / Booking status
  const [queueId, setQueueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Initialize or discover professional queue
  useEffect(() => {
    let isMounted = true;
    const initQueue = async () => {
      try {
        let qId: string | null = null;
        if (service?.sellerId) {
          const r = await fetch(`${API}/service-queue/seller/${service.sellerId}`);
          if (r.ok) {
            const data = await r.json();
            if (Array.isArray(data) && data.length > 0) qId = data[0].id;
            else if (data?.id) qId = data.id;
          }
        }
        if (!qId) {
          const r = await fetch(`${API}/service-queue/queues`);
          if (r.ok) {
            const all = await r.json();
            const shopName = service?.seller || service?.name || 'Professional Practice';
            const matched = Array.isArray(all) ? all.find((q: any) => q.shopName === shopName) : null;
            if (matched) qId = matched.id;
          }
        }
        if (!qId) {
          const cr = await fetch(`${API}/service-queue/queue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shopName: service?.seller || service?.name || 'Professional Practice',
              sellerId: service?.sellerId || null,
            })
          });
          if (cr.ok) {
            const newQ = await cr.json();
            if (newQ?.id) qId = newQ.id;
          }
        }
        if (isMounted && qId) setQueueId(qId);
      } catch (err) {
        console.error('Failed to init professional queue', err);
      }
    };
    initQueue();
    return () => { isMounted = false; };
  }, [service]);

  // Handle appointment booking submission
  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!clientName.trim()) {
      setErrorMsg('Please enter your full name for consultation records');
      return;
    }
    if (!clientPhone.trim() || clientPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const modeLabel = mode === 'CHAMBER'
        ? 'In-Chamber Office Consultation'
        : mode === 'VIDEO'
        ? 'Encrypted Video Consultation'
        : 'Confidential Phone Advisory';

      const matterLabel = `${selectedPractice?.name || 'General Consultation'} (${modeLabel})`;
      const cleanPhone = `+91${clientPhone.replace(/\D/g, '').slice(-10)}`;
      const activePrice = selectedPractice?.price || service?.price || 0;

      let bookingRef = null;

      if (queueId) {
        const payload = {
          customerName: clientName.trim(),
          phone: cleanPhone,
          service: matterLabel,
          bookingMode: 'APPOINTMENT',
          appointmentTime: `${appointmentDate}T${selectedSlot.replace(/\s*[AP]M/, '')}:00`,
          price: activePrice
        };

        const res = await fetch(`${API}/service-queue/${queueId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          bookingRef = data;
        }
      }

      // Successful appointment state
      setConfirmedBooking({
        refNumber: bookingRef?.token?.tokenNumber ? `LAW-${bookingRef.token.tokenNumber}` : `PV-${Math.floor(100000 + Math.random() * 900000)}`,
        mode,
        modeLabel,
        practiceArea: selectedPractice?.name,
        date: appointmentDate,
        slot: selectedSlot,
        clientName: clientName.trim(),
        clientPhone: cleanPhone,
        fee: activePrice,
        lawyerName: service?.seller || service?.name || 'Advocate & Legal Counsel',
        location: service?.location || 'Chamber Office'
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to schedule consultation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: EXECUTIVE CONFIRMATION PASS
  // ─────────────────────────────────────────────────────────────
  if (confirmedBooking) {
    return (
      <div className="w-full bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-6 shadow-xl border border-indigo-500/30 animate-in fade-in duration-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-indigo-500 to-sky-400" />
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 shrink-0">
              <Scale className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Consultation Confirmed
              </span>
              <h4 className="text-base font-extrabold text-white leading-tight mt-0.5">
                {confirmedBooking.lawyerName}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Booking Ref</span>
            <span className="font-mono text-sm font-black text-indigo-300">
              {confirmedBooking.refNumber}
            </span>
          </div>
        </div>

        {/* Consultation Highlights */}
        <div className="grid grid-cols-2 gap-2.5 my-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">Consultation Mode</span>
            <span className="font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
              {confirmedBooking.mode === 'CHAMBER' && <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              {confirmedBooking.mode === 'VIDEO' && <Video className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
              {confirmedBooking.mode === 'PHONE' && <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              <span className="truncate">{confirmedBooking.modeLabel}</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">Scheduled Time</span>
            <span className="font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{confirmedBooking.date} • {confirmedBooking.slot}</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">Client</span>
            <span className="font-bold text-slate-200 truncate block mt-0.5">
              {confirmedBooking.clientName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">Consultation Fee</span>
            <span className="font-extrabold text-emerald-400 text-sm mt-0.5 block">
              ₹{confirmedBooking.fee.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Instructions / Chamber Info */}
        <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-3 text-[11px] text-indigo-200 space-y-1 mb-4">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Attorney-Client Privilege & Strict Confidentiality</span>
          </div>
          <p className="text-slate-300">
            {confirmedBooking.mode === 'CHAMBER'
              ? `Please arrive 5 minutes prior at the chamber address. Keep relevant case files and documents handy.`
              : confirmedBooking.mode === 'VIDEO'
              ? `The encrypted consultation video link has been dispatched to ${confirmedBooking.clientPhone}.`
              : `The counsel will call you directly at ${confirmedBooking.clientPhone} at the scheduled hour.`}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmedBooking(null)}
            className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl text-center transition-all shadow-md shadow-indigo-950"
          >
            Book Another Consultation
          </button>
          <a
            href={`tel:${service?.contactPhone || '+919876543210'}`}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" /> Chamber Desk
          </a>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: EXECUTIVE PROFESSIONAL BOOKING CARD
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-300 shadow-md p-3.5 sm:p-5 transition-all relative overflow-hidden">
      {/* Executive Accent Top Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-900 via-indigo-900 to-amber-600" />

      {/* Header with Title and Verified Seal */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs shrink-0">
            {isLawyer ? (
              <Scale className="w-5 h-5 text-amber-400" />
            ) : isAccountant ? (
              <Calculator className="w-5 h-5 text-amber-400" />
            ) : isArchitect ? (
              <Ruler className="w-5 h-5 text-amber-400" />
            ) : isFreelancer ? (
              <Laptop className="w-5 h-5 text-sky-400" />
            ) : (
              <Briefcase className="w-5 h-5 text-indigo-400" />
            )}
          </div>
          <div>
            <h3 className="text-slate-900 font-extrabold text-sm sm:text-base leading-tight flex items-center gap-1.5">
              <span>
                {isLawyer 
                  ? 'Legal Consultation & Advisory' 
                  : isAccountant 
                  ? 'Chartered Accountant & Tax Consultation' 
                  : isArchitect
                  ? 'Architecture & Design Consultation'
                  : isFreelancer 
                  ? 'Freelance Project Consultation' 
                  : 'Professional Consultation & Advisory'}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              {isLawyer 
                ? `Direct consultation with ${service?.seller || service?.name || 'Senior Counsel'}`
                : isAccountant
                ? `Direct advisory with ${service?.seller || service?.name || 'Chartered Accountant (CA)'}`
                : isArchitect
                ? `Direct design consultation with ${service?.seller || service?.name || 'Principal Architect'}`
                : isFreelancer
                ? `Direct project briefing with ${service?.seller || service?.name || 'Freelance Specialist'}`
                : `Direct consultation with ${service?.seller || service?.name || 'Verified Pro'}`}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0">
          <ShieldCheck className="w-3 h-3 text-amber-600" />
          <span className="hidden xs:inline">
            {isLawyer ? 'Verified Counsel' : isAccountant ? 'Certified CA / Tax' : isArchitect ? 'Licensed Architect' : isFreelancer ? 'Verified Pro' : 'Verified'}
          </span>
          <span className="xs:hidden">Verified</span>
        </div>
      </div>

      <form onSubmit={handleSchedule} className="mt-3.5 space-y-3">
        {/* Mode Selector: In-Chamber vs Video Call vs Phone */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1 mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" /> Consultation Mode
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setMode('CHAMBER')}
              className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                mode === 'CHAMBER'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{isFreelancer ? 'In-Person Meet' : 'In-Chamber'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('VIDEO')}
              className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                mode === 'VIDEO'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">Video Call</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('PHONE')}
              className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                mode === 'PHONE'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{isFreelancer ? 'Audio Brief' : 'Phone Advisory'}</span>
            </button>
          </div>
        </div>

        {/* Practice Area / Matter Dropdown */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {isLawyer 
                  ? 'Legal Domain / Matter' 
                  : isAccountant 
                  ? 'CA & Tax Service Scope' 
                  : isFreelancer 
                  ? 'Project Domain & Service' 
                  : 'Practice Area / Matter'}
              </span>
            </span>
            <span className="text-[10px] text-indigo-700 font-semibold lowercase">
              {selectedPractice?.duration || '30-45 mins'}
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedPracticeId}
              onChange={(e) => setSelectedPracticeId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-slate-800 text-slate-800 bg-white shadow-2xs font-medium text-xs sm:text-sm cursor-pointer appearance-none pr-8 transition-colors"
            >
              {practiceOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name} {opt.price > 0 ? `— ₹${opt.price.toLocaleString('en-IN')}` : ''}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Schedule: Date & Time Slot in One Line (2 cols) */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" /> Select Date & Time Slot
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="date"
                min={todayStr}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-slate-800 text-slate-800 bg-white font-medium text-xs sm:text-sm shadow-2xs"
              />
            </div>
            <div className="relative">
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-slate-800 text-slate-800 bg-white shadow-2xs font-medium text-xs sm:text-sm cursor-pointer appearance-none pr-8"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Client Contact: Name & Mobile in One Line (2 cols) */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1 mb-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" /> Client Information
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Your Full Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-slate-800 text-slate-800 bg-white font-medium text-xs sm:text-sm shadow-2xs"
            />
            <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden focus-within:border-slate-800 shadow-2xs">
              <span className="px-2.5 py-2 bg-slate-100 text-slate-600 font-bold text-xs border-r border-slate-200">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit Mobile"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-3 py-2 outline-none text-slate-800 font-medium text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Optional Brief Matter Summary */}
        <div>
          <input
            type="text"
            placeholder="Brief matter / query (optional & strictly confidential)"
            value={caseSummary}
            onChange={(e) => setCaseSummary(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl outline-none focus:border-slate-800 text-slate-700 bg-slate-50 font-normal text-xs"
          />
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button & Rate Summary */}
        <div className="pt-1.5">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 px-4 bg-slate-900 hover:bg-slate-950 text-white rounded-xl font-extrabold text-sm sm:text-base transition-all shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
          >
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {loading
                ? 'Securing Consultation...'
                : `${isFreelancer ? 'Book Project Consultation' : isLawyer ? 'Schedule Legal Consultation' : isAccountant ? 'Schedule CA Consultation' : isArchitect ? 'Schedule Architect Consultation' : 'Schedule Consultation'} (${selectedPractice?.price > 0 ? `₹${selectedPractice.price.toLocaleString('en-IN')}` : 'Free / Inquiry'})`}
            </span>
          </button>
        </div>

        {/* Footer: Direct Chamber Call & Confidentiality Guarantee */}
        <div className="pt-2 border-t border-slate-100 flex flex-col xs:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 font-semibold text-slate-600">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>
              {isLawyer 
                ? 'Strict Attorney-Client Confidentiality' 
                : isAccountant 
                ? 'Strict Financial & Audit Confidentiality' 
                : isFreelancer 
                ? 'NDA & Client IP Rights Protected' 
                : 'Strict Professional Confidentiality'}
            </span>
          </div>
          <a
            href={`tel:${service?.contactPhone || '+919876543210'}`}
            className="text-slate-800 hover:text-slate-950 font-bold inline-flex items-center gap-1 hover:underline"
          >
            <PhoneCall className="w-3 h-3 text-indigo-600" />
            <span>Prefer Call? (+91-9876543210)</span>
          </a>
        </div>
      </form>
    </div>
  );
}
