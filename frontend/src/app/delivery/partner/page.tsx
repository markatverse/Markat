"use client";

import React, { useState } from 'react';
import { 
  Navigation, MapPin, Phone, ShieldCheck, CheckCircle2, 
  DollarSign, Clock, Store, User, ArrowRight, Zap, Check,
  ExternalLink, Sparkles, RefreshCw, PackageCheck, Bike,
  ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type DeliveryStage = 'ASSIGNED' | 'PICKED_UP' | 'ARRIVED' | 'DELIVERED';

export default function DeliveryPartnerPortalPage() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [stage, setStage] = useState<DeliveryStage>('ASSIGNED');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [todayEarnings, setTodayEarnings] = useState(1140);
  const [completedRuns, setCompletedRuns] = useState(14);
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  // Delivery task queue
  const tripQueue = [
    {
      orderId: 'ORD-9821',
      merchantName: 'Punjabi Zaika Kitchen',
      merchantPhone: '+91 98111 22334',
      merchantAddress: 'Shop 14, Main Market, Sector 18, Noida',
      customerName: 'Rahul Sharma',
      customerAddress: 'Flat 402, Tower B, Green Valley Heights, Sector 19, Noida',
      customerPhone: '+91 98765 43210',
      distanceKm: 2.8,
      estimatedMinutes: 14,
      orderItems: '2x Butter Chicken, 4x Butter Naan, 1x Dal Makhani',
      payoutAmount: 65,
      customerTip: 20,
      expectedOtp: '4821',
      itemsCount: 3
    },
    {
      orderId: 'ORD-9832',
      merchantName: 'Apna Fresh Mart Groceries',
      merchantPhone: '+91 98222 33445',
      merchantAddress: 'Plot 8, Atta Market, Sector 27, Noida',
      customerName: 'Priya Narang',
      customerAddress: 'House 112, Block C, Sector 26, Noida',
      customerPhone: '+91 98112 55432',
      distanceKm: 1.9,
      estimatedMinutes: 11,
      orderItems: 'Organic Milk 2L, Brown Eggs (12pk), Whole Wheat Bread',
      payoutAmount: 55,
      customerTip: 15,
      expectedOtp: '7192',
      itemsCount: 3
    },
    {
      orderId: 'ORD-9844',
      merchantName: 'Gupta Medical Hall',
      merchantPhone: '+91 98333 44556',
      merchantAddress: 'Central Market, Sector 50, Noida',
      customerName: 'Sanjay Rawat',
      customerAddress: 'B-62, Stellar Kings, Sector 62, Noida',
      customerPhone: '+91 97110 99881',
      distanceKm: 3.4,
      estimatedMinutes: 17,
      orderItems: 'Prescription Medicines & First Aid Kit',
      payoutAmount: 85,
      customerTip: 30,
      expectedOtp: '3381',
      itemsCount: 2
    }
  ];

  const [tripIndex, setTripIndex] = useState(0);
  const activeTrip = tripQueue[tripIndex];

  // Stage Transitions
  const handleConfirmPickup = () => {
    setStage('PICKED_UP');
  };

  const handleArrivedAtCustomer = () => {
    setStage('ARRIVED');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (otpInput === activeTrip.expectedOtp || otpInput === '1234') {
      setStage('DELIVERED');
      setTodayEarnings(prev => prev + activeTrip.payoutAmount + activeTrip.customerTip);
      setCompletedRuns(prev => prev + 1);
      setOtpInput('');
    } else {
      setOtpError(`Invalid code. Please enter the 4-digit OTP provided by customer. (Demo code: ${activeTrip.expectedOtp} or 1234)`);
    }
  };

  const handleNextTrip = () => {
    setStage('ASSIGNED');
    setOtpInput('');
    setOtpError(null);
    setTripIndex((tripIndex + 1) % tripQueue.length);
  };

  const handleRequestPayout = () => {
    setPayoutRequested(true);
    setTimeout(() => {
      const utr = `UTR-UPI-${Date.now().toString().slice(-8)}`;
      setPayoutSuccessMsg(`₹${todayEarnings} transferred to linked UPI VPA. UTR: ${utr}`);
      setPayoutRequested(false);
      setTimeout(() => setPayoutSuccessMsg(null), 5000);
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Rider Header & Online Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Rider Partner Portal</h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Courier App
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Courier: <strong className="text-white">{user?.name || 'Vikas Kushwaha'}</strong> • Partner ID: <strong className="text-white font-mono">RID-8421</strong> • Vehicle: <strong>Ather 450X EV (UP16-CZ-8821)</strong>
          </p>
        </div>

        {/* Online / Offline Availability Switch */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-white/10">
          <span className={`text-xs font-bold ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isOnline ? 'ONLINE (Ready for Runs)' : 'OFFLINE'}
          </span>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              isOnline ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
            title="Toggle delivery availability"
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md" />
          </button>
        </div>
      </div>

      {payoutSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{payoutSuccessMsg}</span>
        </div>
      )}

      {/* Today's Earnings Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 relative group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Earnings</span>
            <button
              onClick={handleRequestPayout}
              disabled={payoutRequested || todayEarnings === 0}
              className="text-[9px] font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 px-2.5 py-1 rounded-full transition-colors"
            >
              Instant UPI Payout
            </button>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">₹{todayEarnings}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{completedRuns} completed trips today</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Tips</span>
          <div className="text-2xl font-black text-teal-400 mt-1 font-mono">₹{Math.round(todayEarnings * 0.16)}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">100% credited directly to rider</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Distance</span>
          <div className="text-2xl font-black text-white mt-1 font-mono">{(completedRuns * 2.7).toFixed(1)} km</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Eco-friendly EV Fleet</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rider Rating</span>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">4.95 ★</div>
          <span className="text-[11px] text-emerald-400 mt-0.5 block">Top Tier Courier</span>
        </div>
      </div>

      {/* Main Delivery Run Lifecycle Card */}
      <div className="bg-slate-900/80 rounded-3xl border border-emerald-500/30 p-6 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Top Header of the Run */}
        <div className="flex flex-wrap justify-between items-center gap-3 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Bike className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  {stage === 'ASSIGNED' && 'Stage 1: Pickup from Store'}
                  {stage === 'PICKED_UP' && 'Stage 2: Out for Delivery'}
                  {stage === 'ARRIVED' && 'Stage 3: Customer Handover & OTP'}
                  {stage === 'DELIVERED' && 'Delivered & Settled'}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">{activeTrip.distanceKm} km trip</span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">Order {activeTrip.orderId}</h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Trip Pay + Tip</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              ₹{activeTrip.payoutAmount + activeTrip.customerTip}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              (₹{activeTrip.payoutAmount} fare + ₹{activeTrip.customerTip} tip)
            </span>
          </div>
        </div>

        {/* 3-Step Visual Progress Bar */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {/* Step 1 */}
            <div className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
              stage === 'ASSIGNED'
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                {stage !== 'ASSIGNED' ? <Check className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                <span>1. Store Pickup</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {stage === 'ASSIGNED' ? 'Pending pickup' : 'Picked up'}
              </span>
            </div>

            {/* Step 2 */}
            <div className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
              stage === 'PICKED_UP'
                ? 'bg-amber-600/20 border-amber-500/40 text-amber-300'
                : stage === 'ARRIVED' || stage === 'DELIVERED'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900/40 border-white/5 text-slate-500'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                {stage === 'ARRIVED' || stage === 'DELIVERED' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span>2. In Transit</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {stage === 'ASSIGNED' ? 'Waiting pickup' : stage === 'PICKED_UP' ? 'En-route to customer' : 'Arrived at door'}
              </span>
            </div>

            {/* Step 3 */}
            <div className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
              stage === 'ARRIVED'
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                : stage === 'DELIVERED'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900/40 border-white/5 text-slate-500'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                {stage === 'DELIVERED' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>3. Delivery &amp; OTP</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {stage === 'DELIVERED' ? 'Verified & Paid' : '4-digit customer code'}
              </span>
            </div>
          </div>
        </div>

        {/* STAGE: DELIVERED SUCCESS STATE */}
        {stage === 'DELIVERED' ? (
          <div className="p-8 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-black flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-2xl font-black text-white">Order {activeTrip.orderId} Delivered!</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                OTP verified successfully. ₹{activeTrip.payoutAmount + activeTrip.customerTip} has been immediately credited to your rider balance.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleNextTrip}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] inline-flex items-center gap-2"
              >
                <span>Accept Next Assigned Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: Step Details (Pickup Store / Customer Drop) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* STAGE 1 HIGHLIGHT: Store Pickup Details */}
              <div className={`p-5 rounded-2xl border transition-all ${
                stage === 'ASSIGNED' 
                  ? 'bg-blue-950/40 border-blue-500/40 shadow-lg' 
                  : 'bg-slate-950/60 border-white/5 opacity-80'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider block">
                        Step 1: Merchant Pickup Location
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{activeTrip.merchantName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{activeTrip.merchantAddress}</p>
                    </div>
                  </div>

                  <a 
                    href={`tel:${activeTrip.merchantPhone}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Store</span>
                  </a>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div>
                    <strong className="text-slate-200">Package Items:</strong> {activeTrip.orderItems}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {activeTrip.itemsCount} units packed
                  </span>
                </div>

                {stage === 'ASSIGNED' && (
                  <div className="mt-4 pt-3 border-t border-blue-500/20">
                    <button
                      onClick={handleConfirmPickup}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Confirm Order Picked Up from Store</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                      Click once you receive and verify the sealed order package from the merchant.
                    </p>
                  </div>
                )}
              </div>

              {/* STAGE 2 HIGHLIGHT: Customer Destination & Live Routing */}
              <div className={`p-5 rounded-2xl border transition-all ${
                stage === 'PICKED_UP' || stage === 'ARRIVED'
                  ? 'bg-amber-950/30 border-amber-500/40 shadow-lg' 
                  : 'bg-slate-950/60 border-white/5 opacity-70'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
                        Step 2: Customer Delivery Address
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{activeTrip.customerName}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">{activeTrip.customerAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Customer communication & navigation links */}
                <div className="flex flex-wrap items-center gap-2.5 mt-4">
                  <a 
                    href={`tel:${activeTrip.customerPhone}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Customer ({activeTrip.customerPhone})</span>
                  </a>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeTrip.customerAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Turn-by-Turn GPS Map</span>
                  </a>
                </div>

                {stage === 'PICKED_UP' && (
                  <div className="mt-4 pt-3 border-t border-amber-500/20">
                    <button
                      onClick={handleArrivedAtCustomer}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)]"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>I Have Arrived at Customer Doorstep</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                      Notify customer and prepare for 4-digit OTP handover.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Right 5 Columns: Stage 3 OTP Verification Action Box */}
            <div className="lg:col-span-5 bg-slate-950/80 p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-black uppercase tracking-wider text-white">
                  Step 3: Secure Delivery OTP
                </h4>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                When you hand over the order to <strong>{activeTrip.customerName}</strong>, ask them for the 4-digit drop-off verification code shown on their MarkatVerse app or SMS.
              </p>

              {otpError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Customer 4-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="• • • •"
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value.replace(/\D/g, ''));
                      setOtpError(null);
                    }}
                    disabled={stage !== 'ARRIVED' && stage !== 'PICKED_UP'}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-3 text-2xl font-mono font-black tracking-widest text-center text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  />
                  <div className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1.5">
                    <span>Demo test OTP:</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {activeTrip.expectedOtp}
                    </span>
                    <span className="text-slate-500">(or 1234)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isOnline || otpInput.length < 4}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify OTP &amp; Complete Delivery</span>
                </button>
              </form>

              {/* Developer / Demo Quick Stage Jumper */}
              <div className="pt-4 border-t border-white/5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Interactive Stage Switcher:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button 
                    onClick={() => setStage('ASSIGNED')}
                    className={`py-1 text-[10px] font-bold rounded border ${
                      stage === 'ASSIGNED' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    1. Pickup
                  </button>
                  <button 
                    onClick={() => setStage('PICKED_UP')}
                    className={`py-1 text-[10px] font-bold rounded border ${
                      stage === 'PICKED_UP' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    2. In Transit
                  </button>
                  <button 
                    onClick={() => setStage('ARRIVED')}
                    className={`py-1 text-[10px] font-bold rounded border ${
                      stage === 'ARRIVED' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    3. At Door
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
