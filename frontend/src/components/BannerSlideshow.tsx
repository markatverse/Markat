"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BannerSlideshow({ banners: initialBanners }: { banners: any[] }) {
  const [banners, setBanners] = useState<any[]>(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If initial server banners were empty, hydrate directly on client from backend
    if (!banners || banners.length === 0) {
      const getApiUrl = () => {
        if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
        if (typeof window !== 'undefined') {
          return `${window.location.protocol}//${window.location.hostname}:3001`;
        }
        return 'http://127.0.0.1:3001';
      };
      const API_URL = getApiUrl();
      fetch(`${API_URL}/content/banners`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            const heroBanners = data.filter((b: any) => b.status === 'ACTIVE' && b.position === 'HOME_HERO');
            if (heroBanners.length > 0) {
              setBanners(heroBanners);
            }
          }
        })
        .catch(() => {});
    }
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

  if (!banners || banners.length === 0) return null;

  return (
    <div className="w-full relative rounded-3xl overflow-hidden shadow-sm group">
      <div 
        className="flex transition-transform duration-700 ease-in-out h-[180px] sm:h-[250px] md:h-[400px]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner: any, idx: number) => (
          <div key={banner.id} className="min-w-full relative h-[180px] sm:h-[250px] md:h-[400px]">
            <img 
              src={banner.imageUrl} 
              alt={banner.title} 
              loading={idx === 0 ? "eager" : "lazy"}
              // @ts-ignore
              fetchPriority={idx === 0 ? "high" : "auto"}
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-2 transform translate-y-0 opacity-100 transition-all duration-700 delay-100">{banner.title}</h2>
              {banner.linkUrl && (
                <Link href={banner.linkUrl} className="inline-block mt-4 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all w-fit shadow-lg shadow-emerald-500/20">
                  Explore Offer
                </Link>
              )}
            </div>
          </div>
        ))}
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
