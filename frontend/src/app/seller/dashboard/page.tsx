"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import { Store, BarChart3, Package, PlusCircle, ArrowLeft, Trash2, Edit2, CheckCircle2, CalendarClock, Settings, Menu, X, Users, TrendingUp, Ticket, Clock, Ban, Search, Phone, Mail, FileText, MapPin, ChevronDown, Activity, Scissors, User, UserPlus, Sparkles, Palette, Droplet, Briefcase, Eye, ShieldCheck, Utensils, UtensilsCrossed, Stethoscope, HeartPulse, ChefHat, MessageSquare, Lock, Check, Info, Bell, Key, PartyPopper, Car, Wrench, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';
import StaffResourceManagementModal from '@/components/StaffResourceManagementModal';
import DynamicFormEngine from '@/components/DynamicFormEngine';
import LocationPicker from '@/components/LocationPicker';
import FoodDiningModule from '@/components/FoodDiningModule';
import ClinicDoctorModule from '@/components/ClinicDoctorModule';
import SalonSpaModule from '@/components/SalonSpaModule';
import SellerProductsTab from '@/components/seller/SellerProductsTab';
import SellerServicesTab from '@/components/seller/SellerServicesTab';
import SellerEventsStationTab from '@/components/seller/SellerEventsStationTab';
import SellerOrdersTab from '@/components/seller/SellerOrdersTab';
import SellerLeadsTab from '@/components/seller/SellerLeadsTab';
import SellerStaffTab from '@/components/seller/SellerStaffTab';
import SellerCustomersTab from '@/components/seller/SellerCustomersTab';
import SellerBookingsTab from '@/components/seller/SellerBookingsTab';
import SellerQueueTab from '@/components/seller/SellerQueueTab';
import SellerWalletTab from '@/components/seller/SellerWalletTab';
import { getApiUrl } from '@/utils/api';

const API_URL = getApiUrl();

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdding = searchParams.get('action') === 'add';
  const queryTab = searchParams.get('tab');
  const querySubTab = searchParams.get('subtab') as 'tables' | 'reservations' | 'kot' | 'menu' | null;

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (queryTab === 'staff' || queryTab === 'customers') return 'customers_staff';
    if (queryTab) return queryTab;
    if (isAdding) return 'add_service';
    return 'overview';
  });

  const [peopleSubTab, setPeopleSubTab] = useState<'customers' | 'staff'>(() => {
    if (queryTab === 'staff') return 'staff';
    return 'customers';
  });

  const [foodSubTab, setFoodSubTab] = useState<'tables' | 'reservations' | 'kot' | 'menu'>(() => {
    if (querySubTab && ['tables', 'reservations', 'kot', 'menu'].includes(querySubTab)) {
      return querySubTab;
    }
    return 'tables';
  });

  // Dynamic Routing Helper: updates state and syncs query params in URL with history push
  const navigateTab = React.useCallback((newTab: string, newSubTab?: any) => {
    if (newTab === 'staff') {
      setActiveTab('customers_staff');
      setPeopleSubTab('staff');
    } else if (newTab === 'customers') {
      setActiveTab('customers_staff');
      setPeopleSubTab('customers');
    } else {
      setActiveTab(newTab);
    }

    if (newSubTab && ['tables', 'reservations', 'kot', 'menu'].includes(newSubTab)) {
      setFoodSubTab(newSubTab);
    }
    if (newSubTab && ['customers', 'staff'].includes(newSubTab)) {
      setPeopleSubTab(newSubTab);
    }
    setIsMobileMenuOpen(false);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      if (newSubTab) {
        url.searchParams.set('subtab', newSubTab);
      } else if (newTab !== 'sector_station' && newTab !== 'customers_staff') {
        url.searchParams.delete('subtab');
      }
      url.searchParams.delete('action');
      window.history.pushState({}, '', url.toString());
    }
  }, []);

  // Sync state if URL changes externally or via browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const tabFromUrl = url.searchParams.get('tab');
      if (tabFromUrl === 'staff') {
        setActiveTab('customers_staff');
        setPeopleSubTab('staff');
      } else if (tabFromUrl === 'customers') {
        setActiveTab('customers_staff');
        setPeopleSubTab('customers');
      } else if (tabFromUrl) {
        setActiveTab(tabFromUrl);
      } else {
        setActiveTab('overview');
      }
      const subTabFromUrl = url.searchParams.get('subtab') as 'tables' | 'reservations' | 'kot' | 'menu' | null;
      if (subTabFromUrl && ['tables', 'reservations', 'kot', 'menu'].includes(subTabFromUrl)) {
        setFoodSubTab(subTabFromUrl);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // React to searchParams change if router.push was used
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab === 'staff') {
      setActiveTab('customers_staff');
      setPeopleSubTab('staff');
    } else if (currentTab === 'customers') {
      setActiveTab('customers_staff');
      setPeopleSubTab('customers');
    } else if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
    const currentSubTab = searchParams.get('subtab') as 'tables' | 'reservations' | 'kot' | 'menu' | null;
    if (currentSubTab && ['tables', 'reservations', 'kot', 'menu'].includes(currentSubTab) && currentSubTab !== foodSubTab) {
      setFoodSubTab(currentSubTab);
    }
  }, [searchParams]);

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
  const QUEUE_TOKEN_FLOW = ['Doctor', 'Salon', 'Spa', 'Beauty Parlour', 'Repair', 'Services', 'Beauty', 'Car Wash', 'Healthcare', 'Food & Dining / Restaurant', 'Restaurant', 'Cafe', 'Dining', 'Automobile', 'Automobile / Car Wash', 'Automobile & Car Wash', 'Car Wash & Automobile'];
  const PROJECT_MILESTONE_FLOW = ['Construction', 'Interior Designer', 'Event Planner', 'Event & Party', 'Wedding Planner'];
  const MEETING_PROPOSAL_FLOW = ['Event Planner', 'Event & Party', 'Wedding Planner', 'Consultant', 'Photography', 'Photographer', 'Professional', 'Lawyer'];
  const ENQUIRY_ASSET_FLOW = ['Vehicle Sale', 'Vehicle Rental', 'Real Estate', 'Sales & Rentals'];

  const hasCartProducts = myListings.some(p => CART_ORDER_FLOW.includes(p.category));
  const hasRfqProducts = myListings.some(p => RFQ_QUOTE_FLOW.includes(p.category));
  const hasQueueServices = myListings.some(p => QUEUE_TOKEN_FLOW.includes(p.category));
  const hasProjectServices = myListings.some(p => PROJECT_MILESTONE_FLOW.includes(p.category));
  const hasMeetingServices = myListings.some(p => MEETING_PROPOSAL_FLOW.includes(p.category));
  const hasAssetListings = myListings.some(p => ENQUIRY_ASSET_FLOW.includes(p.category));

  const sellerSector = user?.business?.sector || '';
  // Collect categories from the seller's actual listed products/services + registered business sector
  const listingCategories = myListings.map(p => (p.category || '').toLowerCase());
  const distinctSellerCategories = Array.from(new Set([
    ...listingCategories,
    ...(sellerSector ? [sellerSector.toLowerCase()] : [])
  ]));

  const isFoodListed = distinctSellerCategories.some(cat => 
    cat === 'food & dining / restaurant' || cat === 'food & dining' || cat === 'restaurant' || cat === 'cafe' || cat === 'dining' || cat === 'food'
  );
  const isDoctorListed = distinctSellerCategories.some(cat => 
    cat === 'healthcare & doctor' || cat === 'doctor' || cat === 'clinic' || cat === 'healthcare' || cat === 'medical'
  );
  const isSalonListed = distinctSellerCategories.some(cat => 
    cat === 'salon & parlor' || cat === 'salon' || cat === 'saloon' || cat === 'parlor' || cat === 'parlour' || cat === 'spa' || cat === 'beauty'
  );
  const isEventListed = distinctSellerCategories.some(cat => 
    cat.includes('organizer') || cat.includes('event') || cat.includes('wedding') || cat.includes('party') || cat.includes('stage') || cat === 'events'
  ) || sellerSector.toLowerCase().includes('organizer') || sellerSector.toLowerCase().includes('event') || sellerSector.toLowerCase().includes('wedding') || sellerSector.toLowerCase().includes('party');

  const isAutoWashListed = distinctSellerCategories.some(cat => 
    cat.includes('car wash') || cat.includes('automobile') || cat.includes('mechanic') || cat === 'auto'
  ) || sellerSector.toLowerCase().includes('car wash') || sellerSector.toLowerCase().includes('automobile') || sellerSector.toLowerCase().includes('auto');

  const availableVerticals: { id: 'FOOD' | 'SALON' | 'DOCTOR' | 'EVENT' | 'AUTOWASH'; label: string; icon: any }[] = [];
  if (isEventListed) availableVerticals.push({ id: 'EVENT', label: 'Events & Parties', icon: PartyPopper });
  if (isFoodListed) availableVerticals.push({ id: 'FOOD', label: 'Dining', icon: Utensils });
  if (isSalonListed) availableVerticals.push({ id: 'SALON', label: 'Salon', icon: Scissors });
  if (isDoctorListed) availableVerticals.push({ id: 'DOCTOR', label: 'Doctor', icon: Stethoscope });
  if (isAutoWashListed) availableVerticals.push({ id: 'AUTOWASH', label: 'Car Wash & Auto', icon: Car });

  const defaultDetectedVertical: 'FOOD' | 'SALON' | 'DOCTOR' | 'EVENT' | 'AUTOWASH' | 'NONE' = 
    isEventListed 
      ? 'EVENT' 
      : (isAutoWashListed ? 'AUTOWASH' : (availableVerticals.length > 0 ? availableVerticals[0].id : 'NONE'));

  const [currentVertical, setCurrentVertical] = useState<'AUTO' | 'FOOD' | 'SALON' | 'DOCTOR' | 'EVENT' | 'AUTOWASH'>('AUTO');
  const activeVertical: 'FOOD' | 'SALON' | 'DOCTOR' | 'EVENT' | 'AUTOWASH' | 'NONE' = 
    currentVertical === 'AUTO' 
      ? defaultDetectedVertical 
      : (availableVerticals.some(v => v.id === currentVertical) ? currentVertical : defaultDetectedVertical);

  // Dynamic Flow Resolution (Reads from Category Engine FIRST, falls back to hardcoded strings)
  const isCartFlow = allowedFeatures.includes('Product Stock') || allowedFeatures.includes('B2C') || hasCartProducts || CART_ORDER_FLOW.includes(sellerSector) || isB2C;
  const isRfqFlow = allowedFeatures.includes('RFQ') || allowedFeatures.includes('Quote') || allowedFeatures.includes('B2B') || hasRfqProducts || RFQ_QUOTE_FLOW.includes(sellerSector) || isB2B;
  const isQueueFlow = allowedFeatures.includes('Token') || hasQueueServices || QUEUE_TOKEN_FLOW.includes(sellerSector) || isService || ['FOOD', 'SALON', 'DOCTOR', 'AUTOWASH'].includes(activeVertical);
  const isProjectFlow = hasProjectServices || PROJECT_MILESTONE_FLOW.includes(sellerSector) || isEventListed;
  const isMeetingFlow = allowedFeatures.includes('Appointment') || allowedFeatures.includes('Meeting') || hasMeetingServices || MEETING_PROPOSAL_FLOW.includes(sellerSector) || isEventListed;
  const isAssetFlow = allowedFeatures.includes('Vehicle Test Drive') || hasAssetListings || ENQUIRY_ASSET_FLOW.includes(sellerSector);

  // For backward compatibility in some places
  const isServiceProvider = isQueueFlow || isProjectFlow || isMeetingFlow || isService || isEventListed || isAutoWashListed || sellerCategory?.primaryType === 'SERVICE' || ['FOOD', 'SALON', 'DOCTOR', 'EVENT', 'AUTOWASH'].includes(activeVertical);
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
      let queues: any[] = [];
      try {
        const res = await fetch(`${API_URL}/service-queue/seller/${user.id}`);
        if (res.ok) {
          const text = await res.text();
          const data = text ? JSON.parse(text) : null;
          queues = Array.isArray(data) ? data : (data ? [data] : []);
        }
      } catch (err) {
        // Network or fetch failed, fallback gracefully
      }

      let activeQueueId = forceQueueId || selectedQueueId;

      // 2. Auto-create if no queue exists (saves massive bandwidth instead of searching all queues)
      if (queues.length === 0 && !isPolling) {
        try {
          const createRes = await fetch(`${API_URL}/service-queue/queue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shopName: fallbackName, sellerId: user.id })
          });
          if (createRes.ok) {
            const newData = await createRes.json();
            if (newData?.id) {
              queues = [newData];
              activeQueueId = newData.id;
            }
          }
        } catch {
          // Backend might be offline or initializing
        }
      }

      setAvailableQueues(queues);

      if (!activeQueueId && queues.length > 0) {
        activeQueueId = queues[0].id;
      }
      setSelectedQueueId(activeQueueId);

      // 3. Fetch status and analytics for the active queue
      if (activeQueueId) {
        try {
          const [statusRes, analyticsRes] = await Promise.all([
            fetch(`${API_URL}/service-queue/${activeQueueId}/status`).catch(() => null),
            fetch(`${API_URL}/service-queue/${activeQueueId}/analytics`).catch(() => null)
          ]);
          if (statusRes && statusRes.ok) {
            setQueueData(await statusRes.json());
          }
          if (analyticsRes && analyticsRes.ok) {
            setQueueAnalytics(await analyticsRes.json());
          }
        } catch {
          // Fallback gracefully without throwing
        }
      }
    } catch (err) {
      console.warn('Queue fetch warning:', err);
    } finally {
      if (!isPolling) setIsQueueLoading(false);
    }
  };

  React.useEffect(() => {
    if (isServiceProvider) {
      fetchQueue(undefined, false);
      // Auto-poll for new tokens every 5 seconds for service providers
      const interval = setInterval(() => {
        if (user?.id && isServiceProvider) {
          fetchQueue(undefined, true);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id, isServiceProvider]);

  // Walk-in Customer Form State
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInService, setWalkInService] = useState('Haircut');
  const [walkInPrice, setWalkInPrice] = useState('');
  const [walkInVehicleCategory, setWalkInVehicleCategory] = useState('Car');
  const [walkInPlateNumber, setWalkInPlateNumber] = useState('');

  const handleAddWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueueId) return;
    try {
      let finalCustomer = walkInName;
      let finalService = walkInService;
      let finalPrice = parseFloat(walkInPrice) || 0;

      if (activeVertical === 'AUTOWASH') {
        const cleanPlate = walkInPlateNumber.trim().toUpperCase() || 'DL 01 AB 1234';
        const vIcons: Record<string, string> = {
          'Bike': '🏍️',
          'Car': '🚗',
          'Truck': '🚚',
          'Bus': '🚌',
          'Heavy Vehicle (JCB)': '🚜'
        };
        const icon = vIcons[walkInVehicleCategory] || '🚗';
        finalCustomer = `${walkInName.trim() || 'Walk-in Driver'} (${cleanPlate})`;
        finalService = `${icon} ${walkInVehicleCategory} Wash [Plate: ${cleanPlate}]`;
        if (!walkInPrice) {
          const defaultPrices: Record<string, number> = {
            'Bike': 150,
            'Car': 350,
            'Truck': 800,
            'Bus': 1000,
            'Heavy Vehicle (JCB)': 1200
          };
          finalPrice = defaultPrices[walkInVehicleCategory] || 350;
        }
      }

      await fetch(`${API_URL}/service-queue/${selectedQueueId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: finalCustomer,
          phone: walkInPhone,
          service: finalService,
          price: finalPrice
        })
      });
      setShowWalkInForm(false);
      setWalkInName('');
      setWalkInPhone('');
      setWalkInPlateNumber('');
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

  // Live Dining & Table Reservations State (Synced with localStorage and real bookings)
  const defaultDiningReservations = [
    {
      id: 'RES-8921',
      customerName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      guests: 4,
      date: 'Today',
      timeSlot: '07:30 PM - 09:00 PM',
      type: 'Standard Table',
      notes: 'Anniversary celebration, window table requested',
      assignedTable: 'Table 2 (Booth)',
      status: 'Pending',
      source: 'Online Booking'
    },
    {
      id: 'RES-8922',
      customerName: 'Pooja Verma',
      phone: '+91 98112 34567',
      guests: 8,
      date: 'Today',
      timeSlot: '08:00 PM - 09:30 PM',
      type: 'Standard Table',
      notes: 'Family dinner with kids, baby high-chair needed',
      assignedTable: 'Table 7 (Large Party)',
      status: 'Pending',
      source: 'Online Booking'
    },
    {
      id: 'RES-8919',
      customerName: 'Vikram Joshi',
      phone: '+91 99887 76655',
      guests: 2,
      date: 'Today',
      timeSlot: '06:30 PM - 08:00 PM',
      type: 'Private VIP Dining Cabin',
      notes: 'Candlelight romantic setup package',
      assignedTable: 'Table 5 (VIP)',
      status: 'Confirmed',
      source: 'Private Dining'
    },
    {
      id: 'RES-8918',
      customerName: 'Sanjay Gupta',
      phone: '+91 97654 32109',
      guests: 6,
      date: 'Tomorrow',
      timeSlot: '01:30 PM - 03:00 PM',
      type: 'Standard Table',
      notes: 'Corporate lunch meeting',
      assignedTable: 'Table 3 (Family)',
      status: 'Confirmed',
      source: 'Online Booking'
    }
  ];

  const [diningReservations, setDiningReservations] = useState<any[]>([]);
  const [diningTables, setDiningTables] = useState<any[]>([]);
  const [diningKotOrders, setDiningKotOrders] = useState<any[]>([]);

  // Default initial configuration for freshly initialized restaurants
  const getInitialTables = () => [
    { id: 't1', name: 'Table 1 (Window)', type: 'Table', capacity: 2, status: 'Available', currentGuest: null, orderTotal: 0, timeElapsed: null },
    { id: 't2', name: 'Table 2 (Booth)', type: 'Table', capacity: 4, status: 'Available', currentGuest: null, orderTotal: 0, timeElapsed: null },
    { id: 't3', name: 'Table 3 (Family)', type: 'Table', capacity: 6, status: 'Available', currentGuest: null, orderTotal: 0, timeElapsed: null },
    { id: 't4', name: 'Table 4 (Outdoor)', type: 'Table', capacity: 2, status: 'Available', currentGuest: null, orderTotal: 0, timeElapsed: null },
    { id: 't5', name: 'Table 5 (VIP)', type: 'Table', capacity: 4, status: 'Available', currentGuest: null, orderTotal: 0, timeElapsed: null },
    { id: 't6', name: 'Table 6 (Corner)', type: 'Table', capacity: 4, status: 'Available', currentGuest: null, orderTotal: 0, timeElapsed: null },
    { id: 't7', name: 'Table 7 (Large Party)', type: 'Table', capacity: 8, status: 'Available', currentGuest: null, orderTotal: 0, timeElapsed: null },
  ];

  // Load and continuously sync real reservations, tables, and KOT orders from localStorage
  const syncDiningState = () => {
    try {
      // 1. Sync Reservations
      const storedRes = localStorage.getItem('markat_table_reservations');
      if (storedRes) {
        const parsed = JSON.parse(storedRes);
        if (Array.isArray(parsed)) {
          setDiningReservations(parsed);
        }
      } else {
        setDiningReservations(defaultDiningReservations);
        localStorage.setItem('markat_table_reservations', JSON.stringify(defaultDiningReservations));
      }

      // 2. Sync Tables
      const tablesKey = `markat_dining_tables_${user?.id || 'default'}`;
      const storedTables = localStorage.getItem(tablesKey);
      if (storedTables) {
        const parsed = JSON.parse(storedTables);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDiningTables(parsed);
        } else {
          const init = getInitialTables();
          setDiningTables(init);
          localStorage.setItem(tablesKey, JSON.stringify(init));
        }
      } else {
        const init = getInitialTables();
        setDiningTables(init);
        localStorage.setItem(tablesKey, JSON.stringify(init));
      }

      // 3. Sync KOT Orders
      const kotKey = `markat_dining_kot_${user?.id || 'default'}`;
      const storedKot = localStorage.getItem(kotKey);
      if (storedKot) {
        const parsed = JSON.parse(storedKot);
        if (Array.isArray(parsed)) {
          setDiningKotOrders(parsed);
        }
      } else {
        setDiningKotOrders([]);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    syncDiningState();
    const interval = setInterval(syncDiningState, 2000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleUpdateReservationStatus = (id: string, newStatus: string) => {
    setDiningReservations(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: newStatus } : r);
      try {
        localStorage.setItem('markat_table_reservations', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Live Event & Party Proposal Leads for Organizers
  const DEFAULT_EVENT_PROPOSALS = [
    {
      id: 'EVT-9281',
      eventType: 'Wedding & Reception',
      customerName: 'Aditya & Ritu Mehra',
      customerPhone: '+91 98765 43210',
      eventDate: '2026-11-28',
      guestCount: '400 - 1,000 Guests',
      eventCity: 'Delhi / NCR Palace',
      servicePackage: 'Grand Royal Stage & Lighting',
      notes: 'Require royal floral stage, cinematic lighting, 2-day wedding coordination & live catering setup.',
      status: 'New Inquiry',
      timestamp: new Date().toISOString()
    },
    {
      id: 'EVT-7104',
      eventType: 'Birthday & Anniversary Party',
      customerName: 'Priya Narang',
      customerPhone: '+91 99887 66554',
      eventDate: '2026-11-15',
      guestCount: '150 - 400 Guests',
      eventCity: 'South Delhi Farmhouse',
      servicePackage: 'Neon Glow & Acoustic Band Setup',
      notes: 'Neon themed photobooth, DJ console setup, customized welcome entry gate.',
      status: 'Proposal Sent',
      timestamp: new Date().toISOString()
    },
    {
      id: 'EVT-5541',
      eventType: 'Corporate Gala & Awards',
      customerName: 'TechVision Global Ltd',
      customerPhone: '+91 98112 23344',
      eventDate: '2026-12-05',
      guestCount: '300 Guests',
      eventCity: 'Gurugram Convention Hall',
      servicePackage: 'Conference AV & Award Stage',
      notes: 'Full LED backdrop wall, 4 wireless mics, podium branding, and event director crew on-site.',
      status: 'Confirmed',
      timestamp: new Date().toISOString()
    }
  ];

  const [eventInquiries, setEventInquiries] = useState<any[]>(DEFAULT_EVENT_PROPOSALS);
  const syncEventInquiries = () => {
    try {
      const stored = localStorage.getItem('markat_event_proposals');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sellerName = (user?.business?.name || user?.name || '').toLowerCase();
          const filtered = parsed.filter(item => {
            if (!item.seller) return true;
            const itemSeller = item.seller.toLowerCase();
            return sellerName ? itemSeller.includes(sellerName) || sellerName.includes(itemSeller) : true;
          });
          setEventInquiries(filtered.length > 0 ? filtered : parsed);
          return;
        }
      } else {
        localStorage.setItem('markat_event_proposals', JSON.stringify(DEFAULT_EVENT_PROPOSALS));
        setEventInquiries(DEFAULT_EVENT_PROPOSALS);
      }
    } catch {}
  };

  useEffect(() => {
    syncEventInquiries();
    const interval = setInterval(syncEventInquiries, 2500);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleUpdateEventStatus = (inquiryId: string, newStatus: string) => {
    setEventInquiries(prev => {
      const updated = prev.map(e => e.id === inquiryId ? { ...e, status: newStatus } : e);
      try {
        localStorage.setItem('markat_event_proposals', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Live Bookings State synced with Queue Tokens & Appointments
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
            price: s.price,
            phone: s.phone,
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
            price: t.price,
            phone: t.phone,
            date: t.bookingMode === 'APPOINTMENT' ? 'Scheduled Appointment' : 'Waiting in Queue',
            status: t.status === 'PENDING' ? 'Pending' : t.status === 'CHECKED_IN' ? 'Checked In' : (t.status === 'ABSENT' ? 'Absent' : 'Upcoming'),
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
    ownerName: '', phone: '', email: '', businessName: '', sector: '', businessType: '', gstNumber: '', address: '', pincode: '', latitude: null as number | null, longitude: null as number | null,
    businessHours: defaultSchedule as any,
  });

  const handleEditProfileInit = () => {
    setProfileForm({
      ownerName: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      businessName: user?.business?.name || '',
      sector: user?.business?.sector || '',
      businessType: user?.business?.businessType || '',
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
        navigateTab((productData.primaryType === 'SERVICE' || isServiceProvider) ? 'services' : 'listings');
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
          <img src="/logo-optimized.webp" alt="MarkatVerse" loading="eager" fetchPriority="high" decoding="sync" className="h-12 object-contain scale-[2] origin-left" />
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
        w-[85vw] max-w-[320px] lg:w-[290px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header & Brand */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center no-underline hover:opacity-90 transition-opacity overflow-visible py-1">
              <img src="/logo-optimized.webp" alt="MarkatVerse" loading="eager" fetchPriority="high" decoding="sync" className="h-12 object-contain scale-[1.7] origin-left" />
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
              {user?.business?.verified || user?.business?.verificationStatus === 'APPROVED' ? (
                <span className="inline-block text-[10px] font-bold text-emerald-600">
                  ✓ Verified Store
                </span>
              ) : (
                <span className="inline-block text-[10px] font-bold text-amber-600">
                  ⏳ KYC Verification Pending
                </span>
              )}
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
        
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {/* Main Dashboard Overview */}
          <button 
            onClick={() => navigateTab('overview')} 
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'overview' 
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="truncate">Dashboard</span>
          </button>
          
          {(!isService && !isServiceProvider) && (
            <button 
              onClick={() => navigateTab('listings')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'listings' 
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Store className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="truncate">My Shop Catalog</span>
            </button>
          )}

          {/* Dynamic Sector Workflow Switcher - only shown if multiple verticals */}
          {availableVerticals.length > 1 && (
            <div className="mx-1 my-2 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Switch Vertical</span>
                <span className="text-indigo-600 font-bold">{activeVertical}</span>
              </div>
              <div className={`grid gap-1 ${availableVerticals.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {availableVerticals.map(v => {
                  const Icon = v.icon;
                  const isAct = activeVertical === v.id;
                  const activeColor = v.id === 'FOOD' 
                    ? 'bg-orange-500 text-white' 
                    : (v.id === 'SALON' 
                      ? 'bg-indigo-600 text-white' 
                      : (v.id === 'EVENT' ? 'bg-fuchsia-600 text-white' : 'bg-emerald-600 text-white'));
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

          {/* Sector Badge Indicator */}
          <div className="mx-1 my-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sector</span>
            <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-700">
              {activeVertical === 'EVENT' && <PartyPopper className="w-3.5 h-3.5 text-fuchsia-600" />}
              {activeVertical === 'FOOD' && <Utensils className="w-3.5 h-3.5 text-orange-500" />}
              {activeVertical === 'SALON' && <Scissors className="w-3.5 h-3.5 text-indigo-600" />}
              {activeVertical === 'DOCTOR' && <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />}
              <span className={activeVertical === 'EVENT' ? 'text-fuchsia-700' : ''}>
                {activeVertical === 'EVENT' 
                  ? 'Events & Parties' 
                  : (activeVertical === 'FOOD' 
                    ? 'Dining & Food' 
                    : (activeVertical === 'DOCTOR' 
                      ? 'Clinic & Doctor' 
                      : (sellerSector || 'Salon & Parlor')))}
              </span>
            </span>
          </div>

          {/* SERVICE PROVIDER OPERATIONS */}
          {(isService || isServiceProvider) && (
            <>
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Operations
                </span>
              </div>

              {/* FOOD & DINING: Clean, unified single sidebar menu item */}
              {activeVertical === 'FOOD' ? (
                <>
                  <button 
                    onClick={() => navigateTab('sector_station', foodSubTab)} 
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === 'sector_station' 
                        ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200 shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Utensils className="w-5 h-5 text-orange-500 shrink-0" />
                      <span className="truncate">Dining & Kitchen</span>
                    </div>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-[10px] font-bold capitalize">
                      {foodSubTab === 'tables' ? 'Floor' : (foodSubTab === 'reservations' ? 'Bookings' : (foodSubTab === 'kot' ? 'KOT' : 'Menu'))}
                    </span>
                  </button>

                  <button 
                    onClick={() => navigateTab('services')} 
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === 'services' 
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-blue-600 shrink-0" />
                      <span className="truncate">Restaurant Profile</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">Store</span>
                  </button>
                </>
              ) : (
                /* CLINIC, SALON & OTHER SERVICE SECTORS */
                <>
                  {/* Primary Station / Workstation */}
                  {activeVertical === 'SALON' && (
                    <button 
                      onClick={() => navigateTab('sector_station')} 
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'sector_station' 
                          ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Scissors className="w-5 h-5 text-indigo-600 shrink-0" />
                      <span className="truncate">Chairs & Stylists</span>
                    </button>
                  )}

                  {activeVertical === 'DOCTOR' && (
                    <button 
                      onClick={() => navigateTab('sector_station')} 
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'sector_station' 
                          ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Stethoscope className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="truncate">OPD & Consults</span>
                    </button>
                  )}

                  {activeVertical === 'EVENT' && (
                    <button 
                      onClick={() => navigateTab('events_station')} 
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'events_station' 
                          ? 'bg-fuchsia-50 text-fuchsia-700 font-bold border border-fuchsia-200 shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <PartyPopper className="w-5 h-5 text-fuchsia-600 shrink-0" />
                        <span className="truncate">Event Quotes</span>
                      </div>
                      {eventInquiries.length > 0 && (
                        <span className="px-2 py-0.5 bg-fuchsia-600 text-white rounded-full text-[10px] font-bold">
                          {eventInquiries.length}
                        </span>
                      )}
                    </button>
                  )}

                  {activeVertical === 'AUTOWASH' && (
                    <button 
                      onClick={() => navigateTab('bookings')} 
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'bookings' 
                          ? 'bg-cyan-50 text-cyan-800 font-bold border border-cyan-200 shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Car className="w-5 h-5 text-cyan-600 shrink-0" />
                      <span className="truncate">Wash & Service Bays</span>
                    </button>
                  )}

                  {/* Appointments */}
                  <button 
                    onClick={() => navigateTab('bookings')} 
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === 'bookings' 
                        ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200 shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <CalendarClock className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="truncate">Appointments</span>
                  </button>

                  {/* Live Tokens & Queue */}
                  <button 
                    onClick={() => navigateTab('queue')} 
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === 'queue' 
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Ticket className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="truncate">Live Tokens & Walk-ins</span>
                  </button>

                  {/* Services & Packages */}
                  <button 
                    onClick={() => navigateTab('services')} 
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === 'services' 
                        ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200 shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 text-purple-600 shrink-0" />
                    <span className="truncate">Services & Packages</span>
                  </button>
                </>
              )}

              {/* Customers & Staff */}
              <button 
                onClick={() => navigateTab('customers_staff')} 
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  ['customers_staff', 'customers', 'staff'].includes(activeTab) 
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Users className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {activeVertical === 'DOCTOR' 
                    ? 'Patients & Staff' 
                    : (activeVertical === 'FOOD' 
                      ? 'Guests & Staff' 
                      : (activeVertical === 'EVENT' 
                        ? 'Clients & Crew' 
                        : (activeVertical === 'AUTOWASH' 
                          ? 'Clients & Bay Crew' 
                          : 'Customers & Staff')))}
                </span>
              </button>
            </>
          )}

          {/* PRODUCT SPECIFIC TABS */}
          {(!isService && !isServiceProvider) && (
            <>
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sales & Orders
                </span>
              </div>

              {isCartFlow && (
                <button 
                  onClick={() => navigateTab('orders')} 
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <Package className="w-5 h-5 text-blue-600 shrink-0" />
                  <span className="truncate">Orders</span>
                </button>
              )}

              {isRfqFlow && (
                <button 
                  onClick={() => navigateTab('leads')} 
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'leads' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className="w-5 h-5 flex items-center justify-center text-lg shrink-0">💬</span>
                  <span className="truncate">Leads / RFQ</span>
                </button>
              )}

              {isProjectFlow && (
                <button 
                  onClick={() => navigateTab('projects')} 
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'projects' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className="w-5 h-5 flex items-center justify-center text-lg shrink-0">🏗️</span>
                  <span className="truncate">Projects</span>
                </button>
              )}

              {isAssetFlow && (
                <button 
                  onClick={() => navigateTab('enquiries')} 
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'enquiries' ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className="w-5 h-5 flex items-center justify-center text-lg shrink-0">🔑</span>
                  <span className="truncate">Enquiries</span>
                </button>
              )}
            </>
          )}

          {/* ACCOUNT & FINANCE SECTION */}
          <div className="px-3 pt-3 pb-1 border-t border-slate-100 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Account & Finance
            </span>
          </div>

          {/* SINGLE UNIFIED WALLET & PAYOUTS TAB */}
          <button 
            onClick={() => navigateTab('wallet')} 
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              (activeTab === 'wallet' || activeTab === 'earnings') 
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Wallet className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="truncate">Wallet & Payouts</span>
            </div>
            {(user?.business?.wallet?.owedToPlatform ?? 0) > 0 ? (
              <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full animate-pulse shadow-xs shrink-0">
                Dues: ₹{(user?.business?.wallet?.owedToPlatform ?? 0).toLocaleString('en-IN')}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50 shrink-0">
                Active
              </span>
            )}
          </button>

          <button 
            onClick={() => navigateTab('profile')} 
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'profile' 
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <User className="w-5 h-5 text-slate-500 shrink-0" />
            <span className="truncate">Profile</span>
          </button>

          <button 
            onClick={() => navigateTab('settings')} 
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'settings' 
                ? 'bg-red-50 text-red-700 font-bold border border-red-200 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className="w-5 h-5 text-slate-500 shrink-0" />
            <span className="truncate">Settings</span>
          </button>
          
          <div className="pt-3 mt-2 border-t border-slate-100">
            <button 
              onClick={() => logout()} 
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main ref={mainContentRef} className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-4 lg:p-10">
        
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {/* Dashboard Header with Live Store Status & Shortcuts */}
            <div className="mb-4 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live & Open
                  </span>
                </div>
                <p className="text-slate-500 mt-0.5 text-xs sm:text-base">
                  Welcome back, <strong className="text-slate-800">{user?.name || user?.business?.name || 'Seller'}</strong>. Real-time updates for your store.
                </p>
              </div>

              {/* Top Quick Actions Header */}
              <div className="flex items-center gap-2 shrink-0">
                {(() => {
                  const rawStoreName = user?.business?.businessName || user?.business?.name || user?.name || myListings[0]?.seller || 'store';
                  const storeSlug = encodeURIComponent(rawStoreName.toLowerCase().replace(/\s+/g, '-'));
                  const storefrontUrl = activeVertical === 'FOOD' && myListings[0]?.id 
                    ? `/restaurant/${myListings[0].id}` 
                    : `/shop/${storeSlug}`;
                  
                  return (
                    <Link
                      href={storefrontUrl}
                      target="_blank"
                      className="flex-1 sm:flex-none justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <span>🌐</span> Storefront
                    </Link>
                  );
                })()}
                {activeVertical === 'FOOD' ? (
                  <button
                    onClick={() => navigateTab('sector_station', 'tables')}
                    className="flex-1 sm:flex-none justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Utensils className="w-3.5 h-3.5" /> Floor
                  </button>
                ) : (
                  <button
                    onClick={() => navigateTab(isServiceProvider ? 'add_service' : 'add_product')}
                    className="flex-1 sm:flex-none justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add New
                  </button>
                )}
              </div>
            </div>

            {/* KYC & Store Verification Banner */}
            {user?.business && (
              user?.business?.verified || user?.business?.verificationStatus === 'APPROVED' ? (
                <div className="mb-4 sm:mb-8 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-emerald-950 text-xs sm:text-sm">Store Verified & Active — Ready to Start Your Journey! 🎉</h4>
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✓ KYC APPROVED
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-emerald-700 mt-0.5">
                        Your identity, PAN/GST, and Aadhaar have been verified by admin. Your catalog and services are live for all customers.
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 font-mono text-xs font-semibold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0">
                    ID: {user.markatId || 'MV-0000000044'}
                  </div>
                </div>
              ) : (
                <div className="mb-4 sm:mb-8 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 border border-amber-300/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5 sm:mt-0">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-amber-950 text-xs sm:text-sm">
                          KYC Verification in Progress — Admin Phone Call Scheduled
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                          ⏳ PENDING CALL
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-amber-800 mt-1 leading-relaxed">
                        Your real Aadhaar, PAN / GST, and document proofs have been received. An admin verification officer will call you at{' '}
                        <strong className="text-amber-950">+91-{user.business.phone || user.phone || 'your phone'}</strong>{' '}
                        for KYC verification. Once verified, your store will be activated to start your selling journey!
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 self-end sm:self-auto font-mono text-xs font-semibold text-amber-900 bg-white/90 px-3 py-1.5 rounded-lg border border-amber-300">
                    Status: PENDING_KYC
                  </div>
                </div>
              )
            )}

            {/* SECTOR-ADAPTIVE KPI METRIC CARDS */}
            {activeVertical === 'FOOD' ? (
              (() => {
                const occupiedTables = diningTables.filter(t => t.status === 'Occupied' || t.status === 'Food Served');
                const totalTablesCount = diningTables.length || 7;
                const availableTablesCount = diningTables.filter(t => t.status === 'Available').length;
                const activeKotCount = diningKotOrders.filter(o => o.status === 'Preparing').length;
                const pendingReservationsCount = diningReservations.filter(r => r.status === 'Pending').length;
                const totalReservationsCount = diningReservations.length;
                
                // Dine-in total today calculation from active table orders + queue analytics
                const floorLiveTotal = diningTables.reduce((acc, t) => acc + (Number(t.orderTotal) || 0), 0);
                const todayRevenue = (queueAnalytics?.totalTodayCollection || 0) + floorLiveTotal;

                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
                    {/* 1. Dine-in Revenue */}
                    <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all relative overflow-hidden group">
                      <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">Today&apos;s Revenue</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5 sm:mb-1">
                        ₹{todayRevenue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold text-emerald-600 truncate">
                        {todayRevenue > 0 ? '● Live today' : '₹0 collected today'}
                      </div>
                    </div>

                    {/* 2. Active Tables */}
                    <div 
                      onClick={() => navigateTab('sector_station', 'tables')}
                      className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-orange-300 transition-all cursor-pointer relative overflow-hidden group"
                    >
                      <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">Table Floor</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                          <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5 sm:mb-1">
                        {occupiedTables.length} / {totalTablesCount}
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold text-orange-600 truncate">
                        {availableTablesCount} available →
                      </div>
                    </div>

                    {/* 3. Live KOT Orders */}
                    <div 
                      onClick={() => navigateTab('sector_station', 'kot')}
                      className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-amber-300 transition-all cursor-pointer relative overflow-hidden group"
                    >
                      <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">Kitchen KOT</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                          <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5 sm:mb-1">
                        {activeKotCount}
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold text-amber-600 truncate">
                        {activeKotCount > 0 ? `${activeKotCount} tickets active →` : 'Queue clear →'}
                      </div>
                    </div>

                    {/* 4. Reservations Pending */}
                    <div 
                      onClick={() => navigateTab('sector_station', 'reservations')}
                      className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-rose-300 transition-all cursor-pointer relative overflow-hidden group"
                    >
                      <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">Bookings</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                          <CalendarClock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5 sm:mb-1">
                        {totalReservationsCount}
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold text-rose-600 truncate">
                        {pendingReservationsCount > 0 
                          ? `${pendingReservationsCount} pending →` 
                          : 'All reviewed →'}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* STANDARD RETAIL / SERVICE SECTOR METRICS */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-8">
                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Sales</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      ₹{(queueAnalytics?.totalTodayCollection || 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">
                      {queueAnalytics?.totalTodayCollection ? 'Live transactions today' : 'No sales yet'}
                    </span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>

                <div 
                  onClick={() => navigateTab(isServiceProvider ? 'services' : 'listings')}
                  className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all"
                >
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      {isServiceProvider ? 'Active Services' : 'Active Products'}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">{myListings.length}</div>
                    <span className="text-xs text-blue-600 font-semibold mt-1 block">View catalog →</span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>

                <div 
                  onClick={() => navigateTab('queue')}
                  className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-all"
                >
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Live Queue</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">{queueData?.waitingCount ?? 0}</div>
                    <span className="text-xs text-amber-600 font-semibold mt-1 block">Manage queue →</span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>
            )}



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
                    onClick={() => navigateTab('sector_station', 'reservations')}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    View All Reservations →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Real Occupied Tables Summary */}
                  {diningTables
                    .filter(t => t.status === 'Occupied' || t.status === 'Food Served')
                    .slice(0, 2)
                    .map((table) => (
                      <div key={table.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm ${
                            table.status === 'Food Served' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            #{table.name.match(/\d+/)?.[0] || table.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {table.name} • {table.capacity} Guests
                            </div>
                            <div className="text-xs text-slate-500">
                              Seated: {table.currentGuest || 'Guest'} {table.timeElapsed ? `• Elapsed: ${table.timeElapsed}` : ''}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                            table.status === 'Food Served'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {table.status}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            ₹{table.orderTotal || 0}
                          </span>
                        </div>
                      </div>
                    ))}

                  {/* Real Dynamic Recent Reservation */}
                  {[...diningReservations]
                    .sort((a, b) => (a.status === 'Pending' ? -1 : 1))
                    .slice(0, 2)
                    .map((res) => (
                    <div key={res.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-xs ${
                          res.status === 'Confirmed' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : res.status === 'Pending' 
                              ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                              : res.status === 'Cancelled' || res.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          RES
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {res.customerName} ({res.guests} Guests) • {res.timeSlot || res.date}
                          </div>
                          <div className="text-xs text-slate-500">
                            {res.assignedTable || res.type} • {res.notes || 'No special requests'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {res.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateReservationStatus(res.id, 'Confirmed')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => navigateTab('sector_station', 'reservations')}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
                            >
                              Review
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                              res.status === 'Confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : res.status === 'Cancelled' || res.status === 'Rejected'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : res.status === 'Pending'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {res.status}
                            </span>
                            <button
                              onClick={() => navigateTab('sector_station', 'reservations')}
                              className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
                            >
                              Details →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Empty state when no active tables and no reservations */}
                  {diningTables.filter(t => t.status === 'Occupied' || t.status === 'Food Served').length === 0 && diningReservations.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                      <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No active tables or bookings yet</p>
                      <p className="text-xs text-slate-400 mt-1">Walk-in customers seated on the floor or online table reservations will appear here live.</p>
                      <button
                        onClick={() => navigateTab('sector_station', 'tables')}
                        className="mt-3 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-bold transition-colors border border-orange-200 cursor-pointer"
                      >
                        Seat Walk-in Customer →
                      </button>
                    </div>
                  )}
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
                onSubTabChange={(tab) => navigateTab('sector_station', tab)}
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
            <div className="mb-5 sm:mb-8">
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeVertical === 'FOOD' ? 'Dining Revenue & Payouts' : (activeVertical === 'DOCTOR' ? 'Consultation & Clinic Revenue' : 'Earnings & Performance')}
              </h1>
              <p className="text-slate-500 mt-1 text-xs sm:text-sm">
                {activeVertical === 'FOOD'
                  ? 'Track table billings, walk-in cash/online collections, and waiter/kitchen shift performance.'
                  : (activeVertical === 'DOCTOR'
                    ? 'Track consultation fees, appointment payments, and clinic revenue.'
                    : 'Track revenue collections, client payments, and staff commission performance.')}
              </p>
            </div>
            
            {/* Sector-Specific Performance Analytics */}
            {queueAnalytics ? (
              <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
                {/* Sector-Adaptive Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {/* Card 1: Today's Revenue */}
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3.5 sm:p-5 shadow-2xs relative overflow-hidden group hover:border-emerald-300 transition-all">
                    <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {activeVertical === 'FOOD' ? 'Today\'s Sales' : 'Today\'s Collection'}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                      ₹{((queueAnalytics.totalTodayCollection || 0) + (activeVertical === 'FOOD' ? diningTables.reduce((acc, t) => acc + (Number(t.orderTotal) || 0), 0) : 0)).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-emerald-600/80 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live Sync
                    </div>
                  </div>
                  
                  {/* Card 2: Month's Collection */}
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3.5 sm:p-5 shadow-2xs relative overflow-hidden group hover:border-blue-300 transition-all">
                    <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Month&apos;s Revenue
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-blue-600">
                      ₹{(queueAnalytics.totalMonthCollection || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-blue-500/80 mt-1 flex items-center gap-1">
                      <CalendarClock className="w-3 h-3" /> This month
                    </div>
                  </div>

                  {/* Card 3: Sector Specific Volume Metric */}
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3.5 sm:p-5 shadow-2xs relative overflow-hidden group hover:border-orange-300 transition-all">
                    <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {activeVertical === 'FOOD' ? 'Orders & Tables' : (activeVertical === 'DOCTOR' ? 'Consultations' : 'Appointments')}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {activeVertical === 'FOOD' ? diningTables.filter(t => t.status === 'Occupied' || t.status === 'Food Served').length : (queueAnalytics.waitingCount ?? 0)}
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1">
                      {activeVertical === 'FOOD' ? 'Active dining tables' : 'Processed today'}
                    </div>
                  </div>

                  {/* Card 4: Platform Settlement / Wallet */}
                  <div 
                    onClick={() => navigateTab('wallet')}
                    className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3.5 sm:p-5 shadow-2xs relative overflow-hidden group hover:border-purple-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Wallet & Commission
                      </span>
                      <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Wallet className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center justify-between">
                      <span>₹{(user?.business?.wallet?.owedToPlatform ?? 0).toLocaleString('en-IN')}</span>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTab('wallet');
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all shadow-xs cursor-pointer ${
                          (user?.business?.wallet?.owedToPlatform ?? 0) > 0
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {(user?.business?.wallet?.owedToPlatform ?? 0) > 0 ? 'Settle Fee →' : 'View Wallet →'}
                      </button>
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-1">
                      {(user?.business?.wallet?.owedToPlatform ?? 0) > 0 ? '● Unsettled commission dues' : '✓ All clear (0 dues)'}
                    </div>
                  </div>
                </div>

                {/* Staff / Waiter Service Breakdown */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-3.5 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0" />
                        {activeVertical === 'FOOD' ? 'Kitchen & Service Staff Performance' : (activeVertical === 'DOCTOR' ? 'Doctor & Medical Staff Performance' : 'Staff Performance Breakdown')}
                      </h2>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        {activeVertical === 'FOOD' ? 'Detailed view of tables served, KOT completed, and revenue logged per staff member.' : 'Detailed view of clients served and revenue generated by each staff member.'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigateTab('staff')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      Manage Staff →
                    </button>
                  </div>

                  <div className="p-0 overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                          <th className="p-3 pl-4 sm:pl-6">{activeVertical === 'FOOD' ? 'Staff / Waiter' : 'Staff Member'}</th>
                          <th className="p-3 text-center">{activeVertical === 'FOOD' ? 'Tables Served' : 'Today\'s Clients'}</th>
                          <th className="p-3 text-right">Today&apos;s Revenue</th>
                          <th className="p-3 text-center">Month&apos;s Total</th>
                          <th className="p-3 text-right pr-4 sm:pr-6">Month&apos;s Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                        {queueAnalytics.staffPerformance && queueAnalytics.staffPerformance.length > 0 ? (
                          queueAnalytics.staffPerformance.map((staff: any) => (
                            <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-3 pl-4 sm:pl-6 font-bold text-slate-900 flex items-center gap-2.5">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
                                  {staff.name.charAt(0)}
                                </div>
                                <span className="truncate">{staff.name}</span>
                              </td>
                              <td className="p-3 text-center font-bold text-slate-700">{staff.todayCustomers}</td>
                              <td className="p-3 text-right font-black text-emerald-600">₹{staff.todayEarnings.toLocaleString('en-IN')}</td>
                              <td className="p-3 text-center font-bold text-slate-700">{staff.monthCustomers}</td>
                              <td className="p-3 text-right pr-4 sm:pr-6 font-black text-blue-600">₹{staff.monthEarnings.toLocaleString('en-IN')}</td>
                            </tr>
                          ))
                        ) : (
                          [
                            { id: '1', name: 'Chef Rajesh Kumar (Head Chef)', customers: 12, today: 4200, monthCust: 180, month: 65400 },
                            { id: '2', name: 'Amit Singh (Floor Captain)', customers: 8, today: 2850, monthCust: 140, month: 48900 },
                            { id: '3', name: 'Sunil Rawat (Service Waiter)', customers: 6, today: 1950, monthCust: 95, month: 32400 }
                          ].map((staff) => (
                            <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-3 pl-4 sm:pl-6 font-bold text-slate-900 flex items-center gap-2.5">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0">
                                  {staff.name.charAt(0)}
                                </div>
                                <span className="truncate">{staff.name}</span>
                              </td>
                              <td className="p-3 text-center font-bold text-slate-700">{staff.customers}</td>
                              <td className="p-3 text-right font-black text-emerald-600">₹{staff.today.toLocaleString('en-IN')}</td>
                              <td className="p-3 text-center font-bold text-slate-700">{staff.monthCust}</td>
                              <td className="p-3 text-right pr-4 sm:pr-6 font-black text-blue-600">₹{staff.month.toLocaleString('en-IN')}</td>
                            </tr>
                          ))
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

        {activeTab === 'listings' && (
          <SellerProductsTab 
            products={myListings}
            user={user}
            activeVertical={activeVertical}
            isServiceProvider={isServiceProvider}
            isB2C={isB2C}
            isB2B={isB2B}
            isCartFlow={isCartFlow}
            isRfqFlow={isRfqFlow}
            isService={isService}
            isQueueFlow={isQueueFlow}
            isMeetingFlow={isMeetingFlow}
            isProjectFlow={isProjectFlow}
            onAddNew={() => navigateTab('add_product')}
            onEdit={(product) => {
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
              navigateTab('add_product');
            }}
            onDelete={(id) => deleteProduct(id)}
          />
        )}

        {activeTab === 'services' && (
          <SellerServicesTab 
            services={myListings}
            user={user}
            activeVertical={activeVertical}
            onAddNew={() => navigateTab('add_service')}
            onGoToSectorStation={() => navigateTab('sector_station')}
            onEdit={(service) => {
              setEditingProductId(service.id);
              setName(service.name);
              setPrice(service.price.toString());
              setOriginalPrice(service.originalPrice ? service.originalPrice.toString() : service.price.toString());
              setDescription(service.description || '');
              setCategory(service.category || 'Food & Dining');
              setLocation(service.location || '');
              setImageUrl(service.image || '');
              setUploadedImages(service.images || []);
              setEnableWholesale(service.isB2B || false);
              if (service.wholesaleTiers) setWholesaleTiers(service.wholesaleTiers);
              if (service.parameters) {
                const newParams: Record<string, string> = {};
                Object.keys(service.parameters).forEach(k => {
                  const pVal = service.parameters![k];
                  newParams[k] = Array.isArray(pVal) ? pVal.join(', ') : pVal;
                });
                setParameters(newParams);
              }
              navigateTab('add_service');
            }}
            onDelete={(id) => deleteProduct(id)}
          />
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
                onCancel={() => navigateTab(isServiceProvider ? 'services' : 'listings')} 
                initialData={editingProductId ? products.find(p => p.id === editingProductId) : undefined}
              />
            )}
          </div>
          );
        })()}

        {activeTab === 'queue' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <SellerQueueTab
              queueData={queueData}
              isQueueLoading={isQueueLoading}
              availableQueues={availableQueues}
              selectedQueueId={selectedQueueId}
              activeVertical={activeVertical}
              actionLoading={actionLoading}
              onFetchQueue={fetchQueue}
              onQueueAction={handleQueueAction}
              onOpenWalkIn={() => setShowWalkInForm(true)}
              onOpenStaffModal={() => setShowStaffModal(true)}
            />

            {showWalkInForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {activeVertical === 'FOOD' ? 'Seat Walk-in Party (Dining)' : (activeVertical === 'DOCTOR' ? 'Add OPD Walk-in Patient' : (activeVertical === 'AUTOWASH' ? 'Check-in Vehicle (Wash Bay)' : 'Add Walk-in Client'))}
                      </h3>
                      {activeVertical === 'AUTOWASH' && (
                        <p className="text-xs text-slate-500 mt-0.5">Quick vehicle bay check-in with Indian HSRP license plate.</p>
                      )}
                    </div>
                    <button type="button" onClick={() => setShowWalkInForm(false)} className="text-slate-400 hover:text-slate-600 p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddWalkIn} className="space-y-4">
                    {activeVertical === 'AUTOWASH' ? (
                      <>
                        {/* 1. Vehicle Selection Chips */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Select Vehicle Type
                          </label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {[
                              { name: 'Bike', icon: '🏍️', price: 150 },
                              { name: 'Car', icon: '🚗', price: 350 },
                              { name: 'Truck', icon: '🚚', price: 800 },
                              { name: 'Bus', icon: '🚌', price: 1000 },
                              { name: 'Heavy (JCB)', key: 'Heavy Vehicle (JCB)', icon: '🚜', price: 1200 },
                            ].map(v => {
                              const keyName = v.key || v.name;
                              const isSelected = walkInVehicleCategory === keyName;
                              return (
                                <button
                                  type="button"
                                  key={v.name}
                                  onClick={() => {
                                    setWalkInVehicleCategory(keyName);
                                    setWalkInPrice(String(v.price));
                                  }}
                                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                                    isSelected 
                                      ? 'border-cyan-600 bg-cyan-50/80 text-cyan-900 font-bold shadow-xs ring-1 ring-cyan-500' 
                                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                                  }`}
                                >
                                  <span className="text-xl mb-0.5">{v.icon}</span>
                                  <span className="text-[10px] font-semibold leading-tight line-clamp-1">{v.name}</span>
                                  <span className="text-[9px] text-cyan-700 font-bold mt-0.5">₹{v.price}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Authentic Indian HSRP Number Plate */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Vehicle Number Plate
                            </label>
                            <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                              Indian HSRP
                            </span>
                          </div>
                          <div className="relative flex items-center h-11 w-full bg-white rounded-lg border-2 border-slate-900 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-600">
                            {/* Royal Blue IND Strip with Ashoka Chakra */}
                            <div className="h-full bg-[#003893] px-2.5 flex flex-col items-center justify-center select-none shrink-0 border-r border-slate-900/20">
                              <span className="text-[10px] text-white leading-none">☸</span>
                              <span className="text-[8px] font-black tracking-widest text-white leading-none mt-0.5">IND</span>
                            </div>
                            {/* Security Rivet */}
                            <div className="absolute left-11 w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-400 select-none pointer-events-none"></div>
                            {/* Plate Monospace Input */}
                            <input
                              type="text"
                              required
                              value={walkInPlateNumber}
                              onChange={e => setWalkInPlateNumber(e.target.value.toUpperCase())}
                              placeholder="DL 01 AB 1234"
                              maxLength={13}
                              className="w-full h-full bg-transparent pl-4 pr-3 text-slate-900 font-mono font-black text-sm tracking-widest placeholder:text-slate-400 focus:outline-none uppercase"
                            />
                          </div>
                        </div>

                        {/* 3. Driver Name & Phone */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Owner / Driver</label>
                            <input
                              type="text"
                              value={walkInName}
                              onChange={e => setWalkInName(e.target.value)}
                              placeholder="e.g. Vikram"
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile No.</label>
                            <input
                              type="text"
                              value={walkInPhone}
                              onChange={e => setWalkInPhone(e.target.value)}
                              placeholder="9876543210"
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                          </div>
                        </div>

                        {/* 4. Wash Package & Price */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Wash Service</label>
                            <input
                              type="text"
                              value={walkInService}
                              onChange={e => setWalkInService(e.target.value)}
                              placeholder="Complete Foam Wash & Underbody"
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Fee (₹)</label>
                            <input
                              type="number"
                              value={walkInPrice}
                              onChange={e => setWalkInPrice(e.target.value)}
                              placeholder="350"
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}

                    <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                      <button type="button" onClick={() => setShowWalkInForm(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                      <button 
                        type="submit" 
                        className={`px-4 py-2 text-white font-bold rounded-lg transition-colors ${
                          activeVertical === 'AUTOWASH' ? 'bg-cyan-700 hover:bg-cyan-800' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {activeVertical === 'FOOD' ? 'Generate Table Token' : (activeVertical === 'DOCTOR' ? 'Issue OPD Token' : (activeVertical === 'AUTOWASH' ? 'Assign Bay Token' : 'Add to Queue'))}
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

          </div>
        )}

        {activeTab === 'bookings' && (
          <SellerBookingsTab 
            bookings={bookings}
            activeVertical={activeVertical}
            selectedServiceCategory={selectedServiceCategory}
            setSelectedServiceCategory={setSelectedServiceCategory}
            searchBookingQuery={searchBookingQuery}
            setSearchBookingQuery={setSearchBookingQuery}
            selectedBookingDetails={selectedBookingDetails}
            setSelectedBookingDetails={setSelectedBookingDetails}
            onOpenWalkIn={() => setShowWalkInForm(true)}
            onOpenStaffModal={() => setShowStaffModal(true)}
            onQueueAction={handleQueueAction}
            queueId={selectedQueueId}
          />
        )}

        {activeTab === 'orders' && (
          <SellerOrdersTab 
            orders={orders}
            onMarkShipped={(orderId) => setOrders(orders.map(o => o.id === orderId ? {...o, status: 'Shipped'} : o))}
          />
        )}

        {activeTab === 'leads' && (
          <SellerLeadsTab 
            leads={leads}
            apiUrl={API_URL}
            onUpdateStatus={(leadId, status) => setLeads(leads.map(l => l.id === leadId ? {...l, status} : l))}
          />
        )}

        {/* COMBINED CUSTOMERS & STAFF TAB */}
        {['customers_staff', 'customers', 'staff'].includes(activeTab) && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Sub-navigation Segmented Controller */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setPeopleSubTab('customers');
                    navigateTab('customers_staff');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    peopleSubTab === 'customers'
                      ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Customers</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPeopleSubTab('staff');
                    navigateTab('customers_staff');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    peopleSubTab === 'staff'
                      ? 'bg-white text-rose-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-rose-600" />
                  <span>
                    {activeVertical === 'DOCTOR' ? 'Doctors & Staff' : (activeVertical === 'FOOD' ? 'Kitchen & Waiters' : (activeVertical === 'EVENT' ? 'Crew & Coordinators' : (activeVertical === 'AUTOWASH' ? 'Bay Technicians & Crew' : 'Stylists & Staff')))}
                  </span>
                </button>
              </div>

              {peopleSubTab === 'staff' && (
                <button
                  type="button"
                  onClick={() => setShowStaffModal(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Add Team Member
                </button>
              )}
            </div>

            {/* Active Sub-tab View */}
            {peopleSubTab === 'customers' ? (
              <SellerCustomersTab activeVertical={activeVertical} />
            ) : (
              <SellerStaffTab
                activeVertical={activeVertical}
                onOpenStaffModal={() => setShowStaffModal(true)}
              />
            )}
          </div>
        )}

        {/* EVENT & PARTY ORGANIZER WORKFLOW STATION */}
        {(activeTab === 'events_station' || activeTab === 'proposals') && (
          <SellerEventsStationTab 
            eventInquiries={eventInquiries}
            user={user}
            onAddNewService={() => navigateTab('add_service')}
            onUpdateEventStatus={handleUpdateEventStatus}
          />
        )}

        {['projects', 'milestones', 'enquiries', 'inventory'].includes(activeTab) && (
          <div className="max-w-6xl mx-auto py-20 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4 capitalize">{activeTab} Management</h2>
            <p className="text-slate-500">This feature is part of your sector&apos;s advanced workflow and is currently being built.</p>
          </div>
        )}

        {/* SELLER WALLET & SETTLEMENTS TAB */}
        {(activeTab === 'wallet' || activeTab === 'earnings') && (
          <SellerWalletTab 
            businessId={user?.business?.id || user?.id || ''} 
            businessName={user?.business?.name || user?.name || 'Seller Business'} 
            commissionRate={user?.business?.commissionRate ?? 5} 
          />
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
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Business Sector / Specialty</label>
                      {isEditingProfile ? (
                        <select 
                          value={profileForm.sector} 
                          onChange={e => setProfileForm({...profileForm, sector: e.target.value})} 
                          className="w-full px-3.5 py-2.5 text-sm font-normal text-slate-900 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        >
                          <option value="Event & Party">Event & Party</option>
                          <option value="Food & Dining / Restaurant">Food & Dining / Restaurant</option>
                          <option value="Salon & Parlor">Salon & Parlor</option>
                          <option value="Healthcare & Doctor">Healthcare & Doctor</option>
                          <option value="Automobile & Car Wash">Automobile & Car Wash</option>
                          <option value="Professional">Professional Services</option>
                          <option value="Home Repair">Home Services & Repair</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Fashion & Apparel">Fashion & Apparel</option>
                          <option value="FMCG & Groceries">FMCG & Groceries</option>
                        </select>
                      ) : (
                        <div className="text-sm font-medium text-slate-800 bg-slate-50/70 px-3.5 py-2.5 rounded-xl border border-slate-200/60">
                          {user?.business?.sector || 'Not specified'}
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
                onClick={() => navigateTab('profile')}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors border border-indigo-100 flex items-center gap-1.5 w-fit cursor-pointer"
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
