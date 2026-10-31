"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Truck, Navigation, MapPin, ShieldCheck, 
  ArrowRight, TrendingUp, Clock, Zap, CheckCircle2,
  Package, BatteryCharging, AlertCircle, Shield, Award, Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DeliveryPlatformDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const kpis = [
    { label: 'Active Riders Online', value: '842', change: '+54 from peak', positive: true, icon: <Navigation className="w-5 h-5 text-emerald-600" /> },
    { label: 'Deliveries Today', value: '18,420', change: '+18.2% vs last week', positive: true, icon: <Package className="w-5 h-5 text-teal-600" /> },
    { label: 'Average Delivery SLA', value: '23.8 min', change: '-4.2 min faster', positive: true, icon: <Clock className="w-5 h-5 text-blue-600" /> },
    { label: 'On-Time Success Rate', value: '99.4%', change: 'Target 99.0%', positive: true, icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
  ];

  const modules = [
    {
      title: 'Partner Portal',
      description: 'Dedicated portal for delivery couriers and riders: accept live runs, navigation routing, OTP verification, and daily payouts.',
      href: user ? '/delivery/partner' : '/delivery/login?redirect=/delivery/partner',
      icon: <Navigation className="w-6 h-6" />,
      color: 'from-emerald-600 to-teal-600',
      badge: 'For Riders & Couriers',
      buttonText: user ? 'Open Partner Portal' : 'Sign In as Rider',
      features: ['Turn-by-turn pickup and delivery routing', 'Instant OTP customer drop-off verification', 'Daily direct-to-bank UPI earnings & tips']
    },
    {
      title: 'Fleet Management',
      description: 'Monitor active vehicles across 2-wheelers, EV bikes, and delivery vans with live battery, maintenance, and shift logs.',
      href: user ? '/delivery/fleet' : '/delivery/login?redirect=/delivery/fleet',
      icon: <Truck className="w-6 h-6" />,
      color: 'from-teal-600 to-cyan-600',
      badge: 'Vehicle & Asset Hub',
      buttonText: user ? 'Open Fleet Management' : 'Sign In as Fleet Manager',
      features: ['EV battery charge & swap station alerts', 'Vehicle compliance RC/PUC & insurance expiry', 'Rider performance & safety driving scores']
    },
    {
      title: 'Dispatch Engine',
      description: 'Algorithmic proximity matching, dynamic delivery fee pricing, multi-order batching, and geofence SLA monitors.',
      href: user ? '/delivery/dispatch' : '/delivery/login?redirect=/delivery/dispatch',
      icon: <MapPin className="w-6 h-6" />,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Intelligent Routing',
      buttonText: user ? 'Open Dispatch Engine' : 'Sign In to View Engine',
      features: ['3km radius nearest courier auto-matching', 'Smart order route batching (2x efficiency)', 'Live SLA breach warning alerts (<25 mins)']
    },
    ...(isAdmin ? [{
      title: 'Delivery Admin',
      description: 'Central operations command: bird’s-eye real-time city map, active trip monitor, exception resolution, and courier payouts.',
      href: '/delivery/admin',
      icon: <ShieldCheck className="w-6 h-6" />,
      color: 'from-purple-600 to-indigo-600',
      badge: '🛡️ Admin Only',
      buttonText: 'Open Delivery Admin',
      features: ['Bird’s-eye city fleet live map view', '1-Click emergency re-dispatch for stalled trips', 'Daily cash collection & COD audit reconciliations']
    }] : [])
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-8 lg:p-12 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/60 to-teal-50/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            Hyperlocal Logistics &amp; Fleet Ecosystem
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Sub-30 Minute Autonomous Hyperlocal Delivery.
          </h1>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            Powering seamless pickups and deliveries across food dining, grocery essentials, B2B wholesale freight, and retail merchandise.
          </p>
          <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-2">
            {user ? (
              <>
                <Link
                  href="/delivery/dispatch"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center gap-2"
                >
                  <span>Dispatch Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/delivery/partner"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm transition-all border border-slate-200 flex items-center gap-2"
                >
                  <span>Rider Partner Portal</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/delivery/login"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center gap-2"
                >
                  <span>Partner Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/delivery/login?mode=register"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm transition-all border border-slate-200 flex items-center gap-2"
                >
                  <span>Join as Partner</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx}
            className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 group-hover:scale-110 transition-transform">
                {kpi.icon}
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{kpi.value}</div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {kpi.change}
            </span>
          </div>
        ))}
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-black text-slate-900">Logistics Modules</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore each dedicated portal in the MarkatVerse Delivery ecosystem.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((m, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    {m.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                    {m.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {m.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4">
                <Link
                  href={m.href}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs group-hover:shadow-md"
                >
                  <span>{m.buttonText || `Open ${m.title}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

