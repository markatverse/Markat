"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, MapPin, Clock, Calendar, Users, UtensilsCrossed, CheckCircle2, ChevronRight, Phone, Info } from 'lucide-react';

const MOCK_RESTAURANT = {
  id: 'rest_123',
  name: 'The Rustic Hearth',
  type: 'Italian Cuisine • Wood-fired Pizza',
  rating: 4.8,
  reviews: 324,
  location: '123 Culinary Avenue, Food District',
  openTime: '11:00 AM',
  closeTime: '11:00 PM',
  coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  menu: [
    { id: 1, category: 'Starters', name: 'Bruschetta al Pomodoro', price: 12, description: 'Grilled bread with garlic, tomatoes, olive oil.' },
    { id: 2, category: 'Starters', name: 'Crispy Calamari', price: 16, description: 'Served with house-made marinara sauce.' },
    { id: 3, category: 'Mains', name: 'Truffle Mushroom Risotto', price: 28, description: 'Arborio rice, wild mushrooms, truffle oil, parmesan.' },
    { id: 4, category: 'Mains', name: 'Margherita Pizza', price: 22, description: 'San Marzano tomato, fresh mozzarella, basil.' },
    { id: 5, category: 'Desserts', name: 'Classic Tiramisu', price: 10, description: 'Coffee-soaked ladyfingers, mascarpone cream.' },
  ]
};

export default function RestaurantProfilePage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'RESERVE' | 'MENU'>('RESERVE');
  const [partySize, setPartySize] = useState(2);
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [date, setDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [time, setTime] = useState('');

  const restaurantSlots = useMemo(() => [
    { label: '18:00', hour: 18, minute: 0 },
    { label: '18:30', hour: 18, minute: 30 },
    { label: '19:00', hour: 19, minute: 0 },
    { label: '19:30', hour: 19, minute: 30 },
    { label: '20:00', hour: 20, minute: 0 },
    { label: '20:30', hour: 20, minute: 30 },
    { label: '21:00', hour: 21, minute: 0 },
  ], []);

  const availableRestaurantSlots = useMemo(() => {
    if (!date) return restaurantSlots;
    if (date > todayStr) return restaurantSlots;
    if (date === todayStr) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      return restaurantSlots.filter(s => (s.hour * 60 + s.minute) > (currentMinutes + 15));
    }
    return [];
  }, [date, todayStr, restaurantSlots]);

  useEffect(() => {
    if (time && !availableRestaurantSlots.some(s => s.label === time)) {
      setTime('');
    }
  }, [availableRestaurantSlots, time]);

  const [preOrderItems, setPreOrderItems] = useState<Record<number, number>>({});

  const handlePreOrder = (itemId: number, change: number) => {
    setPreOrderItems(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + change);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const calculateTotal = () => {
    return Object.entries(preOrderItems).reduce((total, [id, qty]) => {
      const item = MOCK_RESTAURANT.menu.find(m => m.id === parseInt(id));
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      {/* Cover Image & Header */}
      <div className="relative h-64 md:h-96 w-full">
        <img src={MOCK_RESTAURANT.coverImage} alt="Cover" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 max-w-5xl mx-auto">
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-rose-500 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded">
                  Premium
                </span>
                <span className="flex items-center text-amber-400 text-sm font-bold">
                  <Star className="w-4 h-4 mr-1 fill-amber-400" /> {MOCK_RESTAURANT.rating} ({MOCK_RESTAURANT.reviews})
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{MOCK_RESTAURANT.name}</h1>
              <p className="text-slate-300 font-medium mb-1 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-rose-400" /> {MOCK_RESTAURANT.type}
              </p>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" /> {MOCK_RESTAURANT.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button 
              onClick={() => setActiveTab('RESERVE')}
              className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'RESERVE' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Reserve Table
            </button>
            <button 
              onClick={() => setActiveTab('MENU')}
              className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'MENU' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Order Menu
            </button>
          </div>

          {activeTab === 'RESERVE' && (
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-400" /> Book a Table
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Party Size</label>
                  <div className="relative">
                    <Users className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select 
                      value={partySize} 
                      onChange={(e) => setPartySize(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-rose-500 appearance-none"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n} People</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Date</label>
                  <input 
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Time</label>
                  <div className="relative">
                    <Clock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)}
                      disabled={availableRestaurantSlots.length === 0}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-rose-500 appearance-none disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {availableRestaurantSlots.length === 0 ? 'No more slots today' : 'Select Time'}
                      </option>
                      {availableRestaurantSlots.map(t => (
                        <option key={t.label} value={t.label}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3 mb-6">
                <Info className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                <p className="text-sm text-rose-200">
                  You can optionally pre-order your meals from the Menu tab to avoid waiting times when you arrive.
                </p>
              </div>

              <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl transition-colors text-lg flex justify-center items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Confirm Reservation
              </button>
            </div>
          )}

          {activeTab === 'MENU' && (
            <div className="space-y-6">
              {['Starters', 'Mains', 'Desserts'].map(category => (
                <div key={category} className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">{category}</h3>
                  <div className="space-y-4">
                    {MOCK_RESTAURANT.menu.filter(m => m.category === category).map(item => (
                      <div key={item.id} className="flex justify-between items-center pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                        <div className="pr-4">
                          <h4 className="font-bold text-slate-200">{item.name}</h4>
                          <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                          <p className="font-bold text-rose-400 mt-1">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-950 p-1.5 rounded-lg border border-slate-800 shrink-0">
                          <button onClick={() => handlePreOrder(item.id, -1)} className="w-8 h-8 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-bold flex items-center justify-center transition-colors">
                            -
                          </button>
                          <span className="w-4 text-center font-bold text-white text-sm">
                            {preOrderItems[item.id] || 0}
                          </span>
                          <button onClick={() => handlePreOrder(item.id, 1)} className="w-8 h-8 rounded-md bg-rose-500 text-white hover:bg-rose-400 font-bold flex items-center justify-center transition-colors">
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Booking Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Date & Time</span>
                <span className="font-bold text-white">{date ? `${date} at ${time || '--:--'}` : 'Not selected'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Guests</span>
                <span className="font-bold text-white">{partySize} People</span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t border-slate-800">
                <span className="text-slate-400">Pre-ordered Items</span>
                <span className="font-bold text-white">{Object.values(preOrderItems).reduce((a,b)=>a+b, 0)}</span>
              </div>
              {Object.keys(preOrderItems).length > 0 && (
                <div className="flex justify-between text-sm font-bold pt-3 border-t border-slate-800">
                  <span className="text-white">Total Value</span>
                  <span className="text-rose-400">₹{calculateTotal()}</span>
                </div>
              )}
            </div>
            
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors text-sm flex justify-between items-center px-4">
              Review Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-500 shrink-0" />
                <span className="text-sm text-slate-300">{MOCK_RESTAURANT.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-500 shrink-0" />
                <span className="text-sm text-slate-300">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-500 shrink-0" />
                <span className="text-sm text-slate-300">{MOCK_RESTAURANT.openTime} - {MOCK_RESTAURANT.closeTime}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
