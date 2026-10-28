"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight, ArrowLeft, ShieldCheck, Users, Store, Box, Network, Settings, ListTree, LogOut, Receipt, Briefcase, BarChart3, Bell, LayoutDashboard, Headset, LayoutTemplate, Smile } from 'lucide-react';

type NavItem = {
  name: string;
  href?: string;
  icon?: React.ReactNode;
  subItems?: { name: string; href: string }[];
};

export default function Sidebar({ currentAdminRole, setCurrentAdminRole, isMobileMenuOpen, setIsMobileMenuOpen }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    'Dashboard': true,
  });

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard Overview', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      name: 'Users',
      icon: <Users className="w-5 h-5" />,
      href: '/admin/users/customers',
    },
    {
      name: 'Businesses',
      icon: <Store className="w-5 h-5" />,
      href: '/admin/businesses/sellers',
    },
    {
      name: 'Marketplace',
      icon: <Box className="w-5 h-5" />,
      href: '/admin/marketplace/products',
    },
    {
      name: 'Transactions',
      icon: <Receipt className="w-5 h-5" />,
      href: '/admin/transactions/orders',
    },
    {
      name: 'Commercial',
      icon: <Briefcase className="w-5 h-5" />,
      href: '/admin/commercial/commission',
    },
    {
      name: 'Operations',
      icon: <Network className="w-5 h-5" />,
      href: '/admin/operations/exceptions',
    },
    {
      name: 'Customer Support',
      icon: <Headset className="w-5 h-5" />,
      href: '/admin/support/inbox',
    },
    {
      name: 'Homepage Layout',
      icon: <LayoutTemplate className="w-5 h-5" />,
      href: '/admin/content/homepage',
    },
    {
      name: 'Content',
      icon: <ListTree className="w-5 h-5" />,
      href: '/admin/content/homepage',
    },
    {
      name: 'Mascot & UX States',
      icon: <Smile className="w-5 h-5" />,
      href: '/admin/content/mascot',
    },
    {
      name: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/admin/analytics',
    },
    {
      name: 'Security',
      icon: <ShieldCheck className="w-5 h-5" />,
      href: '/admin/security/roles',
    },
    {
      name: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      href: '/admin/notifications/email',
    },
    {
      name: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      href: '/admin/settings/platform',
    },
  ];

  // RBAC Boundary Logic for Sidebar
  const filteredNavItems = navItems.filter(item => {
    if (currentAdminRole === 'super_admin') return true;
    
    if (currentAdminRole === 'catalog_admin') {
      return ['Dashboard Overview', 'Marketplace', 'Content', 'Homepage Layout', 'Mascot & UX States'].includes(item.name);
    }
    
    if (currentAdminRole === 'onboarding_admin') {
      return ['Dashboard Overview', 'Businesses', 'Commercial'].includes(item.name);
    }
    
    if (currentAdminRole === 'support_admin') {
      return ['Dashboard Overview', 'Users', 'Customer Support', 'Transactions', 'Operations'].includes(item.name);
    }
    
    return false;
  });

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] lg:h-screen bg-slate-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0
        transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-2xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/5 flex flex-col gap-4 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
          <Link href="/" className="flex items-center no-underline hover:opacity-90 transition-opacity">
            <img 
              src="/logo-optimized.webp" 
              alt="MarkatVerse" 
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              className="h-10 object-contain scale-[2.5] origin-left brightness-0 invert" 
            />
          </Link>
          <div className="text-amber-400 text-xs font-bold tracking-widest mt-1">ADMIN PORTAL</div>
          <Link href="/" className="text-emerald-500 flex items-center gap-2 hover:opacity-80 transition-opacity font-bold text-sm mt-2 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Main Site
          </Link>
          


          {/* Inline Role Simulator / Dropdown */}
          <div className="flex items-center justify-between bg-slate-900/60 p-1.5 pr-3 rounded-full border border-white/10 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <select
                value={currentAdminRole}
                onChange={(e) => setCurrentAdminRole(e.target.value)}
                className="bg-transparent text-emerald-400 text-sm font-bold w-full cursor-pointer focus:outline-none appearance-none capitalize"
              >
                <option value="super_admin" className="bg-slate-900">Super Admin</option>
                <option value="catalog_admin" className="bg-slate-900">Catalog Admin</option>
                <option value="onboarding_admin" className="bg-slate-900">Onboarding Admin</option>
                <option value="support_admin" className="bg-slate-900">Support Admin</option>
              </select>
            </div>
            <div className="pointer-events-none text-emerald-500 shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5 pb-20">
          {filteredNavItems.map((item) => (
            <div key={item.name} className="mb-2">
              {item.href ? (
                <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block group">
                  <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform group-hover:translate-x-1 ${pathname === item.href ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}`}>
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </Link>
              ) : (
                <div className="group">
                  <div 
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 transform group-hover:translate-x-1 cursor-pointer ${openMenus[item.name] ? 'bg-white/5 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${openMenus[item.name] ? 'rotate-90' : ''}`} />
                  </div>
                  {openMenus[item.name] && item.subItems && (
                    <ul className="list-none pl-11 pr-2 mt-2 space-y-1">
                      {item.subItems.map((sub) => (
                        <li key={sub.name}>
                          <Link href={sub.href} onClick={() => setIsMobileMenuOpen(false)} className="block group/sub">
                            <div className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform group-hover/sub:translate-x-1 ${pathname === sub.href ? 'bg-white/10 text-emerald-400 shadow-sm border-l-2 border-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent'}`}>
                              {sub.name}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
          
          <div className="mt-8 pt-4 border-t border-slate-800">
            <button 
              onClick={() => {
                logout();
                router.push('/admin/login');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-300 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Secure Log Out</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
