"use client";
import React, { useEffect, useState } from 'react';
import AdSlideshow from '@/components/AdSlideshow';

export default function AdvertisementWidget({ position, className = "" }: { position: string, className?: string }) {
  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      setIsLoading(true);
      try {
        const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();
        const res = await fetch(`${API_URL}/commercial/advertisements`);
        if (res.ok) {
          const data = await res.json();
          const filteredAds = data.filter((ad: any) => ad.status === 'ACTIVE' && ad.position === position);
          setAds(filteredAds);
        }
      } catch (e) {
        console.error(`Failed to fetch advertisements for position ${position}`, e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAds();
  }, [position]);

  if (isLoading) {
    return (
      <div className={`w-full flex flex-col gap-4 ${className}`}>
        <div className="block w-full bg-slate-200 animate-pulse rounded-2xl min-h-[120px] md:min-h-[160px]"></div>
      </div>
    );
  }

  if (!ads || ads.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      <AdSlideshow ads={ads} />
    </div>
  );
}
