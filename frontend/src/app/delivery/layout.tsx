"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Truck, Users, MapPin, Navigation, ShieldCheck,
  LayoutDashboard, ArrowUpRight, BatteryCharging, LogOut, ArrowRight
} from 'lucide-react';
import EcosystemSwitcher from '@/components/EcosystemSwitcher';
import { useAuth } from '@/context/AuthContext';

export default function DeliveryPlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { name: 'Operations', href: '/delivery', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Partner Portal', href: '/delivery/partner', icon: <Navigation className="w-4 h-4" /> },
    { name: 'Fleet Management', href: '/delivery/fleet', icon: <Truck className="w-4 h-4" /> },
    { name: 'Dispatch Engine', href: '/delivery/dispatch', icon: <MapPin className="w-4 h-4" /> },
    ...(isAdmin ? [{ name: 'Delivery Admin', href: '/delivery/admin', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">

      {/* Top Delivery Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Official MarkatVerse DELIVERY Brand Identity */}
          <div className="flex items-center gap-3">
            <Link href="/delivery" className="flex items-center group py-0.5" title="MarkatVerse DELIVERY">
              <img
                src="/logo-delivery.svg"
                alt="MarkatVerse DELIVERY"
                className="h-8 sm:h-9 md:h-11 w-auto object-contain hover:opacity-95 transition-opacity"
              />
            </Link>

            {/* Nav Tabs (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 ml-8 pl-6 border-l border-slate-200">
              {navItems.map((item) => {
                const isActive = item.href === '/delivery'
                  ? pathname === '/delivery'
                  : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Tools: Ecosystem Switcher & User Profile */}
          <div className="flex items-center gap-3">
            <EcosystemSwitcher />

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">{user.name}</span>
                    <span className="text-[10px] text-emerald-600 font-bold capitalize">{user.role || 'Partner'}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/delivery/login"
                className="text-xs font-bold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Subnav (Touch-friendly & Edge-to-Edge) */}
        <div className="lg:hidden flex overflow-x-auto gap-2 pt-3 border-t border-slate-200 mt-3 pb-1 -mx-4 px-4 scrollbar-none touch-pan-x">
          {navItems.map((item) => {
            const isActive = item.href === '/delivery'
              ? pathname === '/delivery'
              : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8 relative">
        {children}
      </main>
    </div>
  );
}

