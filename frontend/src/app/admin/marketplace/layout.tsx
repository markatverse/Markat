"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Products', href: '/admin/marketplace/products', icon: '📦' },
    { name: 'Services', href: '/admin/marketplace/services', icon: '🛠️' },
    { name: 'Categories', href: '/admin/marketplace/categories', icon: '🗂️' },
    { name: 'Category Relations', href: '/admin/marketplace/relations', icon: '🔗' },
    { name: 'Industries', href: '/admin/marketplace/industries', icon: '🏢' },
    { name: 'Brands', href: '/admin/marketplace/brands', icon: '⭐' },
  ];

  const handleAction = () => {
    if (pathname.includes('products')) window.dispatchEvent(new Event('marketplace:add-product'));
    else if (pathname.includes('services')) window.dispatchEvent(new Event('marketplace:add-service'));
    else if (pathname.includes('categories')) window.dispatchEvent(new Event('marketplace:add-category'));
    else if (pathname.includes('industries')) window.dispatchEvent(new Event('marketplace:add-industry'));
    else if (pathname.includes('brands')) window.dispatchEvent(new Event('marketplace:add-brand'));
  };

  const getButtonText = () => {
    if (pathname.includes('products')) return 'Add Product';
    if (pathname.includes('services')) return 'Add Service';
    if (pathname.includes('categories')) return 'Add Category';
    if (pathname.includes('industries')) return 'Add Industry';
    if (pathname.includes('brands')) return 'Add Brand';
    return null;
  };

  const buttonText = getButtonText();

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-300 pb-20">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Marketplace</h1>
          <p className="text-slate-400 mt-2 text-sm">Manage products, services, categories, and marketplace structure.</p>
        </div>
        
        {buttonText && (
          <button 
            onClick={handleAction}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2 mt-1"
          >
            <Plus className="w-5 h-5" />
            {buttonText}
          </button>
        )}
      </header>

      <div className="flex overflow-x-auto border-b border-slate-700/50 mb-8 gap-8">
        {tabs.map(tab => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.name} href={tab.href}>
              <button 
                className={`pb-4 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${isActive ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            </Link>
          );
        })}
      </div>

      <div className="relative">
        {children}
      </div>
    </div>
  );
}
