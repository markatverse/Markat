"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LocationPicker from '@/components/LocationPicker';
import toast from 'react-hot-toast';
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft, UploadCloud, FileCheck, FileText, CheckCircle2, Sparkles, Building2, MapPin, Loader2, Copy, Zap, Clock, BookOpen, X } from 'lucide-react';

import { getApiUrl } from '@/utils/api';
import { validateGst, validatePan, validateAadhaar, formatAadhaarInput } from '@/utils/kycValidation';

const API_URL = getApiUrl();

// Helper to convert 24h "HH:mm" to 12h display string e.g. "09:00 AM"
const formatTo12Hour = (time24: string): string => {
  if (!time24) return '09:00 AM';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${m} ${period}`;
};

// Standard 30-minute intervals for 12h selection
const STANDARD_TIME_OPTIONS_12H: { value: string; label: string }[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const label = `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
    STANDARD_TIME_OPTIONS_12H.push({ value: val, label });
  }
}
STANDARD_TIME_OPTIONS_12H.push({ value: '23:59', label: '11:59 PM' });

export default function SellerOnboarding() {
  const router = useRouter();
  const { user, login, isLoading: authLoading } = useAuth();
  // 'new'  = email is fresh, needs OTP signup
  // 'existing' = email belongs to existing account, needs password login
  const [accountMode, setAccountMode] = useState<'new' | 'existing'>('new');
  // step 1 = account (new or login), 1.2 = OTP verify (new only), 2+ = business steps
  const [step, setStep] = useState<number>(authLoading ? -1 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationFeeConfig, setRegistrationFeeConfig] = useState<any>(null);

  React.useEffect(() => {
    fetch(`${API_URL}/commercial/registration-fee`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') setRegistrationFeeConfig(data);
      })
      .catch(() => {});
  }, []);

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

  // Business Info & KYC
  const [businessName, setBusinessName] = useState('');
  const [hasGstRegistration, setHasGstRegistration] = useState(true);
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [idProofType, setIdProofType] = useState<'AADHAAR' | 'PAN' | 'GST'>('GST');
  const [idProofUrl, setIdProofUrl] = useState('');
  const [idProofFileName, setIdProofFileName] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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
  const [subLocality, setSubLocality] = useState('');
  const [isCustomLocality, setIsCustomLocality] = useState(false);
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
  const [timeFormat, setTimeFormat] = useState<'12' | '24'>('12');

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
        let exactLocality = nomData.address.suburb || nomData.address.village || nomData.address.town || bdcData.locality || '';
        if (!exactLocality && nomData.display_name) {
          exactLocality = nomData.display_name.split(',')[1]?.trim() || '';
        }

        // Sub-locality, neighbourhood, mohalla, or tola
        let detectedSubLocality = nomData.address.neighbourhood || nomData.address.hamlet || nomData.address.quarter || nomData.address.residential || '';
        if (detectedSubLocality === exactLocality || detectedSubLocality === newCity) {
          detectedSubLocality = '';
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
        if (detectedSubLocality) setSubLocality(detectedSubLocality);
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

  // Comprehensive Product Categories strictly for Product Selling (including 'All Products' multi-category)
  const PRODUCT_SECTORS: Record<string, string[]> = {
    'All Products': ['All'],
    'Electronics': ['All'],
    'Fashion': ['All'],
    'Grocery & FMCG': ['All'],
    'Home & Kitchen': ['All'],
    'Beauty, Cosmetics & Personal Care': ['All'],
    'Automotive Parts & Accessories': ['All'],
    'Construction': ['All'],
    'Industrial Machinery & Tools': ['All'],
    'Sports, Fitness & Outdoor': ['All'],
    'Books, Stationery & Office Supplies': ['All'],
    'Baby Care & Toys': ['All'],
    'Agriculture': ['All'],
    'Healthcare & Medical Devices': ['All']
  };

  const taxonomy: Record<string, Record<string, string[]>> = {
    'Manufacturer': PRODUCT_SECTORS,
    'Wholesaler': PRODUCT_SECTORS,
    'Retailer': PRODUCT_SECTORS,
    'Service Provider': {
      'Automobile & Car Wash': ['All'],
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
  const currentSectors = primaryOffering === 'PRODUCT'
    ? Object.keys(PRODUCT_SECTORS)
    : Object.keys(taxonomy[sellerRole] || {});

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

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }
    setIsUploadingDoc(true);
    setIdProofFileName(file.name);
    try {
      const formData = new FormData();
      formData.append('files', file);
      const token = registeredToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.urls?.[0]) {
          setIdProofUrl(data.urls[0]);
          toast.success('Document uploaded!');
          return;
        }
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdProofUrl(reader.result as string);
        toast.success('Document attached!');
      };
      reader.readAsDataURL(file);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdProofUrl(reader.result as string);
        toast.success('Document attached!');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mandatory Terms & Conditions check (must read and tick)
    if (!termsAccepted || !hasReadTerms) {
      toast.error('Please read and tick the mandatory Terms of Service & Seller Agreement');
      setShowTermsModal(true);
      return;
    }

    // 2. Documentation validation:
    // If hasGstRegistration: GSTIN and GST Certificate are required. Aadhaar is NOT required.
    // If !hasGstRegistration: Aadhaar card number and Aadhaar document are STRICTLY MANDATORY.
    if (hasGstRegistration) {
      if (!gstNumber || !validateGst(gstNumber).valid) {
        toast.error(validateGst(gstNumber).message || 'Valid 15-character GSTIN is required for registered businesses');
        return;
      }
      if (!idProofUrl) {
        toast.error('Please upload your official GST Certificate document');
        return;
      }
      if (aadharNumber && !validateAadhaar(aadharNumber).valid) {
        toast.error(validateAadhaar(aadharNumber).message || 'Invalid Aadhaar number format');
        return;
      }
    } else {
      if (!aadharNumber || !validateAadhaar(aadharNumber).valid) {
        toast.error('Valid 12-digit Aadhaar Card number is mandatory when GST is not provided');
        return;
      }
      if (!idProofUrl) {
        toast.error('Please upload your official Aadhaar Card document proof');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = registeredToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      let res: Response;
      const cleanedAadhaar = aadharNumber.replace(/\D/g, '');
      const cleanedGst = gstNumber.trim().toUpperCase();
      const cleanedPan = panNumber.trim().toUpperCase() || (cleanedGst.length === 15 ? cleanedGst.substring(2, 12) : '');

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
            address: `${businessLocation || ''}${subLocality ? ', ' + subLocality : ''}${locality ? ', ' + locality : ''}${landmark ? ', ' + landmark : ''}, ${city || 'City'}, ${stateName || 'State'}`,
            pincode: pinCode || '000000',
            latitude: latitude || 28.6139,
            longitude: longitude || 77.2090,
            email: email || '',
            phone: phone || '',
            gstNumber: cleanedGst,
            panNumber: cleanedPan,
            aadharNumber: cleanedAadhaar,
            idProofType,
            idProofUrl,
            businessHours,
            registrationFeePaid: !registrationFeeConfig?.isEnabled || registrationFeeConfig?.effectiveFee === 0,
            registrationFeeAmount: registrationFeeConfig?.effectiveFee || 0,
            registrationFeeStatus: (!registrationFeeConfig?.isEnabled || registrationFeeConfig?.effectiveFee === 0) ? 'WAIVED' : 'PAID',
            registrationPaymentId: (!registrationFeeConfig?.isEnabled || registrationFeeConfig?.effectiveFee === 0) ? 'FREE_ONBOARDING' : ('PAY-MKV-' + Date.now().toString().slice(-8)),
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
    { num: 3, label: 'Category' },
    { num: 4, label: 'Hours' },
    { num: 5, label: 'Documents' }
  ];

  const inputClasses = "w-full p-4 pl-12 rounded-2xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-400 text-sm";
  const selectClasses = "w-full p-4 rounded-2xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all text-sm";
  const labelClasses = "block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider";
  const btnPrimary = "w-full py-4 bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-bold transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm";
  const compactInput = "w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 text-sm";
  const compactSelect = "w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm";
  const compactLabel = "block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide";

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
        <div className="w-full max-w-[460px] sm:max-w-[480px]">
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
            <div className="bg-transparent py-2">
              <div className="mb-4 sm:mb-5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>🏢</span> Business Profile
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  Basic details about your business and store location
                </p>
              </div>

              <form onSubmit={e => {
                e.preventDefault();
                if (!businessName.trim()) {
                  toast.error('Please enter your business / store name');
                  return;
                }
                if (!pinCode || pinCode.length !== 6) {
                  toast.error('Please enter a valid 6-digit PIN code');
                  return;
                }
                if (!businessLocation.trim()) {
                  toast.error('Please enter your shop number and street name');
                  return;
                }
                setStep(3);
              }} className="space-y-3.5 sm:space-y-4">

                {/* 1. Legal Business Name */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <label className={compactLabel}>
                    Legal Business Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input 
                      required 
                      type="text" 
                      value={businessName} 
                      onChange={e => setBusinessName(e.target.value)} 
                      placeholder="e.g. ACME Corp / Rajesh General Store" 
                      className={`${compactInput} pl-10`} 
                    />
                  </div>
                </div>

                {/* 2. Interactive Ground-Level Map Box */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Pinpoint Ground Location on Map
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                        📍 Drag pin to shop entrance • Switch to 🛰️ Satellite
                      </span>
                      {isFetchingPin && (
                        <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-semibold animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> Fetching address...
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <LocationPicker 
                    latitude={latitude} 
                    longitude={longitude} 
                    onChange={handleLocationChange} 
                    className="h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-200 shadow-2xs"
                  />
                </div>

                {/* 3. Structured Address Details */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    Address &amp; Store Details
                  </h3>

                  {/* 2-Column Responsive Grid for Geographic Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Row 1: PIN Code & State */}
                    <div>
                      <label className={compactLabel}>
                        PIN Code <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        required 
                        type="text" 
                        maxLength={6} 
                        value={pinCode} 
                        onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))} 
                        placeholder="e.g. 110001" 
                        className={compactInput} 
                      />
                    </div>

                    <div>
                      <label className={compactLabel}>
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        required 
                        type="text" 
                        value={stateName} 
                        onChange={e => setStateName(e.target.value)} 
                        placeholder="e.g. Bihar / Delhi" 
                        className={compactInput} 
                      />
                    </div>

                    {/* Row 2: City / District & Locality / Suburb */}
                    <div>
                      <label className={compactLabel}>
                        City / District <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        required 
                        type="text" 
                        value={city} 
                        onChange={e => setCity(e.target.value)} 
                        placeholder="e.g. Vaishali / Gurgaon" 
                        className={compactInput} 
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`${compactLabel} mb-0`}>Locality</label>
                        {areas.length > 0 && (
                          <button 
                            type="button" 
                            onClick={() => { setIsCustomLocality(!isCustomLocality); }}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                          >
                            {isCustomLocality ? '← Pick from list' : '+ Custom'}
                          </button>
                        )}
                      </div>
                      {areas.length > 0 && !isCustomLocality ? (
                        <select 
                          className={compactSelect} 
                          value={locality} 
                          onChange={e => {
                            if (e.target.value === '__custom__') {
                              setIsCustomLocality(true);
                              setLocality('');
                            } else {
                              setLocality(e.target.value);
                            }
                          }}
                        >
                          <option value="" disabled>Select Area</option>
                          {areas.map(a => <option key={a} value={a}>{a}</option>)}
                          <option value="__custom__">+ Enter custom locality...</option>
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={locality} 
                          onChange={e => setLocality(e.target.value)} 
                          placeholder="e.g. Paura / Arjun Nagar" 
                          className={compactInput} 
                        />
                      )}
                    </div>
                  </div>

                  {/* Full-Width Street Address */}
                  <div>
                    <label className={compactLabel}>
                      Shop No., Building &amp; Street / Gali Name <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={businessLocation} 
                      onChange={e => setBusinessLocation(e.target.value)} 
                      placeholder="e.g. Shop No. 12, Main Street / Gali No. 4" 
                      className={compactInput} 
                    />
                  </div>

                  {/* Single Full-Width Field: Nearby Landmark / Also Known As (Near Me) */}
                  <div>
                    <label className={compactLabel}>
                      Nearby Landmark / Also Known As (Near Me) <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input 
                      type="text" 
                      value={landmark} 
                      onChange={e => setLandmark(e.target.value)} 
                      placeholder="e.g. Near City Mall / Opp. High School / Near Shiv Mandir / Ward No. 4" 
                      className={compactInput} 
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  {!user && (
                    <button 
                      type="button" 
                      onClick={() => setStep(1)} 
                      className="px-5 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm bg-white hover:bg-slate-50 transition-all shadow-2xs"
                    >
                      ← Back
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    Next: Features →
                  </button>
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
                        {currentSectors.map(sec => (
                          <option key={sec} value={sec}>
                            {sec === 'All Products' ? '🌟 All Products (Multi-Category / General Store)' : sec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(2)} className="px-6 py-4 border border-slate-300 text-slate-700 rounded-2xl font-bold text-sm bg-white hover:bg-slate-50">← Back</button>
                  <button type="submit" disabled={!mainType} className={btnPrimary}>Next: Hours →</button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: HOURS */}
          {step === 4 && (
            <div className="bg-transparent py-2">
              <div className="mb-4 sm:mb-5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>🕒</span> Business Hours
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  Set the opening and closing schedule for your store listings and customer visits
                </p>
              </div>

              {/* Short & Sleek Quick Presets + 12h/24h Format Selector Toolbar */}
              <div className="flex items-center justify-between gap-2 mb-3 bg-slate-50/90 p-1.5 rounded-xl border border-slate-200/80 text-xs">
                {/* Left: Quick Presets */}
                <div className="flex items-center gap-1 overflow-x-auto min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-0.5">
                    <Zap className="w-3 h-3 text-amber-500" /> Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessHours({
                        monday: { open: '09:00', close: '20:00', closed: false },
                        tuesday: { open: '09:00', close: '20:00', closed: false },
                        wednesday: { open: '09:00', close: '20:00', closed: false },
                        thursday: { open: '09:00', close: '20:00', closed: false },
                        friday: { open: '09:00', close: '20:00', closed: false },
                        saturday: { open: '09:00', close: '20:00', closed: false },
                        sunday: { open: '09:00', close: '20:00', closed: true },
                      });
                      toast.success(timeFormat === '12' ? 'Applied Mon–Sat (09:00 AM – 08:00 PM)' : 'Applied Mon–Sat (09:00 – 20:00)');
                    }}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-indigo-700 font-bold text-[11px] shadow-2xs whitespace-nowrap cursor-pointer transition-all"
                  >
                    Mon–Sat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessHours({
                        monday: { open: '09:00', close: '21:00', closed: false },
                        tuesday: { open: '09:00', close: '21:00', closed: false },
                        wednesday: { open: '09:00', close: '21:00', closed: false },
                        thursday: { open: '09:00', close: '21:00', closed: false },
                        friday: { open: '09:00', close: '21:00', closed: false },
                        saturday: { open: '09:00', close: '21:00', closed: false },
                        sunday: { open: '09:00', close: '21:00', closed: false },
                      });
                      toast.success(timeFormat === '12' ? 'Applied All 7 Days (09:00 AM – 09:00 PM)' : 'Applied All 7 Days (09:00 – 21:00)');
                    }}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-emerald-700 font-bold text-[11px] shadow-2xs whitespace-nowrap cursor-pointer transition-all"
                  >
                    All Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessHours({
                        monday: { open: '00:00', close: '23:59', closed: false },
                        tuesday: { open: '00:00', close: '23:59', closed: false },
                        wednesday: { open: '00:00', close: '23:59', closed: false },
                        thursday: { open: '00:00', close: '23:59', closed: false },
                        friday: { open: '00:00', close: '23:59', closed: false },
                        saturday: { open: '00:00', close: '23:59', closed: false },
                        sunday: { open: '00:00', close: '23:59', closed: false },
                      });
                      toast.success('Applied 24/7 Always Open');
                    }}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-slate-700 font-bold text-[11px] shadow-2xs whitespace-nowrap cursor-pointer transition-all"
                  >
                    24/7
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const mon = (businessHours as any).monday;
                      setBusinessHours({
                        ...businessHours,
                        tuesday: { ...mon },
                        wednesday: { ...mon },
                        thursday: { ...mon },
                        friday: { ...mon },
                        saturday: { ...mon },
                      });
                      toast.success(
                        mon.closed 
                          ? 'Copied Monday (Closed) to Tue�Sat' 
                          : `Copied Monday hours (${timeFormat === '12' ? `${formatTo12Hour(mon.open)} � ${formatTo12Hour(mon.close)}` : `${mon.open} � ${mon.close}`}) to Tue�Sat`
                      );
                    }}
                    title="Copy Monday hours to Tuesday�Saturday"
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 font-bold text-[11px] shadow-2xs whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3 text-slate-500" />
                    Copy Mon
                  </button>
                </div>

                {/* Right: 12h vs 24h Segmented Pill */}
                <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shrink-0 text-xs font-bold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setTimeFormat('12')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      timeFormat === '12'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    12h
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat('24')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      timeFormat === '24'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    24h
                  </button>
                </div>
              </div>

              {/* Weekly Schedule Systematic Card */}
              <form onSubmit={e => { e.preventDefault(); setStep(5); }} className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                  {/* Table Header for Systematic Alignment */}
                  <div className="px-3.5 py-2.5 bg-slate-50/80 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <span className="w-20 sm:w-24 shrink-0">Day</span>
                    <span className="w-12 text-center shrink-0">Status</span>
                    <span className="flex-1 text-right">
                      Hours ({timeFormat === '12' ? '12h AM/PM' : '24h'})
                    </span>
                  </div>

                  {Object.keys(businessHours).map((day) => {
                    const dayData = (businessHours as any)[day];
                    const isOpen = !dayData.closed;

                    const getTimeOptions = (currentVal: string) => {
                      const exists = STANDARD_TIME_OPTIONS_12H.some(opt => opt.value === currentVal);
                      if (!exists && currentVal) {
                        return [...STANDARD_TIME_OPTIONS_12H, { value: currentVal, label: formatTo12Hour(currentVal) }].sort((a, b) => a.value.localeCompare(b.value));
                      }
                      return STANDARD_TIME_OPTIONS_12H;
                    };

                    return (
                      <div 
                        key={day} 
                        className={`px-3.5 py-2.5 flex items-center justify-between gap-2 transition-colors ${
                          !isOpen ? 'bg-slate-50/40' : 'hover:bg-slate-50/30'
                        }`}
                      >
                        {/* Column 1: Day Name */}
                        <div className="w-20 sm:w-24 shrink-0">
                          <span className={`capitalize font-bold text-xs sm:text-sm ${isOpen ? 'text-slate-900' : 'text-slate-400'}`}>
                            {day}
                          </span>
                        </div>

                        {/* Column 2: Status Toggle (Compact Green Switch) */}
                        <div className="w-12 shrink-0 flex justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setBusinessHours({
                                ...businessHours,
                                [day]: { ...dayData, closed: !dayData.closed }
                              });
                            }}
                            title={isOpen ? `${day} is Open (Click to Close)` : `${day} is Closed (Click to Open)`}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isOpen ? 'bg-emerald-500 shadow-xs' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                                isOpen ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Column 3: Hours (Always fits comfortably inside the box) */}
                        <div className="flex-1 flex justify-end items-center min-w-0">
                          {isOpen ? (
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              {timeFormat === '12' ? (
                                <>
                                  <select
                                    value={dayData.open}
                                    onChange={e => setBusinessHours({
                                      ...businessHours,
                                      [day]: { ...dayData, open: e.target.value }
                                    })}
                                    className="w-[84px] sm:w-[92px] px-1.5 sm:px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] sm:text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 cursor-pointer text-center shadow-2xs"
                                  >
                                    {getTimeOptions(dayData.open).map(opt => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="text-slate-400 font-bold text-[10px] sm:text-xs">to</span>
                                  <select
                                    value={dayData.close}
                                    onChange={e => setBusinessHours({
                                      ...businessHours,
                                      [day]: { ...dayData, close: e.target.value }
                                    })}
                                    className="w-[84px] sm:w-[92px] px-1.5 sm:px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] sm:text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 cursor-pointer text-center shadow-2xs"
                                  >
                                    {getTimeOptions(dayData.close).map(opt => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </>
                              ) : (
                                <>
                                  <input 
                                    type="time" 
                                    value={dayData.open} 
                                    onChange={e => setBusinessHours({
                                      ...businessHours, 
                                      [day]: { ...dayData, open: e.target.value }
                                    })} 
                                    className="w-[84px] sm:w-[92px] px-1 sm:px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] sm:text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-center shadow-2xs" 
                                  />
                                  <span className="text-slate-400 font-bold text-[10px] sm:text-xs">to</span>
                                  <input 
                                    type="time" 
                                    value={dayData.close} 
                                    onChange={e => setBusinessHours({
                                      ...businessHours, 
                                      [day]: { ...dayData, close: e.target.value }
                                    })} 
                                    className="w-[84px] sm:w-[92px] px-1 sm:px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] sm:text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-center shadow-2xs" 
                                  />
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 italic px-2 py-1">
                              Closed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setStep(3)} 
                    className="px-5 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm bg-white hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    ← Back
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    Next: Verification &amp; Documents →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 5: DOCUMENTS & VERIFICATION */}
          {step === 5 && (
            <div className="bg-transparent py-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">🚀 Final Step: Verification &amp; KYC</h2>
                <p className="text-slate-500 text-sm">
                  Verify your store identity with GST or Aadhaar documentation to activate your merchant account.
                </p>
              </div>
              <form onSubmit={handleFinalSubmit} className="flex flex-col gap-5">
                
                {/* Documentation Section */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Business Documentation &amp; Identity
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Choose whether your business is GST-registered or use Aadhaar KYC
                      </p>
                    </div>
                  </div>

                  {/* 1. Registration Mode Selector: GST vs Aadhaar */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Business Registration Status *
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => {
                          setHasGstRegistration(true);
                          setIdProofType('GST');
                          if (idProofType === 'AADHAAR') {
                            setIdProofUrl('');
                            setIdProofFileName('');
                          }
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          hasGstRegistration
                            ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/80'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>I have GSTIN</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setHasGstRegistration(false);
                          setIdProofType('AADHAAR');
                          if (idProofType === 'GST') {
                            setIdProofUrl('');
                            setIdProofFileName('');
                          }
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          !hasGstRegistration
                            ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/80'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>No GST (Aadhaar Mandatory)</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. When GST Registration is Active */}
                  {hasGstRegistration ? (
                    <div className="space-y-4 pt-1">
                      {/* GSTIN Field */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelClasses}>
                            GSTIN (15-Character) <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            No Aadhaar Required with GST
                          </span>
                        </div>
                        <input 
                          type="text" 
                          maxLength={15}
                          value={gstNumber} 
                          onChange={e => {
                            const val = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
                            setGstNumber(val);
                            if (val.length === 15) setPanNumber(val.substring(2, 12));
                          }} 
                          placeholder="e.g. 22AAAAA0000A1Z5" 
                          className={inputClasses} 
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          ✓ Verified GST registered businesses are exempt from mandatory Aadhaar submission.
                        </p>
                      </div>

                      {/* GST Certificate Upload (Mandatory with GST) */}
                      <div>
                        <label className={`${labelClasses} block mb-1.5`}>
                          Upload GST Certificate (Form REG-06) <span className="text-red-500">*</span>
                        </label>

                        {!idProofUrl ? (
                          <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-white text-center transition-all">
                            <input 
                              type="file" 
                              accept="image/png,image/jpeg,image/webp,application/pdf"
                              onChange={handleDocumentUpload} 
                              disabled={isUploadingDoc}
                              className="hidden" 
                            />
                            <UploadCloud className="w-7 h-7 text-indigo-500 mb-1" />
                            <span className="text-xs font-bold text-slate-800">
                              {isUploadingDoc ? 'Uploading...' : 'Upload Official GST Registration Certificate *'}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG (Max 10MB)</span>
                          </label>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                              <FileCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span className="truncate max-w-[240px] sm:max-w-[300px]">
                                {idProofFileName || 'GST Certificate Attached'}
                              </span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => { setIdProofUrl(''); setIdProofFileName(''); }}
                              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer ml-2"
                            >
                              Change
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Optional Aadhaar Field if Merchant Wishes to Add */}
                      <div className="pt-2 border-t border-slate-100">
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          Aadhaar Number <span className="text-slate-400 font-normal">(Optional - Not required with GST)</span>
                        </label>
                        <input 
                          type="text" 
                          maxLength={14}
                          value={aadharNumber} 
                          onChange={e => setAadharNumber(formatAadhaarInput(e.target.value))} 
                          placeholder="XXXX XXXX XXXX (Optional)" 
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 outline-none focus:bg-white focus:border-indigo-400" 
                        />
                      </div>
                    </div>
                  ) : (
                    /* 3. When No GST Registration: Aadhaar Number + Aadhaar Document are STRICTLY MANDATORY */
                    <div className="space-y-4 pt-1">
                      <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                        <span className="text-base shrink-0">ℹ️</span>
                        <span className="leading-snug">
                          <strong>Aadhaar KYC Mandatory:</strong> Businesses without GST registration must provide a valid 12-digit Aadhaar Card number and upload an official document copy for identity verification.
                        </span>
                      </div>

                      {/* Aadhaar Number Field (Mandatory) */}
                      <div>
                        <label className={labelClasses}>
                          Aadhaar Card Number (12-Digit) <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          maxLength={14}
                          value={aadharNumber} 
                          onChange={e => setAadharNumber(formatAadhaarInput(e.target.value))} 
                          placeholder="XXXX XXXX XXXX" 
                          className={inputClasses} 
                        />
                      </div>

                      {/* Aadhaar Document Upload (Mandatory) */}
                      <div>
                        <label className={`${labelClasses} block mb-1.5`}>
                          Upload Aadhaar Card (Front/Back) <span className="text-red-500">*</span>
                        </label>

                        {!idProofUrl ? (
                          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-white text-center transition-all">
                            <input 
                              type="file" 
                              accept="image/png,image/jpeg,image/webp,application/pdf"
                              onChange={handleDocumentUpload} 
                              disabled={isUploadingDoc}
                              className="hidden" 
                            />
                            <UploadCloud className="w-7 h-7 text-emerald-600 mb-1" />
                            <span className="text-xs font-bold text-slate-800">
                              {isUploadingDoc ? 'Uploading...' : 'Upload Official Aadhaar Card Document *'}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG (Max 10MB)</span>
                          </label>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[240px] sm:max-w-[300px]">
                                {idProofFileName || 'Aadhaar Card Document Attached'}
                              </span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => { setIdProofUrl(''); setIdProofFileName(''); }}
                              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer ml-2"
                            >
                              Change
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Simple One-Time Merchant Registration Fee Card */}
                {registrationFeeConfig && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          One-Time Merchant Registration Fee
                        </div>
                        <div className="flex items-baseline gap-2.5 mt-1">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">
                            {registrationFeeConfig.effectiveFee === 0 ? 'FREE' : `₹${registrationFeeConfig.effectiveFee.toLocaleString('en-IN')}`}
                          </span>
                          {registrationFeeConfig.savingsAmount > 0 && (
                            <span className="text-sm text-slate-400 font-semibold line-through">
                              ₹{registrationFeeConfig.baseFee?.toLocaleString('en-IN')}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-medium">
                            • One-time lifetime access
                          </span>
                        </div>
                      </div>

                      {registrationFeeConfig.savingsAmount > 0 && (
                        <div className="self-start sm:self-auto">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                            Save ₹{registrationFeeConfig.savingsAmount.toLocaleString('en-IN')}
                            {registrationFeeConfig.discountType === 'PERCENTAGE' && ` (${registrationFeeConfig.discountValue}% OFF)`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Simple Key Perks */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Verified Store Badge
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Direct Leads & Queue
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Priority Support
                      </span>
                    </div>
                  </div>
                )}

                {/* Mandatory Terms & Conditions Checkbox (Must Read Before Ticking) */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  termsAccepted 
                    ? 'bg-emerald-50/70 border-emerald-200' 
                    : 'bg-slate-50 border-slate-200/90'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="mandatoryTermsCheckbox"
                        checked={termsAccepted}
                        onChange={(e) => {
                          if (!hasReadTerms) {
                            setShowTermsModal(true);
                            toast('Please read the mandatory terms before accepting', { icon: '📜' });
                          } else {
                            setTermsAccepted(e.target.checked);
                          }
                        }}
                        className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 shrink-0 cursor-pointer"
                      />
                      <div>
                        <label 
                          htmlFor="mandatoryTermsCheckbox" 
                          className="text-xs font-semibold text-slate-800 leading-snug cursor-pointer select-none"
                        >
                          I have read and agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="font-bold text-indigo-600 underline hover:text-indigo-700">Terms of Service &amp; Seller Agreement</button> <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1">
                          {hasReadTerms ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Reviewed and accepted
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                              <span>⚠️</span> Mandatory: Read terms to enable agreement
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-indigo-700 font-bold text-xs shadow-2xs whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 shrink-0"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{hasReadTerms ? 'Re-read Terms' : 'Read Terms *'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-3">
                  <button type="button" onClick={() => setStep(4)} className="px-6 py-4 border border-slate-300 text-slate-700 rounded-2xl font-bold text-sm bg-white hover:bg-slate-50">← Back</button>
                  <button type="submit" disabled={isSubmitting} className={btnPrimary}>
                    {isSubmitting ? 'Submitting...' : (!registrationFeeConfig?.isEnabled || registrationFeeConfig?.effectiveFee === 0 ? 'Complete Free Registration ✓' : `Pay ₹${registrationFeeConfig.effectiveFee} & Submit Registration ✓`)}
                  </button>
                </div>
              </form>

              {/* Mandatory Terms & Conditions Modal */}
              {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                  <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
                    {/* Header */}
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">MarkatVerse Merchant Agreement</h3>
                          <p className="text-[11px] text-slate-500 font-medium">Terms of Service &amp; Partner Code of Conduct</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Scrollable Terms Content */}
                    <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium">
                        ⚠️ <strong>Mandatory Compliance:</strong> Please review all clauses below. Checking the agreement certifies that you operate a verified business and accept our merchant policies.
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span>1.</span> Business Identity &amp; KYC Verification
                        </h4>
                        <p>
                          You certify that all provided details (GSTIN or Aadhaar ID) and accompanying documentation are genuine, valid, and registered under your legal identity. Misrepresentation or submission of forged documents leads to immediate account termination and legal reporting.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span>2.</span> Zero Listing Commission &amp; Fair Pricing
                        </h4>
                        <p>
                          MarkatVerse operates a 0% commission model on product listings. In return, sellers agree that prices listed on MarkatVerse must match or offer competitive value compared to over-the-counter retail storefront rates.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span>3.</span> Order Fulfillment &amp; Queue Management
                        </h4>
                        <p>
                          Merchants agree to honor digital queue tokens, local order pickups, and delivery timelines generated through the platform. Systematic cancellations or refusal to serve customers will impact merchant quality score.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span>4.</span> Customer Privacy &amp; Data Protection
                        </h4>
                        <p>
                          Customer phone numbers, delivery addresses, and personal identifiable information must strictly be used solely for order processing and cannot be harvested, stored, or sold for marketing.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span>5.</span> Registration Fee &amp; Lifetime Access
                        </h4>
                        <p>
                          The one-time onboarding fee covers lifetime storefront setup, TrustSEAL verification, and access to the SmartQueue engine. This fee is non-refundable once the store is verified and published.
                        </p>
                      </div>
                    </div>

                    {/* Footer with Mandatory Read & Accept button */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setHasReadTerms(true);
                          setTermsAccepted(true);
                          setShowTermsModal(false);
                          toast.success('Terms & Conditions reviewed and accepted!');
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>I Have Read All Terms → Agree &amp; Accept</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
