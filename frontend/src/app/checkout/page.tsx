"use client";
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, CheckCircle2, Lock, Package, ArrowRight, Smartphone, Banknote } from 'lucide-react';
import MockPaymentGateway from '@/components/MockPaymentGateway';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

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
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [showGateway, setShowGateway] = useState(false);

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
      }, (err) => {
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
  const isFormValid = firstName && lastName && street && city && pinCode.length === 6 && isPhoneValid;

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Cart is Empty</h2>
          <p className="text-slate-500 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
          <Link href="/">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePaymentSuccess = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user?.id || 'guest',
          total: total,
          items: items.map(item => ({
            productId: String(item.id),
            productName: item.name,
            sellerId: item.sellerId || 'guest-seller',
            quantity: item.quantity,
            price: item.price
          }))
        })
      });
    } catch (e) {
      console.error('Failed to create order', e);
    }
    setShowGateway(false);
    clearCart();
    setStep(3); // Success step
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Secure Checkout Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Lock className="w-5 h-5 text-emerald-500" />
          <h1 className="text-2xl font-bold text-slate-800">Secure Checkout</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center max-w-2xl mx-auto mb-10 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -z-10 rounded-full -translate-y-1/2 mx-12"></div>
          <div className={`absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 rounded-full -translate-y-1/2 mx-12 transition-all duration-500 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`}></div>
          
          <div className="flex justify-between w-full">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors shadow-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                {step > 1 ? <CheckCircle2 className="w-6 h-6" /> : '1'}
              </div>
              <span className={`text-xs font-bold ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>Shipping</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors shadow-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                {step > 2 ? <CheckCircle2 className="w-6 h-6" /> : '2'}
              </div>
              <span className={`text-xs font-bold ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>Payment</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors shadow-sm ${step >= 3 ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                {step === 3 ? <CheckCircle2 className="w-6 h-6" /> : '3'}
              </div>
              <span className={`text-xs font-bold ${step >= 3 ? 'text-emerald-500' : 'text-slate-400'}`}>Complete</span>
            </div>
          </div>
        </div>

        {step < 3 && (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Form */}
            <div className="flex-[2] animate-in slide-in-from-right-4 fade-in duration-300">
              
              {step === 1 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" /> Delivery Address
                  </h2>
                  
                  {!showAddressForm && savedAddresses.length > 0 && (
                    <div className="space-y-4">
                      {savedAddresses.map(addr => (
                        <label key={addr.id} className={`block cursor-pointer border-2 rounded-2xl p-4 transition-all ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-200'}`}>
                          <div className="flex items-start gap-4">
                            <input type="radio" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500" />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div className="font-bold text-slate-800">{addr.firstName} {addr.lastName}</div>
                                {selectedAddressId === addr.id && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setFirstName(addr.firstName);
                                      setLastName(addr.lastName);
                                      setStreet(addr.street);
                                      setCity(addr.city);
                                      setPinCode(addr.pinCode);
                                      setPhone(addr.phone);
                                      setEditAddressId(addr.id);
                                      setShowAddressForm(true);
                                    }}
                                    className="text-blue-600 font-semibold text-sm hover:underline"
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                              <div className="text-sm text-slate-600 mt-1 leading-relaxed">{addr.street},<br/>{addr.city} - <span className="font-bold">{addr.pinCode}</span></div>
                              <div className="text-sm font-medium text-slate-700 mt-2">Mobile: <span className="font-bold">{addr.phone}</span></div>
                              
                              {selectedAddressId === addr.id && (
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setFirstName(addr.firstName);
                                    setLastName(addr.lastName);
                                    setStreet(addr.street);
                                    setCity(addr.city);
                                    setPinCode(addr.pinCode);
                                    setPhone(addr.phone);
                                    setStep(2);
                                  }} 
                                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                                >
                                  Deliver Here <ArrowRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                      <button 
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
                        className="w-full border-2 border-dashed border-slate-300 text-blue-600 font-bold py-4 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        + Add a New Address
                      </button>
                    </div>
                  )}
                  
                  {(showAddressForm || savedAddresses.length === 0) && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      {savedAddresses.length > 0 && (
                        <button onClick={() => setShowAddressForm(false)} className="text-slate-500 hover:text-slate-800 font-bold text-sm mb-2 flex items-center gap-1 transition-colors">
                          ← Back to saved addresses
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Postal Code (PIN)</label>
                        <div className="relative">
                          <input type="text" maxLength={6} value={pinCode} onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 560001" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                          {isFetchingPin && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">City & State</label>
                          <button type="button" onClick={handleAutoFetchLocation} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
                            📍 Auto Fetch Location
                          </button>
                        </div>
                        <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Bengaluru, Karnataka" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                      </div>
                    </div>

                    {areas.length > 0 && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Area / Locality</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" onChange={e => {
                          const area = e.target.value;
                          setStreet(`${area}, ${street}`);
                        }}>
                          {areas.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Street Address</label>
                      <input type="text" value={street} onChange={e => setStreet(e.target.value)} placeholder="e.g. 123 Tech Park, Phase 2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                          <span className="text-slate-500 font-medium">+91</span>
                          <div className="w-px h-5 bg-slate-200 mx-1"></div>
                        </div>
                        <input type="tel" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="9876543210" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-[4.5rem] text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                      </div>
                      {phone && phone.length > 0 && phone.length !== 10 && (
                        <p className="text-xs text-red-500 mt-1">Phone number must be 10 digits</p>
                      )}
                    </div>
                  </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={() => {
                        let newAddresses = [...savedAddresses];
                        if (editAddressId) {
                          newAddresses = newAddresses.map(a => 
                            a.id === editAddressId ? { ...a, firstName, lastName, street, city, pinCode, phone } : a
                          );
                        } else {
                          const newAddr: Address = { id: Date.now().toString(), firstName, lastName, street, city, pinCode, phone };
                          newAddresses.push(newAddr);
                        }
                        
                        setSavedAddresses(newAddresses);
                        localStorage.setItem('markatverse_saved_addresses', JSON.stringify(newAddresses));
                        setStep(2);
                        setEditAddressId(null);
                        setShowAddressForm(false);
                      }}
                      disabled={!isFormValid}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save and Deliver Here <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" /> Payment Method
                  </h2>

                  <div className="space-y-4">
                    {/* Card Option */}
                    <label className={`block cursor-pointer border-2 rounded-2xl p-4 transition-all ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-200'}`}>
                      <div className="flex items-center gap-4">
                        <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                        <div className="flex-1 flex justify-between items-center">
                          <span className="font-bold text-slate-800">Credit / Debit Card</span>
                          <CreditCard className="w-6 h-6 text-slate-400" />
                        </div>
                      </div>
                      
                      {paymentMethod === 'card' && (
                        <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                          <div>
                            <input type="text" placeholder="Card Number" defaultValue="4111 1111 1111 1111" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="MM/YY" defaultValue="12/28" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                            <input type="password" placeholder="CVV" defaultValue="123" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                          </div>
                        </div>
                      )}
                    </label>

                    {/* UPI Option */}
                    <label className={`block cursor-pointer border-2 rounded-2xl p-4 transition-all ${paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-200'}`}>
                      <div className="flex items-center gap-4">
                        <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                        <div className="flex-1 flex justify-between items-center">
                          <span className="font-bold text-slate-800">UPI (GPay, PhonePe, Paytm)</span>
                          <Smartphone className="w-6 h-6 text-slate-400" />
                        </div>
                      </div>
                      {paymentMethod === 'upi' && (
                        <div className="mt-6 animate-in slide-in-from-top-2 fade-in duration-200">
                          <input type="text" placeholder="Enter UPI ID (e.g., amit@okaxis)" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                        </div>
                      )}
                    </label>

                    {/* Net Banking */}
                    <label className={`block cursor-pointer border-2 rounded-2xl p-4 transition-all ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-200'}`}>
                      <div className="flex items-center gap-4">
                        <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                        <div className="flex-1 flex justify-between items-center">
                          <span className="font-bold text-slate-800">Cash on Delivery</span>
                          <Banknote className="w-6 h-6 text-slate-400" />
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <button 
                      onClick={() => setStep(1)}
                      className="text-slate-500 hover:text-slate-800 font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      ← Back
                    </button>
                    <button 
                      onClick={() => setShowGateway(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                      Continue to Pay
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary (Sticky) */}
            <div className="flex-1">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-[100px]">
                <h3 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100">Order Summary</h3>
                
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image || "/hero-left-logo.png"} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 truncate">{item.name}</div>
                        <div className="text-xs text-slate-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-bold text-slate-800 whitespace-nowrap">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Shipping</span>
                    <span className="text-emerald-500 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Tax (GST 18%)</span>
                    <span>Included</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-800">Total</span>
                  <span className="text-2xl font-black text-blue-600">₹{total.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="mt-6 flex items-start gap-2 bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Safe and secure payments. 100% Authentic products.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Success Step */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-10 md:p-16 shadow-sm border border-slate-200 text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-4">Order Confirmed!</h1>
            <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
              Thank you for your purchase. Your order <span className="font-bold text-slate-800">#MKV-{Math.floor(Math.random() * 1000000)}</span> has been placed successfully and will be shipped soon.
            </p>
            
            <div className="bg-slate-50 rounded-2xl p-6 mb-10 text-left border border-slate-100 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Delivering To</h4>
                <div className="font-bold text-slate-800">{firstName} {lastName}</div>
                <div className="text-sm text-slate-600">{street || "123 Tech Park, Phase 2"}</div>
                <div className="text-sm text-slate-600">{city || "Bengaluru"}, {pinCode || "560001"}</div>
              </div>
              <div className="hidden md:block w-px bg-slate-200"></div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Estimated Delivery</h4>
                <div className="font-bold text-slate-800 text-lg text-emerald-600">Arriving Tomorrow</div>
                <div className="text-sm text-slate-600 mt-1">By 9:00 PM</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                <button className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-8 rounded-xl transition-colors">
                  Continue Shopping
                </button>
              </Link>
              <Link href="/profile/orders">
                <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                  Track Order
                </button>
              </Link>
            </div>
          </div>
        )}

      </div>
      
      {showGateway && (
        <MockPaymentGateway 
          amount={total} 
          items={items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity }))}
          onSuccess={handlePaymentSuccess} 
          onCancel={() => setShowGateway(false)} 
        />
      )}
    </div>
  );
}

// Just defining ShieldCheck here since it wasn't imported from lucide-react above
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-3 7-3s5 2 7 3a1 1 0 0 1 1 1v7z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
