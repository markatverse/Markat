"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, useProducts } from '@/context/ProductContext';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, Share2 } from 'lucide-react';
import { getServiceBadge } from '@/utils/serviceBadges';

export default function ServiceDirectoryList({ products }: { products: Product[] }) {
  const router = useRouter();
  const { userLocation, userLat, userLng, radiusFilter, setRadiusFilter } = useProducts();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (products.length === 0) {
    return <div className="text-center p-10 text-slate-400">No service providers found.</div>;
  }

  // Sort by nearest
  const sortedProducts = [...products].sort((a, b) => {
    const aMatch = (a.location || '').toLowerCase().includes(userLocation.toLowerCase());
    const bMatch = (b.location || '').toLowerCase().includes(userLocation.toLowerCase());
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h2 className="text-xl font-bold text-slate-800">Available Services</h2>
        {userLat !== null && userLng !== null && (
          <div className="flex items-center gap-2 text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="text-slate-500 font-medium whitespace-nowrap">Distance:</span>
            <select 
              value={radiusFilter || ''} 
              onChange={(e) => setRadiusFilter(e.target.value ? Number(e.target.value) : null)}
              className="bg-transparent border-none outline-none text-slate-800 font-medium cursor-pointer"
            >
              <option value="">Admin Default</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
              <option value="50">Within 50 km</option>
              <option value="100">Within 100 km</option>
            </select>
          </div>
        )}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        {sortedProducts.map(product => (
        <div 
          key={product.id} 
          onClick={() => router.push(`/product/${product.id}`)} 
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-indigo-300 transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden group h-full"
        >
          {/* Status Bar for Premium */}
          {product.isPremium && (
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          )}

          {/* Quick Actions (Wishlist & Share) */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                toggleWishlist(product.id);
              }} 
              className={`w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-colors border border-slate-100 ${
                isInWishlist(product.id) ? 'text-red-500 bg-red-50' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'
              }`}
              title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className="w-4 h-4" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                const url = encodeURIComponent(`Check out ${product.name} on MarkatVerse: ${window.location.origin}/service/${product.id}`);
                window.open(`https://wa.me/?text=${url}`, '_blank');
              }} 
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 transition-colors border border-slate-100"
              title="Share on WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Shop / Service Image Banner */}
          <div className="w-full h-40 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-100 shrink-0">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                loading="lazy" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            ) : (
              <div className="w-full h-full relative">
                <img 
                  src={
                    product.category?.toLowerCase().includes('food') || product.category?.toLowerCase().includes('dining')
                      ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
                      : product.category?.toLowerCase().includes('beauty') || product.category?.toLowerCase().includes('salon')
                      ? 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
                      : product.category?.toLowerCase().includes('health') || product.category?.toLowerCase().includes('doctor')
                      ? 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80'
                      : 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
              {(() => {
                const serviceBadge = getServiceBadge(product);
                if (serviceBadge) {
                  return (
                    <span className="bg-black/65 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-xs">
                      <serviceBadge.icon className={`w-3 h-3 ${serviceBadge.color}`} />
                      <span>{serviceBadge.label}</span>
                    </span>
                  );
                }
                return (
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    {product.category}
                  </span>
                );
              })()}
              {product.isPremium && (
                <span className="text-[10px] font-bold text-white bg-emerald-600/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                  🎟️ Token
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2 line-clamp-2">
              {product.name}
            </h3>
            
            <div className="flex flex-col gap-1 text-sm text-slate-500">
              <Link href={`/shop/${encodeURIComponent(product.seller.toLowerCase().replace(/ /g, '-'))}`} onClick={(e) => e.stopPropagation()} className="hover:underline flex items-center gap-1 font-medium text-slate-700">
                <span>{product.seller}</span>
                <span className="text-[#10B981] text-[12px]" title="Verified Provider">🛡️</span>
              </Link>
              <span className="flex items-center gap-1 text-[11px]">📍 {product.location}</span>
            </div>
          </div>

          {/* Pricing & Action */}
          <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium uppercase">
                  {product.category === 'Home Services' ? 'Service Fee' : 'Starting from'}
                </span>
                <div className="font-bold text-xl text-slate-900 flex items-baseline gap-1">
                  ₹{(product.price ?? 0).toLocaleString('en-IN')}
                  {product.category === 'Home Services' && <span className="text-xs font-normal text-slate-500">/ hr</span>}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-amber-500 font-bold flex items-center gap-1 text-sm">
                  ★ {product.rating}
                </span>
                <span className="text-[10px] text-slate-500">{product.reviews} reviews</span>
              </div>
            </div>
            
            <button 
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm text-sm"
            >
              {product.category === 'Home Services' ? 'Book Home Visit' : product.isPremium ? 'Book Token' : 'View Details'}
            </button>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
