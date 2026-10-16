"use client";
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function TopBannerWidget() {
  const [banner, setBanner] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        const getApiUrl = () => {
          if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
          if (typeof window !== 'undefined') {
            return `${window.location.protocol}//${window.location.hostname}:3001`;
          }
          return 'http://127.0.0.1:3001';
        };
        const API_URL = getApiUrl();
        const res = await fetch(`${API_URL}/content/banners`, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        }).catch(() => null);

        if (res && res.ok && isMounted) {
          const data = await res.json().catch(() => []);
          if (Array.isArray(data)) {
            const topBarBanners = data.filter((b: any) => b.status === 'ACTIVE' && b.position === 'TOP_BAR');
            if (topBarBanners.length > 0) {
              setBanner(topBarBanners[0]);
            }
          }
        }
      } catch {
        // Silently handle network drops during server startup
      }
    };
    fetchBanners();
    return () => { isMounted = false; };
  }, []);

  if (!banner || !isVisible) return null;

  return (
    <div className="w-full bg-[#0f1928] text-white relative z-50 overflow-hidden shadow-sm">
      {banner.imageUrl && (
        <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-emerald-600/40 z-0 mix-blend-overlay"></div>
      <div className="relative z-10 container mx-auto px-4 py-2 flex items-center justify-center min-h-[40px]">
        <span className="text-sm font-bold text-center pr-8 drop-shadow-md tracking-wide">{banner.title}</span>
        {banner.linkUrl && (
          <a href={banner.linkUrl} className="ml-3 text-xs font-black bg-white text-[#0f1928] hover:bg-emerald-400 hover:text-white px-3 py-1 rounded-full transition-colors shadow-sm">
            Learn More
          </a>
        )}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
