"use client";

import React, { useState } from 'react';
import { 
  Utensils, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  Coffee, 
  AlertCircle, 
  PlusCircle, 
  Flame, 
  DollarSign, 
  ShoppingBag, 
  User, 
  Sparkles,
  Printer,
  X,
  Check,
  Search,
  Filter
} from 'lucide-react';

interface FoodDiningModuleProps {
  queueData: any;
  user: any;
  onRefresh: () => void;
  onAction: (actionId: string, endpoint: string, method?: string, body?: any) => Promise<void>;
  actionLoading: string | null;
}

export default function FoodDiningModule({
  queueData,
  user,
  onRefresh,
  onAction,
  actionLoading
}: FoodDiningModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'tables' | 'kot' | 'menu'>('tables');
  const [showNewTableModal, setShowNewTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');
  const [selectedTable, setSelectedTable] = useState<any | null>(null);

  // Quick Mock/Live Orders for Kitchen & Dine-in
  const [orders, setOrders] = useState([
    {
      id: 'KOT-101',
      table: 'Table 2',
      customer: 'Suresh Raina',
      type: 'Dine-in',
      time: '5 mins ago',
      status: 'Preparing',
      items: [
        { name: 'Paneer Butter Masala', qty: 2, note: 'Less spicy', price: 280 },
        { name: 'Butter Naan', qty: 4, note: 'Crispy', price: 45 },
        { name: 'Jeera Rice', qty: 1, note: '', price: 160 }
      ],
      total: 860
    },
    {
      id: 'KOT-102',
      table: 'Table 5',
      customer: 'Ananya Sharma',
      type: 'Dine-in',
      time: '12 mins ago',
      status: 'Ready',
      items: [
        { name: 'Margherita Pizza (12")', qty: 1, note: 'Extra cheese', price: 340 },
        { name: 'Cold Coffee with Ice Cream', qty: 2, note: '', price: 120 }
      ],
      total: 580
    },
    {
      id: 'KOT-103',
      table: 'Takeaway #12',
      customer: 'Vikram Joshi',
      type: 'Takeaway',
      time: '2 mins ago',
      status: 'New',
      items: [
        { name: 'Chicken Biryani Special', qty: 2, note: 'Extra Raita', price: 320 },
        { name: 'Gulab Jamun (2 pcs)', qty: 2, note: 'Warm', price: 70 }
      ],
      total: 780
    }
  ]);

  const existingResources = queueData?.resources || [];
  const tableResources = existingResources.filter((r: any) => r.type === 'Table' || r.type === 'Chair' || r.name.toLowerCase().includes('table'));

  const fallbackTables = tableResources.length > 0 ? tableResources : [
    { id: 't1', name: 'Table 1 (Window)', type: 'Table', capacity: 2, status: 'Occupied', currentGuest: 'Karan Mehra', orderTotal: 540, timeElapsed: '24m' },
    { id: 't2', name: 'Table 2 (Booth)', type: 'Table', capacity: 4, status: 'Occupied', currentGuest: 'Suresh Raina', orderTotal: 860, timeElapsed: '15m' },
    { id: 't3', name: 'Table 3 (Family)', type: 'Table', capacity: 6, status: 'Available', currentGuest: null, orderTotal: 0, timeElapsed: null },
    { id: 't4', name: 'Table 4 (Outdoor)', type: 'Table', capacity: 2, status: 'Reserved', currentGuest: 'Rohit K. (7:30 PM)', orderTotal: 0, timeElapsed: null },
    { id: 't5', name: 'Table 5 (VIP)', type: 'Table', capacity: 4, status: 'Food Served', currentGuest: 'Ananya Sharma', orderTotal: 580, timeElapsed: '38m' },
    { id: 't6', name: 'Table 6 (Corner)', type: 'Table', capacity: 4, status: 'Available', currentGuest: null, orderTotal: 0, timeElapsed: null },
  ];

  const handleStatusChange = (orderId: string, nextStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-orange-200 text-xs font-black tracking-widest uppercase mb-1">
              <ChefHat className="w-4 h-4" /> Food & Dining Station Operations
            </div>
            <h2 className="text-2xl md:text-3xl font-black">{user?.business?.name || 'Restaurant & Dining'}</h2>
            <p className="text-orange-100 text-sm mt-1 max-w-xl">
              Live table floor status, digital Kitchen Order Tickets (KOT), dine-in/takeaway tokens and service velocity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveSubTab('kot')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
                activeSubTab === 'kot' ? 'bg-white text-orange-700 shadow-md' : 'bg-black/20 text-white hover:bg-black/30'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400" /> Kitchen KOT ({orders.filter(o => o.status !== 'Done').length})
            </button>
            <button
              onClick={() => setActiveSubTab('tables')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
                activeSubTab === 'tables' ? 'bg-white text-orange-700 shadow-md' : 'bg-black/20 text-white hover:bg-black/30'
              }`}
            >
              <Utensils className="w-4 h-4 text-amber-300" /> Table Floor
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tables</span>
            <Utensils className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {fallbackTables.filter(t => t.status === 'Occupied' || t.status === 'Food Served').length} / {fallbackTables.length}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">
            {fallbackTables.filter(t => t.status === 'Available').length} tables ready for guests
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Live KOT Orders</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {orders.filter(o => o.status === 'Preparing' || o.status === 'New').length}
          </div>
          <span className="text-[11px] font-semibold text-amber-600">
            Avg prep time: 14 mins
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Dine-in Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            ₹{orders.reduce((sum, o) => sum + o.total, 1420).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Includes active table orders
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Waiting Queue</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {queueData?.waitingCount || 0}
          </div>
          <span className="text-[11px] font-semibold text-indigo-600">
            Guests in line for tables
          </span>
        </div>
      </div>

      {/* Sub Tabs Toggle */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('tables')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${
            activeSubTab === 'tables' ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-4 h-4" /> Table Management & Seating
        </button>
        <button
          onClick={() => setActiveSubTab('kot')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${
            activeSubTab === 'kot' ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ChefHat className="w-4 h-4" /> Kitchen Order Tickets (KOT)
        </button>
      </div>

      {/* TABLES VIEW */}
      {activeSubTab === 'tables' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Floor Layout & Table Occupancy</h3>
              <p className="text-xs text-slate-500">Click a table to see its open orders, bill, or seat a walk-in party.</p>
            </div>
            <button
              onClick={() => setShowNewTableModal(true)}
              className="bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors border border-orange-200"
            >
              <PlusCircle className="w-4 h-4" /> Add Table / Station
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fallbackTables.map((t: any) => {
              const isOccupied = t.status === 'Occupied' || t.status === 'Food Served';
              const isReserved = t.status === 'Reserved';
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTable(t)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                    isOccupied 
                      ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400 hover:shadow-md'
                      : isReserved
                      ? 'bg-purple-50/50 border-purple-200 hover:border-purple-300'
                      : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-black text-slate-900 text-base">{t.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5" /> Capacity: {t.capacity} Guests
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isOccupied 
                        ? 'bg-amber-500 text-white' 
                        : isReserved 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  {t.currentGuest ? (
                    <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-slate-200/60 mb-3">
                      <div className="text-xs text-slate-400 font-bold uppercase">Guest</div>
                      <div className="font-bold text-slate-800 text-sm flex items-center justify-between">
                        <span>{t.currentGuest}</span>
                        {t.timeElapsed && <span className="text-xs font-semibold text-amber-600">⏱ {t.timeElapsed}</span>}
                      </div>
                      {t.orderTotal > 0 && (
                        <div className="text-xs font-black text-emerald-700 mt-1">
                          Current Bill: ₹{t.orderTotal}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-5 text-center text-xs font-medium text-slate-400 italic">
                      Table is free and sanitized
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    {isOccupied ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Printing invoice & clearing ${t.name}`);
                        }}
                        className="text-orange-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> Settle & Clean
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Seat walk-in party at ${t.name}`);
                        }}
                        className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Seat Customer
                      </button>
                    )}
                    <span className="text-slate-400 font-bold group-hover:text-slate-600 transition-colors">Details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KITCHEN ORDER TICKETS (KOT) */}
      {activeSubTab === 'kot' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Live Kitchen Display (KOT)</h3>
              <p className="text-xs text-slate-500">Live sync between dining staff, online takeaways, and kitchen cooks.</p>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Auto-syncing orders
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className={`p-4 text-white flex justify-between items-center ${
                  order.status === 'New' ? 'bg-rose-500' :
                  order.status === 'Preparing' ? 'bg-amber-500' :
                  order.status === 'Ready' ? 'bg-emerald-600' : 'bg-slate-700'
                }`}>
                  <div>
                    <div className="font-black text-lg">{order.table}</div>
                    <div className="text-xs opacity-90">{order.customer} • {order.type}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-md">
                      {order.status}
                    </span>
                    <div className="text-[11px] opacity-80 mt-1">{order.time}</div>
                  </div>
                </div>

                <div className="p-4 flex-1 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Items to cook</div>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start py-1.5 border-b border-slate-100 text-sm">
                      <div>
                        <span className="font-black text-slate-900 mr-2">{item.qty}x</span>
                        <span className="font-semibold text-slate-700">{item.name}</span>
                        {item.note && (
                          <div className="text-[11px] text-rose-500 font-bold ml-6">
                            * Note: {item.note}
                          </div>
                        )}
                      </div>
                      <span className="font-mono text-xs text-slate-500">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="font-black text-slate-800 text-sm">
                    Total: ₹{order.total}
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'New' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'Preparing')}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Flame className="w-3.5 h-3.5" /> Start Cooking
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'Ready')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Ready
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'Done')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Utensils className="w-3.5 h-3.5" /> Served / Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
