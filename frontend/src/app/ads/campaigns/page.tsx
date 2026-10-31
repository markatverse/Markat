"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CampaignEngineRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ads/advertiser');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-3">
      <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-slate-500 font-medium">Opening unified Campaign Manager...</p>
    </div>
  );
}
