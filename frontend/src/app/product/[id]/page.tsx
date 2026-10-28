"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { useProducts, useCategoryRules, Product } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useUserTrends } from '@/hooks/useUserTrends';
import { ShieldCheck, Camera, Ruler, ZoomIn, Package, Star, Building2, MapPin, PhoneCall, Calendar, CalendarClock, Heart, UtensilsCrossed, Users, Clock, Utensils, Sparkles, MessageCircle, Phone, Share2, ChevronDown, PartyPopper, CheckCircle2, FileText, Send, ArrowRight, Scale, Briefcase, Zap, ShoppingBag, Truck, RotateCcw, Layers, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import SmartQueueWidget from '@/components/SmartQueueWidget';
import CarWashBookingWidget from '@/components/CarWashBookingWidget';
import ProfessionalBookingWidget from '@/components/ProfessionalBookingWidget';
import ReviewsSection from '@/components/ReviewsSection';
import StarRating from '@/components/StarRating';
import AdvertisementWidget from '@/components/AdvertisementWidget';
import { isServiceProduct } from '@/utils/productSearch';
import { getServiceBadge } from '@/utils/serviceBadges';
import { getApiUrl, fastFetch } from '@/utils/api';
import MascotState from '@/components/MascotState';

const API_URL = getApiUrl();

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname() || '';
  const id = params?.id as string;
  const { trackCategory, trackProductView } = useUserTrends();
  const { addToCart } = useCart();
  const { products, isLoading } = useProducts();
  const { user, updateUserRole, login } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rfqQuantity, setRfqQuantity] = useState<number | ''>(1);
  const [retailQuantity, setRetailQuantity] = useState<number>(1);
  const [bundleMultiplier, setBundleMultiplier] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeDetailsTab, setActiveDetailsTab] = useState<'specs' | 'overview' | 'box' | 'warranty'>('specs');
  const [rfqMessage, setRfqMessage] = useState('');
  const [isEliteExpanded, setIsEliteExpanded] = useState(false);

  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const [isFetchingSingle, setIsFetchingSingle] = useState(false);
  const product: Product | undefined = products.find(p => p.id === id) || fetchedProduct || undefined;

  useEffect(() => {
    if (!products.find(p => p.id === id) && id) {
      setIsFetchingSingle(true);
      fastFetch<Product>(`/products/${id}`)
        .then(data => {
          if (data) setFetchedProduct(data);
        })
        .catch(() => {})
        .finally(() => setIsFetchingSingle(false));
    }
  }, [id, products]);

  const serviceBadge = useMemo(() => getServiceBadge(product), [product]);

  // ── Category Rules — from Admin Relationship Manager ──
  const rules = useCategoryRules(product?.category);
  const noRulesDefined = rules.allowedFeatures.length === 0;
  const hasProductStock = rules.allows('Product Stock');
  const hasB2B = rules.allows('B2B');
  const hasBulkPricing = rules.allows('Bulk Pricing') || rules.allows('MOQ');
  const isPhysicalProduct = product?.primaryType === 'PRODUCT' || (product ? !isServiceProduct(product) : false);
  const sellerBookingModel = isPhysicalProduct ? undefined : (product?.parameters as any)?.bookingModel;
  const hasToken = isPhysicalProduct ? false : (rules.allows('Token') || sellerBookingModel === 'TOKEN' || sellerBookingModel === 'HYBRID' || sellerBookingModel === 'QUEUE_ONLY');
  const hasAppointment = isPhysicalProduct ? false : (rules.allows('Appointment') || sellerBookingModel === 'APPOINTMENT' || sellerBookingModel === 'HYBRID');
  const hasRFQ = rules.allows('RFQ') || rules.allows('Quote');
  const hasMeeting = isPhysicalProduct ? false : (rules.allows('Meeting') || rules.isOptional('Meeting'));
  const hasVehicleTestDrive = rules.allows('Vehicle Test Drive');
  const hasService = isPhysicalProduct ? false : (rules.allows('Service') || product?.primaryType === 'SERVICE' || (product ? isServiceProduct(product) : false));

  const requireAuth = (action: () => void) => {
    if (!user) {
      const currentPath = pathname || (product && (product.primaryType === 'SERVICE' || isServiceProduct(product)) ? `/service/${id}` : `/product/${id}`);
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      action();
    }
  };

  useEffect(() => {
    if (!product) return;
    const isService = product.primaryType === 'SERVICE' || isServiceProduct(product);
    if (isService && !pathname.startsWith('/service/')) {
      router.replace(`/service/${product.id}`);
    } else if (!isService && pathname.startsWith('/service/')) {
      router.replace(`/product/${product.id}`);
    }
  }, [product?.id, product?.primaryType, pathname, router]);

  useEffect(() => {
    if (product?.id && product?.category) {
      trackCategory(product.category);
      trackProductView(product.id);
    }
  }, [product?.id, product?.category, trackCategory, trackProductView]);

  // Helper to parse parameter options whether array or comma/space separated strings
  const parseParamOptions = (val: any, paramName?: string): string[] => {
    if (!val && val !== 0) return [];
    if (Array.isArray(val)) {
      return val.map(String).map(s => s.trim()).filter(Boolean);
    }
    const str = String(val).trim();
    if (!str) return [];

    // If comma separated, split by comma
    if (str.includes(',')) {
      return str.split(',').map(s => s.trim()).filter(Boolean);
    }

    // If color parameter contains space-separated color names (e.g. "Black White Blue Green")
    if (paramName && paramName.toLowerCase() === 'color' && str.includes(' ')) {
      const knownColors = ['white', 'black', 'red', 'blue', 'green', 'grey', 'gray', 'navy', 'yellow', 'purple', 'pink', 'orange', 'silver', 'gold', 'brown'];
      const tokens = str.split(/\s+/).filter(Boolean);
      // If multiple known colors are present separated by space
      const matchingColors = tokens.filter(t => knownColors.includes(t.toLowerCase()));
      if (matchingColors.length > 1) {
        return tokens;
      }
    }

    return [str];
  };

  // Initialize RFQ quantity and variants
  useEffect(() => {
    if (product?.category === 'B2B' || product?.category === 'Construction Materials') {
      setRfqQuantity(12);
    }

    if (product?.parameters) {
      const initialVariants: Record<string, string> = {};
      Object.keys(product.parameters).forEach(key => {
        const cleaned = key.toLowerCase().replace(/[\s_-]/g, '');
        if (cleaned.includes('warranty')) return;
        const val = product.parameters![key];
        const parsed = parseParamOptions(val, key);
        if (parsed.length > 0) {
          initialVariants[key] = parsed[0];
        }
      });
      setSelectedVariants(initialVariants);
    }
  }, [product]);

  const printRate = (product?.originalPrice && product?.price && product.originalPrice > product.price) ? product.originalPrice : (product?.price || 0);
  let currentActivePrice = product?.price || 0;

  // Dynamic Pricing based on selected option
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  useEffect(() => {
    if (product?.options && product.options.length > 0 && !selectedOptionId) {
      setSelectedOptionId(product.options[0].id);
    }
  }, [product, selectedOptionId]);

  const activeOption = product?.options?.find(o => o.id === selectedOptionId);
  if (activeOption) {
    currentActivePrice = activeOption.price;
  }

  const isElite = user?.role === 'elite';
  const isActualService = product ? (!isPhysicalProduct && isServiceProduct(product)) : false;

  const isFoodDining = product && isActualService ? (
    product.category?.toLowerCase().includes('food') ||
    product.category?.toLowerCase().includes('dining') ||
    product.category?.toLowerCase().includes('restaurant') ||
    product.category?.toLowerCase().includes('cafe') ||
    product.subcategory?.toLowerCase().includes('restaurant') ||
    product.subcategory?.toLowerCase().includes('dining') ||
    product.subcategory?.toLowerCase().includes('cafe') ||
    product.subcategory?.toLowerCase().includes('food') ||
    product.subcategory?.toLowerCase().includes('bistro') ||
    product.subcategory?.toLowerCase().includes('bar') ||
    product.name?.toLowerCase().includes('restaurant') ||
    product.name?.toLowerCase().includes('cafe') ||
    product.name?.toLowerCase().includes('dining') ||
    product.name?.toLowerCase().includes('bistro')
  ) : false;

  const isAutoWash = product && isActualService ? (
    product.category?.toLowerCase().includes('car wash') ||
    product.category?.toLowerCase().includes('automobile') ||
    product.category?.toLowerCase().includes('car washing') ||
    product.subcategory?.toLowerCase().includes('car wash') ||
    product.subcategory?.toLowerCase().includes('car washing') ||
    product.subcategory?.toLowerCase().includes('automobile') ||
    product.subcategory?.toLowerCase().includes('detailing') ||
    product.subcategory?.toLowerCase().includes('mechanic') ||
    product.name?.toLowerCase().includes('car wash') ||
    product.name?.toLowerCase().includes('auto wash') ||
    product.name?.toLowerCase().includes('vehicle wash')
  ) : false;

  const isOrganizer = product && isActualService ? (
    product.category?.toLowerCase().includes('organizer') ||
    product.category?.toLowerCase().includes('event') ||
    product.category?.toLowerCase().includes('wedding') ||
    product.subcategory?.toLowerCase().includes('event') ||
    product.subcategory?.toLowerCase().includes('wedding') ||
    product.subcategory?.toLowerCase().includes('party') ||
    product.subcategory?.toLowerCase().includes('stage') ||
    product.name?.toLowerCase().includes('event') ||
    product.name?.toLowerCase().includes('wedding') ||
    product.name?.toLowerCase().includes('party') ||
    (product.parameters as any)?.bookingModel === 'PROPOSAL'
  ) : false;

  const isProfessional = product && isActualService ? (() => {
    const text = `${product.category || ''} ${product.subcategory || ''} ${product.name || ''}`.toLowerCase();
    // Strictly exclude manual trades and home maintenance (carpentry, cabinetry, plumbing, electrical, cleaning, repair)
    if (
      text.includes('carpenter') ||
      text.includes('carpentry') ||
      text.includes('cabinet') ||
      text.includes('plumber') ||
      text.includes('plumbing') ||
      text.includes('electrician') ||
      text.includes('furniture') ||
      text.includes('cleaning') ||
      text.includes('repair') ||
      text.includes('mechanic')
    ) {
      return false;
    }

    return (
      text.includes('professional') ||
      text.includes('lawyer') ||
      text.includes('legal') ||
      text.includes('advocate') ||
      text.includes('consultant') ||
      text.includes('consultancy') ||
      text.includes('accountant') ||
      text.includes('chartered accountant') ||
      /\bca\b/i.test(text) ||
      text.includes('tax consultant') ||
      text.includes('tax advisory') ||
      text.includes('architect') ||
      text.includes('financial advisor')
    );
  })() : false;

  const WALK_IN_CATEGORIES = ['salon', 'saloon', 'beauty', 'hair', 'barber', 'spa', 'nail', 'massage', 'pedicure', 'doctor', 'clinic', 'medical', 'hospital', 'dentist'];
  const isServiceQueue = product && isActualService ? (
    !isProfessional && (
      WALK_IN_CATEGORIES.some(c => (product.category || '').toLowerCase().includes(c) || (product.subcategory || '').toLowerCase().includes(c) || (product.name || '').toLowerCase().includes(c)) ||
      hasToken ||
      sellerBookingModel === 'TOKEN' ||
      sellerBookingModel === 'HYBRID' ||
      sellerBookingModel === 'QUEUE_ONLY' ||
      (!isFoodDining && !isOrganizer && !isAutoWash)
    )
  ) : false;

  const isServiceProviderItem = Boolean(
    isActualService ||
    isFoodDining ||
    isOrganizer ||
    isProfessional ||
    isAutoWash ||
    isServiceQueue ||
    hasService ||
    serviceBadge !== null ||
    product?.primaryType === 'SERVICE' ||
    (product?.category || '').toLowerCase().includes('dining') ||
    (product?.category || '').toLowerCase().includes('food') ||
    (product?.category || '').toLowerCase().includes('service') ||
    (product?.category || '').toLowerCase().includes('restaurant') ||
    (product?.subcategory || '').toLowerCase().includes('restaurant') ||
    (product?.subcategory || '').toLowerCase().includes('dining')
  );

  // Event & Organizer Customer Booking States
  const [organizerBookingMode, setOrganizerBookingMode] = useState<'appointment' | 'proposal'>('appointment');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState('Wedding & Reception');
  const [guestCount, setGuestCount] = useState('100 - 300 Guests');
  const [eventBudget, setEventBudget] = useState('₹2,00,000 - ₹5,00,000');
  const [eventCity, setEventCity] = useState('');
  const [organizerSubmitted, setOrganizerSubmitted] = useState(false);

  const [partySize, setPartySize] = useState(2);
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [reservationDate, setReservationDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [reservationTime, setReservationTime] = useState('');

  // Dining time slots configuration with 24-hr start time for past-time filtering
  const allDiningSlots = useMemo(() => [
    { label: '12:30 PM (Lunch)', hour: 12, minute: 30 },
    { label: '01:30 PM (Lunch)', hour: 13, minute: 30 },
    { label: '07:00 PM (Dinner)', hour: 19, minute: 0 },
    { label: '07:45 PM (Dinner)', hour: 19, minute: 45 },
    { label: '08:30 PM (Prime Dinner)', hour: 20, minute: 30 },
    { label: '09:15 PM (Late Dining)', hour: 21, minute: 15 },
    { label: '10:00 PM (Late Night)', hour: 22, minute: 0 },
  ], []);

  // Filter available time slots if today is selected
  const availableTimeSlots = useMemo(() => {
    if (!reservationDate) return allDiningSlots;
    if (reservationDate > todayStr) return allDiningSlots;
    if (reservationDate === todayStr) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      // Keep only slots that are at least 15 minutes ahead of current time
      return allDiningSlots.filter(s => (s.hour * 60 + s.minute) > (currentMinutes + 15));
    }
    return [];
  }, [reservationDate, todayStr, allDiningSlots]);

  // If currently selected slot is not valid for the date, reset it
  useEffect(() => {
    if (reservationTime && !availableTimeSlots.some(s => s.label === reservationTime)) {
      setReservationTime('');
    }
  }, [availableTimeSlots, reservationTime]);
  const [diningMode, setDiningMode] = useState<'reserve' | 'book'>('reserve');
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const guestDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Generate 7 upcoming days for reservation (1 week)
  const reservationDateOptions = useMemo(() => {
    const list = [];
    const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const val = `${year}-${month}-${day}`;

      let label = '';
      if (i === 0) {
        label = `Today, ${d.getDate()} ${monthsShort[d.getMonth()]}`;
      } else if (i === 1) {
        label = `Tomorrow, ${d.getDate()} ${monthsShort[d.getMonth()]}`;
      } else {
        label = `${daysShort[d.getDay()]}, ${d.getDate()} ${monthsShort[d.getMonth()]}`;
      }

      list.push({ val, label });
    }
    return list;
  }, []);

  const selectedDateLabel = useMemo(() => {
    const found = reservationDateOptions.find(o => o.val === reservationDate);
    return found ? found.label : (reservationDate || 'Select Date');
  }, [reservationDateOptions, reservationDate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(e.target as Node)) {
        setIsGuestDropdownOpen(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    };
    if (isGuestDropdownOpen || isDateDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isGuestDropdownOpen, isDateDropdownOpen]);

  const isRetail = (product?.primaryType === 'SERVICE' || isFoodDining || isOrganizer || isProfessional || hasService || isServiceQueue) ? false : (noRulesDefined
    ? !['Services', 'Home Services', 'Organizers', 'Transport', 'Rentals', 'Subscriptions', 'B2B', 'Construction Materials', 'Salon & Parlour', 'Salon & Parlor', 'Salon', 'Beauty Parlour', 'Spa', 'Car Wash', 'Professional'].includes(product?.category || '')
    : (hasProductStock || isPhysicalProduct));
  const isWholesaleConfig = (product?.primaryType === 'SERVICE' || isFoodDining || isOrganizer || isProfessional || hasService || isServiceQueue) ? false : (noRulesDefined
    ? (product?.category === 'B2B' || product?.category === 'Construction Materials' || (isRetail && isElite))
    : ((hasB2B && hasBulkPricing) || (isRetail && isElite)));

  if (product && !activeOption) { // Only apply wholesale logic if not using dynamic options
    if (isWholesaleConfig) {
      const basePrice = product.price;
      if (rfqQuantity === 1 && isRetail && isElite) {
        currentActivePrice = Math.round(basePrice * 0.9);
      } else if (product.wholesaleTiers && product.wholesaleTiers.length > 0) {
        const sortedTiers = [...product.wholesaleTiers].sort((a, b) => b.minQty - a.minQty);
        const activeTier = sortedTiers.find(tier => (typeof rfqQuantity === 'number' ? rfqQuantity : 1) >= tier.minQty);
        if (activeTier) {
          currentActivePrice = Math.round(basePrice * (1 - activeTier.margin / 100));
        } else {
          currentActivePrice = isRetail && isElite ? Math.round(basePrice * 0.9) : basePrice;
        }
      } else {
        // Fallback to default bundle margins
        const qty = typeof rfqQuantity === 'number' ? rfqQuantity : 1;
        if (qty >= 150) currentActivePrice = Math.round(basePrice * 0.60); // 40% Margin
        else if (qty >= 100) currentActivePrice = Math.round(basePrice * 0.70); // 30% Margin
        else if (qty >= 12) currentActivePrice = Math.round(basePrice * 0.80); // 20% Margin
        else {
          currentActivePrice = isRetail && isElite ? Math.round(basePrice * 0.9) : basePrice;
        }
      }
    }
  }

  if (isLoading || (isFetchingSingle && !product)) {
    return (
      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 bg-white relative animate-pulse">
        <div className="w-full h-32 bg-slate-200 rounded-2xl mb-8"></div>
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <div className="w-full h-[500px] bg-slate-200 rounded-2xl"></div>
            <div className="mt-8 p-6 bg-slate-100 rounded-2xl h-48"></div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
            <div className="w-3/4 h-10 bg-slate-200 rounded"></div>
            <div className="w-1/2 h-6 bg-slate-200 rounded"></div>
            <div className="w-full h-32 bg-slate-100 rounded-2xl mt-8"></div>
            <div className="w-full h-64 bg-slate-100 rounded-2xl mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    const isServicePath = pathname.startsWith('/service/');
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] p-6 bg-slate-50/60">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 w-full max-w-lg">
          <MascotState
            state="404"
            title={isServicePath ? 'Service Not Found' : 'Product Not Found'}
            description={
              isServicePath
                ? "This service may have been moved, updated, or is no longer listed. Let's get you back on track."
                : "Oops! This item seems to have gone on a different journey. Let's get you back."
            }
            actionText={isServicePath ? 'Browse All Services' : 'Go to Home'}
            actionHref={isServicePath ? '/services' : '/'}
            secondaryText="Search Marketplace"
            secondaryHref="/search"
          />
        </div>
      </div>
    );
  }

  // Get related products from the same seller (excluding current product)
  const relatedProducts = products.filter(p => p.seller === product.seller && p.id !== product.id).slice(0, 4);
  // If no related products from the same seller, just show some random ones
  const displayedRelated = relatedProducts.length > 0 ? relatedProducts : products.filter(p => p.id !== product.id).slice(0, 4);

  // Map actual images from product, falling back to mock structure if none exist
  const productImages = product.images && product.images.length > 0
    ? product.images.map((img, i) => ({ url: img || "/hero-left-logo.png", label: `View ${i + 1}`, icon: <Camera className="w-16 h-16 opacity-50 mb-4" strokeWidth={1.5} /> }))
    : [
      { icon: <Camera className="w-16 h-16 opacity-50 mb-4" strokeWidth={1.5} />, label: 'Front View', url: product.image || "/hero-left-logo.png" },
      { icon: <Ruler className="w-16 h-16 opacity-50 mb-4" strokeWidth={1.5} />, label: 'Side View', url: "/hero-left-logo.png" },
      { icon: <ZoomIn className="w-16 h-16 opacity-50 mb-4" strokeWidth={1.5} />, label: 'Close Up', url: "/hero-left-logo.png" },
      { icon: <Package className="w-16 h-16 opacity-50 mb-4" strokeWidth={1.5} />, label: 'In Box', url: "/hero-left-logo.png" }
    ];

  const submitRfq = async () => {
    if (!user) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    if (!product?.sellerId) {
      alert("Seller information not available.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user.id,
          sellerId: product.sellerId,
          productId: product.id,
          message: rfqMessage || `I am interested in ${product.name}. Please provide a quote.`,
          quantityRequested: rfqQuantity
        })
      });
      if (res.ok) {
        alert('Request for quotation sent successfully!');
        setIsModalOpen(false);
      } else {
        alert('Failed to send request.');
      }
    } catch (e) {
      console.error(e);
      alert('Error sending RFQ.');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-3.5 sm:p-6 lg:p-10 bg-white relative z-0">

      <AdvertisementWidget position="PRODUCT_PAGE" className="mb-4 sm:mb-8" />

      {/* Top Section: Images and Details (Flipkart-style sticky left gallery, scrolling right details) */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start relative">

        {/* Left: Product Image Gallery (Sticky on Desktop) */}
        <div className="w-full lg:w-[46%] lg:max-w-[500px] shrink-0 lg:sticky lg:top-24 lg:self-start">
          {/* Main Image */}
          <div className="w-full h-[260px] sm:h-[400px] lg:h-[480px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-500 border border-slate-200 overflow-hidden shadow-sm relative">
            {productImages[activeImage]?.url ? (
              <img
                src={productImages[activeImage].url}
                alt={product.name}
                className={`w-full h-full ${(isFoodDining || isServiceProduct(product) || isServiceQueue) ? 'object-cover' : 'object-contain p-4'}`}
              />
            ) : (
              <>
                {productImages[activeImage]?.icon}
                <span className="text-lg font-medium">{productImages[activeImage]?.label}</span>
              </>
            )}
            {serviceBadge && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black/60 backdrop-blur-md border border-white/20 text-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-md">
                <serviceBadge.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${serviceBadge.color}`} />
                <span>{serviceBadge.label}</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex gap-2.5 sm:gap-4 mt-3 sm:mt-4 overflow-x-auto pb-1.5">
              {productImages.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-14 h-14 sm:w-20 sm:h-20 shrink-0 bg-slate-50 rounded-xl cursor-pointer flex flex-col items-center justify-center border-2 transition-all overflow-hidden shadow-xs
                    ${activeImage === index ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300 opacity-70 hover:opacity-100'}
                  `}
                >
                  {img.url ? (
                    <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <div className="scale-50 text-slate-400">{img.icon}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sold By / Restaurant Venue Details Card (Desktop Left Column) */}
          <div className="hidden lg:block mt-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
              {serviceBadge ? serviceBadge.label : (isServiceProduct(product) ? 'Service Provider' : 'Sold by')}
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${isFoodDining ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'} rounded-xl flex items-center justify-center shrink-0 border`}>
                  {isFoodDining ? <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" /> : <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <div>
                  <Link href={`/seller/${encodeURIComponent(product.seller)}`} className="no-underline">
                    <div className="font-bold text-base sm:text-lg text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1.5 flex-wrap">
                      {product.seller}
                      <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 font-bold tracking-tight">
                        <ShieldCheck className="w-2.5 h-2.5" /> Verified
                      </span>
                    </div>
                  </Link>
                  <div className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" /> {product.location}
                  </div>
                </div>
              </div>
            </div>
            {/* Seller Communication & Resource Links */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello! I am inquiring about "${product.name}" on MarkatVerse. Could you share more details and availability?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Seller</span>
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Call Store</span>
              </a>
              <Link
                href={`/shop/${encodeURIComponent((product.seller || 'unknown').toLowerCase().replace(/ /g, '-'))}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>Store Catalog & Hours →</span>
              </Link>
            </div>

            <div className="flex gap-6 sm:gap-10 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100">
              <div>
                <div className="text-[10px] sm:text-xs text-slate-500 font-medium mb-0.5 sm:mb-1">Seller Rating</div>
                <div className="font-bold text-amber-500 flex items-center gap-1 text-sm sm:text-base">
                  {product.rating || 'New'} <span className="text-slate-400 font-normal text-[10px] sm:text-xs ml-0.5 sm:ml-1">({product.reviews || '0'} Reviews)</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] sm:text-xs text-slate-500 font-medium mb-0.5 sm:mb-1">Active Since</div>
                <div className="font-bold text-slate-900 text-sm sm:text-base">{new Date().getFullYear()}</div>
              </div>
            </div>

            {isElite && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100">
                <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 rounded-xl border border-amber-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="text-amber-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
                      Elite Privilege: Direct Contact
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:gap-6">
                    <div className="flex items-center gap-2 sm:gap-3 text-slate-800 font-medium text-xs sm:text-sm">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <PhoneCall className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      +91-9876543210
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right: Product Info & Actions (Right side scrolling details) */}
        <div className="flex-1 min-w-0 w-full">
          {/* Top Category and Badges Lockup (matching card design) */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {product.badge && (
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase shadow-xs ${product.badgeColor === 'badge-gold' ? 'bg-amber-400 text-slate-900' : 'bg-red-500 text-white'
                }`}>
                {product.badge}
              </span>
            )}

            {product.category && (
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md border ${isAutoWash
                  ? 'text-cyan-800 bg-cyan-50 border-cyan-200'
                  : 'text-indigo-700 bg-indigo-50 border-indigo-100'
                }`}>
                {product.category} {product.subcategory ? `› ${product.subcategory}` : ''}
              </span>
            )}

            {product.brand && (
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                Brand: {product.brand}
              </span>
            )}

            <Link
              href={`/shop/${encodeURIComponent((product.seller || 'unknown').toLowerCase().replace(/ /g, '-'))}`}
              className={`text-xs font-bold uppercase tracking-wider ml-auto flex items-center gap-1 ${isAutoWash ? 'text-cyan-700 hover:text-cyan-800' : 'text-blue-600 hover:text-blue-800'
                }`}
            >
              <span>{product.seller || 'Verified Seller'}</span>
              <ShieldCheck className={`w-3.5 h-3.5 ${isAutoWash ? 'text-cyan-700' : 'text-blue-600'}`} />
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-2 leading-tight">{product.name}</h1>

          <div className="text-slate-600 font-medium text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
            <span className="truncate">
              {product._distance != null && product._distance !== Infinity ? `${product._distance.toFixed(1)} km away • ` : ''}
              {product.location || 'Location not provided'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <StarRating rating={Number(product.rating || 0)} totalReviews={Number(product.reviews || 0)} compact={true} />
            </div>
            <button
              onClick={() => requireAuth(() => toggleWishlist(product.id))}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border transition-colors shadow-2xs text-xs sm:text-sm ${isInWishlist(product.id)
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
                }`}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
              <span className="font-bold">{isInWishlist(product.id) ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          <div className={isAutoWash ? "mb-4" : (isServiceProduct(product) || hasService || isServiceQueue || isProfessional) ? "mb-4 sm:mb-5" : "p-4 sm:p-6 bg-slate-50 rounded-2xl mb-6 sm:mb-8 border border-slate-200 shadow-2xs"}>
            {(isServiceProduct(product) || hasService || isServiceQueue || isProfessional) && !isAutoWash && !isOrganizer && !isFoodDining ? (
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    {isProfessional ? 'Consultation Fee' : 'Service Rate'}
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 flex items-baseline gap-2">
                    <span>₹{currentActivePrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500">
                      {isProfessional ? 'per consultation' : 'starting rate'}
                    </span>
                  </div>
                </div>
                {isProfessional ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chamber & Online Consultation</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Queue & Advance Appointments</span>
                  </div>
                )}
              </div>
            ) : !isAutoWash ? (
              <>
                <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {isOrganizer
                    ? 'Package / Estimation Rate'
                    : isFoodDining
                      ? 'Reservation / Dining Rate'
                      : (isServiceProduct(product) ? 'Service Rate' : 'Price')}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center gap-2 sm:gap-3 flex-wrap">
                  {isOrganizer ? (
                    currentActivePrice > 0 ? (
                      <>
                        ₹{currentActivePrice.toLocaleString('en-IN')}
                        <span className="text-xs sm:text-sm text-slate-500 font-medium">/ starting package</span>
                      </>
                    ) : (
                      <span className="text-2xl sm:text-3xl font-black text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 px-3 py-1 rounded-xl">
                        Custom Quote & Proposal
                      </span>
                    )
                  ) : (
                    <>
                      ₹{currentActivePrice.toLocaleString('en-IN')}
                      {isFoodDining && <span className="text-xs sm:text-base text-slate-500 font-semibold ml-1">/ table reservation</span>}
                      {product.category === 'Transport' && <span className="text-sm sm:text-lg text-slate-500 font-medium ml-1">/ km</span>}
                      {isWholesaleConfig && <span className="text-sm sm:text-lg text-slate-500 font-medium ml-1">/ unit</span>}
                      {isElite && isRetail && (
                        <span className="text-xs sm:text-sm text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 sm:py-1 rounded-md font-bold tracking-tight">Elite Rate</span>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : null}

            {isWholesaleConfig && (() => {
              const basePrice = product.price;

              return (
                <div className="mt-5 border border-blue-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 border-b border-blue-200 flex justify-between items-center">
                    <span>{isRetail ? 'Elite Wholesale Tiered Pricing' : 'Wholesale Tiered Pricing'}</span>
                    <span className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-200">MOQ: 12 Units</span>
                  </div>
                  <div
                    className="grid text-center divide-x divide-slate-200 bg-white"
                    style={{ gridTemplateColumns: `repeat(${(product.wholesaleTiers ? product.wholesaleTiers.length : 3) + (isRetail && isElite ? 1 : 0)}, minmax(0, 1fr))` }}
                  >
                    {isRetail && isElite && (
                      <div
                        onClick={() => {
                          setRfqQuantity(1);
                          setBundleMultiplier(1);
                        }}
                        className={`p-3 flex flex-col transition-colors cursor-pointer hover:bg-blue-50 ${rfqQuantity === 1 ? 'bg-blue-50/50 ring-2 ring-blue-500 ring-inset' : ''}`}
                      >
                        <span className="text-xs text-slate-500 font-bold mb-1">1 Unit (Retail)</span>
                        <span className="font-bold text-slate-800">₹{Math.round(basePrice * 0.9).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-amber-600 font-bold mt-1">10% Elite Discount</span>
                      </div>
                    )}
                    {product.wholesaleTiers && product.wholesaleTiers.length > 0 ? (
                      product.wholesaleTiers.map((tier, index) => {
                        const nextTier = product.wholesaleTiers![index + 1];
                        const qtyNum = Number(rfqQuantity) || 0;
                        const isActive = qtyNum >= tier.minQty && (!nextTier || qtyNum < nextTier.minQty);
                        return (
                          <div
                            key={index}
                            onClick={() => {
                              setRfqQuantity(tier.minQty);
                              setBundleMultiplier(1);
                            }}
                            className={`p-3 flex flex-col transition-colors cursor-pointer hover:bg-blue-50 ${isActive ? 'bg-blue-50/50 ring-2 ring-blue-500 ring-inset' : ''}`}
                          >
                            <span className="text-xs text-slate-500 font-bold mb-1">
                              {tier.minQty}-Pack Bundle
                            </span>
                            <span className="font-bold text-slate-800">
                              ₹{Math.round(basePrice * (1 - tier.margin / 100)).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold mt-1">
                              {tier.margin}% Margin
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div
                          onClick={() => {
                            setRfqQuantity(12);
                            setBundleMultiplier(1);
                          }}
                          className={`p-3 flex flex-col transition-colors cursor-pointer hover:bg-blue-50 ${rfqQuantity === 12 ? 'bg-blue-50/50 ring-2 ring-blue-500 ring-inset' : ''}`}
                        >
                          <span className="text-xs text-slate-500 font-bold mb-1">12-Pack Bundle</span>
                          <span className="font-bold text-slate-800">₹{Math.round(basePrice * 0.80).toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-emerald-600 font-bold mt-1">20% Wholesale Margin</span>
                        </div>
                        <div
                          onClick={() => {
                            setRfqQuantity(100);
                            setBundleMultiplier(1);
                          }}
                          className={`p-3 flex flex-col transition-colors cursor-pointer hover:bg-blue-50 ${rfqQuantity === 100 ? 'bg-blue-50/50 ring-2 ring-blue-500 ring-inset' : ''}`}
                        >
                          <span className="text-xs text-slate-500 font-bold mb-1">100-Pack Bundle</span>
                          <span className="font-bold text-slate-800">₹{Math.round(basePrice * 0.70).toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-emerald-600 font-bold mt-1">30% Wholesale Margin</span>
                        </div>
                        <div
                          onClick={() => {
                            setRfqQuantity(150);
                            setBundleMultiplier(1);
                          }}
                          className={`p-3 flex flex-col transition-colors cursor-pointer hover:bg-blue-50 ${rfqQuantity === 150 ? 'bg-blue-50/50 ring-2 ring-blue-500 ring-inset' : ''}`}
                        >
                          <span className="text-xs text-slate-500 font-bold mb-1">150-Pack Bundle</span>
                          <span className="font-bold text-slate-800">₹{Math.round(basePrice * 0.60).toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-emerald-600 font-bold mt-1">40% Wholesale Margin</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {!isAutoWash && activeOption && activeOption.price > 0 ? (
              activeOption.discountPercentage && activeOption.discountPercentage > 0 ? (
                <>
                  <div className="text-slate-500 line-through mt-2 text-sm">
                    M.R.P: ₹{Math.round(activeOption.price / (1 - activeOption.discountPercentage / 100)).toLocaleString('en-IN')}
                  </div>
                  <div className="text-emerald-600 font-bold mt-1 text-sm">You Save: {activeOption.discountPercentage}% OFF</div>
                </>
              ) : null
            ) : (
              !isAutoWash && product.originalPrice && product.price > 0 && product.originalPrice > product.price && product.category !== 'Organizers' && (
                <>
                  <div className="text-slate-500 line-through mt-2 text-sm">
                    M.R.P: ₹{product.originalPrice.toLocaleString('en-IN')}
                    {product.category === 'Transport' && ' / km'}
                    {product.category === 'B2B' && ' / unit'}
                  </div>
                  <div className="text-emerald-600 font-bold mt-1 text-sm">You Save: {product.discount}</div>
                </>
              )
            )}

            {!isOrganizer && !isFoodDining && (product.primaryType !== 'SERVICE') && (noRulesDefined ? !['Services', 'Home Services', 'Organizers', 'Transport', 'Rentals', 'Subscriptions', 'B2B', 'Construction Materials'].includes(product.category) : hasProductStock) && (
              <div className="mt-4 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 border border-amber-400 shadow-sm shadow-amber-500/10 transition-all">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEliteExpanded(!isEliteExpanded)}
                    className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
                    title="Click to view details"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 fill-white text-white drop-shadow-sm" />
                    </div>
                    <div>
                      <span className="font-extrabold text-white text-sm flex items-center gap-1.5 tracking-wide">
                        MarkatVerse Elite
                        <ChevronDown className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${isEliteExpanded ? 'rotate-180' : ''}`} />
                      </span>
                      {!isEliteExpanded && (
                        <span className="text-[11px] text-white/85 font-medium hover:underline">
                          {isElite ? 'Elite Active • Click for info' : 'Tiered pricing benefits • Click to view'}
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (user && user.id) {
                        updateUserRole(user.id, isElite ? 'buyer' : 'elite');
                      } else {
                        login({ id: 'u4', name: 'Elite Buyer', phone: '8888888888', email: 'elite@example.com', role: 'elite', status: 'active' });
                      }
                    }}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm shrink-0 ${isElite ? 'bg-white text-amber-700 hover:bg-slate-50' : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 border border-slate-700'}`}
                  >
                    {isElite ? 'Active' : 'Join Elite'}
                  </button>
                </div>

                {/* Collapsible description */}
                {isEliteExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/20 text-xs text-white/95 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="leading-relaxed">
                      {isElite
                        ? '✓ Elite Membership Active: You enjoy wholesale tiered discounts, verified direct seller contact, and priority support.'
                        : 'Unlock exclusive wholesale tiered discounts, direct seller contact numbers, and priority dispatch on this order.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Variant Selectors (For physical/regular retail items with options; service booking widgets like SmartQueueWidget and dining reservation handle options directly) */}
            {product.options && product.options.length > 0 && !isFoodDining && !hasToken && !isAutoWash && !isServiceProduct(product) && !isServiceQueue && !hasService && (
              <div className="mt-8 space-y-6 pt-6 border-t border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                      {isPhysicalProduct ? 'Selected Edition / Option:' : 'Booking Option:'} <span className="text-blue-600 font-extrabold">{activeOption?.name || 'Standard'}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.options.map(option => {
                      const isSelected = selectedOptionId === option.id;
                      return (
                        <div
                          key={option.id}
                          onClick={() => setSelectedOptionId(option.id)}
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2 flex flex-col items-start gap-1 cursor-pointer ${isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                            }`}
                        >
                          <span>{option.name}</span>
                          {option.discountPercentage && option.discountPercentage > 0 && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              {option.discountPercentage}% OFF
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}



            {/* Physical Product Variant Selectors (For physical goods with selectable parameters) */}
            {product.parameters && Object.keys(product.parameters).length > 0 && !isFoodDining && !hasToken && !isAutoWash && !isServiceProduct(product) && !isServiceQueue && !hasService && (() => {
              // Hide internal backend/flow configuration keys and static specification fields (like warranty) from customer variant selection UI
              const excludedKeys = ['bookingmodel', 'bookingoptions', 'bookingoption', 'servicetype', 'flow', 'allowedfeatures', 'queueenabled', 'warranty'];
              const publicEntries = Object.entries(product.parameters).filter(([paramName]) => {
                const cleaned = paramName.toLowerCase().replace(/[\s_-]/g, '');
                return !excludedKeys.some(k => cleaned.includes(k) || k.includes(cleaned));
              });

              if (publicEntries.length === 0) return null;

              return (
                <div className={`space-y-6 pt-6 border-t border-slate-200 ${product.options && product.options.length > 0 ? 'mt-6' : 'mt-8'}`}>
                  {publicEntries.map(([paramName, rawOptions]) => {
                    const parsedOptions = parseParamOptions(rawOptions, paramName);
                    if (parsedOptions.length === 0) return null;
                    const currentValue = selectedVariants[paramName] || parsedOptions[0];

                    return (
                      <div key={paramName}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                            {paramName}: <span className="text-blue-600 font-extrabold">{currentValue}</span>
                          </span>
                          {paramName.toLowerCase().includes('size') && (
                            <button className="text-xs font-bold text-blue-600 hover:underline">Size Guide</button>
                          )}
                        </div>

                        <div className={paramName.toLowerCase() === 'color' ? "flex flex-wrap gap-3" : "flex flex-wrap gap-3"}>
                          {parsedOptions.map(option => {
                            const isSelected = currentValue === option;

                            // Special rendering for 'Color' variants
                            if (paramName.toLowerCase() === 'color') {
                              const hexMap: Record<string, string> = {
                                'white': '#f8fafc',
                                'black': '#0f172a',
                                'red': '#ef4444',
                                'blue': '#3b82f6',
                                'green': '#22c55e',
                                'grey': '#94a3b8',
                                'navy': '#1e3a8a',
                                'natural titanium': '#a3a3a3',
                                'blue titanium': '#334155',
                                'white titanium': '#f1f5f9',
                                'black titanium': '#1e293b',
                                'active black': '#09090b',
                                'cyan cider': '#06b6d4',
                                'navy blue': '#172554',
                                'olive green': '#3f6212',
                                'maroon': '#831843',
                                'silver': '#e2e8f0'
                              };
                              const colorHex = hexMap[option.toLowerCase()] || '#cbd5e1';

                              return (
                                <button
                                  key={option}
                                  onClick={() => setSelectedVariants(prev => ({ ...prev, [paramName]: option }))}
                                  className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${isSelected ? 'border-blue-600 ring-2 ring-blue-100 scale-110' : 'border-slate-300 hover:scale-105'}`}
                                  style={{ backgroundColor: colorHex }}
                                  title={option}
                                />
                              );
                            }

                            // Special rendering for 'Vehicle Type' variants
                            if (paramName.toLowerCase().includes('vehicle')) {
                              const vehicleIconMap: Record<string, string> = {
                                'bike': '🏍️',
                                'car': '🚗',
                                'truck': '🚚',
                                'bus': '🚌',
                                'jcb': '🚜',
                                'heavy vehicle': '🚜',
                                'heavy vehicle (jcb)': '🚜',
                                'heavy automobile': '🚜'
                              };
                              const vIcon = vehicleIconMap[option.toLowerCase()] || '🚘';
                              return (
                                <button
                                  key={option}
                                  onClick={() => setSelectedVariants(prev => ({ ...prev, [paramName]: option }))}
                                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all border-2 flex items-center gap-2 ${isSelected ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/20' : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-300'}`}
                                >
                                  <span className="text-base">{vIcon}</span>
                                  <span>{option}</span>
                                </button>
                              );
                            }

                            // Default pill rendering for other variants
                            return (
                              <button
                                key={option}
                                onClick={() => setSelectedVariants(prev => ({ ...prev, [paramName]: option }))}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'}`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div className="mt-4 flex flex-col gap-4">

              {/* ── CAR WASH & AUTOMOBILE DEDICATED BOOKING ── */}
              {isAutoWash ? (
                <CarWashBookingWidget service={product} />
              ) : isProfessional ? (
                <ProfessionalBookingWidget service={product} />
              ) : (isServiceQueue || hasToken || hasAppointment || isServiceProduct(product) || hasService) && !isOrganizer && !isFoodDining ? (
                <SmartQueueWidget service={product} />
              ) : null}

              {/* ── FOOD & DINING / RESTAURANT TABLE RESERVATION ── */}
              {isFoodDining && !isAutoWash && (
                <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-md p-3.5 sm:p-6 transition-all">
                  {/* Compact Header with Segmented Switcher */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        {diningMode === 'reserve' ? <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />}
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-extrabold text-sm sm:text-base leading-tight">
                          {diningMode === 'reserve' ? 'Book a Table' : 'Exclusive VIP Dining'}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                          {diningMode === 'reserve' ? `Instant confirmed seating at ${product.seller}` : `Private cabin & special arrangement at ${product.seller}`}
                        </p>
                      </div>
                    </div>

                    {/* Segmented Switcher: 2-column full width on mobile, inline flex on desktop */}
                    <div className="grid grid-cols-2 sm:inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setDiningMode('reserve');
                          const standardOpt = product.options?.find(o => !o.name.toLowerCase().includes('vip') && !o.name.toLowerCase().includes('private') && !o.name.toLowerCase().includes('cabin') && !o.name.toLowerCase().includes('candlelight') && !o.name.toLowerCase().includes('romantic'));
                          if (standardOpt) setSelectedOptionId(standardOpt.id);
                        }}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${diningMode === 'reserve'
                            ? 'bg-white text-rose-600 shadow-xs border border-slate-200/60'
                            : 'text-slate-600 hover:text-slate-900'
                          }`}
                      >
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        <span>Regular Table</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDiningMode('book');
                          const privateOpt = product.options?.find(o => o.name.toLowerCase().includes('vip') || o.name.toLowerCase().includes('private') || o.name.toLowerCase().includes('cabin') || o.name.toLowerCase().includes('candlelight') || o.name.toLowerCase().includes('romantic') || o.name.toLowerCase().includes('rooftop'));
                          if (privateOpt) setSelectedOptionId(privateOpt.id);
                        }}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${diningMode === 'book'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                          }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Private Cabin</span>
                      </button>
                    </div>
                  </div>

                  {/* Booking Fields */}
                  <div className="mt-4 space-y-3.5">
                    {/* VIP Cabin / Setup Dropdown (Only when Private Dining is selected) */}
                    {diningMode === 'book' && product.options && product.options.length > 0 && (() => {
                      const isPrivateName = (name: string) => {
                        const lower = name.toLowerCase();
                        return lower.includes('vip') || lower.includes('private') || lower.includes('cabin') || lower.includes('candlelight') || lower.includes('romantic') || lower.includes('rooftop');
                      };

                      const relevantOptions = product.options.filter(o => isPrivateName(o.name));
                      const optionsToDisplay = relevantOptions.length > 0 ? relevantOptions : product.options;

                      return (
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between mb-1.5">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Cabin / VIP Setup
                            </span>
                          </label>
                          <div className="relative">
                            <select
                              value={selectedOptionId || (optionsToDisplay[0]?.id || '')}
                              onChange={(e) => setSelectedOptionId(e.target.value)}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-rose-500 text-slate-800 bg-white shadow-2xs font-medium text-sm cursor-pointer appearance-none pr-9 transition-colors"
                            >
                              {optionsToDisplay.map(option => (
                                <option key={option.id} value={option.id}>
                                  {option.name} {option.price && option.price > 0 ? `— ₹${option.price.toLocaleString('en-IN')}` : ''}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 2-column horizontal grid on mobile, 3-column on tablet/desktop */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                      {/* 1. Number of Guests (Custom Scrollable Menu) */}
                      <div className="relative" ref={guestDropdownRef}>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5 truncate">
                          <Users className="w-3.5 h-3.5 text-rose-600 shrink-0" /> Guests
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-rose-500 text-slate-800 bg-white shadow-2xs font-medium text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <span className="truncate">{partySize} {partySize === 1 ? 'Guest' : 'Guests'}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isGuestDropdownOpen ? 'rotate-180 text-rose-600' : ''}`} />
                        </button>

                        {/* Scrollable Guest Options Dropdown */}
                        {isGuestDropdownOpen && (
                          <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 max-h-44 overflow-y-auto divide-y divide-slate-50">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => {
                                  setPartySize(num);
                                  setIsGuestDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${partySize === num
                                    ? 'bg-rose-50 text-rose-600 font-bold'
                                    : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                              >
                                <span>{num} {num === 1 ? 'Guest' : 'Guests'}</span>
                                {partySize === num && (
                                  <span className="text-rose-600 text-xs font-black">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 2. Date (Custom 1-Week Dropdown) */}
                      <div className="relative" ref={dateDropdownRef}>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5 truncate">
                          <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0" /> Date
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-rose-500 text-slate-800 bg-white shadow-2xs font-medium text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <span className="truncate">{selectedDateLabel}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isDateDropdownOpen ? 'rotate-180 text-rose-600' : ''}`} />
                        </button>

                        {/* 1-Week Date Options Dropdown Menu */}
                        {isDateDropdownOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 max-h-56 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-100">
                            {reservationDateOptions.map(opt => (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => {
                                  setReservationDate(opt.val);
                                  setIsDateDropdownOpen(false);
                                }}
                                className={`w-full px-3.5 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${reservationDate === opt.val
                                    ? 'bg-rose-50 text-rose-600 font-bold'
                                    : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                              >
                                <span>{opt.label}</span>
                                {reservationDate === opt.val && (
                                  <span className="text-rose-600 text-xs font-black">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. Time Slot (full width on mobile col-span-2, single column on desktop) */}
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5 truncate">
                          <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" /> Time Slot
                        </label>
                        <div className="relative">
                          <select
                            value={reservationTime}
                            onChange={e => setReservationTime(e.target.value)}
                            disabled={availableTimeSlots.length === 0}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-rose-500 text-slate-800 bg-white shadow-2xs font-medium text-xs sm:text-sm cursor-pointer appearance-none pr-9 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {availableTimeSlots.length === 0 ? 'No more slots today' : 'Select Time'}
                            </option>
                            {availableTimeSlots.map(slot => (
                              <option key={slot.label} value={slot.label}>{slot.label}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notice line */}
                    <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-600">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">✓</span>
                      <span className="truncate">
                        {diningMode === 'reserve' ? 'Table held for 90 minutes. Instant confirmation.' : 'Meal prepared in advance for zero wait time.'}
                      </span>
                    </div>

                    {/* Actions (Horizontal both on mobile & desktop) */}
                    <div className="pt-1 flex flex-row items-center gap-2 sm:gap-2.5">
                      <button
                        className="flex-1 py-3 px-3 sm:px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-rose-600/20 active:scale-[0.99] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer truncate"
                        onClick={() => requireAuth(() => {
                          if (!reservationDate) {
                            alert('Please select your preferred reservation date.');
                            return;
                          }
                          if (reservationDate < todayStr) {
                            alert('Cannot book a reservation for a past date. Please select today or an upcoming date.');
                            return;
                          }
                          if (!reservationTime) {
                            alert('Please select your preferred seating time slot.');
                            return;
                          }

                          const selectedPlan = activeOption ? activeOption.name : (partySize <= 2 ? '2-Seater Table' : partySize <= 4 ? '4-Seater Table' : partySize <= 6 ? '6-Seater Table' : '8-Seater Table');
                          const newBooking = {
                            id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
                            customerName: user?.name || 'Customer',
                            phone: user?.phone || '+91 98765 43210',
                            guests: partySize,
                            date: reservationDate,
                            timeSlot: reservationTime,
                            type: diningMode === 'reserve' ? 'Standard Table' : selectedPlan,
                            notes: diningMode === 'reserve' ? `Online reservation for ${partySize} guests` : `Private Dining Package (${selectedPlan})`,
                            assignedTable: selectedPlan,
                            status: 'Confirmed',
                            source: diningMode === 'reserve' ? 'Online Table Booking' : 'Private Dining Booking',
                            timestamp: new Date().toISOString()
                          };

                          try {
                            const existing = JSON.parse(localStorage.getItem('markat_table_reservations') || '[]');
                            localStorage.setItem('markat_table_reservations', JSON.stringify([newBooking, ...existing]));

                            // Customer notification
                            const customerNotifs = JSON.parse(localStorage.getItem(`markat_notifs_${user?.id || 'guest'}`) || '[]');
                            const custNotif = {
                              id: `NOTIF-${Date.now()}`,
                              type: 'RESERVATION_CONFIRMED',
                              title: `Table Confirmed at ${product.seller}`,
                              message: `Your booking for ${partySize} guests on ${reservationDate} (${reservationTime}) is confirmed. Ref: ${newBooking.id}`,
                              timestamp: new Date().toISOString(),
                              read: false
                            };
                            localStorage.setItem(`markat_notifs_${user?.id || 'guest'}`, JSON.stringify([custNotif, ...customerNotifs]));

                            // Seller notification
                            const sellerNotifs = JSON.parse(localStorage.getItem('markat_seller_notifications') || '[]');
                            const sNotif = {
                              id: `NOTIF-S-${Date.now()}`,
                              type: 'NEW_TABLE_RESERVATION',
                              title: `New Table Booking (${partySize} Guests)`,
                              message: `${user?.name || 'Customer'} reserved ${selectedPlan} for ${reservationDate} at ${reservationTime}. Ref: ${newBooking.id}`,
                              timestamp: new Date().toISOString(),
                              read: false
                            };
                            localStorage.setItem('markat_seller_notifications', JSON.stringify([sNotif, ...sellerNotifs]));

                            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                              new Notification(`Table Reserved at ${product.seller}`, {
                                body: `Confirmed for ${partySize} guests on ${reservationDate} (${reservationTime}). Booking ID: ${newBooking.id}`,
                                icon: '/logo.png'
                              });
                            }
                          } catch {
                            // ignore write error
                          }

                          alert(`🎉 Reservation Confirmed!\n\nBooking ID: ${newBooking.id}\nRestaurant: ${product.seller}\nParty Size: ${partySize} Guests\nDate: ${reservationDate}\nSlot: ${reservationTime}\nSetup: ${selectedPlan}\n\n✓ Instant SMS & WhatsApp notification sent to customer.\n✓ Live reservation alert dispatched to seller operations desk.`);
                        })}
                      >
                        <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <span className="truncate">
                          {diningMode === 'reserve'
                            ? `Confirm Table (${partySize} ${partySize === 1 ? 'Guest' : 'Guests'})`
                            : `Book Private Dining — ₹${currentActivePrice.toLocaleString('en-IN')}`}
                        </span>
                      </button>

                      <a
                        href="tel:+919876543210"
                        className="py-3 px-3 sm:px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 hover:text-slate-900 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 border border-slate-200 shrink-0 whitespace-nowrap"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Call Venue</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* ── APPOINTMENT BOOKING (Non-Dining Services) ── */}
              {hasAppointment && !hasToken && !isFoodDining && !isAutoWash && !isProfessional && !isOrganizer && (
                <div className="flex flex-col gap-3 w-full p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-blue-900 font-extrabold text-sm">Schedule an Appointment</span>
                    {activeOption && (
                      <span className="text-xs bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                        {activeOption.name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="date" className="flex-1 p-3 border border-blue-200 rounded-xl outline-none focus:border-blue-500 text-slate-700 bg-white shadow-sm font-medium" />
                    <input type="time" className="flex-1 p-3 border border-blue-200 rounded-xl outline-none focus:border-blue-500 text-slate-700 bg-white shadow-sm font-medium" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      className="flex-1 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm sm:text-base transition-colors shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => requireAuth(() => alert(`Appointment request for "${activeOption ? activeOption.name : product.name}" sent to ${product.seller}! You will receive a confirmation shortly.`))}
                    >
                      <CalendarClock className="w-4 h-4" /> Book Appointment
                    </button>
                    <a
                      href={`tel:${product.contactPhone || product.sellerPhone || '+919876543210'}`}
                      className="py-3.5 sm:py-4 px-4 sm:px-5 bg-white hover:bg-blue-50 text-blue-900 font-bold text-sm sm:text-base rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-blue-200 shrink-0 whitespace-nowrap cursor-pointer shadow-xs"
                      title={`Call ${product.seller}`}
                    >
                      <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>
              )}

              {/* ── VEHICLE TEST DRIVE / ENQUIRY ── */}
              {hasVehicleTestDrive && (
                <div className="flex flex-col gap-3 w-full p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div className="text-red-800 font-bold text-sm mb-1">Schedule a Test Drive / Enquiry</div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="date" className="flex-1 p-3 border border-red-200 rounded-xl outline-none focus:border-red-500 text-slate-700 bg-white shadow-sm" />
                    <input type="text" placeholder="Your Phone Number" className="flex-1 p-3 border border-red-200 rounded-xl outline-none focus:border-red-500 text-slate-700 bg-white shadow-sm" />
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 px-4 py-3 bg-white border-2 border-red-200 hover:border-red-500 hover:bg-red-50 text-red-700 rounded-xl font-bold text-sm transition-colors"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Get Price Quote
                    </button>
                    <button
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-red-600/20"
                      onClick={() => requireAuth(() => alert(`Test drive request sent to ${product.seller}! They will contact you to confirm.`))}
                    >
                      Schedule Test Drive
                    </button>
                  </div>
                </div>
              )}

              {/* ── WHOLESALE / B2B (tiers shown in price card above) ── */}
              {isWholesaleConfig && !hasToken && !hasAppointment && !hasVehicleTestDrive && (
                <div className="flex flex-col w-full gap-5">
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="w-full sm:w-auto flex items-center shrink-0">
                      <span className="text-sm font-bold text-slate-600 mr-3">Bundle:</span>
                      <select
                        className="h-[48px] px-4 font-bold text-slate-800 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500 cursor-pointer shadow-sm w-full sm:w-auto"
                        value={rfqQuantity}
                        onChange={(e) => { setRfqQuantity(e.target.value === '' ? '' : parseInt(e.target.value)); setBundleMultiplier(1); }}
                      >
                        {isRetail && isElite && <option value={1}>1 Unit (Retail)</option>}
                        {product.wholesaleTiers && product.wholesaleTiers.length > 0 ? (
                          product.wholesaleTiers.map((tier, idx) => (
                            <option key={idx} value={tier.minQty}>{tier.minQty}-Pack Bundle</option>
                          ))
                        ) : (
                          <>
                            <option value={12}>12-Pack Bundle</option>
                            <option value={100}>100-Pack Bundle</option>
                            <option value={150}>150-Pack Bundle</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="w-full sm:w-auto flex items-center sm:ml-4 shrink-0">
                      <span className="text-sm font-bold text-slate-600 mr-3">Qty:</span>
                      <div className="flex items-center bg-white border border-slate-300 rounded-xl h-[48px] overflow-hidden shadow-sm">
                        <button className="px-4 text-xl font-medium text-slate-500 hover:bg-slate-50 h-full transition-colors border-r border-slate-200" onClick={() => setBundleMultiplier(q => Math.max(1, q - 1))}>-</button>
                        <input type="number" min="1" className="w-16 text-center font-bold text-slate-800 outline-none border-none h-full bg-transparent p-0 m-0" value={bundleMultiplier} onChange={(e) => setBundleMultiplier(Math.max(1, parseInt(e.target.value) || 1))} />
                        <button className="px-4 text-xl font-medium text-slate-500 hover:bg-slate-50 h-full transition-colors border-l border-slate-200" onClick={() => setBundleMultiplier(q => q + 1)}>+</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {isRetail && isElite ? (
                      <button
                        className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 hover:border-amber-500 hover:bg-amber-50 text-slate-800 rounded-xl font-bold text-base transition-colors"
                        onClick={() => requireAuth(() => { addToCart(product); alert(`Added ${rfqQuantity} of ${product.name} to cart!`); })}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <button
                        className="flex-1 px-6 py-4 bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-700 rounded-xl font-bold text-base transition-colors"
                        onClick={() => requireAuth(() => setIsModalOpen(true))}
                      >
                        Contact Supplier
                      </button>
                    )}
                    <div className="flex-1 flex flex-col gap-2">
                      <button
                        className={`w-full px-6 py-4 text-white rounded-xl font-bold text-base transition-colors shadow-md ${isRetail && isElite ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
                        onClick={() => requireAuth(() => { if (isRetail && isElite) { alert(`Proceeding to checkout for ${(Number(rfqQuantity) || 1) * bundleMultiplier} units...`); } else { setIsModalOpen(true); } })}
                      >
                        {isRetail && isElite ? 'Buy Wholesale Now' : 'Request Quote'}
                      </button>
                      <div className="text-sm font-bold text-slate-700 text-center bg-slate-100 rounded-lg py-3 mt-1 border border-slate-200">
                        Total Estimate: <span className={isRetail && isElite ? 'text-amber-600 ml-1 text-lg' : 'text-blue-700 ml-1 text-lg'}>&#8377;{(currentActivePrice * (Number(rfqQuantity) || 1) * bundleMultiplier).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── RFQ / QUOTE (no wholesale tiers) ── */}
              {hasRFQ && !isWholesaleConfig && !hasToken && !hasAppointment && !hasVehicleTestDrive && (
                <div className="flex flex-col gap-3 w-full p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="text-amber-900 font-bold text-sm mb-1">Request for Quotation</div>
                  <div className="flex gap-2 items-center bg-white border border-amber-200 p-2 rounded-xl shadow-sm">
                    <label className="text-xs font-semibold text-slate-600 px-2 whitespace-nowrap">Qty Needed:</label>
                    <input type="number" value={rfqQuantity} onChange={e => setRfqQuantity(e.target.value === '' ? '' : parseInt(e.target.value))} min="1" className="flex-1 p-2 outline-none text-slate-800 font-bold bg-transparent" />
                  </div>
                  <textarea
                    value={rfqMessage}
                    onChange={e => setRfqMessage(e.target.value)}
                    placeholder="Describe your requirements, timeline, and any special needs..."
                    rows={2}
                    className="w-full p-3 border border-amber-200 rounded-xl outline-none focus:border-amber-500 text-slate-700 bg-white shadow-sm resize-none"
                  />
                  <button
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-lg transition-colors shadow-md shadow-amber-500/20 mt-1"
                    onClick={submitRfq}
                  >
                    Send RFQ
                  </button>
                </div>
              )}

              {/* ── SERVICE ORGANIZER / EVENT PLANNER CUSTOMER WORKFLOW ── */}
              {isOrganizer && (
                <div className="flex flex-col gap-4 w-full p-5 bg-gradient-to-br from-fuchsia-50 via-purple-50 to-indigo-50 rounded-2xl border border-fuchsia-200/80 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-fuchsia-200/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-fuchsia-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        {organizerBookingMode === 'appointment' ? <CalendarClock className="w-4 h-4" /> : <PartyPopper className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-slate-900 font-extrabold text-sm block">
                          {organizerBookingMode === 'appointment' ? 'Schedule an Appointment' : 'Event Planning & Organization'}
                        </span>
                        <span className="text-[11px] text-fuchsia-700 font-semibold">
                          {organizerBookingMode === 'appointment'
                            ? 'Book direct consultation or on-site meeting • Zero fee'
                            : 'Custom proposals • Venue & stage design • Zero booking fee'}
                        </span>
                      </div>
                    </div>

                    {/* Segmented Switcher matching Image 2 style */}
                    <div className="grid grid-cols-2 sm:inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setOrganizerBookingMode('appointment')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          organizerBookingMode === 'appointment'
                            ? 'bg-white text-fuchsia-700 shadow-xs border border-slate-200/60'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <CalendarClock className="w-3.5 h-3.5 text-fuchsia-600" />
                        <span>Appointment</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrganizerBookingMode('proposal')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          organizerBookingMode === 'proposal'
                            ? 'bg-white text-fuchsia-700 shadow-xs border border-slate-200/60'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Custom Proposal</span>
                      </button>
                    </div>
                  </div>

                  {/* ── TAB 1: SCHEDULE AN APPOINTMENT ── */}
                  {organizerBookingMode === 'appointment' && (
                    <div className="flex flex-col gap-3.5 animate-in fade-in">
                      {activeOption && (
                        <div className="flex items-center justify-between text-xs font-bold text-fuchsia-950 bg-white/80 px-3 py-2 rounded-xl border border-fuchsia-200/70 shadow-2xs">
                          <span className="text-slate-600 font-medium">Selected Package:</span>
                          <span className="bg-fuchsia-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                            {activeOption.name}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <div className="flex-1">
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-fuchsia-600" /> Preferred Date
                          </label>
                          <input
                            type="date"
                            value={appointmentDate}
                            min={todayStr}
                            onChange={e => setAppointmentDate(e.target.value)}
                            className="w-full px-3 py-2.5 border border-purple-200 rounded-xl outline-none focus:border-fuchsia-500 text-slate-800 bg-white font-medium text-xs sm:text-sm shadow-2xs"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-fuchsia-600" /> Preferred Time
                          </label>
                          <input
                            type="time"
                            value={appointmentTime}
                            onChange={e => setAppointmentTime(e.target.value)}
                            className="w-full px-3 py-2.5 border border-purple-200 rounded-xl outline-none focus:border-fuchsia-500 text-slate-800 bg-white font-medium text-xs sm:text-sm shadow-2xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          className="flex-1 py-3.5 bg-fuchsia-600 hover:bg-fuchsia-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-md shadow-fuchsia-600/25 flex items-center justify-center gap-2 cursor-pointer"
                          onClick={() => requireAuth(() => {
                            if (!appointmentDate) {
                              alert('Please choose your preferred appointment date.');
                              return;
                            }

                            const apptId = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
                            try {
                              // Notification for seller
                              const sellerNotifs = JSON.parse(localStorage.getItem('markat_seller_notifications') || '[]');
                              sellerNotifs.unshift({
                                id: `NOTIF-S-${Date.now()}`,
                                type: 'NEW_APPOINTMENT_BOOKING',
                                title: `New Appointment with ${user?.name || 'Customer'}`,
                                message: `Booked for ${activeOption ? activeOption.name : product.name} on ${appointmentDate} at ${appointmentTime || 'Standard Hours'}. Ref: ${apptId}`,
                                timestamp: new Date().toISOString(),
                                read: false
                              });
                              localStorage.setItem('markat_seller_notifications', JSON.stringify(sellerNotifs));

                              // Notification for customer
                              const customerNotifs = JSON.parse(localStorage.getItem(`markat_notifs_${user?.id || 'guest'}`) || '[]');
                              customerNotifs.unshift({
                                id: `NOTIF-${Date.now()}`,
                                type: 'APPOINTMENT_CONFIRMED',
                                title: `Appointment Booked with ${product.seller}`,
                                message: `Your appointment on ${appointmentDate} at ${appointmentTime || 'Standard Hours'} has been scheduled. Ref: ${apptId}`,
                                timestamp: new Date().toISOString(),
                                read: false
                              });
                              localStorage.setItem(`markat_notifs_${user?.id || 'guest'}`, JSON.stringify(customerNotifs));
                            } catch { }

                            alert(`🎉 Appointment Requested!\n\nOrganizer: ${product.seller}\nService: ${activeOption ? activeOption.name : product.name}\nDate: ${appointmentDate}\nTime: ${appointmentTime || 'Standard Business Hours'}\nRef: ${apptId}\n\n✓ The organizer has received your request and will call you to confirm.`);
                          })}
                        >
                          <CalendarClock className="w-4 h-4" /> Book Appointment
                        </button>

                        <a
                          href={`tel:${product.contactPhone || product.sellerPhone || '+919876543210'}`}
                          className="py-3.5 px-4 sm:px-5 bg-white hover:bg-fuchsia-50 active:scale-[0.99] text-fuchsia-900 font-bold text-sm sm:text-base rounded-xl transition-all flex items-center justify-center gap-2 border border-fuchsia-200/90 shadow-xs shrink-0 whitespace-nowrap cursor-pointer hover:border-fuchsia-300 hover:shadow-sm"
                          title={`Direct Call: ${product.contactPhone || product.sellerPhone || '+91-9876543210'}`}
                        >
                          <PhoneCall className="w-4 h-4 text-fuchsia-600 shrink-0" />
                          <span>Call</span>
                          <span className="hidden sm:inline text-fuchsia-600/80 font-medium text-xs">
                            ({product.contactPhone || product.sellerPhone || '+91-9876543210'})
                          </span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* ── TAB 2: REQUEST CUSTOM PROPOSAL ── */}
                  {organizerBookingMode === 'proposal' && (
                    <>
                      {organizerSubmitted ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 animate-in fade-in">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <h4 className="font-bold text-emerald-900 text-sm">Inquiry Dispatched Successfully!</h4>
                          <p className="text-xs text-emerald-700">
                            {product.seller} will review your event requirements and connect with you on WhatsApp/Phone with a customized proposal.
                          </p>
                          <button
                            type="button"
                            onClick={() => setOrganizerSubmitted(false)}
                            className="text-xs text-emerald-800 font-bold underline mt-2 inline-block cursor-pointer"
                          >
                            Submit another requirement
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3.5 animate-in fade-in">
                          {/* Grid 1: Occasion & Event Date */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-fuchsia-600" /> Event / Occasion
                              </label>
                              <select
                                value={eventType}
                                onChange={e => setEventType(e.target.value)}
                                className="w-full px-3 py-2.5 border border-purple-200 rounded-xl outline-none focus:border-fuchsia-500 text-slate-800 bg-white font-medium text-xs sm:text-sm shadow-2xs"
                              >
                                <option value="Wedding & Reception">Wedding & Reception</option>
                                <option value="Engagement / Sangeet / Haldi">Engagement / Sangeet / Haldi</option>
                                <option value="Corporate Conference / Gala">Corporate Conference / Gala</option>
                                <option value="Birthday & Anniversary Party">Birthday & Anniversary Party</option>
                                <option value="Concert & Stage Show">Concert & Stage Show</option>
                                <option value="Exhibition & Brand Launch">Exhibition & Brand Launch</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-fuchsia-600" /> Expected Date
                              </label>
                              <input
                                type="date"
                                value={eventDate}
                                min={todayStr}
                                onChange={e => setEventDate(e.target.value)}
                                className="w-full px-3 py-2.5 border border-purple-200 rounded-xl outline-none focus:border-fuchsia-500 text-slate-800 bg-white font-medium text-xs sm:text-sm shadow-2xs"
                              />
                            </div>
                          </div>

                          {/* Grid 2: Guest Count & Estimated Budget */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-fuchsia-600" /> Expected Guests
                              </label>
                              <select
                                value={guestCount}
                                onChange={e => setGuestCount(e.target.value)}
                                className="w-full px-3 py-2.5 border border-purple-200 rounded-xl outline-none focus:border-fuchsia-500 text-slate-800 bg-white font-medium text-xs sm:text-sm shadow-2xs"
                              >
                                <option value="Under 50 Guests (Intimate)">Under 50 Guests (Intimate)</option>
                                <option value="50 - 150 Guests">50 - 150 Guests</option>
                                <option value="150 - 400 Guests">150 - 400 Guests</option>
                                <option value="400 - 1,000 Guests">400 - 1,000 Guests</option>
                                <option value="1,000+ Mega Gathering">1,000+ Mega Gathering</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-fuchsia-600" /> Event City / Venue
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Pune / Mumbai / Goa"
                                value={eventCity}
                                onChange={e => setEventCity(e.target.value)}
                                className="w-full px-3 py-2.5 border border-purple-200 rounded-xl outline-none focus:border-fuchsia-500 text-slate-800 bg-white font-medium text-xs sm:text-sm shadow-2xs"
                              />
                            </div>
                          </div>

                          {/* Requirement Notes */}
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-fuchsia-600" /> Specific Requirements & Vision
                            </label>
                            <textarea
                              rows={2}
                              value={rfqMessage}
                              onChange={e => setRfqMessage(e.target.value)}
                              placeholder="e.g. Need royal floral stage, sound setup, live catering arrangement for 2 days..."
                              className="w-full px-3 py-2 border border-purple-200 rounded-xl outline-none focus:border-fuchsia-500 text-slate-800 bg-white text-xs sm:text-sm resize-none shadow-2xs"
                            />
                          </div>

                          {/* Organizer CTAs */}
                          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                            <button
                              type="button"
                              className="flex-1 w-full py-3 px-4 bg-fuchsia-600 hover:bg-fuchsia-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-fuchsia-600/25 flex items-center justify-center gap-2 cursor-pointer"
                              onClick={() => requireAuth(() => {
                                if (!eventDate) {
                                  alert('Please provide the anticipated date for your event.');
                                  return;
                                }

                                const inquiry = {
                                  id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
                                  seller: product.seller,
                                  organizerItem: product.name,
                                  servicePackage: activeOption ? activeOption.name : 'Standard Full Production',
                                  eventType,
                                  eventDate,
                                  guestCount,
                                  eventCity: eventCity || product.location || 'Local Area',
                                  notes: rfqMessage || 'Comprehensive event organizing and management proposal requested.',
                                  customerName: user?.name || 'Customer',
                                  customerPhone: user?.phone || '+91 98765 43210',
                                  status: 'New Inquiry',
                                  timestamp: new Date().toISOString()
                                };

                                try {
                                  const existing = JSON.parse(localStorage.getItem('markat_event_proposals') || '[]');
                                  localStorage.setItem('markat_event_proposals', JSON.stringify([inquiry, ...existing]));

                                  // Customer notification
                                  const customerNotifs = JSON.parse(localStorage.getItem(`markat_notifs_${user?.id || 'guest'}`) || '[]');
                                  customerNotifs.unshift({
                                    id: `NOTIF-${Date.now()}`,
                                    type: 'EVENT_INQUIRY_SENT',
                                    title: `Proposal Request Sent to ${product.seller}`,
                                    message: `Your ${eventType} inquiry on ${eventDate} has been dispatched. Ref: ${inquiry.id}`,
                                    timestamp: new Date().toISOString(),
                                    read: false
                                  });
                                  localStorage.setItem(`markat_notifs_${user?.id || 'guest'}`, JSON.stringify(customerNotifs));

                                  // Seller notification
                                  const sellerNotifs = JSON.parse(localStorage.getItem('markat_seller_notifications') || '[]');
                                  sellerNotifs.unshift({
                                    id: `NOTIF-S-${Date.now()}`,
                                    type: 'NEW_EVENT_PROPOSAL_LEAD',
                                    title: `New Event Organizer Lead (${eventType})`,
                                    message: `${user?.name || 'Customer'} requested a quote for ${guestCount} on ${eventDate} in ${inquiry.eventCity}. Ref: ${inquiry.id}`,
                                    timestamp: new Date().toISOString(),
                                    read: false
                                  });
                                  localStorage.setItem('markat_seller_notifications', JSON.stringify(sellerNotifs));
                                } catch { }

                                setOrganizerSubmitted(true);
                                alert(`🎉 Event Planning Request Sent!\n\nInquiry ID: ${inquiry.id}\nOrganizer: ${product.seller}\nOccasion: ${eventType}\nDate: ${eventDate}\nEstimated Guests: ${guestCount}\nCity: ${inquiry.eventCity}\n\n✓ The organizer's event director will review your vision and send over photos, previous stage portfolios, and quotation.`);
                              })}
                            >
                              <Send className="w-3.5 h-3.5" /> Request Custom Proposal & Quote
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                                onClick={() => setOrganizerBookingMode('appointment')}
                              >
                                <CalendarClock className="w-3.5 h-3.5 text-fuchsia-600" /> Book Consultation
                              </button>
                              <a
                                href={`tel:${product.contactPhone || product.sellerPhone || '+919876543210'}`}
                                className="py-3 px-4 bg-white hover:bg-fuchsia-50 text-fuchsia-900 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 border border-fuchsia-200/90 shadow-2xs shrink-0 whitespace-nowrap cursor-pointer hover:border-fuchsia-300"
                                title={`Direct Call: ${product.contactPhone || product.sellerPhone || '+91-9876543210'}`}
                              >
                                <PhoneCall className="w-3.5 h-3.5 text-fuchsia-600 shrink-0" />
                                <span>Call</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── MEETING / PROPOSAL (Other non-organizer service verticals) ── */}
              {hasMeeting && !isOrganizer && !hasToken && !hasAppointment && !hasVehicleTestDrive && !isWholesaleConfig && !hasRFQ && (
                <div className="flex flex-col gap-3 w-full p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="text-indigo-800 font-bold text-sm mb-1">Request a Meeting / Proposal</div>
                  <div className="flex flex-row items-center gap-2.5 sm:gap-3">
                    <button
                      className="flex-1 py-3 px-3 sm:px-6 sm:py-4 bg-white border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-800 rounded-xl font-bold text-xs sm:text-base transition-colors truncate"
                      onClick={() => requireAuth(() => alert(`Requesting portfolio and quote from ${product.seller}...`))}
                    >
                      Request a Quote
                    </button>
                    <button
                      className="flex-1 py-3 px-3 sm:px-6 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-base transition-colors shadow-md shadow-indigo-600/20 truncate"
                      onClick={() => requireAuth(() => alert(`Connecting you with ${product.seller} to discuss your project.`))}
                    >
                      Schedule Meeting
                    </button>
                  </div>
                </div>
              )}

              {/* ── PRODUCT STOCK / RETAIL (Buy Now + Add to Cart - Horizontal both on mobile & desktop) ── */}
              {isRetail && !isOrganizer && !hasService && !isFoodDining && !hasToken && !hasAppointment && !hasVehicleTestDrive && !isWholesaleConfig && !isAutoWash && (
                <div className="flex flex-col gap-3.5 w-full pt-1">
                  {/* Quantity selector and In-Stock indicator */}
                  <div className="flex items-center justify-between pb-0.5 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setRetailQuantity(prev => Math.max(1, prev - 1))}
                          className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-extrabold text-base transition-colors cursor-pointer"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-black text-sm text-slate-900">{retailQuantity}</span>
                        <button
                          type="button"
                          onClick={() => setRetailQuantity(prev => Math.min(10, prev + 1))}
                          className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-extrabold text-base transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>In Stock • Ready to Dispatch</span>
                    </div>
                  </div>

                  {/* Delivery Location Pill */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5">
                    <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Free Delivery to <strong className="text-slate-900">{product.location || 'Your Location'}</strong> by <strong className="text-emerald-700">Tomorrow</strong></span>
                  </div>

                  {/* Buy Now & Add to Cart Buttons */}
                  <div className="flex flex-row items-center gap-2.5 sm:gap-4 w-full">
                    <button
                      className="flex-1 py-3 px-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] text-white rounded-xl font-black text-sm sm:text-base transition-all shadow-md shadow-amber-500/20 text-center cursor-pointer flex items-center justify-center gap-2"
                      onClick={() => {
                        for (let i = 0; i < retailQuantity; i++) {
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: currentActivePrice,
                            image: productImages[0]?.url || product.image,
                            category: product.category,
                            subcategory: product.subcategory,
                            sellerId: product.sellerId,
                            seller: product.seller,
                            location: product.location,
                            parameters: selectedVariants
                          });
                        }
                        router.push('/checkout');
                      }}
                    >
                      <Zap className="w-4 h-4 fill-white" /> Buy Now
                    </button>
                    <button
                      className="flex-1 py-3 px-3 sm:px-6 sm:py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-xl font-black text-sm sm:text-base transition-all shadow-md text-center cursor-pointer flex items-center justify-center gap-2"
                      onClick={() => {
                        for (let i = 0; i < retailQuantity; i++) {
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: currentActivePrice,
                            image: productImages[0]?.url || product.image,
                            category: product.category,
                            subcategory: product.subcategory,
                            sellerId: product.sellerId,
                            seller: product.seller,
                            location: product.location,
                            parameters: selectedVariants
                          });
                        }
                        toast.success(`Added ${retailQuantity > 1 ? `${retailQuantity}x ` : ''}${product.name} to cart!`, {
                          icon: '🛍️',
                          duration: 2500
                        });
                      }}
                    >
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              )}

              {/* ── SERVICE-ONLY ACTION FLOW (when not queue, not dining, not organizer, not autowash) ── */}
              {hasService && !isOrganizer && !isFoodDining && !isServiceQueue && !hasToken && !hasAppointment && !hasRFQ && !hasMeeting && !isRetail && !isAutoWash && (
                <div className="flex flex-col gap-3 w-full p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-teal-900">Direct Service Booking & Consultation</h4>
                      <p className="text-xs text-teal-700 font-medium">Connect directly with {product.seller} for on-demand appointment and service quote.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => requireAuth(() => {
                        const inquiry = {
                          id: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
                          seller: product.seller,
                          serviceName: product.name,
                          serviceRate: currentActivePrice,
                          customerName: user?.name || 'Customer',
                          customerPhone: user?.phone || '+91 98765 43210',
                          timestamp: new Date().toISOString()
                        };
                        try {
                          const existing = JSON.parse(localStorage.getItem('markat_service_bookings') || '[]');
                          localStorage.setItem('markat_service_bookings', JSON.stringify([inquiry, ...existing]));

                          const customerNotifs = JSON.parse(localStorage.getItem(`markat_notifs_${user?.id || 'guest'}`) || '[]');
                          customerNotifs.unshift({
                            id: `NOTIF-${Date.now()}`,
                            type: 'SERVICE_BOOKING_SENT',
                            title: `Booking Request Sent to ${product.seller}`,
                            message: `Inquiry for ${product.name} dispatched. Ref: ${inquiry.id}`,
                            timestamp: new Date().toISOString(),
                            read: false
                          });
                          localStorage.setItem(`markat_notifs_${user?.id || 'guest'}`, JSON.stringify(customerNotifs));
                        } catch { }
                        alert(`🎉 Booking Request Sent to ${product.seller}!\n\nReference ID: ${inquiry.id}\nService: ${product.name}\nEstimated Rate: ₹${currentActivePrice.toLocaleString('en-IN')}\n\n✓ The service specialist will contact you promptly.`);
                      })}
                    >
                      <CalendarClock className="w-4 h-4" /> Book Service Now
                    </button>
                    <a
                      href={`tel:${product.contactPhone || product.sellerPhone || '+919876543210'}`}
                      className="py-3 px-4 bg-white hover:bg-slate-50 text-teal-800 border border-teal-300 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
                      title={`Call ${product.seller}`}
                    >
                      <PhoneCall className="w-4 h-4 text-teal-600" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-3 sm:mb-4">
              {isFoodDining ? 'Dining & Table Guidelines' : isProfessional ? 'Professional Consultation Guidelines' : 'Quality & Service Assurance'}
            </h3>
            {isOrganizer ? (
              <ul className="pl-5 text-xs sm:text-sm text-slate-600 leading-relaxed sm:leading-loose list-disc space-y-1.5 sm:space-y-0">
                <li>Custom package estimate tailored to your venue, theme, and guest scale.</li>
                <li>Portfolio catalog, previous stage designs & reference videos shared upon inquiry.</li>
                <li>In-person or virtual consultation with senior event director included.</li>
                <li>Transparent milestone-based contracts with no hidden surcharges.</li>
                <li>Dedicated on-ground operations crew & sound/decor management on event day.</li>
              </ul>
            ) : isFoodDining ? (
              <ul className="pl-5 text-xs sm:text-sm text-slate-600 leading-relaxed sm:leading-loose list-disc space-y-1.5 sm:space-y-0">
                <li>Please arrive within 15 minutes of your reserved dining slot.</li>
                <li>Special dietary requests or seating preferences can be communicated at arrival.</li>
                <li>Dress code: Smart Casual / Formal as per restaurant policy.</li>
                <li>Cancellation or rescheduling available up to 2 hours in advance.</li>
                <li>Fresh ingredients prepared live by certified culinary chefs.</li>
              </ul>
            ) : isProfessional ? (
              <ul className="pl-5 text-xs sm:text-sm text-slate-600 leading-relaxed sm:leading-loose list-disc space-y-1.5 sm:space-y-0">
                <li>Strict Attorney-Client & Professional Privilege confidentiality maintained.</li>
                <li>In-Chamber appointments require bringing relevant case files or documentation.</li>
                <li>Video consultations are held over end-to-end encrypted Google Meet / Zoom links.</li>
                <li>Rescheduling is accommodated up to 2 hours prior to the booked slot.</li>
                <li>Professional advice is provided in accordance with applicable Bar & regulatory guidelines.</li>
              </ul>
            ) : (isServiceQueue || product?.primaryType === 'SERVICE') ? (
              <ul className="pl-5 text-xs sm:text-sm text-slate-600 leading-relaxed sm:leading-loose list-disc space-y-1.5 sm:space-y-0">
                <li>Please arrive 5 minutes prior to your booking.</li>
                <li>Rescheduling is allowed up to 1 hour before the time.</li>
                <li>Cancellations are subject to standard policies.</li>
                <li>Ensure you provide the correct contact details while booking.</li>
              </ul>
            ) : (
              <div className="space-y-4">
                {/* 4 Feature Trust Cards (One Line on Mobile & Desktop) */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                  <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center gap-1 sm:gap-1.5 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                    <span className="text-[9.5px] sm:text-[11px] font-bold text-slate-800 leading-tight">1 Year Warranty</span>
                    <span className="text-[8px] sm:text-[10px] text-slate-500 leading-tight line-clamp-1">Official Brand Coverage</span>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center gap-1 sm:gap-1.5 shadow-2xs">
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                    <span className="text-[9.5px] sm:text-[11px] font-bold text-slate-800 leading-tight">7-Day Return</span>
                    <span className="text-[8px] sm:text-[10px] text-slate-500 leading-tight line-clamp-1">Hassle-free Returns</span>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center gap-1 sm:gap-1.5 shadow-2xs">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                    <span className="text-[9.5px] sm:text-[11px] font-bold text-slate-800 leading-tight">Fast Delivery</span>
                    <span className="text-[8px] sm:text-[10px] text-slate-500 leading-tight line-clamp-1">Doorstep Shipping</span>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center gap-1 sm:gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
                    <span className="text-[9.5px] sm:text-[11px] font-bold text-slate-800 leading-tight">Cash on Delivery</span>
                    <span className="text-[8px] sm:text-[10px] text-slate-500 leading-tight line-clamp-1">Pay at Doorstep</span>
                  </div>
                </div>

                <ul className="pl-5 text-xs sm:text-sm text-slate-600 leading-relaxed list-disc space-y-1">
                  <li>100% Genuine product directly sourced and fulfilled by verified merchant <strong>{product.seller}</strong></li>
                  <li>Tamper-proof protective packaging ensuring your items arrive in sealed factory condition</li>
                  <li>Original manufacturer warranty card and documentation enclosed inside retail packaging</li>
                  <li>Multiple payment methods accepted: UPI, Debit/Credit Card, NetBanking & Cash on Delivery</li>
                </ul>
              </div>
            )}
          </div>

          {/* Sold By / Restaurant Venue Details Card (Mobile Flow) */}
          <div className="block lg:hidden mb-8 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {serviceBadge ? serviceBadge.label : (isServiceProduct(product) ? 'Service Provider' : 'Sold by')}
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 ${isFoodDining ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'} rounded-xl flex items-center justify-center shrink-0 border`}>
                  {isFoodDining ? <UtensilsCrossed className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                </div>
                <div>
                  <Link href={`/seller/${encodeURIComponent(product.seller)}`} className="no-underline">
                    <div className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1.5 flex-wrap">
                      {product.seller}
                      <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 font-bold tracking-tight">
                        <ShieldCheck className="w-2.5 h-2.5" /> Verified
                      </span>
                    </div>
                  </Link>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> <span className="truncate">{product.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication & Resource Links */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello! I am inquiring about "${product.name}" on MarkatVerse. Could you share more details and availability?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>WhatsApp</span>
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Call Store</span>
              </a>
              <Link
                href={`/shop/${encodeURIComponent((product.seller || 'unknown').toLowerCase().replace(/ /g, '-'))}`}
                className="flex items-center justify-center gap-1 py-2 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>Store Catalog & Hours →</span>
              </Link>
            </div>

            <div className="flex gap-6 mt-3.5 pt-3 border-t border-slate-100">
              <div>
                <div className="text-[10px] text-slate-500 font-medium mb-0.5">Seller Rating</div>
                <div className="font-bold text-amber-500 flex items-center gap-1 text-xs">
                  {product.rating || 'New'} <span className="text-slate-400 font-normal text-[10px] ml-0.5">({product.reviews || '0'} Reviews)</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-medium mb-0.5">Active Since</div>
                <div className="font-bold text-slate-900 text-xs">{new Date().getFullYear()}</div>
              </div>
            </div>
          </div>

          {/* ── PRODUCT SPECIFICATIONS & ALL DETAILS SEGMENT (Only for Retail/Physical Products, Removed for Service Providers) ── */}
          {!isServiceProviderItem && (
            <div className="mt-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-6 lg:p-8">
            
            {/* Header: Full-width Title & Subtitle */}
            <div className="pb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-600 uppercase tracking-widest mb-1">
                <Layers className="w-3.5 h-3.5" /> Product Specifications
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Specifications & Details
              </h2>
            </div>

            {/* Flipkart-Style Tab Navigation */}
            <div className="flex items-center gap-2 sm:gap-6 border-b border-slate-200 mt-3 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveDetailsTab('specs')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeDetailsTab === 'specs'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Specifications</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailsTab('overview')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeDetailsTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>Highlights & Description</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailsTab('box')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeDetailsTab === 'box'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>In The Box</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailsTab('warranty')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeDetailsTab === 'warranty'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Warranty & Policy</span>
              </button>
            </div>

            {/* Tab 1: Specifications (Flipkart Aligned Table Layout) */}
            {activeDetailsTab === 'specs' && (
              <div className="pt-5 space-y-6 animate-in fade-in duration-200">
                {/* General Information */}
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> General
                  </h3>
                  <div className="divide-y divide-slate-100">
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                      <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">Model Name</span>
                      <span className="sm:w-3/5 text-slate-900 font-semibold">{product.name}</span>
                    </div>
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                      <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">Brand</span>
                      <span className="sm:w-3/5 text-slate-900 font-semibold">{product.brand || product.seller}</span>
                    </div>
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                      <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">Category</span>
                      <span className="sm:w-3/5 text-slate-900 font-semibold">{product.category}</span>
                    </div>
                    {product.subcategory && (
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                        <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">Subcategory</span>
                        <span className="sm:w-3/5 text-slate-900 font-semibold">{product.subcategory}</span>
                      </div>
                    )}
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                      <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">Condition</span>
                      <span className="sm:w-3/5 text-emerald-700 font-bold">Brand New • Sealed</span>
                    </div>
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                      <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">Sold By</span>
                      <span className="sm:w-3/5 text-blue-700 font-bold">{product.seller}</span>
                    </div>
                    {(product as any).stock != null && (
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                        <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">Stock Availability</span>
                        <span className="sm:w-3/5 text-slate-900 font-semibold">{(product as any).stock} units ready to dispatch</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical / Parameters */}
                {product.parameters && Object.keys(product.parameters).length > 0 && (() => {
                  const excludedKeys = ['bookingmodel', 'bookingoptions', 'bookingoption', 'servicetype', 'flow', 'allowedfeatures', 'queueenabled'];
                  const publicSpecs = Object.entries(product.parameters).filter(([key]) => {
                    const cleaned = key.toLowerCase().replace(/[\s_-]/g, '');
                    return !excludedKeys.some(k => cleaned.includes(k) || k.includes(cleaned));
                  });

                  if (publicSpecs.length === 0) return null;

                  return (
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Product Details & Performance
                      </h3>
                      <div className="divide-y divide-slate-100">
                        {publicSpecs.map(([paramKey, paramVal]) => {
                          const displayVal = Array.isArray(paramVal)
                            ? paramVal.join(', ')
                            : typeof paramVal === 'object' && paramVal !== null
                              ? JSON.stringify(paramVal)
                              : String(paramVal);

                          return (
                            <div key={paramKey} className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                              <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">{paramKey}</span>
                              <span className="sm:w-3/5 text-slate-900 font-semibold break-words">{displayVal}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tab 2: Overview & Highlights */}
            {activeDetailsTab === 'overview' && (
              <div className="pt-5 space-y-5 animate-in fade-in duration-200">
                {product.description ? (
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" /> Description
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      {product.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500 italic">No additional description text provided.</p>
                )}

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Highlights</h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                      <span>Original Brand Certified Product with nationwide service warranty</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                      <span>Rigorous multi-point quality inspection prior to packaging</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                      <span>Quick doorstep dispatch with real-time transit tracking</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                      <span>Secure payment support including UPI, Net Banking, and Cash on Delivery</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 3: What's in the Box */}
            {activeDetailsTab === 'box' && (
              <div className="pt-5 animate-in fade-in duration-200">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-600" /> Package Contents
                </h3>
                <div className="divide-y divide-slate-100">
                  <div className="py-2.5 flex items-center gap-3 text-xs sm:text-sm text-slate-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1x {product.name}</span>
                  </div>
                  <div className="py-2.5 flex items-center gap-3 text-xs sm:text-sm text-slate-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Original Power Adapter & Charging / Connection Cable</span>
                  </div>
                  <div className="py-2.5 flex items-center gap-3 text-xs sm:text-sm text-slate-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quick Start Guide & User Documentation</span>
                  </div>
                  <div className="py-2.5 flex items-center gap-3 text-xs sm:text-sm text-slate-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Official Manufacturer Warranty Card & Tax Invoice</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Warranty & Policies (Flipkart Clean Table Layout) */}
            {activeDetailsTab === 'warranty' && (
              <div className="pt-5 space-y-4 animate-in fade-in duration-200">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Warranty Details & Return Policy
                </h3>
                <div className="divide-y divide-slate-100">
                  <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                    <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">Warranty Summary</span>
                    <span className="sm:w-3/5 text-slate-900 font-semibold">
                      {(product.parameters as any)?.Warranty || (product.parameters as any)?.['Warranty Period'] || '1 Year Standard Manufacturer Warranty'}
                    </span>
                  </div>
                  <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                    <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">Warranty Service Type</span>
                    <span className="sm:w-3/5 text-slate-900 font-semibold">
                      Authorized Brand Service Centers nationwide or Carry-in Service.
                    </span>
                  </div>
                  <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                    <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">Covered in Warranty</span>
                    <span className="sm:w-3/5 text-slate-900 font-semibold">
                      Manufacturing defects, internal hardware failure, and components malfunction.
                    </span>
                  </div>
                  <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                    <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">Not Covered in Warranty</span>
                    <span className="sm:w-3/5 text-slate-900 font-semibold">
                      Physical damage, liquid ingress, unauthorized tampering or electrical surge.
                    </span>
                  </div>
                  <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline text-xs sm:text-sm">
                    <span className="sm:w-2/5 text-slate-500 font-medium shrink-0">Return & Replacement</span>
                    <span className="sm:w-3/5 text-emerald-700 font-bold flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                      7 Days Replacement Policy (Quick doorstep reverse pickup)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* REVIEWS SECTION (Inside Right Column) */}
          <div className="mt-8">
            <ReviewsSection 
              entityId={product.id} 
              entityType={isServiceProviderItem ? "SERVICE" : "PRODUCT"} 
              initialRating={product.rating}
              initialReviewCount={product.reviews}
            />
          </div>

        </div>
      </div>

      {/* Bottom Section: Related Products */}
      <div className="mt-20 pt-10 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">More from {product.seller}</h2>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
          {displayedRelated.map(relatedItem => (
            <Link key={relatedItem.id} href={`/product/${relatedItem.id}`} target="_blank" rel="noopener noreferrer" className="no-underline group">
              <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition-colors shadow-sm group-hover:shadow-md">
                <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden mb-4 border border-slate-100">
                  {relatedItem.image ? (
                    <img src={relatedItem.image || "/hero-left-logo.png"} alt={relatedItem.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" />
                  ) : (
                    <Camera className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                  )}
                </div>
                <div className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">
                  {relatedItem.seller}
                </div>
                <div className="text-sm font-medium text-slate-800 mb-2 line-clamp-2 leading-tight">
                  {relatedItem.name}
                </div>
                <div className="text-lg font-bold text-slate-900">
                  ₹{relatedItem.price.toLocaleString('en-IN')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* RFQ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Request Quote</h3>
            <p className="text-sm text-slate-500 mb-6">Send an inquiry directly to {product.seller}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Required Quantity</label>
                <input
                  type="number"
                  value={rfqQuantity}
                  onChange={(e) => setRfqQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
                  min={product.moq || 1}
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
                {product.moq && <p className="text-xs text-amber-600 mt-1">Minimum Order Quantity is {product.moq}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message / Requirements</label>
                <textarea
                  value={rfqMessage}
                  onChange={(e) => setRfqMessage(e.target.value)}
                  placeholder="Describe your requirements, customisation needs, etc."
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 h-32 resize-none"
                />
              </div>
              <button
                onClick={submitRfq}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors shadow-md"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
