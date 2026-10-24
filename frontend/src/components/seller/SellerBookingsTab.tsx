"use client";
import React, { useState } from 'react';
import { 
  Ticket, Clock, TrendingUp, CheckCircle2, Ban, Search, ChevronDown, 
  Scissors, User, Sparkles, Palette, Activity, Droplet, Stethoscope, 
  Utensils, CalendarClock, Store, Users, UserPlus, PlusCircle, X, Phone, Mail, FileText 
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
}: SellerBookingsTabProps) {
  const categoriesList = activeVertical === 'FOOD' 
    ? ['All Services', 'Table Dine-in', 'Takeaway', 'Main Course', 'Beverages & Desserts']
    : (activeVertical === 'DOCTOR'
    ? ['All Services', 'General OPD', 'Specialist Consult', 'Follow-up Review', 'Health Checkup']
    : (activeVertical === 'AUTOWASH'
    ? ['All Vehicles', 'Bike', 'Car', 'Truck', 'Bus', 'Heavy Vehicle (JCB)']
    : (activeVertical === 'SALON'
    ? ['All Services', 'Haircut', 'Beard Trim', 'Facial & Glow', 'Hair Color', 'Spa & Massage']
    : ['All Services', 'General Service', 'Express Visit', 'Standard Appointment'])));

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
        {categoriesList.map((cat, i) => (
          <button 
            key={cat}
            onClick={() => setSelectedServiceCategory(cat)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors flex items-center gap-2 border ${selectedServiceCategory === cat || (cat === 'All Services' && selectedServiceCategory === 'All Services') ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {cat.includes('Hair') ? <span className="text-base leading-none">✂</span> : ''}
            {cat.includes('Beard') ? <span className="text-base leading-none">🧔</span> : ''}
            {cat.includes('Dine-in') ? <span className="text-base leading-none">🍽️</span> : ''}
            {cat.includes('Takeaway') ? <span className="text-base leading-none">🥡</span> : ''}
            {cat.includes('OPD') || cat.includes('Consult') ? <span className="text-base leading-none">🩺</span> : ''}
            {cat} {i === 0 ? `(${bookings.length})` : ''}
          </button>
        ))}
      </div>

      {/* Sub Filters Row */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by customer, token number, or service..." 
            value={searchBookingQuery}
            onChange={e => setSearchBookingQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm font-medium"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 relative">
        {/* Left side: Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Showing {bookings.length} bookings
            </div>
            <button className="text-xs font-bold text-slate-600 flex items-center gap-1 hover:text-slate-900">
              Sort: Time <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {/* Desktop Table */}
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold">
                  <th className="p-4 pl-6 font-medium">Token / Booking</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Service</th>
                  <th className="p-4 font-medium">Time</th>
                  <th className="p-4 font-medium">Staff / Resource</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 pr-6 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Ticket className="w-12 h-12 text-slate-200" />
                        <p className="font-semibold text-slate-600">No bookings found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking, index) => {
                    const isSelected = selectedBookingDetails?.rawId === booking.rawId;
                    const isToken = booking.id.startsWith('TOKEN') || booking.id.startsWith('MV-TKN') || booking.bookingMode === 'TOKEN';
                    const idLabel = isToken ? `Token #${booking.tokenNumber || '?'}` : booking.id;
                    
                    const badgeColor = isToken 
                      ? (booking.status === 'In Progress' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700')
                      : 'bg-fuchsia-100 text-fuchsia-700';

                    return (
                    <tr 
                      key={index} 
                      onClick={() => setSelectedBookingDetails(booking)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="p-4 pl-6">
                        <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-black tracking-wide ${badgeColor}`}>
                          {isToken ? '' : <CalendarClock className="w-4 h-4 mr-1 inline" />}{idLabel}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{booking.customer}</div>
                        <div className="text-xs font-medium text-slate-500">+91 98765 432{10 + (index % 90)}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700 flex items-center gap-2 whitespace-nowrap">
                          {booking.service.includes('Haircut') ? <Scissors className="w-5 h-5 text-indigo-500" /> :
                           booking.service.includes('Beard') ? <User className="w-5 h-5 text-indigo-500" /> :
                           booking.service.includes('Facial') ? <Sparkles className="w-5 h-5 text-pink-500" /> :
                           booking.service.includes('Color') ? <Palette className="w-5 h-5 text-purple-500" /> :
                           booking.service.includes('Massage') ? <Activity className="w-5 h-5 text-teal-500" /> :
                           booking.service.includes('Spa') ? <Droplet className="w-5 h-5 text-cyan-500" /> :
                           (booking.service.toLowerCase().includes('consult') || booking.service.toLowerCase().includes('opd') || booking.service.toLowerCase().includes('checkup')) ? <Stethoscope className="w-5 h-5 text-emerald-600" /> :
                           (booking.service.toLowerCase().includes('dine') || booking.service.toLowerCase().includes('table') || booking.service.toLowerCase().includes('food')) ? <Utensils className="w-5 h-5 text-orange-500" /> :
                           <Ticket className="w-5 h-5 text-slate-500" />}
                          {booking.service}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700 whitespace-nowrap">
                        {booking.appointmentTime ? new Date(booking.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '10:40 AM'}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900 whitespace-nowrap">{booking.staffName || (activeVertical === 'DOCTOR' ? 'Dr. Verma' : (activeVertical === 'FOOD' ? 'Waiter Suraj' : 'Amit'))}</div>
                        <div className="text-xs font-medium text-slate-400 whitespace-nowrap">
                          {activeVertical === 'FOOD' ? `Table ${1 + (index % 6)}` : (activeVertical === 'DOCTOR' ? `Chamber ${1 + (index % 2)}` : `Chair ${1 + (index % 4)}`)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          booking.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'Waiting' || booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          booking.status === 'Checked In' || booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {booking.status === 'Pending' ? 'Waiting' : booking.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button className="px-4 py-1.5 rounded-lg border border-slate-200 text-blue-600 font-semibold text-sm hover:bg-blue-50 hover:border-blue-200 transition-colors bg-white">
                          View
                        </button>
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
          {selectedBookingDetails ? (
            <div className="flex flex-col h-full">
              <div className="p-5 border-b border-slate-100 relative">
                <button onClick={() => setSelectedBookingDetails(null)} className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center justify-between mb-2 pr-8">
                  <h2 className="text-xl font-black text-slate-900">
                    {selectedBookingDetails.id}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          selectedBookingDetails.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          selectedBookingDetails.status === 'Waiting' || selectedBookingDetails.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                    {selectedBookingDetails.status === 'Pending' ? 'Waiting' : selectedBookingDetails.status}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-500">Live Queue & Appointment Record</div>
              </div>

              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> Customer</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{selectedBookingDetails.customer}</div>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Phone className="w-3 h-3" /> +91 98765 43210</span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Mail className="w-3 h-3" /> customer@gmail.com</span>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Service</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-800">{selectedBookingDetails.service}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> 20 minutes</span>
                    <span className="flex items-center gap-1 text-slate-900 font-bold">💸 ₹{selectedBookingDetails.price || 200}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Start Service
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm">
                    <Phone className="w-4 h-4" /> Call Customer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-slate-50/30">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                <Ticket className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Booking Selected</h3>
              <p className="text-sm font-medium max-w-[200px] mx-auto">Select a booking from the list to view its complete details and manage actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
