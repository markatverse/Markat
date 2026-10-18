"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Ticket, Clock, Users, ChevronRight, Loader2, RefreshCw } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// ─── Inline Live Queue Mini-Widget ───────────────────────────────────────────
interface QueueSummary {
  id: string;
  shopName: string;
  currentToken: number;
  lastToken: number;
  avgMinutes: number;
  isOpen: boolean;
}

function LiveQueueBadge() {
  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQueues = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch(`${API}/service-queue/queues`);
      const data = await res.json();
      setQueues(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(() => fetchQueues(), 20000);
    return () => clearInterval(interval);
  }, [fetchQueues]);

  const openQueues = queues.filter(q => q.isOpen);
  const totalWaiting = openQueues.reduce((s, q) => s + Math.max(0, q.lastToken - q.currentToken), 0);

  if (loading) {
    return (
      <div className="mt-5 flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 text-pink-400 animate-spin" />
      </div>
    );
  }

  if (openQueues.length === 0) {
    return (
      <div className="mt-5 bg-white/60 border border-dashed border-pink-200 rounded-2xl p-4 text-center">
        <p className="text-pink-400 text-sm font-medium">No salon queues active right now</p>
        <Link href="/salon/manage" className="text-pink-600 text-xs font-bold underline mt-1 inline-block">
          Set up a queue →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-pink-700 text-xs font-bold uppercase tracking-widest">Live Queue</span>
        </div>
        <button onClick={() => fetchQueues(true)} className="text-pink-300 hover:text-pink-600 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary strip */}
      <div className="bg-white border border-pink-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-pink-600 font-black text-xl leading-none">{openQueues.length}</div>
            <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Salons Open</div>
          </div>
          <div className="w-px h-8 bg-pink-100" />
          <div className="text-center">
            <div className="text-slate-900 font-black text-xl leading-none">{totalWaiting}</div>
            <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">In Queue</div>
          </div>
          <div className="w-px h-8 bg-pink-100" />
          <div className="text-center">
            <div className="text-slate-900 font-black text-xl leading-none">
              ~{openQueues[0] ? (Math.max(0, openQueues[0].lastToken - openQueues[0].currentToken) + 1) * openQueues[0].avgMinutes : 0}m
            </div>
            <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Wait if join</div>
          </div>
        </div>
        <Link
          href="/salon/join"
          className="bg-pink-600 hover:bg-pink-500 text-white font-black text-xs px-3 py-2 rounded-xl transition-all shadow-md shadow-pink-200 flex items-center gap-1 whitespace-nowrap"
        >
          <Ticket className="w-3.5 h-3.5" /> Get Token
        </Link>
      </div>

      {/* Per-salon rows */}
      {openQueues.slice(0, 2).map(q => {
        const waiting = Math.max(0, q.lastToken - q.currentToken);
        return (
          <div key={q.id} className="bg-white border border-pink-100 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-base">✂️</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-900 font-bold text-sm truncate">{q.shopName}</div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" /> {waiting} waiting
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Serving #{q.currentToken}
                </span>
              </div>
            </div>
            <Link
              href={`/salon/join`}
              className="text-pink-600 hover:text-pink-700 transition-colors shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        );
      })}

      {openQueues.length > 2 && (
        <div className="text-center text-pink-400 text-xs">+{openQueues.length - 2} more salons</div>
      )}

      {/* Footer actions */}
      <div className="flex gap-2 pt-1">
        <Link
          href="/salon/join"
          className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-pink-200/50 flex items-center justify-center gap-1.5"
        >
          <Ticket className="w-4 h-4" /> Walk In &amp; Get Token
        </Link>
      </div>
    </div>
  );
}

// ─── Main Services Page ───────────────────────────────────────────────────────
export default function ServicesPage() {
  const serviceSections = [
    {
      id: 'logistics',
      title: 'Logistics & Transport',
      subtitle: 'Freight & Delivery',
      theme: 'indigo',
      link: '/search?cat=Transport',
      items: [
        { name: 'Heavy Freight Movers', type: 'Trucking & Cargo', rating: '4.9', icon: '🚛', link: '/search?q=Freight' },
        { name: 'Interstate Transport', type: 'Logistics', rating: '4.8', icon: '📦', link: '/search?q=Logistics' },
        { name: 'City Delivery Fleet', type: 'Local Delivery', rating: '4.7', icon: '🚚', link: '/search?q=Delivery' },
        { name: 'Premium Car Hire', type: 'Car Rental & Taxi', rating: '4.8', icon: '🚕', link: '/search?q=Car%20Rental' }
      ]
    },
    {
      id: 'home-services',
      title: 'Home Services & Repairs',
      subtitle: 'Maintenance & Setup',
      theme: 'emerald',
      link: '/search?cat=Home%20Services',
      items: [
        { name: 'AC Repair Service', type: 'Cooling & HVAC', rating: '4.9', icon: '❄️', link: '/search?cat=Home%20Services&q=AC' },
        { name: 'Appliance Fixing', type: 'Home Maintenance', rating: '4.6', icon: '🔌', link: '/search?cat=Home%20Services&q=Appliance' },
        { name: 'Quick Plumbing Co.', type: 'Plumbing Services', rating: '4.7', icon: '🚰', link: '/search?cat=Home%20Services&q=Plumbing' },
        { name: 'Deep Clean Services', type: 'House Cleaning', rating: '4.8', icon: '🧹', link: '/search?cat=Home%20Services&q=Cleaning' }
      ]
    },
    {
      id: 'business',
      title: 'Business Consulting',
      subtitle: 'Professional Services',
      theme: 'blue',
      link: '/search?cat=Services&q=Consulting',
      items: [
        { name: 'Financial Advisory', type: 'Finance', rating: '4.9', icon: '📈', link: '/search?q=Finance' },
        { name: 'Legal Services', type: 'Legal', rating: '4.7', icon: '⚖️', link: '/search?q=Legal' },
        { name: 'Marketing Agency', type: 'Digital Marketing', rating: '4.8', icon: '📱', link: '/search?q=Marketing' },
        { name: 'IT Support & Setup', type: 'Technology', rating: '4.9', icon: '💻', link: '/search?q=IT' }
      ]
    },
    {
      id: 'personal-care',
      title: 'Salon, Spa & Beauty',
      subtitle: 'Personal Care',
      theme: 'pink',
      link: '/search?cat=Services',
      // Smart Queue enabled for this sector
      hasSmartQueue: true,
      items: [
        { name: 'Unisex Salons & Hair', type: 'Hair Cutting', rating: '4.8', icon: '✂️', link: '/search?cat=Services&q=Hair' },
        { name: 'Spa & Wellness Centers', type: 'Massage & Pedicure', rating: '4.9', icon: '💆‍♀️', link: '/search?cat=Services&q=Spa' },
        { name: 'Nail Studios', type: 'Nail Art', rating: '4.7', icon: '💅', link: '/search?cat=Services&q=Nail' },
        { name: 'Makeup Artists', type: 'Bridal Styling', rating: '4.9', icon: '💄', link: '/search?cat=Services&q=Makeup' }
      ]
    },
    {
      id: 'organizers',
      title: 'Event Organizers',
      subtitle: 'Events & Projects',
      theme: 'purple',
      link: '/search?cat=Organizers',
      items: [
        { name: 'Dream Events & Weddings', type: 'Event Organizer', rating: '4.9', icon: '🎉', link: '/search?cat=Organizers&q=Events' },
        { name: 'Luxury Party Planners', type: 'Party Organizer', rating: '4.8', icon: '🥂', link: '/search?cat=Organizers&q=Party' },
        { name: 'Grand Stage Decorators', type: 'Wedding Planner', rating: '4.9', icon: '💐', link: '/search?cat=Organizers&q=Stage' },
        { name: 'Corporate Event Hosts', type: 'Corporate Events', rating: '4.7', icon: '🏢', link: '/search?cat=Organizers&q=Corporate' }
      ]
    }
  ];

  // Helper for theme classes
  const getThemeClasses = (theme: string) => {
    switch(theme) {
      case 'amber': return { bg: 'bg-amber-50', border: 'border-amber-200', textLight: 'text-amber-700', btnBg: 'bg-amber-600', btnHover: 'hover:bg-amber-700', iconBg: 'bg-amber-50', iconText: 'text-amber-600', groupHover: 'group-hover:bg-amber-600', glow: 'bg-amber-500/10' };
      case 'blue': return { bg: 'bg-blue-50', border: 'border-blue-200', textLight: 'text-blue-700', btnBg: 'bg-blue-600', btnHover: 'hover:bg-blue-700', iconBg: 'bg-blue-50', iconText: 'text-blue-600', groupHover: 'group-hover:bg-blue-600', glow: 'bg-blue-500/10' };
      case 'emerald': return { bg: 'bg-emerald-50', border: 'border-emerald-200', textLight: 'text-emerald-700', btnBg: 'bg-emerald-600', btnHover: 'hover:bg-emerald-700', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', groupHover: 'group-hover:bg-emerald-600', glow: 'bg-emerald-500/10' };
      case 'pink': return { bg: 'bg-pink-50', border: 'border-pink-200', textLight: 'text-pink-700', btnBg: 'bg-pink-600', btnHover: 'hover:bg-pink-700', iconBg: 'bg-pink-50', iconText: 'text-pink-600', groupHover: 'group-hover:bg-pink-600', glow: 'bg-pink-500/10' };
      case 'purple': return { bg: 'bg-purple-50', border: 'border-purple-200', textLight: 'text-purple-700', btnBg: 'bg-purple-600', btnHover: 'hover:bg-purple-700', iconBg: 'bg-purple-50', iconText: 'text-purple-600', groupHover: 'group-hover:bg-purple-600', glow: 'bg-purple-500/10' };
      case 'indigo': return { bg: 'bg-indigo-50', border: 'border-indigo-200', textLight: 'text-indigo-700', btnBg: 'bg-indigo-600', btnHover: 'hover:bg-indigo-700', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600', groupHover: 'group-hover:bg-indigo-600', glow: 'bg-indigo-500/10' };
      case 'slate': default: return { bg: 'bg-slate-50', border: 'border-slate-200', textLight: 'text-slate-700', btnBg: 'bg-slate-700', btnHover: 'hover:bg-slate-800', iconBg: 'bg-slate-100', iconText: 'text-slate-700', groupHover: 'group-hover:bg-slate-700', glow: 'bg-slate-500/10' };
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-5 md:p-10 min-h-screen bg-white">
      
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-600 mb-4 tracking-tight">Services Directory</h1>
        <p className="text-slate-500 text-lg">Browse professional solutions that drive your success, from logistics to personal care.</p>
      </div>

      <div className="flex flex-col gap-10">
        {serviceSections.map((section) => {
          const t = getThemeClasses(section.theme);
          const isSmartQueue = (section as typeof section & { hasSmartQueue?: boolean }).hasSmartQueue;
          
          return (
            <section key={section.id} className={`${t.bg} p-8 rounded-3xl border ${t.border} shadow-sm relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 w-64 h-64 ${t.glow} rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3`} />
              <div className={`absolute bottom-0 right-0 w-96 h-96 ${t.glow} rounded-full blur-3xl translate-y-1/3 translate-x-1/3`} />
              
              {/* Section header */}
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-end border-b ${t.border} pb-4 mb-8 relative z-10 gap-4`}>
                <div>
                  <div className="flex items-center gap-3">
                    <div className={`text-[11px] font-bold ${t.textLight} tracking-widest uppercase mb-1.5`}>{section.subtitle}</div>
                    {isSmartQueue && (
                      <div className="flex items-center gap-1.5 bg-pink-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Smart Queue
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">{section.title}</h2>
                </div>
                <Link href={section.link} className={`${t.btnBg} text-white px-5 py-2.5 rounded-xl text-sm font-bold ${t.btnHover} transition-colors shadow-lg whitespace-nowrap`}>
                  Explore All ➤
                </Link>
              </div>

              {/* Layout: items grid + queue widget side-by-side for personal-care */}
              <div className={`relative z-10 ${isSmartQueue ? 'flex flex-col lg:flex-row gap-6' : ''}`}>
                
                {/* Service Items Grid */}
                <div className={`grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5 ${isSmartQueue ? 'flex-1' : ''}`}>
                  {section.items.map((item, i) => (
                    <Link key={i} href={item.link} className="no-underline text-inherit outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl">
                      <div className={`bg-white p-5 rounded-2xl border ${t.border} shadow-sm hover:shadow-md flex items-center gap-[15px] hover:-translate-y-1 transition-all cursor-pointer h-full group`}>
                        <div className={`w-[64px] h-[64px] ${t.iconBg} ${t.iconText} rounded-full flex items-center justify-center text-3xl shrink-0 border ${t.border} ${t.groupHover} group-hover:text-white transition-colors shadow-sm`}>
                          {item.icon}
                        </div>
                        <div className="overflow-hidden flex-1">
                          <div className={`text-[10px] ${t.textLight} uppercase tracking-[1px] font-bold mb-0.5`}>{item.type}</div>
                          <div className="font-bold text-[15px] leading-tight whitespace-nowrap overflow-hidden text-ellipsis text-slate-900 group-hover:text-emerald-600 transition-colors">{item.name}</div>
                          <div className="text-amber-500 text-[11px] mt-1.5 font-bold flex items-center gap-1">
                            <span className="text-sm">★</span> {item.rating}
                          </div>
                        </div>
                        <div className={`text-slate-300 group-hover:${t.textLight} transition-colors`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Smart Queue Panel — only for personal-care */}
                {isSmartQueue && (
                  <div className="w-full lg:w-[320px] shrink-0">
                    <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-md h-full">
                      {/* Panel header */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md shadow-pink-200">
                            <Ticket className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-slate-900 font-black text-sm">Smart Queue</div>
                            <div className="text-slate-400 text-[10px]">Walk in — no appointments</div>
                          </div>
                        </div>
                      </div>

                      {/* How it works — compact 3-step */}
                      <div className="grid grid-cols-3 gap-2 mt-4 mb-1">
                        {[
                          { icon: '🚶', label: 'Walk In' },
                          { icon: '🎫', label: 'Get Token' },
                          { icon: '☕', label: 'Relax' },
                        ].map((s, i) => (
                          <div key={i} className="bg-pink-50 rounded-xl p-2.5 text-center border border-pink-100">
                            <div className="text-xl mb-1">{s.icon}</div>
                            <div className="text-pink-700 text-[10px] font-bold">{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Live queue badge */}
                      <LiveQueueBadge />
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
