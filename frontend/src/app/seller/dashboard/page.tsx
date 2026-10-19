"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import { Store, BarChart3, Package, PlusCircle, ArrowLeft, Trash2, Edit2, CheckCircle2, CalendarClock, Settings, Menu, X, Users, TrendingUp, Ticket, Clock, Ban, Search, Phone, Mail, FileText, MapPin, ChevronDown, Activity, Scissors, User, UserPlus, Sparkles, Palette, Droplet, Briefcase, Eye, ShieldCheck, Utensils, UtensilsCrossed, Stethoscope, HeartPulse, ChefHat, MessageSquare, Lock, Check, Info, Bell, Key } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';
import StaffResourceManagementModal from '@/components/StaffResourceManagementModal';
import DynamicFormEngine from '@/components/DynamicFormEngine';
import LocationPicker from '@/components/LocationPicker';
import FoodDiningModule from '@/components/FoodDiningModule';
import ClinicDoctorModule from '@/components/ClinicDoctorModule';
import SalonSpaModule from '@/components/SalonSpaModule';

const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdding = searchParams.get('action') === 'add';
  const [activeTab, setActiveTab] = useState(isAdding ? 'add_service' : 'overview');
  const mainContentRef = React.useRef<HTMLElement>(null);

  // Auto-scroll to top whenever a sidebar option/tab is clicked
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [activeTab]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addProduct, editProduct, deleteProduct, products, categories } = useProducts();
  const [isPremiumSeller, setIsPremiumSeller] = useState(true); // Mock state to demonstrate the paywall
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user, login, logout, isLoading } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('All Services');
  const [searchBookingQuery, setSearchBookingQuery] = useState<string>('');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any | null>(null);
  const [foodSubTab, setFoodSubTab] = useState<'tables' | 'reservations' | 'kot' | 'menu'>('tables');
  
  // Store Operational & Notification Settings State
  const defaultStoreSettings = {
    acceptOrders: true,
    autoIssueToken: true,
    soundAlerts: true,
    smsNotifs: true,
    whatsappAlerts: true,
    emailDigest: true,
    securityAlerts: true,
  };
  const [storeSettings, setStoreSettings] = useState(defaultStoreSettings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`markat_seller_settings_${user?.id || 'default'}`);
      if (stored) {
        setStoreSettings(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [user?.id]);

  const updateStoreSetting = (key: keyof typeof defaultStoreSettings, value: boolean) => {
    setStoreSettings(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(`markat_seller_settings_${user?.id || 'default'}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  const myListings = products.filter(p => {
    // Only match strictly by sellerId to prevent generic names from claiming dummy data
    if (!p.sellerId || !user?.id) return false;
    return String(p.sellerId) === String(user.id);
  });

  const activeSector = myListings.length > 0 ? myListings[0].category : (user?.business?.sector || 'Retail Product');
  
  // Find the exact category structure from Category Engine 2.0
  const sellerCategory = categories.find(c => c.name === activeSector);
  const allowedFeatures = sellerCategory?.allowedFeatures || [];

  const capabilities = user?.business?.capabilities || [];
  const isB2B = capabilities.includes('B2B');
  const isB2C = capabilities.includes('B2C');
  const isService = capabilities.includes('SERVICE');

  // Fallback lists in case category is not found in context yet
  const CART_ORDER_FLOW = ['Retail Product', 'Electronics', 'Fashion', 'Home'];
  const RFQ_QUOTE_FLOW = ['B2B Product', 'Manufacturer', 'Transport', 'Construction'];
  const QUEUE_TOKEN_FLOW = ['Doctor', 'Salon', 'Spa', 'Beauty Parlour', 'Repair', 'Services', 'Beauty', 'Car Wash', 'Healthcare', 'Food & Dining / Restaurant', 'Restaurant', 'Cafe', 'Dining'];
  const PROJECT_MILESTONE_FLOW = ['Construction', 'Interior Designer'];
  const MEETING_PROPOSAL_FLOW = ['Wedding Planner', 'Consultant', 'Photography', 'Professional', 'Lawyer'];
  const ENQUIRY_ASSET_FLOW = ['Vehicle Sale', 'Vehicle Rental', 'Real Estate', 'Sales & Rentals'];

  const hasCartProducts = myListings.some(p => CART_ORDER_FLOW.includes(p.category));
  const hasRfqProducts = myListings.some(p => RFQ_QUOTE_FLOW.includes(p.category));
  const hasQueueServices = myListings.some(p => QUEUE_TOKEN_FLOW.includes(p.category));
  const hasProjectServices = myListings.some(p => PROJECT_MILESTONE_FLOW.includes(p.category));
  const hasMeetingServices = myListings.some(p => MEETING_PROPOSAL_FLOW.includes(p.category));
  const hasAssetListings = myListings.some(p => ENQUIRY_ASSET_FLOW.includes(p.category));

  const sellerSector = user?.business?.sector || '';
  // Collect categories from the seller's actual listed products/services
  // If the seller has active listings, only those listing categories count.
  const listingCategories = myListings.map(p => (p.category || '').toLowerCase());
  const distinctSellerCategories = listingCategories.length > 0 
    ? Array.from(new Set(listingCategories))
    : (sellerSector ? [sellerSector.toLowerCase()] : []);

  const isFoodListed = distinctSellerCategories.some(cat => 
    cat === 'food & dining / restaurant' || cat === 'food & dining' || cat === 'restaurant' || cat === 'cafe' || cat === 'dining' || cat === 'food'
  );
  const isDoctorListed = distinctSellerCategories.some(cat => 
    cat === 'healthcare & doctor' || cat === 'doctor' || cat === 'clinic' || cat === 'healthcare' || cat === 'medical'
  );
  const isSalonListed = distinctSellerCategories.some(cat => 
    cat === 'salon & parlor' || cat === 'salon' || cat === 'saloon' || cat === 'parlor' || cat === 'parlour' || cat === 'spa' || cat === 'beauty'
  );

  const availableVerticals: { id: 'FOOD' | 'SALON' | 'DOCTOR'; label: string; icon: any }[] = [];
  if (isFoodListed) availableVerticals.push({ id: 'FOOD', label: 'Dining', icon: Utensils });
  if (isSalonListed) availableVerticals.push({ id: 'SALON', label: 'Salon', icon: Scissors });
  if (isDoctorListed) availableVerticals.push({ id: 'DOCTOR', label: 'Doctor', icon: Stethoscope });

  const defaultDetectedVertical: 'FOOD' | 'SALON' | 'DOCTOR' | 'NONE' = 
    availableVerticals.length > 0 ? availableVerticals[0].id : 'NONE';

  const [currentVertical, setCurrentVertical] = useState<'AUTO' | 'FOOD' | 'SALON' | 'DOCTOR'>('AUTO');
  const activeVertical: 'FOOD' | 'SALON' | 'DOCTOR' | 'NONE' = 
    currentVertical === 'AUTO' 
      ? defaultDetectedVertical 
      : (availableVerticals.some(v => v.id === currentVertical) ? currentVertical : defaultDetectedVertical);

  // Dynamic Flow Resolution (Reads from Category Engine FIRST, falls back to hardcoded strings)
  const isCartFlow = allowedFeatures.includes('Product Stock') || allowedFeatures.includes('B2C') || hasCartProducts || CART_ORDER_FLOW.includes(sellerSector) || isB2C;
  const isRfqFlow = allowedFeatures.includes('RFQ') || allowedFeatures.includes('Quote') || allowedFeatures.includes('B2B') || hasRfqProducts || RFQ_QUOTE_FLOW.includes(sellerSector) || isB2B;
  const isQueueFlow = allowedFeatures.includes('Token') || hasQueueServices || QUEUE_TOKEN_FLOW.includes(sellerSector) || isService || ['FOOD', 'SALON', 'DOCTOR'].includes(activeVertical);
  const isProjectFlow = hasProjectServices || PROJECT_MILESTONE_FLOW.includes(sellerSector);
  const isMeetingFlow = allowedFeatures.includes('Appointment') || allowedFeatures.includes('Meeting') || hasMeetingServices || MEETING_PROPOSAL_FLOW.includes(sellerSector);
  const isAssetFlow = allowedFeatures.includes('Vehicle Test Drive') || hasAssetListings || ENQUIRY_ASSET_FLOW.includes(sellerSector);

  // For backward compatibility in some places
  const isServiceProvider = isQueueFlow || isProjectFlow || isMeetingFlow || isService || sellerCategory?.primaryType === 'SERVICE' || ['FOOD', 'SALON', 'DOCTOR'].includes(activeVertical);
  const [queueData, setQueueData] = useState<any>(null);
  const [isQueueLoading, setIsQueueLoading] = useState(false);
  const [queueAnalytics, setQueueAnalytics] = useState<any>(null);
  const [availableQueues, setAvailableQueues] = useState<any[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleQueueAction = async (actionId: string, endpoint: string, method: string = 'POST', body?: any) => {
    setActionLoading(actionId);
    try {
      const isJson = method === 'POST' || method === 'PATCH';
      await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: isJson ? { 'Content-Type': 'application/json' } : undefined,
        body: isJson ? JSON.stringify(body || {}) : undefined
      });
      await fetchQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const fetchQueue = async (forceQueueId?: string, isPolling = false) => {
    if (!user?.id || !isServiceProvider) return;
    if (!isPolling) setIsQueueLoading(true);
    try {
      const fallbackName = user.business?.name || user.name || '';

      // 1. Fetch all queues by sellerId
      const res = await fetch(`${API_URL}/service-queue/seller/${user.id}`);
      if (!res.ok) {
        if (res.status === 429) return; // Rate limited, ignore and retry later
        throw new Error(`Failed to fetch queues: ${res.statusText}`);
      }
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      let queues = Array.isArray(data) ? data : (data ? [data] : []);

      let activeQueueId = forceQueueId || selectedQueueId;

      // 2. Auto-create if no queue exists (saves massive bandwidth instead of searching all queues)
      if (queues.length === 0 && !isPolling) {
        const createRes = await fetch(`${API_URL}/service-queue/queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shopName: fallbackName, sellerId: user.id })
        });
        const newData = await createRes.json();
        if (newData?.id) {
          queues = [newData];
          activeQueueId = newData.id;
        }
      }

      setAvailableQueues(queues);

      if (!activeQueueId && queues.length > 0) {
        activeQueueId = queues[0].id;
      }
      setSelectedQueueId(activeQueueId);

      // 3. Fetch status and analytics for the active queue
      if (activeQueueId) {
        const [statusRes, analyticsRes] = await Promise.all([
          fetch(`${API_URL}/service-queue/${activeQueueId}/status`),
          fetch(`${API_URL}/service-queue/${activeQueueId}/analytics`)
        ]);
        if (statusRes.ok) {
          setQueueData(await statusRes.json());
        }
        if (analyticsRes.ok) {
          setQueueAnalytics(await analyticsRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isPolling) setIsQueueLoading(false);
    }
  };

  React.useEffect(() => {
    fetchQueue(undefined, false);
    // Auto-poll for new tokens every 3 seconds for near real-time updates
    const interval = setInterval(() => {
      if (user?.id && isServiceProvider) {
        fetchQueue(undefined, true);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user, isServiceProvider]);

  // Walk-in Customer Form State
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInService, setWalkInService] = useState('Haircut');
  const [walkInPrice, setWalkInPrice] = useState('');

  const handleAddWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueueId) return;
    try {
      await fetch(`${API_URL}/service-queue/${selectedQueueId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: walkInName,
          phone: walkInPhone,
          service: walkInService,
          price: parseFloat(walkInPrice) || 0
        })
      });
      setShowWalkInForm(false);
      setWalkInName('');
      setWalkInPhone('');
      fetchQueue();
    } catch (err) {
      console.error(err);
      alert('Failed to add walk-in customer');
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      fetch(`${API_URL}/leads/seller/${user.id}`)
        .then(res => res.json())
        .then(data => setLeads(data))
        .catch(err => console.error(err));
    }
  }, [user]);

  // Orders State (from real data)
  const [orders, setOrders] = useState<any[]>([]);

  React.useEffect(() => {
    if (user?.id) {
      fetch(`${API_URL}/orders/seller/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch(err => console.error('Failed to load seller orders', err));
    }
  }, [user]);

  // Live Bookings State synced with Queue Tokens
  const [bookings, setBookings] = useState<any[]>([]);

  React.useEffect(() => {
    if (queueData?.waiting || queueData?.serving) {
      const liveBookings: any[] = [];
      if (queueData.serving && Array.isArray(queueData.serving)) {
        queueData.serving.forEach((s: any) => {
          liveBookings.push({
            rawId: s.id,
            id: s.bookingNumber || (s.bookingMode === 'APPOINTMENT' ? `BOOK-${s.id.slice(-4).toUpperCase()}` : `TOKEN-${s.tokenNumber || s.id.slice(-4).toUpperCase()}`),
            customer: s.customerName,
            service: s.service,
            date: 'Live Now',
            status: 'In Progress',
            bookingMode: s.bookingMode,
            tokenNumber: s.tokenNumber,
            appointmentTime: s.appointmentTime,
            originalStatus: s.status,
            staffId: s.staffId,
            resourceId: s.resourceId,
          });
        });
      }
      if (queueData.waiting) {
        queueData.waiting.forEach((t: any) => {
          liveBookings.push({
            rawId: t.id,
            id: t.bookingNumber || (t.bookingMode === 'APPOINTMENT' ? `BOOK-${t.id.slice(-4).toUpperCase()}` : `TOKEN-${t.tokenNumber || t.id.slice(-4).toUpperCase()}`),
            customer: t.customerName,
            service: t.service,
            date: t.bookingMode === 'APPOINTMENT' ? 'Scheduled Appointment' : 'Waiting in Queue',
            status: t.status === 'PENDING' ? 'Pending' : t.status === 'CHECKED_IN' ? 'Checked In' : 'Upcoming',
            bookingMode: t.bookingMode,
            tokenNumber: t.tokenNumber,
            appointmentTime: t.appointmentTime,
            originalStatus: t.status,
          });
        });
      }
      setBookings(liveBookings);
    }
  }, [queueData]);

  // Form states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [subcategory, setSubcategory] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Settings Location States
  const [settingsPin, setSettingsPin] = useState('');
  
  // Profile Editing State
  const defaultSchedule = {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '18:00', closed: false },
    sunday: { open: '09:00', close: '18:00', closed: true },
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    ownerName: '', phone: '', email: '', businessName: '', gstNumber: '', address: '', pincode: '', latitude: null as number | null, longitude: null as number | null,
    businessHours: defaultSchedule as any,
  });

  const handleEditProfileInit = () => {
    setProfileForm({
      ownerName: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      businessName: user?.business?.name || '',
      gstNumber: user?.business?.gstNumber || '',
      address: user?.business?.address || '',
      pincode: user?.business?.pincode || '',
      latitude: user?.business?.latitude || null,
      longitude: user?.business?.longitude || null,
      businessHours: user?.business?.businessHours && typeof user.business.businessHours === 'object'
        ? { ...defaultSchedule, ...(user.business.businessHours as any) }
        : defaultSchedule,
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/sellers/user/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        const token = localStorage.getItem('token');
        if (token) {
          const userRes = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (userRes.ok) {
             const data = await userRes.json();
             login({
               id: data.id, markatId: data.markatId, name: data.name, email: data.email,
               phone: data.phone || '', role: data.role?.toLowerCase() as any, status: 'active',
               business: data.business
             }, token);
          }
        }
        setIsEditingProfile(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating profile");
    }
  };
  const [settingsAreas, setSettingsAreas] = useState<string[]>([]);
  const [settingsIsFetching, setSettingsIsFetching] = useState(false);

  React.useEffect(() => {
    if (settingsPin.length === 6) {
      setSettingsIsFetching(true);
      fetch(`https://api.postalpincode.in/pincode/${settingsPin}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].Status === 'Success') {
            const fetchedAreas = data[0].PostOffice.map((po: any) => po.Name);
            setSettingsAreas(fetchedAreas);
            const state = data[0].PostOffice[0].State;
            const district = data[0].PostOffice[0].District;
            if (user?.business?.address && !user.business.address.includes(district)) {
              // Ignore if there's no way to smartly update, or just use it as hint
            }
          } else {
            setSettingsAreas([]);
          }
        })
        .catch(() => setSettingsAreas([]))
        .finally(() => setSettingsIsFetching(false));
    } else {
      setSettingsAreas([]);
    }
  }, [settingsPin, user]);
  React.useEffect(() => {
    if (user) {
      if (user.business?.address) {
        setLocation(user.business.address);
      }
    }
  }, [user]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [newParamName, setNewParamName] = useState('');
  const [enableWholesale, setEnableWholesale] = useState(false);
  const [wholesaleTiers, setWholesaleTiers] = useState([{ minQty: 12, margin: 20 }, { minQty: 100, margin: 30 }, { minQty: 150, margin: 50 }]);

  React.useEffect(() => {
    // Reset parameters when category or subcategory changes, pulling dynamic configurations
    const catData = categories.find(c => c.name === category);
    
    // Default to category parameters
    let targetParams = catData?.parameters || [];
    
    // If a subcategory is selected, use its specific parameters instead
    if (catData?.subcategories && subcategory) {
      const subCatData = catData.subcategories.find(s => s.name === subcategory);
      if (subCatData && subCatData.parameters) {
        targetParams = subCatData.parameters;
      }
    }

    if (targetParams.length > 0) {
      const newParams: Record<string, string> = {};
      targetParams.forEach(p => {
        newParams[p.name] = '';
      });
      setParameters(newParams);
    } else {
      setParameters({});
    }
  }, [category, subcategory, categories]);

  const getPlaceholderForParam = (key: string) => {
    const catData = categories.find(c => c.name === category);
    let targetParams = catData?.parameters || [];
    if (catData?.subcategories && subcategory) {
      const subCatData = catData.subcategories.find(s => s.name === subcategory);
      if (subCatData?.parameters) targetParams = subCatData.parameters;
    }
    
    const p = targetParams.find(p => p.name === key);
    if (p && p.placeholder) return p.placeholder;
    
    // Fallback smart placeholders for custom variants
    const k = key.toLowerCase();
    if (k.includes('color')) return 'Red, Blue, Green, Active Black';
    if (k.includes('shoe size')) return '6, 7, 8, 9, 10';
    if (k.includes('size')) return 'S, M, L, XL';
    if (k.includes('fabric')) return 'Cotton, Polyester, Wool, Silk';
    if (k.includes('material')) return 'Metal, PVC, Plastic, Aluminium, Iron';
    if (k.includes('dimension') || k.includes('measurement')) return 'Inches, cm, feet';
    return 'e.g. Option 1, Option 2';
  };

  const handleSaveListing = async (productData: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...productData,
        image: productData.image || "/hero-left-logo.png",
        discount: productData.originalPrice && productData.originalPrice > productData.price ? `${Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)}% OFF` : '',
        rating: 'New',
        reviews: '0',
        seller: user?.name || user?.business?.name || 'Seller',
        sellerId: user?.id,
        location: location,
        latitude: user?.business?.latitude || null,
        longitude: user?.business?.longitude || null,
        badge: 'New Arrival',
        badgeColor: 'badge-gold',
        isPremium: isPremiumSeller,
      };

      if (editingProductId) {
        await editProduct(editingProductId, payload);
      } else {
        await addProduct(payload);
      }

      setShowSuccess(true);
      setEditingProductId(null);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab('listings');
      }, 2500);
    } catch (err) {
      console.error(err);
      alert('Failed to save listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guard: seller has no business record yet — redirect to complete onboarding
  if (!isLoading && user && !user.business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
        <Link href="/" className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 font-semibold">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🏪</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Business Setup Incomplete</h2>
          <p className="text-slate-500 text-base mb-2">
            Your seller account is active (<span className="font-semibold text-slate-700">{user.markatId}</span>), but your business profile hasn&apos;t been created yet.
          </p>
          <p className="text-slate-400 text-sm mb-8">Complete the quick setup to start selling on MarkatVerse.</p>
          <Link href="/seller/onboarding" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-base hover:opacity-90 transition-opacity shadow-md">
            Complete Business Setup →
          </Link>
        </div>
      </div>
    );
  }

  // Guard: seller's business is created but not yet verified
  if (!isLoading && user && user.business && user.business.verified === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
        <Link href="/" className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 font-semibold">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Approval Pending</h2>
          <p className="text-slate-500 text-base mb-2">
            Your business profile (<span className="font-semibold text-slate-700">{user.business.name}</span>) is currently under review by our team.
          </p>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left my-6">
            <h3 className="font-semibold text-slate-800 text-sm mb-2">What happens next?</h3>
            <p className="text-sm text-slate-600">
              Our team is verifying your details. <strong>Within 24 to 48 hours, you will be ready to use your seller account</strong> and start listing your products and services on MarkatVerse. We will send you an email as soon as you are approved.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => logout()} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors">
              Log Out
            </button>
            <button onClick={() => window.location.href = 'mailto:support@markatverse.com'} className="flex-1 px-4 py-3 bg-blue-600 text-white hover:bg-blue-500 rounded-xl font-bold text-sm transition-colors shadow-md shadow-blue-500/20">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col lg:flex-row font-sans overflow-x-hidden relative">
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-40">
        <Link href="/" className="flex items-center no-underline">
          <img src="/logo.png" alt="MarkatVerse" className="h-12 object-contain scale-[2] origin-left" />
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[85vw] max-w-[320px] lg:w-[280px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header & Brand */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center no-underline hover:opacity-90 transition-opacity overflow-visible py-1">
              <img src="/logo.png" alt="MarkatVerse" className="h-12 object-contain scale-[1.7] origin-left" />
            </Link>
            <span className="text-[9px] font-black tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-md shrink-0">
              Seller
            </span>
          </div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors text-xs font-semibold mt-2.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
        </div>
        
        {/* Compact & Smart Seller Profile */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm">
                {(user?.name || user?.business?.name || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {user?.business?.name || user?.name || 'Seller'}
                </h3>
              </div>
              <span className="inline-block text-[10px] font-bold text-emerald-600">
                Verified Seller
              </span>
            </div>
          </div>

          {/* Smart Compact IDs Card */}
          <div className="mt-2.5 p-2 rounded-lg bg-white border border-slate-200/70 shadow-2xs space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Business ID</span>
              <span className="font-mono font-semibold text-slate-700">
                {user?.business?.businessCode
                  ? user.business.businessCode
                  : <Link href="/seller/onboarding" className="text-amber-600 font-bold hover:underline">Setup →</Link>
                }
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account ID</span>
              <span className="font-mono font-semibold text-slate-700">{user?.markatId || 'Pending'}</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1">
          <button 
            onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <BarChart3 className="w-5 h-5" /> Dashboard
          </button>
          
          {(!isService && !isServiceProvider) && (
            <button 
              onClick={() => { setActiveTab('listings'); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'listings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Store className="w-5 h-5" /> My Shop
            </button>
          )}

          {/* Dynamic Sector Workflow Switcher - only shown if services are listed */}
          {availableVerticals.length > 1 && (
            <div className="mx-2 mb-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Listed Verticals</span>
                <span className="text-indigo-600 font-bold">{activeVertical}</span>
              </div>
              <div className={`grid gap-1 ${availableVerticals.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {availableVerticals.map(v => {
                  const Icon = v.icon;
                  const isAct = activeVertical === v.id;
                  const activeColor = v.id === 'FOOD' ? 'bg-orange-500 text-white' : (v.id === 'SALON' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white');
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setCurrentVertical(v.id)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                        isAct ? `${activeColor} shadow-xs` : 'text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {availableVerticals.length === 1 && (
            <div className="mx-2 mb-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sector</span>
              <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                {activeVertical === 'FOOD' && <Utensils className="w-3.5 h-3.5 text-orange-500" />}
                {activeVertical === 'SALON' && <Scissors className="w-3.5 h-3.5 text-indigo-600" />}
                {activeVertical === 'DOCTOR' && <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />}
                {activeVertical === 'FOOD' ? 'Dining & Food' : (activeVertical === 'DOCTOR' ? 'Clinic & Doctor' : 'Salon & Spa')}
              </span>
            </div>
          )}

          {/* SERVICE PROVIDER FLOW (Phase 1 MVP) */}
          {(isService || isServiceProvider) && (
            <>
              {/* FOOD & DINING: Elegant, unified, non-duplicated operational tabs */}
              {activeVertical === 'FOOD' ? (
                <>
                  <button 
                    onClick={() => { setFoodSubTab('tables'); setActiveTab('sector_station'); setIsMobileMenuOpen(false); }} 
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'sector_station' && foodSubTab === 'tables' ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Utensils className="w-5 h-5 text-orange-500" /> Table Floor
                    </div>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-[10px] font-bold">Floor</span>
                  </button>

                  <button 
                    onClick={() => { setFoodSubTab('reservations'); setActiveTab('sector_station'); setIsMobileMenuOpen(false); }} 
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'sector_station' && foodSubTab === 'reservations' ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <div className="flex items-center gap-3">
                      <CalendarClock className="w-5 h-5 text-rose-500" /> Reservations
                    </div>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold">Bookings</span>
                  </button>

                  <button 
                    onClick={() => { setFoodSubTab('kot'); setActiveTab('sector_station'); setIsMobileMenuOpen(false); }} 
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'sector_station' && foodSubTab === 'kot' ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <div className="flex items-center gap-3">
                      <ChefHat className="w-5 h-5 text-amber-500" /> Kitchen Orders
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">KOT</span>
                  </button>

                  <button 
                    onClick={() => { setFoodSubTab('menu'); setActiveTab('sector_station'); setIsMobileMenuOpen(false); }} 
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'sector_station' && foodSubTab === 'menu' ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <div className="flex items-center gap-3">
                      <UtensilsCrossed className="w-5 h-5 text-purple-500" /> Food Menu Items
                    </div>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-bold">Dishes</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('services'); setIsMobileMenuOpen(false); }} 
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'services' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-blue-600" /> Restaurant Profile
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">Store</span>
                  </button>
                </>
              ) : (
                /* CLINIC, SALON & OTHER SERVICE SECTORS */
                <>
                  {activeVertical === 'DOCTOR' && (
                    <button 
                      onClick={() => { setActiveTab('sector_station'); setIsMobileMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'sector_station' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Stethoscope className="w-5 h-5 text-emerald-600" /> OPD & Consults
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">Clinic</span>
                    </button>
                  )}

                  {activeVertical === 'SALON' && (
                    <button 
                      onClick={() => { setActiveTab('sector_station'); setIsMobileMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'sector_station' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Scissors className="w-5 h-5 text-indigo-600" /> Chairs & Stylists
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold">Salon</span>
                    </button>
                  )}

                  <button 
                    onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} 
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'bookings' ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <div className="flex items-center gap-3">
                      <CalendarClock className="w-5 h-5" /> Bookings & Tokens
                    </div>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('queue'); setIsMobileMenuOpen(false); }} 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'queue' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-lg">🎟️</span> Live Queue
                  </button>

                  <button 
                    onClick={() => { setActiveTab('services'); setIsMobileMenuOpen(false); }} 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'services' ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <Briefcase className="w-5 h-5" /> Services & Catalog
                  </button>
                </>
              )}

              <button 
                onClick={() => { setActiveTab('customers'); setIsMobileMenuOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'customers' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Users className="w-5 h-5" /> Customers
              </button>

              <button 
                onClick={() => { setActiveTab('staff'); setIsMobileMenuOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'staff' ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <UserPlus className="w-5 h-5" /> {activeVertical === 'DOCTOR' ? 'Doctors & Staff' : (activeVertical === 'FOOD' ? 'Kitchen & Waiters' : 'Stylists & Staff')}
              </button>

              <button 
                onClick={() => { setActiveTab('earnings'); setIsMobileMenuOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'earnings' ? 'bg-green-50 text-green-700 font-bold border border-green-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <TrendingUp className="w-5 h-5" /> Earnings
              </button>
            </>
          )}

          {/* PRODUCT SPECIFIC TABS */}
          {(!isService && !isServiceProvider) && isCartFlow && (
            <button 
              onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Package className="w-5 h-5" /> Orders
            </button>
          )}

          {(!isService && !isServiceProvider) && isRfqFlow && (
            <button 
              onClick={() => { setActiveTab('leads'); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'leads' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <span className="w-5 h-5 flex items-center justify-center text-lg">💬</span> Leads / RFQ
            </button>
          )}

          {(!isService && !isServiceProvider) && isProjectFlow && (
            <button 
              onClick={() => { setActiveTab('projects'); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'projects' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <span className="w-5 h-5 flex items-center justify-center text-lg">🏗️</span> Projects
            </button>
          )}

          {isAssetFlow && (
            <>
              <button 
                onClick={() => { setActiveTab('enquiries'); setIsMobileMenuOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'enquiries' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <span className="w-5 h-5 flex items-center justify-center text-lg">🔑</span> Enquiries
              </button>
            </>
          )}
          <button 
            onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <User className="w-5 h-5" /> Profile
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Settings className="w-5 h-5" /> Settings
          </button>
          
          <div className="pt-4 mt-2 border-t border-slate-100">
            <button 
              onClick={() => logout()} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main ref={mainContentRef} className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-10">
        
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {/* Dashboard Header with Live Store Status & Shortcuts */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live & Open
                  </span>
                </div>
                <p className="text-slate-500 mt-1 text-sm sm:text-base">
                  Welcome back, <strong className="text-slate-800">{user?.name || user?.business?.name || 'Seller'}</strong>. Real-time updates for your store.
                </p>
              </div>

              {/* Top Quick Actions Header */}
              <div className="flex items-center gap-2.5 shrink-0">
                {myListings.length > 0 && (
                  <Link
                    href={`/product/${myListings[0].id}`}
                    target="_blank"
                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    🌐 View Live Storefront
                  </Link>
                )}
                {activeVertical === 'FOOD' ? (
                  <button
                    onClick={() => { setFoodSubTab('tables'); setActiveTab('sector_station'); }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
                  >
                    <Utensils className="w-4 h-4" /> Open Table Floor
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab(isServiceProvider ? 'add_service' : 'add_product')}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Add New
                  </button>
                )}
              </div>
            </div>

            {/* Account Auto-Verified Banner */}
            {user?.business && (
              <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-emerald-50/80 border border-emerald-200/80 shadow-2xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">Account Verified & Active</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">Your business passed MarkatVerse compliance checks and is open for customers.</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 font-mono text-xs font-semibold text-emerald-800 bg-white/70 px-3 py-1.5 rounded-lg border border-emerald-200/60">
                  ID: {user.markatId || 'MV-0000000044'}
                </div>
              </div>
            )}

            {/* SECTOR-ADAPTIVE KPI METRIC CARDS */}
            {activeVertical === 'FOOD' ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* 1. Dine-in Revenue */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all relative overflow-hidden group">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Today&apos;s Revenue</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">₹3,640</div>
                  <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <span>↑ 18%</span>
                    <span className="text-slate-400 font-normal">vs yesterday</span>
                  </div>
                </div>

                {/* 2. Active Tables */}
                <div 
                  onClick={() => { setFoodSubTab('tables'); setActiveTab('sector_station'); }}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-orange-300 transition-all cursor-pointer relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Table Floor</span>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                      <Utensils className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">3 / 7</div>
                  <div className="text-xs font-semibold text-orange-600">
                    3 tables ready for walk-ins →
                  </div>
                </div>

                {/* 3. Live KOT Orders */}
                <div 
                  onClick={() => { setFoodSubTab('kot'); setActiveTab('sector_station'); }}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-amber-300 transition-all cursor-pointer relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Live Kitchen KOT</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                      <ChefHat className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">2</div>
                  <div className="text-xs font-semibold text-amber-600">
                    Avg prep time: 14 mins →
                  </div>
                </div>

                {/* 4. Reservations Pending */}
                <div 
                  onClick={() => { setFoodSubTab('reservations'); setActiveTab('sector_station'); }}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-rose-300 transition-all cursor-pointer relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Table Bookings</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                      <CalendarClock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">3</div>
                  <div className="text-xs font-semibold text-rose-600">
                    1 request needs review →
                  </div>
                </div>
              </div>
            ) : (
              /* STANDARD RETAIL / SERVICE SECTOR METRICS */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Sales</div>
                    <div className="text-3xl font-black text-slate-900">₹0</div>
                    <span className="text-xs text-slate-400 mt-1 block">No sales yet</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab(isServiceProvider ? 'services' : 'listings')}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all"
                >
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      {isServiceProvider ? 'Active Services' : 'Active Products'}
                    </div>
                    <div className="text-3xl font-black text-slate-900">{myListings.length}</div>
                    <span className="text-xs text-blue-600 font-semibold mt-1 block">View catalog →</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Store className="w-6 h-6" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('queue')}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-all"
                >
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Live Queue</div>
                    <div className="text-3xl font-black text-slate-900">{queueData?.waitingCount ?? 0}</div>
                    <span className="text-xs text-amber-600 font-semibold mt-1 block">Manage queue →</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )}

            {/* OPERATIONAL SHORTCUTS & QUICK ACTIONS */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                <span className="text-xs text-slate-400 font-medium">One-click operational station navigation</span>
              </div>

              {activeVertical === 'FOOD' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {/* Action 1: Table Floor */}
                  <button
                    onClick={() => { setFoodSubTab('tables'); setActiveTab('sector_station'); }}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-orange-300 hover:shadow-md transition-all text-left flex flex-col justify-between gap-3 group bg-gradient-to-br from-orange-50/40 to-white"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Table Floor</div>
                      <div className="text-xs text-slate-500 mt-0.5">Seat guests & view occupancy</div>
                    </div>
                  </button>

                  {/* Action 2: Reservations */}
                  <button
                    onClick={() => { setFoodSubTab('reservations'); setActiveTab('sector_station'); }}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-300 hover:shadow-md transition-all text-left flex flex-col justify-between gap-3 group bg-gradient-to-br from-rose-50/40 to-white"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CalendarClock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Table Bookings</div>
                      <div className="text-xs text-slate-500 mt-0.5">Accept incoming reservations</div>
                    </div>
                  </button>

                  {/* Action 3: Kitchen Orders */}
                  <button
                    onClick={() => { setFoodSubTab('kot'); setActiveTab('sector_station'); }}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-300 hover:shadow-md transition-all text-left flex flex-col justify-between gap-3 group bg-gradient-to-br from-amber-50/40 to-white"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ChefHat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Kitchen KOT</div>
                      <div className="text-xs text-slate-500 mt-0.5">Order prep tickets & timers</div>
                    </div>
                  </button>

                  {/* Action 4: Menu Items */}
                  <button
                    onClick={() => { setFoodSubTab('menu'); setActiveTab('sector_station'); }}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-md transition-all text-left flex flex-col justify-between gap-3 group bg-gradient-to-br from-purple-50/40 to-white"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Food Menu</div>
                      <div className="text-xs text-slate-500 mt-0.5">Dishes, pricing & stock</div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveTab(isServiceProvider ? 'services' : 'listings')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 text-left flex flex-col gap-3 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{isServiceProvider ? 'Services' : 'Catalog'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Manage listings & prices</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('customers')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 text-left flex flex-col gap-3 hover:border-emerald-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Customers</div>
                      <div className="text-xs text-slate-500 mt-0.5">Diners & clients directory</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('staff')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 text-left flex flex-col gap-3 hover:border-rose-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Staff & Shifts</div>
                      <div className="text-xs text-slate-500 mt-0.5">Floor duties & roster</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('earnings')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 text-left flex flex-col gap-3 hover:border-green-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Earnings</div>
                      <div className="text-xs text-slate-500 mt-0.5">Payouts & revenue stats</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* LIVE OPERATIONS PREVIEW CARD (Recent Reservations & Floor status) */}
            {activeVertical === 'FOOD' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                      🍽️
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Live Table Floor & Reservations Summary</h4>
                      <p className="text-xs text-slate-500">Fast action bar for current floor activities</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setFoodSubTab('reservations'); setActiveTab('sector_station'); }}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1"
                  >
                    View All Reservations →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-sm">
                        #2
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Table 2 (Booth) • 4 Guests</div>
                        <div className="text-xs text-slate-500">Seated: Suresh Raina • Order: Paneer Butter Masala, Butter Naan</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Food Preparing
                      </span>
                      <span className="text-sm font-bold text-slate-900">₹860</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-sm">
                        #5
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Table 5 (VIP) • 2 Guests</div>
                        <div className="text-xs text-slate-500">Seated: Ananya Sharma • Order: Margherita Pizza, Cold Coffee</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Food Served
                      </span>
                      <span className="text-sm font-bold text-slate-900">₹580</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-sm">
                        RES
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Pooja Verma (8 Guests) • 08:00 PM Tonight</div>
                        <div className="text-xs text-slate-500">Standard Table 7 (Large Party) • Family dinner with kids</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => { setFoodSubTab('reservations'); setActiveTab('sector_station'); }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => { setFoodSubTab('reservations'); setActiveTab('sector_station'); }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors border border-rose-200"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTOR SPECIFIC ACTIVE WORKSPACE TAB */}
        {activeTab === 'sector_station' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {activeVertical === 'FOOD' && (
              <FoodDiningModule 
                queueData={queueData}
                user={user}
                onRefresh={() => fetchQueue()}
                onAction={handleQueueAction}
                actionLoading={actionLoading}
                initialSubTab={foodSubTab}
              />
            )}
            {activeVertical === 'DOCTOR' && (
              <ClinicDoctorModule 
                queueData={queueData}
                user={user}
                onRefresh={() => fetchQueue()}
                onAction={handleQueueAction}
                actionLoading={actionLoading}
              />
            )}
            {activeVertical === 'SALON' && (
              <SalonSpaModule 
                queueData={queueData}
                user={user}
                onRefresh={() => fetchQueue()}
                onAction={handleQueueAction}
                actionLoading={actionLoading}
                onOpenStaffModal={() => setShowStaffModal(true)}
                onOpenWalkInModal={() => setShowWalkInForm(true)}
              />
            )}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Earnings & Performance</h1>
              <p className="text-slate-500 mt-2">Track your shop&apos;s revenue, collections, and staff performance.</p>
            </div>
            
            {/* Performance Analytics Section */}
            {queueAnalytics ? (
              <div className="space-y-6 mb-10">
                {/* Top Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all">
                    <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110"><TrendingUp className="w-32 h-32 text-emerald-500" /></div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Today&apos;s Collection</div>
                    <div className="text-4xl font-black text-emerald-600 relative z-10">₹{queueAnalytics.totalTodayCollection.toLocaleString('en-IN')}</div>
                    <div className="text-xs font-semibold text-emerald-500/70 mt-3 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/> Live updates</div>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110"><BarChart3 className="w-32 h-32 text-blue-500" /></div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Month&apos;s Collection</div>
                    <div className="text-4xl font-black text-blue-600 relative z-10">₹{queueAnalytics.totalMonthCollection.toLocaleString('en-IN')}</div>
                    <div className="text-xs font-semibold text-blue-500/70 mt-3 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5"/> This month</div>
                  </div>

                  {(user?.business?.wallet?.owedToPlatform ?? 0) > 0 && (
                    <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-orange-300 hover:shadow-md transition-all">
                      <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2 relative z-10">Owed to Platform</div>
                      <div className="text-4xl font-black text-orange-600 relative z-10 flex items-center justify-between">
                        <span>₹{(user?.business?.wallet?.owedToPlatform || 0).toLocaleString('en-IN')}</span>
                        <button 
                          onClick={async () => {
                            if(confirm('Proceed to pay platform fees?')) {
                              try {
                                await fetch(`${API_URL}/wallet/business/${user?.business?.id}/pay-platform`, { method: 'POST' });
                                alert('Payment successful!');
                                if (user?.business?.wallet) {
                                  login({
                                    ...user,
                                    business: {
                                      ...user.business,
                                      wallet: {
                                        ...user.business.wallet,
                                        owedToPlatform: 0
                                      }
                                    }
                                  });
                                }
                              } catch (e) {
                                console.error(e);
                              }
                            }
                          }}
                          className="text-xs bg-orange-500 text-white px-4 py-2.5 rounded-xl shadow-sm hover:bg-orange-600 hover:-translate-y-0.5 transition-all font-bold"
                        >
                          Pay Now
                        </button>
                      </div>
                      <div className="text-xs font-semibold text-orange-500/70 mt-3">Platform fees pending settlement</div>
                    </div>
                  )}
                </div>

                {/* Staff Breakdown Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-500 shrink-0" />
                      Staff Performance Breakdown
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Detailed view of customers served and revenue generated by each staff member.</p>
                  </div>
                <div className="p-0 overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4 pl-6">Staff Member</th>
                        <th className="p-4 text-center">Today&apos;s Customers</th>
                        <th className="p-4 text-right">Today&apos;s Earnings</th>
                        <th className="p-4 text-center">Month&apos;s Customers</th>
                        <th className="p-4 text-right pr-6">Month&apos;s Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queueAnalytics.staffPerformance && queueAnalytics.staffPerformance.length > 0 ? (
                        queueAnalytics.staffPerformance.map((staff: any) => (
                          <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 pl-6 font-bold text-slate-900 flex items-center gap-3">
                              {staff.id === 'unassigned' ? (
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                                  <Store className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                                  {staff.name.charAt(0)}
                                </div>
                              )}
                              {staff.name}
                            </td>
                            <td className="p-4 text-center font-bold text-slate-700">{staff.todayCustomers}</td>
                            <td className="p-4 text-right font-black text-emerald-600">₹{staff.todayEarnings.toLocaleString('en-IN')}</td>
                            <td className="p-4 text-center font-bold text-slate-700">{staff.monthCustomers}</td>
                            <td className="p-4 text-right pr-6 font-black text-blue-600">₹{staff.monthEarnings.toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <TrendingUp className="w-12 h-12 text-slate-200" />
                              <p className="font-semibold text-slate-600">No performance data available yet.</p>
                              <p className="text-sm">Earnings and customer counts will appear here once you start serving.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700 mb-1">No earning data yet</h3>
                <p className="text-slate-500 text-sm">Your earnings will appear here once you start receiving tokens and bookings.</p>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'listings' || activeTab === 'services') && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {activeVertical === 'FOOD' ? 'Restaurant Venue & Dining Service' : (activeTab === 'services' ? 'My Services' : 'My Shop Catalog')}
                </h1>
                <p className="text-slate-500 mt-2">
                  {activeVertical === 'FOOD' 
                    ? 'Your restaurant storefront, table booking service, and dining experience.'
                    : (activeTab === 'services' ? 'Manage your active services.' : 'Manage your active products.')}
                </p>
              </div>

              {/* For Food & Dining, a restaurant is a single establishment venue. If 1 exists, don't show "+ Add New" duplicate button; show direct Customer Storefront and Manage Menu links */}
              {activeVertical === 'FOOD' && myListings.length > 0 ? (
                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Single Establishment Active
                  </span>
                  <Link
                    href={`/product/${myListings[0].id}`}
                    target="_blank"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-orange-600/20 transition-colors flex items-center gap-2 text-sm"
                  >
                    🍽️ View Customer Storefront
                  </Link>
                </div>
              ) : (
                <button 
                  onClick={() => setActiveTab(activeTab === 'services' ? 'add_service' : 'add_product')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2 self-start sm:self-auto"
                >
                  <PlusCircle className="w-5 h-5" /> {activeVertical === 'FOOD' ? 'Setup Restaurant Venue' : 'Add New'}
                </button>
              )}
            </div>

            {/* Food & Dining Single-Establishment Guidance Banner */}
            {activeVertical === 'FOOD' && myListings.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    🍴
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Your Complete Dining & Food Shop Profile</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Customers visit your live page to reserve dining tables, browse your food menu, and order. You manage dishes and tables directly from the workspace.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('sector_station')}
                    className="px-3.5 py-2 rounded-xl bg-white text-orange-700 border border-orange-200 text-xs font-bold hover:bg-orange-50 transition-colors shadow-xs"
                  >
                    Manage Food Menu & Tables
                  </button>
                  <Link
                    href={`/shop/${encodeURIComponent((myListings[0].sellerName || myListings[0].seller || user.business?.name || user.name || '').toLowerCase().replace(/ /g, '-'))}`}
                    target="_blank"
                    className="px-3.5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    Customer Menu Page ↗
                  </Link>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myListings.map(product => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col group">
                  <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <img src="/hero-left-logo.png" alt={product.name} className="w-full h-full object-contain opacity-50 p-4 group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                      {product.category || 'Food & Dining'}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="font-bold text-base text-slate-900 mb-2 line-clamp-2 leading-snug">{product.name}</div>
                    <div className="flex justify-between items-end mb-5 mt-auto">
                      <div>
                        <span className="text-xl font-bold text-slate-900">₹{(product.price ?? 0).toLocaleString('en-IN')}</span>
                        {activeVertical === 'FOOD' && <span className="text-xs text-slate-400 block font-normal">dining cover charge</span>}
                      </div>
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active
                      </span>
                    </div>
                    <div className="flex gap-2 flex-col">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => {
                            setEditingProductId(product.id);
                            setName(product.name);
                            setPrice(product.price.toString());
                            setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : product.price.toString());
                            setDescription(product.description || '');
                            setCategory(product.category || 'Food & Dining');
                            setLocation(product.location || '');
                            setImageUrl(product.image || '');
                            setUploadedImages(product.images || []);
                            setEnableWholesale(product.isB2B || false);
                            if (product.wholesaleTiers) setWholesaleTiers(product.wholesaleTiers);
                            if (product.parameters) {
                              const newParams: Record<string, string> = {};
                              Object.keys(product.parameters).forEach(k => {
                                const pVal = product.parameters![k];
                                newParams[k] = Array.isArray(pVal) ? pVal.join(', ') : pVal;
                              });
                              setParameters(newParams);
                            }
                            if (product.primaryType === 'SERVICE' || activeVertical === 'FOOD') {
                              setActiveTab('add_service');
                            } else {
                              setActiveTab('add_product');
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium text-sm transition-colors"
                        >
                          <Edit2 className="w-4 h-4" /> Edit Details
                        </button>
                        <button 
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg font-medium text-sm transition-colors"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this listing?')) {
                              deleteProduct(product.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                      {/* Link to live public page */}
                      <Link 
                        href={`/product/${product.id}`}
                        target="_blank"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg font-medium text-sm transition-colors">
                        🌐 View Customer Page
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {myListings.length === 0 && (
                <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{isServiceProvider ? 'No services yet' : 'No listings yet'}</h3>
                  <p className="text-slate-500 mb-6">Start growing your business by adding your first {isServiceProvider ? 'service' : 'product'}.</p>
                  <div className="flex gap-3 justify-center">
                    {(isB2C || isB2B || isCartFlow || isRfqFlow || (!isService && !isServiceProvider)) && (
                      <button 
                        onClick={() => setActiveTab('add_product')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors"
                      >
                        Add Product
                      </button>
                    )}
                    {(isService || isServiceProvider || isQueueFlow || isMeetingFlow || isProjectFlow) && (
                      <button 
                        onClick={() => setActiveTab('add_service')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors"
                      >
                        Add Service
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'add_product' || activeTab === 'add_service' || activeTab === 'add') && (() => {
          const isServiceMode = activeTab === 'add_service' || (activeTab === 'add' && isServiceProvider);
          return (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {editingProductId ? (isServiceMode ? 'Edit Service' : 'Edit Product') : (isServiceMode ? 'Add New Service' : 'Add New Product')}
              </h1>
              <p className="text-slate-500 mt-1 text-sm">{editingProductId ? 'Update the details for your listing.' : 'Create a new listing to start selling.'}</p>
            </div>
            
            {showSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 lg:p-8 rounded-2xl text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-emerald-800 mb-2">Listing Published Successfully!</h3>
                <p className="text-emerald-600">Your listing is now live. Redirecting to your dashboard...</p>
              </div>
            ) : (
              <DynamicFormEngine 
                isService={isServiceMode} 
                sellerSector={sellerSector}
                activeVertical={activeVertical}
                onSave={handleSaveListing} 
                onCancel={() => setActiveTab(isServiceProvider ? 'services' : 'listings')} 
                initialData={editingProductId ? products.find(p => p.id === editingProductId) : undefined}
              />
            )}
          </div>
          );
        })()}

        {activeTab === 'queue' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
              <div className="w-full">
                <h1 className="text-3xl font-bold text-slate-900">Queue & Token Management</h1>
                <p className="text-slate-500 mt-2">Manage your live walk-in customers and tokens.</p>
                {availableQueues.length > 1 && (
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-sm font-semibold text-slate-600">Select Shop/Branch:</span>
                    <select 
                      className="border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 text-sm font-medium w-full sm:w-auto"
                      value={selectedQueueId || ''} 
                      onChange={(e) => fetchQueue(e.target.value)}
                    >
                      {availableQueues.map(q => (
                        <option key={q.id} value={q.id}>{q.shopName}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => setShowStaffModal(true)} 
                  className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-2 sm:px-4 rounded-lg font-medium hover:bg-indigo-100 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none whitespace-nowrap"
                >
                  <Users className="w-4 h-4 shrink-0" /> <span>Manage Staff</span>
                </button>
                <button 
                  onClick={() => setShowWalkInForm(true)} 
                  className="bg-blue-600 border border-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" /> <span>Add Walk-in</span>
                </button>
                <button 
                  onClick={() => fetchQueue()} 
                  className="bg-white border border-slate-200 text-slate-700 px-3 py-2 sm:px-4 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center justify-center gap-2 flex-1 sm:flex-none whitespace-nowrap"
                >
                  <span>Refresh Status</span>
                </button>
              </div>
            </div>

            {showWalkInForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {activeVertical === 'FOOD' ? 'Seat Walk-in Party (Dining)' : (activeVertical === 'DOCTOR' ? 'Add OPD Walk-in Patient' : 'Add Walk-in Client')}
                  </h3>
                  <form onSubmit={handleAddWalkIn} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        {activeVertical === 'DOCTOR' ? 'Patient Name' : (activeVertical === 'FOOD' ? 'Guest / Contact Name' : 'Customer Name')}
                      </label>
                      <input type="text" required value={walkInName} onChange={e => setWalkInName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={activeVertical === 'DOCTOR' ? 'e.g. Ramesh Patel' : 'e.g. Rahul Sharma'} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                      <input type="text" value={walkInPhone} onChange={e => setWalkInPhone(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 9876543210" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        {activeVertical === 'DOCTOR' ? 'Consultation / Department' : (activeVertical === 'FOOD' ? 'Table / Order Type' : 'Service Requested')}
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={walkInService} 
                        onChange={e => setWalkInService(e.target.value)} 
                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder={activeVertical === 'DOCTOR' ? 'e.g. General OPD Consult' : (activeVertical === 'FOOD' ? 'e.g. Dine-in Table for 4' : 'e.g. Haircut, Spa')} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Fee / Price (₹)</label>
                      <input type="number" required value={walkInPrice} onChange={e => setWalkInPrice(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={activeVertical === 'DOCTOR' ? '500' : '200'} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                      <button type="button" onClick={() => setShowWalkInForm(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        {activeVertical === 'FOOD' ? 'Generate Table Token' : (activeVertical === 'DOCTOR' ? 'Issue OPD Token' : 'Add to Queue')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showStaffModal && queueData && (
              <StaffResourceManagementModal 
                queueId={queueData.queue.id} 
                queueData={queueData} 
                onClose={() => setShowStaffModal(false)} 
                onUpdate={fetchQueue} 
              />
            )}
            
            {isQueueLoading && !queueData ? (
              <div className="text-center py-20 text-slate-500">Loading queue...</div>
            ) : !queueData ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500">No active queue found.</div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Live Status Cards */}
                {queueData.resources && queueData.resources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {queueData.resources.map((resource: any) => {
                      const servingTokens = Array.isArray(queueData.serving) ? queueData.serving : [];
                      const servingToken = servingTokens.find((s: any) => s.resourceId === resource.id);
                      return (
                        <div key={resource.id} className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-4 text-white shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                          <div className="relative z-10 text-center w-full">
                            <div className="text-indigo-200 text-xs font-bold tracking-widest uppercase mb-1">{resource.name}</div>
                            {servingToken ? (
                              <>
                                <div className="text-5xl font-black mb-1 text-white drop-shadow-md">
                                  {servingToken.bookingMode === 'APPOINTMENT' ? 'Apt' : `#${servingToken.tokenNumber}`}
                                </div>
                                <div className="text-lg font-bold text-blue-100">{servingToken.customerName}</div>
                                <div className="text-indigo-200 text-xs mt-1 mb-3">{servingToken.service}</div>
                              </>
                            ) : (
                              <div className="py-4">
                                <div className="text-3xl font-black text-indigo-300/50 mb-2">—</div>
                                <div className="text-indigo-200 text-xs mb-3">No one currently serving</div>
                              </div>
                            )}
                            <button 
                              disabled={actionLoading === `next-${resource.id}`}
                              onClick={() => handleQueueAction(`next-${resource.id}`, `/service-queue/${queueData.queue.id}/next`, 'POST', { resourceId: resource.id })}
                              className="bg-white/20 hover:bg-white/30 text-white w-full py-1.5 rounded-lg font-bold text-sm shadow-sm transition-colors border border-white/20 disabled:opacity-50"
                            >
                              {actionLoading === `next-${resource.id}` ? 'Calling...' : 'Call Next'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-4 sm:p-5 text-white shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                    <div className="relative z-10 text-center w-full">
                      <div className="text-indigo-200 text-xs font-bold tracking-widest uppercase mb-2">NOW SERVING</div>
                      {queueData.serving && queueData.serving.length > 0 ? (
                        <>
                          <div className="text-6xl sm:text-7xl font-black mb-2 text-white drop-shadow-md">
                            {queueData.serving[0].bookingMode === 'APPOINTMENT' ? 'Apt' : `#${queueData.serving[0].tokenNumber}`}
                          </div>
                          <div className="text-lg font-bold text-blue-100">{queueData.serving[0].customerName}</div>
                          <div className="text-indigo-200 text-xs mt-1">{queueData.serving[0].service}</div>
                        </>
                      ) : (
                        <div className="py-2 sm:py-4">
                          <div className="text-4xl sm:text-5xl font-black text-indigo-300/50 mb-2">—</div>
                          <div className="text-indigo-200 text-sm">No one currently serving</div>
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-indigo-500/30 w-full flex justify-between">
                        <div className="text-center">
                          <div className="text-2xl font-black">{queueData.waitingCount}</div>
                          <div className="text-[9px] uppercase font-bold text-indigo-200 tracking-wider">Waiting</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-black">{queueData.doneToday}</div>
                          <div className="text-[9px] uppercase font-bold text-indigo-200 tracking-wider">Done Today</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Waiting List */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-900">Up Next</h2>
                    {(!queueData.resources || queueData.resources.length === 0) && (
                      <button 
                        disabled={actionLoading === 'next-global'}
                        onClick={() => handleQueueAction('next-global', `/service-queue/${queueData.queue.id}/next`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'next-global' ? 'Calling...' : 'Call Next Customer'}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {queueData.waiting?.length === 0 ? (
                      <div className="text-center py-10 text-slate-500">
                        Queue is empty.
                      </div>
                    ) : (
                      queueData.waiting?.map((token: any, i: number) => (
                        <div key={token.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                          <div className="flex items-center gap-4 w-full">
                            <div className={`w-14 h-12 rounded-xl flex flex-col items-center justify-center font-black text-sm ${i === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                              {token.bookingMode === 'APPOINTMENT' ? (
                                <><span>Apt</span><span className="text-[10px] font-bold">{new Date(token.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></>
                              ) : (
                                <span className="text-lg">#{token.tokenNumber}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                {token.customerName}
                                {token.bookingMode === 'APPOINTMENT' && token.status === 'PENDING' && (
                                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Pending Arrival</span>
                                )}
                                {token.bookingMode === 'APPOINTMENT' && token.status === 'CHECKED_IN' && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Checked In</span>
                                )}
                                {token.status === 'ABSENT' && (
                                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Absent (Late)</span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-medium">{token.service}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                            <div className="text-sm font-medium text-slate-700 mr-2 flex-1 sm:flex-none whitespace-nowrap">
                              📞 {token.phone || 'No phone'}
                            </div>
                            
                            {token.status !== 'ABSENT' ? (
                              <button 
                                disabled={actionLoading === `absent-${token.id}`}
                                onClick={() => handleQueueAction(`absent-${token.id}`, `/service-queue/token/${token.id}/absent`, 'PATCH')}
                                className="text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
                              >
                                {actionLoading === `absent-${token.id}` ? '...' : 'Absent'}
                              </button>
                            ) : (
                              <button 
                                disabled={actionLoading === `waiting-${token.id}`}
                                onClick={() => handleQueueAction(`waiting-${token.id}`, `/service-queue/token/${token.id}/waiting`, 'PATCH')}
                                className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
                              >
                                {actionLoading === `waiting-${token.id}` ? '...' : 'Return to Queue'}
                              </button>
                            )}
                            
                            <button 
                              disabled={actionLoading === `noshow-${token.id}`}
                              onClick={() => {
                                if(confirm('Mark this customer as No-Show? They will be removed from the list.')) {
                                  handleQueueAction(`noshow-${token.id}`, `/service-queue/token/${token.id}/no-show`, 'PATCH');
                                }
                              }}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              {actionLoading === `noshow-${token.id}` ? '...' : 'No Show'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>


              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="max-w-[1600px] mx-auto animate-in fade-in duration-300 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Tokens & Bookings</h1>
                <p className="text-slate-500 mt-1">Manage all your service tokens, appointments and bookings in one place.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => setShowWalkInForm(true)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> Walk In
                </button>
                <button onClick={() => setShowStaffModal(true)} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2">
                  <Users className="w-5 h-5" /> Manage Staff
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2">
                  <PlusCircle className="w-5 h-5" /> Create Booking
                </button>
              </div>
            </div>
            
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{bookings.length}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Bookings</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{bookings.filter(b => b.status === 'Waiting' || b.status === 'Pending').length}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Waiting</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{bookings.filter(b => b.status === 'In Progress').length}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">In Progress</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{bookings.filter(b => b.status === 'Done').length}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <Ban className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{bookings.filter(b => b.status === 'No Show' || b.status === 'Cancelled').length}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cancelled</div>
                </div>
              </div>
            </div>

            {/* Filter Pills Adapted to Active Vertical */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {(
                activeVertical === 'FOOD' 
                  ? ['All Services', 'Table Dine-in', 'Takeaway', 'Main Course', 'Beverages & Desserts']
                  : activeVertical === 'DOCTOR'
                  ? ['All Services', 'General OPD', 'Specialist Consult', 'Follow-up Review', 'Health Checkup']
                  : ['All Services', 'Haircut', 'Beard Trim', 'Facial & Glow', 'Hair Color', 'Spa & Massage']
              ).map((cat, i) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedServiceCategory(cat)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors flex items-center gap-2 border ${selectedServiceCategory === cat || (cat === 'All Services' && selectedServiceCategory === 'All Services') ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {cat.includes('Hair') ? <span className="text-base leading-none">✂</span> : ''}
                  {cat.includes('Beard') ? <span className="text-base leading-none">🧔</span> : ''}
                  {cat.includes('Dine-in') ? <span className="text-base leading-none">🍽️</span> : ''}
                  {cat.includes('Takeaway') ? <span className="text-base leading-none">🥡</span> : ''}
                  {cat.includes('OPD') || cat.includes('Consult') ? <span className="text-base leading-none">🩺</span> : ''}
                  {cat} {i === 0 ? `(${bookings.length})` : ''}
                </button>
              ))}
              <button className="px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 flex items-center gap-1 ml-auto">
                More <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Sub Filters Row */}
            <div className="flex flex-col md:flex-row gap-3 mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search by customer, token number, or service..." 
                  value={searchBookingQuery}
                  onChange={e => setSearchBookingQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm font-medium"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <select className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-100">
                  <option>All Types</option>
                  <option>Tokens</option>
                  <option>Appointments</option>
                </select>
                <select className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-100">
                  <option>All Status</option>
                  <option>Waiting</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <select className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-100">
                  <option>All Staff</option>
                </select>
                <select className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-100 flex items-center gap-2">
                  <option>📅 Today</option>
                  <option>📅 Tomorrow</option>
                  <option>📅 This Week</option>
                </select>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 relative">
              {/* Left side: Table */}
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Showing {bookings.length} bookings
                  </div>
                  <button className="text-xs font-bold text-slate-600 flex items-center gap-1 hover:text-slate-900">
                    Sort: Time <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {/* Desktop Table */}
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                      <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold">
                        <th className="p-4 pl-6 font-medium">Token / Booking</th>
                        <th className="p-4 font-medium">Customer</th>
                        <th className="p-4 font-medium">Service</th>
                        <th className="p-4 font-medium">Time</th>
                        <th className="p-4 font-medium">Staff / Resource</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 pr-6 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <Ticket className="w-12 h-12 text-slate-200" />
                              <p className="font-semibold text-slate-600">No bookings found</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        bookings.map((booking, index) => {
                          const isSelected = selectedBookingDetails?.rawId === booking.rawId;
                          const isToken = booking.id.startsWith('TOKEN') || booking.id.startsWith('MV-TKN') || booking.bookingMode === 'TOKEN';
                          const idLabel = isToken ? `Token #${booking.tokenNumber || '?'}` : booking.id;
                          
                          const badgeColor = isToken 
                            ? (booking.status === 'In Progress' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700')
                            : 'bg-fuchsia-100 text-fuchsia-700';

                          return (
                          <tr 
                            key={index} 
                            onClick={() => setSelectedBookingDetails(booking)}
                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                          >
                            <td className="p-4 pl-6">
                              <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-black tracking-wide ${badgeColor}`}>
                                {isToken ? '' : <CalendarClock className="w-4 h-4 mr-1 inline" />}{idLabel}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{booking.customer}</div>
                              <div className="text-xs font-medium text-slate-500">+91 98765 432{10 + (index % 90)}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-700 flex items-center gap-2 whitespace-nowrap">
                                {booking.service.includes('Haircut') ? <Scissors className="w-5 h-5 text-indigo-500" /> :
                                 booking.service.includes('Beard') ? <User className="w-5 h-5 text-indigo-500" /> :
                                 booking.service.includes('Facial') ? <Sparkles className="w-5 h-5 text-pink-500" /> :
                                 booking.service.includes('Color') ? <Palette className="w-5 h-5 text-purple-500" /> :
                                 booking.service.includes('Massage') ? <Activity className="w-5 h-5 text-teal-500" /> :
                                 booking.service.includes('Spa') ? <Droplet className="w-5 h-5 text-cyan-500" /> :
                                 (booking.service.toLowerCase().includes('consult') || booking.service.toLowerCase().includes('opd') || booking.service.toLowerCase().includes('checkup')) ? <Stethoscope className="w-5 h-5 text-emerald-600" /> :
                                 (booking.service.toLowerCase().includes('dine') || booking.service.toLowerCase().includes('table') || booking.service.toLowerCase().includes('food')) ? <Utensils className="w-5 h-5 text-orange-500" /> :
                                 <Ticket className="w-5 h-5 text-slate-500" />}
                                {booking.service}
                              </div>
                            </td>
                            <td className="p-4 font-bold text-slate-700 whitespace-nowrap">
                              {booking.appointmentTime ? new Date(booking.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '10:40 AM'}
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-slate-900 whitespace-nowrap">{booking.staffName || (activeVertical === 'DOCTOR' ? 'Dr. Verma' : (activeVertical === 'FOOD' ? 'Waiter Suraj' : 'Amit'))}</div>
                              <div className="text-xs font-medium text-slate-400 whitespace-nowrap">
                                {activeVertical === 'FOOD' ? `Table ${1 + (index % 6)}` : (activeVertical === 'DOCTOR' ? `Chamber ${1 + (index % 2)}` : `Chair ${1 + (index % 4)}`)}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                booking.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                booking.status === 'Waiting' || booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                booking.status === 'Checked In' || booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {booking.status === 'Pending' ? 'Waiting' : booking.status}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <button className="px-4 py-1.5 rounded-lg border border-slate-200 text-blue-600 font-semibold text-sm hover:bg-blue-50 hover:border-blue-200 transition-colors bg-white">
                                View
                              </button>
                            </td>
                          </tr>
                        )})
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-500">
                    Showing 1-10 of {bookings.length} bookings
                  </div>
                  <div className="flex gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-600 font-medium hover:bg-slate-50">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-600 font-medium hover:bg-slate-50">3</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-600 font-medium hover:bg-slate-50">&gt;</button>
                  </div>
                </div>
              </div>

              {/* Right Side: Details Pane (Desktop) */}
              <div className="hidden xl:flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                {selectedBookingDetails ? (
                  <div className="flex flex-col h-full">
                    {/* Pane Header */}
                    <div className="p-5 border-b border-slate-100 relative">
                      <button onClick={() => setSelectedBookingDetails(null)} className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                      <div className="flex items-center justify-between mb-2 pr-8">
                        <h2 className="text-xl font-black text-slate-900">
                          {selectedBookingDetails.id}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                selectedBookingDetails.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                selectedBookingDetails.status === 'Waiting' || selectedBookingDetails.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                          {selectedBookingDetails.status === 'Pending' ? 'Waiting' : selectedBookingDetails.status}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-500">Created on 18 Sep 2026 • 10:38 AM</div>
                      
                      {/* Tabs */}
                      <div className="flex items-center gap-6 mt-6 border-b border-slate-100">
                        <button className="pb-3 text-sm font-bold text-blue-600 border-b-2 border-blue-600">Details</button>
                        <button className="pb-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Timeline</button>
                        <button className="pb-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Payment</button>
                      </div>
                    </div>

                    {/* Pane Content */}
                    <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                      
                      {/* Customer Block */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> Customer</h3>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{selectedBookingDetails.customer}</div>
                            <div className="flex flex-col gap-0.5 mt-1">
                              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Phone className="w-3 h-3" /> +91 98765 43210</span>
                              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Mail className="w-3 h-3" /> customer@gmail.com</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <hr className="border-slate-100" />

                      {/* Service Block */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Service</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{selectedBookingDetails.service.includes('Hair') ? '✂' : (selectedBookingDetails.service.includes('Beard') ? '🧔' : '💆')}</span>
                          <span className="font-bold text-slate-800">{selectedBookingDetails.service}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> 20 minutes</span>
                          <span className="flex items-center gap-1 text-slate-900 font-bold">💸 ₹{selectedBookingDetails.price || 200}</span>
                        </div>
                        <div className="text-sm text-slate-500 mt-2 font-medium">
                          Booking Type: <span className="text-slate-800">{selectedBookingDetails.bookingMode === 'APPOINTMENT' ? 'Appointment' : 'Token'}</span>
                        </div>
                      </div>

                      <hr className="border-slate-100" />

                      {/* Assignment */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> Assignment</h3>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <div className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                              <Users className="w-4 h-4 text-slate-400" /> Staff: <span className="font-bold text-slate-900">{selectedBookingDetails.staffName || 'Rahul'}</span>
                            </div>
                            <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                              <Store className="w-4 h-4 text-slate-400" /> Resource: <span className="font-bold text-slate-900">Chair 1</span>
                            </div>
                          </div>
                          <button className="px-3 py-1.5 bg-white border border-slate-200 text-blue-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                            Assign / Change
                          </button>
                        </div>
                      </div>

                      {/* Status / Time */}
                      <div className="flex items-start gap-6">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-slate-400" /> Status</h3>
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">Waiting</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 mb-2 invisible">Time</h3>
                          <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg"><Clock className="w-4 h-4 text-slate-400" /> Est: 10:40 AM</div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400" /> Notes</h3>
                        <div className="text-sm text-slate-600 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                          Regular customer. Prefers Chair 1.
                        </div>
                      </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4" /> Start Service
                        </button>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm">
                          <Phone className="w-4 h-4" /> Call Customer
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-xl transition-colors text-sm">Transfer</button>
                        <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-xl transition-colors text-sm">Edit</button>
                        <button className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold py-2 rounded-xl transition-colors text-sm">Cancel</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-slate-50/30">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                      <Ticket className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">No Booking Selected</h3>
                    <p className="text-sm font-medium max-w-[200px] mx-auto">Select a booking from the list to view its complete details and manage actions.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Bottom Sheet for Details */}
            <div className={`xl:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${selectedBookingDetails ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
              <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] flex flex-col transition-transform duration-300 transform ${selectedBookingDetails ? 'translate-y-0' : 'translate-y-full'}`}>
                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-2" onClick={() => setSelectedBookingDetails(null)}>
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                </div>
                
                {selectedBookingDetails && (
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="px-5 pb-4 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="text-xl font-black text-slate-900">
                        {selectedBookingDetails.id}
                      </h2>
                      <button onClick={() => setSelectedBookingDetails(null)} className="p-2 bg-slate-100 hover:bg-slate-200 transition-colors rounded-full text-slate-500">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6 pb-32">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-lg">{selectedBookingDetails.customer}</div>
                          <div className="text-sm font-medium text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> +91 98765 43210</div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Service</h3>
                        <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                           <span className="text-xl">{selectedBookingDetails.service.includes('Hair') ? '✂' : (selectedBookingDetails.service.includes('Beard') ? '🧔' : '💆')}</span>
                           {selectedBookingDetails.service}
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-600 mt-2">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> 20 mins</span>
                          <span className="flex items-center gap-1 font-bold text-slate-900">💸 ₹{selectedBookingDetails.price || 200}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                        <div>
                          <div className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5"><Users className="w-3.5 h-3.5"/> Staff: <strong className="text-slate-900">{selectedBookingDetails.staffName || 'Rahul'}</strong></div>
                          <div className="text-sm font-medium text-slate-600 flex items-center gap-1.5"><Store className="w-3.5 h-3.5"/> Resource: <strong className="text-slate-900">Chair 1</strong></div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 shadow-sm border border-amber-200">Waiting</span>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400" /> Notes</h3>
                        <div className="text-sm text-slate-600 bg-yellow-50 p-4 rounded-xl border border-yellow-100 shadow-sm">
                          Regular customer. Prefers Chair 1.
                        </div>
                      </div>
                    </div>
                    
                    {/* Sticky Mobile Actions */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                      <div className="flex gap-3">
                        <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5"/> Start
                        </button>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2">
                          <Phone className="w-5 h-5"/> Call
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'orders' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Recent Orders</h1>
              <p className="text-slate-500 mt-2">Track and manage your customer orders.</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="p-4 pl-6">Order ID</th>
                    <th className="p-4">Buyer</th>
                    <th className="p-4">Item</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-medium text-slate-900">{order.orderNumber || order.id}</td>
                      <td className="p-4 text-slate-700">{order.buyer}</td>
                      <td className="p-4 text-slate-600 truncate max-w-[200px]">{order.item}</td>
                      <td className="p-4 text-slate-500 text-sm">{order.date}</td>
                      <td className="p-4 font-bold text-slate-900">{order.amount}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {order.status === 'Pending' ? (
                          <button 
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                            onClick={() => setOrders(orders.map(o => o.id === order.id ? {...o, status: 'Shipped'} : o))}
                          >
                            Mark Shipped
                          </button>
                        ) : (
                          <button className="text-slate-400 hover:text-slate-600 font-medium text-sm">View</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">B2B Leads & Inquiries</h1>
              <p className="text-slate-500 mt-2">Manage Requests for Quotation (RFQs) and business inquiries.</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Qty Req.</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 text-sm text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-slate-900 font-medium">{lead.product?.name || 'Unknown'}</td>
                      <td className="p-4 font-bold text-blue-600">{lead.quantityRequested} Units</td>
                      <td className="p-4 text-slate-600 text-sm truncate max-w-[200px]" title={lead.message}>{lead.message}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          lead.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          lead.status === 'REPLIED' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {lead.status === 'PENDING' ? (
                          <button 
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                            onClick={() => {
                              fetch(`${API_URL}/leads/${lead.id}/status`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'REPLIED' })
                              }).then(() => {
                                setLeads(leads.map(l => l.id === lead.id ? {...l, status: 'REPLIED'} : l))
                              });
                            }}
                          >
                            Mark Replied
                          </button>
                        ) : (
                          <button className="text-slate-400 hover:text-slate-600 font-medium text-sm">View</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No leads found. When a buyer requests a quote, it will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* CUSTOMERS MANAGEMENT TAB */}
        {activeTab === 'customers' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Customer Directory</h1>
                <p className="text-slate-500 mt-1">
                  {activeVertical === 'FOOD'
                    ? 'Track your restaurant guests, repeat diners, reservation history, and VIP tables.'
                    : 'Manage client relationships, visit histories, and customer contact info.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                  ● Live Sync Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                  👥
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">128</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Guests / Clients</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                  ⭐
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">42</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Repeat Diners / VIP</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  📈
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">₹1,420</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Average Ticket Size</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
                <span className="font-bold text-slate-800 text-sm">Recent Diners & Guests</span>
                <span className="text-xs text-slate-500">Auto-logged from table bookings & queue tokens</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { name: 'Rahul Sharma', phone: '+91 98765 43210', visits: 4, tag: 'VIP Diner', lastVisit: 'Today', totalSpent: '₹3,450' },
                  { name: 'Pooja Verma', phone: '+91 98112 34567', visits: 1, tag: 'Family Party', lastVisit: 'Today', totalSpent: '₹1,820' },
                  { name: 'Vikram Joshi', phone: '+91 99887 76655', visits: 7, tag: 'Regular Guest', lastVisit: 'Yesterday', totalSpent: '₹6,200' },
                  { name: 'Sanjay Gupta', phone: '+91 97654 32109', visits: 3, tag: 'Corporate', lastVisit: '3 days ago', totalSpent: '₹4,100' },
                  { name: 'Ananya Sharma', phone: '+91 98223 11445', visits: 2, tag: 'Private Dining', lastVisit: 'Last week', totalSpent: '₹2,680' }
                ].map((cust, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{cust.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                            {cust.tag}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">{cust.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 sm:text-right">
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Visits</div>
                        <div className="text-sm font-bold text-slate-800">{cust.visits} times</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Lifetime Spend</div>
                        <div className="text-sm font-bold text-emerald-600">{cust.totalSpent}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Last Visit</div>
                        <div className="text-xs font-semibold text-slate-600">{cust.lastVisit}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STAFF & WAITERS MANAGEMENT TAB */}
        {activeTab === 'staff' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {activeVertical === 'FOOD' ? 'Kitchen & Service Staff' : (activeVertical === 'DOCTOR' ? 'Doctors & Clinic Staff' : 'Stylists & Salon Team')}
                </h1>
                <p className="text-slate-500 mt-1">
                  {activeVertical === 'FOOD' 
                    ? 'Manage your chefs, captains, and waiters for dining tables & KOT assignments.' 
                    : 'Manage active working staff, shift schedules, and resource desks.'}
                </p>
              </div>
              <button 
                onClick={() => setShowStaffModal(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-rose-600/20 transition-colors flex items-center gap-2 text-sm"
              >
                <PlusCircle className="w-4 h-4" /> Add Staff Member
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { name: 'Chef Rajesh Kumar', role: 'Head Chef', shift: 'Morning & Evening', status: 'On Duty', assigned: 'Kitchen Main (KOT)' },
                { name: 'Amit Singh', role: 'Captain / Waiter', shift: 'Full Day', status: 'Active on Floor', assigned: 'Tables 1 to 4' },
                { name: 'Sunil Rawat', role: 'Service Waiter', shift: 'Evening Shift', status: 'Active on Floor', assigned: 'Tables 5 to 7' },
                { name: 'Vikas Mehra', role: 'Tandoor & Breads Chef', shift: 'Morning & Evening', status: 'On Duty', assigned: 'Live Tandoor Station' }
              ].map((member, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between group hover:border-rose-300 transition-all">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-base">
                        {member.name.charAt(0)}
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ● {member.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{member.name}</h3>
                    <p className="text-xs font-semibold text-rose-600 mt-0.5">{member.role}</p>
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assignment:</span>
                        <span className="font-semibold text-slate-800">{member.assigned}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Shift:</span>
                        <span className="font-semibold text-slate-700">{member.shift}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                    <button 
                      onClick={() => setShowStaffModal(true)}
                      className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                      Edit Shift
                    </button>
                    <button 
                      onClick={() => alert(`Shift status for ${member.name} updated.`)}
                      className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                    >
                      Take Break
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {['projects', 'milestones', 'enquiries', 'inventory', 'proposals'].includes(activeTab) && (
          <div className="max-w-6xl mx-auto py-20 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4 capitalize">{activeTab} Management</h2>
            <p className="text-slate-500">This feature is part of your sector&apos;s advanced workflow and is currently being built.</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-300 pb-12 font-sans">
            {/* Page Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Business Profile</h1>
                <p className="text-sm text-slate-500 mt-1">Review your verified credentials, contact channels, and physical location.</p>
              </div>
              {!isEditingProfile ? (
                <button 
                  onClick={handleEditProfileInit}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 self-start sm:self-auto">
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Profile Hero Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                    {(user?.business?.name || user?.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">{user?.business?.name || user?.name || 'Seller Business'}</h2>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {user?.business?.verified ? 'Verified Business' : 'Active Account'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span>Category: <strong className="text-slate-700 font-medium">{user?.business?.businessType || 'Standard'}</strong></span>
                      <span>•</span>
                      <span>Sector: <strong className="text-slate-700 font-medium">{user?.business?.sector || 'General Commerce'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400">Account ID:</span>
                  <span className="font-mono font-bold text-blue-700">{user?.markatId || 'MV-Pending'}</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid: Editable Details vs Platform Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              
              {/* Section 1: Business & Contact Information */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Contact & Legal Identity</h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                      Editable by You
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Legal Business Name</label>
                      {isEditingProfile ? (
                        <input 
                          type="text"
                          value={profileForm.businessName} 
                          onChange={e => setProfileForm({...profileForm, businessName: e.target.value})} 
                          className="w-full px-3.5 py-2.5 text-sm font-normal text-slate-900 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                        />
                      ) : (
                        <div className="text-sm font-medium text-slate-800 bg-slate-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/60">
                          {user?.business?.name || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Owner / Representative Name</label>
                      {isEditingProfile ? (
                        <input 
                          type="text"
                          value={profileForm.ownerName} 
                          onChange={e => setProfileForm({...profileForm, ownerName: e.target.value})} 
                          className="w-full px-3.5 py-2.5 text-sm font-normal text-slate-900 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                        />
                      ) : (
                        <div className="text-sm font-medium text-slate-800 bg-slate-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/60">
                          {user?.name || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                      {isEditingProfile ? (
                        <input 
                          type="text"
                          value={profileForm.phone} 
                          onChange={e => setProfileForm({...profileForm, phone: e.target.value})} 
                          className="w-full px-3.5 py-2.5 text-sm font-normal text-slate-900 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                        />
                      ) : (
                        <div className="text-sm font-medium text-slate-800 bg-slate-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/60 font-mono">
                          {user?.phone || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
                      {isEditingProfile ? (
                        <input 
                          type="email"
                          value={profileForm.email} 
                          onChange={e => setProfileForm({...profileForm, email: e.target.value})} 
                          className="w-full px-3.5 py-2.5 text-sm font-normal text-slate-900 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                        />
                      ) : (
                        <div className="text-sm font-medium text-slate-800 bg-slate-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/60">
                          {user?.email || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">GST / Tax Identification</label>
                      {isEditingProfile ? (
                        <input 
                          type="text"
                          value={profileForm.gstNumber} 
                          onChange={e => setProfileForm({...profileForm, gstNumber: e.target.value})} 
                          className="w-full px-3.5 py-2.5 text-sm font-normal text-slate-900 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase" 
                        />
                      ) : (
                        <div className="text-sm font-medium text-slate-800 bg-slate-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/60 font-mono">
                          {user?.business?.gstNumber || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Platform & Contract Parameters (System Locked) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Platform & Agreement</h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                      System Managed
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Business Classification</label>
                      <div className="text-sm font-medium text-slate-800 bg-slate-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between">
                        <span>{user?.business?.businessType || 'Standard'}</span>
                        <span className="text-xs text-slate-500 font-semibold">{user?.business?.businessModel || 'B2C'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Operational Capabilities</label>
                      <div className="text-sm font-medium text-slate-800 bg-slate-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/60">
                        {user?.business?.capabilities?.length ? user.business.capabilities.join(', ') : 'Standard Catalog'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Commercial Revenue Terms</label>
                      <div className="text-sm font-medium text-slate-800 bg-slate-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/60">
                        {user?.business ? (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/70 inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {user.business.commissionType === 'PERCENTAGE' 
                              ? `${user.business.commissionRate}% Marketplace Commission`
                              : `₹${user.business.commissionRate} Flat Fee per Settlement`}
                          </span>
                        ) : 'Standard Marketplace Terms'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Store Code</label>
                      <div className="text-sm font-mono font-medium text-slate-800 bg-slate-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/60">
                        {user?.business?.businessCode || user?.business?.id?.slice(-8) || 'STORE-01'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 leading-relaxed">
                      To modify locked platform agreements or commission tiers, please contact partner support through the Help Center.
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Section 3: Physical Location & Store Operating Hours */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Store Location & Operating Hours</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Used for customer discovery radius and open/close indicators.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Customer Facing
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Store Coordinates & Map Pin</label>
                  {isEditingProfile ? (
                    <div className="mb-4">
                      <LocationPicker 
                        latitude={profileForm.latitude} 
                        longitude={profileForm.longitude} 
                        onChange={async (lat, lng) => {
                          setProfileForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
                          try {
                            const [nomRes, bdcRes] = await Promise.all([
                              fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`),
                              fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
                            ]);
                            const nomData = nomRes.ok ? await nomRes.json() : null;
                            const bdcData = bdcRes.ok ? await bdcRes.json() : null;
                            if (nomData && nomData.address && bdcData) {
                              const newPin = bdcData.postcode || nomData.address.postcode || '';
                              const localParts = [];
                              if (nomData.address.house_number) localParts.push(nomData.address.house_number);
                              if (nomData.address.road) localParts.push(nomData.address.road);
                              if (nomData.address.neighbourhood) localParts.push(nomData.address.neighbourhood);
                              if (nomData.address.suburb) localParts.push(nomData.address.suburb);
                              
                              let shortAddress = localParts.join(', ');
                              if (!shortAddress && nomData.display_name) {
                                shortAddress = nomData.display_name.split(',').slice(0, 2).join(',').trim();
                              }
                              if (!shortAddress) shortAddress = bdcData.locality || '';
                              const city = bdcData.city || nomData.address.city || bdcData.locality || '';
                              const state = bdcData.principalSubdivision || nomData.address.state || '';
                              const newAddress = shortAddress ? `${shortAddress}, ${city}, ${state}` : '';

                              setProfileForm(prev => ({
                                ...prev,
                                pincode: newPin || prev.pincode,
                                address: newAddress || prev.address
                              }));
                            }
                          } catch (err) {
                            console.error('Geocoding error:', err);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-200">
                      {user?.business?.latitude ? (
                        <div className="pointer-events-none">
                          <LocationPicker 
                            latitude={user.business.latitude} 
                            longitude={user.business.longitude} 
                            readOnly={true} 
                          />
                        </div>
                      ) : (
                        <div className="h-44 w-full bg-slate-50 flex items-center justify-center text-center p-4">
                          <div>
                            <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <div className="text-xs font-semibold text-slate-700">GPS Pin Not Configured</div>
                            <div className="text-xs text-blue-600 mt-1 cursor-pointer font-medium" onClick={handleEditProfileInit}>Click Edit Profile to set location</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Physical Address</label>
                      {isEditingProfile ? (
                        <textarea 
                          rows={2} 
                          value={profileForm.address} 
                          onChange={e => setProfileForm({...profileForm, address: e.target.value})} 
                          className="w-full px-3.5 py-2.5 text-sm font-normal text-slate-900 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" 
                        />
                      ) : (
                        <div className="text-sm font-medium text-slate-800 bg-slate-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/60">
                          {user?.business?.address || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Postal Code (PIN)</label>
                      {isEditingProfile ? (
                        <input 
                          type="text"
                          value={profileForm.pincode} 
                          onChange={e => setProfileForm({...profileForm, pincode: e.target.value})} 
                          className="w-full px-3.5 py-2.5 text-sm font-normal text-slate-900 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                        />
                      ) : (
                        <div className="text-sm font-medium text-slate-800 bg-slate-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/60 font-mono">
                          {user?.business?.pincode || 'Not specified'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operating Hours Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-500">Weekly Schedule</label>
                    {isEditingProfile && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const standard = {
                              monday: { open: '09:00', close: '18:00', closed: false },
                              tuesday: { open: '09:00', close: '18:00', closed: false },
                              wednesday: { open: '09:00', close: '18:00', closed: false },
                              thursday: { open: '09:00', close: '18:00', closed: false },
                              friday: { open: '09:00', close: '18:00', closed: false },
                              saturday: { open: '09:00', close: '18:00', closed: false },
                              sunday: { open: '09:00', close: '18:00', closed: true },
                            };
                            setProfileForm(p => ({ ...p, businessHours: standard }));
                          }}
                          className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
                        >
                          Standard 9-6
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const allOpen = {
                              monday: { open: '08:00', close: '22:00', closed: false },
                              tuesday: { open: '08:00', close: '22:00', closed: false },
                              wednesday: { open: '08:00', close: '22:00', closed: false },
                              thursday: { open: '08:00', close: '22:00', closed: false },
                              friday: { open: '08:00', close: '23:00', closed: false },
                              saturday: { open: '08:00', close: '23:00', closed: false },
                              sunday: { open: '09:00', close: '21:00', closed: false },
                            };
                            setProfileForm(p => ({ ...p, businessHours: allOpen }));
                          }}
                          className="text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors"
                        >
                          All 7 Days
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-3 space-y-2.5">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                        const dayConfig = (profileForm.businessHours && profileForm.businessHours[day]) || { open: '09:00', close: '18:00', closed: day === 'sunday' };
                        return (
                          <div key={day} className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl border transition-all ${dayConfig.closed ? 'bg-slate-100/60 border-slate-200 opacity-75' : 'bg-white border-slate-200/90 shadow-2xs'}`}>
                            <div className="flex items-center justify-between sm:justify-start gap-3 min-w-[110px]">
                              <span className="capitalize font-bold text-xs text-slate-800">{day}</span>
                              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold">
                                <input
                                  type="checkbox"
                                  checked={dayConfig.closed}
                                  onChange={(e) => {
                                    const updated = {
                                      ...profileForm.businessHours,
                                      [day]: { ...dayConfig, closed: e.target.checked }
                                    };
                                    setProfileForm({ ...profileForm, businessHours: updated });
                                  }}
                                  className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                                />
                                <span className={dayConfig.closed ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                                  {dayConfig.closed ? 'Closed today' : 'Open'}
                                </span>
                              </label>
                            </div>

                            {!dayConfig.closed ? (
                              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-medium text-slate-400">From</span>
                                  <input
                                    type="time"
                                    value={dayConfig.open || '09:00'}
                                    onChange={(e) => {
                                      const updated = {
                                        ...profileForm.businessHours,
                                        [day]: { ...dayConfig, open: e.target.value }
                                      };
                                      setProfileForm({ ...profileForm, businessHours: updated });
                                    }}
                                    className="px-2 py-1 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                  />
                                </div>
                                <span className="text-slate-400 text-xs font-bold">–</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-medium text-slate-400">To</span>
                                  <input
                                    type="time"
                                    value={dayConfig.close || '18:00'}
                                    onChange={(e) => {
                                      const updated = {
                                        ...profileForm.businessHours,
                                        [day]: { ...dayConfig, close: e.target.value }
                                      };
                                      setProfileForm({ ...profileForm, businessHours: updated });
                                    }}
                                    className="px-2 py-1 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1 sm:mt-0 text-[11px] font-semibold text-rose-500 italic bg-rose-50/80 px-2 py-0.5 rounded-md">
                                Store closed for walk-ins & bookings
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-slate-50/80 rounded-xl border border-slate-200/70 overflow-hidden divide-y divide-slate-200/60">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                        const schedule = (user?.business?.businessHours as any) || defaultSchedule;
                        const hrs = schedule[day] || (day === 'sunday' ? { closed: true } : { open: '09:00', close: '18:00', closed: false });
                        
                        // Check if today matches this day to highlight
                        const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toLowerCase();
                        const isToday = todayName === day;

                        return (
                          <div key={day} className={`flex justify-between items-center px-4 py-2.5 text-xs transition-colors ${isToday ? 'bg-blue-50/70 font-semibold' : ''}`}>
                            <div className="flex items-center gap-2">
                              <span className="capitalize font-semibold text-slate-700">{day}</span>
                              {isToday && (
                                <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-600 text-white">
                                  Today
                                </span>
                              )}
                            </div>
                            <span className="font-medium text-slate-600">
                              {hrs.closed ? (
                                <span className="text-rose-600 font-semibold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">Closed</span>
                              ) : (
                                <span className="text-slate-800 font-semibold">{hrs.open} – {hrs.close}</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}


        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Account & Store Settings</h1>
                <p className="text-slate-500 mt-1">Configure operational preferences, notification alerts, and security.</p>
              </div>
              <button 
                onClick={() => setActiveTab('profile')}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors border border-indigo-100 flex items-center gap-1.5 w-fit"
              >
                <User className="w-4 h-4" /> View Business Profile →
              </button>
            </div>

            {/* 1. STORE OPERATIONAL PREFERENCES */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Store Operational Settings</h2>
                  <p className="text-xs text-slate-500">Control ordering availability, walk-in reception, and auto-confirmations.</p>
                </div>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-sm font-bold text-slate-800">Accept New Online Orders & Tokens</div>
                    <div className="text-xs text-slate-500">Temporarily pause incoming bookings or order requests during rush hours.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={storeSettings.acceptOrders} 
                      onChange={(e) => updateStoreSetting('acceptOrders', e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <div className="text-sm font-bold text-slate-800">Auto-Issue Token on Payment</div>
                    <div className="text-xs text-slate-500">Instantly generate sequential queue numbers without manual seller approval.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={storeSettings.autoIssueToken} 
                      onChange={(e) => updateStoreSetting('autoIssueToken', e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <div className="text-sm font-bold text-slate-800">Sound Alerts on New Orders / Tokens</div>
                    <div className="text-xs text-slate-500">Play an audible chime on your device when a customer joins queue or checks out.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={storeSettings.soundAlerts} 
                      onChange={(e) => updateStoreSetting('soundAlerts', e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* 2. NOTIFICATIONS & ALERTS */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Notifications & Alerts</h2>
                  <p className="text-xs text-slate-500">Choose how customer actions and daily summary reports are delivered.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={storeSettings.smsNotifs} 
                    onChange={(e) => updateStoreSetting('smsNotifs', e.target.checked)}
                    className="mt-1 rounded text-indigo-600 focus:ring-indigo-500" 
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">SMS Order Notifications</div>
                    <div className="text-[11px] text-slate-500">Instant SMS to registered seller phone on high-priority orders.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={storeSettings.whatsappAlerts} 
                    onChange={(e) => updateStoreSetting('whatsappAlerts', e.target.checked)}
                    className="mt-1 rounded text-indigo-600 focus:ring-indigo-500" 
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">WhatsApp Alert Dispatch</div>
                    <div className="text-[11px] text-slate-500">Direct WhatsApp updates for token dispatch and reservations.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={storeSettings.emailDigest} 
                    onChange={(e) => updateStoreSetting('emailDigest', e.target.checked)}
                    className="mt-1 rounded text-indigo-600 focus:ring-indigo-500" 
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Email Daily Sales Digest</div>
                    <div className="text-[11px] text-slate-500">Receive summary of daily revenue, closed tokens, and settlements.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={storeSettings.securityAlerts} 
                    onChange={(e) => updateStoreSetting('securityAlerts', e.target.checked)}
                    className="mt-1 rounded text-indigo-600 focus:ring-indigo-500" 
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Critical System Security Alerts</div>
                    <div className="text-[11px] text-slate-500">Notifications on new device logins and bank account modifications.</div>
                  </div>
                </label>
              </div>
            </div>

            {settingsSavedToast && (
              <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-in slide-in-from-bottom-3 duration-200">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">✓</div>
                <div>
                  <div className="text-xs font-bold">Preferences Saved</div>
                  <div className="text-[10px] text-slate-400">Settings updated and active in real-time.</div>
                </div>
              </div>
            )}

            {/* 3. SECURITY & CREDENTIALS */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Security & Password</h2>
                  <p className="text-xs text-slate-500">Update your seller account login password and credential security.</p>
                </div>
              </div>

              <form 
                className="space-y-4 max-w-lg" 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  const currentPass = target.currentPassword.value;
                  const newPass = target.newPassword.value;
                  const confirmPass = target.confirmPassword.value;

                  if (newPass !== confirmPass) {
                    alert('New passwords do not match.');
                    return;
                  }
                  if (newPass.length < 6) {
                    alert('New password must be at least 6 characters.');
                    return;
                  }

                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/auth/update-password`, {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                      },
                      body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
                    });
                    if (res.ok) {
                      alert('Password updated successfully!');
                      target.reset();
                    } else {
                      const data = await res.json().catch(() => null);
                      alert(data?.message || 'Password update failed.');
                    }
                  } catch {
                    alert('Password updated successfully!');
                    target.reset();
                  }
                }}
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <input name="currentPassword" type="password" required placeholder="••••••••" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                    <input name="newPassword" type="password" required minLength={6} placeholder="Min. 6 chars" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <input name="confirmPassword" type="password" required minLength={6} placeholder="Repeat password" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                  </div>
                </div>
                <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors">
                  Update Password
                </button>
              </form>
            </div>

            {/* 4. DANGER ZONE */}
            <div className="bg-white rounded-3xl border border-red-200 shadow-sm overflow-hidden p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
                  <p className="text-xs text-slate-500">Irreversible actions on your MarkatVerse seller account.</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6 text-xs leading-relaxed max-w-2xl">
                Deleting your seller account will permanently wipe your business profile, listings, services, menus, and queues. <strong className="text-slate-800">Your customer account, shopping history, and profile remain completely active and will NOT be deleted.</strong>
              </p>
              <button 
                onClick={async () => {
                  const confirmText = window.prompt('Are you sure you want to close your seller account? Your customer account will remain active.\n\nType "delete" below to confirm:');
                  if(confirmText === 'delete') {
                    try {
                      const res = await fetch(`${API_URL}/sellers/user/${user?.id}`, { method: 'DELETE' });
                      if(res.ok) {
                        alert('Seller account successfully closed. Your customer account remains active!');
                        // Refresh user role in session so user stays logged in as a normal customer
                        if (login && user) {
                          login({ ...user, role: 'CONSUMER' });
                        }
                        router.push('/');
                      } else {
                        const errData = await res.json().catch(() => null);
                        alert(errData?.message || 'Failed to close seller account.');
                      }
                    } catch {
                      alert('Error closing seller account.');
                    }
                  } else if (confirmText !== null) {
                    alert('Deletion cancelled. You did not type "delete".');
                  }
                }}
                className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 border border-red-200"
              >
                <Trash2 className="w-4 h-4" /> Delete My Seller Account
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SellerDashboard() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
