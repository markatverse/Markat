"use client";

import React, { useState } from 'react';
import { 
  Utensils, 
  Clock, 
  CalendarClock,
  Users,
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
  Bell,
  X,
  Check,
  Search,
  UtensilsCrossed,
  Filter
} from 'lucide-react';

interface FoodDiningModuleProps {
  queueData: any;
  user: any;
  onRefresh: () => void;
  onAction: (actionId: string, endpoint: string, method?: string, body?: any) => Promise<void>;
  actionLoading: string | null;
  initialSubTab?: 'tables' | 'reservations' | 'kot' | 'menu';
}

export default function FoodDiningModule({
  queueData,
  user,
  onRefresh,
  onAction,
  actionLoading,
  initialSubTab
}: FoodDiningModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'tables' | 'reservations' | 'kot' | 'menu'>(initialSubTab || 'reservations');

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [showNewTableModal, setShowNewTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');
  const [selectedTable, setSelectedTable] = useState<any | null>(null);

  // Live Food Menu Items State (Synced with localStorage)
  const defaultMenuItems = [
    { id: 'm1', name: 'Dal Makhani Special', category: 'Main Course', price: 280, isVeg: true, inStock: true, description: 'Slow cooked black lentils with butter and cream.' },
    { id: 'm2', name: 'Paneer Butter Masala', category: 'Main Course', price: 320, isVeg: true, inStock: true, description: 'Cottage cheese cubes in rich tomato cashew gravy.' },
    { id: 'm3', name: 'Butter Tandoori Roti / Naan', category: 'Breads', price: 45, isVeg: true, inStock: true, description: 'Freshly baked Indian flatbread with butter.' },
    { id: 'm4', name: 'Crispy Veg Spring Rolls', category: 'Starters', price: 210, isVeg: true, inStock: true, description: 'Golden fried rolls stuffed with seasoned vegetables.' },
    { id: 'm5', name: 'Cold Coffee with Ice Cream', category: 'Beverages', price: 140, isVeg: true, inStock: true, description: 'Blended chilled espresso with rich vanilla scoop.' }
  ];

  const [diningMenuItems, setDiningMenuItems] = useState(defaultMenuItems);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Main Course');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemVeg, setNewItemVeg] = useState(true);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(`markat_dining_menu_${user?.id || 'default'}`);
      if (stored) {
        setDiningMenuItems(JSON.parse(stored));
      }
    } catch {}
  }, [user?.id]);

  const saveMenuItems = (items: typeof defaultMenuItems) => {
    setDiningMenuItems(items);
    try {
      localStorage.setItem(`markat_dining_menu_${user?.id || 'default'}`, JSON.stringify(items));
    } catch {}
  };

  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;
    const newItem = {
      id: `m_${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      price: Number(newItemPrice),
      isVeg: newItemVeg,
      inStock: true,
      description: newItemDesc.trim() || 'Freshly made to order.'
    };
    saveMenuItems([newItem, ...diningMenuItems]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDesc('');
    setShowNewItemModal(false);
  };

  const toggleItemStock = (id: string) => {
    saveMenuItems(diningMenuItems.map(i => i.id === id ? { ...i, inStock: !i.inStock } : i));
  };

  const deleteMenuItem = (id: string) => {
    saveMenuItems(diningMenuItems.filter(i => i.id !== id));
  };

  // Live Customer Bookings / Table Reservations State
  const defaultReservations = [
    {
      id: 'RES-8921',
      customerName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      guests: 4,
      date: 'Today',
      timeSlot: '07:30 PM - 09:00 PM',
      type: 'Standard Table',
      notes: 'Anniversary celebration, window table requested',
      assignedTable: 'Table 2 (Booth)',
      status: 'Pending', // Pending | Confirmed | Rejected | Seated
      source: 'Online Booking'
    },
    {
      id: 'RES-8922',
      customerName: 'Pooja Verma',
      phone: '+91 98112 34567',
      guests: 8,
      date: 'Today',
      timeSlot: '08:00 PM - 09:30 PM',
      type: 'Standard Table',
      notes: 'Family dinner with kids, baby high-chair needed',
      assignedTable: 'Table 7 (Large Party)',
      status: 'Pending',
      source: 'Online Booking'
    },
    {
      id: 'RES-8919',
      customerName: 'Vikram Joshi',
      phone: '+91 99887 76655',
      guests: 2,
      date: 'Today',
      timeSlot: '06:30 PM - 08:00 PM',
      type: 'Private VIP Dining Cabin',
      notes: 'Candlelight romantic setup package',
      assignedTable: 'Table 5 (VIP)',
      status: 'Confirmed',
      source: 'Private Dining'
    },
    {
      id: 'RES-8918',
      customerName: 'Sanjay Gupta',
      phone: '+91 97654 32109',
      guests: 6,
      date: 'Tomorrow',
      timeSlot: '01:30 PM - 03:00 PM',
      type: 'Standard Table',
      notes: 'Corporate lunch meeting',
      assignedTable: 'Table 3 (Family)',
      status: 'Confirmed',
      source: 'Online Booking'
    }
  ];

  const [reservations, setReservations] = useState(defaultReservations);

  // Sync with client-side reservations made on product details page
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('markat_table_reservations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReservations(prev => {
            const existingIds = new Set(prev.map(r => r.id));
            const newItems = parsed.filter(p => !existingIds.has(p.id));
            return [...newItems, ...prev];
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Real-time Seller Reservation Notification Alerts
  const [latestAlert, setLatestAlert] = useState<{ title: string; message: string; id: string } | null>(null);

  React.useEffect(() => {
    const checkAlerts = () => {
      try {
        const stored = localStorage.getItem('markat_seller_notifications');
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list) && list.length > 0 && !list[0].read) {
            setLatestAlert(list[0]);
          }
        }
      } catch {
        // ignore
      }
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  // Tables State
  const [customTables, setCustomTables] = useState<any[]>([
    { id: 't1', name: 'Table 1 (Window)', type: 'Table', capacity: 2, status: 'Occupied', currentGuest: 'Karan Mehra', orderTotal: 540, timeElapsed: '24m' },
    { id: 't2', name: 'Table 2 (Booth)', type: 'Table', capacity: 4, status: 'Occupied', currentGuest: 'Suresh Raina', orderTotal: 860, timeElapsed: '15m' },
    { id: 't3', name: 'Table 3 (Family)', type: 'Table', capacity: 6, status: 'Available', currentGuest: null, orderTotal: 0, timeElapsed: null },
    { id: 't4', name: 'Table 4 (Outdoor)', type: 'Table', capacity: 2, status: 'Reserved', currentGuest: 'Rohit K. (7:30 PM)', orderTotal: 0, timeElapsed: null },
    { id: 't5', name: 'Table 5 (VIP)', type: 'Table', capacity: 4, status: 'Food Served', currentGuest: 'Ananya Sharma', orderTotal: 580, timeElapsed: '38m' },
    { id: 't6', name: 'Table 6 (Corner)', type: 'Table', capacity: 4, status: 'Available', currentGuest: null, orderTotal: 0, timeElapsed: null },
    { id: 't7', name: 'Table 7 (Large Party)', type: 'Table', capacity: 8, status: 'Available', currentGuest: null, orderTotal: 0, timeElapsed: null },
  ]);

  const handleAcceptReservation = (id: string) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Confirmed' } : r));
  };

  const handleRejectReservation = (id: string) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };

  const handleSeatReservation = (id: string, assignedTable: string) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Seated' } : r));
    setCustomTables(prev => prev.map(t => t.name === assignedTable ? { ...t, status: 'Occupied', currentGuest: reservations.find(r => r.id === id)?.customerName || 'Guest' } : t));
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    const newT = {
      id: `t-${Date.now()}`,
      name: newTableName,
      type: 'Table',
      capacity: parseInt(newTableCapacity, 10) || 4,
      status: 'Available',
      currentGuest: null,
      orderTotal: 0,
      timeElapsed: null
    };
    setCustomTables(prev => [...prev, newT]);
    setNewTableName('');
    setNewTableCapacity('4');
    setShowNewTableModal(false);
  };

  // Quick Live Orders for Kitchen & Dine-in (KOT)
  const [orders, setOrders] = useState([
    {
      id: 'KOT-101',
      table: 'Table 2 (Booth)',
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
      table: 'Table 5 (VIP)',
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
              Live table floor status, digital Kitchen Order Tickets (KOT), floor occupancy and table turnover.
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
            {customTables.filter(t => t.status === 'Occupied' || t.status === 'Food Served').length} / {customTables.length}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">
            {customTables.filter(t => t.status === 'Available').length} tables ready for guests
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
            <span className="text-xs font-bold uppercase tracking-wider">Booked Tables</span>
            <CalendarClock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {reservations.filter(r => r.status === 'Confirmed' || r.status === 'Pending').length}
          </div>
          <span className="text-[11px] font-semibold text-rose-600">
            {reservations.filter(r => r.status === 'Pending').length} pending requests
          </span>
        </div>
      </div>

      {/* Real-time Customer Booking Alert Toast for Seller */}
      {latestAlert && (
        <div className="bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 p-0.5 rounded-2xl shadow-lg animate-in slide-in-from-top-4 duration-300">
          <div className="bg-white rounded-[14px] p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">
                    🔔 Live Customer Booking Alert
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Just now</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{latestAlert.title}</h4>
                <p className="text-xs text-slate-600">{latestAlert.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('reservations');
                  setLatestAlert(null);
                  try {
                    const list = JSON.parse(localStorage.getItem('markat_seller_notifications') || '[]');
                    localStorage.setItem('markat_seller_notifications', JSON.stringify(list.map((n: any) => ({ ...n, read: true }))));
                  } catch {}
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                View & Accept
              </button>
              <button
                type="button"
                onClick={() => setLatestAlert(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tabs Toggle */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('reservations')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shrink-0 ${
            activeSubTab === 'reservations' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarClock className="w-4 h-4" /> Bookings & Reservations ({reservations.filter(r => r.status === 'Pending').length} Pending)
        </button>
        <button
          onClick={() => setActiveSubTab('menu' as any)}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shrink-0 ${
            activeSubTab === ('menu' as any) ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" /> Food Menu Items ({diningMenuItems.length})
        </button>
        <button
          onClick={() => setActiveSubTab('tables')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shrink-0 ${
            activeSubTab === 'tables' ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-4 h-4" /> Table Floor ({customTables.length} Tables)
        </button>
        <button
          onClick={() => setActiveSubTab('kot')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shrink-0 ${
            activeSubTab === 'kot' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ChefHat className="w-4 h-4" /> Kitchen KOT
        </button>
      </div>

      {/* RESERVATIONS VIEW */}
      {activeSubTab === 'reservations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Incoming Customer Reservations</h3>
              <p className="text-xs text-slate-500">Review online customer requests, accept/reject, or directly assign & seat guests on the table floor.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Instant SMS & WhatsApp Sync
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {reservations.map(res => {
              const isPending = res.status === 'Pending';
              const isConfirmed = res.status === 'Confirmed';
              const isSeated = res.status === 'Seated';
              const isRejected = res.status === 'Rejected';

              return (
                <div 
                  key={res.id} 
                  className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                    isPending ? 'border-amber-300 bg-amber-50/20' :
                    isConfirmed ? 'border-emerald-300 bg-emerald-50/10' :
                    isSeated ? 'border-indigo-300 bg-indigo-50/10' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400">{res.id}</span>
                      <h4 className="font-black text-slate-900 text-base">{res.customerName}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isPending ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        isConfirmed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        isSeated ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                        'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {res.status}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {res.source}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1 text-slate-900 font-bold">
                        <Users className="w-3.5 h-3.5 text-rose-600" /> {res.guests} Guests
                      </span>
                      <span className="flex items-center gap-1 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {res.date} • {res.timeSlot}
                      </span>
                      <span className="flex items-center gap-1 text-indigo-700 font-bold">
                        <Utensils className="w-3.5 h-3.5 text-indigo-500" /> {res.assignedTable}
                      </span>
                      <span className="text-slate-500 font-mono">📞 {res.phone}</span>
                    </div>

                    {res.notes && (
                      <p className="text-xs text-slate-500 italic bg-white/60 p-2 rounded-lg border border-slate-200/60 mt-1">
                        &ldquo;{res.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAcceptReservation(res.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Check className="w-4 h-4" /> Accept Booking
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectReservation(res.id)}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-rose-200 transition-all"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}

                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => handleSeatReservation(res.id, res.assignedTable)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Utensils className="w-4 h-4" /> Guest Arrived: Seat at {res.assignedTable}
                      </button>
                    )}

                    {isSeated && (
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Seated & Active
                      </span>
                    )}

                    {isRejected && (
                      <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MENU VIEW */}
      {activeSubTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Food Menu & Dish Management</h3>
              <p className="text-xs text-slate-500">Add, edit prices, manage availability, or update dining dishes displayed to customers.</p>
            </div>
            <button
              onClick={() => setShowNewItemModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Add New Dish / Menu Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {diningMenuItems.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${
                        item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-lg font-black text-slate-900">₹{item.price.toLocaleString('en-IN')}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleItemStock(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        item.inStock 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.inStock ? 'In Stock' : 'Sold Out'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMenuItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove from menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            {customTables.map((t: any) => {
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
                          setCustomTables(prev => prev.map(tbl => tbl.id === t.id ? { ...tbl, status: 'Available', currentGuest: null, orderTotal: 0 } : tbl));
                        }}
                        className="text-orange-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> Settle & Clean
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const guest = prompt('Enter walk-in guest name:', 'Walk-in Guest');
                          if (guest) {
                            setCustomTables(prev => prev.map(tbl => tbl.id === t.id ? { ...tbl, status: 'Occupied', currentGuest: guest } : tbl));
                          }
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

      {/* ADD TABLE MODAL */}
      {showNewTableModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-600" /> Add New Table / Booth
              </h3>
              <button
                type="button"
                onClick={() => setShowNewTableModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Table Name or Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 8 (Garden View) or VIP Cabin 2"
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-orange-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Seating Capacity (Guests)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[2, 4, 6, 8].map(cap => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setNewTableCapacity(String(cap))}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        newTableCapacity === String(cap)
                          ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {cap}-Seater
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newTableCapacity}
                  onChange={e => setNewTableCapacity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-orange-500 outline-none font-medium"
                  placeholder="Custom capacity"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTableModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md transition-colors"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ADD NEW DISH / MENU ITEM MODAL */}
      {showNewItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-rose-600" /> Add Food Menu Item
              </h3>
              <button
                type="button"
                onClick={() => setShowNewItemModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMenuItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dish / Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Tikka or Butter Chicken"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-rose-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-rose-500 outline-none font-medium bg-white"
                  >
                    <option value="Starters">Starters / Appetizers</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Breads">Breads / Roti</option>
                    <option value="Rice & Biryani">Rice & Biryani</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages / Drinks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="250"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-rose-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dietary Tag
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewItemVeg(true)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newItemVeg ? 'bg-emerald-50 text-emerald-700 border-emerald-400 font-extrabold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Pure Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemVeg(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      !newItemVeg ? 'bg-rose-50 text-rose-700 border-rose-400 font-extrabold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Non-Veg
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Ingredients
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of taste, ingredients or portion size..."
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-rose-500 outline-none font-medium resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewItemModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
                >
                  Add to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
