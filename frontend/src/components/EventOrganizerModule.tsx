"use client";

import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  PlusCircle, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Filter, 
  FileText, 
  Music, 
  Camera, 
  UtensilsCrossed, 
  PartyPopper, 
  Eye, 
  ChevronRight,
  ChevronDown,
  X,
  Send,
  AlertCircle,
  Layers,
  Heart,
  Share2
} from 'lucide-react';

interface EventOrganizerModuleProps {
  queueData?: any;
  user?: any;
  onRefresh?: () => void;
  onAction?: (actionId: string, endpoint: string, method?: string, body?: any) => Promise<void>;
  actionLoading?: string | null;
  onOpenStaffModal?: () => void;
}

export type EventProjectStatus = 'Lead' | 'Proposal Sent' | 'Confirmed' | 'In Execution' | 'Completed' | 'Cancelled';

export interface EventProject {
  id: string;
  eventName: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  eventType: 'Wedding' | 'Corporate' | 'Birthday' | 'Gala Dinner' | 'Private Party';
  eventDate: string;
  daysRemaining: number;
  venue: string;
  guestCount: number;
  budget: number;
  amountReceived: number;
  status: EventProjectStatus;
  progressPercentage: number;
  milestones: { name: string; completed: boolean; dueDate?: string }[];
  subVendors: { category: string; vendorName: string; status: 'Assigned' | 'Confirmed' | 'Pending'; cost: number }[];
  notes?: string;
}

export default function EventOrganizerModule({
  queueData,
  user,
  onRefresh,
  onAction,
  actionLoading,
  onOpenStaffModal
}: EventOrganizerModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'events' | 'calendar' | 'proposals' | 'packages'>('events');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventProject | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  // Initial Sample Events State
  const [events, setEvents] = useState<EventProject[]>([
    {
      id: 'EVT-2026-001',
      eventName: 'Rohan & Ananya Grand Wedding & Sangeet',
      clientName: 'Sanjay Kapoor (Father of Bride)',
      clientPhone: '+91 98201 44552',
      clientEmail: 'sanjay.kapoor@gmail.com',
      eventType: 'Wedding',
      eventDate: '2026-11-15',
      daysRemaining: 25,
      venue: 'The Leela Palace Ballroom & Lawn, Bengaluru',
      guestCount: 650,
      budget: 1850000,
      amountReceived: 900000,
      status: 'In Execution',
      progressPercentage: 70,
      milestones: [
        { name: 'Mandap Floral 3D Concept Approved', completed: true },
        { name: 'Sangeet DJ & Celebrity Anchor Booked', completed: true },
        { name: 'Catering Menu Tasting Finalized', completed: true },
        { name: 'Bride & Groom Entry Drone & Pyro Rehearsal', completed: false, dueDate: '2026-11-10' },
        { name: 'On-site Hospitality Desk & Room Key Hamper Distribution', completed: false, dueDate: '2026-11-14' }
      ],
      subVendors: [
        { category: 'Floral & Decor', vendorName: 'Bloom Craft Artisans', status: 'Confirmed', cost: 650000 },
        { category: 'Sound & LED Wall', vendorName: 'Sonic Waves Live', status: 'Confirmed', cost: 220000 },
        { category: 'Catering & Live Counters', vendorName: 'Royal Dawat Catering', status: 'Confirmed', cost: 750000 },
        { category: 'Photography & Film', vendorName: 'Cinematic Memories', status: 'Confirmed', cost: 180000 }
      ],
      notes: 'Client requested pure vegetarian royal Rajasthani + Italian live pasta counter for Sangeet night.'
    },
    {
      id: 'EVT-2026-002',
      eventName: 'TechVanguard Annual APAC Tech Leadership Summit',
      clientName: 'Priya Nambiar (VP Brand Experience)',
      clientPhone: '+91 98450 11234',
      clientEmail: 'priya.n@techvanguard.io',
      eventType: 'Corporate',
      eventDate: '2026-10-30',
      daysRemaining: 9,
      venue: 'ITC Gardenia Grand Ballroom, Bengaluru',
      guestCount: 400,
      budget: 1200000,
      amountReceived: 600000,
      status: 'Confirmed',
      progressPercentage: 55,
      milestones: [
        { name: 'P3 Curved LED Screen & Stage Blueprint', completed: true },
        { name: 'Delegate RFID Badge Printing & Lanyards', completed: true },
        { name: 'Simultaneous Translation Equipment Dry Run', completed: false, dueDate: '2026-10-27' },
        { name: 'Networking Cocktail & Live Jazz Band Setup', completed: false, dueDate: '2026-10-29' }
      ],
      subVendors: [
        { category: 'AV & Rigging', vendorName: 'PixelCraft Live AV', status: 'Confirmed', cost: 450000 },
        { category: 'Executive Catering', vendorName: 'ITC Executive Banquet', status: 'Confirmed', cost: 500000 },
        { category: 'Hostesses & Registration', vendorName: 'Elite Crew Agency', status: 'Confirmed', cost: 80000 }
      ],
      notes: 'High-security event. Keynote speaker is arriving with VIP security detail.'
    },
    {
      id: 'EVT-2026-003',
      eventName: 'Aarav 1st Birthday - Safari Jungle Theme',
      clientName: 'Vikram & Meera Singhania',
      clientPhone: '+91 97110 99881',
      clientEmail: 'meera.s@gmail.com',
      eventType: 'Birthday',
      eventDate: '2026-11-04',
      daysRemaining: 14,
      venue: 'Palm Meadows Club House Lawn',
      guestCount: 120,
      budget: 280000,
      amountReceived: 140000,
      status: 'Proposal Sent',
      progressPercentage: 35,
      milestones: [
        { name: '3D Life-size Animal Props & Balloon Arch Proposal', completed: true },
        { name: 'Tattoo Artist, Magic Show & Bubble Show Confirmation', completed: false, dueDate: '2026-10-28' },
        { name: 'Custom Jungle Theme 3-Tier Fondant Cake Order', completed: false, dueDate: '2026-10-31' }
      ],
      subVendors: [
        { category: 'Balloon & Theme Decor', vendorName: 'Dreamy Backdrops', status: 'Pending', cost: 120000 },
        { category: 'Entertainment & Magic', vendorName: 'Jadugar Ojas & Crew', status: 'Assigned', cost: 35000 }
      ],
      notes: 'Includes custom return gift hampers with personalized safari storybooks for kids.'
    },
    {
      id: 'EVT-2026-004',
      eventName: 'Silver Jubilee 25th Wedding Anniversary Gala',
      clientName: 'Dr. Harshvardhan Joshi',
      clientPhone: '+91 99002 77334',
      clientEmail: 'harsh.joshi@clinic.org',
      eventType: 'Gala Dinner',
      eventDate: '2026-12-05',
      daysRemaining: 45,
      venue: 'Taj West End Heritage Lawn',
      guestCount: 250,
      budget: 950000,
      amountReceived: 200000,
      status: 'Lead',
      progressPercentage: 15,
      milestones: [
        { name: 'Initial Requirement Call & Budget Estimate', completed: true },
        { name: 'Moodboard & Vintage Candlelight Decor Deck Submission', completed: false, dueDate: '2026-10-25' }
      ],
      subVendors: [
        { category: 'Decor & Illumination', vendorName: 'Fairy Tale Lights Co.', status: 'Pending', cost: 350000 }
      ],
      notes: 'Client loves vintage live Ghazal/Sufi music and candlelit floral walk.'
    }
  ]);

  // Packages & Service Offerings
  const eventPackages = [
    {
      id: 'pkg-1',
      title: 'Royal Destination Wedding Grand Package',
      price: '₹ 15,00,000+',
      type: 'Wedding',
      badge: 'Bestseller',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      description: 'End-to-end wedding direction covering Sangeet, Mehendi, Haldi, Mandap, and Grand Reception.',
      features: ['Personal Dedicated Wedding Director', '3D Stage & Mandap Setups', 'Artist & DJ Coordination', 'Live Food Stations & Banquet Oversight', 'VIP Hospitality & Airport Shuttles']
    },
    {
      id: 'pkg-2',
      title: 'Corporate Conference & Tech Summit Turnkey',
      price: '₹ 6,50,000+',
      type: 'Corporate',
      badge: 'High Demand',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      description: 'High-impact corporate brand experience with pristine audio-visual, delegate logistics, and VIP stage.',
      features: ['Ultra HD Curved LED Display Walls', 'Full Rigging & Studio Microphones', 'Branded RFID Delegate Badges', 'Keynote Slide Engineering', 'Executive Networking Dinners']
    },
    {
      id: 'pkg-3',
      title: 'Luxury Theme Birthday & Private Celebration',
      price: '₹ 1,75,000+',
      type: 'Private Celebration',
      badge: 'Popular',
      badgeColor: 'bg-pink-100 text-pink-700 border-pink-200',
      description: 'Custom experiential thematic setup with interactive kids entertainment, balloon architecture, and games.',
      features: ['3D Theme Cutout Backdrop & Arch', 'Professional Emcee & Magic Artist', 'Theme Sweet Table & Photo Booth', 'Custom Kids Return Gift Station']
    }
  ];

  // Quick stats
  const totalPipelineRevenue = events.reduce((sum, e) => sum + e.budget, 0);
  const totalCollected = events.reduce((sum, e) => sum + e.amountReceived, 0);
  const activeEventsCount = events.filter(e => e.status === 'In Execution' || e.status === 'Confirmed').length;
  const pendingLeadsCount = events.filter(e => e.status === 'Lead' || e.status === 'Proposal Sent').length;

  const filteredEvents = events.filter(e => {
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesSearch = e.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = (eventId: string, newStatus: EventProjectStatus) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleToggleMilestone = (eventId: string, milestoneIdx: number) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const updated = [...e.milestones];
        updated[milestoneIdx].completed = !updated[milestoneIdx].completed;
        const compCount = updated.filter(m => m.completed).length;
        const progressPercentage = Math.round((compCount / updated.length) * 100);
        return { ...e, milestones: updated, progressPercentage };
      }
      return e;
    }));

    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(prev => {
        if (!prev) return null;
        const updated = [...prev.milestones];
        updated[milestoneIdx].completed = !updated[milestoneIdx].completed;
        const compCount = updated.filter(m => m.completed).length;
        const progressPercentage = Math.round((compCount / updated.length) * 100);
        return { ...prev, milestones: updated, progressPercentage };
      });
    }
  };

  const [newEventForm, setNewEventForm] = useState({
    eventName: '',
    clientName: '',
    clientPhone: '',
    eventType: 'Wedding' as const,
    eventDate: '',
    venue: '',
    guestCount: 200,
    budget: 500000,
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventForm.eventName || !newEventForm.clientName) return;

    const newEv: EventProject = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      eventName: newEventForm.eventName,
      clientName: newEventForm.clientName,
      clientPhone: newEventForm.clientPhone || '+91 99000 00000',
      eventType: newEventForm.eventType,
      eventDate: newEventForm.eventDate || '2026-12-01',
      daysRemaining: 40,
      venue: newEventForm.venue || 'To be finalized',
      guestCount: Number(newEventForm.guestCount) || 150,
      budget: Number(newEventForm.budget) || 300000,
      amountReceived: 0,
      status: 'Lead',
      progressPercentage: 10,
      milestones: [
        { name: 'Initial Requirement Analysis & Moodboard', completed: true },
        { name: 'Venue Recce & Stage Layout Design', completed: false },
        { name: 'Vendor Contracting (Sound, Light, Decor)', completed: false },
        { name: 'Final Day-of-Event Timeline Run-Through', completed: false }
      ],
      subVendors: []
    };

    setEvents([newEv, ...events]);
    setShowNewEventModal(false);
    setSelectedEvent(newEv);
    setNewEventForm({
      eventName: '',
      clientName: '',
      clientPhone: '',
      eventType: 'Wedding',
      eventDate: '',
      venue: '',
      guestCount: 200,
      budget: 500000,
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header / Command Center ─────────────────── */}
      <div className="bg-gradient-to-r from-fuchsia-900 via-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 -bottom-10 w-60 h-60 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-fuchsia-200">
              <PartyPopper className="w-3.5 h-3.5 text-fuchsia-300" />
              Event Director & Wedding Production Console
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {user?.business?.name || 'Grand Celebrations & Events'}
            </h1>
            <p className="text-purple-200/80 text-xs sm:text-sm max-w-xl">
              Manage client inquiries, event timelines, multi-vendor coordination, floor stages, and proposal invoicing in one seamless workstation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNewEventModal(true)}
              className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-fuchsia-500/30 transition-all flex items-center gap-2 text-sm"
            >
              <PlusCircle className="w-5 h-5" /> New Event Project
            </button>
            {onOpenStaffModal && (
              <button
                onClick={onOpenStaffModal}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold px-4 py-3 rounded-2xl transition-all flex items-center gap-2 text-sm"
              >
                <Users className="w-4 h-4 text-purple-200" /> Event Crew
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] font-bold text-purple-200 uppercase tracking-wider">Active Productions</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">{activeEventsCount}</div>
            <div className="text-[10px] text-fuchsia-300 mt-0.5">Weddings & Galas in Execution</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] font-bold text-purple-200 uppercase tracking-wider">Pipeline Revenue</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">₹ {(totalPipelineRevenue / 100000).toFixed(1)} L</div>
            <div className="text-[10px] text-emerald-300 mt-0.5">Across {events.length} Client Projects</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] font-bold text-purple-200 uppercase tracking-wider">Advance Collected</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">₹ {(totalCollected / 100000).toFixed(1)} L</div>
            <div className="text-[10px] text-purple-200 mt-0.5">{Math.round((totalCollected / (totalPipelineRevenue || 1)) * 100)}% payment realized</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] font-bold text-purple-200 uppercase tracking-wider">New Proposals & Inquiries</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">{pendingLeadsCount}</div>
            <div className="text-[10px] text-amber-200 mt-0.5">Awaiting Client Confirmation</div>
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ─────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('events')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'events'
                ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" /> Live Events & Milestones
          </button>
          <button
            onClick={() => setActiveSubTab('packages')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'packages'
                ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Packages & Catalogs
          </button>
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'calendar'
                ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" /> Calendar & Date Blocker
          </button>
        </div>
      </div>

      {/* ── TAB 1: LIVE EVENTS & MILESTONES ─────────────────── */}
      {activeSubTab === 'events' && (
        <div className="space-y-5">
          {/* Controls: Search & Status Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by event title, client name, or venue..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-100 outline-none transition"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'In Execution', 'Confirmed', 'Proposal Sent', 'Lead', 'Completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Master-Detail Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Project Cards List */}
            <div className="lg:col-span-7 space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-700">No events found</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting the status filter or create a new event project.</p>
                </div>
              ) : (
                filteredEvents.map(event => {
                  const isSelected = selectedEvent?.id === event.id;
                  const isWedding = event.eventType === 'Wedding';
                  const isCorporate = event.eventType === 'Corporate';

                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer shadow-xs hover:shadow-md ${
                        isSelected 
                          ? 'border-fuchsia-500 ring-2 ring-fuchsia-100 bg-fuchsia-50/10' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-400">{event.id}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              event.status === 'In Execution' ? 'bg-emerald-100 text-emerald-800' :
                              event.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                              event.status === 'Proposal Sent' ? 'bg-amber-100 text-amber-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {event.status}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isWedding ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                              isCorporate ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {event.eventType}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-base text-slate-900 truncate">{event.eventName}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {event.venue}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-slate-900">₹ {(event.budget / 100000).toFixed(2)} L</div>
                          <div className="text-[10px] font-semibold text-emerald-600">Rec: ₹ {(event.amountReceived / 100000).toFixed(2)} L</div>
                        </div>
                      </div>

                      {/* Progress Bar & Countdown */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Production Checklist</span>
                          <span className="font-bold text-fuchsia-700">{event.progressPercentage}% Complete</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full transition-all duration-500"
                            style={{ width: `${event.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100/60">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400" /> {event.guestCount} Guests
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-fuchsia-600">
                          <Clock className="w-3.5 h-3.5" /> Date: {event.eventDate} ({event.daysRemaining > 0 ? `${event.daysRemaining} days to go` : 'Past event'})
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Focused Detail Inspector / Milestone Workflow */}
            <div className="lg:col-span-5 sticky top-6 space-y-4">
              {selectedEvent ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 space-y-6">
                  {/* Header of details */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded">
                        Project Management Deck
                      </span>
                      <h2 className="text-lg font-black text-slate-900 mt-1">{selectedEvent.eventName}</h2>
                      <p className="text-xs text-slate-500">{selectedEvent.eventType} • Scheduled {selectedEvent.eventDate}</p>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Client Contact Card */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client & Host Information</div>
                    <div className="font-bold text-slate-800 text-sm">{selectedEvent.clientName}</div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <a href={`tel:${selectedEvent.clientPhone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Phone className="w-3.5 h-3.5" /> {selectedEvent.clientPhone}
                      </a>
                      {selectedEvent.clientEmail && (
                        <a href={`mailto:${selectedEvent.clientEmail}`} className="flex items-center gap-1 text-slate-500 hover:underline truncate">
                          <Mail className="w-3.5 h-3.5" /> {selectedEvent.clientEmail}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Financial Overview Card */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 text-xs">
                    <div>
                      <span className="text-purple-600 font-bold block">Agreed Budget</span>
                      <span className="text-base font-black text-slate-900">₹ {(selectedEvent.budget).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-emerald-600 font-bold block">Payment Status</span>
                      <span className="text-base font-black text-emerald-700">₹ {(selectedEvent.amountReceived).toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Due: ₹ {(selectedEvent.budget - selectedEvent.amountReceived).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Milestones Checklist */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Production Milestones</h4>
                      <span className="text-[11px] font-bold text-fuchsia-600">
                        {selectedEvent.milestones.filter(m => m.completed).length} / {selectedEvent.milestones.length} Done
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedEvent.milestones.map((m, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleToggleMilestone(selectedEvent.id, idx)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            m.completed 
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 line-through opacity-80' 
                              : 'bg-white border-slate-200 hover:border-fuchsia-300 text-slate-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={m.completed}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-fuchsia-600 focus:ring-fuchsia-500 h-4 w-4 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold block">{m.name}</span>
                            {m.dueDate && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">Target: {m.dueDate}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sub-Vendors Assigned */}
                  {selectedEvent.subVendors && selectedEvent.subVendors.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Sub-Contractors & Crew</h4>
                      <div className="space-y-1.5">
                        {selectedEvent.subVendors.map((v, i) => (
                          <div key={i} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <div>
                              <span className="font-bold text-slate-800">{v.vendorName}</span>
                              <span className="text-[10px] text-slate-500 block">{v.category}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-700">₹ {v.cost.toLocaleString()}</span>
                              <span className="text-[10px] text-emerald-600 block">{v.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Update Project Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedEvent.id, 'Confirmed')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                          selectedEvent.status === 'Confirmed' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Mark Confirmed
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedEvent.id, 'In Execution')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                          selectedEvent.status === 'In Execution' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        In Execution
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedEvent.id, 'Completed')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                          selectedEvent.status === 'Completed' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedEvent.id, 'Cancelled')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                          selectedEvent.status === 'Cancelled' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Cancel Event
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                  <Eye className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600 text-sm">Select an Event Project</p>
                  <p className="text-xs text-slate-400 mt-1">Click on any event from the left list to view milestone timeline, client contact details, and vendor budgets.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PACKAGES & CATALOG ─────────────────── */}
      {activeSubTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Event Packages & Turnkey Pricing</h2>
              <p className="text-xs text-slate-500">Curated service bundles showcased on your public MarkatVerse store for direct client inquiries.</p>
            </div>
            <button
              onClick={() => alert("To add packages, use the 'Add New Listing' button and select Event Planner category.")}
              className="px-4 py-2 bg-fuchsia-600 text-white font-bold rounded-xl text-xs hover:bg-fuchsia-700 transition"
            >
              + Create Package
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {eventPackages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${pkg.badgeColor}`}>
                      {pkg.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{pkg.type}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-fuchsia-600 transition-colors">
                      {pkg.title}
                    </h3>
                    <div className="text-2xl font-black text-slate-900 mt-2">{pkg.price}</div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{pkg.description}</p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Highlights Included:</div>
                    {pkg.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => alert(`Package ${pkg.title} is active in your storefront.`)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-fuchsia-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    Manage Offerings →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: CALENDAR & DATES ─────────────────── */}
      {activeSubTab === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Event Date Availability & Booking Registry</h2>
              <p className="text-xs text-slate-500">Prevent double bookings and lock calendar dates for wedding seasons and auspicious muhurats.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Calendar Synchronized
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.map(ev => (
              <div key={ev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-fuchsia-700">{ev.eventDate}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                    {ev.eventType}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm truncate">{ev.eventName}</div>
                <div className="text-xs text-slate-500 truncate"><MapPin className="w-3 h-3 inline mr-1" />{ev.venue}</div>
                <div className="text-[11px] font-bold text-emerald-600 pt-1 border-t border-slate-200">
                  Status: {ev.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal: Create New Event Project ─────────────────── */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">Create New Event Project</h3>
                <p className="text-xs text-slate-500">Track client requirements, date, and project milestones.</p>
              </div>
              <button onClick={() => setShowNewEventModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Event Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Verma & Mehra Grand Wedding / Tech Expo 2026"
                  value={newEventForm.eventName}
                  onChange={e => setNewEventForm({ ...newEventForm, eventName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-fuchsia-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Client Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Full Name"
                    value={newEventForm.clientName}
                    onChange={e => setNewEventForm({ ...newEventForm, clientName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-fuchsia-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newEventForm.clientPhone}
                    onChange={e => setNewEventForm({ ...newEventForm, clientPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-fuchsia-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Event Type</label>
                  <select
                    value={newEventForm.eventType}
                    onChange={e => setNewEventForm({ ...newEventForm, eventType: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-fuchsia-500 outline-none bg-white font-medium"
                  >
                    <option value="Wedding">Wedding & Reception</option>
                    <option value="Corporate">Corporate Summit / Gala</option>
                    <option value="Birthday">Birthday & Kids Party</option>
                    <option value="Gala Dinner">Gala & Anniversary</option>
                    <option value="Private Party">Private Party & DJ Night</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Event Date</label>
                  <input
                    type="date"
                    value={newEventForm.eventDate}
                    onChange={e => setNewEventForm({ ...newEventForm, eventDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-fuchsia-500 outline-none bg-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Expected Guests</label>
                  <input
                    type="number"
                    min="10"
                    value={newEventForm.guestCount}
                    onChange={e => setNewEventForm({ ...newEventForm, guestCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-fuchsia-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    step="10000"
                    value={newEventForm.budget}
                    onChange={e => setNewEventForm({ ...newEventForm, budget: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-fuchsia-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Venue / City</label>
                <input
                  type="text"
                  placeholder="e.g. Palace Grounds, Bangalore"
                  value={newEventForm.venue}
                  onChange={e => setNewEventForm({ ...newEventForm, venue: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-fuchsia-500 outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewEventModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold text-xs shadow-md shadow-fuchsia-600/30 hover:opacity-95 transition"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
