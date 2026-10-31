"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Megaphone, BarChart3, LayoutDashboard, 
  Store, ShieldCheck, LogOut, Wallet, User,
  Sparkles, ArrowRight, Layers, HelpCircle, FileText
} from 'lucide-react';
import EcosystemSwitcher from '@/components/EcosystemSwitcher';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/api';

export default function AdsPlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number>(14500);

  // Fetch real advertiser wallet balance if logged in
  useEffect(() => {
    if (user?.id) {
      const API_URL = getApiUrl();
      fetch(`${API_URL}/commercial/ads/advertisers/${encodeURIComponent(user.id)}/profile`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && typeof data.walletBalance === 'number') {
            setWalletBalance(data.walletBalance);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  if (pathname === '/ads/login') {
    return <>{children}</>;
  }

  const isAdmin = user?.role === 'ADMIN';

  // Navigation Items: Public vs Authenticated
  const navItems = user ? [
    { name: 'Overview', href: '/ads', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Advertiser Portal', href: '/ads/advertiser', icon: <Megaphone className="w-4 h-4" /> },
    { name: 'Campaign Manager', href: '/ads/campaigns', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Publisher Portal', href: '/ads/publisher', icon: <Store className="w-4 h-4" /> },
    ...(isAdmin ? [{ name: 'Ads Admin', href: '/ads/admin', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> }] : []),
  ] : [
    { name: 'Overview', href: '/ads', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Placements & Rates', href: '/ads#placements', icon: <Layers className="w-4 h-4" /> },
    { name: 'How It Works', href: '/ads#how-it-works', icon: <HelpCircle className="w-4 h-4" /> },
    { name: 'Publisher Network', href: '/ads#publishers', icon: <Store className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-purple-500 selection:text-white">
      
      {/* Top Ads Navigation Bar */}
      <header className="border-b border-white/10 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-3">
            <Link href="/ads" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-black shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight text-white">MarkatVerse</span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider">
                    ADS
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block">
                  ads.markatverse.com
                </span>
              </div>
            </Link>

            {/* Nav Tabs (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 ml-8 pl-6 border-l border-white/10">
              {navItems.map((item) => {
                const isActive = item.href === '/ads' 
                  ? pathname === '/ads' 
                  : (pathname?.startsWith(item.href) && !item.href.includes('#'));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Tools: Ecosystem Switcher, Wallet & User Profile */}
          <div className="flex items-center gap-3">
            <EcosystemSwitcher />

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                {/* Wallet Balance Pill */}
                <Link 
                  href="/ads/advertiser"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold transition-colors"
                  title="Advertiser Wallet Balance"
                >
                  <Wallet className="w-3.5 h-3.5 text-purple-400" />
                  <span>₹{walletBalance.toLocaleString('en-IN')}</span>
                </Link>

                {/* Profile Badge */}
                <Link href="/ads/advertiser" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-xs font-black shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-white block truncate max-w-[120px]">{user.name}</span>
                    <span className="text-[10px] text-purple-400 font-semibold capitalize">
                      {isAdmin ? '🛡️ Admin' : (user.role || 'Advertiser')}
                    </span>
                  </div>
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/ads';
                  }}
                  className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                  title="Sign Out of Ads Platform"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <Link 
                  href="/ads/login" 
                  className="text-xs font-bold px-3.5 py-1.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link 
                  href="/ads/login?mode=register" 
                  className="text-xs font-bold px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.35)] flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Start Advertising</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Subnav */}
        <div className="lg:hidden flex overflow-x-auto gap-2 pt-3 border-t border-white/5 mt-3 pb-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = item.href === '/ads' 
              ? pathname === '/ads' 
              : (pathname?.startsWith(item.href) && !item.href.includes('#'));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white bg-white/5'
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
