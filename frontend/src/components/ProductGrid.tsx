"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProducts, Product } from '@/context/ProductContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSettings } from '@/context/SettingsContext';
import { MapPin, Heart, Share2 } from 'lucide-react';

import { useUserTrends } from '@/hooks/useUserTrends';
import StarRating from './StarRating';
import ProductGridSkeleton from './ProductGridSkeleton';
import { isServiceProduct } from '@/utils/productSearch';

export default function ProductGrid({ products: propProducts, limit, category, personalized, recent, serviceOnly }: { products?: Product[], limit?: number, category?: string, personalized?: boolean, recent?: boolean, serviceOnly?: boolean }) {
  const { products: contextProducts, isLoading, userLocation, userLat, userLng, radiusFilter, setRadiusFilter } = useProducts();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { systemConfig } = useSettings();
  const { getTopCategories, trends } = useUserTrends();
  const router = useRouter();
  const [showLocationToast, setShowLocationToast] = useState(false);

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

  if (isLoading) {
    return <ProductGridSkeleton count={limit || 8} />;
  }

  if (finalProducts.length === 0) {
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
              </select>
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 sm:gap-4">
      {finalProducts.map(product => {
        const isService = isServiceProduct(product);
        const route = isService ? `/service/${product.id}` : `/product/${product.id}`;
        return (
        <div key={product.id} onClick={() => router.push(route)} className="cursor-pointer no-underline text-inherit group">
          <div className="bg-white rounded-xl p-3 sm:p-4 text-black relative h-full flex flex-col group-hover:-translate-y-1 transition-transform shadow-sm">
            {product.badge && (
              <div
                className={`absolute top-2.5 left-2.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-medium uppercase z-10 ${product.badgeColor === 'badge-gold' ? 'bg-amber-500 text-black' : 'bg-red-500 text-white'}`}
              >
                {product.badge}
              </div>
            )}
            <div className="w-full h-[140px] sm:h-[180px] bg-[#f1f5f9] rounded-lg mb-2 sm:mb-3 flex items-center justify-center overflow-hidden shrink-0 relative">
              {/* Quick Actions (Wishlist & Share) */}
              <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleWishlist(product.id);
                  }} 
                  className={`w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-colors ${
                    isInWishlist(product.id) ? 'text-red-500 bg-red-50' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'
                  }`}
                  title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    const url = encodeURIComponent(`Check out ${product.name} on MarkatVerse: ${window.location.origin}${route}`);
                    window.open(`https://wa.me/?text=${url}`, '_blank');
                  }} 
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              
              {product.image ? (
                <img src={product.image} alt={product.name} loading="lazy" className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${product._outOfRange ? 'grayscale opacity-70' : ''}`} />
              ) : (
                <img src="/hero-left-logo.png" alt={product.name} loading="lazy" className={`w-full h-full object-contain opacity-50 group-hover:scale-105 transition-transform duration-300 p-4 ${product._outOfRange ? 'grayscale' : ''}`} />
              )}
              {product._outOfRange && (
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px] z-10">
                  <span className="bg-slate-900/90 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-slate-700/50 shadow-lg flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-rose-400" /> Out of Range
                  </span>
                </div>
              )}
            </div>
            <div className="text-[9px] sm:text-[11px] text-blue-600 uppercase tracking-[0.5px] sm:tracking-[1px] font-medium flex items-center gap-1">
              <Link href={`/shop/${encodeURIComponent((product.seller || 'unknown').toLowerCase().replace(/ /g, '-'))}`} onClick={(e) => e.stopPropagation()} className="hover:underline truncate">
                <span>{product.seller || 'Unknown Seller'}</span>
              </Link>
            </div>
            <div className="font-medium text-xs sm:text-sm text-slate-800 mt-1 line-clamp-2 h-8 sm:h-10 leading-tight">
              {product.name}
            </div>
            <div className="mb-1 sm:mb-2">
              <div className="text-[9px] sm:text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 uppercase tracking-wider px-1.5 py-0.5 rounded truncate max-w-full inline-block">
                {product.category} {product.subcategory ? `› ${product.subcategory}` : ''}
              </div>
            </div>
            <div className="mt-auto">
              <div className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-1 sm:gap-2 flex-wrap">
                ₹{(product.price ?? 0).toLocaleString('en-IN')}
                {product.originalPrice != null && product.originalPrice > (product.price ?? 0) && (
                  <span className="text-[#94A3B8] line-through text-[9px] sm:text-[10px] font-normal">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                )}
                {product.discount && (
                  <span className="text-emerald-500 text-[9px] sm:text-[10px] font-medium">{product.discount}</span>
                )}
              </div>
              <div className="flex justify-between items-center mt-2 sm:mt-3 text-[9px] sm:text-[10px]">
                <div className="shrink-0 flex items-center">
                  <StarRating rating={Number(product.rating || 0)} totalReviews={Number(product.reviews || 0)} size={11} compact={true} />
                </div>
                <span className="text-gray-500 truncate text-right ml-1" title={product.location}>
                  {product._distance != null && product._distance !== Infinity ? `${product._distance.toFixed(1)} km • ` : ''}
                  {product.location}
                </span>
              </div>
            </div>
          </div>
        </div>
        );
      })}
    </div>
    </div>
  );
}
