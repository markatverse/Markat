"use client";
import React, { useEffect, useState } from 'react';
import AdSlideshow from '@/components/AdSlideshow';

import { fastFetch, getApiUrl } from '@/utils/api';

export default function AdvertisementWidget({ position, className = "" }: { position: string, className?: string }) {
  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAds = async () => {
      try {
        const API_URL = getApiUrl();
        const data = await fastFetch<any[]>(`${API_URL}/commercial/advertisements`, {
          ttlMs: 60000,
          timeoutMs: 6000
        });
        if (isMounted && Array.isArray(data)) {
          const filteredAds = data.filter((ad: any) => ad.status === 'ACTIVE' && ad.position === position);
          setAds(filteredAds);
        }
      } catch (e) {
        console.error(`Failed to fetch advertisements for position ${position}`, e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchAds();
    return () => {
      isMounted = false;
    };
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
