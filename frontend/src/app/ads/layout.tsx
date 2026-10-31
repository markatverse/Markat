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
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mv_advertiser_wallet');
      if (saved) return Number(saved) || 12500;
    }
    return 12500;
  });

  // Listen for real-time wallet updates from advertiser portal and top-ups
  useEffect(() => {
    const handleWalletUpdate = (e: any) => {
      if (e.detail?.balance !== undefined) {
        setWalletBalance(e.detail.balance);
      }
    };
    window.addEventListener('mv_advertiser_wallet_updated', handleWalletUpdate);
    return () => window.removeEventListener('mv_advertiser_wallet_updated', handleWalletUpdate);
  }, []);

  // Fetch real advertiser wallet balance if logged in
  useEffect(() => {
    if (user?.id) {
      const API_URL = getApiUrl();
      fetch(`${API_URL}/commercial/ads/advertisers/${encodeURIComponent(user.id)}/profile`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && typeof data.walletBalance === 'number') {
            setWalletBalance(data.walletBalance);
            try {
              localStorage.setItem('mv_advertiser_wallet', String(data.walletBalance));
            } catch {}
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
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-purple-500 selection:text-white">
      
      {/* Top Ads Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8 py-2.5 sm:py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Official MarkatVerse ADS Single-Line Brand Asset */}
          <div className="flex items-center gap-3">
            <Link href="/ads" className="flex items-center group py-0.5" title="MarkatVerse ADS">
              <img 
                src="/logo-ads.svg" 
                alt="MarkatVerse ADS" 
                className="h-11 sm:h-12 md:h-14 w-auto object-contain hover:opacity-95 transition-opacity" 
              />
            </Link>

            {/* Nav Tabs (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 ml-8 pl-6 border-l border-slate-200">
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
                        ? 'bg-purple-600 text-white shadow-xs'
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

          {/* Right Action Tools: Ecosystem Switcher, Wallet & User Profile */}
          <div className="flex items-center gap-3">
            <EcosystemSwitcher />

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                {/* Wallet Balance Pill */}
                <Link 
                  href="/ads/advertiser"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-colors"
                  title="Advertiser Wallet Balance"
                >
                  <Wallet className="w-3.5 h-3.5 text-purple-600" />
                  <span>₹{walletBalance.toLocaleString('en-IN')}</span>
                </Link>

                {/* Profile Badge (Avatar Only) */}
                <Link 
                  href="/ads/advertiser" 
                  className="flex items-center hover:opacity-90 transition-opacity p-0.5 rounded-full"
                  title={user.name ? `${user.name} (${isAdmin ? 'Admin' : (user.role || 'Advertiser')})` : 'Profile'}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-xs font-black shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/ads';
                  }}
                  className="text-slate-500 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Sign Out of Ads Platform"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <Link 
                  href="/ads/login" 
                  className="text-xs font-bold px-3.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link 
                  href="/ads/login?mode=register" 
                  className="text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span className="hidden sm:inline">Start Advertising</span>
                  <span className="sm:hidden">Advertise</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Subnav (Touch-Friendly & Edge-to-Edge) */}
        <div className="lg:hidden flex overflow-x-auto gap-2 pt-3 border-t border-slate-200 mt-3 pb-1 -mx-4 px-4 scrollbar-none touch-pan-x">
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
                    ? 'bg-purple-600 text-white shadow-xs'
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
