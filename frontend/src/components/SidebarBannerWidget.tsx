"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; };

export default function SidebarBannerWidget() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      setIsLoading(true);
      try {
        const API_URL = getApiUrl();
        const res = await fetch(`${API_URL}/content/banners`);
        if (res.ok) {
          const data = await res.json();
          const sidebarBanners = data.filter((b: any) => b.status === 'ACTIVE' && b.position === 'SIDEBAR');
          setBanners(sidebarBanners);
        }
      } catch (e) {
        console.error("Failed to fetch sidebar banners", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 mt-6">
        <div className="w-full bg-slate-200 animate-pulse rounded-2xl h-[200px]"></div>
      </div>
    );
  }

  if (!banners || banners.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mt-6">
      {banners.map((banner) => {
        const rawUrl = banner.imageUrl || '';
        const fullImgUrl = rawUrl.startsWith('/') && !rawUrl.startsWith('//')
          ? `${getApiUrl()}${rawUrl}`
          : rawUrl;

        return (
          <div key={banner.id} className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
              <img 
                src={fullImgUrl} 
                alt={banner.title} 
                loading="lazy" 
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-bold text-lg leading-tight mb-1">{banner.title}</h3>
              </div>
            </div>
            {banner.linkUrl && (
              <div className="p-3 bg-white text-center">
                <Link href={banner.linkUrl} className="block w-full py-2 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-100 transition-colors">
                  View Offer
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
