"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminRole, AdminRole } from '@/context/AdminRoleContext';
import { useAuth } from '@/context/AuthContext';

import OmniSearch from './components/OmniSearch';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentAdminRole, setCurrentAdminRole } = useAdminRole();
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Auth Guard
  useEffect(() => {
    if (!isLoading && !user && !pathname?.startsWith('/admin/login')) {
      window.location.replace('/');
    }
  }, [user, isLoading, pathname]);

  if (pathname?.startsWith('/admin/login')) {
    return <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans relative overflow-x-hidden">
      {/* Ambient Premium Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none translate-y-1/3"></div>

      <OmniSearch />

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5 shrink-0 sticky top-0 z-40">
        <Link href="/" className="flex items-center no-underline">
          <img 
            src="/logo-optimized.webp" 
            alt="MarkatVerse" 
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            className="h-8 object-contain scale-[2] origin-left brightness-0 invert" 
          />
        </Link>
        <div className="flex items-center gap-4">
          <select
            value={currentAdminRole}
            onChange={(e) => setCurrentAdminRole(e.target.value as AdminRole)}
            className="bg-slate-900 text-emerald-400 text-xs font-bold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none"
          >
            <option value="super_admin">Super</option>
            <option value="catalog_admin">Catalog</option>
            <option value="onboarding_admin">Onboard</option>
            <option value="support_admin">Support</option>
          </select>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400 hover:text-white rounded-lg">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <Sidebar 
        currentAdminRole={currentAdminRole} 
        setCurrentAdminRole={setCurrentAdminRole}
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[calc(100vh-65px)] lg:h-screen overflow-y-auto p-4 lg:p-6 relative">

        {/* Pass the role via context or cloneElement if needed, but since we are migrating, pages should fetch their own context. 
            For now, we can render children directly. */}
        {children}
      </main>
    </div>
  );
}
