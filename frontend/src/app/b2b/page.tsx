"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, 
  Package, 
  ShieldCheck, 
  TrendingUp, 
  Search, 
  Filter, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Truck, 
  Percent, 
  X,
  PhoneCall,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useProducts, Product } from '@/context/ProductContext';
import { useSettings } from '@/context/SettingsContext';

const B2B_CATEGORIES = [
  { id: 'all', label: 'All Wholesale' },
  { id: 'construction', label: 'Construction & Materials' },
  { id: 'industrial', label: 'Industrial & Tools' },
  { id: 'electronics', label: 'Electronics Wholesale' },
  { id: 'textiles', label: 'Textiles & Garments' },
  { id: 'packaging', label: 'Packaging & Logistics' },
  { id: 'fmcg', label: 'FMCG & Groceries' },
];

export default function B2BTradeCenterPage() {
  const { products, isLoading } = useProducts();
  const { isSectorActive } = useSettings();
  
  const b2bOnline = isSectorActive('b2b');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'moq_low'>('featured');
  
  // RFQ Modal State
  const [rfqProduct, setRfqProduct] = useState<Product | null>(null);
  const [rfqQuantity, setRfqQuantity] = useState<number>(50);
  const [rfqNote, setRfqNote] = useState<string>('');
  const [rfqSubmitted, setRfqSubmitted] = useState<boolean>(false);

  // Filter products for B2B Wholesale
  const b2bProducts = useMemo(() => {
    return products.filter(p => {
      // Must be a B2B product or have B2B wholesale traits
      const isB2bItem = p.isB2B === true || 
                        (p as any).primaryType === 'PRODUCT' && (p.category === 'B2B' || p.category === 'Construction Materials' || (p.moq && p.moq > 1) || (p.wholesaleTiers && p.wholesaleTiers.length > 0));
      if (!isB2bItem) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        if (selectedCategory === 'construction' && !cat.includes('construction') && !sub.includes('construction') && !cat.includes('cement') && !cat.includes('steel')) return false;
        if (selectedCategory === 'industrial' && !cat.includes('industrial') && !cat.includes('tool') && !sub.includes('hardware')) return false;
        if (selectedCategory === 'electronics' && !cat.includes('electronic') && !sub.includes('electronic')) return false;
        if (selectedCategory === 'textiles' && !cat.includes('textile') && !cat.includes('fashion') && !cat.includes('clothing')) return false;
        if (selectedCategory === 'packaging' && !cat.includes('pack') && !cat.includes('logistics')) return false;
        if (selectedCategory === 'fmcg' && !cat.includes('fmcg') && !cat.includes('grocery') && !cat.includes('food')) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchSeller = (p.seller || '').toLowerCase().includes(q);
        const matchCat = (p.category || '').toLowerCase().includes(q);
        if (!matchName && !matchSeller && !matchCat) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Sorted B2B Products
  const sortedProducts = useMemo(() => {
    const list = [...b2bProducts];
    if (sortBy === 'price_low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'moq_low') {
      list.sort((a, b) => (a.moq || 1) - (b.moq || 1));
    }
    return list;
  }, [b2bProducts, sortBy]);

  const handleOpenRfq = (product: Product) => {
    setRfqProduct(product);
    setRfqQuantity(product.moq || 20);
    setRfqNote('');
    setRfqSubmitted(false);
  };

  const handleSendRfq = (e: React.FormEvent) => {
    e.preventDefault();
    setRfqSubmitted(true);
    setTimeout(() => {
      setRfqProduct(null);
      setRfqSubmitted(false);
    }, 2200);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4 tracking-wide uppercase">
                <Building2 className="w-3.5 h-3.5" />
                Enterprise Wholesale Marketplace
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Direct B2B Trade & Bulk Procurement
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed">
                Source directly from verified manufacturers, mill owners, and nationwide distributors. Enjoy volume discount tiers, GST invoicing, and transparent RFQ quotes.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex flex-row md:flex-col gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 flex items-center justify-center text-blue-400 font-bold">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Bulk Margins</div>
                  <div className="text-sm font-bold text-white">Up to 45% Off MRP</div>
                </div>
              </div>
              <div className="w-px h-auto md:w-full md:h-px bg-white/10"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/30 flex items-center justify-center text-emerald-400 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Protection</div>
                  <div className="text-sm font-bold text-white">Verified GST Suppliers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-4xl bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search raw materials, wholesale goods, bulk electronics, suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort wholesale listings"
                className="w-full sm:w-auto px-4 py-3 bg-white rounded-xl text-slate-700 text-sm font-medium focus:outline-none border-none cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="moq_low">MOQ: Smallest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Inactive Banner Notice */}
      {!b2bOnline && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-sm">
              <span className="font-bold">B2B Wholesale Sector Notice:</span> Marketplace wholesale operations are currently in maintenance or toggled off by the administrator. Listings below are in read-only preview mode.
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {B2B_CATEGORIES.map(cat => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-800">{sortedProducts.length}</span> wholesale products & suppliers
          </div>
          <Link href="/" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Back to Marketplace <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Loading skeleton */}
        {isLoading && sortedProducts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse space-y-3">
                <div className="w-full h-44 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-6 bg-slate-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Wholesale Listings Found</h3>
            <p className="text-sm text-slate-500 mb-6">
              We couldn't find any B2B wholesale listings matching your current filter. Try selecting another category or clearing your search term.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((p) => {
              const moq = p.moq || 10;
              const hasTiers = Array.isArray(p.wholesaleTiers) && p.wholesaleTiers.length > 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden group hover:-translate-y-1"
                >
                  {/* Image & Badges */}
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

                    {/* Wholesale MOQ Badge */}
                    <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                      <Package className="w-3 h-3 text-blue-400" />
                      MOQ: {moq} Units
                    </div>

                    {/* Margin Badge */}
                    {p.discount && (
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-md">
                        {p.discount}
                      </div>
                    )}
                  </div>

                  {/* Details Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-1">
                        {p.category || 'Wholesale Goods'}
                      </div>
                      
                      <Link href={`/product/${p.id}`} className="hover:underline">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </h4>
                      </Link>

                      {/* Pricing Row */}
                      <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-lg font-black text-slate-900">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">/ unit</span>
                        {p.originalPrice > p.price && (
                          <span className="text-xs text-slate-400 line-through ml-auto">
                            MRP ₹{p.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Supplier & Location */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700 truncate max-w-[130px]" title={p.seller}>
                          🏢 {p.seller || 'Verified Supplier'}
                        </span>
                        <span className="truncate max-w-[90px]" title={p.location}>
                          📍 {p.location || 'India'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenRfq(p)}
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Request Quote
                      </button>

                      <Link
                        href={`/product/${p.id}`}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RFQ (Request For Quotation) Modal */}
      {rfqProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setRfqProduct(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {rfqSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Quote Request Sent!</h3>
                <p className="text-sm text-slate-500">
                  Your bulk RFQ has been delivered to <span className="font-semibold text-slate-800">{rfqProduct.seller}</span>. The supplier will send their formal quotation within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendRfq}>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" /> B2B Instant RFQ
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Request Wholesale Quotation</h3>
                <p className="text-xs text-slate-500 mb-4">
                  For: <span className="font-semibold text-slate-800">{rfqProduct.name}</span>
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Listed Price:</span>
                    <span className="font-bold text-slate-800 ml-1.5">₹{rfqProduct.price} / unit</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Supplier MOQ:</span>
                    <span className="font-bold text-blue-600 ml-1.5">{rfqProduct.moq || 10} Units</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Required Quantity (Min {rfqProduct.moq || 10})
                    </label>
                    <input
                      type="number"
                      min={rfqProduct.moq || 1}
                      value={rfqQuantity}
                      onChange={(e) => setRfqQuantity(parseInt(e.target.value) || 1)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Delivery Pin Code / Destination City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 110001, New Delhi"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Requirements & Custom Packaging Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={rfqNote}
                      onChange={(e) => setRfqNote(e.target.value)}
                      placeholder="e.g. Need GST invoice, customized branded packaging, delivery by next Friday..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRfqProduct(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                  >
                    Submit RFQ to Supplier
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
