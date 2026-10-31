"use client";

import React from 'react';
import Image from 'next/image';
import { Sparkles, TrendingUp, Target, ShieldCheck, Zap } from 'lucide-react';

interface AdsHeroIllustrationProps {
  className?: string;
}

export default function AdsHeroIllustration({ className = '' }: AdsHeroIllustrationProps) {
  return (
    <div className={`relative w-full max-w-2xl mx-auto group ${className}`}>
      {/* Ambient Radial Lighting Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 via-pink-600/20 to-blue-600/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />

      {/* Main SVG Graphic Container */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-slate-900/90 shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]">
        {/* Render the SVG illustration */}
        <img
          src="/ads-illustration.svg"
          alt="MarkatVerse Modern Hyperlocal Advertising Ecosystem"
          className="w-full h-auto object-cover rounded-3xl block shadow-inner"
          loading="eager"
        />

        {/* Floating Interactive Badge 1: Top Right - ROAS Metric */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-slate-950/85 backdrop-blur-md border border-purple-500/40 p-2.5 sm:p-3 rounded-2xl shadow-xl flex items-center gap-2.5 transform group-hover:-translate-y-1 transition-transform duration-300">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Conversion ROAS</span>
            <span className="text-xs sm:text-sm font-black text-white font-mono">+280% Growth</span>
          </div>
        </div>

        {/* Floating Interactive Badge 2: Bottom Left - Hyperlocal Delivery */}
        <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 bg-slate-950/85 backdrop-blur-md border border-indigo-500/40 p-2.5 sm:p-3 rounded-2xl shadow-xl flex items-center gap-2.5 transform group-hover:translate-y-[-2px] transition-transform duration-300">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Hyperlocal Radius</span>
            <span className="text-xs sm:text-sm font-black text-white font-mono">5km Geo-Fence</span>
          </div>
        </div>
      </div>
    </div>
  );
}

