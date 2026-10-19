"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getApiUrl, fastFetch, resolveMediaUrl } from '@/utils/api';

const DEFAULT_AD = {
  id: 'default-ad-1',
  title: 'Exclusive Deals on MarkatVerse',
  mediaUrl: '/hero-right-graphic.jpg',
  linkUrl: '/search',
  position: 'HOMEPAGE',
  status: 'ACTIVE'
};

export default function AdSlideshow({ ads: initialAds }: { ads: any[] }) {
  // Only keep active ads
  const filterActive = (list: any[]) => {
    if (!Array.isArray(list)) return [];
    return list.filter((ad: any) => ad && ad.status === 'ACTIVE' && (ad.position === 'HOMEPAGE' || !ad.position));
  };

  const initialActive = filterActive(initialAds || []);
  const [ads, setAds] = useState<any[]>(initialActive);
  const [hasLoaded, setHasLoaded] = useState<boolean>(Boolean(initialAds));
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. If server passed ads, update state
    if (initialAds !== undefined) {
      const active = filterActive(initialAds);
      setAds(active);
      setHasLoaded(true);
      try {
        localStorage.setItem('mv_cache_ads', JSON.stringify(active));
        localStorage.setItem('mv_cache_advertisements', JSON.stringify(active));
      } catch {}
      return;
    }

    // 2. Load from localStorage if present
    try {
      const cached = localStorage.getItem('mv_cache_advertisements') || localStorage.getItem('mv_cache_ads');
      if (cached) {
        const parsed = JSON.parse(cached);
        const active = filterActive(parsed);
        setAds(active);
      }
    } catch {}

    // 3. Background fresh fetch from API
    const fetchFreshAds = async () => {
      try {
        let data = await fastFetch<any[]>('/commercial/advertisements', { ttlMs: 5000 });
        if (!Array.isArray(data) || data.length === 0) {
          data = await fastFetch<any[]>('/content/advertisements', { ttlMs: 5000 });
        }
        if (Array.isArray(data)) {
          const active = filterActive(data);
          setAds(active);
          try {
            localStorage.setItem('mv_cache_ads', JSON.stringify(active));
            localStorage.setItem('mv_cache_advertisements', JSON.stringify(active));
          } catch {}
        }
      } catch {} finally {
        setHasLoaded(true);
      }
    };
    fetchFreshAds();
  }, [initialAds]);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (ads.length <= 1) return;
    
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === ads.length - 1 ? 0 : prevIndex + 1));
    }, 6000); // Auto-slide every 6 seconds

    return () => resetTimeout();
  }, [currentIndex, ads.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? ads.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === ads.length - 1 ? 0 : prevIndex + 1));
  };

  const [failedAdIds, setFailedAdIds] = useState<Record<string, boolean>>({});

  // If no active ads exist or they are stopped/INACTIVE, DO NOT render empty blue/dark box
  if (!ads || ads.length === 0) {
    return null;
  }

  const validAds = ads.filter((ad, idx) => !failedAdIds[ad.id || idx]);
  if (validAds.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative rounded-2xl overflow-hidden shadow-sm group">
      <div 
        className="flex transition-transform duration-700 ease-in-out h-[90px] sm:h-[120px] md:h-[160px]"
        style={{ transform: `translateX(-${(currentIndex % validAds.length) * 100}%)` }}
      >
        {validAds.map((ad: any, idx: number) => {
          const fullImgUrl = resolveMediaUrl(ad.mediaUrl || ad.imageUrl);

          return (
            <div key={ad.id || ad._id || idx} className="min-w-full relative flex items-center h-full">
              <a href={ad.linkUrl || '#'} className="block w-full h-full bg-slate-900 text-white relative overflow-hidden group/ad flex items-center p-3 sm:p-5 md:p-8">
                {/* Background Image or Gradient */}
                {fullImgUrl ? (
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={fullImgUrl} 
                      alt={ad.title || 'Advertisement'} 
                      loading="eager"
                      onError={() => {
                        setFailedAdIds(prev => ({ ...prev, [ad.id || idx]: true }));
                      }}
                      className="w-full h-full object-cover opacity-80 group-hover/ad:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
                  </div>
                ) : (
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-emerald-500 to-teal-500" />
                )}
              
                <div className="absolute inset-0 bg-black/10 group-hover/ad:bg-black/0 transition-colors z-0" />
              
                <div className="relative z-10 flex items-end justify-between w-full h-full gap-2 pb-1">
                  <h3 className="text-sm sm:text-lg md:text-2xl font-black tracking-tight drop-shadow-md max-w-[60%] leading-tight line-clamp-2">
                    {ad.title}
                  </h3>
                  <span className="bg-white text-emerald-600 px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-bold text-[10px] sm:text-xs md:text-sm shadow-md md:shadow-xl group-hover/ad:scale-105 transition-transform shrink-0 whitespace-nowrap">
                    Explore <span className="hidden sm:inline">Now </span>&rarr;
                  </span>
                </div>
              </a>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {ads.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${currentIndex === idx ? 'bg-white w-6' : 'bg-white/50 w-1.5 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
