"use client";
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useProducts, useCategoryRules } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useUserTrends } from '@/hooks/useUserTrends';
import { ShieldCheck, Camera, Ruler, ZoomIn, Package, Star, Building2, MapPin, PhoneCall, CalendarClock, Heart, UtensilsCrossed, Users, Clock } from 'lucide-react';
import SmartQueueWidget from '@/components/SmartQueueWidget';
import ReviewsSection from '@/components/ReviewsSection';
import StarRating from '@/components/StarRating';
import AdvertisementWidget from '@/components/AdvertisementWidget';
import { isServiceProduct } from '@/utils/productSearch';

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
};
const API_URL = getApiUrl();

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { trackCategory, trackProductView } = useUserTrends();
  const { addToCart } = useCart();
  const { products, isLoading } = useProducts();
  const { user, updateUserRole, login } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rfqQuantity, setRfqQuantity] = useState<number | ''>(1);
  const [bundleMultiplier, setBundleMultiplier] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [rfqMessage, setRfqMessage] = useState('');
  
  const product = products.find(p => p.id === id);

  // ── Category Rules — from Admin Relationship Manager ──
  const rules = useCategoryRules(product?.category);
  const noRulesDefined = rules.allowedFeatures.length === 0;
  const hasProductStock    = rules.allows('Product Stock');
  const hasB2B             = rules.allows('B2B');
  const hasBulkPricing     = rules.allows('Bulk Pricing') || rules.allows('MOQ');
  const sellerBookingModel = (product?.parameters as any)?.bookingModel;
  const hasToken           = rules.allows('Token') || sellerBookingModel === 'TOKEN';
  const hasAppointment     = rules.allows('Appointment') || sellerBookingModel === 'APPOINTMENT';
  const hasRFQ             = rules.allows('RFQ') || rules.allows('Quote');
  const hasMeeting         = rules.allows('Meeting') || rules.isOptional('Meeting');
  const hasVehicleTestDrive = rules.allows('Vehicle Test Drive');
  const hasService         = rules.allows('Service') || product?.primaryType === 'SERVICE' || (product ? isServiceProduct(product) : false);


  const requireAuth = (action: () => void) => {
    if (!user) {
      router.push(`/login?redirect=/product/${id}`);
    } else {
      action();
    }
  };

  useEffect(() => {
    if (product) {
      trackCategory(product.category);
      trackProductView(product.id);
    }
  }, [product?.id, product?.category]);

  // Initialize RFQ quantity and variants
  useEffect(() => {
    if (product?.category === 'B2B' || product?.category === 'Construction Materials') {
      setRfqQuantity(12);
    }
    
    if (product?.parameters) {
      const initialVariants: Record<string, string> = {};
      Object.keys(product.parameters).forEach(key => {
        if (product.parameters![key].length > 0) {
          initialVariants[key] = product.parameters![key][0];
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
  const WALK_IN_CATEGORIES = ['salon', 'saloon', 'beauty', 'hair', 'barber', 'spa', 'nail', 'massage', 'pedicure', 'doctor', 'clinic', 'medical', 'hospital', 'dentist'];
  const isServiceQueue = product ? WALK_IN_CATEGORIES.some(c => product.category?.toLowerCase().includes(c) || product.subcategory?.toLowerCase().includes(c)) : false;

  const isFoodDining = product ? (
    product.category?.toLowerCase().includes('food') || 
    product.category?.toLowerCase().includes('dining') || 
    product.category?.toLowerCase().includes('restaurant') ||
    product.subcategory?.toLowerCase().includes('restaurant') ||
    product.subcategory?.toLowerCase().includes('dining') ||
    product.subcategory?.toLowerCase().includes('cafe')
  ) : false;

  const [partySize, setPartySize] = useState(2);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');

  const isRetail = (product?.primaryType === 'SERVICE' || isFoodDining) ? false : (noRulesDefined
    ? !['Services', 'Home Services', 'Organizers', 'Transport', 'Rentals', 'Subscriptions', 'B2B', 'Construction Materials'].includes(product?.category || '')
    : hasProductStock);
  const isWholesaleConfig = (product?.primaryType === 'SERVICE' || isFoodDining) ? false : (noRulesDefined
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

  if (isLoading) {
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-10 bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Product Not Found</h1>
        <Link href="/">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Go Back
          </button>
        </Link>
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
    <div className="max-w-[1400px] mx-auto p-6 lg:p-10 bg-white relative">
      
      <AdvertisementWidget position="PRODUCT_PAGE" className="mb-8" />
      
      {/* Top Section: Images and Details */}
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left: Product Image Gallery */}
        <div className="flex-1">
          {/* Main Image */}
          <div className="w-full h-[380px] sm:h-[480px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-500 border border-slate-200 overflow-hidden shadow-sm relative">
            {productImages[activeImage]?.url ? (
              <img 
                src={productImages[activeImage].url} 
                alt={product.name} 
                className={`w-full h-full ${isFoodDining ? 'object-cover' : 'object-contain p-4'}`} 
              />
            ) : (
              <>
                {productImages[activeImage]?.icon}
                <span className="text-lg font-medium">{productImages[activeImage]?.label}</span>
              </>
            )}
            {isFoodDining && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/20 text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-rose-400" /> Dining Venue
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
              {productImages.map((img, index) => (
                <div 
                  key={index} 
                  onClick={() => setActiveImage(index)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-slate-50 rounded-xl cursor-pointer flex flex-col items-center justify-center border-2 transition-all overflow-hidden shadow-sm
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
          
          {/* Sold By / Restaurant Venue Details Card */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 sm:mb-4">
              {isFoodDining ? 'Restaurant / Dining Venue' : (isServiceProduct(product) ? 'Service Provider' : 'Sold by')}
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
              <button className="hidden sm:block px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-sm transition-colors border border-slate-200 shrink-0">
                + Follow
              </button>
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

        {/* Right: Product Info & Actions */}
        <div className="flex-1">
          {/* Top Category and Badges Lockup (matching card design) */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {product.badge && (
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase shadow-xs ${
                product.badgeColor === 'badge-gold' ? 'bg-amber-400 text-slate-900' : 'bg-red-500 text-white'
              }`}>
                {product.badge}
              </span>
            )}

            {product.category && (
              <span className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 uppercase tracking-wide px-2.5 py-0.5 rounded-md">
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
              className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider ml-auto flex items-center gap-1"
            >
              <span>{product.seller || 'Verified Seller'}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            </Link>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-2 leading-tight">{product.name}</h1>
          
          <div className="text-slate-600 font-medium mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            {product._distance != null && product._distance !== Infinity ? `${product._distance.toFixed(1)} km away • ` : ''}
            {product.location || 'Location not provided'}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <StarRating rating={Number(product.rating || 0)} totalReviews={Number(product.reviews || 0)} compact={true} />
            </div>
            <button 
              onClick={() => requireAuth(() => toggleWishlist(product.id))}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors shadow-sm ${
                isInWishlist(product.id) 
                  ? 'border-red-200 bg-red-50 text-red-600' 
                  : 'border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
              <span className="text-sm font-bold">{isInWishlist(product.id) ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl mb-8 border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              {isFoodDining 
                ? 'Reservation / Dining Rate' 
                : (isServiceProduct(product) ? 'Service Rate' : 'Price')}
            </div>
            <div className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              {product.category === 'Organizers' ? (
                'Project Based'
              ) : (
                <>
                  ₹{currentActivePrice.toLocaleString('en-IN')}
                  {isFoodDining && <span className="text-base text-slate-500 font-semibold ml-1">/ table reservation</span>}
                  {product.category === 'Transport' && <span className="text-lg text-slate-500 font-medium ml-1">/ km</span>}
                  {isWholesaleConfig && <span className="text-lg text-slate-500 font-medium ml-1">/ unit</span>}
                  {isElite && isRetail && (
                    <span className="text-sm text-amber-700 bg-amber-100 border border-amber-200 px-2 py-1 rounded-md font-bold tracking-tight">Elite Rate</span>
                  )}
                </>
              )}
            </div>
            
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
                        const isActive = rfqQuantity >= tier.minQty && (!nextTier || rfqQuantity < nextTier.minQty);
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
            
            {activeOption ? (
              activeOption.discountPercentage && activeOption.discountPercentage > 0 ? (
                <>
                  <div className="text-slate-500 line-through mt-2 text-sm">
                    M.R.P: ₹{Math.round(activeOption.price / (1 - activeOption.discountPercentage / 100)).toLocaleString('en-IN')}
                  </div>
                  <div className="text-emerald-600 font-bold mt-1 text-sm">You Save: {activeOption.discountPercentage}% OFF</div>
                </>
              ) : null
            ) : (
              product.originalPrice > product.price && product.category !== 'Organizers' && (
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

            {(noRulesDefined ? !['Services', 'Home Services', 'Organizers', 'Transport', 'Rentals', 'Subscriptions', 'B2B', 'Construction Materials'].includes(product.category) : hasProductStock) && (
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400 shadow-lg shadow-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                <div className="flex flex-col relative z-10">
                  <span className="font-extrabold text-white text-lg flex items-center gap-2 tracking-wide">
                    <Star className="w-5 h-5 fill-white text-white drop-shadow-md" /> MarkatVerse Elite
                  </span>
                  <span className="text-sm text-white/90 mt-1 font-medium">
                    {isElite ? '✓ Elite Active: You unlocked wholesale bulk pricing!' : 'Unlock wholesale tiered pricing & direct seller contact.'}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    if (user && user.id) {
                      updateUserRole(user.id, isElite ? 'buyer' : 'elite');
                    } else {
                      login({ id: 'u4', name: 'Elite Buyer', phone: '8888888888', email: 'elite@example.com', role: 'elite', status: 'active' });
                    }
                  }}
                  className={`relative z-10 px-6 py-3 text-sm font-bold rounded-xl transition-all shadow-md shrink-0 ${isElite ? 'bg-white text-amber-700 hover:bg-slate-50' : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 border border-slate-700'}`}
                >
                  {isElite ? 'Elite Subscribed' : 'Join Elite Now'}
                </button>
              </div>
            )}
            
            {/* Dynamic Variant Selectors */}
            {product.options && product.options.length > 0 && (
              <div className="mt-8 space-y-6 pt-6 border-t border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                      {isFoodDining ? (
                        <>Seating / Table Type: <span className="text-rose-600 font-extrabold">{activeOption?.name || 'Standard Table'}</span></>
                      ) : isServiceQueue ? (
                        'Service Options'
                      ) : (
                        <>Booking Option: <span className="text-blue-600 font-extrabold">{activeOption?.name || 'Standard'}</span></>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.options.map(option => {
                      const isSelected = selectedOptionId === option.id;
                      return (
                        <div 
                          key={option.id}
                          onClick={() => setSelectedOptionId(option.id)}
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2 flex flex-col items-start gap-1 cursor-pointer ${
                            isSelected 
                              ? (isFoodDining ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20' : 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20')
                              : (isFoodDining ? 'bg-white text-slate-700 border-rose-100 hover:border-rose-300' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300')
                          }`}
                        >
                          <span>{option.name}</span>
                          {option.discountPercentage && option.discountPercentage > 0 && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${(!isServiceQueue && isSelected) ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
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
            
            {product.parameters && Object.keys(product.parameters).length > 0 && (
              <div className={`space-y-6 pt-6 border-t border-slate-200 ${product.options && product.options.length > 0 ? 'mt-6' : 'mt-8'}`}>
                {Object.entries(product.parameters).map(([paramName, options]) => (
                  <div key={paramName}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                        {paramName}: <span className="text-blue-600 font-extrabold">{selectedVariants[paramName]}</span>
                      </span>
                      {paramName.toLowerCase().includes('size') && (
                        <button className="text-xs font-bold text-blue-600 hover:underline">Size Guide</button>
                      )}
                    </div>
                    
                    <div className={paramName.toLowerCase() === 'color' ? "flex gap-3" : "flex flex-wrap gap-3"}>
                      {(Array.isArray(options) ? options : [options]).map(option => {
                        const isSelected = selectedVariants[paramName] === option;
                        
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
                              onClick={() => setSelectedVariants(prev => ({...prev, [paramName]: option}))}
                              className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${isSelected ? 'border-blue-600 ring-2 ring-blue-100 scale-110' : 'border-slate-300 hover:scale-105'}`}
                              style={{ backgroundColor: colorHex }}
                              title={option}
                            />
                          );
                        }
                        
                        // Default pill rendering for other variants
                        return (
                          <button 
                            key={option}
                            onClick={() => setSelectedVariants(prev => ({...prev, [paramName]: option}))}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* ── Workflow Badge ── */}
            {!noRulesDefined && rules.workflow && (
              <div className="mt-6 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow</span>
                <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full font-semibold">{rules.workflow}</span>
                {rules.optionalFeatures.length > 0 && (
                  <>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest ml-3">Optional:</span>
                    {rules.optionalFeatures.map(f => (
                      <span key={f} className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">{f}</span>
                    ))}
                  </>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-4">

              {/* ── TOKEN BOOKING ── */}
              {hasToken && (
                <SmartQueueWidget service={product} />
              )}

              {/* ── FOOD & DINING / RESTAURANT TABLE RESERVATION ── */}
              {isFoodDining && !hasToken && (
                <div className="flex flex-col gap-4 w-full p-5 sm:p-6 bg-gradient-to-br from-rose-50 via-amber-50/40 to-orange-50 rounded-2xl border-2 border-rose-200/80 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs">
                        <UtensilsCrossed className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-slate-900 font-extrabold text-base block">Reserve a Dining Table</span>
                        <span className="text-[11px] text-slate-500 font-medium">Instant confirmation with {product.seller}</span>
                      </div>
                    </div>
                    {activeOption && (
                      <span className="text-xs bg-rose-600 text-white font-bold px-3 py-1 rounded-full shadow-xs">
                        {activeOption.name}
                      </span>
                    )}
                  </div>

                  {/* Party Size Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-rose-500" /> Number of Guests / Party Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 6, 8, 10].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPartySize(num)}
                          className={`w-11 h-10 rounded-xl font-extrabold text-sm transition-all border ${
                            partySize === num
                              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : 'bg-white text-slate-700 border-rose-100 hover:border-rose-300'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date & Time Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">
                        Reservation Date
                      </label>
                      <input 
                        type="date" 
                        value={reservationDate}
                        onChange={e => setReservationDate(e.target.value)}
                        className="w-full p-3 border border-rose-200 rounded-xl outline-none focus:border-rose-500 text-slate-800 bg-white shadow-xs font-medium text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-rose-500" /> Preferred Seating
                      </label>
                      <select
                        value={reservationTime}
                        onChange={e => setReservationTime(e.target.value)}
                        className="w-full p-3 border border-rose-200 rounded-xl outline-none focus:border-rose-500 text-slate-800 bg-white shadow-xs font-medium text-sm"
                      >
                        <option value="">Select Time Slot</option>
                        {['12:30 PM (Lunch)', '01:30 PM (Lunch)', '07:00 PM (Dinner)', '07:45 PM (Dinner)', '08:30 PM (Prime Dinner)', '09:15 PM (Late Dining)'].map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dining Notice */}
                  <div className="bg-white/80 p-3 rounded-xl border border-rose-100 text-xs text-slate-600 flex items-center gap-2">
                    <span className="text-rose-500 font-bold">✓</span>
                    <span>Tables are reserved for 90 minutes. Please arrive on time.</span>
                  </div>

                  <button
                    className="w-full py-4 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl font-bold text-lg transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-3 mt-1 cursor-pointer"
                    onClick={() => requireAuth(() => {
                      const selectedPlan = activeOption ? activeOption.name : 'Standard Seating';
                      alert(`Table Confirmed! Table for ${partySize} guests (${selectedPlan}) requested at ${product.seller}. Confirmation SMS sent.`);
                    })}
                  >
                    <UtensilsCrossed className="w-5 h-5" /> Reserve Table for {partySize} {partySize === 1 ? 'Guest' : 'Guests'}
                  </button>

                  <button
                    className="w-full py-2 bg-transparent text-rose-700 hover:underline font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    onClick={() => alert(`Calling ${product.seller} at +91-9876543210 for table inquiries`)}
                  >
                    <PhoneCall className="w-4 h-4" /> Call Restaurant Directly (+91-9876543210)
                  </button>
                </div>
              )}

              {/* ── APPOINTMENT BOOKING (Non-Dining Services) ── */}
              {hasAppointment && !hasToken && !isFoodDining && (
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
                  <button
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors shadow-md shadow-blue-600/20 flex items-center justify-center gap-3 mt-1"
                    onClick={() => requireAuth(() => alert(`Appointment request for "${activeOption ? activeOption.name : product.name}" sent to ${product.seller}! You will receive a confirmation shortly.`))}
                  >
                    <CalendarClock className="w-6 h-6" /> Book Appointment
                  </button>
                  <button
                    className="w-full py-2 bg-transparent text-blue-700 hover:underline font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    onClick={() => alert(`Calling ${product.seller} at +91-9876543210`)}
                  >
                    <PhoneCall className="w-4 h-4" /> Prefer to Call? (+91-9876543210)
                  </button>
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
                        onClick={() => requireAuth(() => { if (isRetail && isElite) { alert(`Proceeding to checkout for ${rfqQuantity * bundleMultiplier} units...`); } else { setIsModalOpen(true); } })}
                      >
                        {isRetail && isElite ? 'Buy Wholesale Now' : 'Request Quote'}
                      </button>
                      <div className="text-sm font-bold text-slate-700 text-center bg-slate-100 rounded-lg py-3 mt-1 border border-slate-200">
                        Total Estimate: <span className={isRetail && isElite ? 'text-amber-600 ml-1 text-lg' : 'text-blue-700 ml-1 text-lg'}>&#8377;{(currentActivePrice * rfqQuantity * bundleMultiplier).toLocaleString('en-IN')}</span>
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

              {/* ── MEETING / PROPOSAL ── */}
              {hasMeeting && !hasToken && !hasAppointment && !hasVehicleTestDrive && !isWholesaleConfig && !hasRFQ && (
                <div className="flex flex-col gap-3 w-full p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="text-indigo-800 font-bold text-sm mb-1">Request a Meeting / Proposal</div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      className="flex-1 px-6 py-4 bg-white border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-800 rounded-xl font-bold text-base transition-colors"
                      onClick={() => requireAuth(() => alert(`Requesting portfolio and quote from ${product.seller}...`))}
                    >
                      Request a Quote
                    </button>
                    <button
                      className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-base transition-colors shadow-md shadow-indigo-600/20"
                      onClick={() => requireAuth(() => alert(`Connecting you with ${product.seller} to discuss your project.`))}
                    >
                      Schedule Meeting
                    </button>
                  </div>
                </div>
              )}

              {/* ── PRODUCT STOCK / RETAIL (Buy Now + Add to Cart) ── */}
              {(hasProductStock || noRulesDefined) && !isFoodDining && !hasToken && !hasAppointment && !hasVehicleTestDrive && !isWholesaleConfig && (
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    className="flex-1 px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-base transition-colors shadow-md shadow-amber-500/20"
                    onClick={() => requireAuth(() => {
                      addToCart(product);
                      router.push('/checkout');
                    })}
                  >
                    Buy Now
                  </button>
                  <button
                    className="flex-1 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base transition-colors shadow-md"
                    onClick={() => requireAuth(() => { addToCart(product); alert(`Added ${product.name} to cart!`); })}
                  >
                    Add to Cart
                  </button>
                </div>
              )}

              {/* ── SERVICE-ONLY FALLBACK (no other CTA applies) ── */}
              {hasService && !isFoodDining && !hasToken && !hasAppointment && !hasRFQ && !hasMeeting && !hasProductStock && !noRulesDefined && (
                <div className="flex flex-col gap-3 w-full">
                  <button
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg transition-colors shadow-md shadow-teal-600/20 flex items-center justify-center gap-3"
                    onClick={() => alert(`Call ${product.seller} at +91-9876543210`)}
                  >
                    <PhoneCall className="w-6 h-6 animate-pulse" /> Call to Book (+91-9876543210)
                  </button>
                </div>
              )}

            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {isFoodDining ? 'Dining & Table Guidelines' : 'Important Details'}
            </h3>
            <ul className="pl-5 text-slate-600 leading-loose list-disc">
              {isFoodDining ? (
                <>
                  <li>Please arrive within 15 minutes of your reserved dining slot.</li>
                  <li>Special dietary requests or seating preferences can be communicated at arrival.</li>
                  <li>Dress code: Smart Casual / Formal as per restaurant policy.</li>
                  <li>Cancellation or rescheduling available up to 2 hours in advance.</li>
                  <li>Fresh ingredients prepared live by certified culinary chefs.</li>
                </>
              ) : (isServiceQueue || product?.primaryType === 'SERVICE') ? (
                <>
                  <li>Please arrive 5 minutes prior to your booking.</li>
                  <li>Rescheduling is allowed up to 1 hour before the time.</li>
                  <li>Cancellations are subject to standard policies.</li>
                  <li>Ensure you provide the correct contact details while booking.</li>
                </>
              ) : (
                <>
                  <li>Premium build quality with durable materials</li>
                  <li>1 Year International Warranty included</li>
                  <li>7 Days Replacement Policy available</li>
                  <li>Free Express Shipping for Prime Members</li>
                  <li>Cash on Delivery eligible in your location</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <ReviewsSection entityId={product.id} entityType="PRODUCT" />

      {/* Bottom Section: Related Products */}
      <div className="mt-20 pt-10 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">More from {product.seller}</h2>
        
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
          {displayedRelated.map(relatedItem => (
            <Link key={relatedItem.id} href={`/product/${relatedItem.id}`} className="no-underline group">
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
