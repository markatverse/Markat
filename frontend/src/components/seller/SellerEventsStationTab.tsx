"use client";
import React from 'react';
import { Sparkles, PlusCircle, PartyPopper, User, Phone, CalendarClock, Users, MapPin, MessageSquare } from 'lucide-react';

interface SellerEventsStationTabProps {
  eventInquiries: any[];
  user: any;
  onAddNewService: () => void;
  onUpdateEventStatus: (inquiryId: string, status: string) => void;
}

export default function SellerEventsStationTab({
  eventInquiries,
  user,
  onAddNewService,
  onUpdateEventStatus,
}: SellerEventsStationTabProps) {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Event & Party Management Desk</h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-600" />
              Organizer Hub
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage incoming party inquiries, custom occasion proposals, stage production timelines, and customer consultations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddNewService}
            className="px-4 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-fuchsia-600/20 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Add Event Package
          </button>
        </div>
      </div>

      {/* Quick KPI Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">New Event Leads</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{eventInquiries.length}</div>
          <span className="text-[11px] font-semibold text-fuchsia-600 mt-1 block">Live from customer portal</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Upcoming Events</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {eventInquiries.filter(e => e.status === 'Confirmed' || e.status === 'Contract Sent').length}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">Contracts active</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Weddings & Galas</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {eventInquiries.filter(e => (e.eventType || '').toLowerCase().includes('wedding') || (e.eventType || '').toLowerCase().includes('gala')).length}
          </div>
          <span className="text-[11px] font-semibold text-purple-600 mt-1 block">Mega productions</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Avg Guest Size</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">250 - 500</div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 block">Across inquiries</span>
        </div>
      </div>

      {/* Inquiries & Proposals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <PartyPopper className="w-4 h-4 text-fuchsia-600" /> Customer Event & Party Inquiries
          </h3>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            {eventInquiries.length} Inquiries Recorded
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {eventInquiries.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No event inquiries yet. Customer event requests submitted from your organizer service pages will appear here in real time.
            </div>
          ) : (
            eventInquiries.map((inquiry: any) => (
              <div key={inquiry.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {inquiry.id}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {inquiry.eventType}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      inquiry.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      inquiry.status === 'Proposal Sent' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      ● {inquiry.status || 'New Inquiry'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {inquiry.customerName || 'Customer'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {inquiry.customerPhone || '+91 98765 43210'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-fuchsia-700 font-bold">
                      <CalendarClock className="w-3.5 h-3.5" /> {inquiry.eventDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {inquiry.guestCount}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {inquiry.eventCity}
                    </span>
                  </div>

                  {inquiry.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 line-clamp-2">
                      <strong className="text-slate-700">Client Vision:</strong> {inquiry.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0 flex-wrap">
                  <a
                    href={`https://wa.me/${(inquiry.customerPhone || '919876543210').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${inquiry.customerName || 'Client'}! Thank you for inquiring about ${inquiry.eventType} on ${inquiry.eventDate}. We would love to share our event deck, stage options, and package quotation.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateEventStatus(inquiry.id, 'Proposal Sent');
                      alert(`Proposal status updated to "Proposal Sent" for ${inquiry.customerName}.`);
                    }}
                    className="flex-1 md:flex-none px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all"
                  >
                    Send Proposal
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateEventStatus(inquiry.id, 'Confirmed');
                      alert(`🎉 Event Contract Confirmed for ${inquiry.customerName}! Added to active event calendar.`);
                    }}
                    className="flex-1 md:flex-none px-3.5 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Confirm Event
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
