"use client";

import React, { useState } from 'react';
import { 
  Scissors, 
  Sparkles, 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle2, 
  PlusCircle, 
  TrendingUp, 
  DollarSign, 
  User, 
  Search, 
  Palette, 
  Droplet,
  Heart
} from 'lucide-react';

interface SalonSpaModuleProps {
  queueData: any;
  user: any;
  onRefresh: () => void;
  onAction: (actionId: string, endpoint: string, method?: string, body?: any) => Promise<void>;
  actionLoading: string | null;
  onOpenStaffModal: () => void;
  onOpenWalkInModal: () => void;
}

export default function SalonSpaModule({
  queueData,
  user,
  onRefresh,
  onAction,
  actionLoading,
  onOpenStaffModal,
  onOpenWalkInModal
}: SalonSpaModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'chairs' | 'services' | 'stylists'>('chairs');

  const chairResources = (queueData?.resources && queueData.resources.length > 0)
    ? queueData.resources
    : [
        { id: 'c1', name: 'Chair 1 (Hair & Styling)', type: 'Chair', status: 'In Session', stylist: 'Amit K.', customer: 'Rahul Sharma', service: 'Haircut + Beard Trim', duration: '25 / 35m' },
        { id: 'c2', name: 'Chair 2 (Color Station)', type: 'Chair', status: 'In Session', stylist: 'Neha V.', customer: 'Pooja Hegde', service: 'Keratin Color & Highlights', duration: '50 / 90m' },
        { id: 'c3', name: 'Chair 3 (Men Grooming)', type: 'Chair', status: 'Available', stylist: 'Rajat M.', customer: null, service: null, duration: null },
        { id: 'c4', name: 'Spa Room 1 (Facial)', type: 'Room', status: 'Available', stylist: 'Suman D.', customer: null, service: null, duration: null }
      ];

  const popularServices = [
    { name: 'Executive Haircut & Style', duration: '30m', price: 299, category: 'Hair', icon: Scissors },
    { name: 'Beard Trim & Hot Towel', duration: '20m', price: 199, category: 'Grooming', icon: User },
    { name: 'Anti-Tan Charcoal Facial', duration: '45m', price: 899, category: 'Skin', icon: Sparkles },
    { name: 'Keratin Hair Spa Treatment', duration: '60m', price: 1499, category: 'Hair Care', icon: Droplet },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-pink-200 text-xs font-black tracking-widest uppercase mb-1">
              <Scissors className="w-4 h-4" /> Salon, Parlour & Spa Suite
            </div>
            <h2 className="text-2xl md:text-3xl font-black">{user?.business?.name || 'Luxe Salon & Spa'}</h2>
            <p className="text-pink-100 text-sm mt-1 max-w-xl">
              Stylist chair allocations, live treatment timers, client walk-in tokens, and custom beauty packages.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenWalkInModal}
              className="bg-white text-indigo-700 hover:bg-pink-50 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add Walk-in Client
            </button>
            <button
              onClick={onOpenStaffModal}
              className="bg-black/20 hover:bg-black/30 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all border border-white/20 flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> Manage Stylists
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Styling Chairs</span>
            <Scissors className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {chairResources.filter(c => c.status === 'In Session').length} / {chairResources.length}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">
            {chairResources.filter(c => c.status === 'Available').length} chairs open right now
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Waiting Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {queueData?.waitingCount ?? 3}
          </div>
          <span className="text-[11px] font-semibold text-amber-600">
            Est wait: ~18 mins
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Stylists Active</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {queueData?.staff?.length || 4} On Floor
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">
            All schedules verified
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            ₹{queueData?.analytics?.totalTodayCollection ?? '4,850'}
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Services + Hair care retail
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('chairs')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${
            activeSubTab === 'chairs' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scissors className="w-4 h-4" /> Chair & Station Grid
        </button>
        <button
          onClick={() => setActiveSubTab('services')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${
            activeSubTab === 'services' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Treatment Menu & Pricing
        </button>
      </div>

      {/* CHAIRS & STATIONS */}
      {activeSubTab === 'chairs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Live Salon Chairs & Treatment Stations</h3>
              <p className="text-xs text-slate-500">Track active client treatments and chair availability in real-time.</p>
            </div>
            <button
              onClick={onOpenStaffModal}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              + Configure Chairs / Stations
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {chairResources.map((chair: any) => {
              const inSession = chair.status === 'In Session' || (chair.customer && chair.service);
              return (
                <div
                  key={chair.id}
                  className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                    inSession 
                      ? 'bg-gradient-to-b from-indigo-50/50 to-white border-indigo-300 shadow-sm'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-black text-slate-900 text-base">{chair.name}</div>
                      <div className="text-xs text-slate-400 font-semibold mt-0.5">
                        Stylist: {chair.stylist || 'Assigned dynamically'}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      inSession ? 'bg-indigo-600 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {inSession ? 'In Session' : 'Ready'}
                    </span>
                  </div>

                  {inSession ? (
                    <div className="space-y-2 py-2">
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Client</div>
                        <div className="font-bold text-slate-900 text-sm">{chair.customer || 'Rahul Sharma'}</div>
                        <div className="text-xs text-indigo-600 font-semibold mt-0.5">{chair.service || 'Haircut & Styling'}</div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 px-1">
                        <span>Timer</span>
                        <span className="font-bold text-amber-600 font-mono">{chair.duration || '20m left'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      Chair is clean & ready for next client
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    {inSession ? (
                      <button
                        onClick={() => alert(`Marking service on ${chair.name} as complete.`)}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Complete Service
                      </button>
                    ) : (
                      <button
                        onClick={onOpenWalkInModal}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Seat Walk-in
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SERVICES MENU */}
      {activeSubTab === 'services' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Salon & Spa Services Catalog</h3>
              <p className="text-xs text-slate-500">Service durations help MarkatVerse calculate accurate wait times for walk-in clients.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularServices.map((srv, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <srv.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{srv.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>⏱ {srv.duration}</span>
                      <span>•</span>
                      <span className="text-indigo-600 font-semibold">{srv.category}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 text-base">₹{srv.price}</div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Live Bookable</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
