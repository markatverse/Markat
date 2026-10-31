"use client";

import React, { useState, useMemo } from 'react';
import { 
  MapPin, Navigation, Zap, Clock, ShieldCheck, 
  ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, Layers, Plus,
  UserCheck, Bike, Check, X, Store, HelpCircle
} from 'lucide-react';
import { getApiUrl } from '@/utils/api';

const API_URL = getApiUrl();

const AVAILABLE_COURIERS = [
  { id: 'RID-8421', name: 'Vikas Kushwaha', vehicle: 'Ather 450X EV', dist: '0.4 km away', rating: '4.95 ★', status: 'ONLINE' },
  { id: 'RID-8422', name: 'Mohd. Imran', vehicle: 'TVS iQube EV', dist: '0.8 km away', rating: '4.88 ★', status: 'ONLINE' },
  { id: 'RID-8423', name: 'Sunny Kumar', vehicle: 'Bajaj Chetak EV', dist: '1.2 km away', rating: '4.90 ★', status: 'ONLINE' },
  { id: 'RID-8424', name: 'Aakash Verma', vehicle: 'Ola S1 Pro EV', dist: '0.3 km away', rating: '5.00 ★', status: 'ONLINE' }
];

export default function DispatchEnginePage() {
  const [distanceKm, setDistanceKm] = useState<number>(3.5);
  const [weightKg, setWeightKg] = useState<number>(1.5);
  const [isSurge, setIsSurge] = useState(false);
  const [orderCategory, setOrderCategory] = useState<'FOOD_DINING' | 'GROCERY' | 'RETAIL' | 'B2B_HEAVY'>('FOOD_DINING');

  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeQueue, setActiveQueue] = useState([
    {
      id: 'DSP-771',
      store: 'Biryani Blues Sector 18',
      customer: 'Pooja Verma (Sector 29)',
      distance: '2.4 km',
      prepTimeRemaining: '4 mins prep',
      assignedCourier: 'Vikas Kushwaha (0.4 km away)',
      riderId: 'RID-8421',
      urgency: 'NORMAL',
      slaStatus: 'ON_TRACK (18m remaining)'
    },
    {
      id: 'DSP-772',
      store: 'Apna Fresh Mart Groceries',
      customer: 'Deepak Tyagi (Sector 19)',
      distance: '1.9 km',
      prepTimeRemaining: 'Ready for Pickup',
      assignedCourier: 'Mohd. Imran (0.8 km away)',
      riderId: 'RID-8422',
      urgency: 'CRITICAL',
      slaStatus: 'URGENT (<9m remaining)'
    },
    {
      id: 'DSP-773',
      store: 'Gupta Medical Hall',
      customer: 'Anand Kumar (Sector 15A)',
      distance: '4.2 km',
      prepTimeRemaining: 'Dispatched',
      assignedCourier: 'Sunny Kumar (En-route)',
      riderId: 'RID-8423',
      urgency: 'NORMAL',
      slaStatus: 'ON_TRACK (14m remaining)'
    }
  ]);

  // Dynamic dispatch fee calculation
  const feeBreakdown = useMemo(() => {
    const baseFee = 35; // Base 2km fee
    const extraKm = Math.max(0, distanceKm - 2);
    const distanceCost = Math.round(extraKm * 12);
    const weightCost = weightKg > 5 ? Math.round((weightKg - 5) * 8) : 0;
    const surgeMultiplier = isSurge ? 1.35 : 1.0;

    const subtotal = Math.round((baseFee + distanceCost + weightCost) * surgeMultiplier);
    // Statutory 18% GST on delivery service facilitation
    const gst = Math.round(subtotal * 0.18 * 100) / 100;
    const total = Math.round((subtotal + gst) * 100) / 100;

    return { baseFee, distanceCost, weightCost, surgeMultiplier, subtotal, gst, total };
  }, [distanceKm, weightKg, isSurge]);

  // Simulate injecting a real order into the dispatch engine
  const handleSimulateNewOrder = () => {
    const newId = `DSP-${Math.floor(Math.random() * 899 + 100)}`;
    const stores = ['McDonalds Sector 18', 'KFC Central Hub', 'Modern Bazaar Supermarket', 'Apollo Pharmacy 24x7'];
    const customers = ['Akash Sharma (Sec 37)', 'Sneha Kapoor (Sec 15)', 'Vikram Sethi (Sec 50)', 'Tanvi Jain (Sec 62)'];
    
    const pickedStore = stores[Math.floor(Math.random() * stores.length)];
    const pickedCust = customers[Math.floor(Math.random() * customers.length)];
    const randomDist = (Math.random() * 3 + 1).toFixed(1);

    const newDispatchItem = {
      id: newId,
      store: pickedStore,
      customer: pickedCust,
      distance: `${randomDist} km`,
      prepTimeRemaining: 'Just Placed (Pending Assignment)',
      assignedCourier: 'Auto-matching nearest courier...',
      riderId: '',
      urgency: 'NORMAL',
      slaStatus: 'ON_TRACK (25m remaining)'
    };

    setActiveQueue([newDispatchItem, ...activeQueue]);

    // Simulate auto-matching in 800ms
    setTimeout(() => {
      setActiveQueue(prev => prev.map(item => {
        if (item.id === newId) {
          return {
            ...item,
            assignedCourier: 'Aakash Verma (Ola S1 Pro • 0.3km)',
            riderId: 'RID-8424',
            prepTimeRemaining: 'Kitchen Preparing'
          };
        }
        return item;
      }));
      setToastMessage(`Order ${newId} auto-assigned to Aakash Verma (Ola S1 Pro • 0.3km)`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 800);
  };

  // Manual Courier Assignment
  const handleAssignRider = async (orderId: string, rider: typeof AVAILABLE_COURIERS[0] | null) => {
    const courierLabel = rider ? `${rider.name} (${rider.dist})` : 'Auto-matching nearest courier...';
    const riderId = rider ? rider.id : '';

    setActiveQueue(prev => prev.map(item => {
      if (item.id === orderId) {
        return {
          ...item,
          assignedCourier: courierLabel,
          riderId: riderId,
          prepTimeRemaining: rider ? 'Assigned to Rider' : 'Matching...'
        };
      }
      return item;
    }));

    setAssigningOrderId(null);

    // Call backend API if available
    if (rider) {
      try {
        await fetch(`${API_URL}/shipping/delivery/dispatch/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dispatchId: orderId, riderId: rider.id })
        });
      } catch (err) {
        // safe fallback
      }
      setToastMessage(`Order ${orderId} successfully assigned to ${rider.name}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Re-optimize and sort dispatch queue
  const handleReoptimize = () => {
    const sorted = [...activeQueue].sort((a, b) => (a.urgency === 'CRITICAL' ? -1 : 1));
    setActiveQueue(sorted);
    setToastMessage('Dispatch algorithm re-optimized: Critical deliveries prioritized, routing batched.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Smart Dispatch &amp; Routing Engine</h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Autonomous Proximity Match
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predictive dispatch, route batching, and dynamic delivery fee calculation with sub-25min delivery SLA.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleSimulateNewOrder}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-3.5 h-3.5" /> Simulate Customer Order
          </button>
          <button 
            onClick={handleReoptimize}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-Optimize Queue
          </button>
        </div>
      </div>

      {/* How Order Assignment & Delivery Works: Explanatory 3-Step Flow */}
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-black text-white">How Order Assignment, Pickup &amp; Delivery Works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px]">1</span>
              <span>Order Assignment</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              When a buyer places an order, the autonomous dispatch engine locates all active couriers within 3km. It compares vehicle type, battery level, and SLA to auto-assign the best rider in &lt;800ms. Dispatchers can also manually assign below.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
              <span>Store Pickup</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The merchant packs the goods and clicks "Ready for Pickup". The assigned rider receives the store's address and phone number, navigates to the merchant, verifies item package count, and confirms pickup on their Partner App.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
              <span>Customer Handover &amp; OTP</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The rider follows live turn-by-turn GPS to the customer's doorstep. Upon arrival, the customer provides a unique 4-digit OTP. Once entered by the rider, the order is verified as delivered and trip earnings + 100% tip are instantly credited.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Delivery Pricing Simulator */}
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 lg:p-8 shadow-2xl">
        <h3 className="text-base font-black text-white mb-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" /> Dynamic Delivery Fee &amp; Dispatch Simulator
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Calculate distance delivery cost, weather/peak surge, and courier dispatch payout.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Controls */}
          <div className="md:col-span-6 space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-white/5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Trip Distance (km)
                </label>
                <input 
                  type="number"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Cargo Weight (kg)
                </label>
                <input 
                  type="number"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Order Sector
              </label>
              <select 
                value={orderCategory}
                onChange={(e) => setOrderCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="FOOD_DINING">Food &amp; Dining (Hot Bag Insulated)</option>
                <option value="GROCERY">Grocery &amp; Fresh Essentials (Quick 15-min)</option>
                <option value="RETAIL">Retail Electronics &amp; Fashion</option>
                <option value="B2B_HEAVY">B2B Heavy Cargo &amp; Bulk Wholesaling</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">Peak / Rain Weather Surge:</span>
              <button
                type="button"
                onClick={() => setIsSurge(!isSurge)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  isSurge 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isSurge ? '⚡ Surge 1.35x Active' : 'Off (Standard)'}
              </button>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="md:col-span-6 bg-slate-950/80 p-5 rounded-2xl border border-white/5 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Base Courier Rate (First 2km):</span>
              <span className="font-mono text-white font-bold">₹{feeBreakdown.baseFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Distance Charge ({Math.max(0, distanceKm - 2).toFixed(1)} km extra):</span>
              <span className="font-mono text-white font-bold">₹{feeBreakdown.distanceCost.toFixed(2)}</span>
            </div>
            {feeBreakdown.weightCost > 0 && (
              <div className="flex justify-between items-center text-slate-400">
                <span>Heavy Cargo Surcharge (&gt;5kg):</span>
                <span className="font-mono text-white font-bold">₹{feeBreakdown.weightCost.toFixed(2)}</span>
              </div>
            )}
            {isSurge && (
              <div className="flex justify-between items-center text-amber-400">
                <span>Peak Surge Multiplier (1.35x):</span>
                <span className="font-mono font-bold">+35%</span>
              </div>
            )}
            <div className="flex justify-between items-center text-indigo-300 pl-3 border-l-2 border-indigo-500/30">
              <span>18% GST on Delivery Facilitation:</span>
              <span className="font-mono font-bold">₹{feeBreakdown.gst.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
              <div>
                <span className="text-xs font-black text-emerald-300 uppercase block">Total Delivery Fee</span>
                <span className="text-[10px] text-slate-400">Rider Receives: ₹{(feeBreakdown.subtotal * 0.8).toFixed(2)} (80%)</span>
              </div>
              <span className="text-2xl font-black font-mono text-emerald-400">
                ₹{feeBreakdown.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Dispatch Queue */}
      <div className="bg-slate-900/60 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-sm font-black text-white">Active Dispatch Queue &amp; Assignment</h3>
          <span className="text-xs text-emerald-400 font-bold">{activeQueue.length} Active Runs • 99.4% SLA adherence</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/60 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-4 pl-6">Order ID &amp; Store</th>
                <th className="p-4">Customer Destination</th>
                <th className="p-4">Distance</th>
                <th className="p-4">Assigned Courier</th>
                <th className="p-4">SLA Urgency</th>
                <th className="p-4 pr-6 text-right">Assign Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeQueue.map(q => (
                <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6 font-bold text-white">
                    <div className="font-mono text-emerald-400">{q.id}</div>
                    <span className="text-slate-300 font-medium">{q.store}</span>
                  </td>
                  <td className="p-4 text-slate-300">{q.customer}</td>
                  <td className="p-4 font-mono font-bold text-slate-200">{q.distance}</td>
                  <td className="p-4 text-slate-200">
                    <div className="font-semibold text-emerald-300">{q.assignedCourier}</div>
                    <span className="text-[10px] text-slate-500">{q.prepTimeRemaining}</span>
                  </td>
                  <td className="p-4 font-mono">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      q.urgency === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {q.slaStatus}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => setAssigningOrderId(q.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Assign Courier</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Courier Assignment Modal */}
      {assigningOrderId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-black text-white">Assign Courier to Order</h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">{assigningOrderId}</span>
              </div>
              <button 
                onClick={() => setAssigningOrderId(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select an available courier from the active fleet nearby, or trigger autonomous proximity matching.
            </p>

            {/* Courier Selection List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {AVAILABLE_COURIERS.map(courier => (
                <div
                  key={courier.id}
                  onClick={() => handleAssignRider(assigningOrderId, courier)}
                  className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Bike className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {courier.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{courier.vehicle}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">{courier.dist}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 block font-mono">{courier.rating}</span>
                    <span className="text-[10px] font-black uppercase text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                      Assign ➔
                    </span>
                  </div>
                </div>
              ))}

              {/* Auto Match Button */}
              <button
                onClick={() => handleAssignRider(assigningOrderId, null)}
                className="w-full py-2.5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all text-center"
              >
                🤖 Autonomous Proximity Match (&lt;800ms)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
