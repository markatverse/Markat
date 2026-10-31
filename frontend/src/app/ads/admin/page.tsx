"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Check, X, AlertTriangle, Eye, 
  ExternalLink, FileText, DollarSign, Filter, Search,
  Lock, ShieldAlert, ArrowLeft, RefreshCw, Layers
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/api';

interface ModerationItem {
  id: string;
  advertiserName: string;
  campaignTitle: string;
  creativeUrl: string;
  placement: string;
  targetCategory: string;
  dailyBudget: number;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function AdsAdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const API_URL = getApiUrl();

  const [items, setItems] = useState<ModerationItem[]>([
    {
      id: 'MOD-801',
      advertiserName: 'Shree Balaji Electronics',
      campaignTitle: 'Super Smart TV Mega Cashback 📺',
      creativeUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
      placement: 'Homepage Top Hero Carousel',
      targetCategory: 'Electronics & Appliances',
      dailyBudget: 2500,
      submittedAt: '10 mins ago',
      status: 'PENDING'
    },
    {
      id: 'MOD-802',
      advertiserName: 'Gourmet Curry Express',
      campaignTitle: 'Flat 50% Off Lunch Combos 🍛',
      creativeUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      placement: 'Category Header Banner',
      targetCategory: 'Dining & Restaurants',
      dailyBudget: 1200,
      submittedAt: '25 mins ago',
      status: 'PENDING'
    },
    {
      id: 'MOD-803',
      advertiserName: 'FastFix Mobile Repairs',
      campaignTitle: '1-Hour Screen Replacement at Home 📱',
      creativeUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      placement: 'Search Sponsored First Spot',
      targetCategory: 'Home Services & Repairs',
      dailyBudget: 1800,
      submittedAt: '1 hour ago',
      status: 'APPROVED'
    }
  ]);

  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch live moderation items from backend
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetch(`${API_URL}/commercial/ads/admin-overview`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && Array.isArray(data.campaigns)) {
            const mapped: ModerationItem[] = data.campaigns.map((c: any) => ({
              id: c.id,
              advertiserName: c.advertiserName,
              campaignTitle: c.campaignTitle,
              creativeUrl: c.creativeUrl,
              placement: c.placement,
              targetCategory: c.targetCategory,
              dailyBudget: c.dailyBudget,
              submittedAt: c.submittedAt,
              status: c.status
            }));
            setItems(mapped);
          }
        })
        .catch(() => {});
    }
  }, [user, API_URL]);

  // Handle Approve / Reject action with Backend synchronization
  const handleAction = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setActionLoading(id);
    try {
      await fetch(`${API_URL}/commercial/ads/campaigns/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: id,
          status: newStatus,
          reason: newStatus === 'APPROVED' ? 'Compliant with advertising standards' : 'Creative policy violation'
        })
      });
    } catch {}

    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    setActionLoading(null);
  };

  // STRICT ACCESS CONTROL GUARD:
  // If user is not logged in or is not an ADMIN, block access immediately!
  if (!authLoading && (!user || user.role !== 'ADMIN')) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-rose-500/30 rounded-3xl text-center space-y-5 shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Access Restricted
          </span>
          <h2 className="text-xl font-black text-white">Administrator Access Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Ads Moderation &amp; Governance Center is restricted to platform administrators only. Public users and regular advertisers cannot view or approve campaigns.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/ads/login"
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            Sign In with Administrator Account
          </Link>
          <Link
            href="/ads"
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700"
          >
            Return to Ads Overview
          </Link>
        </div>
      </div>
    );
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.advertiserName.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'ALL') return matchesSearch;
    return matchesSearch && item.status === filter;
  });

  const pendingCount = items.filter(i => i.status === 'PENDING').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Ads Administration &amp; Moderation</h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Admin Role Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review creative submissions, brand safety, budget adherence, and approve campaigns before they run live.
          </p>
        </div>

        {/* Public Policy Badge */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs flex items-center gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Public Display Policy:</span>
            <span className="text-amber-400 font-bold">Admin Ads Only (Public Ads Hidden)</span>
          </div>
          <Link
            href="/admin/ads"
            className="text-[11px] text-purple-400 hover:text-purple-300 underline font-semibold"
          >
            Configure →
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab}</span>
              {tab === 'PENDING' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search advertiser or title..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Moderation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div 
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl relative group hover:border-purple-500/40 transition-all"
          >
            <div>
              {/* Creative Image Preview */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                <img 
                  src={item.creativeUrl} 
                  alt={item.campaignTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                    item.status === 'APPROVED' ? 'bg-emerald-500/80 text-white' :
                    item.status === 'REJECTED' ? 'bg-rose-500/80 text-white' :
                    'bg-amber-500/80 text-white'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-black/60 text-slate-300 backdrop-blur-md">
                    {item.id}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div>
                  <span className="text-[11px] text-purple-400 font-bold block">{item.advertiserName}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-2">{item.campaignTitle}</h3>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Placement:</span>
                    <span className="font-semibold text-white">{item.placement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Category:</span>
                    <span className="font-semibold text-slate-200">{item.targetCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Daily Budget:</span>
                    <span className="font-mono font-bold text-emerald-400">₹{item.dailyBudget.toLocaleString('en-IN')}/day</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-white/5">
                    <span>Submitted:</span>
                    <span>{item.submittedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Moderation Actions */}
            <div className="p-5 pt-0 border-t border-white/5 mt-2">
              {item.status === 'PENDING' ? (
                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => handleAction(item.id, 'APPROVED')}
                    disabled={actionLoading === item.id}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'REJECTED')}
                    disabled={actionLoading === item.id}
                    className="flex-1 py-2 px-3 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Status updated:</span>
                  <button
                    onClick={() => handleAction(item.id, item.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-bold underline"
                  >
                    Change to {item.status === 'APPROVED' ? 'Rejected' : 'Approved'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
