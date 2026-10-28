"use client";
import React, { useState } from 'react';
import MascotState, { MascotStateType } from '@/components/MascotState';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Grid, Eye } from 'lucide-react';

const ALL_STATES: { id: MascotStateType; label: string; badge: string }[] = [
  { id: '404', label: '404 Not Found', badge: 'Navigation' },
  { id: 'server-error', label: 'Server Error', badge: 'Error' },
  { id: 'no-internet', label: 'No Internet', badge: 'Network' },
  { id: 'no-search', label: 'No Search Results', badge: 'Search' },
  { id: 'cart-empty', label: 'Your Cart is Empty', badge: 'Commerce' },
  { id: 'access-denied', label: 'Access Denied', badge: 'Auth' },
  { id: 'payment-failed', label: 'Payment Failed', badge: 'Checkout' },
  { id: 'maintenance', label: 'Under Maintenance', badge: 'System' },
  { id: 'something-wrong', label: 'Something Went Wrong', badge: 'Fallback' },
  { id: 'try-again', label: "Let's Try Again!", badge: 'Support' },
];

export default function MascotPreviewPage() {
  const [selectedState, setSelectedState] = useState<MascotStateType>('404');
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Marketplace
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                MarkatVerse Mascot Character States
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 10 States
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Live preview gallery for all error, empty, network, and checkout mascot character illustrations.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" /> All 10 Grid
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-4 h-4" /> Single Card Focus
            </button>
          </div>
        </div>

        {/* View Mode: Single Focus */}
        {viewMode === 'single' && (
          <div className="space-y-6">
            {/* Pill selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {ALL_STATES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedState(s.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedState === s.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Focused Preview Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-8 sm:p-12 max-w-xl mx-auto animate-in zoom-in-95 duration-200">
              <MascotState
                state={selectedState}
                onAction={() => alert(`Clicked action for state: ${selectedState}`)}
                secondaryText="Explore Options"
                onSecondaryAction={() => alert('Secondary action')}
              />
            </div>
          </div>
        )}

        {/* View Mode: All 10 Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {ALL_STATES.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 p-4 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {s.badge}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                
                <MascotState
                  state={s.id}
                  compact
                  className="py-2"
                  onAction={() => alert(`Action triggered for ${s.label}`)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Quick Testing Links */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Test Live In Context</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link href="/this-page-does-not-exist" className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-600 transition-colors">
              404 Page (URL that doesn&apos;t exist) →
            </Link>
            <Link href="/cart" className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-600 transition-colors">
              Empty Cart Page →
            </Link>
            <Link href="/service/non-existent-service-id" className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-600 transition-colors">
              Service Not Found →
            </Link>
            <Link href="/search?q=xyznonexistentquery999" className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-600 transition-colors">
              No Search Results →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
