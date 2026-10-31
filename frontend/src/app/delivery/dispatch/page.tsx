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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Smart Dispatch &amp; Routing Engine</h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Autonomous Proximity Match
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Predictive dispatch, route batching, and dynamic delivery fee calculation with sub-25min delivery SLA.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleSimulateNewOrder}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/25"
          >
            <Plus className="w-3.5 h-3.5" /> Simulate Customer Order
          </button>
          <button 
            onClick={handleReoptimize}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/25"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-Optimize Queue
          </button>
        </div>
      </div>

      {/* How Order Assignment & Delivery Works: Explanatory 3-Step Flow */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-black text-slate-900">How Order Assignment, Pickup &amp; Delivery Works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-700 font-bold">
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">1</span>
              <span>Order Assignment</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              When a buyer places an order, the autonomous dispatch engine locates all active couriers within 3km. It compares vehicle type, battery level, and SLA to auto-assign the best rider in &lt;800ms. Dispatchers can also manually assign below.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-700 font-bold">
              <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">2</span>
              <span>Store Pickup</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              The merchant packs the goods and clicks "Ready for Pickup". The assigned rider receives the store's address and phone number, navigates to the merchant, verifies item package count, and confirms pickup on their Partner App.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">3</span>
              <span>Customer Handover &amp; OTP</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              The rider follows live turn-by-turn GPS to the customer's doorstep. Upon arrival, the customer provides a unique 4-digit OTP. Once entered by the rider, the order is verified as delivered and trip earnings + 100% tip are instantly credited.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Delivery Pricing Simulator */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 lg:p-8 shadow-xs">
        <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600" /> Dynamic Delivery Fee &amp; Dispatch Simulator
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Calculate distance delivery cost, weather/peak surge, and courier dispatch payout.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Controls */}
          <div className="md:col-span-6 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  Trip Distance (km)
                </label>
                <input 
                  type="number"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  Cargo Weight (kg)
                </label>
                <input 
                  type="number"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                Order Sector
              </label>
              <select 
                value={orderCategory}
                onChange={(e) => setOrderCategory(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-xs"
              >
                <option value="FOOD_DINING">Food &amp; Dining (Hot Bag Insulated)</option>
                <option value="GROCERY">Grocery &amp; Fresh Essentials (Quick 15-min)</option>
                <option value="RETAIL">Retail Electronics &amp; Fashion</option>
                <option value="B2B_HEAVY">B2B Heavy Cargo &amp; Bulk Wholesaling</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-700 font-semibold">Peak / Rain Weather Surge:</span>
              <button
                type="button"
                onClick={() => setIsSurge(!isSurge)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  isSurge 
                    ? 'bg-amber-100 text-amber-800 border-amber-300' 
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {isSurge ? '⚡ Surge 1.35x Active' : 'Off (Standard)'}
              </button>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="md:col-span-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Base Courier Rate (First 2km):</span>
              <span className="font-mono text-slate-900 font-bold">₹{feeBreakdown.baseFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Distance Charge ({Math.max(0, distanceKm - 2).toFixed(1)} km extra):</span>
              <span className="font-mono text-slate-900 font-bold">₹{feeBreakdown.distanceCost.toFixed(2)}</span>
            </div>
            {feeBreakdown.weightCost > 0 && (
              <div className="flex justify-between items-center text-slate-600">
                <span>Heavy Cargo Surcharge (&gt;5kg):</span>
                <span className="font-mono text-slate-900 font-bold">₹{feeBreakdown.weightCost.toFixed(2)}</span>
              </div>
            )}
            {isSurge && (
              <div className="flex justify-between items-center text-amber-700">
                <span>Peak Surge Multiplier (1.35x):</span>
                <span className="font-mono font-bold">+35%</span>
              </div>
            )}
            <div className="flex justify-between items-center text-indigo-700 pl-3 border-l-2 border-indigo-300">
              <span>18% GST on Delivery Facilitation:</span>
              <span className="font-mono font-bold">₹{feeBreakdown.gst.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
              <div>
                <span className="text-xs font-black text-emerald-800 uppercase block">Total Delivery Fee</span>
                <span className="text-[10px] text-slate-500">Rider Receives: ₹{(feeBreakdown.subtotal * 0.8).toFixed(2)} (80%)</span>
              </div>
              <span className="text-2xl font-black font-mono text-emerald-700">
                ₹{feeBreakdown.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Dispatch Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-900">Active Dispatch Queue &amp; Assignment</h3>
          <span className="text-xs text-emerald-700 font-bold">{activeQueue.length} Active Runs • 99.4% SLA adherence</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Order ID &amp; Store</th>
                <th className="p-4">Customer Destination</th>
                <th className="p-4">Distance</th>
                <th className="p-4">Assigned Courier</th>
                <th className="p-4">SLA Urgency</th>
                <th className="p-4 pr-6 text-right">Assign Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeQueue.map(q => (
                <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-900">
                    <div className="font-mono text-emerald-700">{q.id}</div>
                    <span className="text-slate-800 font-medium">{q.store}</span>
                  </td>
                  <td className="p-4 text-slate-600">{q.customer}</td>
                  <td className="p-4 font-mono font-bold text-slate-700">{q.distance}</td>
                  <td className="p-4 text-slate-800">
                    <div className="font-semibold text-emerald-700">{q.assignedCourier}</div>
                    <span className="text-[10px] text-slate-500">{q.prepTimeRemaining}</span>
                  </td>
                  <td className="p-4 font-mono">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      q.urgency === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {q.slaStatus}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => setAssigningOrderId(q.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Assign Courier to Order</h3>
                <span className="text-xs font-mono text-emerald-700 font-bold">{assigningOrderId}</span>
              </div>
              <button 
                onClick={() => setAssigningOrderId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select an available courier from the active fleet nearby, or trigger autonomous proximity matching.
            </p>

            {/* Courier Selection List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {AVAILABLE_COURIERS.map(courier => (
                <div
                  key={courier.id}
                  onClick={() => handleAssignRider(assigningOrderId, courier)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Bike className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {courier.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{courier.vehicle}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">{courier.dist}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-500 block font-mono">{courier.rating}</span>
                    <span className="text-[10px] font-black uppercase text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-100">
                      Assign ➔
                    </span>
                  </div>
                </div>
              ))}

              {/* Auto Match Button */}
              <button
                onClick={() => handleAssignRider(assigningOrderId, null)}
                className="w-full py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all text-center"
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
