"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import { ChevronRight, Filter, Search } from 'lucide-react';
import SidebarBannerWidget from '@/components/SidebarBannerWidget';
import CategoryIcon from '@/components/CategoryIcon';
import { getApiUrl } from '@/utils/api';

const API_URL = getApiUrl();

export default function DynamicExplorePage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { products, categories } = useProducts();
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug || [];
  
  // Levels: 
  // slug[0] = mainType (e.g. b2b, b2c, services)
  // slug[1] = businessType (e.g. retail, wholesale)
  // slug[2] = sector (e.g. fashion, electronics)
  
  const mainType = slug[0];
  const businessType = slug[1];
  const sector = slug[2];
  
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real V2 backend integration, we would fetch from /configuration/business-hierarchy
  // and /listings based on the path.
  useEffect(() => {
    // For now, we simulate the progressive disclosure using the context data
    setLoading(true);
    
    setTimeout(() => {
      // Fetch dynamic listings if we are at the sector level
      if (sector) {
        // Find products matching the sector/category
        // We use case-insensitive matching
        const matched = products.filter(p => p.category?.toLowerCase() === sector.toLowerCase() || p.subcategory?.toLowerCase() === sector.toLowerCase());
        setListings(matched);
      }
      setLoading(false);
    }, 500);
  }, [slug, products]);

  // Determine what to show based on current path depth
  const renderBreadcrumbs = () => {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto pb-2 whitespace-nowrap">
        <Link href="/explore" className="hover:text-blue-600 font-medium transition-colors">Explore</Link>
        {mainType && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/explore/${mainType}`} className="hover:text-blue-600 font-medium transition-colors capitalize">{mainType}</Link>
          </>
        )}
        {businessType && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/explore/${mainType}/${businessType}`} className="hover:text-blue-600 font-medium transition-colors capitalize">{businessType.replace('-', ' ')}</Link>
          </>
        )}
        {sector && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-bold capitalize">{sector.replace('-', ' ')}</span>
          </>
        )}
      </div>
    );
  };

  // View: Main Models (Level 0)
  if (slug.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 lg:p-10 min-h-screen bg-slate-50">
        {renderBreadcrumbs()}
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Explore MarkatVerse</h1>
        <p className="text-lg text-slate-500 mb-10 max-w-3xl">Select a market segment to begin browsing thousands of products, services, and B2B opportunities.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/explore/b2c" className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">🛍️</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">B2C Retail</h2>
            <p className="text-slate-500">Shop directly from retailers, brands, and local stores for everyday consumer products.</p>
          </Link>
          
          <Link href="/explore/b2b" className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">🏢</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">B2B Wholesale</h2>
            <p className="text-slate-500">Connect with manufacturers, distributors, and wholesalers for bulk purchasing.</p>
          </Link>
          
          <Link href="/explore/services" className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">✨</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Services</h2>
            <p className="text-slate-500">Book appointments with salons, consultants, contractors, and service professionals.</p>
          </Link>
        </div>
      </div>
    );
  }

  // View: Business Types (Level 1)
  if (slug.length === 1) {
    let types: string[] = [];
    if (mainType === 'b2c') {
      types = ['retailer', 'brand-store', 'home-business'];
    } else if (mainType === 'b2b') {
      types = ['manufacturer', 'wholesaler', 'distributor'];
    } else if (mainType === 'services') {
      types = ['plumber', 'carpenter', 'electrician', 'salon', 'spa', 'doctor', 'mechanic', 'cleaner', 'painter', 'tutor', 'photographer', 'event-planner', 'consultant', 'freelancer'];
    }
                  
    const typeMeta: Record<string, { emoji: string, colorClass: string }> = {
      'retailer': { emoji: '🛍️', colorClass: 'bg-blue-100 text-blue-600' },
      'brand-store': { emoji: '💎', colorClass: 'bg-purple-100 text-purple-600' },
      'home-business': { emoji: '🏠', colorClass: 'bg-amber-100 text-amber-600' },
      'manufacturer': { emoji: '🏭', colorClass: 'bg-slate-200 text-slate-700' },
      'wholesaler': { emoji: '📦', colorClass: 'bg-indigo-100 text-indigo-600' },
      'distributor': { emoji: '🚚', colorClass: 'bg-emerald-100 text-emerald-600' },
      'consultant': { emoji: '💼', colorClass: 'bg-blue-100 text-blue-600' },
      'freelancer': { emoji: '💻', colorClass: 'bg-cyan-100 text-cyan-600' },
      // New Services
      'plumber': { emoji: '🔧', colorClass: 'bg-blue-100 text-blue-600' },
      'carpenter': { emoji: '🪚', colorClass: 'bg-amber-100 text-amber-700' },
      'electrician': { emoji: '⚡', colorClass: 'bg-yellow-100 text-yellow-600' },
      'salon': { emoji: '💇‍♀️', colorClass: 'bg-pink-100 text-pink-600' },
      'spa': { emoji: '💆‍♀️', colorClass: 'bg-rose-100 text-rose-500' },
      'doctor': { emoji: '👨‍⚕️', colorClass: 'bg-emerald-100 text-emerald-600' },
      'mechanic': { emoji: '🚗', colorClass: 'bg-slate-200 text-slate-700' },
      'cleaner': { emoji: '🧹', colorClass: 'bg-teal-100 text-teal-600' },
      'painter': { emoji: '🎨', colorClass: 'bg-purple-100 text-purple-600' },
      'tutor': { emoji: '📚', colorClass: 'bg-indigo-100 text-indigo-600' },
      'photographer': { emoji: '📸', colorClass: 'bg-neutral-100 text-neutral-800' },
      'event-planner': { emoji: '🎉', colorClass: 'bg-fuchsia-100 text-fuchsia-600' },
    };
                  
    return (
      <div className="max-w-7xl mx-auto p-6 lg:p-10 min-h-screen bg-slate-50">
        {renderBreadcrumbs()}
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 capitalize">{mainType} Marketplace</h1>
        <p className="text-lg text-slate-500 mb-10 max-w-3xl">
          {mainType === 'services' ? 'Select a service professional to view available experts and book appointments.' : 'Select a business type to view specific categories.'}
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {types.map(type => {
            const meta = typeMeta[type] || { emoji: type.charAt(0).toUpperCase(), colorClass: 'bg-slate-100 text-slate-600' };
            return (
              <Link key={type} href={`/explore/${mainType}/${type}`} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all flex flex-col items-center text-center gap-4 group">
                <div className={`w-16 h-16 ${meta.colorClass} rounded-2xl flex items-center justify-center font-bold text-3xl transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                  {meta.emoji}
                </div>
                <div className="font-bold text-slate-900 capitalize text-sm group-hover:text-blue-600 transition-colors">{type.replace('-', ' ')}</div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // View: Sectors / Categories (Level 2)
  if (slug.length === 2 && mainType !== 'services') {
    // We map backend categories
    const displayedCategories = categories.filter(c => !['Services', 'Transport', 'Organizers'].includes(c.name));

    const gradients = [
      'bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200',
      'bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200',
      'bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200',
      'bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200',
      'bg-gradient-to-br from-rose-100 to-red-100 border border-rose-200',
      'bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200',
    ];

    return (
      <div className="max-w-7xl mx-auto p-6 lg:p-10 min-h-screen bg-slate-50">
        {renderBreadcrumbs()}
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 capitalize">{businessType.replace('-', ' ')} Sectors</h1>
        <p className="text-lg text-slate-500 mb-10 max-w-3xl">Select a specific sector or category to view listings.</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {displayedCategories.map((cat, index) => {
            const gradient = gradients[index % gradients.length];
            return (
              <Link key={cat.id} href={`/explore/${mainType}/${businessType}/${cat.name.toLowerCase()}`} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center gap-4 group">
                <div className={`w-20 h-20 rounded-2xl ${gradient} flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-inner`}>
                  <CategoryIcon name={cat.icon || '📁'} className="w-9 h-9" />
                </div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{cat.name}</div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // View: Listings (Level 3 or Services Level 2)
  if (slug.length === 3 || (slug.length === 2 && mainType === 'services')) {
    const displayTitle = sector ? sector.replace('-', ' ') : businessType.replace('-', ' ');
    const displaySubtitle = mainType === 'services' ? `Services / ${displayTitle}` : `${mainType} / ${businessType.replace('-', ' ')}`;
    
    return (
      <div className="max-w-7xl mx-auto p-6 lg:p-10 min-h-screen bg-slate-50">
        {renderBreadcrumbs()}
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 shrink-0 space-y-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize mb-2">{displayTitle}</h1>
              <p className="text-sm text-slate-500 capitalize">{displaySubtitle}</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 font-bold text-slate-900 pb-4 border-b border-slate-100">
                <Filter className="w-5 h-5" /> Filters
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search in category..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 outline-none text-sm" />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Price Range</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none text-sm" />
                  <span className="text-slate-400">-</span>
                  <input type="number" placeholder="Max" className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none text-sm" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Location / Near Me</label>
                <div className="relative">
                  <button 
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            alert(`Showing results near: Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
                            // Here we would normally filter listings by calculating distance from item.location or item.lat/lng
                          },
                          (error) => alert('Error getting location: ' + error.message)
                        );
                      }
                    }}
                    className="w-full py-2.5 rounded-xl border border-blue-600 bg-blue-50 text-blue-700 font-bold hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    Find Near Me
                  </button>
                </div>
              </div>
            </div>
            
            <SidebarBannerWidget />
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse flex flex-col">
                    <div className="h-48 bg-slate-200 rounded-t-2xl"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No listings found</h3>
                <p className="text-slate-500">We couldn&apos;t find any active listings in the {sector} sector for {businessType.replace('-', ' ')}s.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map(item => (
                  <Link href={`/${mainType === 'services' ? 'service' : 'product'}/${item.id}`} key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group flex flex-col">
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      <img src={item.image || item.images?.[0] || '/hero-left-logo.png'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {item.isB2B && (
                        <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">B2B Wholesale</div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
                        <span>{item.seller}</span>
                        {item.location && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            {item.location.split(',')[0]}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 line-clamp-2">{item.name}</h3>
                      <div className="mt-auto">
                        <div className="text-2xl font-black text-slate-900">₹{item.price?.toLocaleString()}</div>
                        {item.originalPrice > item.price && (
                          <div className="text-sm text-slate-400 line-through">₹{item.originalPrice?.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <div>Not found</div>;
}
