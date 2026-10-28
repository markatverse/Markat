"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { getApiUrl, fastFetch, resolveMediaUrl } from '@/utils/api';

const DEFAULT_BANNER = {
  id: 'default-hero-1',
  title: 'Welcome to MarkatVerse',
  imageUrl: '/hero-left-graphic.jpg',
  linkUrl: '/explore',
  status: 'ACTIVE'
};

export default function BannerSlideshow({ banners: initialBanners }: { banners: any[] }) {
  // Only keep active banners
  const filterActive = (list: any[]) => {
    if (!Array.isArray(list)) return [];
    return list.filter((b: any) => b && b.status === 'ACTIVE' && (b.position === 'HOME_HERO' || b.position === 'HOMEPAGE' || !b.position));
  };

  const initialActive = filterActive(initialBanners || []);
  const [banners, setBanners] = useState<any[]>(initialActive);
  const [hasLoaded, setHasLoaded] = useState<boolean>(Boolean(initialBanners));
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. If server passed banners, update state
    if (initialBanners !== undefined) {
      const active = filterActive(initialBanners);
      setBanners(active);
      setHasLoaded(true);
      try {
        localStorage.setItem('mv_cache_banners', JSON.stringify(active));
      } catch {}
      return;
    }

    // 2. Load from localStorage if present
    try {
      const cached = localStorage.getItem('mv_cache_banners');
      if (cached) {
        const parsed = JSON.parse(cached);
        const active = filterActive(parsed);
        setBanners(active);
      }
    } catch {}

    // 3. Background fresh fetch from API
    fastFetch<any[]>('/content/banners', { ttlMs: 5000 })
      .then(data => {
        if (Array.isArray(data)) {
          const active = filterActive(data);
          setBanners(active);
          try {
            localStorage.setItem('mv_cache_banners', JSON.stringify(active));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setHasLoaded(true));
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

  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  // If no active banners are configured or if they were stopped/set to INACTIVE, DO NOT render anything (no empty blue color container)
  if (!banners || banners.length === 0) {
    return null;
  }

  // Filter out any banners where the media failed to load
  const validBanners = banners.filter((b, idx) => !failedImageIds[b.id || idx]);
  if (validBanners.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative rounded-3xl overflow-hidden shadow-sm group">
      <div 
        className="flex transition-transform duration-700 ease-in-out h-[180px] sm:h-[250px] md:h-[400px]"
        style={{ transform: `translateX(-${(currentIndex % validBanners.length) * 100}%)` }}
      >
        {validBanners.map((banner: any, idx: number) => {
          const fullImgUrl = resolveMediaUrl(banner.imageUrl);

          return (
            <div key={banner.id || idx} className="min-w-full relative h-[180px] sm:h-[250px] md:h-[400px] bg-slate-900">
              <img 
                src={fullImgUrl} 
                alt={banner.title || 'MarkatVerse'} 
                loading={idx === 0 ? "eager" : "lazy"}
                fetchPriority={idx === 0 ? "high" : "auto"}
                onError={() => {
                  // Mark this banner as broken so it does not render as an empty blue box
                  setFailedImageIds(prev => ({ ...prev, [banner.id || idx]: true }));
                }}
                className="w-full h-full object-cover" 
              />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 pointer-events-none">
              {banner.title && banner.title !== '.' && (
                <h2 className="text-3xl md:text-5xl font-black text-white mb-2 transform translate-y-0 opacity-100 transition-all duration-700 delay-100">{banner.title}</h2>
              )}
              {banner.linkUrl && (
                <Link href={banner.linkUrl} className="inline-block mt-4 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all w-fit shadow-lg shadow-emerald-500/20 pointer-events-auto">
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
