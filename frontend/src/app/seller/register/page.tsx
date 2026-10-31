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
  UploadCloud, FileCheck, Eye, EyeOff, ExternalLink, AlertCircle,
  CreditCard, QrCode, Check, Zap, X
} from 'lucide-react';

import { getApiUrl } from '@/utils/api';
import { 
  validateGst, 
  validatePan, 
  validateAadhaar, 
  formatAadhaarInput, 
  maskAadhaar, 
  hasValidTaxId 
} from '@/utils/kycValidation';

const API_URL = getApiUrl();

export default function SellerRegistrationPage() {
  const router = useRouter();
  const { user, login, isLoading: authLoading } = useAuth();

  // Current Step: 1 (Model & Categorization) -> 2 (Identity & Profile) -> 3 (Address & Map) -> 4 (Operating Hours) -> 5 (Review & Submit)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registrationFeeConfig, setRegistrationFeeConfig] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'SIMULATED' | 'UPI_QR' | 'PAY_LATER'>('SIMULATED');
  const [manualUtr, setManualUtr] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Step 1: Model & Categorization (Synchronized with backend config)
  const [businessModel, setBusinessModel] = useState<string>('B2C');
  const [businessTypes, setBusinessTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [sectors, setSectors] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Step 2: Business Identity & Contact & KYC
  const [businessName, setBusinessName] = useState<string>('');
  const [businessPhone, setBusinessPhone] = useState<string>('');
  const [hasGst, setHasGst] = useState<boolean>(true);
  const [gstNumber, setGstNumber] = useState<string>('');
  const [panNumber, setPanNumber] = useState<string>('');
  const [aadharNumber, setAadharNumber] = useState<string>('');
  const [idProofType, setIdProofType] = useState<'AADHAAR' | 'PAN' | 'GST'>('AADHAAR');
  const [idProofUrl, setIdProofUrl] = useState<string>('');
  const [idProofFileName, setIdProofFileName] = useState<string>('');
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerEmail, setOwnerEmail] = useState<string>('');
  const [showMaskedAadhaar, setShowMaskedAadhaar] = useState<boolean>(true);

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

  // Fetch live registration fee & occasion discount configuration
  useEffect(() => {
    fetch(`${API_URL}/commercial/registration-fee`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') setRegistrationFeeConfig(data);
      })
      .catch(() => {});
  }, []);

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
      { id: 'b2c_all', name: 'All Products' },
      { id: 'b2c_electronics', name: 'Electronics' },
      { id: 'b2c_fashion', name: 'Fashion' },
      { id: 'b2c_grocery', name: 'Grocery & FMCG' },
      { id: 'b2c_home', name: 'Home & Kitchen' },
      { id: 'b2c_beauty', name: 'Beauty, Cosmetics & Personal Care' },
      { id: 'b2c_auto', name: 'Automotive Parts & Accessories' },
      { id: 'b2c_sports', name: 'Sports, Fitness & Outdoor' },
      { id: 'b2c_books', name: 'Books, Stationery & Office Supplies' },
      { id: 'b2c_toys', name: 'Baby Care & Toys' },
      { id: 'b2c_health', name: 'Healthcare & Medical Devices' },
    ],
    'B2B': [
      { id: 'b2b_all', name: 'All Products' },
      { id: 'b2b_wholesale', name: 'Wholesale & Distribution' },
      { id: 'b2b_mfg', name: 'Manufacturing & Industrial' },
      { id: 'b2b_construction', name: 'Construction' },
      { id: 'b2b_fmcg', name: 'Grocery & FMCG' },
      { id: 'b2b_electronics', name: 'Electronics' },
      { id: 'b2b_industrial', name: 'Industrial Machinery & Tools' },
      { id: 'b2b_agriculture', name: 'Agriculture' },
      { id: 'b2b_auto', name: 'Automotive Parts & Accessories' },
    ],
    'BOTH': [
      { id: 'both_all', name: 'All Products' },
      { id: 'both_retail_wholesale', name: 'Both B2B & B2C' },
      { id: 'both_electronics', name: 'Electronics' },
      { id: 'both_fashion', name: 'Fashion' },
      { id: 'both_grocery', name: 'Grocery & FMCG' },
      { id: 'both_home', name: 'Home & Kitchen' },
      { id: 'both_construction', name: 'Construction' },
      { id: 'both_industrial', name: 'Industrial Machinery & Tools' },
    ],
    'SERVICE': [
      { id: 'srv_carwash', name: 'Automobile & Car Wash' },
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

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setIsUploadingDoc(true);
    setIdProofFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('files', file);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = data.urls?.[0];
        if (uploadedUrl) {
          setIdProofUrl(uploadedUrl);
          toast.success('KYC Document uploaded successfully!');
          return;
        }
      }

      // Fallback: Read as Base64 data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdProofUrl(reader.result as string);
        toast.success('KYC Document attached successfully!');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.warn('Upload fallback to FileReader:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdProofUrl(reader.result as string);
        toast.success('KYC Document attached locally!');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleFinalRegistration = async (feeDetails?: {
    paid: boolean;
    amount: number;
    status: string;
    paymentId?: string | null;
  }) => {
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

      const cleanedAadhaar = aadharNumber.replace(/\D/g, '');
      const cleanedGst = gstNumber.trim().toUpperCase();
      const cleanedPan = (panNumber.trim().toUpperCase() || (cleanedGst.length === 15 ? cleanedGst.substring(2, 12) : ''));

      const feePaid = feeDetails ? feeDetails.paid : (!registrationFeeConfig?.isEnabled || registrationFeeConfig?.effectiveFee === 0);
      const feeAmount = feeDetails ? feeDetails.amount : (registrationFeeConfig?.effectiveFee || 0);
      const feeStatus = feeDetails ? feeDetails.status : (feePaid ? 'WAIVED' : 'PENDING');
      const feePaymentId = feeDetails?.paymentId || (feePaid && feeAmount === 0 ? 'FREE_ONBOARDING' : null);

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
        gstNumber: cleanedGst,
        panNumber: cleanedPan,
        aadharNumber: cleanedAadhaar,
        idProofType: idProofType || 'AADHAAR',
        idProofUrl: idProofUrl || '',
        businessHours,
        registrationFeePaid: feePaid,
        registrationFeeAmount: feeAmount,
        registrationFeeStatus: feeStatus,
        registrationPaymentId: feePaymentId,
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

          {/* STEP 2: BUSINESS PROFILE & KYC IDENTIFICATION */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <span className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase">Identity & KYC Verification</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Business & KYC Information</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Enter your official business identifiers, Aadhaar, PAN / GST, and upload document proof for admin phone KYC verification.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 mb-8">
                
                {/* Store Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                      Business / Store Name <span className="text-rose-500">*</span>
                    </label>
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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                      Business Phone <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        type="tel"
                        maxLength={10}
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number for KYC call"
                        className="w-full p-3.5 pl-11 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Admin will call this phone to complete KYC</span>
                  </div>
                </div>

                {/* Tax Identification (GST / PAN) Section */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Tax Identification (GST or PAN) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => { setHasGst(true); }}
                        className={`px-3 py-1 rounded-md transition-all ${hasGst ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        I have GSTIN
                      </button>
                      <button
                        type="button"
                        onClick={() => { setHasGst(false); }}
                        className={`px-3 py-1 rounded-md transition-all ${!hasGst ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        PAN Only (GST Exempt)
                      </button>
                    </div>
                  </div>

                  {hasGst ? (
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={15}
                          value={gstNumber}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
                            setGstNumber(val);
                            if (val.length === 15) {
                              setPanNumber(val.substring(2, 12));
                            }
                          }}
                          placeholder="e.g. 07AAAAA0000A1Z5 (15 Characters)"
                          className={`w-full p-3.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white transition-all font-mono font-bold uppercase tracking-wider ${
                            gstNumber.length > 0 
                              ? (validateGst(gstNumber).valid ? 'border-emerald-500 bg-emerald-50/20' : 'border-amber-400') 
                              : 'border-slate-200 focus:border-emerald-500'
                          }`}
                        />
                        {gstNumber.length === 15 && validateGst(gstNumber).valid && (
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Valid GST
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-1 text-[11px]">
                        <span className="text-slate-500">Format: 2-digit state code + 10-digit PAN + entity & checksum</span>
                        {gstNumber.length > 0 && !validateGst(gstNumber).valid && (
                          <span className="text-amber-600 font-semibold">{validateGst(gstNumber).message}</span>
                        )}
                      </div>
                      {panNumber && validatePan(panNumber).valid && (
                        <div className="mt-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-[11px] text-emerald-800 font-medium flex items-center justify-between">
                          <span>Linked PAN extracted from GST: <strong className="font-mono">{panNumber}</strong></span>
                          <span className="text-emerald-700 font-bold">✓ Verified</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={10}
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ''))}
                          placeholder="e.g. ABCDE1234F (10 Characters)"
                          className={`w-full p-3.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white transition-all font-mono font-bold uppercase tracking-wider ${
                            panNumber.length > 0 
                              ? (validatePan(panNumber).valid ? 'border-emerald-500 bg-emerald-50/20' : 'border-amber-400') 
                              : 'border-slate-200 focus:border-emerald-500'
                          }`}
                        />
                        {panNumber.length === 10 && validatePan(panNumber).valid && (
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Valid PAN
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-1 text-[11px]">
                        <span className="text-slate-500">Format: 5 letters + 4 digits + 1 letter (Income Tax PAN)</span>
                        {panNumber.length > 0 && !validatePan(panNumber).valid && (
                          <span className="text-amber-600 font-semibold">{validatePan(panNumber).message}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Aadhaar Number Section */}
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Authorized Person Aadhaar Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={14}
                      value={aadharNumber}
                      onChange={(e) => setAadharNumber(formatAadhaarInput(e.target.value))}
                      placeholder="XXXX XXXX XXXX (12 Digits)"
                      className={`w-full p-3.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white transition-all font-mono font-bold tracking-widest ${
                        aadharNumber.replace(/\D/g, '').length > 0
                          ? (validateAadhaar(aadharNumber).valid ? 'border-emerald-500 bg-emerald-50/20' : 'border-amber-400')
                          : 'border-slate-200 focus:border-emerald-500'
                      }`}
                    />
                    {validateAadhaar(aadharNumber).valid && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Valid Aadhaar
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[11px]">
                    <span className="text-slate-500">UIDAI compliant 12-digit individual Aadhaar identity</span>
                    {aadharNumber.replace(/\D/g, '').length > 0 && !validateAadhaar(aadharNumber).valid && (
                      <span className="text-amber-600 font-semibold">{validateAadhaar(aadharNumber).message}</span>
                    )}
                  </div>
                </div>

                {/* Document Proof Upload Section */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-emerald-600" />
                      Upload Real ID / Document Proof <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">Select Proof Type:</span>
                      <select
                        value={idProofType}
                        onChange={(e) => setIdProofType(e.target.value as any)}
                        className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="AADHAAR">Aadhaar Card</option>
                        <option value="PAN">PAN Card</option>
                        <option value="GST">GST Registration Certificate</option>
                      </select>
                    </div>
                  </div>

                  {!idProofUrl ? (
                    <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all group">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,application/pdf"
                        onChange={handleDocumentUpload}
                        disabled={isUploadingDoc}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600 group-hover:scale-105 group-hover:text-emerald-600 transition-all mb-3">
                        {isUploadingDoc ? (
                          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UploadCloud className="w-6 h-6" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 text-center">
                        {isUploadingDoc ? 'Uploading & verifying document...' : `Click or Drag to Upload Real ${idProofType === 'AADHAAR' ? 'Aadhaar Card' : idProofType === 'PAN' ? 'PAN Card' : 'GST Certificate'}`}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Accepts PDF, JPG, PNG or WEBP (Max 10 MB)</p>
                    </label>
                  ) : (
                    <div className="p-4 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {idProofFileName || `${idProofType}_Proof_Document`}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                              ✓ Attached
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Type: <span className="font-semibold text-slate-700">{idProofType} Card</span> • Ready for admin KYC review
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {idProofUrl.startsWith('http') && (
                          <a
                            href={idProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => { setIdProofUrl(''); setIdProofFileName(''); }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Owner & Email Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Owner / Authorized Name</label>
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

              {/* Step Navigation with KYC Form Guard */}
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
                  onClick={() => {
                    if (!businessName.trim()) {
                      toast.error('Please enter your business / store name');
                      return;
                    }
                    if (!businessPhone.trim() || businessPhone.replace(/\D/g, '').length !== 10) {
                      toast.error('Please enter a valid 10-digit mobile number for the admin KYC verification call');
                      return;
                    }
                    if (hasGst) {
                      if (!validateGst(gstNumber).valid) {
                        toast.error(validateGst(gstNumber).message || 'Please enter a valid 15-character GSTIN');
                        return;
                      }
                    } else {
                      if (!validatePan(panNumber).valid) {
                        toast.error(validatePan(panNumber).message || 'Please enter a valid 10-character PAN number');
                        return;
                      }
                    }
                    if (!validateAadhaar(aadharNumber).valid) {
                      toast.error(validateAadhaar(aadharNumber).message || 'Please enter a valid 12-digit Aadhaar number');
                      return;
                    }
                    if (!idProofUrl) {
                      toast.error('Please upload your real Aadhaar card, PAN card, or GST certificate');
                      return;
                    }
                    setStep(3);
                  }}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
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
                <span className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase">Verification & Launch</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Review & Submit for Verification</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Please review your business & KYC information. Upon submission, an admin officer will review your documents and verify your store via phone.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 mb-8">
                
                {/* Store & Classification Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Store Name</span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{businessName}</h3>
                    <p className="text-xs text-emerald-700 font-bold mt-1">Model: {businessModel}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Sector & Classification</span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{selectedSector || 'General'}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Contact: +91-{businessPhone}</p>
                  </div>
                </div>

                {/* KYC & Identity Verification Summary */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Submitted KYC Identifiers
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Pending Admin Call
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-white rounded-lg border border-slate-200/70">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tax ID / GSTIN</span>
                      <span className="font-mono text-xs font-bold text-slate-900 break-all">
                        {gstNumber || 'GST Exempt'}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200/70">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">PAN Number</span>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {panNumber || (gstNumber.length === 15 ? gstNumber.substring(2, 12) : 'N/A')}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200/70">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Aadhaar Number</span>
                        <button
                          type="button"
                          onClick={() => setShowMaskedAadhaar(!showMaskedAadhaar)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {showMaskedAadhaar ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {showMaskedAadhaar ? maskAadhaar(aadharNumber) : aadharNumber}
                      </span>
                    </div>
                  </div>

                  {/* Document Proof Badge */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="text-xs text-slate-800">
                        <span className="font-bold">{idProofType} Card Document:</span>{' '}
                        <span className="text-slate-600 font-medium">{idProofFileName || 'Proof Document Uploaded'}</span>
                      </div>
                    </div>
                    {idProofUrl && idProofUrl.startsWith('http') && (
                      <a
                        href={idProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline text-xs font-bold flex items-center gap-1"
                      >
                        Preview <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
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

                {/* Live Merchant Registration Fee & Occasion Discount Card */}
                {registrationFeeConfig && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-200/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> One-Time Merchant Registration Fee
                        </span>
                        <h4 className="text-base font-black text-slate-900 mt-0.5">
                          Verified Store Onboarding Package
                        </h4>
                      </div>

                      {registrationFeeConfig.isDiscountActive && registrationFeeConfig.savingsAmount > 0 && (
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-sm animate-pulse">
                          {registrationFeeConfig.discountType === 'WAIVED' 
                            ? '100% Free Waiver' 
                            : registrationFeeConfig.discountType === 'PERCENTAGE'
                              ? `${registrationFeeConfig.discountValue}% Festive Discount`
                              : `₹${registrationFeeConfig.discountValue} Flat Discount`}
                        </span>
                      )}
                    </div>

                    {/* Occasion Banner */}
                    {registrationFeeConfig.isDiscountActive && registrationFeeConfig.occasionName && (
                      <div className="p-3 bg-gradient-to-r from-pink-50 to-amber-50 border border-pink-200 rounded-xl">
                        <div className="text-xs font-extrabold text-pink-700 flex items-center gap-1.5">
                          <span>🎉 {registrationFeeConfig.occasionName}</span>
                        </div>
                        {registrationFeeConfig.discountReason && (
                          <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                            {registrationFeeConfig.discountReason}
                          </p>
                        )}
                        {registrationFeeConfig.validUntil && (
                          <div className="text-[10px] text-slate-400 font-semibold mt-1">
                            Valid through: {registrationFeeConfig.validUntil}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="p-4 bg-white rounded-xl border border-indigo-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-bold block">Payable Fee</span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">
                            {registrationFeeConfig.effectiveFee === 0 ? 'FREE' : `₹${registrationFeeConfig.effectiveFee.toLocaleString('en-IN')}`}
                          </span>
                          {registrationFeeConfig.savingsAmount > 0 && (
                            <span className="text-xs sm:text-sm text-slate-400 font-semibold line-through">
                              ₹{registrationFeeConfig.baseFee?.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {registrationFeeConfig.taxAmount > 0 && (
                          <span className="text-[10px] text-indigo-600 font-semibold block mt-1">
                            Base ₹{registrationFeeConfig.discountedBase} + 18% GST (₹{registrationFeeConfig.taxAmount})
                          </span>
                        )}
                      </div>

                      {registrationFeeConfig.savingsAmount > 0 && (
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black inline-block">
                            Save ₹{registrationFeeConfig.savingsAmount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">One-time lifetime access</span>
                        </div>
                      )}
                    </div>

                    {/* Included Benefits (Full text with zero truncation) */}
                    {Array.isArray(registrationFeeConfig.benefits) && registrationFeeConfig.benefits.length > 0 && (
                      <div className="pt-1 space-y-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                          Included with this registration:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {registrationFeeConfig.benefits.map((b: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-snug font-medium">{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notice of Admin Call & Journey */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong className="font-bold block text-amber-950 mb-0.5">Admin KYC Phone Verification Protocol</strong>
                    Upon submitting, your store status will be <span className="font-bold underline">Pending Verification</span>. 
                    An administrator will review your submitted documents and place a brief verification call to <strong>+91-{businessPhone}</strong>.
                    Once approved, your store will be fully activated and ready to start your journey on MarkatVerse!
                  </div>
                </div>

                {/* Mandatory Legal Terms & Indemnity Agreement Checkbox */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="leading-relaxed">
                      I have read, understood, and unconditionally agree to the{' '}
                      <Link href="/terms" target="_blank" className="font-bold text-emerald-600 underline hover:text-emerald-700">
                        MarkatVerse Terms of Service, Sector Disclaimers & Seller Indemnity Agreement
                      </Link>
                      . I acknowledge that MarkatVerse operates strictly as an intermediary technology marketplace under Section 79 of the IT Act, and as a seller, I assume 100% legal, regulatory (FSSAI/GST), and quality liability for my products, food items, or services.
                    </span>
                  </label>
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
                {registrationFeeConfig && registrationFeeConfig.isEnabled && registrationFeeConfig.effectiveFee > 0 ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (!agreedToTerms) {
                        toast.error('Please agree to the Terms of Service & Seller Indemnity Agreement to continue.');
                        return;
                      }
                      setShowPaymentModal(true);
                    }}
                    className={`px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 ${
                      !agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Pay ₹{registrationFeeConfig.effectiveFee} & Submit Registration ✓
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (!agreedToTerms) {
                        toast.error('Please agree to the Terms of Service & Seller Indemnity Agreement to continue.');
                        return;
                      }
                      handleFinalRegistration({ paid: true, amount: 0, status: 'WAIVED', paymentId: 'FREE_ONBOARDING' });
                    }}
                    className={`px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 ${
                      !agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Complete Free Registration & Launch 🚀'}
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

      
        {/* Registration Fee Payment Checkout Modal */}
        {showPaymentModal && registrationFeeConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Merchant Checkout
                  </span>
                  <h3 className="text-lg font-black mt-0.5">Store Registration Fee</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Amount Due Banner */}
              <div className="p-5 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-600 font-semibold block">Total Payable Onboarding Fee:</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-slate-900">₹{registrationFeeConfig.effectiveFee}</span>
                    {registrationFeeConfig.savingsAmount > 0 && (
                      <span className="text-xs text-slate-400 line-through">₹{registrationFeeConfig.baseFee}</span>
                    )}
                  </div>
                  {registrationFeeConfig.taxAmount > 0 && (
                    <span className="text-[11px] text-indigo-700 font-semibold block mt-1">
                      (Taxable Amount: ₹{registrationFeeConfig.discountedBase} + 18% GST: ₹{registrationFeeConfig.taxAmount})
                    </span>
                  )}
                </div>
                {registrationFeeConfig.savingsAmount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                    Saved ₹{registrationFeeConfig.savingsAmount}
                  </span>
                )}
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="p-6 space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Payment Method:
                </span>

                <div className="space-y-2.5">
                  {/* Option 1: Instant Gateway (Fast Testing) */}
                  <label
                    onClick={() => setPaymentMethod('SIMULATED')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'SIMULATED' ? 'border-emerald-500 bg-emerald-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'SIMULATED'}
                      onChange={() => setPaymentMethod('SIMULATED')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">⚡ Instant Mock Verification Gateway</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                          Fast Test
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Instantly verifies the ₹{registrationFeeConfig.effectiveFee} registration fee with an official transaction ID (PAY-MKV-...) for quick testing.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Scan UPI QR */}
                  <label
                    onClick={() => setPaymentMethod('UPI_QR')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'UPI_QR' ? 'border-emerald-500 bg-emerald-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'UPI_QR'}
                      onChange={() => setPaymentMethod('UPI_QR')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">📱 UPI QR / Bank Transfer</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Scan with GPay, PhonePe, or Paytm and enter your 12-digit UPI UTR reference number.
                      </p>
                      
                      {paymentMethod === 'UPI_QR' && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <div className="text-[11px] font-mono text-slate-600">
                            Merchant VPA: <strong className="text-slate-900">pay-merchant@markatverse</strong>
                          </div>
                          <input
                            type="text"
                            placeholder="Enter 12-digit UTR / Reference No."
                            value={manualUtr}
                            onChange={(e) => setManualUtr(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Option 3: Pay Later on Call */}
                  <label
                    onClick={() => setPaymentMethod('PAY_LATER')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'PAY_LATER' ? 'border-indigo-500 bg-indigo-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'PAY_LATER'}
                      onChange={() => setPaymentMethod('PAY_LATER')}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">📞 Pay Later on Admin Phone Verification</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Submit now. Fee will be verified or collected during your scheduled admin verification call.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Confirm Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting || (paymentMethod === 'UPI_QR' && !manualUtr.trim())}
                    onClick={() => {
                      if (paymentMethod === 'SIMULATED') {
                        const mockId = 'PAY-MKV-' + Date.now().toString().slice(-8);
                        setShowPaymentModal(false);
                        handleFinalRegistration({
                          paid: true,
                          amount: registrationFeeConfig.effectiveFee,
                          status: 'PAID',
                          paymentId: mockId
                        });
                      } else if (paymentMethod === 'UPI_QR') {
                        setShowPaymentModal(false);
                        handleFinalRegistration({
                          paid: true,
                          amount: registrationFeeConfig.effectiveFee,
                          status: 'PAID',
                          paymentId: manualUtr.trim()
                        });
                      } else {
                        setShowPaymentModal(false);
                        handleFinalRegistration({
                          paid: false,
                          amount: registrationFeeConfig.effectiveFee,
                          status: 'PENDING',
                          paymentId: null
                        });
                      }
                    }}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Processing Registration...'
                    ) : paymentMethod === 'PAY_LATER' ? (
                      'Submit Application (Pay Later) →'
                    ) : (
                      `Confirm ₹${registrationFeeConfig.effectiveFee} Payment & Complete Registration ✓`
                    )}
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
