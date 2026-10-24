"use client";
import React, { useState } from 'react';
import { 
  Ticket, Clock, TrendingUp, CheckCircle2, Ban, Search, ChevronDown, 
  Scissors, User, Sparkles, Palette, Activity, Droplet, Stethoscope, 
  Utensils, CalendarClock, Store, Users, UserPlus, PlusCircle, X, Phone, Mail, FileText,
  Car, RotateCcw, FastForward, AlertTriangle, Play
} from 'lucide-react';

interface SellerBookingsTabProps {
  bookings: any[];
  activeVertical: string;
  selectedServiceCategory: string;
  setSelectedServiceCategory: (cat: string) => void;
  searchBookingQuery: string;
  setSearchBookingQuery: (q: string) => void;
  selectedBookingDetails: any | null;
  setSelectedBookingDetails: (b: any | null) => void;
  onOpenWalkIn: () => void;
  onOpenStaffModal: () => void;
  onQueueAction?: (actionId: string, endpoint: string, method?: string, body?: any) => Promise<void>;
  queueId?: string | null;
}

export default function SellerBookingsTab({
  bookings,
  activeVertical,
  selectedServiceCategory,
  setSelectedServiceCategory,
  searchBookingQuery,
  setSearchBookingQuery,
  selectedBookingDetails,
  setSelectedBookingDetails,
  onOpenWalkIn,
  onOpenStaffModal,
  onQueueAction,
  queueId,
}: SellerBookingsTabProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleStartService = async (booking: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!booking?.rawId || !onQueueAction) return;
    setActionLoading(`start-${booking.rawId}`);
    try {
      await onQueueAction(`start-${booking.rawId}`, `/service-queue/token/${booking.rawId}/start`, 'PATCH');
      if (selectedBookingDetails?.rawId === booking.rawId) {
        setSelectedBookingDetails((prev: any) => prev ? { ...prev, status: 'In Progress', originalStatus: 'SERVING' } : null);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleSkipLate = async (booking: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!booking?.rawId || !onQueueAction) return;
    const confirmSkip = window.confirm(`Mark ${booking.customer} as Late / Absent? Their spot will be held while the next customer is called into the bay.`);
    if (!confirmSkip) return;

    setActionLoading(`skip-${booking.rawId}`);
    try {
      await onQueueAction(`skip-${booking.rawId}`, `/service-queue/token/${booking.rawId}/absent`, 'PATCH');
      if (queueId) {
        await onQueueAction(`next-${queueId}`, `/service-queue/${queueId}/next`, 'POST');
      }
      if (selectedBookingDetails?.rawId === booking.rawId) {
        setSelectedBookingDetails((prev: any) => prev ? { ...prev, status: 'Absent', originalStatus: 'ABSENT' } : null);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecallToBay = async (booking: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!booking?.rawId || !onQueueAction) return;
    setActionLoading(`recall-${booking.rawId}`);
    try {
      await onQueueAction(`recall-${booking.rawId}`, `/service-queue/token/${booking.rawId}/waiting`, 'PATCH');
      if (selectedBookingDetails?.rawId === booking.rawId) {
        setSelectedBookingDetails((prev: any) => prev ? { ...prev, status: 'Upcoming', originalStatus: 'WAITING' } : null);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteService = async (booking: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!booking?.rawId || !onQueueAction) return;
    setActionLoading(`done-${booking.rawId}`);
    try {
      await onQueueAction(`done-${booking.rawId}`, `/service-queue/token/${booking.rawId}/done`, 'PATCH');
      if (queueId) {
        await onQueueAction(`next-${queueId}`, `/service-queue/${queueId}/next`, 'POST');
      }
      setSelectedBookingDetails(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleNoShow = async (booking: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!booking?.rawId || !onQueueAction) return;
    const confirmCancel = window.confirm(`Mark ${booking.customer} as No-Show? This cancels their token.`);
    if (!confirmCancel) return;
    setActionLoading(`noshow-${booking.rawId}`);
    try {
      await onQueueAction(`noshow-${booking.rawId}`, `/service-queue/token/${booking.rawId}/no-show`, 'PATCH');
      if (queueId) {
        await onQueueAction(`next-${queueId}`, `/service-queue/${queueId}/next`, 'POST');
      }
      setSelectedBookingDetails(null);
    } finally {
      setActionLoading(null);
    }
  };

  const categoriesList = activeVertical === 'FOOD' 
    ? ['All Services', 'Table Dine-in', 'Takeaway', 'Main Course', 'Beverages & Desserts']
    : (activeVertical === 'DOCTOR'
    ? ['All Services', 'General OPD', 'Specialist Consult', 'Follow-up Review', 'Health Checkup']
    : (activeVertical === 'AUTOWASH'
    ? ['All Vehicles', 'Bike', 'Car', 'Truck', 'Bus', 'Heavy Vehicle (JCB)']
    : (activeVertical === 'SALON'
    ? ['All Services', 'Haircut', 'Beard Trim', 'Facial & Glow', 'Hair Color', 'Spa & Massage']
    : ['All Services', 'General Service', 'Express Visit', 'Standard Appointment'])));

  // Filter bookings based on selected vehicle/category and search query
  const filteredBookings = bookings.filter(b => {
    if (selectedServiceCategory && selectedServiceCategory !== 'All Services' && selectedServiceCategory !== 'All Vehicles') {
      const svc = (b.service || '').toLowerCase();
      const cat = selectedServiceCategory.toLowerCase();
      if (cat.includes('heavy') || cat.includes('jcb')) {
        if (!svc.includes('heavy') && !svc.includes('jcb') && !svc.includes('earthmover')) return false;
      } else if (!svc.includes(cat)) {
        return false;
      }
    }
    if (searchBookingQuery.trim()) {
      const q = searchBookingQuery.toLowerCase().trim();
      const cust = (b.customer || '').toLowerCase();
      const svc = (b.service || '').toLowerCase();
      const id = (b.id || '').toLowerCase();
      const phone = (b.phone || '').toLowerCase();
      if (!cust.includes(q) && !svc.includes(q) && !id.includes(q) && !phone.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-300 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tokens & Bookings</h1>
          <p className="text-slate-500 mt-1">Manage all your service tokens, appointments and bookings in one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onOpenWalkIn} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Walk In
          </button>
          <button onClick={onOpenStaffModal} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2">
            <Users className="w-5 h-5" /> Manage Staff
          </button>
        </div>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{bookings.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Bookings</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{bookings.filter(b => b.status === 'Waiting' || b.status === 'Pending').length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Waiting</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{bookings.filter(b => b.status === 'In Progress').length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">In Progress</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{bookings.filter(b => b.status === 'Done').length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{bookings.filter(b => b.status === 'No Show' || b.status === 'Cancelled').length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Filter Pills Adapted to Active Vertical */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {categoriesList.map((cat, i) => {
          const isSelected = selectedServiceCategory === cat || (cat === 'All Services' && selectedServiceCategory === 'All Services') || (cat === 'All Vehicles' && selectedServiceCategory === 'All Vehicles');
          const isAutoWash = activeVertical === 'AUTOWASH';

          return (
            <button 
              key={cat}
              onClick={() => setSelectedServiceCategory(cat)}
              className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                isSelected 
                  ? (isAutoWash ? 'bg-cyan-700 text-white border-cyan-700 shadow-md' : 'bg-blue-600 text-white border-blue-600 shadow-md')
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'Bike' ? <span className="text-base leading-none">🏍️</span> : ''}
              {cat === 'Car' ? <span className="text-base leading-none">🚗</span> : ''}
              {cat === 'Truck' ? <span className="text-base leading-none">🚚</span> : ''}
              {cat === 'Bus' ? <span className="text-base leading-none">🚌</span> : ''}
              {cat.includes('Heavy') || cat.includes('JCB') ? <span className="text-base leading-none">🚜</span> : ''}
              {cat.includes('Hair') ? <span className="text-base leading-none">✂</span> : ''}
              {cat.includes('Beard') ? <span className="text-base leading-none">🧔</span> : ''}
              {cat.includes('Dine-in') ? <span className="text-base leading-none">🍽️</span> : ''}
              {cat.includes('Takeaway') ? <span className="text-base leading-none">🥡</span> : ''}
              {cat.includes('OPD') || cat.includes('Consult') ? <span className="text-base leading-none">🩺</span> : ''}
              <span>{cat}</span>
              {i === 0 ? <span className="text-xs opacity-80">({bookings.length})</span> : ''}
            </button>
          );
        })}
      </div>

      {/* Sub Filters Row */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder={activeVertical === 'AUTOWASH' ? "Search by vehicle plate (e.g. DL 01 AB 1234), driver, or token..." : "Search by customer, token number, or service..."}
            value={searchBookingQuery}
            onChange={e => setSearchBookingQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-cyan-100 text-sm font-medium"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 relative">
        {/* Left side: Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Showing {filteredBookings.length} {activeVertical === 'AUTOWASH' ? 'vehicle tokens' : 'bookings'}
            </div>
            <button className="text-xs font-bold text-slate-600 flex items-center gap-1 hover:text-slate-900">
              Sort: Time <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            {/* Desktop Table */}
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white shadow-2xs z-10">
                <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold">
                  <th className="py-3 px-4 pl-6 font-semibold">Token / Booking</th>
                  <th className="py-3 px-4 font-semibold">{activeVertical === 'AUTOWASH' ? 'Driver / Customer' : 'Customer'}</th>
                  <th className="py-3 px-4 font-semibold">{activeVertical === 'AUTOWASH' ? 'Service & Vehicle' : 'Service'}</th>
                  <th className="py-3 px-4 font-semibold">Time</th>
                  <th className="py-3 px-4 font-semibold">{activeVertical === 'AUTOWASH' ? 'Bay / Lane' : 'Staff / Resource'}</th>
                  <th className="py-3 px-4 pr-6 text-right font-semibold">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        {activeVertical === 'AUTOWASH' ? <Car className="w-12 h-12 text-slate-300" /> : <Ticket className="w-12 h-12 text-slate-200" />}
                        <p className="font-semibold text-slate-600">
                          {activeVertical === 'AUTOWASH' ? 'No vehicle wash tokens match this filter' : 'No bookings found'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking, index) => {
                    const isSelected = selectedBookingDetails?.rawId === booking.rawId;
                    const isToken = booking.id.startsWith('TOKEN') || booking.id.startsWith('MV-TKN') || booking.bookingMode === 'TOKEN';
                    const idLabel = isToken ? `Token #${booking.tokenNumber || '?'}` : booking.id;
                    
                    const isAuto = activeVertical === 'AUTOWASH' || (booking.service || '').toLowerCase().includes('wash') || (booking.service || '').toLowerCase().includes('automobile');
                    const plateMatch = (booking.service || '').match(/\[Plate:\s*([^\]]+)\]/i) || (booking.customer || '').match(/\(([^)]+)\)$/);
                    const detectedPlate = plateMatch ? plateMatch[1].trim() : null;
                    const cleanCustomer = detectedPlate ? booking.customer.replace(/\s*\([^)]*\)$/, '').trim() : booking.customer;

                    const rawSvcLower = (booking.service || '').toLowerCase();
                    const vehicleEmoji = 
                      rawSvcLower.includes('bike') ? '🏍️' :
                      rawSvcLower.includes('truck') ? '🚚' :
                      rawSvcLower.includes('bus') ? '🚌' :
                      (rawSvcLower.includes('heavy') || rawSvcLower.includes('jcb')) ? '🚜' :
                      '🚗';

                    // Remove duplicate [Plate: ...] and leading emoji duplicates from the service string
                    const cleanService = (booking.service || '')
                      .replace(/\[Plate:\s*[^\]]+\]/gi, '')
                      .replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+/gu, '')
                      .trim() || (isAuto ? 'Vehicle Wash & Detailing' : 'Standard Service');

                    const badgeColor = isToken 
                      ? (booking.status === 'In Progress' ? 'bg-cyan-100 text-cyan-800' : 'bg-emerald-100 text-emerald-800')
                      : 'bg-fuchsia-100 text-fuchsia-700';

                    return (
                    <tr 
                      key={booking.rawId || index} 
                      onClick={() => setSelectedBookingDetails(booking)}
                      className={`cursor-pointer transition-colors ${isSelected ? (isAuto ? 'bg-cyan-50/70' : 'bg-blue-50/50') : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="py-3 px-4 pl-6 whitespace-nowrap">
                        <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-black tracking-wide ${badgeColor}`}>
                          {isToken ? '' : <CalendarClock className="w-4 h-4 mr-1 inline" />}{idLabel}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-sm leading-tight">{cleanCustomer}</div>
                        <div className="text-xs font-medium text-slate-500 font-mono mt-0.5">{booking.phone || '+91 98765 43210'}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {isAuto ? (
                            <span className="text-base leading-none shrink-0">{vehicleEmoji}</span>
                          ) : booking.service.includes('Haircut') ? (
                            <Scissors className="w-4 h-4 text-indigo-500 shrink-0" />
                          ) : booking.service.includes('Beard') ? (
                            <User className="w-4 h-4 text-indigo-500 shrink-0" />
                          ) : booking.service.includes('Facial') ? (
                            <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
                          ) : (booking.service.toLowerCase().includes('consult') || booking.service.toLowerCase().includes('opd')) ? (
                            <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (booking.service.toLowerCase().includes('dine') || booking.service.toLowerCase().includes('table')) ? (
                            <Utensils className="w-4 h-4 text-orange-500 shrink-0" />
                          ) : (
                            <Ticket className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span>{cleanService}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {detectedPlate && (
                            <div className="inline-flex items-center h-5 bg-white border border-slate-900 rounded-[3px] shadow-2xs overflow-hidden px-1 whitespace-nowrap shrink-0">
                              <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300">
                                <span className="text-[6px] text-[#003893]">☸</span>
                                <span className="text-[7px] font-black tracking-tighter text-[#003893]">IND</span>
                              </div>
                              <span className="font-mono font-black text-[10px] text-slate-950 tracking-wider pl-1 uppercase whitespace-nowrap">
                                {detectedPlate.toUpperCase()}
                              </span>
                            </div>
                          )}
                          {booking.price ? (
                            <span className="text-xs font-black text-cyan-800">₹{booking.price}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700 whitespace-nowrap text-xs">
                        {booking.appointmentTime ? new Date(booking.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Live Token'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs">
                          {booking.staffName || (isAuto ? 'Bay Specialist' : (activeVertical === 'DOCTOR' ? 'Dr. Verma' : (activeVertical === 'FOOD' ? 'Waiter Suraj' : 'Amit')))}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400">
                          {isAuto ? `Wash Bay ${1 + (index % 3)}` : (activeVertical === 'FOOD' ? `Table ${1 + (index % 6)}` : (activeVertical === 'DOCTOR' ? `Chamber ${1 + (index % 2)}` : `Chair ${1 + (index % 4)}`))}
                        </div>
                      </td>
                      <td className="py-3 px-4 pr-6 text-right whitespace-nowrap">
                        <div className="inline-flex flex-col items-end gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            booking.status === 'In Progress' ? 'bg-cyan-100 text-cyan-800' :
                            booking.status === 'Absent' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            booking.status === 'Waiting' || booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            booking.status === 'Checked In' || booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {booking.status === 'Absent' ? 'Late / On Hold' : (isAuto && booking.status === 'In Progress' ? 'In Wash Bay' : (booking.status === 'Pending' ? 'Waiting' : booking.status))}
                          </span>
                          <button className={`px-3 py-0.5 rounded-lg border font-bold text-[11px] transition-colors bg-white ${
                            isAuto ? 'border-cyan-200 text-cyan-700 hover:bg-cyan-50' : 'border-slate-200 text-blue-600 hover:bg-blue-50'
                          }`}>
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Details Pane (Desktop) */}
        <div className="hidden xl:flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
          {selectedBookingDetails ? (() => {
            const detailIsAuto = activeVertical === 'AUTOWASH' || (selectedBookingDetails?.service || '').toLowerCase().includes('wash') || (selectedBookingDetails?.service || '').toLowerCase().includes('automobile');
            const detailPlateMatch = (selectedBookingDetails?.service || '').match(/\[Plate:\s*([^\]]+)\]/i) || (selectedBookingDetails?.customer || '').match(/\(([^)]+)\)$/);
            const detailPlate = detailPlateMatch ? detailPlateMatch[1].trim() : null;
            const detailCleanCustomer = detailPlate ? selectedBookingDetails.customer.replace(/\s*\([^)]*\)$/, '').trim() : selectedBookingDetails.customer;
            
            const rawDetailLower = (selectedBookingDetails?.service || '').toLowerCase();
            const detailVehicleEmoji = 
              rawDetailLower.includes('bike') ? '🏍️' :
              rawDetailLower.includes('truck') ? '🚚' :
              rawDetailLower.includes('bus') ? '🚌' :
              (rawDetailLower.includes('heavy') || rawDetailLower.includes('jcb')) ? '🚜' :
              '🚗';

            const detailCleanService = (selectedBookingDetails?.service || '')
              .replace(/\[Plate:\s*[^\]]+\]/gi, '')
              .replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+/gu, '')
              .trim() || (detailIsAuto ? 'Vehicle Wash & Detailing' : 'Service Booking');

            return (
            <div className="flex flex-col h-full">
              <div className="p-5 border-b border-slate-100 relative bg-slate-50/50">
                <button onClick={() => setSelectedBookingDetails(null)} className="absolute right-4 top-4 p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center justify-between mb-1.5 pr-8">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {selectedBookingDetails.id}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    selectedBookingDetails.status === 'In Progress' ? 'bg-cyan-100 text-cyan-800' :
                    selectedBookingDetails.status === 'Absent' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    selectedBookingDetails.status === 'Waiting' || selectedBookingDetails.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {selectedBookingDetails.status === 'Absent' ? 'Late / On Hold' : (detailIsAuto && selectedBookingDetails.status === 'In Progress' ? 'In Wash Bay' : (selectedBookingDetails.status === 'Pending' ? 'Waiting' : selectedBookingDetails.status))}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {detailIsAuto ? 'Vehicle Wash Token Details' : 'Live Appointment Record'}
                </div>
              </div>

              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
                {/* Late / Skipped Banner */}
                {selectedBookingDetails.status === 'Absent' && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-bold">Driver Late (Bay Skipped & Preserved)</div>
                      <div className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                        This customer was bypassed so the next vehicle could enter the wash bay. Their ticket is saved on hold. Click &quot;Recall into Bay&quot; once they arrive.
                      </div>
                    </div>
                  </div>
                )}

                {/* Merged Vehicle & Service Card */}
                <div className="p-4 bg-gradient-to-br from-cyan-50/80 to-slate-50 rounded-2xl border border-cyan-100/90 shadow-2xs">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white border border-cyan-200/80 shadow-2xs flex items-center justify-center text-2xl shrink-0">
                        {detailVehicleEmoji}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest block">
                          {detailIsAuto ? 'Selected Service' : 'Service Package'}
                        </span>
                        <h3 className="font-black text-base text-slate-900 truncate">
                          {detailCleanService}
                        </h3>
                      </div>
                    </div>
                    {selectedBookingDetails.price ? (
                      <span className="text-sm font-black text-cyan-800 bg-white border border-cyan-200/80 px-2.5 py-1 rounded-xl shadow-2xs whitespace-nowrap shrink-0">
                        ₹{selectedBookingDetails.price}
                      </span>
                    ) : null}
                  </div>

                  {/* Authentic Indian HSRP Number Plate */}
                  {detailPlate && (
                    <div className="mt-2 w-full flex items-center justify-center py-2 bg-white/80 rounded-xl border border-slate-200/60 shadow-2xs">
                      <div className="inline-flex items-center h-8 bg-white border-2 border-slate-900 rounded-[3px] shadow-xs overflow-hidden px-2 whitespace-nowrap">
                        <div className="flex items-center gap-1 pr-1.5 border-r border-slate-300">
                          <span className="text-[9px] text-[#003893]">☸</span>
                          <span className="text-[9px] font-black tracking-widest text-[#003893]">IND</span>
                        </div>
                        <span className="font-mono font-black text-sm text-slate-950 tracking-widest pl-2 uppercase">
                          {detailPlate.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Driver / Customer Information */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    {detailIsAuto ? 'Vehicle Owner / Driver' : 'Customer Info'}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-700 text-sm shrink-0">
                      {detailCleanCustomer.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm truncate">{detailCleanCustomer}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{selectedBookingDetails.phone || '+91 98765 43210'}</div>
                    </div>
                  </div>
                </div>

                {/* Station Allocation & Details */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Station / Lane</span>
                    <span className="font-black text-slate-900 text-sm mt-0.5 block truncate">
                      {detailIsAuto ? 'Wash Bay 1 (Active)' : 'Station 1'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Assigned Tech</span>
                    <span className="font-black text-slate-900 text-sm mt-0.5 block truncate">
                      {selectedBookingDetails.staffName || (detailIsAuto ? 'Bay Specialist' : 'Staff Member')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-col gap-2.5">
                {/* 4 Core Quick Actions: Start, Skip, Call, Complete */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Action 1: START */}
                  {selectedBookingDetails.status === 'In Progress' ? (
                    <div className="bg-emerald-50 border border-emerald-200/90 text-emerald-800 font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>{detailIsAuto ? 'In Wash Bay' : 'In Service'}</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleStartService(selectedBookingDetails)}
                      disabled={actionLoading === `start-${selectedBookingDetails.rawId}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> {detailIsAuto ? 'Start Wash' : 'Start Service'}
                    </button>
                  )}

                  {/* Action 2: SKIP */}
                  {selectedBookingDetails.status === 'Absent' ? (
                    <button 
                      onClick={() => handleRecallToBay(selectedBookingDetails)}
                      disabled={actionLoading === `recall-${selectedBookingDetails.rawId}`}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-black py-2.5 px-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Return to Queue
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSkipLate(selectedBookingDetails)}
                      disabled={actionLoading === `skip-${selectedBookingDetails.rawId}`}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-black py-2.5 px-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <FastForward className="w-3.5 h-3.5" /> Skip (Driver Late)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Action 3: CALL */}
                  <a 
                    href={`tel:${selectedBookingDetails.phone || ''}`}
                    className="bg-cyan-700 hover:bg-cyan-800 text-white font-black py-2.5 px-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95 text-center"
                  >
                    <Phone className="w-3.5 h-3.5" /> {detailIsAuto ? 'Call Driver' : 'Call Customer'}
                  </a>

                  {/* Action 4: COMPLETE */}
                  <button 
                    onClick={() => handleCompleteService(selectedBookingDetails)}
                    disabled={actionLoading === `done-${selectedBookingDetails.rawId}`}
                    className="bg-slate-900 hover:bg-emerald-700 text-white font-black py-2.5 px-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {detailIsAuto ? 'Complete Wash' : 'Complete'}
                  </button>
                </div>

                {/* Additional No-Show / Cancel line */}
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Customer delayed or not reaching?</span>
                  <button 
                    onClick={() => handleNoShow(selectedBookingDetails)}
                    disabled={actionLoading === `noshow-${selectedBookingDetails.rawId}`}
                    className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Ban className="w-3 h-3" /> No-Show
                  </button>
                </div>
              </div>
            </div>
            );
          })() : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-slate-50/30">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                {activeVertical === 'AUTOWASH' ? <Car className="w-10 h-10 text-slate-300" /> : <Ticket className="w-10 h-10 text-slate-300" />}
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Booking Selected</h3>
              <p className="text-sm font-medium max-w-[200px] mx-auto">Select a vehicle from the list to view its complete HSRP details and manage bay service.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
