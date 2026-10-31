"use client";

import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';

interface AdsHeroIllustrationProps {
  className?: string;
}

export default function AdsHeroIllustration({ className = '' }: AdsHeroIllustrationProps) {
  return (
    <div className={`relative w-full max-w-2xl mx-auto group ${className}`}>
      {/* Ambient Radial Lighting Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-blue-500/15 rounded-3xl blur-2xl opacity-70 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none" />

      {/* Main SVG Graphic Container */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-xl transition-transform duration-500 group-hover:scale-[1.01]">
        {/* Render the SVG illustration */}
        <img
          src="/ads-illustration.svg"
          alt="MarkatVerse Modern Hyperlocal Advertising Ecosystem"
          className="w-full h-auto object-cover rounded-3xl block"
          loading="eager"
        />

        {/* Floating Interactive Badge 1: Top Right - ROAS Metric */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-white/95 backdrop-blur-md border border-purple-200/80 p-2.5 sm:p-3 rounded-2xl shadow-lg flex items-center gap-2.5 transform group-hover:-translate-y-1 transition-transform duration-300">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Conversion ROAS</span>
            <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">+280% Growth</span>
          </div>
        </div>

        {/* Floating Interactive Badge 2: Bottom Left - Hyperlocal Delivery */}
        <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 bg-white/95 backdrop-blur-md border border-indigo-200/80 p-2.5 sm:p-3 rounded-2xl shadow-lg flex items-center gap-2.5 transform group-hover:translate-y-[-2px] transition-transform duration-300">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Hyperlocal Radius</span>
            <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">5km Geo-Fence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
