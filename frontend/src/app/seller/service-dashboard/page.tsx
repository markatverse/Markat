"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Calendar as CalendarIcon, Clock, Users, Scissors, 
  Settings, Bell, Plus, Search, ChevronRight, 
  CheckCircle2, XCircle, MoreVertical, MapPin, 
  Briefcase, Coffee, BarChart3, Star, Edit3,
  HeartPulse, Activity, Utensils, Stethoscope
} from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const type = searchParams?.get('type') || 'salon';
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CALENDAR' | 'STAFF' | 'SERVICES'>('OVERVIEW');

  const config: Record<string, any> = {
    salon: {
      name: "Luxe Salon",
      icon: Scissors,
      staffRole: "Stylist",
      staffRole2: "Color Specialist",
      actionIcon: Scissors,
      color: "indigo",
      service1: "Premium Haircut & Beard",
      service2: "Keratin Treatment"
    },
    clinic: {
      name: "City Care Clinic",
      icon: HeartPulse,
      staffRole: "General Physician",
      staffRole2: "Dermatologist",
      actionIcon: Stethoscope,
      color: "emerald",
      service1: "General Checkup",
      service2: "Skin Consultation"
    },
    restaurant: {
      name: "The Rustic Hearth",
      icon: Utensils,
      staffRole: "Head Chef",
      staffRole2: "Server",
      actionIcon: Coffee,
      color: "rose",
      service1: "Table for 2 (VIP)",
      service2: "Large Party Reservation"
    }
  };

  const currentConfig = config[type] || config.salon;
  const MainIcon = currentConfig.icon;
  const ActionIcon = currentConfig.actionIcon;

  // Mock Data
  const stats = [
    { label: "Today's Bookings", value: "12", trend: "+2", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Pending Approvals", value: "4", trend: "Needs Action", color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Total Revenue", value: "₹24,500", trend: "+15% this week", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Staff Online", value: "3/5", trend: "Active Now", color: "text-rose-400", bg: "bg-rose-500/10" }
  ];

  const upcomingAppointments = [
    { id: 1, customer: "Rahul Sharma", service: currentConfig.service1, time: "10:30 AM", duration: "1h", staff: "Amit K.", status: "Confirmed" },
    { id: 2, customer: "Priya Singh", service: currentConfig.service2, time: "11:45 AM", duration: "2h 30m", staff: "Neha V.", status: "In Progress" },
    { id: 3, customer: "Vikram R.", service: currentConfig.service1, time: "01:00 PM", duration: "45m", staff: "Amit K.", status: "Pending" },
  ];

  const staffMembers = [
    { id: 1, name: "Amit K.", role: currentConfig.staffRole, rating: 4.9, jobs: 124, status: "Available", image: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    { id: 2, name: "Neha V.", role: currentConfig.staffRole2, rating: 4.8, jobs: 89, status: "In Session", image: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { id: 3, name: "Rajat M.", role: currentConfig.staffRole, rating: 4.7, jobs: 210, status: "Offline", image: "https://i.pravatar.cc/150?u=a04258114e29026702d" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${currentConfig.color}-500/20 flex items-center justify-center border border-${currentConfig.color}-500/30`}>
              <MainIcon className={`w-5 h-5 text-${currentConfig.color}-400`} />
            </div>
            <div>
              <h2 className="font-black text-white leading-tight">{currentConfig.name}</h2>
              <p className={`text-xs text-${currentConfig.color}-400 font-bold`}>Service Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'OVERVIEW', icon: BarChart3, label: 'Overview' },
            { id: 'CALENDAR', icon: CalendarIcon, label: 'Calendar Queue' },
            { id: 'STAFF', icon: Users, label: 'Staff & Team' },
            { id: 'SERVICES', icon: Briefcase, label: 'Menu & Services' },
            { id: 'HOURS', icon: Clock, label: 'Business Hours' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-2xl font-black text-white capitalize">{activeTab.toLowerCase().replace('_', ' ')}</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-slate-800 border-2 border-indigo-500/50 overflow-hidden cursor-pointer">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704b" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              {/* Top Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110 ${stat.bg}`}></div>
                    <p className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-4xl font-black text-white mb-2">{stat.value}</h3>
                    <p className={`text-sm font-bold ${stat.color}`}>{stat.trend}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Queue */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-400" /> Live Queue (Today)
                    </h3>
                    <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors">
                      View All
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {upcomingAppointments.map(app => (
                      <div key={app.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-800 flex flex-col items-center justify-center border border-slate-700 shrink-0">
                            <span className="text-xs text-slate-400 font-bold">{app.time.split(' ')[1]}</span>
                            <span className="text-sm text-white font-black">{app.time.split(' ')[0]}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-base">{app.customer}</h4>
                            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <ActionIcon className="w-3.5 h-3.5" /> {app.service}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="hidden sm:block text-right">
                            <p className="text-xs text-slate-500 font-bold uppercase mb-0.5">Assigned To</p>
                            <p className="text-sm text-slate-300 font-medium flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-slate-700"></div> {app.staff}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {app.status === 'Pending' && (
                              <>
                                <button className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                                  <CheckCircle2 className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors">
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {app.status !== 'Pending' && (
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center ${
                                app.status === 'Confirmed' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {app.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions & Status */}
                <div className="space-y-6">
                  <div className={`bg-${currentConfig.color}-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-${currentConfig.color}-600/20`}>
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <h3 className="font-black text-xl mb-2">New Booking Walk-in?</h3>
                    <p className={`text-${currentConfig.color}-200 text-sm mb-6`}>Quickly add a walk-in customer to your active queue to block the time slot.</p>
                    <button className={`w-full bg-white text-${currentConfig.color}-600 font-bold py-3 rounded-xl hover:bg-${currentConfig.color}-50 transition-colors shadow-lg flex items-center justify-center gap-2`}>
                      <Plus className="w-5 h-5" /> Create Appointment
                    </button>
                  </div>
                  
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm flex items-center justify-between">
                      Staff Status
                      <span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-1 rounded">Live</span>
                    </h3>
                    <div className="space-y-4">
                      {staffMembers.map(staff => (
                        <div key={staff.id} className="flex items-center gap-3">
                          <div className="relative">
                            <img src={staff.image} alt={staff.name} className="w-10 h-10 rounded-full border border-slate-700" />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                              staff.status === 'Available' ? 'bg-emerald-400' : staff.status === 'In Session' ? 'bg-amber-400' : 'bg-slate-500'
                            }`}></div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{staff.name}</p>
                            <p className="text-xs text-slate-400">{staff.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'STAFF' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">Manage Team</h2>
                  <p className="text-slate-400">Add staff, set their schedules, and manage services they provide.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Add Staff Member
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffMembers.map(staff => (
                  <div key={staff.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-slate-500 group-hover:text-indigo-400 transition-colors">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-center text-center mb-6 mt-2">
                      <img src={staff.image} alt={staff.name} className="w-20 h-20 rounded-full border-2 border-slate-700 mb-4 shadow-lg" />
                      <h3 className="text-lg font-black text-white">{staff.name}</h3>
                      <p className={`text-${currentConfig.color}-400 text-sm font-bold mb-2`}>{staff.role}</p>
                      <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-200">{staff.rating}</span>
                        <span className="text-xs text-slate-500 ml-1">({staff.jobs} jobs)</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center pt-4 border-t border-slate-800">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status</p>
                        <p className={`text-xs font-bold ${staff.status === 'Offline' ? 'text-slate-400' : 'text-emerald-400'}`}>{staff.status}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Services</p>
                        <p className="text-xs text-slate-300 font-bold">14 Assigned</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {['CALENDAR', 'SERVICES'].includes(activeTab) && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <CalendarIcon className="w-16 h-16 mb-4 opacity-20" />
              <h2 className="text-2xl font-bold text-slate-400 mb-2">{activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} Interface</h2>
              <p>This module adapts dynamically based on the specific sector's requirements.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ServiceSellerDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-white font-bold tracking-widest uppercase">Loading Workspace...</h2>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
