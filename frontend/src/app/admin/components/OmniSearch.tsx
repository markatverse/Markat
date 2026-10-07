"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Store, Users, ShoppingBag, Settings, Tag, ShieldAlert, Zap, Box, FileText, Banknote } from 'lucide-react';

const STATIC_ROUTES = [
  { name: 'Dashboard Overview', path: '/admin', icon: <Zap className="w-4 h-4 text-amber-500" /> },
  { name: 'Manage Sellers & KYC', path: '/admin/businesses/sellers', icon: <Store className="w-4 h-4 text-emerald-500" /> },
  { name: 'Manage Customers', path: '/admin/users/customers', icon: <Users className="w-4 h-4 text-blue-500" /> },
  { name: 'Manage Admins', path: '/admin/users/admins', icon: <ShieldAlert className="w-4 h-4 text-rose-500" /> },
  { name: 'Global Categories', path: '/admin/marketplace/categories', icon: <Tag className="w-4 h-4 text-indigo-500" /> },
  { name: 'Product Catalog', path: '/admin/marketplace/products', icon: <Box className="w-4 h-4 text-purple-500" /> },
  { name: 'Orders & Transactions', path: '/admin/transactions/orders', icon: <ShoppingBag className="w-4 h-4 text-pink-500" /> },
  { name: 'Seller Payouts', path: '/admin/transactions/payouts', icon: <Banknote className="w-4 h-4 text-emerald-600" /> },
  { name: 'CMS & Banners', path: '/admin/content/banners', icon: <FileText className="w-4 h-4 text-cyan-500" /> },
  { name: 'System Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4 text-slate-500" /> },
];

export default function OmniSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const filteredRoutes = STATIC_ROUTES.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] animate-in fade-in duration-200" onClick={() => setIsOpen(false)} />
      
      <div className="fixed left-1/2 top-[15vh] -translate-x-1/2 w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 relative">
          <Search className="w-5 h-5 text-indigo-500 absolute left-6" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for pages, users, or settings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-white text-lg font-medium pl-10 py-2 focus:outline-none placeholder:text-slate-500"
          />
          <div className="text-[10px] text-slate-500 font-bold bg-slate-800 px-2 py-1 rounded">ESC to close</div>
        </div>

        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {filteredRoutes.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Quick Navigation</div>
              {filteredRoutes.map((route, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(route.path)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-slate-950 flex items-center justify-center border border-slate-700/50">
                    {route.icon}
                  </div>
                  <span className="font-semibold text-sm">{route.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center flex flex-col items-center">
              <Search className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-slate-400 font-medium text-sm">No results found for &quot;{query}&quot;</p>
              <p className="text-slate-600 text-xs mt-1">Try searching for &quot;Orders&quot; or &quot;Sellers&quot;</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
