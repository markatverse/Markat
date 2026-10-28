"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Homepage Layout', href: '/admin/content/homepage' },
    { name: 'CMS', href: '/admin/content/cms' },
    { name: 'Banners', href: '/admin/content/banners' },
    { name: 'Advertisements', href: '/admin/content/advertisements' },
    { name: 'Blog', href: '/admin/content/blog' },
    { name: 'SEO', href: '/admin/content/seo' },
    { name: 'Mascot & Error States', href: '/admin/content/mascot' },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-300 pb-20">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Content</h1>
        <p className="text-slate-400 mt-2 text-sm">Manage website content, banners, blog posts, and SEO.</p>
      </header>

      <div className="flex overflow-x-auto border-b border-slate-700/50 mb-8 gap-8">
        {tabs.map(tab => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.name} href={tab.href}>
              <button 
                className={`pb-4 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${isActive ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
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
