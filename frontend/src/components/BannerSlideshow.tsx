"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { getApiUrl, fastFetch } from '@/utils/api';

export default function BannerSlideshow({ banners: initialBanners }: { banners: any[] }) {
  const [banners, setBanners] = useState<any[]>(initialBanners || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialBanners || initialBanners.length === 0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If initial server banners were provided, use them directly (zero flash)
    if (initialBanners && initialBanners.length > 0) {
      setBanners(initialBanners);
      setIsLoading(false);
      return;
    }

    // Only fallback fetch if server didn't provide any
    fastFetch<any[]>('/content/banners', { ttlMs: 30000 })
      .then(data => {
        if (Array.isArray(data)) {
          const heroBanners = data.filter((b: any) => b.status === 'ACTIVE' && b.position === 'HOME_HERO');
          if (heroBanners.length > 0) {
            setBanners(heroBanners);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [initialBanners]);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
    }, 5000); // Auto-slide every 5 seconds

    return () => resetTimeout();
  }, [currentIndex, banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
  };

  if (isLoading) {
    return (
      <div className="w-full h-[180px] sm:h-[250px] md:h-[400px] rounded-3xl bg-slate-200/80 animate-pulse overflow-hidden relative shadow-sm border border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
          <div className="h-8 w-2/5 bg-slate-300 rounded-lg animate-pulse" />
          <div className="h-4 w-1/4 bg-slate-300 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) return null;

  return (
    <div className="w-full relative rounded-3xl overflow-hidden shadow-sm group">
      <div 
        className="flex transition-transform duration-700 ease-in-out h-[180px] sm:h-[250px] md:h-[400px]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner: any, idx: number) => {
          const rawUrl = banner.imageUrl || '';
          const fullImgUrl = rawUrl.startsWith('/') && !rawUrl.startsWith('//')
            ? `${getApiUrl()}${rawUrl}`
            : rawUrl;

          return (
            <div key={banner.id} className="min-w-full relative h-[180px] sm:h-[250px] md:h-[400px] bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900">
              <img 
                src={fullImgUrl} 
                alt={banner.title} 
                loading={idx === 0 ? "eager" : "lazy"}
                // @ts-ignore
                fetchPriority={idx === 0 ? "high" : "auto"}
                onError={(e) => {
                  // Fallback to elegant un-broken visual if backend media server is cold or 404s
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
                className="w-full h-full object-cover" 
              />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
              {banner.title && (
                <h2 className="text-3xl md:text-5xl font-black text-white mb-2 transform translate-y-0 opacity-100 transition-all duration-700 delay-100">{banner.title}</h2>
              )}
              {banner.linkUrl && (
                <Link href={banner.linkUrl} className="inline-block mt-4 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all w-fit shadow-lg shadow-emerald-500/20">
                  Explore Offer
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${currentIndex === idx ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
