"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  MapPin, 
  Search, 
  PlusCircle, 
  MessageCircle, 
  ShieldCheck, 
  ArrowRight, 
  Package, 
  Tag, 
  Phone, 
  X,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useProducts, Product } from '@/context/ProductContext';

const C2C_CATEGORIES = [
  { id: 'all', label: 'All Pre-Owned' },
  { id: 'electronics', label: 'Mobiles & Gadgets' },
  { id: 'vehicles', label: 'Bikes & Cars' },
  { id: 'furniture', label: 'Furniture & Home' },
  { id: 'fashion', label: 'Fashion & Wardrobe' },
  { id: 'books', label: 'Books & Hobbies' },
];

export default function C2CCommunityPage() {
  const { products, userLocation, isLoading } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Contact Seller Modal
  const [contactProduct, setContactProduct] = useState<Product | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [postAdModal, setPostAdModal] = useState(false);
  const [adSuccess, setAdSuccess] = useState(false);

  // Filter listings
  const c2cListings = useMemo(() => {
    return products.filter(p => {
      // Exclude pure B2B wholesale listings
      if (p.isB2B && (p.moq || 1) > 2) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        if (selectedCategory === 'electronics' && !cat.includes('electr') && !sub.includes('mobile') && !sub.includes('gadget')) return false;
        if (selectedCategory === 'vehicles' && !cat.includes('vehicle') && !cat.includes('car') && !cat.includes('bike')) return false;
        if (selectedCategory === 'furniture' && !cat.includes('home') && !cat.includes('furniture')) return false;
        if (selectedCategory === 'fashion' && !cat.includes('fashion') && !cat.includes('cloth') && !cat.includes('shirt')) return false;
        if (selectedCategory === 'books' && !cat.includes('book') && !cat.includes('hobbi')) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchSeller = (p.seller || '').toLowerCase().includes(q);
        const matchLoc = (p.location || '').toLowerCase().includes(q);
        if (!matchName && !matchSeller && !matchLoc) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleContact = (product: Product) => {
    setContactProduct(product);
    setCopiedPhone(false);
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-4 tracking-wide uppercase">
                <Users className="w-3.5 h-3.5" />
                Community & Peer-to-Peer Hub
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Buy, Sell & Trade Locally With Neighbors
              </h1>
              <p className="mt-3 text-base sm:text-lg text-emerald-100 leading-relaxed">
                Connect directly with nearby people in {userLocation || 'your city'}. Zero middlemen fees, verified seller profiles, and safe in-person meetups.
              </p>
            </div>

            {/* Post Ad Button */}
            <button
              onClick={() => { setPostAdModal(true); setAdSuccess(false); }}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              Post Free Listing
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-8 max-w-4xl bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pre-owned iPhones, bicycles, sofa sets, guitars, books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto px-2 text-xs text-emerald-200">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{userLocation || 'Nationwide'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {C2C_CATEGORIES.map(cat => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-800">{c2cListings.length}</span> community items
          </div>
          <Link href="/" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Back to Marketplace <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading && c2cListings.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse space-y-3">
                <div className="w-full h-44 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : c2cListings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Items in this Category</h3>
            <p className="text-sm text-slate-500 mb-6">
              Be the first neighbor to post a pre-owned listing in this category!
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
            >
              Browse All Listings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {c2cListings.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden group hover:-translate-y-1"
              >
                <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Package className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-emerald-700/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                    <Tag className="w-3 h-3" />
                    Pre-Owned
                  </div>

                  {p.rating && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                      ★ {p.rating}
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
                      {p.category || 'General'}
                    </div>

                    <Link href={`/product/${p.id}`} className="hover:underline">
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                        {p.name}
                      </h4>
                    </Link>

                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      {p.originalPrice > p.price && (
                        <span className="text-xs text-slate-400 line-through ml-auto">
                          New: ₹{p.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 truncate max-w-[130px]" title={p.seller}>
                        👤 {p.seller || 'Neighbor'}
                      </span>
                      <span className="truncate max-w-[90px]" title={p.location}>
                        📍 {p.location || 'Local'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleContact(p)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/20"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat / Call
                    </button>

                    <Link
                      href={`/product/${p.id}`}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Seller Modal */}
      {contactProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setContactProduct(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> Verified Peer Seller
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{contactProduct.seller}</h3>
            <p className="text-xs text-slate-500 mb-4">📍 {contactProduct.location || 'India'}</p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5">
              <div className="text-xs text-slate-500">Item:</div>
              <div className="text-sm font-bold text-slate-900 mb-2">{contactProduct.name}</div>
              <div className="text-lg font-black text-emerald-600">₹{contactProduct.price.toLocaleString('en-IN')}</div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>+91 98765 43210</span>
                </div>
                <button
                  onClick={() => handleCopyPhone('+91 98765 43210')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  {copiedPhone ? 'Copied!' : 'Copy Number'}
                </button>
              </div>

              <a
                href={`https://wa.me/919876543210?text=Hi, I am interested in your listing: ${encodeURIComponent(contactProduct.name)} on MarkatVerse.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>

            <div className="mt-5 text-[11px] text-slate-400 text-center leading-relaxed">
              💡 Always meet in a well-lit public place and inspect items before transferring payment.
            </div>
          </div>
        </div>
      )}

      {/* Post Free Listing Modal */}
      {postAdModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setPostAdModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {adSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Listing Published!</h3>
                <p className="text-sm text-slate-500">
                  Your listing is live for community members in {userLocation || 'your locality'}. Interested buyers will contact you directly.
                </p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setAdSuccess(true); setTimeout(() => setPostAdModal(false), 2000); }}>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" /> Free Classified Ad
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Post Pre-Owned Listing</h3>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Item Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Apple iPad Air 64GB with Pencil (Like New)"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 15000"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                      <select aria-label="Select listing category" className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none">
                        <option>Mobiles & Gadgets</option>
                        <option>Vehicles & Bikes</option>
                        <option>Furniture & Home</option>
                        <option>Fashion & Wardrobe</option>
                        <option>Books & Hobbies</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Condition & Details</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Purchased 6 months ago, original bill and box available, minor scratch on bezel..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPostAdModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                  >
                    Publish Listing Free
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
