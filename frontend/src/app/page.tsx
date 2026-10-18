import Link from "next/link";
import { ShieldCheck, Award, RefreshCw } from 'lucide-react';
import JoinSellerButton from "@/components/JoinSellerButton";
import LiveBookingWidget from "@/components/LiveBookingWidget";
import nextDynamic from 'next/dynamic';
import ScrollReveal from "@/components/ScrollReveal";
import Recommendations from "@/components/Recommendations";
import BannerSlideshow from "@/components/BannerSlideshow";
import AdSlideshow from "@/components/AdSlideshow";

import { getApiUrl } from "@/utils/api";

export const dynamic = 'force-dynamic';

const ProductGrid = nextDynamic(() => import('@/components/ProductGrid'));

async function getAdvertisements() {
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/commercial/advertisements`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(2000),
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json().catch(() => []);
      return Array.isArray(data)
        ? data.filter((ad: any) => ad.status === 'ACTIVE' && ad.position === 'HOMEPAGE')
        : [];
    }
  } catch {
    // Graceful fallback
  }
  return [];
}

async function getBanners() {
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/content/banners`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(2000),
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json().catch(() => []);
      return Array.isArray(data)
        ? data.filter((banner: any) => banner.status === 'ACTIVE' && banner.position === 'HOME_HERO')
        : [];
    }
  } catch {
    // Graceful fallback
  }
  return [];
}

async function getBlogPosts() {
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/content/blog`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(1500),
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json().catch(() => []);
      return Array.isArray(data)
        ? data.filter((post: any) => post.status === 'PUBLISHED').slice(0, 3)
        : [];
    }
  } catch {
    // Graceful fallback
  }
  return [];
}

export default async function Home() {
  const blogPosts = await getBlogPosts();

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex bg-slate-50">
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 flex flex-col gap-2 sm:gap-4 overflow-hidden">
        
        {/* Banners */}
        <BannerSlideshow banners={[]} />

        {/* Advertisements */}
        <AdSlideshow ads={[]} />

        {/* Live Token Status */}
        <LiveBookingWidget />

        {/* Quick Shortcuts */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 lg:p-5 flex items-center justify-between overflow-x-auto gap-4 lg:gap-8 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { name: "Top Deals", icon: "🔥", style: "bg-red-50 text-[24px]", link: "/search?filter=top_deals" },
            { name: "Mobiles", icon: "📱", style: "bg-white border border-slate-200 text-[24px] shadow-sm", link: "/search?category=Mobiles" },
            { name: "Electronics", icon: "💻", style: "bg-white border border-slate-200 text-[24px] shadow-sm", link: "/search?category=Electronics" },
            { name: "Fashion", icon: "👕", style: "bg-white border border-slate-200 text-[24px] shadow-sm", link: "/search?category=Fashion" },
            { name: "Home", icon: "🏠", style: "bg-white border border-slate-200 text-[24px] shadow-sm", link: "/search?category=Home" },
            { name: "Beauty", icon: "💄", style: "bg-white border border-slate-200 text-[24px] shadow-sm", link: "/search?category=Beauty" },
            { name: "Auto", icon: "🚗", style: "bg-white border border-slate-200 text-[24px] shadow-sm", link: "/search?category=Auto" },
            { name: "Sports", icon: "⚽", style: "bg-white border border-slate-200 text-[24px] shadow-sm", link: "/search?category=Sports" },
            { name: "View All", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, style: "bg-[#0f1928] text-white", link: "/explore" }
          ].map((cat, idx) => (
            <Link href={cat.link} key={idx} className="flex flex-col items-center gap-2 min-w-[65px] cursor-pointer group no-underline">
              <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${cat.style.includes('text-') ? cat.style : cat.style + ' text-2xl'}`}>
                {cat.icon}
              </div>
              <span className="text-[11px] font-bold text-[#0f1928] whitespace-nowrap group-hover:text-blue-600 transition-colors">{cat.name}</span>
            </Link>
          ))}
        </section>

        {/* Dual Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-10 gap-2 lg:gap-4 w-full h-auto md:h-[380px] pb-2 md:pb-0">
          
          {/* Left Banner - Light Theme (Ultra-compact on mobile for instant visibility of 65/35 section) */}
          <div className="md:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:py-6 lg:px-8 flex flex-col items-start justify-center border border-slate-200 shadow-sm relative overflow-hidden group min-h-[170px] sm:min-h-[260px] md:min-h-0">
            
            {/* Background Image seamlessly blended */}
            <div className="absolute top-0 right-0 w-[55%] sm:w-[55%] h-full z-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent z-10"></div>
              <img src="/hero-left-graphic.jpg" alt="Online Store Cart and Phone" className="w-full h-full object-cover object-right opacity-90 sm:opacity-100 transition-opacity" />
            </div>

            <div className="flex flex-col z-10 w-full relative h-full justify-center">
              <div className="w-[75%] sm:w-[60%] pointer-events-none">
                <div className="pointer-events-auto">
                  <h1 className="text-base sm:text-3xl lg:text-4xl xl:text-[2.8rem] font-black text-[#0f1928] leading-[1.1] mb-1 sm:mb-3 tracking-tight relative z-20 drop-shadow-xs">
                    One Platform.<br />Endless Possibilities.
                  </h1>
                  <p className="text-slate-600 font-medium mb-2 sm:mb-6 text-[10px] sm:text-base relative z-20 pr-1">
                    Shop, Sell & Grow with MarkatVerse
                  </p>
                </div>
              </div>
              
              <div className="flex flex-row flex-nowrap gap-1 sm:gap-3 mb-1 sm:mb-6 relative z-20 w-auto max-w-full sm:pb-2">
                <div className="flex items-center gap-1 sm:gap-2.5 bg-white/95 backdrop-blur shadow-xs border border-slate-200/90 rounded-lg sm:rounded-2xl py-0.5 px-1.5 sm:py-2.5 sm:px-4">
                  <div className="text-blue-600 shrink-0"><svg className="w-3 h-3 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-xs font-black text-slate-900 leading-none">B2B</span>
                    <span className="text-[6px] sm:text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5">Business to<br className="sm:hidden" /> Business</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2.5 bg-white/95 backdrop-blur shadow-xs border border-slate-200/90 rounded-lg sm:rounded-2xl py-0.5 px-1.5 sm:py-2.5 sm:px-4">
                  <div className="text-orange-500 shrink-0"><svg className="w-3 h-3 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-xs font-black text-slate-900 leading-none">B2C</span>
                    <span className="text-[6px] sm:text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5">Business to<br className="sm:hidden" /> Consumer</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2.5 bg-white/95 backdrop-blur shadow-xs border border-slate-200/90 rounded-lg sm:rounded-2xl py-0.5 px-1.5 sm:py-2.5 sm:px-4">
                  <div className="text-emerald-500 shrink-0"><svg className="w-3 h-3 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-xs font-black text-slate-900 leading-none">Services</span>
                    <span className="text-[6px] sm:text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5">Solutions for<br className="sm:hidden" /> Every Need</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex flex-row flex-nowrap gap-2 sm:gap-3 relative z-20 mt-auto w-[95%] sm:w-full">
                <Link href="/search" className="flex-1 sm:flex-none">
                  <button className="w-full bg-[#0f1928] hover:bg-slate-800 text-white px-3 sm:px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap">
                    Shop Now <span className="font-normal">→</span>
                  </button>
                </Link>
                <div className="flex-1 sm:flex-none">
                  <JoinSellerButton />
                </div>
              </div>
            </div>
          </div>

          {/* Right Banner - Dark Theme (Hidden on mobile, visible on desktop/tablet md+) */}
          <div className="hidden md:flex md:col-span-3 bg-[#061224] rounded-3xl p-4 sm:p-6 lg:p-8 flex-col shadow-xl relative overflow-hidden group border border-slate-800 min-h-[220px] md:min-h-0">
            
            {/* Background glowing effects & Image */}
            <div className="absolute inset-0 z-0 opacity-100 transition-opacity duration-700">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#061224]/60 via-[#061224]/20 to-transparent z-10 pointer-events-none"></div>
              <img src="/hero-right-graphic.jpg" alt="Global Delivery Network" className="w-full h-full object-cover object-bottom opacity-60 sm:opacity-100" />
            </div>
            
            <div className="flex flex-col z-10 w-full mb-3 md:mb-4 relative h-full">
              <div className="flex flex-col relative z-20">
                <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-white leading-[1.15] mb-2 tracking-tight drop-shadow-md">
                  Empowering<br/>Businesses.<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-teal-300 to-emerald-400">Enriching Lives.</span>
                </h2>
                <p className="text-slate-200 font-medium mb-4 sm:mb-6 text-[10px] sm:text-xs lg:text-sm leading-relaxed drop-shadow-sm">
                  B2B, B2C & Services<br/>All in One Place.
                </p>
                
                <Link href="/about" className="self-start">
                  <button className="bg-white/95 backdrop-blur hover:bg-white text-[#0f1928] px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1 sm:gap-2 shadow-lg">
                    Explore More <span className="font-normal">→</span>
                  </button>
                </Link>
              </div>
              
              <div className="flex flex-row justify-between items-center mt-auto relative z-20 bg-[#061224]/20 backdrop-blur-md pt-2 pb-1.5 sm:pt-3 sm:pb-2 lg:pt-4 lg:pb-3 px-3 sm:px-4 lg:px-6 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 lg:-mx-8 lg:-mb-8 rounded-b-3xl border-t border-white/10">
                <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
                  <div className="text-blue-400 drop-shadow"><svg className="w-4 h-4 sm:w-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
                  <span className="text-[7px] sm:text-[9px] xl:text-[10px] text-white font-medium leading-tight">Wide Range<br/>of Products</span>
                </div>
                
                <div className="w-[1px] h-6 sm:h-8 bg-white/10 mx-0.5 sm:mx-1"></div>
                
                <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
                  <div className="text-blue-400 drop-shadow"><svg className="w-4 h-4 sm:w-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
                  <span className="text-[7px] sm:text-[9px] xl:text-[10px] text-white font-medium leading-tight">Trusted<br/>& Secure</span>
                </div>
                
                <div className="w-[1px] h-6 sm:h-8 bg-white/10 mx-0.5 sm:mx-1"></div>
                
                <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
                  <div className="text-blue-400 drop-shadow"><svg className="w-4 h-4 sm:w-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg></div>
                  <span className="text-[7px] sm:text-[9px] xl:text-[10px] text-white font-medium leading-tight">Fast & Reliable<br/>Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Browse Categories & Services (65% Categories/Services Stack + 35% Graphic Banner on Mobile, 2-column Desktop on md+) */}
        <ScrollReveal delay={100}>
        <section className="mt-2 w-full">
          {/* Mobile View: 65% Left (Categories & Services stacked vertically) + 35% Right (Compact Graphic Banner) */}
          <div className="flex flex-row md:hidden gap-2 sm:gap-3 w-full items-stretch">
            {/* 65% Left Column: Categories and Services stacked vertically */}
            <div className="w-[65%] flex flex-col gap-2">
              {/* Compact Categories Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h2 className="text-xs font-black text-slate-900 tracking-tight leading-none">
                      Products & Markets
                    </h2>
                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5 block leading-none">All in One Place</span>
                  </div>
                  <Link href="/explore">
                    <button className="bg-[#0f1928] hover:bg-slate-800 text-white px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all flex items-center gap-0.5">
                      Explore ›
                    </button>
                  </Link>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 custom-scrollbar">
                  {[
                    { name: "Electronics", icon: "📱", bg: "bg-blue-50", link: "/search?category=Electronics" },
                    { name: "Home", icon: "🛋️", bg: "bg-slate-100", link: "/search?category=Home%20%26%20Living" },
                    { name: "Industrial", icon: "👷", bg: "bg-amber-50", link: "/search?category=Industrial" },
                    { name: "Beauty", icon: "🧴", bg: "bg-pink-50", link: "/search?category=Beauty" },
                    { name: "Grocery", icon: "🛒", bg: "bg-emerald-50", link: "/search?category=Grocery" },
                    { name: "More", icon: "🔠", bg: "bg-slate-100", link: "/explore" }
                  ].map((cat, idx) => (
                    <Link href={cat.link} key={idx} className="flex flex-col items-center gap-1 min-w-[46px] text-center cursor-pointer group no-underline shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shadow-inner ${cat.bg}`}>
                        {cat.icon}
                      </div>
                      <span className="text-[9px] font-bold text-slate-800 leading-tight truncate w-full tracking-tight">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Compact Services Card */}
              <div className="bg-[#f0fdf4] rounded-2xl border border-emerald-100 shadow-xs p-3 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <div>
                    <span className="text-emerald-700 font-extrabold text-[8px] uppercase tracking-wider block leading-none mb-0.5">Services</span>
                    <h2 className="text-xs font-black text-slate-900 tracking-tight leading-none">
                      Solutions for Growth
                    </h2>
                  </div>
                  <Link href="/explore/services">
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all flex items-center gap-0.5">
                      Services ›
                    </button>
                  </Link>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto w-full relative z-10 pb-1 custom-scrollbar">
                  {[
                    { name: "Logistics", icon: "🚚" },
                    { name: "Setup", icon: "🔧" },
                    { name: "Support", icon: "👨‍🔧" },
                    { name: "Consulting", icon: "💼" }
                  ].map((srv, idx) => (
                    <Link href={`/search?service=${encodeURIComponent(srv.name)}`} key={idx} className="flex flex-col items-center gap-1 min-w-[46px] text-center cursor-pointer group no-underline shrink-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-xs bg-white border border-emerald-100">
                        {srv.icon}
                      </div>
                      <span className="text-[9px] font-bold text-slate-800 leading-tight truncate w-full tracking-tight">{srv.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 35% Right Column: Vertical Graphic Image Card with sleek compact proportion */}
            <div className="w-[35%] bg-gradient-to-br from-[#061224] to-[#0f2444] rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between p-2 text-white">
              {/* Graphic background - Crisp and fully clear */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="/hero-right-graphic.jpg" 
                  alt="Fast Logistics & Delivery" 
                  className="w-full h-full object-cover object-bottom opacity-95 transition-transform duration-500 hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#061224]/90 via-[#061224]/30 to-black/50 pointer-events-none"></div>
              </div>
              
              {/* Header Headline & Compact Explore Button */}
              <div className="relative z-10 flex flex-col items-start">
                <span className="text-[7.5px] uppercase tracking-wider text-teal-300 font-extrabold bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded border border-teal-400/40 mb-1 leading-none">
                  Global Hub
                </span>
                <h3 className="text-[11px] font-black text-white leading-tight tracking-normal drop-shadow-md">
                  Empowering Businesses.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-teal-300 to-emerald-300">
                    Enriching Lives.
                  </span>
                </h3>
                <p className="text-[8px] text-slate-100 font-medium leading-tight mt-0.5 drop-shadow-sm line-clamp-2">
                  B2B, B2C & Services in one place.
                </p>

                {/* Compact Explore Button */}
                <Link href="/about" className="mt-1.5 inline-block">
                  <button className="bg-white hover:bg-slate-100 text-[#061224] py-1 px-2.5 rounded-lg font-black text-[9px] transition-all flex items-center gap-0.5 shadow-md active:scale-95 leading-none">
                    Explore →
                  </button>
                </Link>
              </div>

              {/* Bottom Section: Horizontal Transparent Features Bar at the very bottom */}
              <div className="relative z-10 mt-auto pt-1.5">
                <div className="flex flex-row items-center justify-between gap-0.5 -mx-2 -mb-2 px-1 py-1 bg-black/60 backdrop-blur-sm border-t border-white/15 rounded-b-2xl">
                  <div className="flex items-center gap-0.5 text-[7px] text-white font-bold min-w-0 flex-1 justify-center">
                    <span className="text-[8px] leading-none shrink-0">📦</span>
                    <span className="truncate leading-none">Products</span>
                  </div>
                  <div className="w-[1px] h-2.5 bg-white/20 shrink-0"></div>
                  <div className="flex items-center gap-0.5 text-[7px] text-white font-bold min-w-0 flex-1 justify-center">
                    <span className="text-[8px] leading-none shrink-0">🛡️</span>
                    <span className="truncate leading-none">Secure</span>
                  </div>
                  <div className="w-[1px] h-2.5 bg-white/20 shrink-0"></div>
                  <div className="flex items-center gap-0.5 text-[7px] text-white font-bold min-w-0 flex-1 justify-center">
                    <span className="text-[8px] leading-none shrink-0">⚡</span>
                    <span className="truncate leading-none">Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet View (Original spacious 2-column layout) */}
          <div className="hidden md:grid md:grid-cols-2 gap-4 w-full">
            {/* Categories Panel */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-6 lg:gap-8">
              <div className="flex flex-col justify-between items-start text-left gap-4 min-w-[200px] shrink-0">
                <div>
                  <h2 className="text-xl lg:text-2xl font-black text-[#0f1928] leading-tight">
                    Everything You Need, <br />All in One Place
                  </h2>
                  <div className="h-1 w-12 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 rounded-full mt-2 mb-2"></div>
                </div>
                <Link href="/explore">
                  <button className="bg-[#0f1928] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2">
                    Explore Markets <span className="font-bold">→</span>
                  </button>
                </Link>
              </div>
              
              <div className="flex items-center gap-3 overflow-x-auto w-full pb-3 custom-scrollbar">
                {[
                  { name: "Electronics", icon: "📱", bg: "bg-blue-50", link: "/search?category=Electronics" },
                  { name: "Home & Living", icon: "🛋️", bg: "bg-slate-100", link: "/search?category=Home%20%26%20Living" },
                  { name: "Industrial", icon: "👷", bg: "bg-amber-50", link: "/search?category=Industrial" },
                  { name: "Beauty & Personal Care", icon: "🧴", bg: "bg-pink-50", link: "/search?category=Beauty" },
                  { name: "Grocery", icon: "🛒", bg: "bg-emerald-50", link: "/search?category=Grocery" },
                  { name: "Explore All", icon: "🔠", bg: "bg-slate-100", link: "/explore" }
                ].map((cat, idx) => (
                  <Link href={cat.link} key={idx} className="flex flex-col items-center gap-2 min-w-[75px] text-center cursor-pointer group no-underline">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-transform group-hover:scale-105 shadow-inner ${cat.bg}`}>
                      {cat.icon}
                    </div>
                    <span className="text-[10px] font-bold text-[#0f1928] leading-tight max-w-[75px] group-hover:text-blue-600 transition-colors">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Services Panel */}
            <div className="bg-[#f0fdf4] rounded-3xl border border-emerald-100 shadow-sm p-6 lg:p-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-6 lg:gap-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-48 bg-[radial-gradient(#a7f3d0_2px,transparent_2px)] [background-size:16px_16px] opacity-40 z-0 mask-image-linear-gradient"></div>
              
              <div className="flex flex-col justify-between items-start text-left gap-2 min-w-[200px] shrink-0 relative z-10">
                <div>
                  <span className="text-emerald-600 font-bold text-sm block mb-1">Services</span>
                  <h2 className="text-xl lg:text-2xl font-black text-[#0f1928] leading-tight mb-4">
                    Solutions That <br />Drive Your Success
                  </h2>
                </div>
                <Link href="/explore/services">
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2">
                    Explore Services <span className="font-bold">→</span>
                  </button>
                </Link>
              </div>
              
              <div className="flex items-center gap-3 overflow-x-auto w-full relative z-10 pb-3 custom-scrollbar">
                {[
                  { name: "Logistics & Delivery", icon: "🚚" },
                  { name: "Installation & Setup", icon: "🔧" },
                  { name: "Maintenance & Support", icon: "👨‍🔧" },
                  { name: "Business Consulting", icon: "💼" }
                ].map((srv, idx) => (
                  <Link href={`/search?service=${encodeURIComponent(srv.name)}`} key={idx} className="flex flex-col items-center gap-2 min-w-[75px] text-center cursor-pointer group no-underline">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-105 shadow-sm bg-white border border-emerald-100">
                      {srv.icon}
                    </div>
                    <span className="text-[10px] font-bold text-[#0f1928] leading-tight max-w-[75px] group-hover:text-emerald-600 transition-colors">{srv.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
        </ScrollReveal>

        {/* Recommendations */}
        <ScrollReveal delay={200}>
          <Recommendations />
        </ScrollReveal>

        {/* Top Picks For You (Product Grid) */}
        <ScrollReveal delay={250}>
        <section className="mt-4">
          <div className="flex justify-between items-end border-b border-slate-200 pb-3 mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Top Picks For You</h2>
            <Link href="/search?filter=top_picks" className="text-blue-600 font-bold hover:underline text-sm flex items-center gap-1">View All <span className="text-lg leading-none">›</span></Link>
          </div>
          <ProductGrid personalized={true} />
        </section>
        </ScrollReveal>

        {/* Services For You */}
        <ScrollReveal delay={300}>
        <section className="mt-4">
          <div className="flex justify-between items-end border-b border-slate-200 pb-3 mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Services For You</h2>
            <Link href="/search?type=services" className="text-blue-600 font-bold hover:underline text-sm flex items-center gap-1">View All <span className="text-lg leading-none">›</span></Link>
          </div>
          <ProductGrid serviceOnly={true} personalized={true} />
        </section>
        </ScrollReveal>

        {/* Recently Viewed */}
        <ScrollReveal delay={400}>
        <section className="mt-4">
          <div className="flex justify-between items-end border-b border-slate-200 pb-3 mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Recently Viewed</h2>
          </div>
          <ProductGrid recent={true} />
        </section>
        </ScrollReveal>

        {/* Global Markets & Hubs (Grid Layout replacing the long scrolling lists) */}
        <ScrollReveal delay={500}>
        <section className="mt-8">
          <div className="flex justify-between items-end border-b border-slate-200 pb-3 mb-6">
            <div>
              <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Discover</div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Global Markets & Hubs</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            
            {/* B2B Hub Card */}
            <Link href="/search?filter=b2b" className="group rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="h-24 sm:h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative p-3 sm:p-6 flex flex-col justify-end">
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-sm sm:text-2xl shadow-inner border border-white/30">🏭</div>
                <div className="text-white/80 text-[8px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest font-bold mb-0.5 sm:mb-1 line-clamp-1">Business to Business</div>
                <h3 className="text-xs sm:text-xl font-bold text-white leading-tight line-clamp-2">Wholesale & Enterprise</h3>
              </div>
              <div className="p-2.5 sm:p-5 text-[11px] sm:text-sm text-slate-600 font-medium bg-white group-hover:bg-blue-50 transition-colors flex justify-between items-center gap-1">
                <span className="line-clamp-1">Bulk deals & suppliers</span> <span className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors text-xs sm:text-base">›</span>
              </div>
            </Link>

            {/* Construction Hub Card */}
            <Link href="/search?category=Construction%20Materials" className="group rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="h-24 sm:h-32 bg-gradient-to-br from-amber-500 to-orange-600 relative p-3 sm:p-6 flex flex-col justify-end">
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-sm sm:text-2xl shadow-inner border border-white/30">🏗️</div>
                <div className="text-white/80 text-[8px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest font-bold mb-0.5 sm:mb-1 line-clamp-1">Building & Infrastructure</div>
                <h3 className="text-xs sm:text-xl font-bold text-white leading-tight line-clamp-2">Construction Materials</h3>
              </div>
              <div className="p-2.5 sm:p-5 text-[11px] sm:text-sm text-slate-600 font-medium bg-white group-hover:bg-amber-50 transition-colors flex justify-between items-center gap-1">
                <span className="line-clamp-1">Cement, steel & raw</span> <span className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors text-xs sm:text-base">›</span>
              </div>
            </Link>

            {/* B2C Services Card */}
            <Link href="/search?cat=Home Services" className="group rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="h-24 sm:h-32 bg-gradient-to-br from-emerald-500 to-teal-600 relative p-3 sm:p-6 flex flex-col justify-end">
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-sm sm:text-2xl shadow-inner border border-white/30">🔧</div>
                <div className="text-white/80 text-[8px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest font-bold mb-0.5 sm:mb-1 line-clamp-1">Direct to Consumer</div>
                <h3 className="text-xs sm:text-xl font-bold text-white leading-tight line-clamp-2">Retail & Home Services</h3>
              </div>
              <div className="p-2.5 sm:p-5 text-[11px] sm:text-sm text-slate-600 font-medium bg-white group-hover:bg-emerald-50 transition-colors flex justify-between items-center gap-1">
                <span className="line-clamp-1">AC, plumbing & cleaning</span> <span className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors text-xs sm:text-base">›</span>
              </div>
            </Link>

            {/* Beauty & Spa Card */}
            <Link href="/search?cat=Services" className="group rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="h-24 sm:h-32 bg-gradient-to-br from-pink-500 to-rose-600 relative p-3 sm:p-6 flex flex-col justify-end">
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-sm sm:text-2xl shadow-inner border border-white/30">💆‍♀️</div>
                <div className="text-white/80 text-[8px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest font-bold mb-0.5 sm:mb-1 line-clamp-1">Wellness & Care</div>
                <h3 className="text-xs sm:text-xl font-bold text-white leading-tight line-clamp-2">Salon, Spa & Beauty</h3>
              </div>
              <div className="p-2.5 sm:p-5 text-[11px] sm:text-sm text-slate-600 font-medium bg-white group-hover:bg-pink-50 transition-colors flex justify-between items-center gap-1">
                <span className="line-clamp-1">Tokens for salons</span> <span className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 group-hover:bg-pink-600 group-hover:text-white transition-colors text-xs sm:text-base">›</span>
              </div>
            </Link>

            {/* Organizers Card */}
            <Link href="/search?cat=Organizers" className="group rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="h-24 sm:h-32 bg-gradient-to-br from-violet-500 to-purple-700 relative p-3 sm:p-6 flex flex-col justify-end">
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-sm sm:text-2xl shadow-inner border border-white/30">🎉</div>
                <div className="text-white/80 text-[8px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest font-bold mb-0.5 sm:mb-1 line-clamp-1">Events & Planning</div>
                <h3 className="text-xs sm:text-xl font-bold text-white leading-tight line-clamp-2">Top Organizers</h3>
              </div>
              <div className="p-2.5 sm:p-5 text-[11px] sm:text-sm text-slate-600 font-medium bg-white group-hover:bg-violet-50 transition-colors flex justify-between items-center gap-1">
                <span className="line-clamp-1">Weddings & parties</span> <span className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors text-xs sm:text-base">›</span>
              </div>
            </Link>

            {/* Transport Card */}
            <Link href="/search?cat=Transport" className="group rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="h-24 sm:h-32 bg-gradient-to-br from-cyan-500 to-blue-600 relative p-3 sm:p-6 flex flex-col justify-end">
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-sm sm:text-2xl shadow-inner border border-white/30">🚛</div>
                <div className="text-white/80 text-[8px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest font-bold mb-0.5 sm:mb-1 line-clamp-1">Mobility & Freight</div>
                <h3 className="text-xs sm:text-xl font-bold text-white leading-tight line-clamp-2">Transport Services</h3>
              </div>
              <div className="p-2.5 sm:p-5 text-[11px] sm:text-sm text-slate-600 font-medium bg-white group-hover:bg-emerald-50 transition-colors flex justify-between items-center gap-1">
                <span className="line-clamp-1">Movers & logistics</span> <span className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors text-xs sm:text-base">›</span>
              </div>
            </Link>

          </div>
        </section>
        </ScrollReveal>

        {/* Call to Action Section (Trust Badges in 1 Line) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-8 mb-6">
          <div className="group relative bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-500/20 transition-all"></div>
            <div className="relative z-10 w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner border border-blue-100/50 shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="relative z-10 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 leading-tight truncate sm:whitespace-normal">Trusted & Secure</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight hidden xs:block sm:block line-clamp-2">100% secure encrypted payments.</p>
            </div>
          </div>
          <div className="group relative bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-amber-500/20 transition-all"></div>
            <div className="relative z-10 w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner border border-amber-100/50 shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="relative z-10 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 leading-tight truncate sm:whitespace-normal">Quality Assured</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight hidden xs:block sm:block line-clamp-2">Verified global genuine inventory.</p>
            </div>
          </div>
          <div className="group relative bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="relative z-10 w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner border border-emerald-100/50 shrink-0 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="relative z-10 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 leading-tight truncate sm:whitespace-normal">Easy Returns</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight hidden xs:block sm:block line-clamp-2">Hassle-free 7-day refund guarantee.</p>
            </div>
          </div>
        </div>
        {/* Blog Posts */}
        {blogPosts.length > 0 && (
          <ScrollReveal delay={600}>
            <section className="mt-8 mb-8">
              <div className="flex justify-between items-end border-b border-slate-200 pb-3 mb-6">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Latest News</div>
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-900">From Our Blog</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogPosts.map((post: any) => (
                  <div key={post.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                    <div className="p-6">
                      <div className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wide">Article</div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-3">{post.content}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <div className="text-xs font-medium text-slate-400">By {post.author || 'MarkatVerse Team'}</div>
                        <a href={`/blog/${post.slug}`} className="text-sm font-bold text-blue-600 hover:underline">Read More &rarr;</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

      </main>

    </div>
  );
}
