"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LocationPicker from '@/components/LocationPicker';
import toast from 'react-hot-toast';
import { 
  Building2, MapPin, Store, CheckCircle2, ArrowRight, ArrowLeft, 
  ShieldCheck, Sparkles, Phone, Mail, Clock, FileText, Briefcase
} from 'lucide-react';

import { getApiUrl } from '@/utils/api';

const API_URL = getApiUrl();

export default function SellerRegistrationPage() {
  const router = useRouter();
  const { user, login, isLoading: authLoading } = useAuth();

  // Current Step: 1 (Model & Categorization) -> 2 (Identity & Profile) -> 3 (Address & Map) -> 4 (Operating Hours) -> 5 (Review & Submit)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Model & Categorization (Synchronized with backend config)
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

  // Fallback sectors map in case configuration endpoint has empty sectors or network drops
  const FALLBACK_SECTORS: Record<string, { id: string; name: string }[]> = {
    'B2C': [
      { id: 'b2c_food', name: 'Food & Dining / Restaurant' },
      { id: 'b2c_retail', name: 'Retail & Supermarket' },
      { id: 'b2c_fashion', name: 'Fashion & Apparel' },
      { id: 'b2c_electronics', name: 'Electronics & Appliances' },
      { id: 'b2c_home', name: 'Home & Kitchen Essentials' },
      { id: 'b2c_health', name: 'Health & Pharmacy' },
    ],
    'B2B': [
      { id: 'b2b_wholesale', name: 'Wholesale & Distribution' },
      { id: 'b2b_mfg', name: 'Manufacturing & Industrial' },
      { id: 'b2b_construction', name: 'Construction & Materials' },
      { id: 'b2b_fmcg', name: 'FMCG Bulk Supply' },
    ],
    'BOTH': [
      { id: 'both_retail_wholesale', name: 'Both B2B & B2C' },
      { id: 'both_food', name: 'Food & Beverage Supply' },
      { id: 'both_textiles', name: 'Textiles & Garments' },
    ],
    'SERVICE': [
      { id: 'srv_food', name: 'Food & Dining / Restaurant' },
      { id: 'srv_salon', name: 'Salon & Beauty Services' },
      { id: 'srv_health', name: 'Healthcare & Clinic' },
      { id: 'srv_home', name: 'Home Maintenance & Repair' },
      { id: 'srv_events', name: 'Events & Catering' },
    ]
  };

  // Fetch Business Types dynamically based on selected Model
  useEffect(() => {
    if (!businessModel) return;
    setLoadingConfig(true);
    fetch(`${API_URL}/configuration/business-types?mainType=${businessModel}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBusinessTypes(data);
          // Prefer type that already has sectors defined, otherwise default to first
          const typeWithSectors = data.find((t: any) => t.sectors && t.sectors.length > 0) || data[0];
          setSelectedType(typeWithSectors.id);
        } else {
          // Fallback business type if database is empty
          const fallbackType = { id: `default_${businessModel.toLowerCase()}`, name: `${businessModel} Enterprise`, sectors: [] };
          setBusinessTypes([fallbackType]);
          setSelectedType(fallbackType.id);
        }
      })
      .catch(() => {
        const fallbackType = { id: `default_${businessModel.toLowerCase()}`, name: `${businessModel} Store`, sectors: [] };
        setBusinessTypes([fallbackType]);
        setSelectedType(fallbackType.id);
      })
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
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSectors(data);
          setSelectedSector(data[0].name || data[0].id);
        } else {
          // Use model-based fallback sectors so the seller is never blocked with an empty sector
          const fallbacks = FALLBACK_SECTORS[businessModel] || FALLBACK_SECTORS['B2C'];
          setSectors(fallbacks);
          setSelectedSector(fallbacks[0].name);
        }
      })
      .catch(() => {
        const fallbacks = FALLBACK_SECTORS[businessModel] || FALLBACK_SECTORS['B2C'];
        setSectors(fallbacks);
        setSelectedSector(fallbacks[0].name);
      })
      .finally(() => setLoadingConfig(false));
  }, [selectedType, businessModel]);

  // Pincode lookup for automated City, State and Locality with timeout and error resilience
  useEffect(() => {
    if (pinCode.length === 6) {
      setIsFetchingPin(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      fetch(`https://api.postalpincode.in/pincode/${pinCode}`, { signal: controller.signal })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data[0] && data[0].Status === 'Success' && Array.isArray(data[0].PostOffice)) {
            const fetchedAreas = data[0].PostOffice.map((po: any) => po.Name).filter(Boolean);
            if (fetchedAreas.length > 0) {
              setAreas(fetchedAreas);
              if (!locality) setLocality(fetchedAreas[0]);
            }
            const state = data[0].PostOffice[0].State;
            const district = data[0].PostOffice[0].District;
            if (state && !stateName) setStateName(state);
            if (district && !city) setCity(district);
          }
        })
        .catch(() => {})
        .finally(() => {
          clearTimeout(timeoutId);
          setIsFetchingPin(false);
        });

      // Geocoding fallback with graceful catch
      fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pinCode}&country=india&format=json`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            if (data[0].lat && data[0].lon) {
              setLatitude(parseFloat(data[0].lat));
              setLongitude(parseFloat(data[0].lon));
            }
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
        if (data && data.address) {
          if (data.address.postcode) setPinCode(data.address.postcode);
          if (data.address.state && !stateName) setStateName(data.address.state);
          const detectedCity = data.address.city || data.address.town || data.address.district || data.address.county;
          if (detectedCity && !city) setCity(detectedCity);
          const detectedLocality = data.address.suburb || data.address.neighbourhood || '';
          if (detectedLocality && !locality) setLocality(detectedLocality);
        }
      }
    } catch {}
  };

  const handleFinalRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Session expired. Please log in to complete registration.');
        router.replace('/seller/login');
        return;
      }

      const selectedTypeObj = businessTypes.find(t => t.id === selectedType);
      const typeName = selectedTypeObj ? selectedTypeObj.name : (selectedType || `${businessModel} Merchant`);
      const finalSector = selectedSector || (FALLBACK_SECTORS[businessModel] ? FALLBACK_SECTORS[businessModel][0].name : 'General');

      const payload = {
        ownerName: ownerName || user?.name || 'Seller',
        businessName: businessName.trim() || 'My Store',
        businessType: typeName,
        mainType: businessModel,
        sector: finalSector,
        address: `${streetAddress}${locality ? ', ' + locality : ''}${landmark ? ' (Near ' + landmark + ')' : ''}, ${city || 'City'}, ${stateName || 'State'}`,
        pincode: pinCode || '000000',
        latitude: latitude || 28.6139,
        longitude: longitude || 77.2090,
        email: ownerEmail || user?.email || '',
        phone: businessPhone || user?.phone || '',
        gstNumber: gstNumber || '',
        businessHours,
      };

      let res: Response;
      try {
        res = await fetch(`${API_URL}/sellers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload)
        });
      } catch (networkErr: any) {
        throw new Error(`Unable to connect to server at ${API_URL}. Please ensure backend service is running.`);
      }

      if (!res.ok) {
        let errMessage = 'Registration failed. Please review your details.';
        try {
          const data = await res.json();
          errMessage = Array.isArray(data.message) ? data.message[0] : (data.message || errMessage);
        } catch {}
        throw new Error(errMessage);
      }

      // Sync updated user token & SELLER business session
      try {
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
      } catch {}

      toast.success('Registration successful! Welcome to Merchant Central.');
      router.push('/seller/dashboard');
    } catch (err: any) {
      console.error('Seller Registration Error:', err);
      const friendlyMsg = err.message || 'Failed to complete registration.';
      setError(friendlyMsg);
      toast.error(friendlyMsg);
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
      
      {/* Left Brand Panel */}
      <aside className="hidden lg:flex w-[420px] bg-gradient-to-br from-[#061224] via-[#091e3a] to-[#040c18] text-white p-8 xl:p-10 flex-col justify-between shrink-0 relative overflow-hidden border-r border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-all border border-white/10 mb-8">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-2xl text-slate-950">
              M
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">MarkatVerse</h2>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Merchant Registration</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-8">
            Join thousands of verified manufacturers, wholesalers, retailers, and service providers growing their businesses on MarkatVerse.
          </p>

          {/* Systematic Step Indicator */}
          <div className="space-y-4">
            {steps.map((s) => {
              const isActive = step === s.id;
              const isCompleted = step > s.id;

              return (
                <div key={s.id} className="flex items-center gap-3.5 group">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
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
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs text-slate-400">
            Official Seller Onboarding Portal • Secure SSL Verification
          </span>
        </div>
      </aside>

      {/* Main Form Content */}
      <main className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-y-auto max-w-4xl mx-auto w-full">
        
        <div>
          {/* Header Mobile Stepper */}
          <div className="flex lg:hidden justify-between items-center mb-6 pb-4 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-500">Step {step} of 5: {steps[step - 1]?.label}</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${step >= i ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              ))}
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

          {/* STEP 3: LOCATION & MAP */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <span className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase">Location & Map</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Physical Store & Coordinates</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">Pin your exact shop location so nearby buyers and token queue visitors can find you.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 mb-8">
                {/* Interactive Map Picker */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" /> Pin exact location on Map
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">Click map to drop pin</span>
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

          {/* STEP 4: OPERATING HOURS */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <span className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase">Availability</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Weekly Operating Hours</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">Configure your daily store hours for delivery, pickups, and customer visits.</p>
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
