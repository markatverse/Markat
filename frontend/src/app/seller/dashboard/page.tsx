"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import { Store, BarChart3, Package, PlusCircle, ArrowLeft, Trash2, Edit2, CheckCircle2, CalendarClock, Settings, Menu, X, Users, TrendingUp, Ticket, Clock, Ban, Search, Phone, Mail, FileText, MapPin, ChevronDown, Activity, Scissors, User, UserPlus, Sparkles, Palette, Droplet, Briefcase, Eye, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';
import StaffResourceManagementModal from '@/components/StaffResourceManagementModal';
import DynamicFormEngine from '@/components/DynamicFormEngine';
import LocationPicker from '@/components/LocationPicker';

const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdding = searchParams.get('action') === 'add';
  const [activeTab, setActiveTab] = useState(isAdding ? 'add' : 'overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addProduct, editProduct, deleteProduct, products, categories } = useProducts();
  const [isPremiumSeller, setIsPremiumSeller] = useState(true); // Mock state to demonstrate the paywall
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user, login, logout, isLoading } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  
  // New State variables for Tokens & Bookings Dashboard
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any | null>(null);
  const [searchBookingQuery, setSearchBookingQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [staffFilter, setStaffFilter] = useState('All Staff');
  const [dateFilter, setDateFilter] = useState('Today');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('All Services');

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
  const QUEUE_TOKEN_FLOW = ['Doctor', 'Salon', 'Spa', 'Beauty Parlour', 'Repair', 'Services', 'Beauty', 'Car Wash', 'Healthcare'];
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

  // Dynamic Flow Resolution (Reads from Category Engine FIRST, falls back to hardcoded strings)
  const isCartFlow = allowedFeatures.includes('Product Stock') || allowedFeatures.includes('B2C') || hasCartProducts || CART_ORDER_FLOW.includes(sellerSector) || isB2C;
  const isRfqFlow = allowedFeatures.includes('RFQ') || allowedFeatures.includes('Quote') || allowedFeatures.includes('B2B') || hasRfqProducts || RFQ_QUOTE_FLOW.includes(sellerSector) || isB2B;
  const isQueueFlow = allowedFeatures.includes('Token') || hasQueueServices || QUEUE_TOKEN_FLOW.includes(sellerSector) || isService;
  const isProjectFlow = hasProjectServices || PROJECT_MILESTONE_FLOW.includes(sellerSector);
  const isMeetingFlow = allowedFeatures.includes('Appointment') || allowedFeatures.includes('Meeting') || hasMeetingServices || MEETING_PROPOSAL_FLOW.includes(sellerSector);
  const isAssetFlow = allowedFeatures.includes('Vehicle Test Drive') || hasAssetListings || ENQUIRY_ASSET_FLOW.includes(sellerSector);

  // For backward compatibility in some places
  const isServiceProvider = isQueueFlow || isProjectFlow || isMeetingFlow || isService || sellerCategory?.primaryType === 'SERVICE';
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    ownerName: '', phone: '', email: '', businessName: '', gstNumber: '', address: '', pincode: '', latitude: null as number | null, longitude: null as number | null
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
          <img src="/logo.png" alt="MarkatVerse" className="h-8 object-contain scale-[2] origin-left" />
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
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
          <Link href="/" className="flex items-center no-underline hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="MarkatVerse" className="h-10 object-contain scale-[2.5] origin-left" />
          </Link>
          <div className="text-amber-500 text-xs font-bold tracking-widest mt-1">SELLER PORTAL</div>
          <Link href="/" className="text-blue-600 flex items-center gap-2 hover:opacity-80 transition-opacity font-bold text-sm mt-2">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>
        </div>
        
        <div className="p-6 text-center border-b border-slate-100">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-md mx-auto mb-4">
            {(user?.name || user?.business?.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.business?.name || user?.name || 'Seller'}</h3>
            
            <div className="flex flex-col gap-1 mt-3 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Business ID</span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {user?.business?.businessCode
                    ? user.business.businessCode
                    : <Link href="/seller/onboarding" className="text-amber-600 font-bold text-xs hover:underline">Complete Setup →</Link>
                  }
                </span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">MV Account ID</span>
                <span className="text-xs font-mono font-bold text-slate-700">{user?.markatId || 'Pending'}</span>
              </div>
            </div>

          </div>
          <div className="flex items-center justify-center gap-1 text-emerald-600 text-sm font-medium mt-2">
            <CheckCircle2 className="w-4 h-4" /> Verified Seller
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1">
          <button 
            onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <BarChart3 className="w-5 h-5" /> Dashboard
          </button>
          
          {(isB2C || isB2B || (!isService && !isServiceProvider)) && (
            <button 
              onClick={() => { setActiveTab('listings'); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'listings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Store className="w-5 h-5" /> My Shop
            </button>
          )}

          {/* SERVICE PROVIDER FLOW (Phase 1 MVP) */}
          {(isService || isServiceProvider) && (
            <>
              <button 
                onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} 
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'bookings' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <div className="flex items-center gap-3">
                  <CalendarClock className="w-5 h-5" /> Bookings
                </div>
              </button>

              <button 
                onClick={() => { setActiveTab('queue'); setIsMobileMenuOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'queue' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <span className="w-5 h-5 flex items-center justify-center text-lg">🎟️</span> Live Queue
              </button>

              <button 
                onClick={() => { setActiveTab('customers'); setIsMobileMenuOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'customers' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Users className="w-5 h-5" /> Customers
              </button>

              <button 
                onClick={() => { setActiveTab('services'); setIsMobileMenuOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'services' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Briefcase className="w-5 h-5" /> Services
              </button>

              <button 
                onClick={() => { setActiveTab('staff'); setIsMobileMenuOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'staff' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <UserPlus className="w-5 h-5" /> Staff
              </button>

              <button 
                onClick={() => { setActiveTab('earnings'); setIsMobileMenuOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'earnings' ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
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
      <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-10">
        
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
              <p className="text-slate-500 mt-2">Welcome back, {user?.name || user?.business?.name || 'Seller'}. Here&apos;s what&apos;s happening today.</p>
              
              {/* Phase 2: Verification Status Banner */}
              {user?.business && (
                <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 border ${
                  user.business.verificationStatus === 'AUTO_VERIFIED' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                  user.business.verificationStatus === 'ACTION_REQUIRED' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  user.business.verificationStatus === 'ADMIN_REVIEW_REQUIRED' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                  'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <ShieldCheck className={`w-6 h-6 shrink-0 ${
                    user.business.verificationStatus === 'AUTO_VERIFIED' ? 'text-emerald-600' :
                    user.business.verificationStatus === 'ACTION_REQUIRED' ? 'text-amber-600' :
                    user.business.verificationStatus === 'ADMIN_REVIEW_REQUIRED' ? 'text-blue-600' :
                    'text-slate-600'
                  }`} />
                  <div>
                    <h3 className="font-bold">
                      {user.business.verificationStatus === 'AUTO_VERIFIED' ? 'Account Auto-Verified' :
                       user.business.verificationStatus === 'ACTION_REQUIRED' ? 'Action Required: Missing Information' :
                       user.business.verificationStatus === 'ADMIN_REVIEW_REQUIRED' ? 'Account under Admin Review' :
                       'Verification Pending'}
                    </h3>
                    <p className="text-sm mt-1 opacity-90">
                      {user.business.verificationStatus === 'AUTO_VERIFIED' ? 'Your business passed all automated checks and is fully active.' :
                       user.business.verificationStatus === 'ACTION_REQUIRED' ? `Please update your profile to continue. Reason: ${user.business.verificationNotes || 'Missing data'}` :
                       user.business.verificationStatus === 'ADMIN_REVIEW_REQUIRED' ? 'Our team is reviewing your profile due to missing standard parameters. You will be notified shortly.' :
                       'Your profile is pending automated checks.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
              <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-6 lg:p-8 rounded-3xl text-white shadow-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110">
                  <TrendingUp className="w-24 h-24" />
                </div>
                <div className="text-emerald-100 text-sm font-bold tracking-widest uppercase mb-2 relative z-10">{isB2B ? 'B2B Trade Volume' : 'Total Sales'}</div>
                <div className="text-4xl lg:text-5xl font-black mb-4 relative z-10 drop-shadow-md">₹0</div>
                <div className="text-emerald-50 text-sm font-medium flex items-center gap-1.5 relative z-10 bg-black/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4" /> No sales yet
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-6 lg:p-8 rounded-3xl text-white shadow-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110">
                  <Store className="w-24 h-24" />
                </div>
                <div className="text-blue-100 text-sm font-bold tracking-widest uppercase mb-2 relative z-10">{isServiceProvider ? 'Active Services' : (isB2B ? 'B2B Catalog' : 'Active Listings')}</div>
                <div className="text-4xl lg:text-5xl font-black mb-4 relative z-10 drop-shadow-md">{myListings.length}</div>
                <button onClick={() => { setActiveTab(isServiceProvider ? 'services' : 'listings'); setIsMobileMenuOpen(false); }} className="text-blue-50 text-sm font-medium flex items-center gap-1.5 relative z-10 bg-black/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md hover:bg-black/20 transition-colors">
                  <Eye className="w-4 h-4" /> {isServiceProvider ? 'View services →' : 'View catalog →'}
                </button>
              </div>

              <div className="relative bg-gradient-to-br from-orange-400 to-amber-500 p-6 lg:p-8 rounded-3xl text-white shadow-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300 md:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110">
                  <Users className="w-24 h-24" />
                </div>
                <div className="text-orange-100 text-sm font-bold tracking-widest uppercase mb-2 relative z-10">
                  {isServiceProvider ? 'Live Queue / Tokens' : (isB2B ? 'Pending RFQs' : 'Pending Orders')}
                </div>
                <div className="text-4xl lg:text-5xl font-black mb-4 relative z-10 drop-shadow-md">
                  {isServiceProvider
                    ? (queueData ? `${queueData.waitingCount ?? 0}` : '0')
                    : (isB2B ? leads.length.toString() : orders.length.toString())}
                </div>
                <button onClick={() => { setActiveTab(isServiceProvider ? 'queue' : (isB2B ? 'leads' : 'orders')); setIsMobileMenuOpen(false); }}
                  className="text-orange-50 text-sm font-medium flex items-center gap-1.5 relative z-10 bg-black/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md hover:bg-black/20 transition-colors">
                  <Clock className="w-4 h-4" /> {isServiceProvider ? 'Waiting now →' : 'View pending →'}
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mb-8 lg:mb-12">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
              {(() => {
                const quickActions = [
                  { label: isServiceProvider ? 'My Services' : (isB2B ? 'B2B Catalog' : 'My Listings'), icon: '🛍️', tab: isServiceProvider ? 'services' : 'listings' },
                ];
                if (isQueueFlow) quickActions.push({ label: 'Queue & Tokens', icon: '🎟️', tab: 'queue' });
                if (isB2C || isCartFlow) quickActions.push({ label: 'Retail Orders', icon: '📦', tab: 'orders' });
                if (isB2B) quickActions.push({ label: 'Leads / RFQ', icon: '💬', tab: 'leads' });
                if (isProjectFlow || isMeetingFlow || isService) quickActions.push({ label: 'Bookings', icon: '📅', tab: 'bookings' });

                return (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                    {quickActions.map(item => (
                      <button key={item.tab} onClick={() => { setActiveTab(item.tab as any); setIsMobileMenuOpen(false); }}
                        className="bg-white border-2 border-slate-100 rounded-3xl p-6 lg:p-8 flex flex-col items-center gap-4 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-4xl lg:text-5xl group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 relative z-10 drop-shadow-sm">{item.icon}</span>
                        <span className="text-base lg:text-lg font-bold text-slate-700 text-center leading-tight relative z-10 group-hover:text-indigo-700">{item.label}</span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
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
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{activeTab === 'services' ? 'My Services' : 'My Shop Catalog'}</h1>
                <p className="text-slate-500 mt-2">{activeTab === 'services' ? 'Manage your active services.' : 'Manage your active products.'}</p>
              </div>
              <button 
                onClick={() => setActiveTab(activeTab === 'services' ? 'add_service' : 'add_product')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" /> Add New
              </button>
            </div>
            
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
                      {product.category || 'Uncategorized'}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="font-bold text-base text-slate-900 mb-2 line-clamp-2 leading-snug">{product.name}</div>
                    <div className="flex justify-between items-end mb-5 mt-auto">
                      <span className="text-xl font-bold text-slate-900">₹{(product.price ?? 0).toLocaleString('en-IN')}</span>
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
                            setCategory(product.category || 'Electronics');
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
                            if (product.primaryType === 'SERVICE') {
                              setActiveTab('add_service');
                            } else {
                              setActiveTab('add_product');
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium text-sm transition-colors"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
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
                      <Link href={`/service/${product.id}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-lg font-medium text-sm transition-colors">
                        🌐 View Live Page
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

        {(activeTab === 'add_product' || activeTab === 'add_service') && (() => {
          const isServiceMode = activeTab === 'add_service';
          return (
          <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">
                {editingProductId ? (isServiceMode ? 'Edit Service' : 'Edit Product') : (isServiceMode ? 'Add New Service' : 'Add New Product')}
              </h1>
              <p className="text-slate-500 mt-2">{editingProductId ? 'Update the details for your listing.' : 'Create a new listing to start selling.'}</p>
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
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Add Walk-in Customer</h3>
                  <form onSubmit={handleAddWalkIn} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Customer Name</label>
                      <input type="text" required value={walkInName} onChange={e => setWalkInName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Rahul Sharma" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                      <input type="text" value={walkInPhone} onChange={e => setWalkInPhone(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 9876543210" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Service Requested</label>
                      <input type="text" required value={walkInService} onChange={e => setWalkInService(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Haircut, Spa" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Price (₹)</label>
                      <input type="number" required value={walkInPrice} onChange={e => setWalkInPrice(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 150" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                      <button type="button" onClick={() => setShowWalkInForm(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">Add to Queue</button>
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

            {/* Filter Pills */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {['All Services', 'Haircut', 'Beard', 'Facial', 'Hair Color', 'Massage'].map((cat, i) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedServiceCategory(cat)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors flex items-center gap-2 border ${selectedServiceCategory === cat || (cat === 'All Services' && selectedServiceCategory === 'All Services') ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {cat === 'Haircut' ? <span className="text-lg leading-none">✂</span> : ''}
                  {cat === 'Beard' ? <span className="text-lg leading-none">🧔</span> : ''}
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
                                {booking.service.includes('Haircut') ? <Scissors className="w-5 h-5 text-slate-500" /> :
                                 booking.service.includes('Beard') ? <User className="w-5 h-5 text-slate-500" /> :
                                 booking.service.includes('Facial') ? <Sparkles className="w-5 h-5 text-slate-500" /> :
                                 booking.service.includes('Color') ? <Palette className="w-5 h-5 text-slate-500" /> :
                                 booking.service.includes('Massage') ? <Activity className="w-5 h-5 text-slate-500" /> :
                                 booking.service.includes('Spa') ? <Droplet className="w-5 h-5 text-slate-500" /> :
                                 <Ticket className="w-5 h-5 text-slate-500" />}
                                {booking.service}
                              </div>
                            </td>
                            <td className="p-4 font-bold text-slate-700 whitespace-nowrap">
                              {booking.appointmentTime ? new Date(booking.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '10:40 AM'}
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-slate-900 whitespace-nowrap">{booking.staffName || 'Amit'}</div>
                              <div className="text-xs font-medium text-slate-400 whitespace-nowrap">Chair {1 + (index % 4)}</div>
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
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Business Profile</h1>
                <p className="text-slate-500 mt-2">View and manage your registered business details.</p>
              </div>
              {!isEditingProfile ? (
                <button 
                  onClick={handleEditProfileInit}
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">General Info</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Owner Name</div>
                      {isEditingProfile ? (
                        <input value={profileForm.ownerName} onChange={e => setProfileForm({...profileForm, ownerName: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
                      ) : (
                        <div className="font-medium text-slate-900">{user?.name || 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Phone Number</div>
                      {isEditingProfile ? (
                        <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
                      ) : (
                        <div className="font-medium text-slate-900">{user?.phone || 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Email Address</div>
                      {isEditingProfile ? (
                        <input value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
                      ) : (
                        <div className="font-medium text-slate-900">{user?.email || 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Legal Business Name</div>
                      {isEditingProfile ? (
                        <input value={profileForm.businessName} onChange={e => setProfileForm({...profileForm, businessName: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
                      ) : (
                        <div className="font-medium text-slate-900">{user?.business?.name || 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">GST / PAN</div>
                      {isEditingProfile ? (
                        <input value={profileForm.gstNumber} onChange={e => setProfileForm({...profileForm, gstNumber: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
                      ) : (
                        <div className="font-medium text-slate-900">{user?.business?.gstNumber || 'Not provided'}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Business Type</div>
                      <div className="font-medium text-slate-900">{user?.business?.businessType || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Sector</div>
                      <div className="font-medium text-slate-900">{user?.business?.sector || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Models</div>
                      <div className="font-medium text-slate-900">{user?.business?.capabilities?.join(', ') || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Revenue Model</div>
                      <div className="font-medium text-slate-900 mt-1">
                        {user?.business ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {user.business.commissionType === 'PERCENTAGE' 
                              ? `${user.business.commissionRate}% Commission`
                              : `₹${user.business.commissionRate} Flat Fee`}
                          </span>
                        ) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Location & Operations</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-xs text-slate-400 font-medium">Pinpoint Location</div>
                      </div>
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
                        <div className="mb-4">
                          {user?.business?.latitude ? (
                            <div className="pointer-events-none">
                              <LocationPicker 
                                latitude={user.business.latitude} 
                                longitude={user.business.longitude} 
                                readOnly={true} 
                              />
                            </div>
                          ) : (
                            <div className="h-40 w-full rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-center">
                              <div>
                                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <div className="text-xs font-medium text-slate-500">No GPS Pin Available</div>
                                <div className="text-[10px] text-rose-500 mt-1">Customers cannot see your shop nearby</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mb-1 mt-4">Full Address</div>
                      {isEditingProfile ? (
                        <textarea rows={3} value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
                      ) : (
                        <div className="font-medium text-slate-900">{user?.business?.address || 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">PIN Code</div>
                      {isEditingProfile ? (
                        <input value={profileForm.pincode} onChange={e => setProfileForm({...profileForm, pincode: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
                      ) : (
                        <div className="font-medium text-slate-900">{user?.business?.pincode || 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Business Hours</div>
                      <div className="text-sm text-slate-700 mt-1">
                        {user?.business?.businessHours ? (
                          <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {Object.entries(user.business.businessHours as any).map(([day, hrs]: [string, any]) => (
                              <div key={day} className="flex justify-between text-xs">
                                <span className="capitalize font-medium">{day}:</span>
                                <span>{hrs.closed ? <span className="text-rose-500 font-semibold">Closed</span> : `${hrs.open} - ${hrs.close}`}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No schedule provided</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
              <p className="text-slate-500 mt-2">Manage your seller account, profile, and preferences.</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 max-w-2xl mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" /> Business Profile
              </h2>
              <form className="space-y-4" onSubmit={async (e) => { 
                e.preventDefault(); 
                const form = e.target as HTMLFormElement;
                const data = {
                  businessName: (form[0] as HTMLInputElement).value,
                  gstNumber: (form[1] as HTMLInputElement).value,
                  address: (form[2] as HTMLTextAreaElement).value,
                };
                try {
                  const res = await fetch(`${API_URL}/sellers/user/${user?.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  if (res.ok) alert('Profile updated successfully!');
                  else alert('Failed to update profile.');
                } catch {
                  alert('Error updating profile.');
                }
              }}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Business Name</label>
                  <input type="text" required defaultValue={user?.business?.name} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">GST Number</label>
                  <input type="text" defaultValue={user?.business?.gstNumber} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Business PIN Code</label>
                  <div className="relative">
                    <input type="text" maxLength={6} value={settingsPin} onChange={e => setSettingsPin(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 560001" className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    {settingsIsFetching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                  </div>
                </div>
                {settingsAreas.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Select Area / Locality</label>
                    <select className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => {
                      const area = e.target.value;
                      const addrEl = document.getElementById('settingsAddress') as HTMLTextAreaElement;
                      if (addrEl) {
                        addrEl.value = `${area}, ${addrEl.value}`;
                      }
                    }}>
                      <option value="">Select an area to prepend to address...</option>
                      {settingsAreas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Business Address</label>
                  <textarea id="settingsAddress" defaultValue={user?.business?.address} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-24" />
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                  Save Changes
                </button>
              </form>
            </div>
            
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden p-8 max-w-2xl">
              <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Danger Zone
              </h2>
              <p className="text-slate-600 mb-6 text-sm">
                Deleting your seller account will permanently remove your business profile, all your listings/services, and any associated queues or data. This action cannot be undone.
              </p>
              <button 
                onClick={async () => {
                  const confirmText = window.prompt('Are you absolutely sure you want to delete your seller account? All data will be lost forever.\n\nType "delete" below to confirm:');
                  if(confirmText === 'delete') {
                    try {
                      const res = await fetch(`${API_URL}/sellers/user/${user?.id}`, { method: 'DELETE' });
                      if(res.ok) {
                        alert('Account successfully deleted.');
                        router.push('/seller/login');
                      } else {
                        alert('Failed to delete account.');
                      }
                    } catch {
                      alert('Error deleting account.');
                    }
                  } else if (confirmText !== null) {
                    alert('Deletion cancelled. You did not type "delete".');
                  }
                }}
                className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                Delete My Account
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
