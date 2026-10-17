"use client";
import React, { useState, useEffect } from 'react';
import { useProducts } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin, Star, ShieldCheck, Clock, Calendar, CheckCircle2, PhoneCall,
  Info, Camera, Ticket, ArrowLeft, Share2, Heart, Zap, TrendingUp
} from 'lucide-react';
import SmartQueueWidget from '@/components/SmartQueueWidget';
import { useUserTrends } from '@/hooks/useUserTrends';
import ReviewsSection from '@/components/ReviewsSection';

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
  serving: { tokenNumber: number; customerName: string } | null;
  waiting: { id: string; tokenNumber: number; customerName: string; service: string }[];
  waitingCount: number; doneToday: number;
}
interface JoinResult {
  token: { id: string; tokenNumber: number; service: string };
  estimatedWaitMin: number; ahead: number;
}

// ─── Queue Widget ─────────────────────────────────────────────────────────────
// ─── Service Detail Page ──────────────────────────────────────────────────────
export default function ServiceDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { products, isLoading } = useProducts();
  const { user } = useAuth();

  const requireAuth = (action: () => void) => {
    if (!user) {
      router.push(`/login?redirect=/service/${id}`);
    } else {
      action();
    }
  };
  const { trackCategory, trackProductView } = useUserTrends();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState<'about' | 'included' | 'gallery'>('about');

  const service = products.find(p => p.id === id);

  useEffect(() => {
    if (service) {
      trackCategory(service.category);
      trackProductView(service.id);
    }
  }, [service?.id, service?.category]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] animate-pulse">
        <div className="w-full h-80 bg-slate-800"></div>
        <div className="max-w-[1200px] mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="w-full h-20 bg-slate-200 rounded-2xl mb-8"></div>
            <div className="w-full h-64 bg-slate-200 rounded-3xl mb-8"></div>
            <div className="w-full h-40 bg-slate-200 rounded-3xl"></div>
          </div>
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="w-full h-96 bg-slate-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
      <div className="text-6xl mb-6">✂️</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Service Not Found</h1>
      <p className="text-slate-500 mb-8">This service doesn&apos;t exist or was removed.</p>
      <Link href="/" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all">← Go Back</Link>
    </div>
  );

  const timeSlots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM", "06:00 PM"];
  const isWalkIn = WALK_IN_CATEGORIES.some(c =>
    service.category?.toLowerCase().includes(c) || service.name?.toLowerCase().includes(c)
  );

  const isEventOrPlanning = ['event', 'wedding', 'planner', 'planning', 'function', 'party', 'construction', 'building'].some(c =>
    service.category?.toLowerCase().includes(c) || service.name?.toLowerCase().includes(c)
  );

  const TABS = [
    { key: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
    { key: 'included', label: "What's Included", icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'gallery', label: 'Gallery', icon: <Camera className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">

      {/* ── Premium Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative bg-[#061224] overflow-hidden">
        {/* Dynamic mesh gradient background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[120%] bg-violet-600 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse"></div>
          <div className="absolute top-[20%] right-[-10%] w-[60%] h-[120%] bg-indigo-500 rounded-full blur-[140px] mix-blend-screen opacity-40"></div>
        </div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 lg:pt-10 lg:pb-24">
          {/* Back + actions */}
          <div className="flex items-center justify-between mb-6 lg:mb-10">
            <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white font-bold text-sm transition-colors group bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleWishlist(service.id)} 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border backdrop-blur-md ${isInWishlist(service.id) ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/30' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/20 hover:text-white hover:border-white/30'}`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist(service.id) ? 'fill-white' : ''}`} />
              </button>
              <button className="w-10 h-10 bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/30 text-white/70 hover:text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center lg:items-stretch">
            {/* Service Image Premium Card */}
            <div className="w-full sm:w-[80%] lg:w-[320px] aspect-[16/9] sm:aspect-[4/3] lg:aspect-[3/4] bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl overflow-hidden border border-white/20 flex items-center justify-center shrink-0 relative shadow-2xl shadow-indigo-900/50 group">
              {service.image ? (
                <img src={service.image || "/hero-left-logo.png"} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <span className="text-8xl drop-shadow-2xl">✂️</span>
                </div>
              )}
              {/* Category badge */}
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                {service.category}
              </div>
              {isWalkIn && (
                <div className="absolute bottom-4 left-4 right-4 bg-emerald-500/90 backdrop-blur-md border border-emerald-400/50 text-white px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 justify-center shadow-xl shadow-emerald-900/50">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> Live Token Queue Active
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 flex flex-col justify-center w-full">
              {/* Tags row matching card design */}
              <div className="flex flex-wrap items-center gap-2 mb-3 lg:mb-5">
                {service.badge && (
                  <span className={`px-3 py-1 rounded-full text-[10px] lg:text-xs font-bold uppercase shadow-xs ${
                    service.badgeColor === 'badge-gold' ? 'bg-amber-400 text-slate-900' : 'bg-red-500 text-white'
                  }`}>
                    {service.badge}
                  </span>
                )}
                {service.category && (
                  <span className="bg-white/15 border border-white/20 text-white text-[10px] lg:text-xs font-bold px-3 py-1 lg:px-4 lg:py-1.5 rounded-full uppercase tracking-wider">
                    {service.category} {service.subcategory ? `› ${service.subcategory}` : ''}
                  </span>
                )}
                {isWalkIn && (
                  <span className="bg-violet-500/20 border border-violet-400/30 text-violet-200 text-[10px] lg:text-xs font-bold px-3 py-1 lg:px-4 lg:py-1.5 rounded-full flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" /> Smart Queue
                  </span>
                )}
                <span className="bg-amber-500/20 border border-amber-400/30 text-amber-200 text-[10px] lg:text-xs font-bold px-3 py-1 lg:px-4 lg:py-1.5 rounded-full flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Instant Booking
                </span>
                <span className="bg-white/10 border border-white/20 text-white/80 text-[10px] lg:text-xs font-bold px-3 py-1 lg:px-4 lg:py-1.5 rounded-full flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Top Rated
                </span>
              </div>

              <h1 className="text-2xl lg:text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight mb-3 lg:mb-6 drop-shadow-md">
                {service.name}
              </h1>

              {/* Rating + Location */}
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 mb-4 lg:mb-8">
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400/20 to-amber-500/10 border border-amber-400/30 px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-xl lg:rounded-2xl backdrop-blur-md">
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 fill-amber-400 text-amber-400 drop-shadow-md" />
                  <span className="text-amber-300 font-black text-sm lg:text-base drop-shadow-md">{service.rating}</span>
                  <span className="text-amber-400/80 text-xs lg:text-sm font-medium">({service.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 font-medium text-xs lg:text-base bg-white/5 border border-white/10 px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-xl lg:rounded-2xl backdrop-blur-md">
                  <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-violet-300" />
                  {service._distance != null && service._distance !== Infinity ? `${service._distance.toFixed(1)} km away • ` : ''}
                  {service.location || 'Location unpinned'}
                </div>
              </div>

              {/* Provider card */}
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-xl lg:rounded-3xl p-1 flex flex-row items-center justify-between gap-2 lg:gap-4 max-w-2xl shadow-xl">
                <div className="flex items-center gap-2 lg:gap-4 pl-2 lg:pl-4 py-1.5 lg:py-2">
                  <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm lg:text-xl shadow-inner border border-white/20 shrink-0">
                    {service.seller.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white/50 text-[9px] lg:text-[10px] font-black uppercase tracking-widest mb-0.5">Service Provider</div>
                    <Link href={`/seller/${encodeURIComponent(service.seller.toLowerCase().replace(/ /g, '-'))}`}
                      className="text-white font-black text-sm lg:text-xl hover:text-violet-300 transition-colors drop-shadow-md line-clamp-1">
                      {service.seller}
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 lg:gap-3 pr-2 lg:pr-4 py-1.5 lg:py-0 shrink-0">
                  <span className="flex bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[8px] lg:text-xs px-2 py-0.5 lg:px-3 lg:py-1.5 rounded-full items-center gap-1 font-black shadow-inner">
                    <ShieldCheck className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5" /> Verified
                  </span>
                  <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs lg:text-sm font-semibold flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full"
                    onClick={() => alert(`Calling ${service.seller}...`)}>
                    <PhoneCall className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* ── Left: Detail Tabs ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Premium Tab Nav */}
          <div className="flex bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-xl p-1 gap-1 mb-6 shadow-sm">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* About */}
          {activeTab === 'about' && (
            <div className="space-y-2.5 lg:space-y-5">
              <div className="bg-white rounded-xl lg:rounded-3xl p-3 lg:p-7 border border-slate-100 shadow-sm">
                <h2 className="text-base lg:text-xl font-black text-slate-900 mb-1 lg:mb-4 flex items-center gap-1.5 lg:gap-2">
                  <Info className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-violet-600" /> About This Service
                </h2>
                <p className="text-slate-600 leading-relaxed text-xs lg:text-base">
                  {service.description || "Experience top-tier service tailored to your needs. Our professionals use the best practices and tools to ensure your complete satisfaction."}
                </p>
              </div>

              <div className="hidden sm:block bg-white rounded-3xl p-7 border border-slate-100 shadow-sm mt-5">
                <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-violet-600" /> Exact Address
                </h2>
                <p className="text-slate-600 leading-relaxed text-base font-medium">
                  {service.location || 'Address not provided'}
                </p>
              </div>

              {/* Stats strip */}
              <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl lg:rounded-2xl p-2 lg:p-4 shadow-sm divide-x divide-slate-100">
                {[
                  { val: service.rating, label: 'Rating', icon: '⭐' },
                  { val: service.reviews, label: 'Reviews', icon: '💬' },
                  { val: '100%', label: 'Satisfaction', icon: '✅' },
                ].map(s => (
                  <div key={s.label} className="flex-1 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5 lg:block">
                      <span className="text-sm lg:text-2xl lg:mb-1 block">{s.icon}</span>
                      <span className="text-slate-900 font-black text-sm lg:text-xl block">{s.val}</span>
                    </div>
                    <div className="text-slate-400 text-[9px] lg:text-xs font-semibold">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Smart Queue How it Works (only for walk-in) */}
              {isWalkIn && (
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl lg:rounded-3xl p-3 lg:p-7 border border-violet-100 shadow-sm">
                  <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-6">
                    <div className="w-7 h-7 lg:w-10 lg:h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg lg:rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                      <Ticket className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm lg:text-lg font-black text-slate-900 leading-tight">Smart Queue System</h2>
                      <p className="text-slate-500 text-[9px] lg:text-xs leading-tight">No appointments. Just walk in.</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar sm:grid sm:grid-cols-3 gap-2 lg:gap-3 pb-2 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0">
                    {[
                      { step: '01', icon: '🚶', title: 'Walk In Anytime', desc: 'No appointment. Show up whenever it\'s convenient.' },
                      { step: '02', icon: '🎫', title: 'Get a Token', desc: 'Enter your name, get an instant queue number.' },
                      { step: '03', icon: '📱', title: 'Track & Return', desc: 'See live wait time. Leave, come back just in time.' },
                    ].map(s => (
                      <div key={s.step} className="min-w-[85%] sm:min-w-0 shrink-0 snap-center bg-white/70 rounded-xl lg:rounded-2xl p-3 lg:p-5 border border-violet-100/50 relative">
                        <div className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 text-violet-200 text-[9px] lg:text-xs font-black">{s.step}</div>
                        <div className="text-xl lg:text-3xl mb-1 lg:mb-2">{s.icon}</div>
                        <div className="font-black text-slate-900 text-[11px] lg:text-sm mb-0.5 lg:mb-1">{s.title}</div>
                        <div className="text-slate-500 text-[9px] lg:text-xs leading-snug">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* What's Included */}
          {activeTab === 'included' && (
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6">What&apos;s Included</h2>
              <div className="space-y-3">
                {[
                  { item: 'Comprehensive consultation before service', tag: 'Consultation' },
                  { item: 'Professional-grade equipment and materials', tag: 'Premium' },
                  { item: 'Post-service cleanup and inspection', tag: 'Quality' },
                  { item: 'Satisfaction guarantee — redo if unhappy', tag: 'Guarantee' },
                  { item: 'Expert stylist with 5+ years experience', tag: 'Expert' },
                  { item: 'Hygienic tools, sanitized before every use', tag: 'Hygiene' },
                ].map((obj, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-violet-200 transition-colors group">
                    <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 font-semibold flex-1">{obj.item}</span>
                    <span className="text-violet-600 text-xs font-black bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full">{obj.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {activeTab === 'gallery' && (
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900">Gallery / Past Work</h2>
                <span className="text-slate-400 text-sm">6 photos</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden border border-slate-100 hover:scale-[1.02] transition-transform cursor-pointer group relative">
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-slate-300 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors rounded-2xl" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Booking / Queue Widget ─────────────────────────────── */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="sticky top-6 space-y-4">

            {/* Price card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg">
              <div className="flex items-end justify-between mb-5 pb-5 border-b border-slate-100">
                <div>
                  <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">
                    {service.category === 'Transport' ? 'Estimated Base Fare' : 'Starting Price'}
                  </div>
                  <div className="text-4xl font-black text-slate-900 flex items-baseline gap-1">
                    ₹{service.price.toLocaleString('en-IN')}
                    <span className="text-base font-semibold text-slate-400">
                      /{service.category === 'Transport' ? 'km' : 'session'}
                    </span>
                  </div>
                </div>
                {isWalkIn && (
                  <div className="text-right">
                    <div className="text-slate-400 text-xs font-semibold">Per Hour</div>
                    <div className="text-violet-600 font-black">Premium Rate</div>
                  </div>
                )}
              </div>

              {/* Walk-in Smart Queue OR Appointment */}
              {isWalkIn ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <h3 className="font-black text-slate-900">Live Queue Status</h3>
                  </div>
                  <SmartQueueWidget key={service.id} service={service} />
                </>
              ) : isEventOrPlanning ? (
                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-3xl p-6 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-400 rounded-full blur-3xl opacity-10"></div>
                  <h3 className="font-black text-slate-900 mb-2 flex items-center gap-2 relative z-10">
                    <Calendar className="w-5 h-5 text-violet-600" /> Schedule Consultation
                  </h3>
                  <p className="text-slate-600 text-sm mb-5 relative z-10 font-medium">Get a custom quote & discuss your vision.</p>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="bg-white/80 backdrop-blur border border-white focus-within:border-violet-300 rounded-2xl flex items-center px-4 py-1 shadow-sm transition-all">
                      <span className="text-violet-400">📅</span>
                      <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                        className="w-full p-3 outline-none bg-transparent text-slate-800 font-semibold cursor-pointer" />
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur border border-white focus-within:border-violet-300 rounded-2xl p-4 shadow-sm transition-all">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Project Details</label>
                      <textarea 
                        rows={3} 
                        placeholder="Briefly describe your requirements, guest count, or scope..." 
                        className="w-full outline-none bg-transparent text-slate-800 resize-none font-medium text-sm placeholder:text-slate-300" 
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => requireAuth(() => {
                      if (!selectedDate) { alert('Please select a date'); return; }
                      alert(`Meeting scheduled with ${service.seller} on ${selectedDate}`);
                    })}
                    className="w-full mt-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-violet-200 flex items-center justify-center gap-2 relative z-10 group">
                    Request Meeting <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              ) : service.category === 'Transport' ? (
                <>
                  <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">🚚 Plan Your Route</h3>
                  <div className="space-y-3 mb-5">
                    <select className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-violet-400 bg-slate-50 text-slate-700 font-semibold transition-colors">
                      <option>-- Select Vehicle Type --</option>
                      <option>Mini Truck (1 Ton)</option>
                      <option>Medium Truck (3–5 Tons)</option>
                      <option>Heavy Freight (10+ Tons)</option>
                      <option>Trailer (20+ Tons)</option>
                    </select>
                    <div className="bg-slate-50 border-2 border-slate-100 focus-within:border-violet-400 rounded-2xl flex items-center px-4 transition-colors">
                      <span className="text-indigo-500">📍</span>
                      <input type="text" placeholder="Pickup Location" className="w-full p-3.5 outline-none bg-transparent text-slate-700 font-medium" />
                    </div>
                    <div className="bg-slate-50 border-2 border-slate-100 focus-within:border-violet-400 rounded-2xl flex items-center px-4 transition-colors">
                      <span className="text-rose-500">🚩</span>
                      <input type="text" placeholder="Drop Location" className="w-full p-3.5 outline-none bg-transparent text-slate-700 font-medium" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" className="p-3.5 border-2 border-slate-100 focus:border-violet-400 rounded-2xl outline-none text-slate-700 font-medium bg-slate-50 transition-colors" />
                      <input type="time" className="p-3.5 border-2 border-slate-100 focus:border-violet-400 rounded-2xl outline-none text-slate-700 font-medium bg-slate-50 transition-colors" />
                    </div>
                  </div>
                  <button 
                    onClick={() => requireAuth(() => alert('Estimate & booking generated!'))}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-slate-200">
                    Get Estimate &amp; Book
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-600" /> Book Appointment
                  </h3>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    className="w-full p-4 border-2 border-slate-100 focus:border-violet-400 rounded-2xl outline-none text-slate-700 font-semibold mb-4 bg-slate-50 transition-colors" />
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest mb-3">
                      <Clock className="w-3.5 h-3.5" /> Available Slots
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map(t => (
                        <button key={t} onClick={() => setSelectedTime(t)}
                          className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                            selectedTime === t
                              ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                              : 'bg-slate-50 text-slate-700 border-slate-100 hover:border-violet-300 hover:bg-violet-50'
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => requireAuth(() => {
                      if (!selectedDate || !selectedTime) { alert('Please select date & time'); return; }
                      alert(`Confirmed: ${service.name} on ${selectedDate} at ${selectedTime}`);
                    })}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-slate-200 mb-3">
                    Confirm Appointment
                  </button>
                </>
              )}
            </div>

            {/* Call CTA - Hidden on mobile because it's in the header provider card */}
            <button onClick={() => alert(`Calling ${service.seller}...`)}
              className="hidden lg:flex w-full py-4 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 rounded-2xl font-black transition-all items-center justify-center gap-2 shadow-sm">
              <PhoneCall className="w-4 h-4 text-violet-600" /> Call Provider Directly
            </button>

            {/* Trust badges - Hidden on mobile to save space */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: '🔒', label: 'Secure' },
                  { icon: '⚡', label: 'Instant' },
                  { icon: '💯', label: 'Verified' },
                ].map(b => (
                  <div key={b.label}>
                    <div className="text-xl mb-1">{b.icon}</div>
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider">{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <ReviewsSection entityId={service.id} entityType="SERVICE" />
      </div>
    </div>
  );
}
