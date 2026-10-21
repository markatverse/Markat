"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LocationPicker from '@/components/LocationPicker';
import toast from 'react-hot-toast';
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

import { getApiUrl } from '@/utils/api';

const API_URL = getApiUrl();

export default function SellerOnboarding() {
  const router = useRouter();
  const { user, login, isLoading: authLoading } = useAuth();
  // 'new'  = email is fresh, needs OTP signup
  // 'existing' = email belongs to existing account, needs password login
  const [accountMode, setAccountMode] = useState<'new' | 'existing'>('new');
  // step 1 = account (new or login), 1.2 = OTP verify (new only), 2+ = business steps
  const [step, setStep] = useState<number>(authLoading ? -1 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Once auth loads: if already logged in, skip straight to step 2
  React.useEffect(() => {
    if (authLoading) return;
    if (user && (user.role?.toUpperCase() === 'SELLER' || user.role?.toUpperCase() === 'BUSINESS') && user.business) {
      router.replace('/seller/dashboard');
      return;
    }
    if (user && (step === 1 || step === -1 || step === 1.2)) {
      setOwnerName(user.name);
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setStep(2);
    } else if (!user && step === -1) {
      setStep(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, router]);

  // State variables
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registeredToken, setRegisteredToken] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(300);

  // Business Info
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  // Business Type
  const [primaryOffering, setPrimaryOffering] = useState('');
  const [mainType, setMainType] = useState('');

  // Operating Features
  const [sellerRole, setSellerRole] = useState('');
  const [businessSector, setBusinessSector] = useState('');

  // Location
  const [pinCode, setPinCode] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Business Hours
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '18:00', closed: false },
    sunday: { open: '09:00', close: '18:00', closed: true },
  });

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 1.2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLocationChange = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setIsFetchingPin(true);
    try {
      const [nomRes, bdcRes] = await Promise.all([
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`),
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
      ]);
      
      const nomData = nomRes.ok ? await nomRes.json() : null;
      const bdcData = bdcRes.ok ? await bdcRes.json() : null;
      
      if (nomData && nomData.address && bdcData) {
        const newPin = bdcData.postcode || nomData.address.postcode || '';
        const newCity = bdcData.city || nomData.address.city || bdcData.locality || '';
        const newState = bdcData.principalSubdivision || nomData.address.state || '';
        
        // Exact locality from BigDataCloud or Nominatim
        let exactLocality = nomData.address.neighbourhood || nomData.address.suburb || bdcData.locality || '';
        if (!exactLocality && nomData.display_name) {
          exactLocality = nomData.display_name.split(',')[1]?.trim() || '';
        }
        
        // Street info for the business location field
        const localParts = [];
        if (nomData.address.house_number) localParts.push(nomData.address.house_number);
        if (nomData.address.road) localParts.push(nomData.address.road);
        else if (nomData.address.pedestrian) localParts.push(nomData.address.pedestrian);
        else if (nomData.address.path) localParts.push(nomData.address.path);
        else if (nomData.address.footway) localParts.push(nomData.address.footway);
        
        const streetAddress = localParts.join(', ');
        
        if (newPin) setPinCode(newPin);
        if (newCity) setCity(newCity);
        if (newState) setStateName(newState);
        if (exactLocality) setLocality(exactLocality);
        if (streetAddress) setBusinessLocation(streetAddress);
      }
    } catch (error) {
      console.error("Failed to reverse geocode location", error);
    } finally {
      setIsFetchingPin(false);
    }
  };

  React.useEffect(() => {
    if (pinCode.length === 6) {
      setIsFetchingPin(true);
      
      // 1. Fetch Area Details
      fetch(`https://api.postalpincode.in/pincode/${pinCode}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].Status === 'Success') {
            const fetchedAreas = data[0].PostOffice.map((po: any) => po.Name);
            setAreas(fetchedAreas);
            const state = data[0].PostOffice[0].State;
            const district = data[0].PostOffice[0].District;
            setStateName(state);
            setCity(district);
          } else {
            setAreas([]);
          }
        })
        .catch(() => setAreas([]))
        .finally(() => setIsFetchingPin(false));

      // 2. Forward Geocode to update Map Pin
      fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pinCode}&country=india&format=json`)
        .then(res => res.ok ? res.json() : Promise.reject(new Error('Rate limited')))
        .then(data => {
          if (data && data.length > 0) {
            setLatitude(parseFloat(data[0].lat));
            setLongitude(parseFloat(data[0].lon));
          }
        })
        .catch(err => console.error("Geocoding failed", err));
    } else {
      setAreas([]);
    }
  }, [pinCode]);

  const mainTypeMapping: Record<string, string[]> = {
    'B2B': ['Manufacturer', 'Wholesaler'],
    'B2C': ['Retailer'],
    'BOTH': ['Manufacturer', 'Wholesaler', 'Retailer'],
    'SERVICE': ['Service Provider', 'Organizer']
  };

  const taxonomy: Record<string, Record<string, string[]>> = {
    'Manufacturer': {
      'Construction': ['All'],
      'Electronics': ['All'],
      'Fashion': ['All'],
      'Home & Kitchen': ['All']
    },
    'Wholesaler': {
      'Construction': ['All'],
      'Electronics': ['All'],
      'Fashion': ['All'],
      'FMCG & Groceries': ['All']
    },
    'Retailer': {
      'Food & Dining / Restaurant': ['All'],
      'Electronics': ['All'],
      'Fashion': ['All'],
      'Home & Kitchen': ['All'],
      'Grocery & Essentials': ['All']
    },
    'Service Provider': {
      'Food & Dining / Restaurant': ['All'],
      'Salon & Parlor': ['All'],
      'Healthcare & Doctor': ['All'],
      'Home Repairs': ['All'],
      'Cleaning & Pest Control': ['All'],
      'Professional Services': ['All']
    },
    'Organizer': {
      'Event & Party': ['All'],
      'Transport & Logistics': ['All'],
      'Travel & Tours': ['All']
    }
  };

  const currentRoles = mainTypeMapping[mainType] || [];
  const currentSectors = Object.keys(taxonomy[sellerRole] || {});

  // Handlers
  const handleAccountInit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Email Address is required'); return; }
    if (accountMode === 'new') {
      if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
      if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
      if (!phone || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) { toast.error('Phone number is required and must be exactly 10 digits'); return; }
    }
    setIsSubmitting(true);
    try {
      if (accountMode === 'existing') {
        // Log in with existing account, then proceed
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed. Check your password.');
        login(
          { id: data.user.id, markatId: data.user.markatId, name: data.user.name, email: data.user.email, role: data.user.role.toLowerCase() as any, phone: data.user.phone || '', business: data.user.business },
          data.access_token
        );
        setRegisteredToken(data.access_token);
        toast.success('Logged in! Continuing with your existing account.');
        setStep(2);
        return;
      }

      // New account: send OTP
      const res = await fetch(`${API_URL}/auth/send-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, type: 'email', phone: phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Email already registered → switch to login mode
        if (data.message && (data.message.includes('already exists') || data.message.includes('already registered'))) {
          setAccountMode('existing');
          toast('This email is already registered. Enter your password to continue.', { icon: 'ℹ️' });
          return;
        }
        throw new Error(data.message || 'Failed to send Email OTP');
      }
      
      toast.success(`OTP sent to ${email}`);
      setOtpTimer(300);
      setStep(1.2);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOtp.length !== 6) { toast.error("Enter a valid 6-digit code"); return; }
    
    setIsSubmitting(true);
    try {
      const verifyRes = await fetch(`${API_URL}/auth/verify-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, code: emailOtp, type: 'email' }),
      });
      if (!verifyRes.ok) throw new Error('Invalid Email OTP');

      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ownerName,
          email: email,
          phone: phone,
          password,
          role: 'SELLER',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || 'Registration failed');
      
      setRegisteredToken(data.access_token);
      login(
        { id: data.user.id, markatId: data.user.markatId, name: data.user.name, email: data.user.email, role: 'business', phone: data.user.phone || '', business: data.user.business },
        data.access_token
      );
      toast.success("Account created successfully!");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = registeredToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      let res: Response;
      try {
        res = await fetch(`${API_URL}/sellers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            ownerName: ownerName || 'Seller',
            businessName: businessName || 'My Business',
            businessType: sellerRole || 'Retailer',
            mainType: mainType || 'B2C',
            sector: businessSector || 'General',
            address: `${businessLocation || ''}${locality ? ', ' + locality : ''}${landmark ? ', ' + landmark : ''}, ${city || 'City'}, ${stateName || 'State'}`,
            pincode: pinCode || '000000',
            latitude: latitude || 28.6139,
            longitude: longitude || 77.2090,
            email: email || '',
            phone: phone || '',
            gstNumber: gstNumber || '',
            businessHours,
          }),
        });
      } catch (networkErr: any) {
        throw new Error(`Unable to connect to server at ${API_URL}. Please verify your connection.`);
      }

      if (res.ok) {
        if (token) {
          try {
            const userRes = await fetch(`${API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (userRes.ok) {
              const data = await userRes.json();
              login({
                id: data.id,
                markatId: data.markatId,
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                role: data.role?.toLowerCase() as any,
                status: 'active',
                business: data.business,
              }, token);
            }
          } catch {}
        }
        setIsSubmitting(false);
        setStep(6);
      } else {
        let errMessage = 'Registration failed. Please review your details.';
        try {
          const data = await res.json();
          errMessage = Array.isArray(data.message) ? data.message[0] : (data.message || errMessage);
        } catch {}
        throw new Error(errMessage);
      }
    } catch (err: any) {
      console.error('Onboarding Submit Error:', err);
      toast.error(err.message || 'Registration failed.');
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Account' },
    { num: 2, label: 'Profile' },
    { num: 3, label: 'Features' },
    { num: 4, label: 'Hours' },
    { num: 5, label: 'Submit' }
  ];

  const inputClasses = "w-full p-4 pl-12 rounded-2xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-400 text-sm";
  const selectClasses = "w-full p-4 rounded-2xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all text-sm";
  const labelClasses = "block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider";
  const btnPrimary = "w-full py-4 bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-bold transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm";

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex">
      {/* Left Side: Branding Panel */}
      <div className="hidden lg:flex w-[480px] bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 relative overflow-hidden flex-col justify-between p-10 shrink-0 border-r border-emerald-700/40 shadow-2xl">
        
        {/* Top Bar: Back & Official Tag */}
        <div className="relative z-20 flex items-center justify-between pb-4">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>

          <span className="text-[11px] font-semibold tracking-wider text-emerald-300 uppercase bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-500/30">
            Seller Program
          </span>
        </div>

        {/* Decorative ambient elements */}
        <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[420px] h-[420px] border border-emerald-400/10 rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Main Content (Vertically Balanced, No Dead Gap) */}
        <div className="relative z-10 flex flex-col justify-center my-auto py-4">
          
          {/* Prominent High-Visibility Brand Logo */}
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-md">
              <img 
                src="/logo.png" 
                alt="MarkatVerse" 
                className="h-12 w-auto brightness-0 invert object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-base font-extrabold tracking-wide uppercase">
                MarkatVerse
              </span>
              <span className="text-emerald-300 text-[10px] font-bold tracking-[0.2em] uppercase">
                Merchant Central
              </span>
            </div>
          </div>

          {/* Social Proof Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-3.5 py-1.5 w-fit mb-5 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span className="text-white text-xs font-medium">
              Trusted by <strong className="text-amber-300 font-bold">50,000+</strong> active sellers across India
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-3 tracking-tight">
            Grow your business <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-200 to-teal-200">
              with MarkatVerse
            </span>
          </h1>

          <p className="text-emerald-100/90 text-sm leading-relaxed mb-6">
            Reach millions of customers, manage your inventory seamlessly, and scale your business to new heights with our powerful seller tools.
          </p>

          <div className="space-y-2.5">
            {[
              { icon: '🚀', text: 'Reach a massive global audience' },
              { icon: '📈', text: 'Powerful analytics and inventory insights' },
              { icon: '🛡️', text: 'Secure payments and guaranteed fast payouts' },
            ].map((item, i) => (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10" key={i}>
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center text-base shrink-0">{item.icon}</div>
                <span className="text-white text-xs font-semibold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-emerald-200/70 text-xs">
          <span className="flex items-center gap-1.5">
            <span>🛡️</span> TrustSEAL Verified
          </span>
          <span className="flex items-center gap-1.5">
            <span>🔒</span> 256-bit SSL Protected
          </span>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          {/* Step Progress */}
          {step >= 2 && step <= 5 && (
            <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
              {stepsList.map((s, i) => (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      // Step 1 is always done when we're at step 2+
                      (s.num === 1 && step >= 2) || Math.floor(step) > s.num ? 'bg-emerald-600 text-white' :
                      Math.floor(step) === s.num ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
                      'bg-slate-200 text-slate-400'
                    }`}>
                      {(s.num === 1 && step >= 2) || Math.floor(step) > s.num ? '✓' : s.num}
                    </div>
                    <span className={`text-[10px] font-medium ${(s.num === 1 && step >= 2) || Math.floor(step) >= s.num ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < stepsList.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${(s.num === 1 && step >= 2) || Math.floor(step) > s.num ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* STEP 1 */}
          {step === -1 && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          )}

          {step === 1 && (
            <div className="bg-transparent py-4">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-1">
                  {accountMode === 'existing' ? '🔑 Continue with Existing Account' : '👤 Create Seller Account'}
                </h2>
                <p className="text-slate-500 text-sm">
                  {accountMode === 'existing'
                    ? 'Your email is already registered. Sign in to link your existing account as a seller.'
                    : 'Join MarkatVerse as a seller today'}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
                <Link href="/seller/login" className="flex-1 text-center py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-all">
                  Sign In
                </Link>
                <div className="flex-1 text-center py-2.5 text-sm font-semibold rounded-lg bg-white text-indigo-600 shadow-sm transition-all">
                  Register
                </div>
              </div>

              {accountMode === 'existing' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-700">
                  <p className="font-semibold mb-1">✅ Account found for <span className="text-blue-900">{email}</span></p>
                  <p className="text-xs text-blue-600">Your MarkatVerse ID will be preserved. Enter your existing password to continue as a seller.</p>
                </div>
              )}

              <form onSubmit={handleAccountInit} className="flex flex-col gap-5">
                {accountMode === 'new' && (
                  <div>
                    <label className={labelClasses}>Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input required type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="John Doe" className={inputClasses} />
                    </div>
                  </div>
                )}
                <div>
                  <label className={labelClasses}>Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <input
                      required type="email" value={email}
                      onChange={e => { setEmail(e.target.value); if (accountMode === 'existing') setAccountMode('new'); }}
                      placeholder="name@company.com" className={inputClasses}
                      disabled={accountMode === 'existing'}
                    />
                    {accountMode === 'existing' && (
                      <button type="button" onClick={() => { setAccountMode('new'); setPassword(''); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-indigo-600 font-semibold hover:underline">
                        Change
                      </button>
                    )}
                  </div>
                </div>
                {accountMode === 'new' && (
                  <div>
                    <label className={labelClasses}>Mobile Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <div className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <span className="text-slate-700 font-medium">+91</span>
                        <div className="w-px h-5 bg-slate-200"></div>
                      </div>
                      <input required type="tel" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className={`${inputClasses} pl-24`} placeholder="9876543210" />
                    </div>
                  </div>
                )}
                <div>
                  <label className={labelClasses}>Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={accountMode === 'existing' ? 'Your existing password' : 'Min. 6 characters'} className={inputClasses} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {accountMode === 'new' && (
                  <div>
                    <label className={labelClasses}>Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input required type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={inputClasses} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-2">
                  <p className="text-[13px] text-slate-400 mb-4">
                    By registering, you agree to our <a href="#" className="text-indigo-500 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-500 hover:underline">Privacy Policy</a>.
                  </p>
                  <button type="submit" disabled={isSubmitting} className={btnPrimary}>
                    {isSubmitting
                      ? (accountMode === 'existing' ? 'Signing in...' : 'Sending OTP...')
                      : accountMode === 'existing'
                        ? <><span className="text-[15px]">Sign In & Continue</span> <ArrowRight className="w-5 h-5" /></>
                        : <><span className="text-[15px]">Verify Email</span> <ArrowRight className="w-5 h-5" /></>
                    }
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 1.2 */}
          {step === 1.2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <button type="button" onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-700 text-sm mb-4">← Back</button>
              <h2 className="text-xl font-bold text-slate-900 text-center mb-1">✉️ Verify Email</h2>
              <form onSubmit={handleEmailVerifyAndSignup} className="flex flex-col gap-4">
                <div>
                  <label className={labelClasses}>6-Digit OTP <span className="text-red-500">*</span></label>
                  <input required type="text" maxLength={6} value={emailOtp} onChange={e => setEmailOtp(e.target.value.toUpperCase())} placeholder="- - - - - -" className={`${inputClasses} text-center text-xl tracking-widest`} />
                </div>
                <button type="submit" disabled={isSubmitting || emailOtp.length !== 6 || otpTimer === 0} className={btnPrimary}>Complete Setup ✓</button>
                <div className="text-right text-sm text-slate-500">{otpTimer > 0 ? `Code expires in ${formatTime(otpTimer)}` : 'Code expired'}</div>
              </form>
            </div>
          )}

          {/* STEP 2: PROFILE */}
          {step === 2 && (
            <div className="bg-transparent py-4">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">🏢 Business Profile</h2>
                <p className="text-slate-500 text-sm">Basic details about your business and location</p>
              </div>
              <form onSubmit={e => { e.preventDefault(); setStep(3); }} className="flex flex-col gap-6">
                <div><label className={labelClasses}>Legal Business Name <span className="text-red-500">*</span></label><input required type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. ACME Corp" className={inputClasses} /></div>
                <div><label className={labelClasses}>GST / PAN Number (Optional)</label><input type="text" value={gstNumber} onChange={e => setGstNumber(e.target.value)} placeholder="e.g. 22AAAAA0000A1Z5" className={inputClasses} /></div>
                <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-6 mb-4">
                  <h3 className="text-sm font-bold text-slate-800">Pinpoint your Location on Map</h3>
                </div>
                
                <LocationPicker 
                  latitude={latitude} 
                  longitude={longitude} 
                  onChange={handleLocationChange} 
                />

                <div className="flex justify-between items-center mt-6">
                  <h3 className="text-sm font-bold text-slate-800">Address Details</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>PIN Code <span className="text-red-500">*</span></label>
                    <input required type="text" maxLength={6} value={pinCode} onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 110001" className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>State <span className="text-red-500">*</span></label>
                    <input required type="text" value={stateName} onChange={e => setStateName(e.target.value)} placeholder="e.g. Delhi" className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>City / District <span className="text-red-500">*</span></label>
                    <input required type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. New Delhi" className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Locality</label>
                    {areas.length > 0 ? (
                      <select className={selectClasses} value={locality} onChange={e => setLocality(e.target.value)}>
                        <option value="" disabled>Select Locality</option>
                        {areas.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={locality} onChange={e => setLocality(e.target.value)} placeholder="Enter PIN or map pin to fetch" className={`${inputClasses} bg-slate-50`} />
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Shop No. & Street / Gali Name <span className="text-red-500">*</span></label>
                  <textarea required rows={2} value={businessLocation} onChange={e => setBusinessLocation(e.target.value)} placeholder="e.g. Shop No. 12, Main Street / Gali No. 4" className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Nearby Landmark (Optional)</label>
                  <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="e.g. Near City Mall" className={inputClasses} />
                </div>
                <div className="flex gap-3 mt-4">
                  {!user && (
                    <button type="button" onClick={() => setStep(1)} className="px-6 py-4 border border-slate-300 text-slate-700 rounded-2xl font-bold text-sm bg-white hover:bg-slate-50">← Back</button>
                  )}
                  <button type="submit" className={btnPrimary}>Next: Features →</button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: FEATURES */}
          {step === 3 && (
            <div className="bg-transparent py-4">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">✨ Business Features</h2>
                <p className="text-slate-500 text-sm">Select your primary business model and category</p>
              </div>
              <form onSubmit={e => { e.preventDefault(); setStep(4); }} className="flex flex-col gap-6">
                <div>
                  <label className={labelClasses}>What do you want to offer? <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'PRODUCT', title: 'Products' },
                      { id: 'SERVICE', title: 'Services' },
                    ].map(opt => (
                      <div key={opt.id} onClick={() => { 
                          setPrimaryOffering(opt.id); 
                          setMainType(opt.id === 'SERVICE' ? 'SERVICE' : ''); 
                          setSellerRole('');
                          setBusinessSector('');
                        }} 
                        className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${primaryOffering === opt.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'}`}>
                        <h4 className="font-bold text-sm text-center">{opt.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
                
                {primaryOffering === 'PRODUCT' && (
                  <div>
                    <label className={labelClasses}>Business Model <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'B2C', title: 'B2C (Retail)' },
                        { id: 'B2B', title: 'B2B (Wholesale)' },
                        { id: 'BOTH', title: 'Both (B2B + B2C)' },
                      ].map(opt => (
                        <div key={opt.id} onClick={() => { setMainType(opt.id); setSellerRole(''); setBusinessSector(''); }} 
                          className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-center ${mainType === opt.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'}`}>
                          <h4 className="font-bold text-sm text-center">{opt.title}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {mainType && (
                  <>
                    <div>
                      <label className={labelClasses}>Business Type <span className="text-red-500">*</span></label>
                      <select required value={sellerRole} onChange={e => { setSellerRole(e.target.value); setBusinessSector(''); }} className={selectClasses}>
                        <option value="" disabled>Select Type...</option>
                        {currentRoles.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>Business Sector <span className="text-red-500">*</span></label>
                      <select required value={businessSector} onChange={e => setBusinessSector(e.target.value)} className={selectClasses}>
                        <option value="" disabled>Select sector...</option>
                        {currentSectors.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(2)} className="px-6 py-4 border border-slate-300 text-slate-700 rounded-2xl font-bold text-sm bg-white hover:bg-slate-50">← Back</button>
                  <button type="submit" disabled={!mainType} className={btnPrimary}>Next: Final Step →</button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: HOURS */}
          {step === 4 && (
            <div className="bg-transparent py-4">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">🕒 Business Hours</h2>
                <p className="text-slate-500 text-sm">When is your business open?</p>
              </div>
              <form onSubmit={e => { e.preventDefault(); setStep(5); }} className="flex flex-col gap-6">
                <div>
                  <div className="flex flex-col gap-3">
                    {Object.keys(businessHours).map(day => (
                      <div key={day} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
                        <span className="capitalize w-24 text-sm font-semibold text-slate-700">{day}</span>
                        <div className="flex gap-2">
                          <input type="time" value={(businessHours as any)[day].open} onChange={e => setBusinessHours({...businessHours, [day]: {...(businessHours as any)[day], open: e.target.value}})} disabled={(businessHours as any)[day].closed} className="p-1.5 border border-slate-200 rounded text-xs outline-none focus:border-indigo-400 bg-slate-50" />
                          <span className="text-slate-400 self-center">-</span>
                          <input type="time" value={(businessHours as any)[day].close} onChange={e => setBusinessHours({...businessHours, [day]: {...(businessHours as any)[day], close: e.target.value}})} disabled={(businessHours as any)[day].closed} className="p-1.5 border border-slate-200 rounded text-xs outline-none focus:border-indigo-400 bg-slate-50" />
                        </div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer">
                          <input type="checkbox" checked={(businessHours as any)[day].closed} onChange={e => setBusinessHours({...businessHours, [day]: {...(businessHours as any)[day], closed: e.target.checked}})} className="rounded" /> Closed
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(3)} className="px-6 py-4 border border-slate-300 text-slate-700 rounded-2xl font-bold text-sm bg-white hover:bg-slate-50">← Back</button>
                  <button type="submit" className={btnPrimary}>Next: Final Step →</button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 5: SUBMIT */}
          {step === 5 && (
            <div className="bg-transparent py-4">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">🚀 Final Step</h2>
                <p className="text-slate-500 text-sm">Upload documents to verify your business</p>
              </div>
              <form onSubmit={handleFinalSubmit} className="flex flex-col gap-6">
                <div>
                  <label className={labelClasses}>ID Proof / License (Optional)</label>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 border-dashed text-center">
                    <input type="file" className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 file:cursor-pointer hover:file:bg-indigo-100" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(4)} className="px-6 py-4 border border-slate-300 text-slate-700 rounded-2xl font-bold text-sm bg-white hover:bg-slate-50">← Back</button>
                  <button type="submit" disabled={isSubmitting} className={btnPrimary}>{isSubmitting ? 'Submitting...' : 'Submit Registration ✓'}</button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 6: SUCCESS */}
          {step === 6 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 text-center mt-10">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                ✅
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Registration Complete!</h2>
              <p className="text-slate-500 text-base mb-8">
                Your registration is complete. Your seller dashboard will be ready within 24 hours once our Admin team reviews your details.
              </p>
              <Link href="/">
                <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-colors">Return to Homepage</button>
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
