"use client";
import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProducts, Product } from '@/context/ProductContext';
import ProductGrid from '@/components/ProductGrid';
import ServiceDirectoryList from '@/components/ServiceDirectoryList';
import MascotState from '@/components/MascotState';
import { ChevronRight, ArrowUpDown, Filter, Sparkles, Search, SlidersHorizontal, Tag, Star } from 'lucide-react';
import { isServiceProduct } from '@/utils/productSearch';

function matchCategory(pCategory: string | null = '', targetCategory: string | null = '', pSubcategory: string | null = '', pName: string | null = '') {
  const pCat = (pCategory || '').toLowerCase().trim();
  const tCat = (targetCategory || '').toLowerCase().trim();
  const pSub = (pSubcategory || '').toLowerCase().trim();
  const name = (pName || '').toLowerCase().trim();

  if (!tCat || tCat === 'all') return true;
  if (pCat === tCat) return true;

  // Mobiles & Smartphones
  if (tCat.includes('mobile') || tCat.includes('smartphone') || tCat === 'phones') {
    return pCat === 'mobiles' || pCat === 'smartphones' || (pCat === 'electronics' && (pSub.includes('mobile') || pSub.includes('smartphone') || name.includes('phone') || name.includes('galaxy') || name.includes('iphone') || name.includes('oneplus')));
  }

  // Food & Dining
  if (tCat.includes('food') || tCat.includes('dining') || tCat.includes('restaurant') || tCat.includes('cafe') || tCat.includes('bakery')) {
    return pCat === 'food & dining' || pCat.includes('food') || pCat.includes('dining') || pCat.includes('restaurant') || pSub.includes('biryani') || pSub.includes('pizza') || pSub.includes('beverage') || name.includes('biryani') || name.includes('pizza') || name.includes('coffee') || name.includes('food');
  }

  // Salon & Spa
  if (tCat.includes('salon') || tCat.includes('spa') || tCat.includes('wellness') || tCat.includes('parlour')) {
    return pCat === 'salon & parlour' || pCat === 'spa' || pCat === 'salon & spa' || pCat === 'salon' || (pCat === 'services' && (pSub === 'salon' || pSub === 'spa' || name.includes('hair') || name.includes('salon') || name.includes('spa') || name.includes('makeup') || name.includes('pedicure') || name.includes('nail')));
  }

  // Electronics & Gadgets
  if (tCat.includes('electronic') || tCat.includes('gadget') || tCat.includes('computing')) {
    return pCat === 'electronics' || pCat.includes('electronic') || pCat === 'mobiles' || pSub.includes('audio') || pSub.includes('laptop') || pSub.includes('tv') || name.includes('earbuds') || name.includes('macbook') || name.includes('tv');
  }

  // Fashion & Apparel
  if (tCat.includes('fashion') || tCat.includes('apparel') || tCat.includes('clothing')) {
    return pCat === 'fashion' || pCat.includes('fashion') || pCat.includes('clothing') || pSub.includes('men') || pSub.includes('women') || pSub.includes('footwear') || name.includes('shirt') || name.includes('kurti') || name.includes('sneaker');
  }

  // Home & Living
  if (tCat.includes('home') || tCat.includes('living') || tCat.includes('furniture') || tCat.includes('kitchen')) {
    return pCat === 'home' || pCat.includes('home') || pCat.includes('furniture') || pSub.includes('kitchen') || pSub.includes('furniture') || pSub.includes('bedding') || name.includes('table') || name.includes('bedsheet') || name.includes('kitchen');
  }

  // Beauty & Personal Care
  if (tCat.includes('beauty') || tCat.includes('skincare') || tCat.includes('cosmetic') || tCat.includes('makeup')) {
    return pCat === 'beauty' || pCat.includes('beauty') || pCat.includes('cosmetic') || pSub.includes('skincare') || pSub.includes('makeup') || pSub.includes('haircare') || name.includes('serum') || name.includes('lipstick') || name.includes('hair oil') || name.includes('glow');
  }

  // Auto & Vehicles
  if (tCat.includes('auto') || tCat.includes('vehicle') || tCat.includes('car') || tCat.includes('motor')) {
    return pCat === 'auto' || pCat === 'automobile' || pCat.includes('automobile') || pCat.includes('car wash') || pCat === 'transport' || pCat === 'rentals' || pSub.includes('car') || pSub.includes('vehicle') || name.includes('car') || name.includes('helmet') || name.includes('engine oil') || name.includes('auto rental') || name.includes('suv');
  }

  // Sports & Fitness
  if (tCat.includes('sport') || tCat.includes('fitness') || tCat.includes('gym')) {
    return pCat === 'sports' || pCat.includes('sports') || pCat.includes('fitness') || pSub.includes('gym') || pSub.includes('fitness') || pSub.includes('yoga') || name.includes('dumbbell') || name.includes('football') || name.includes('yoga');
  }

  // Services
  if (tCat.includes('service')) {
    return pCat === 'services' || pCat === 'home services' || pCat === 'transport' || pCat === 'organizers' || pCat === 'salon & spa';
  }

  return pCat.includes(tCat) || tCat.includes(pCat);
}

const CATEGORY_META: Record<string, { title: string; icon: string; desc: string; searchCat: string }> = {
  'top-deals': { title: 'Top Deals', icon: '🔥', desc: 'Handpicked discounts, limited-time flash offers, and deals of the day', searchCat: '' },
  'services': { title: 'Local Services & Bookings', icon: '🛠️', desc: 'Book verified electricians, plumbers, home cleaning & expert local professionals', searchCat: '' },
  'food-dining': { title: 'Food & Dining', icon: '🍔', desc: 'Explore top restaurants, artisan bakeries, biryani spots, and delicious cuisine', searchCat: 'Food & Dining' },
  'food': { title: 'Food & Dining', icon: '🍔', desc: 'Explore top restaurants, artisan bakeries, biryani spots, and delicious cuisine', searchCat: 'Food & Dining' },
  'salon-spa': { title: 'Salon & Spa', icon: '💇‍♀️', desc: 'Pamper yourself with premium hair styling, spa pedicures, and beauty treatments', searchCat: 'Salon & Spa' },
  'salon': { title: 'Salon & Spa', icon: '💇‍♀️', desc: 'Pamper yourself with premium hair styling, spa pedicures, and beauty treatments', searchCat: 'Salon & Spa' },
  'mobiles': { title: 'Mobiles & Smartphones', icon: '📱', desc: 'Latest 5G flagship smartphones, accessories, and top mobile brands', searchCat: 'Mobiles' },
  'electronics': { title: 'Electronics & Gadgets', icon: '💻', desc: 'Cutting-edge laptops, smart TVs, audio gear, and personal computing', searchCat: 'Electronics' },
  'fashion': { title: 'Fashion & Apparel', icon: '👕', desc: 'Trendy clothing, ethnic wear, footwear, and stylish accessories', searchCat: 'Fashion' },
  'home': { title: 'Home & Living', icon: '🏠', desc: 'Modern furniture, premium kitchen appliances, and elegant home decor', searchCat: 'Home' },
  'beauty': { title: 'Beauty & Personal Care', icon: '💄', desc: 'Dermatologist-approved skincare, luxury cosmetics, and organic haircare', searchCat: 'Beauty' },
  'auto': { title: 'Auto & Vehicles', icon: '🚗', desc: 'Doorstep car detailing, bike gear, spare parts, and auto rentals', searchCat: 'Auto' },
  'sports': { title: 'Sports & Fitness', icon: '⚽', desc: 'Gym equipment, match footballs, yoga mats, and athletic essentials', searchCat: 'Sports' },
};

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug.toLowerCase() : '';
  const { products, isLoading } = useProducts();

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState('');
  const [dealsOnly, setDealsOnly] = useState(false);
  const [highRatingOnly, setHighRatingOnly] = useState(false);
  const [priceUnder1000, setPriceUnder1000] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'rating' | 'discount'>('recommended');

  const meta = CATEGORY_META[slug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    icon: '📦',
    desc: `Discover top products and services in ${slug.replace(/-/g, ' ')}`,
    searchCat: slug
  };

  const filteredProducts = useMemo(() => {
    let result = products;

    // 1. Category / Sector matching with strict Product vs Service separation
    if (slug === 'top-deals') {
      result = result.filter(p => (p.originalPrice && p.originalPrice > p.price) || (!!p.discount && p.discount !== '0%' && p.discount !== '0% OFF'));
    } else if (slug === 'services' || slug === 'salon-spa' || slug === 'salon') {
      // Services only: DO NOT SHOW PRODUCTS
      result = result.filter(p => isServiceProduct(p) && (slug === 'services' || matchCategory(p.category, meta.title, p.subcategory, p.name)));
    } else if (slug !== 'all') {
      // Products only: DO NOT SHOW SERVICES
      const target = meta.title;
      result = result.filter(p => 
        !isServiceProduct(p) &&
        (matchCategory(p.category, target, p.subcategory, p.name) || 
        matchCategory(p.category, slug, p.subcategory, p.name) ||
        matchCategory(p.category, meta.searchCat, p.subcategory, p.name))
      );
    }

    // 2. Keyword Search within category
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.seller || '').toLowerCase().includes(q) ||
        (p.subcategory || '').toLowerCase().includes(q)
      );
    }

    // 3. Toggles
    if (dealsOnly) {
      result = result.filter(p => (p.originalPrice && p.originalPrice > p.price) || (!!p.discount && p.discount !== '0%'));
    }
    if (highRatingOnly) {
      result = result.filter(p => parseFloat(p.rating || '0') >= 4.5);
    }
    if (priceUnder1000) {
      result = result.filter(p => p.price <= 1000);
    }

    // 4. Sorting
    const sorted = [...result];
    if (sortBy === 'price_low') sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_high') sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') sorted.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
    else if (sortBy === 'discount') {
      sorted.sort((a, b) => {
        const hasA = (a.originalPrice && a.originalPrice > a.price) || !!a.discount;
        const hasB = (b.originalPrice && b.originalPrice > b.price) || !!b.discount;
        return (hasA === hasB) ? 0 : hasA ? -1 : 1;
      });
    }

    return sorted;
  }, [products, slug, meta.title, meta.searchCat, searchQuery, dealsOnly, highRatingOnly, priceUnder1000, sortBy]);

  const isServiceCategory = slug === 'services' || slug === 'salon-spa' || slug === 'salon' || (filteredProducts.length > 0 && filteredProducts.every(p => isServiceProduct(p)));

  const searchFallbackUrl = slug === 'top-deals' 
    ? '/search?filter=top_deals'
    : slug === 'services'
    ? '/search?type=services'
    : `/search?category=${encodeURIComponent(meta.searchCat || meta.title)}`;

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col gap-6">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/categories" className="hover:text-blue-600 transition-colors">Categories</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">{meta.title}</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0">
            {meta.icon}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {meta.title}
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1 max-w-2xl font-medium">
              {meta.desc}
            </p>
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                <Sparkles className="w-3.5 h-3.5" />
                {filteredProducts.length} Items Available
              </span>
              <Link 
                href={searchFallbackUrl} 
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Full Filters & Map View
              </Link>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 border border-slate-200 rounded-xl shadow-xs self-stretch md:self-auto justify-between md:justify-start">
          <span className="text-xs font-bold text-slate-500 pl-2 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs sm:text-sm border-none outline-none bg-white font-bold text-slate-800 cursor-pointer px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
          >
            <option value="recommended">Recommended</option>
            <option value="discount">Highest Discount 🔥</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Top Rated ⭐</option>
          </select>
        </div>
      </div>

      {/* Interactive Quick Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input within Category */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 flex-1 min-w-[200px] max-w-md focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder={`Search in ${meta.title}...`} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1">✕</button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-0.5">
          <button 
            onClick={() => setDealsOnly(!dealsOnly)}
            className={`text-xs rounded-full px-3 py-1.5 font-bold transition-all flex items-center gap-1 border shrink-0 ${dealsOnly ? 'bg-red-50 text-red-600 border-red-200 shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent'}`}
          >
            <Tag className="w-3 h-3" /> Deals Only
          </button>
          <button 
            onClick={() => setHighRatingOnly(!highRatingOnly)}
            className={`text-xs rounded-full px-3 py-1.5 font-bold transition-all flex items-center gap-1 border shrink-0 ${highRatingOnly ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent'}`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.5+ Rating
          </button>
          <button 
            onClick={() => setPriceUnder1000(!priceUnder1000)}
            className={`text-xs rounded-full px-3 py-1.5 font-bold transition-all border shrink-0 ${priceUnder1000 ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent'}`}
          >
            Under ₹1,000
          </button>
          {(searchQuery || dealsOnly || highRatingOnly || priceUnder1000) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setDealsOnly(false);
                setHighRatingOnly(false);
                setPriceUnder1000(false);
              }}
              className="text-xs text-red-500 hover:text-red-600 font-bold ml-2 underline cursor-pointer shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Listing Content */}
      <main className="flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-2xl h-72 border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-14">
            <MascotState
              state="no-search"
              title="No Matching Items Found"
              description={`We couldn't find items matching your active filters in ${meta.title}. Try clearing the filters.`}
              actionText="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setDealsOnly(false);
                setHighRatingOnly(false);
                setPriceUnder1000(false);
              }}
              secondaryText="Browse All Categories"
              onSecondaryAction={() => { window.location.href = '/categories'; }}
            />
          </div>
        ) : isServiceCategory ? (
          <ServiceDirectoryList products={filteredProducts} />
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </main>
    </div>
  );
}
