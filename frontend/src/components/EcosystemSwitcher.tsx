"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, Megaphone, Truck, ShieldCheck, 
  ArrowUpRight, Briefcase, Layers, User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function EcosystemSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user } = useAuth();

  // Determine current active platform
  const currentPlatform = pathname?.startsWith('/ads')
    ? 'ads'
    : pathname?.startsWith('/delivery')
    ? 'delivery'
    : 'main';

  const roleLower = user?.role?.toLowerCase() || '';
  const isAdmin = roleLower.includes('admin');

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const platforms = [
    {
      id: 'main',
      title: 'Marketplace',
      subtitle: 'MarkatVerse Marketplace',
      href: '/',
      icon: <Store className="w-5 h-5" />,
      color: 'from-blue-600 to-indigo-600',
      description: 'Multi-category retail, wholesale & local dining.'
    },
    {
      id: 'ads',
      title: 'Ads Manager',
      subtitle: 'MarkatVerse Ads',
      href: '/ads',
      icon: <Megaphone className="w-5 h-5" />,
      color: 'from-purple-600 to-pink-500',
      description: 'Advertiser portals, 2nd-price auction & campaign analytics.'
    },
    {
      id: 'delivery',
      title: 'Delivery & Fleet',
      subtitle: 'MarkatVerse Delivery',
      href: '/delivery',
      icon: <Truck className="w-5 h-5" />,
      color: 'from-emerald-600 to-teal-500',
      description: 'Rider dispatch, EV/bike fleet & smart routing engine.'
    }
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      
      {/* 9-Dots Grid App Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 group cursor-pointer border ${
          isOpen 
            ? 'bg-slate-100 border-slate-300 text-blue-600 shadow-inner' 
            : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 hover:text-blue-600 shadow-xs'
        }`}
        title="MarkatVerse Ecosystem Switcher"
        aria-label="MarkatVerse Ecosystem Switcher"
        aria-expanded={isOpen}
      >
        <div className="grid grid-cols-3 gap-0.5 w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-[1px] bg-current" />
          ))}
        </div>
        <span className="hidden sm:inline text-xs font-bold tracking-tight">Ecosystem</span>
      </button>

      {/* Launcher Dropdown (Clean, Crisp Enterprise Card) */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[360px] sm:w-[400px] max-w-[calc(100vw-20px)] rounded-2xl bg-white border border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.14)] z-[1000] p-3.5 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 px-0.5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 block leading-none">
                  MarkatVerse Ecosystem
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-none">
                  Unified Platform Switcher
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold shadow-xs shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SSO Active</span>
            </div>
          </div>

          {/* Platforms List (No Domain URLs, Clean Pro 2-Line Layout) */}
          <div className="space-y-1.5">
            {platforms.map((plat) => {
              const isActive = currentPlatform === plat.id;
              return (
                <Link
                  key={plat.id}
                  href={plat.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all group ${
                    isActive
                      ? 'bg-blue-50/70 border-blue-200/90 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 shadow-xs'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plat.color} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                    {plat.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {plat.subtitle}
                      </span>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300/60 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Current
                        </span>
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-1">
                      {plat.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Management Portals Section */}
          <div className="pt-2.5 mt-2.5 border-t border-slate-100">
            <div className="text-[9px] font-black tracking-wider uppercase text-slate-400 px-1 mb-1.5">
              Portals & Management
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={user ? "/seller/dashboard" : "/seller/login"}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/50 hover:bg-amber-50 border border-amber-200/60 hover:border-amber-300 transition-all group shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate leading-none">Seller Central</span>
                  <span className="text-[10px] text-amber-700 font-semibold block leading-tight mt-1">Merchant Hub</span>
                </div>
              </Link>

              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200/60 hover:border-indigo-300 transition-all group shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate leading-none">Admin Console</span>
                  <span className="text-[10px] text-indigo-700 font-semibold block leading-tight mt-1">
                    {isAdmin ? 'Master Access' : 'Management'}
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Infrastructure Footer */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 px-0.5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Central Auth • Real-Time Events
            </span>
            {user ? (
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 truncate max-w-[140px]">
                <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="truncate">{user.name}</span>
              </span>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setIsOpen(false)} 
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <User className="w-3 h-3" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
