"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProducts, Product } from '@/context/ProductContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSettings } from '@/context/SettingsContext';
import { MapPin, Heart, Share2, ShoppingBag, Calendar, CheckCircle2, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

import { useUserTrends } from '@/hooks/useUserTrends';
import StarRating from './StarRating';
import ProductGridSkeleton from './ProductGridSkeleton';
import { isServiceProduct } from '@/utils/productSearch';
import { getServiceBadge } from '@/utils/serviceBadges';

export default function ProductGrid({ 
  products: propProducts, 
  limit, 
  category, 
  personalized, 
  recent, 
  serviceOnly,
  productOnly,
  horizontal 
}: { 
  products?: Product[], 
  limit?: number, 
  category?: string, 
  personalized?: boolean, 
  recent?: boolean, 
  serviceOnly?: boolean,
  productOnly?: boolean,
  horizontal?: boolean 
}) {
  const { products: contextProducts, isLoading, userLocation, userLat, userLng, radiusFilter, setRadiusFilter } = useProducts();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { systemConfig } = useSettings();
  const { getTopCategories, trends } = useUserTrends();
  const router = useRouter();
  const [showLocationToast, setShowLocationToast] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isHorizontal = recent || horizontal;

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320 * (direction === 'left' ? -1 : 1);
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (contextProducts.length > 0 && !personalized && !recent) setShowLocationToast(true);
    const timer = setTimeout(() => setShowLocationToast(false), 3000);
    return () => clearTimeout(timer);
  }, [contextProducts, personalized, recent]);

  let items = propProducts || contextProducts;
  
  if (recent) {
    items = items.filter(p => trends.recentlyViewed.includes(p.id));
    items.sort((a, b) => trends.recentlyViewed.indexOf(a.id) - trends.recentlyViewed.indexOf(b.id));
  }
  
  const productsToRender = [...(items || [])].filter(p => {
    if (category && p.category !== category) return false;
    if (serviceOnly && !isServiceProduct(p)) return false;
    if (productOnly && isServiceProduct(p)) return false;
    return true;
  });

  if (!recent) {
    const topCategories = personalized ? getTopCategories() : [];
    
    // Sort by personalized category first, then nearest
    productsToRender.sort((a, b) => {
      if (personalized) {
        const aCatScore = topCategories.indexOf(a.category);
        const bCatScore = topCategories.indexOf(b.category);
        
        const aScore = aCatScore !== -1 ? topCategories.length - aCatScore : 0;
        const bScore = bCatScore !== -1 ? topCategories.length - bCatScore : 0;
        
        if (aScore !== bScore) {
          return bScore - aScore;
        }
      }

      if (a._distance !== undefined && b._distance !== undefined) {
        // Group into 2km buckets so similarly close shops compete on rating
        const distBucketA = Math.floor(a._distance / 2);
        const distBucketB = Math.floor(b._distance / 2);
        
        if (distBucketA !== distBucketB) {
          return distBucketA - distBucketB;
        } else {
          // If in the same distance bucket, sort by rating
          const ratingA = Number(a.rating || 0);
          const ratingB = Number(b.rating || 0);
          if (ratingA !== ratingB) {
            return ratingB - ratingA;
          }
          // If ratings are the same, sort by number of reviews
          const parseReviews = (str: string) => {
            if (!str) return 0;
            const num = parseFloat(str.replace(/[^0-9.]/g, ''));
            if (str.toLowerCase().includes('k')) return num * 1000;
            if (str.toLowerCase().includes('m')) return num * 1000000;
            return num;
          };
          return parseReviews(b.reviews || '0') - parseReviews(a.reviews || '0');
        }
      }

      const aMatch = (a.location || '').toLowerCase().includes(userLocation.toLowerCase());
      const bMatch = (b.location || '').toLowerCase().includes(userLocation.toLowerCase());
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }

  // Limit items if specified
  const finalProducts = limit ? productsToRender.slice(0, limit) : productsToRender;

  if (!mounted || isLoading) {
    if (isHorizontal) {
      return (
        <div className="flex gap-3 sm:gap-4 overflow-hidden py-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[185px] sm:w-[220px] shrink-0 bg-slate-100 animate-pulse rounded-2xl h-[280px]" />
          ))}
        </div>
      );
    }
    return <ProductGridSkeleton count={limit || 8} />;
  }

  if (finalProducts.length === 0) {
    if (recent) {
      return (
        <div className="py-8 px-4 text-center text-slate-400 text-xs sm:text-sm bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl">
          Items you recently viewed will appear here.
        </div>
      );
    }
    return <div className="text-center p-10 text-slate-400">No {serviceOnly ? 'services' : 'products'} found.</div>;
  }

  return (
    <div className="relative">
      {showLocationToast && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border border-blue-100">
            <MapPin className="w-4 h-4 text-blue-600" />
            Showing nearest results to {userLocation}
          </div>
          
          {userLat !== null && userLng !== null && (
            <div className="flex items-center gap-2 text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="text-slate-500 font-medium whitespace-nowrap">Distance:</span>
              <select 
                value={radiusFilter || ''} 
                onChange={(e) => setRadiusFilter(e.target.value ? Number(e.target.value) : null)}
                className="bg-transparent border-none outline-none text-slate-800 font-medium cursor-pointer"
              >
                <option value="">Admin Default ({systemConfig?.searchRadius || 50} km)</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                {(!systemConfig?.strictRadius || (systemConfig?.searchRadius || 50) >= 50) && <option value="50">Within 50 km</option>}
                {(!systemConfig?.strictRadius || (systemConfig?.searchRadius || 50) >= 100) && <option value="100">Within 100 km</option>}
                {(!systemConfig?.strictRadius || (systemConfig?.searchRadius || 50) >= 250) && <option value="250">Within 250 km</option>}
                {(!systemConfig?.strictRadius || (systemConfig?.searchRadius || 50) >= 500) && <option value="500">Within 500 km</option>}
                {(!systemConfig?.strictRadius || (systemConfig?.searchRadius || 50) >= 1000) && <option value="1000">Within 1000 km</option>}
              </select>
            </div>
          )}
        </div>
      )}
      <div className="relative group/carousel">
        {isHorizontal && finalProducts.length > 2 && (
          <button
            type="button"
            onClick={() => scrollCarousel('left')}
            className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-slate-50 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div 
          ref={isHorizontal ? scrollContainerRef : undefined}
          className={
            isHorizontal 
              ? "flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 px-1 snap-x snap-mandatory scroll-smooth no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              : "grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-4"
          }
        >
        {finalProducts.map(product => {
          const isService = !productOnly && (serviceOnly || isServiceProduct(product));
          const route = `/product/${product.id}`;
          return (
          <div 
            key={product.id} 
            onClick={() => router.push(route)} 
            className={`${isHorizontal ? 'w-[185px] sm:w-[220px] shrink-0 snap-start' : ''} cursor-pointer no-underline text-inherit group`}
          >
          <div className="bg-white rounded-2xl p-2.5 sm:p-3.5 text-slate-900 relative h-full flex flex-col border border-slate-100 hover:border-blue-200 group-hover:-translate-y-1 transition-all duration-200 shadow-xs hover:shadow-md">
            
            {/* Top Badges (New Arrival / Discount / Premium) */}
            <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1 items-start">
              {product.badge && (
                <span className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase shadow-xs ${
                  product.badgeColor === 'badge-gold' ? 'bg-amber-400 text-slate-900' : 'bg-red-500 text-white'
                }`}>
                  {product.badge}
                </span>
              )}
              {(() => {
                if (productOnly) return null;
                const serviceBadge = getServiceBadge(product);
                if (serviceBadge) {
                  return (
                    <span className="bg-black/65 backdrop-blur-md border border-white/20 text-white px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-xs">
                      <serviceBadge.icon className={`w-2.5 h-2.5 ${serviceBadge.color}`} />
                      <span>{serviceBadge.label}</span>
                    </span>
                  );
                }
                if (isService) {
                  return (
                    <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase bg-purple-600 text-white shadow-xs flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" /> Bookable
                    </span>
                  );
                }
                return null;
              })()}
            </div>

            {/* Product Image Frame */}
            <div className="w-full h-[150px] sm:h-[185px] bg-slate-50 rounded-xl mb-2.5 flex items-center justify-center overflow-hidden shrink-0 relative border border-slate-100/60">
              {/* Quick Actions (Wishlist & Share) */}
              <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleWishlist(product.id);
                  }} 
                  className={`w-7 h-7 sm:w-8 sm:h-8 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-slate-200/50 transition-colors ${
                    isInWishlist(product.id) ? 'text-rose-500 bg-rose-50' : 'text-slate-500 hover:text-rose-500 hover:bg-rose-50'
                  }`}
                  title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className="w-3.5 h-3.5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    const url = encodeURIComponent(`Check out ${product.name} on MarkatVerse: ${window.location.origin}${route}`);
                    window.open(`https://wa.me/?text=${url}`, '_blank');
                  }} 
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-slate-200/50 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {product.image ? (
                <img src={product.image} alt={product.name} loading="lazy" className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${product._outOfRange ? 'grayscale opacity-70' : ''}`} />
              ) : (
                <img src="/hero-left-logo.png" alt={product.name} loading="lazy" className={`w-full h-full object-contain opacity-40 group-hover:scale-105 transition-transform duration-300 p-4 ${product._outOfRange ? 'grayscale' : ''}`} />
              )}

              {product._outOfRange && (
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px] z-10">
                  <span className="bg-slate-900/90 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-slate-700/50 shadow-lg flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-rose-400" /> Out of Range
                  </span>
                </div>
              )}
            </div>

            {/* Seller Line & Verification */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1">
              <Link 
                href={`/shop/${encodeURIComponent((product.seller || 'unknown').toLowerCase().replace(/ /g, '-'))}`} 
                onClick={(e) => e.stopPropagation()} 
                className="text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider flex items-center gap-1 truncate max-w-[80%]"
              >
                <span className="truncate">{product.seller || 'Verified Seller'}</span>
                <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
              </Link>

              {/* Distance Pill */}
              {product._distance != null && product._distance !== Infinity && (
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                  {product._distance < 1 ? '<1 km' : `${product._distance.toFixed(1)} km`}
                </span>
              )}
            </div>

            {/* Product Title */}
            <div className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-2 h-8 sm:h-10 leading-snug mb-1.5 group-hover:text-blue-600 transition-colors">
              {product.name}
            </div>

            {/* Category / Subcategory Tag */}
            <div className="mb-2">
              <span className="text-[9px] sm:text-[10px] font-semibold text-indigo-700 bg-indigo-50/80 border border-indigo-100 uppercase tracking-wide px-2 py-0.5 rounded-md truncate max-w-full inline-block">
                {product.category} {product.subcategory ? `› ${product.subcategory}` : ''}
              </span>
            </div>

            {/* Price & Rating Section */}
            <div className="mt-auto pt-2 border-t border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-1 flex-wrap">
                <div className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                  <span>₹{(product.price ?? 0).toLocaleString('en-IN')}</span>
                  {product.originalPrice != null && product.originalPrice > (product.price ?? 0) && (
                    <span className="text-slate-400 line-through text-[10px] sm:text-xs font-normal">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {product.discount && (
                  <span className="text-emerald-600 text-[10px] sm:text-[11px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    {product.discount}
                  </span>
                )}
              </div>

              {/* Rating and Direct Add / Book Button */}
              <div className="flex items-center justify-between gap-1 text-[10px]">
                <div className="shrink-0 flex items-center">
                  <StarRating rating={Number(product.rating || 0)} totalReviews={Number(product.reviews || 0)} size={11} compact={true} />
                </div>

                {isService ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(route);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center gap-1 transition-colors"
                  >
                    <Calendar className="w-2.5 h-2.5" /> Book Now
                  </button>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const added = addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        category: product.category,
                        sellerId: product.sellerId,
                      });
                      if (added) {
                        toast.success(`Added ${product.name} to cart!`, { duration: 1800 });
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                  >
                    <ShoppingBag className="w-2.5 h-2.5" /> Add
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
        );
      })}
        </div>

        {isHorizontal && finalProducts.length > 2 && (
          <button
            type="button"
            onClick={() => scrollCarousel('right')}
            className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-slate-50 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
