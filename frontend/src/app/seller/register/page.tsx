"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LocationPicker from '@/components/LocationPicker';
import toast from 'react-hot-toast';
import { 
  Building2, MapPin, Store, CheckCircle2, ArrowRight, ArrowLeft, 
  ShieldCheck, Sparkles, Phone, Mail, Clock, FileText, Briefcase,
  Navigation, Check, Star, Zap, Award
} from 'lucide-react';

const getApiUrl = () => { 
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; 
  if (typeof window !== 'undefined') { 
    return 'http://' + window.location.hostname + ':3001'; 
  } 
  return 'http://localhost:3001'; 
}; 
const API_URL = getApiUrl();

export default function SellerRegistrationPage() {
  const router = useRouter();
  const { user, login, isLoading: authLoading } = useAuth();

  // Current Step: 1 (Model & Categorization) -> 2 (Identity & Profile) -> 3 (Address & Map) -> 4 (Operating Hours) -> 5 (Review & Submit)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Model & Categorization
  const [businessModel, setBusinessModel] = useState<string>('B2C');
  const [businessTypes, setBusinessTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [sectors, setSectors] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Step 2: Business Identity & Contact
  const [businessName, setBusinessName] = useState<string>('');
  const [businessPhone, setBusinessPhone] = useState<string>('');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerEmail, setOwnerEmail] = useState<string>('');

  // Step 3: Location, Address & Map Coordinates
  const [latitude, setLatitude] = useState<number | null>(28.6139);
  const [longitude, setLongitude] = useState<number | null>(77.2090);
  const [pinCode, setPinCode] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [locality, setLocality] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [areas, setAreas] = useState<string[]>([]);
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  // Step 4: Operating Hours
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '20:00', closed: false },
    tuesday: { open: '09:00', close: '20:00', closed: false },
    wednesday: { open: '09:00', close: '20:00', closed: false },
    thursday: { open: '09:00', close: '20:00', closed: false },
    friday: { open: '09:00', close: '20:00', closed: false },
    saturday: { open: '09:00', close: '21:00', closed: false },
    sunday: { open: '10:00', close: '18:00', closed: false }
  });

  // Redirect to seller login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/seller/login');
    }
  }, [user, authLoading, router]);

  // Redirect if already a seller
  useEffect(() => {
    if (user && (user.role?.toUpperCase() === 'SELLER' || user.business)) {
      router.replace('/seller/dashboard');
    }
    if (user) {
      setOwnerName(user.name || '');
      setOwnerEmail(user.email || '');
      if (user.phone) setBusinessPhone(user.phone);
    }
  }, [user, router]);

  // Fetch Business Types dynamically based on selected Model
  useEffect(() => {
    if (!businessModel) return;
    setLoadingConfig(true);
    fetch(`${API_URL}/configuration/business-types?mainType=${businessModel}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBusinessTypes(data);
          if (data.length > 0) {
            setSelectedType(data[0].id);
          } else {
            setSelectedType('');
          }
        }
      })
      .catch(() => setBusinessTypes([]))
      .finally(() => setLoadingConfig(false));
  }, [businessModel]);

  // Fetch Sectors dynamically based on selected Type
  useEffect(() => {
    if (!selectedType) {
      setSectors([]);
      setSelectedSector('');
      return;
    }
    setLoadingConfig(true);
    fetch(`${API_URL}/configuration/sectors?businessTypeId=${selectedType}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSectors(data);
          if (data.length > 0) {
            setSelectedSector(data[0].name || data[0].id);
          } else {
            setSelectedSector('');
          }
        }
      })
      .catch(() => setSectors([]))
      .finally(() => setLoadingConfig(false));
  }, [selectedType]);

  // Pincode lookup for automated City, State and Locality
  useEffect(() => {
    if (pinCode.length === 6) {
      setIsFetchingPin(true);
      fetch(`https://api.postalpincode.in/pincode/${pinCode}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].Status === 'Success') {
            const fetchedAreas = data[0].PostOffice.map((po: any) => po.Name);
            setAreas(fetchedAreas);
            if (fetchedAreas.length > 0 && !locality) {
              setLocality(fetchedAreas[0]);
            }
            const state = data[0].PostOffice[0].State;
            const district = data[0].PostOffice[0].District;
            if (state) setStateName(state);
            if (district) setCity(district);
          }
        })
        .catch(() => {})
        .finally(() => setIsFetchingPin(false));

      fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pinCode}&country=india&format=json`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          if (data && data.length > 0) {
            setLatitude(parseFloat(data[0].lat));
            setLongitude(parseFloat(data[0].lon));
          }
        })
        .catch(() => {});
    }
  }, [pinCode]);

  const handleLocationChange = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data.address) {
          if (data.address.postcode) setPinCode(data.address.postcode);
          if (data.address.state) setStateName(data.address.state);
          const detectedCity = data.address.city || data.address.town || data.address.district || data.address.county;
          if (detectedCity) setCity(detectedCity);
          const detectedLocality = data.address.suburb || data.address.neighbourhood || '';
          if (detectedLocality) setLocality(detectedLocality);
        }
      }
    } catch {}
  };

  const handleAutoGPS = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleLocationChange(lat, lng);
        toast.success('Location detected successfully via GPS!');
        setIsLocatingGPS(false);
      },
      (err) => {
        toast.error('Could not detect location. Please permit GPS or type your PIN code.');
        setIsLocatingGPS(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const applyHoursPreset = (type: 'standard' | 'retail' | 'always') => {
    if (type === 'standard') {
      setBusinessHours({
        monday: { open: '09:00', close: '20:00', closed: false },
        tuesday: { open: '09:00', close: '20:00', closed: false },
        wednesday: { open: '09:00', close: '20:00', closed: false },
        thursday: { open: '09:00', close: '20:00', closed: false },
        friday: { open: '09:00', close: '20:00', closed: false },
        saturday: { open: '09:00', close: '20:00', closed: false },
        sunday: { open: '10:00', close: '18:00', closed: true }
      });
      toast.success('Applied Standard Hours (Mon-Sat, 9AM - 8PM)');
    } else if (type === 'retail') {
      setBusinessHours({
        monday: { open: '10:00', close: '21:30', closed: false },
        tuesday: { open: '10:00', close: '21:30', closed: false },
        wednesday: { open: '10:00', close: '21:30', closed: false },
        thursday: { open: '10:00', close: '21:30', closed: false },
        friday: { open: '10:00', close: '22:00', closed: false },
        saturday: { open: '10:00', close: '22:00', closed: false },
        sunday: { open: '10:00', close: '22:00', closed: false }
      });
      toast.success('Applied Retail / Mall Hours (7 Days, 10AM - 9:30PM)');
    } else if (type === 'always') {
      setBusinessHours({
        monday: { open: '00:00', close: '23:59', closed: false },
        tuesday: { open: '00:00', close: '23:59', closed: false },
        wednesday: { open: '00:00', close: '23:59', closed: false },
        thursday: { open: '00:00', close: '23:59', closed: false },
        friday: { open: '00:00', close: '23:59', closed: false },
        saturday: { open: '00:00', close: '23:59', closed: false },
        sunday: { open: '00:00', close: '23:59', closed: false }
      });
      toast.success('Applied 24/7 Hours');
    }
  };

  const handleFinalRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.replace('/seller/login');
        return;
      }

      const selectedTypeObj = businessTypes.find(t => t.id === selectedType);
      const typeName = selectedTypeObj ? selectedTypeObj.name : selectedType;

      const payload = {
        ownerName: ownerName || user?.name,
        businessName: businessName.trim() || 'My Business',
        businessType: typeName,
        mainType: businessModel,
        sector: selectedSector,
        address: `${streetAddress}${locality ? ', ' + locality : ''}${landmark ? ' (Near ' + landmark + ')' : ''}, ${city}, ${stateName}`,
        pincode: pinCode,
        latitude,
        longitude,
        email: ownerEmail || user?.email,
        phone: businessPhone || user?.phone || '',
        gstNumber: gstNumber || '',
        businessHours,
      };

      const res = await fetch(`${API_URL}/sellers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed. Please review your details.');
      }

      const meRes = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (meRes.ok) {
        const data = await meRes.json();
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

      toast.success('Registration successful! Welcome to Merchant Central.');
      router.push('/seller/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration.');
      toast.error(err.message || 'Registration failed.');
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: 'Model & Sector', desc: 'Classification' },
    { id: 2, label: 'Business Profile', desc: 'Identity' },
    { id: 3, label: 'Location & Map', desc: 'Address' },
    { id: 4, label: 'Operating Hours', desc: 'Schedule' },
    { id: 5, label: 'Confirm & Launch', desc: 'Activation' },
  ];

  const progressPercentage = Math.round((step / 5) * 100);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      
      {/* Left Brand Panel with Live Preview */}
      <aside className="hidden lg:flex w-[440px] bg-gradient-to-br from-[#061224] via-[#091e3a] to-[#040c18] text-white p-8 xl:p-10 flex-col justify-between shrink-0 relative overflow-hidden border-r border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-all border border-white/10 mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-xl text-slate-950">
              M
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white leading-tight">MarkatVerse</h2>
              <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Merchant Onboarding</p>
            </div>
          </div>

          {/* Live Storefront Preview Card (Real-Time Dynamic Interactive Component) */}
          <div className="mb-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Live Store Preview
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                businessModel === 'SERVICE' ? 'bg-purple-500/30 text-purple-200 border border-purple-400/30' : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
              }`}>
                {businessModel}
              </span>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shrink-0">
                {businessName.trim() ? businessName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-black text-white truncate">
                  {businessName.trim() || 'Your Store Name'}
                </h3>
                <p className="text-[11px] text-slate-300 truncate">
                  {selectedSector || 'Select a Category'}
                </p>
              </div>
            </div>

            <div className="pt-2.5 mt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1 truncate max-w-[65%]">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="truncate">{city ? `${city}, ${stateName}` : 'Location Pin Pending'}</span>
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Award className="w-3 h-3" /> Verified Partner
              </span>
            </div>
          </div>

          {/* Systematic Step Indicator */}
          <div className="space-y-3">
            {steps.map((s) => {
              const isActive = step === s.id;
              const isCompleted = step > s.id;

              return (
                <div key={s.id} className="flex items-center gap-3 group">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30' 
                      : isActive 
                        ? 'bg-white text-slate-950 ring-4 ring-emerald-500/30 font-black' 
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                  }`}>
                    {isCompleted ? '✓' : s.id}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                      {s.label}
                    </h4>
                    <p className="text-[10px] text-slate-400">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Footnote */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-[11px] text-slate-400">
            SSL 256-Bit Encrypted • Verified Merchant Registration
          </span>
        </div>
      </aside>

      {/* Main Form Content */}
      <main className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-y-auto max-w-4xl mx-auto w-full">
        
        <div>
          {/* Top Animated Progress Header */}
          <div className="mb-6 pb-4 border-b border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Step {step} of 5: <span className="text-slate-900">{steps[step - 1]?.label}</span>
              </span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {progressPercentage}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* STEP 1: BUSINESS MODEL & CATEGORIZATION */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <span className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase">Classification</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Select Your Business Model</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">Choose how your business interacts with customers on MarkatVerse.</p>
              </div>

              {/* Models Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                {[
                  { id: 'B2C', title: 'B2C (Retail & Direct)', desc: 'Sell physical products directly to individual end consumers', icon: '🛍️' },
                  { id: 'B2B', title: 'B2B (Wholesale & Bulk)', desc: 'Supply bulk products with Minimum Order Quantity & Tier pricing', icon: '🏭' },
                  { id: 'BOTH', title: 'Hybrid (B2B + B2C)', desc: 'Operate both wholesale catalog and retail direct store', icon: '🔄' },
                  { id: 'SERVICE', title: 'Service Provider', desc: 'Appointments, live token queues, repair, salon & consultations', icon: '🛠️' },
                ].map((item) => {
                  const isSelected = businessModel === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setBusinessModel(item.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{item.icon}</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">{item.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Categorization */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 mb-8">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" /> Dynamic Sector Hierarchy
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Business Type <span className="text-rose-500">*</span></label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      disabled={loadingConfig}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    >
                      {businessTypes.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Assigned Sector <span className="text-rose-500">*</span></label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      disabled={loadingConfig || sectors.length === 0}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    >
                      {sectors.map((s) => (
                        <option key={s.id} value={s.name || s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  Continue to Profile <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS PROFILE */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <span className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase">Identity</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Business Information</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">Enter your store name and official contact identifiers.</p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Business / Store Name <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apex Electricals & Supplies"
                      className="w-full p-3.5 pl-11 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Business Phone <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        type="tel"
                        maxLength={10}
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number"
                        className="w-full p-3.5 pl-11 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">GST / PAN Number (Optional)</label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. 07AAAAA0000A1Z5"
                        className="w-full p-3.5 pl-11 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Owner Name</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Authorized Person Name"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Notification Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="orders@business.com"
                        className="w-full p-3.5 pl-11 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!businessName.trim() || !businessPhone.trim()}
                  onClick={() => setStep(3)}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  Continue to Location <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION & MAP WITH AUTO GPS DETECT */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase">Location & Map</span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Physical Store & Coordinates</h1>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">Pin your exact shop location so nearby buyers can reach you.</p>
                </div>

                {/* 1-Click GPS Auto-Detect Button */}
                <button
                  type="button"
                  onClick={handleAutoGPS}
                  disabled={isLocatingGPS}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-all shadow-xs self-start sm:self-auto shrink-0"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocatingGPS ? 'animate-spin' : ''}`} />
                  {isLocatingGPS ? 'Detecting GPS...' : '📍 Auto-Detect My GPS'}
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 mb-8">
                {/* Interactive Map Picker */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" /> Drag or Click Map to Pin Store
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">Auto-synced with address</span>
                  </div>
                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onChange={handleLocationChange}
                  />
                </div>

                {/* Structured Address */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">PIN Code <span className="text-rose-500">*</span></label>
                    <input
                      required
                      type="text"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit PIN"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">State <span className="text-rose-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">City / District <span className="text-rose-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Locality / Area</label>
                    {areas.length > 0 ? (
                      <select
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      >
                        {areas.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        placeholder="e.g. Andheri East"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Nearby Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Opposite Metro Gate 2"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Shop No. / Street Address <span className="text-rose-500">*</span></label>
                  <textarea
                    required
                    rows={2}
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. Gala No. 4, Ground Floor, Industrial Estate"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!pinCode || !city || !stateName || !streetAddress.trim()}
                  onClick={() => setStep(4)}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  Continue to Hours <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: OPERATING HOURS WITH 1-CLICK PRESETS */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <span className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase">Availability</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Weekly Operating Hours</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">Configure your daily store hours for delivery, pickups, and customer visits.</p>
              </div>

              {/* Quick Hours Presets */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mr-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> 1-Click Presets:
                </span>
                <button
                  type="button"
                  onClick={() => applyHoursPreset('standard')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-xs"
                >
                  Standard (Mon-Sat, 9AM-8PM)
                </button>
                <button
                  type="button"
                  onClick={() => applyHoursPreset('retail')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-xs"
                >
                  Retail / Mall (7 Days, 10AM-9:30PM)
                </button>
                <button
                  type="button"
                  onClick={() => applyHoursPreset('always')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-xs"
                >
                  24/7 Always Open
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 mb-8">
                {Object.keys(businessHours).map((day) => {
                  const dayData = (businessHours as any)[day];
                  return (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 gap-2">
                      <span className="capitalize font-bold text-xs sm:text-sm text-slate-800 w-28">{day}</span>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={dayData.open}
                          disabled={dayData.closed}
                          onChange={(e) => setBusinessHours({
                            ...businessHours,
                            [day]: { ...dayData, open: e.target.value }
                          })}
                          className="p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white disabled:opacity-40"
                        />
                        <span className="text-slate-400 font-bold text-xs">to</span>
                        <input
                          type="time"
                          value={dayData.close}
                          disabled={dayData.closed}
                          onChange={(e) => setBusinessHours({
                            ...businessHours,
                            [day]: { ...dayData, close: e.target.value }
                          })}
                          className="p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white disabled:opacity-40"
                        />
                      </div>

                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={dayData.closed}
                          onChange={(e) => setBusinessHours({
                            ...businessHours,
                            [day]: { ...dayData, closed: e.target.checked }
                          })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        Mark Closed
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  Review & Finalize <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & CONFIRM */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <span className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase">Activation</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Review & Launch Store</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">Please verify your details. Upon completion, your merchant dashboard will be instantly activated.</p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 mb-8">
                
                {/* Summary Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Store Name</span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{businessName}</h3>
                    <p className="text-xs text-emerald-700 font-bold mt-1">Model: {businessModel}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Sector & Classification</span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{selectedSector || 'General'}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Phone: +91-{businessPhone}</p>
                  </div>
                </div>

                {/* Address Summary */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-slate-800">
                  <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold text-slate-900 block">Registered Business Address:</span>
                    {streetAddress}{locality ? `, ${locality}` : ''}{landmark ? ` (${landmark})` : ''}, {city}, {stateName} - {pinCode}
                  </div>
                </div>

                {/* Capabilities Provisioned */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Enabled Merchant Tools:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">✓ Multi-Channel Wallet</span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">✓ Realtime Orders</span>
                    {businessModel === 'SERVICE' ? (
                      <>
                        <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">✓ Live Token Queue</span>
                        <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">✓ Staff & Slot Booking</span>
                      </>
                    ) : (
                      <>
                        <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">✓ Product Inventory</span>
                        <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">✓ Logistics & Shipping</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(4)}
                  className="px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalRegistration}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  {isSubmitting ? 'Activating Store...' : 'Complete & Launch Store 🚀'}
                </button>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
