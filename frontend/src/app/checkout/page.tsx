"use client";
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  CheckCircle2, 
  Lock, 
  Package, 
  ArrowRight, 
  ShieldCheck, 
  ChevronLeft,
  Truck,
  Shield,
  HelpCircle,
  Phone,
  RefreshCw,
  Plus
} from 'lucide-react';
import MockPaymentGateway from '@/components/MockPaymentGateway';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { getApiUrl } from '@/utils/api';

type Address = {
  id: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  pinCode: string;
  phone: string;
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [confirmedOrder, setConfirmedOrder] = useState<{ id: string; amount: number; paymentRef?: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [phone, setPhone] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [isFetchingPin, setIsFetchingPin] = useState(false);

  const handleAutoFetchLocation = () => {
    if (navigator.geolocation) {
      setIsFetchingPin(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          if (data) {
            const cityName = data.city || data.locality || data.principalSubdivision;
            const newPin = data.postcode || '';
            if (newPin) setPinCode(newPin);
            setCity(`${cityName}, ${data.principalSubdivision || ''}`);
            toast.success("Location fetched automatically!");
          }
        } catch {
          toast.error("Failed to fetch location");
        } finally {
          setIsFetchingPin(false);
        }
      }, () => {
        toast.error("Location permission denied");
        setIsFetchingPin(false);
      }, { enableHighAccuracy: true });
    } else {
      toast.error("Geolocation not supported by this browser.");
    }
  };

  // Address Selection States
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [editAddressId, setEditAddressId] = useState<string | null>(null);

  React.useEffect(() => {
    try {
      const savedArr = localStorage.getItem('markatverse_saved_addresses');
      const legacySaved = localStorage.getItem('markatverse_checkout_details');
      
      let addressesToLoad: Address[] = [];
      
      if (savedArr) {
        addressesToLoad = JSON.parse(savedArr);
      } else if (legacySaved) {
        const details = JSON.parse(legacySaved);
        if (details.firstName) {
          addressesToLoad = [{ ...details, id: '1' }];
          localStorage.setItem('markatverse_saved_addresses', JSON.stringify(addressesToLoad));
        }
      }

      if (addressesToLoad.length > 0) {
        setSavedAddresses(addressesToLoad);
        setSelectedAddressId(addressesToLoad[0].id);
        const first = addressesToLoad[0];
        setFirstName(first.firstName || '');
        setLastName(first.lastName || '');
        setStreet(first.street || '');
        setCity(first.city || '');
        setPinCode(first.pinCode || '');
        setPhone(first.phone || '');
        setShowAddressForm(false);
      } else {
        setShowAddressForm(true);
        if (user) {
          if (user.name) {
            const names = user.name.split(' ');
            setFirstName(names[0] || '');
            setLastName(names.slice(1).join(' ') || '');
          }
          if (user.phone) setPhone(user.phone);
        }
      }
    } catch (e) {
      console.error('Could not load checkout details', e);
      setShowAddressForm(true);
    }
  }, [user]);

  React.useEffect(() => {
    if (pinCode.length === 6) {
      setIsFetchingPin(true);
      fetch(`https://api.postalpincode.in/pincode/${pinCode}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].Status === 'Success') {
            const fetchedAreas = data[0].PostOffice.map((po: any) => po.Name);
            setAreas(fetchedAreas);
            const state = data[0].PostOffice[0].State;
            const district = data[0].PostOffice[0].District;
            setCity(`${district}, ${state}`);
          } else {
            setAreas([]);
          }
        })
        .catch(() => setAreas([]))
        .finally(() => setIsFetchingPin(false));
    } else {
      setAreas([]);
    }
  }, [pinCode]);

  const isPhoneValid = phone.length === 10;
  const isFormValid = Boolean(firstName && lastName && street && city && pinCode.length === 6 && isPhoneValid);

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Cart is Empty</h2>
          <p className="text-slate-500 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
          <Link href="/">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/20 cursor-pointer">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePaymentSuccess = async (paymentDetails?: { paymentRef: string; method: string }) => {
    const generatedOrderId = `MKV-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderData = {
      id: generatedOrderId,
      amount: total,
      paymentRef: paymentDetails?.paymentRef || `MV-PAY-${Date.now().toString().slice(-6)}`
    };

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: generatedOrderId,
          buyerId: user?.id || 'guest',
          total: total,
          paymentRef: orderData.paymentRef,
          paymentMethod: paymentDetails?.method || paymentMethod,
          shippingAddress: {
            name: `${firstName} ${lastName}`.trim(),
            street,
            city,
            pinCode,
            phone
          },
          items: items.map(item => ({
            productId: String(item.id),
            productName: item.name,
            sellerId: item.sellerId || 'guest-seller',
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      if (res.ok) {
        const created = await res.json();
        if (created?.orderNumber) {
          orderData.id = created.orderNumber;
        }
      }
    } catch (e) {
      console.warn('Backend order sync warning:', e);
    }
    
    setConfirmedOrder(orderData);
    setStep(3);
    clearCart();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      
      {/* 1. DEDICATED DISTRACTION-FREE SECURE CHECKOUT HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand & Security Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group" title="Return to Marketplace">
              <picture>
                <source srcSet="/logo-optimized.webp" type="image/webp" />
                <img 
                  src="/logo.png" 
                  alt="MarkatVerse" 
                  className="h-9 sm:h-11 w-auto object-contain hover:opacity-95 transition-opacity" 
                />
              </picture>
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Secure Checkout</span>
            </div>
          </div>

          {/* Stepper (Desktop View) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Step 1 */}
            <div 
              onClick={() => step > 1 && setStep(1)}
              className={`flex items-center gap-2 ${step > 1 ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step > 1 ? 'bg-emerald-600 text-white' : step === 1 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <span className={`text-xs font-bold ${step === 1 ? 'text-blue-600' : step > 1 ? 'text-slate-700' : 'text-slate-400'}`}>
                Delivery
              </span>
            </div>

            <div className={`w-8 lg:w-12 h-0.5 rounded transition-colors ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step > 2 ? 'bg-emerald-600 text-white' : step === 2 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </div>
              <span className={`text-xs font-bold ${step === 2 ? 'text-blue-600' : step > 2 ? 'text-slate-700' : 'text-slate-400'}`}>
                Payment
              </span>
            </div>

            <div className={`w-8 lg:w-12 h-0.5 rounded transition-colors ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === 3 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-100 text-slate-400'
              }`}>
                3
              </div>
              <span className={`text-xs font-bold ${step === 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
                Confirmation
              </span>
            </div>
          </div>

          {/* Right Trust & User Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank-Grade Protection</span>
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-end">
                <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit SSL Encrypted
              </span>
            </div>
            {user && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {user.name?.split(' ')[0] || 'My Account'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Verified Buyer</div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Mobile Stepper Banner */}
        <div className="md:hidden bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-600">
          <div 
            onClick={() => step > 1 && setStep(1)}
            className={`flex items-center gap-1.5 ${step === 1 ? 'text-blue-600' : step > 1 ? 'text-slate-700 cursor-pointer' : 'text-slate-400'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step > 1 ? 'bg-emerald-600 text-white' : step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'
            }`}>
              {step > 1 ? '✓' : '1'}
            </span>
            <span>Delivery</span>
          </div>
          <div className={`w-6 h-0.5 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-blue-600' : step > 2 ? 'text-slate-700' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step > 2 ? 'bg-emerald-600 text-white' : step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'
            }`}>
              {step > 2 ? '✓' : '2'}
            </span>
            <span>Payment</span>
          </div>
          <div className={`w-6 h-0.5 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200'
            }`}>
              3
            </span>
            <span>Confirm</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN CHECKOUT BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {step < 3 && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Column: Form / Payment Gateway */}
            <div className="flex-1 w-full space-y-6">

              {/* STEP 1: DELIVERY ADDRESS */}
              {step === 1 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">Delivery Address</h2>
                        <p className="text-xs text-slate-500">Where should we deliver your order?</p>
                      </div>
                    </div>

                    {!showAddressForm && savedAddresses.length > 0 && (
                      <button 
                        type="button"
                        onClick={() => {
                          setFirstName('');
                          setLastName('');
                          setStreet('');
                          setCity('');
                          setPinCode('');
                          setPhone('');
                          setEditAddressId(null);
                          setShowAddressForm(true);
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New
                      </button>
                    )}
                  </div>
                  
                  {/* Saved Addresses List */}
                  {!showAddressForm && savedAddresses.length > 0 && (
                    <div className="space-y-3.5">
                      {savedAddresses.map(addr => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div 
                            key={addr.id} 
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setFirstName(addr.firstName);
                              setLastName(addr.lastName);
                              setStreet(addr.street);
                              setCity(addr.city);
                              setPinCode(addr.pinCode);
                              setPhone(addr.phone);
                            }}
                            className={`border-2 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer relative ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50/40 shadow-xs' 
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3.5">
                              <input 
                                type="radio" 
                                name="selected_address"
                                checked={isSelected} 
                                onChange={() => {}} 
                                className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                                    {addr.firstName} {addr.lastName}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFirstName(addr.firstName);
                                        setLastName(addr.lastName);
                                        setStreet(addr.street);
                                        setCity(addr.city);
                                        setPinCode(addr.pinCode);
                                        setPhone(addr.phone);
                                        setEditAddressId(addr.id);
                                        setShowAddressForm(true);
                                      }}
                                      className="text-blue-600 font-bold text-xs hover:underline cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </div>
                                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                  {addr.street}, {addr.city} - <span className="font-bold text-slate-800">{addr.pinCode}</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-2 font-medium">
                                  Contact: <span className="font-bold text-slate-700">+91 {addr.phone}</span>
                                </div>
                                
                                {isSelected && (
                                  <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                      Standard Delivery (Free)
                                    </span>
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFirstName(addr.firstName);
                                        setLastName(addr.lastName);
                                        setStreet(addr.street);
                                        setCity(addr.city);
                                        setPinCode(addr.pinCode);
                                        setPhone(addr.phone);
                                        setStep(2);
                                      }} 
                                      className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      Deliver to this Address <ArrowRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Address Input Form */}
                  {(showAddressForm || savedAddresses.length === 0) && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      {savedAddresses.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => setShowAddressForm(false)} 
                          className="text-slate-500 hover:text-slate-800 font-bold text-xs mb-2 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" /> Back to saved addresses
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name *</label>
                          <input 
                            type="text" 
                            value={firstName} 
                            onChange={e => setFirstName(e.target.value)} 
                            placeholder="e.g. Navneet"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name *</label>
                          <input 
                            type="text" 
                            value={lastName} 
                            onChange={e => setLastName(e.target.value)} 
                            placeholder="e.g. Kumar"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" 
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">PIN Code (6 digits) *</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              maxLength={6} 
                              value={pinCode} 
                              onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))} 
                              placeholder="e.g. 122001" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" 
                            />
                            {isFetchingPin && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">City & State *</label>
                            <button 
                              type="button" 
                              onClick={handleAutoFetchLocation} 
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md cursor-pointer"
                            >
                              📍 Auto Fetch GPS
                            </button>
                          </div>
                          <input 
                            type="text" 
                            value={city} 
                            onChange={e => setCity(e.target.value)} 
                            placeholder="e.g. Gurugram, Haryana" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" 
                          />
                        </div>
                      </div>

                      {areas.length > 0 && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Locality / Sector</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" 
                            onChange={e => {
                              const area = e.target.value;
                              setStreet(`${area}, ${street}`);
                            }}
                          >
                            <option value="">Choose Area</option>
                            {areas.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Flat, House no., Building, Street *</label>
                        <input 
                          type="text" 
                          value={street} 
                          onChange={e => setStreet(e.target.value)} 
                          placeholder="e.g. Tower 4, Flat 502, DLF Phase 3" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">10-Digit Mobile Number *</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                            <span className="text-slate-500 font-bold text-xs">+91</span>
                            <div className="w-px h-4 bg-slate-300"></div>
                          </div>
                          <input 
                            type="tel" 
                            maxLength={10} 
                            value={phone} 
                            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                            placeholder="9876543210" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-[3.8rem] text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" 
                          />
                        </div>
                        {phone && phone.length > 0 && phone.length !== 10 && (
                          <p className="text-xs text-rose-500 mt-1 font-medium">Please enter a valid 10-digit mobile number</p>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        {savedAddresses.length > 0 && (
                          <button 
                            type="button" 
                            onClick={() => setShowAddressForm(false)} 
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => {
                            let newAddresses = [...savedAddresses];
                            if (editAddressId) {
                              newAddresses = newAddresses.map(a => 
                                a.id === editAddressId ? { ...a, firstName, lastName, street, city, pinCode, phone } : a
                              );
                            } else {
                              const newAddr: Address = { id: Date.now().toString(), firstName, lastName, street, city, pinCode, phone };
                              newAddresses.push(newAddr);
                              setSelectedAddressId(newAddr.id);
                            }
                            
                            setSavedAddresses(newAddresses);
                            localStorage.setItem('markatverse_saved_addresses', JSON.stringify(newAddresses));
                            setStep(2);
                            setEditAddressId(null);
                            setShowAddressForm(false);
                          }}
                          disabled={!isFormValid}
                          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ml-auto"
                        >
                          Save & Proceed to Payment <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: AUTHORIZE PAYMENT */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  
                  {/* Delivery Address Summary Bar */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivering To</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                            Verified
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                          {firstName} {lastName} <span className="font-normal text-slate-500">(+91 {phone})</span>
                        </div>
                        <div className="text-xs text-slate-600 truncate max-w-sm sm:max-w-md">
                          {street}, {city} - <span className="font-semibold text-slate-800">{pinCode}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-end sm:self-center"
                    >
                      Change Address
                    </button>
                  </div>

                  {/* Payment Gateway Box */}
                  <MockPaymentGateway 
                    amount={total} 
                    items={items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity }))}
                    defaultMethod="upi"
                    customerDetails={{
                      name: `${firstName} ${lastName}`.trim() || user?.name || '',
                      email: user?.email || '',
                      phone: phone || ''
                    }}
                    inline={true}
                    onSuccess={handlePaymentSuccess} 
                    onCancel={() => setStep(1)} 
                  />
                </div>
              )}

            </div>

            {/* Right Column: Order Summary (Sticky) */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-800">Order Summary</h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {items.reduce((s, it) => s + it.quantity, 0)} items
                  </span>
                </div>
                
                {/* Items List */}
                <div className="space-y-3 my-4 max-h-[260px] overflow-y-auto pr-1">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={item.name}>
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-400">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Items Subtotal</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Delivery Charges</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Taxes (GST 18%)</span>
                    <span className="text-slate-500">Included</span>
                  </div>
                </div>

                {/* Total */}
                <div className="mt-4 pt-3.5 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Total Amount</span>
                    <span className="text-[10px] text-slate-400 font-medium">Includes all taxes</span>
                  </div>
                  <span className="text-2xl font-black text-blue-600">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
                
                {/* Security Reassurance */}
                <div className="mt-4 flex items-start gap-2.5 bg-emerald-50 text-emerald-800 p-3 rounded-2xl text-xs font-medium border border-emerald-200/50">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">Safe and secure payments. 100% authentic products backed by MarkatVerse Guarantee.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: ORDER CONFIRMATION */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 shadow-xs border border-slate-200 text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Order Confirmed!</h1>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 max-w-md mx-auto">
              Thank you for shopping with MarkatVerse. Your order has been placed successfully and will be dispatched shortly.
            </p>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 mb-6 text-left flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Order ID</span>
                <span className="font-extrabold font-mono text-slate-900 text-base">{confirmedOrder?.id || '#MKV-ORDER'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Payment Ref</span>
                <span className="font-mono text-xs text-slate-700 font-semibold">{confirmedOrder?.paymentRef || 'PAID'}</span>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100 flex flex-col md:flex-row gap-5">
              <div className="flex-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Shipping Destination</h4>
                <div className="font-bold text-slate-800 text-sm">{firstName} {lastName}</div>
                <div className="text-xs text-slate-600 mt-0.5">{street}</div>
                <div className="text-xs text-slate-600">{city} - {pinCode}</div>
              </div>
              <div className="hidden md:block w-px bg-slate-200"></div>
              <div className="flex-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estimated Delivery</h4>
                <div className="font-extrabold text-sm text-emerald-600 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" /> Arriving Tomorrow
                </div>
                <div className="text-xs text-slate-500 mt-0.5">By 9:00 PM Express Courier</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/">
                <button className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-xl transition-colors text-xs sm:text-sm cursor-pointer">
                  Continue Shopping
                </button>
              </Link>
              <Link href="/profile/orders">
                <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md shadow-blue-500/20 text-xs sm:text-sm cursor-pointer">
                  Track My Order
                </button>
              </Link>
            </div>
          </div>
        )}

      </main>

      {/* 3. MINIMAL TRUST FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted • PCI-DSS Compliant</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 font-semibold text-[11px]">
            <span>UPI</span> •
            <span>RuPay</span> •
            <span>Visa</span> •
            <span>MasterCard</span> •
            <span>NetBanking</span> •
            <span>Razorpay</span> •
            <span>Cash on Delivery</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            © {new Date().getFullYear()} MarkatVerse Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
