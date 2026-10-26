"use client";
import React from 'react';
import Link from 'next/link';

export default function AllCategoriesPage() {
  const categorySections = [
    {
      id: 'raw-materials',
      title: 'Construction & Raw Materials',
      subtitle: 'Building & Infrastructure',
      theme: 'amber',
      link: '/search?category=Construction%20Materials',
      items: [
        { name: 'UltraTech Cement (50kg)', type: 'Building Material', rating: '4.8', icon: '🧱', link: '/product/portland-cement-50kg' },
        { name: 'Tata Tiscon TMT Steel', type: 'Structural Steel', rating: '4.9', icon: '🏗️', link: '/product/tmt-steel-bars' },
        { name: 'High Quality River Sand', type: 'Aggregates', rating: '4.6', icon: '⏳', link: '/product/river-sand-truck' }
      ]
    },
    {
      id: 'b2b',
      title: 'B2B Wholesale & Enterprise Hub',
      subtitle: 'Business to Business',
      theme: 'blue',
      link: '/search?filter=b2b',
      items: [
        { name: 'Global Logistics', type: 'Freight & Supply Chain', rating: '4.9', icon: '🚢', link: '/product/heavy-freight-movers' },
        { name: 'TechInfra Solutions', type: 'Enterprise Hardware', rating: '4.9', icon: '🖥️', link: '/product/enterprise-server-rack' },
        { name: 'Wholesale Clothing Bales', type: 'Textiles', rating: '4.7', icon: '👕', link: '/product/wholesale-clothing-bale' }
      ]
    },

    {
      id: 'electronics',
      title: 'Electronics & Gadgets',
      subtitle: 'Tech & Appliances',
      theme: 'slate',
      link: '/search?cat=Electronics',
      items: [
        { name: 'Smartphones & Mobiles', type: 'Mobile Devices', rating: '4.8', icon: '📱', link: '/search?cat=Electronics&q=Mobile' },
        { name: 'Laptops & Computers', type: 'Computing', rating: '4.7', icon: '💻', link: '/search?cat=Electronics&q=Laptop' },
        { name: 'Audio & Headphones', type: 'Accessories', rating: '4.6', icon: '🎧', link: '/search?cat=Electronics&q=Audio' },
        { name: 'Smart Home Devices', type: 'Home Tech', rating: '4.9', icon: '🏠', link: '/search?cat=Electronics&q=Smart' }
      ]
    }
  ];

  // Helper for theme classes
  const getThemeClasses = (theme: string) => {
    switch(theme) {
      case 'amber': return { bg: 'bg-amber-50', border: 'border-amber-200', textLight: 'text-amber-700', textDark: 'text-amber-900', btnBg: 'bg-amber-600', btnHover: 'hover:bg-amber-700', iconBg: 'bg-amber-50', iconText: 'text-amber-600', groupHover: 'group-hover:bg-amber-600', glow: 'bg-amber-500/10' };
      case 'blue': return { bg: 'bg-blue-50', border: 'border-blue-200', textLight: 'text-blue-700', textDark: 'text-blue-900', btnBg: 'bg-blue-600', btnHover: 'hover:bg-blue-700', iconBg: 'bg-blue-50', iconText: 'text-blue-600', groupHover: 'group-hover:bg-blue-600', glow: 'bg-blue-500/10' };
      case 'emerald': return { bg: 'bg-emerald-50', border: 'border-emerald-200', textLight: 'text-emerald-700', textDark: 'text-emerald-900', btnBg: 'bg-emerald-600', btnHover: 'hover:bg-emerald-700', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', groupHover: 'group-hover:bg-emerald-600', glow: 'bg-emerald-500/10' };
      case 'pink': return { bg: 'bg-pink-50', border: 'border-pink-200', textLight: 'text-pink-700', textDark: 'text-pink-900', btnBg: 'bg-pink-600', btnHover: 'hover:bg-pink-700', iconBg: 'bg-pink-50', iconText: 'text-pink-600', groupHover: 'group-hover:bg-pink-600', glow: 'bg-pink-500/10' };
      case 'purple': return { bg: 'bg-purple-50', border: 'border-purple-200', textLight: 'text-purple-700', textDark: 'text-purple-900', btnBg: 'bg-purple-600', btnHover: 'hover:bg-purple-700', iconBg: 'bg-purple-50', iconText: 'text-purple-600', groupHover: 'group-hover:bg-purple-600', glow: 'bg-purple-500/10' };
      case 'indigo': return { bg: 'bg-indigo-50', border: 'border-indigo-200', textLight: 'text-indigo-700', textDark: 'text-indigo-900', btnBg: 'bg-indigo-600', btnHover: 'hover:bg-indigo-700', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600', groupHover: 'group-hover:bg-indigo-600', glow: 'bg-indigo-500/10' };
      case 'slate': default: return { bg: 'bg-slate-50', border: 'border-slate-200', textLight: 'text-slate-700', textDark: 'text-slate-900', btnBg: 'bg-slate-700', btnHover: 'hover:bg-slate-800', iconBg: 'bg-slate-100', iconText: 'text-slate-700', groupHover: 'group-hover:bg-slate-700', glow: 'bg-slate-500/10' };
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-5 md:p-10 min-h-screen bg-white">
      
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">All Categories</h1>
        <p className="text-slate-500 text-lg">Browse through our comprehensive directory of products, services, suppliers, and raw materials across the globe.</p>
      </div>

      <div className="flex flex-col gap-10">
        {categorySections.map((section) => {
          const t = getThemeClasses(section.theme);
          
          return (
            <section key={section.id} className={`${t.bg} p-8 rounded-3xl border ${t.border} shadow-sm relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 w-64 h-64 ${t.glow} rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3`}></div>
              <div className={`absolute bottom-0 right-0 w-96 h-96 ${t.glow} rounded-full blur-3xl translate-y-1/3 translate-x-1/3`}></div>
              
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-end border-b ${t.border} pb-4 mb-8 relative z-10 gap-4`}>
                <div>
                  <div className={`text-[11px] font-bold ${t.textLight} tracking-widest uppercase mb-1.5`}>{section.subtitle}</div>
                  <h2 className="text-3xl font-bold text-slate-900">{section.title}</h2>
                </div>
                <Link href={section.link} className={`${t.btnBg} text-white px-5 py-2.5 rounded-xl text-sm font-bold ${t.btnHover} transition-colors shadow-lg shadow-${section.theme}-600/20 whitespace-nowrap`}>
                  Explore All ➤
                </Link>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 relative z-10">
                {section.items.map((item, i) => (
                  <Link 
                    key={i} 
                    href={item.link} 
                    {...(item.link.startsWith('/product') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="no-underline text-inherit outline-none focus:ring-2 focus:ring-blue-500 rounded-xl"
                  >
                    <div className={`bg-white p-5 rounded-2xl border ${t.border} shadow-sm hover:shadow-md flex items-center gap-[15px] hover:-translate-y-1 transition-all cursor-pointer h-full group`}>
                      <div className={`w-[64px] h-[64px] ${t.iconBg} ${t.iconText} rounded-2xl flex items-center justify-center text-3xl shrink-0 border ${t.border} ${t.groupHover} group-hover:text-white transition-colors shadow-sm`}>
                        {item.icon}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className={`text-[10px] ${t.textLight} uppercase tracking-[1px] font-bold mb-0.5`}>{item.type}</div>
                        <div className="font-bold text-[15px] leading-tight whitespace-nowrap overflow-hidden text-ellipsis text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</div>
                        <div className="text-amber-500 text-[11px] mt-1.5 font-bold flex items-center gap-1">
                          <span className="text-sm">★</span> {item.rating}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      
    </div>
  );
}
