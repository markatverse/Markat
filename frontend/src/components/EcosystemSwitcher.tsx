"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Grid, Store, Megaphone, Truck, ShieldCheck, 
  ExternalLink, Check, Sparkles, Layers, ArrowUpRight
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

  const platforms = [
    {
      id: 'main',
      name: 'MarkatVerse Marketplace',
      tagline: 'Main Platform',
      domain: 'markatverse.com',
      href: '/',
      icon: <Store className="w-5 h-5" />,
      color: 'from-blue-600 to-indigo-600',
      activeBorder: 'border-blue-500',
      badge: 'Core Platform',
      description: 'Multi-category retail, B2B wholesale, hyperlocal dining & queue tokens.'
    },
    {
      id: 'ads',
      name: 'MarkatVerse Ads',
      tagline: 'Advertising Platform',
      domain: 'ads.markatverse.com',
      href: '/ads',
      icon: <Megaphone className="w-5 h-5" />,
      color: 'from-purple-600 to-pink-600',
      activeBorder: 'border-purple-500',
      badge: 'Ads Engine',
      description: 'Advertiser & Publisher portals, 2nd-price auction, and campaign analytics.'
    },
    {
      id: 'delivery',
      name: 'MarkatVerse Delivery',
      tagline: 'Logistics & Fleet Platform',
      domain: 'delivery.markatverse.com',
      href: '/delivery',
      icon: <Truck className="w-5 h-5" />,
      color: 'from-emerald-600 to-teal-600',
      activeBorder: 'border-emerald-500',
      badge: 'Fleet Dispatch',
      description: 'Rider Partner portal, EV/bike fleet management, and smart routing engine.'
    }
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      
      {/* 9-Dots Grid App Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 sm:px-3 sm:py-2 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 group text-slate-700 cursor-pointer"
        title="MarkatVerse Ecosystem Switcher"
        aria-label="MarkatVerse Ecosystem Switcher"
      >
        <div className="grid grid-cols-3 gap-0.5 w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-xs bg-current" />
          ))}
        </div>
        <span className="hidden sm:inline text-xs font-bold tracking-tight">Ecosystem</span>
      </button>

      {/* Launcher Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[1000] p-4 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/5 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                MarkatVerse Ecosystem
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Single Sign-On Active</span>
          </div>

          {/* Platforms Grid */}
          <div className="space-y-2">
            {platforms.map((plat) => {
              const isActive = currentPlatform === plat.id;
              return (
                <Link
                  key={plat.id}
                  href={plat.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-3.5 p-3 rounded-2xl border transition-all group ${
                    isActive
                      ? `bg-slate-50 dark:bg-white/[0.04] ${plat.activeBorder} shadow-xs`
                      : 'border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plat.color} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                    {plat.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {plat.name}
                      </span>
                      {isActive ? (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                          Current
                        </span>
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block">
                      {plat.domain}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-1 line-clamp-1">
                      {plat.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Shared Infrastructure Banner */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 px-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Central Auth • API Gateway • Global Events
            </span>
            {user && (
              <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                {user.name}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

