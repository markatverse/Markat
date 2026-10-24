"use client";
import React from 'react';

interface DinerGuest {
  name: string;
  phone: string;
  visits: number;
  tag: string;
  lastVisit: string;
  totalSpent: string;
}

interface SellerCustomersTabProps {
  activeVertical: string;
}

export default function SellerCustomersTab({
  activeVertical,
}: SellerCustomersTabProps) {
  const isAutoWash = activeVertical === 'AUTOWASH';

  const dinerGuests: DinerGuest[] = [
    { name: 'Rahul Sharma', phone: '+91 98765 43210', visits: 4, tag: 'VIP Diner', lastVisit: 'Today', totalSpent: '₹3,450' },
    { name: 'Pooja Verma', phone: '+91 98112 34567', visits: 1, tag: 'Family Party', lastVisit: 'Today', totalSpent: '₹1,820' },
    { name: 'Vikram Joshi', phone: '+91 99887 76655', visits: 7, tag: 'Regular Guest', lastVisit: 'Yesterday', totalSpent: '₹6,200' },
    { name: 'Sanjay Gupta', phone: '+91 97654 32109', visits: 3, tag: 'Corporate', lastVisit: '3 days ago', totalSpent: '₹4,100' },
    { name: 'Ananya Sharma', phone: '+91 98223 11445', visits: 2, tag: 'Private Dining', lastVisit: 'Last week', totalSpent: '₹2,680' }
  ];

  const autoWashClients = [
    { name: 'Vikram Singh', phone: '+91 98765 43210', vehicleType: 'Car', icon: '🚗', plate: 'DL 01 AB 1234', visits: 6, tag: 'VIP Fleet', lastVisit: 'Today', totalSpent: '₹2,450' },
    { name: 'Rajesh Mehra', phone: '+91 98112 34567', vehicleType: 'Truck', icon: '🚚', plate: 'HR 26 DQ 8821', visits: 4, tag: 'Commercial', lastVisit: 'Today', totalSpent: '₹3,200' },
    { name: 'Harpreet Kaur', phone: '+91 99887 76655', vehicleType: 'Bike', icon: '🏍️', plate: 'UP 16 Z 9001', visits: 9, tag: 'Regular Rider', lastVisit: 'Yesterday', totalSpent: '₹1,350' },
    { name: 'Gagan Transports', phone: '+91 97654 32109', vehicleType: 'Heavy (JCB)', icon: '🚜', plate: 'DL 1M 7700', visits: 5, tag: 'Heavy Machine', lastVisit: '3 days ago', totalSpent: '₹6,000' },
    { name: 'Rohan Sharma', phone: '+91 98223 11445', vehicleType: 'Bus', icon: '🚌', plate: 'PB 10 CB 3421', visits: 3, tag: 'Tour Bus', lastVisit: 'Last week', totalSpent: '₹3,000' }
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 sm:mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isAutoWash ? 'Vehicle Fleet & Driver Directory' : 'Customer Directory'}
            </h1>
            <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold sm:hidden ${
              isAutoWash ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              ● Live
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">
            {isAutoWash
              ? 'Track registered vehicles, fleet accounts, wash frequency, and VIP drivers.'
              : (activeVertical === 'FOOD'
                ? 'Track your restaurant guests, repeat diners, reservation history, and VIP tables.'
                : 'Manage client relationships, visit histories, and customer contact info.')}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            isAutoWash ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            ● Live Sync Active
          </span>
        </div>
      </div>

      {/* Compact Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-5 mb-5 sm:mb-8">
        <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm sm:text-lg shrink-0 ${
            isAutoWash ? 'bg-cyan-50 text-cyan-700' : 'bg-blue-50 text-blue-600'
          }`}>
            {isAutoWash ? '🚗' : '👥'}
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900">128</div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight">
              {isAutoWash ? 'Total Vehicles' : 'Total Clients'}
            </div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm sm:text-lg shrink-0">
            ⭐
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900">42</div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight">
              {isAutoWash ? 'Fleet / VIP' : 'Repeat / VIP'}
            </div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm sm:text-lg shrink-0">
            📈
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900">{isAutoWash ? '₹480' : '₹1,420'}</div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight">
              {isAutoWash ? 'Avg Wash Ticket' : 'Avg Ticket'}
            </div>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="font-bold text-slate-900 text-xs sm:text-sm">
            {isAutoWash ? 'Recent Vehicles & Fleet Accounts' : 'Recent Diners & Guests'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Auto-logged from bookings & wash bay queue
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {isAutoWash ? (
            autoWashClients.map((cust, idx) => (
              <div key={idx} className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 sm:gap-3 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center text-lg shrink-0">
                    {cust.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">{cust.name}</span>
                      
                      {/* Indian HSRP Badge */}
                      <span className="inline-flex items-center h-5 bg-white border border-slate-900 rounded-[2px] shadow-2xs overflow-hidden px-1">
                        <span className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
                          <span className="text-[6px] text-[#003893]">☸</span>
                          <span className="text-[7px] font-black tracking-tighter text-[#003893]">IND</span>
                        </span>
                        <span className="font-mono font-black text-[9px] text-slate-900 tracking-wider pl-1 uppercase">
                          {cust.plate}
                        </span>
                      </span>

                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {cust.vehicleType}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                        {cust.tag}
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-xs text-slate-500 font-mono block mt-0.5">{cust.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none text-left sm:text-right sm:flex sm:items-center sm:gap-6 border sm:border-0 border-slate-100">
                  <div>
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Washes</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">{cust.visits} times</div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Lifetime Spend</div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-600">{cust.totalSpent}</div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Last Wash</div>
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-600">{cust.lastVisit}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            dinerGuests.map((cust, idx) => (
              <div key={idx} className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 sm:gap-3 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs sm:text-sm shrink-0">
                    {cust.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">{cust.name}</span>
                      <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                        {cust.tag}
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-xs text-slate-500 font-mono block mt-0.5">{cust.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none text-left sm:text-right sm:flex sm:items-center sm:gap-6 border sm:border-0 border-slate-100">
                  <div>
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Visits</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">{cust.visits} times</div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Lifetime Spend</div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-600">{cust.totalSpent}</div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Last Visit</div>
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-600">{cust.lastVisit}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
