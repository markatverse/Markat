"use client";
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import ProductGrid from '@/components/ProductGrid';
import ServiceDirectoryList from '@/components/ServiceDirectoryList';
import SidebarBannerWidget from '@/components/SidebarBannerWidget';
import AdvertisementWidget from '@/components/AdvertisementWidget';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { SlidersHorizontal, MapPin } from 'lucide-react';
import { isServiceProduct, matchesProductSearch } from '@/utils/productSearch';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialLoc = searchParams.get('loc') || '';
  const initialCat = searchParams.get('cat') || '';
  
  const { products, categories, isLoading } = useProducts();
  
  // Local filter states
  const [q, setQ] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCat === 'All Categories' ? '' : initialCat);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [productType, setProductType] = useState('all'); // all, products, services
  const [priceRange, setPriceRange] = useState('all'); // all, under_500, 500_2000, over_2000
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('recommended');
  const [dynamicFilters, setDynamicFilters] = useState<Record<string, string>>({});
  const [locationFilter, setLocationFilter] = useState(initialLoc);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [b2bOnly, setB2BOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);

  // Sync with URL if it changes
  useEffect(() => {
    setQ((searchParams.get('q') || '').trim());
    const cat = searchParams.get('category') || searchParams.get('cat');
    setSelectedCategory(cat && cat !== 'All Categories' ? cat : '');
    setLocationFilter(searchParams.get('loc') || '');

    const filter = searchParams.get('filter');
    setSortBy(filter === 'top_deals' ? 'discount' : 'recommended');
    setB2BOnly(filter === 'b2b');

    const type = searchParams.get('type');
    setProductType(type === 'services' ? 'services' : type === 'products' ? 'products' : 'all');
  }, [searchParams]);

  // Derived filtered products
  const filteredProducts = useMemo(() => {
    let result = products;
    
    // Search Query
    if (q.trim()) result = result.filter(product => matchesProductSearch(product, q));
    
    // Location Filter (from text input)
    if (locationFilter) {
      result = result.filter(p => (p.location || '').toLowerCase().includes(locationFilter.toLowerCase()));
    }
    
    // Type Filter
    if (productType !== 'all') {
      result = result.filter(p => {
        const isService = isServiceProduct(p);
        if (productType === 'services') return isService;
        if (productType === 'products') return !isService;
        return true;
      });
    }

    // Category Filter
    if (selectedCategory) {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
      // Subcategory Filter
      if (selectedSubcategory) {
        result = result.filter(p => p.subcategory && p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase());
      }
      
      // Dynamic Filters
      Object.entries(dynamicFilters).forEach(([key, value]) => {
        if (value) {
          result = result.filter(p => p.parameters && p.parameters[key] && p.parameters[key].includes(value));
        }
      });
    }
    
    // Price Filter
    if (priceRange !== 'all') {
      result = result.filter(p => {
        if (priceRange === 'under_500') return p.price < 500;
        if (priceRange === '500_2000') return p.price >= 500 && p.price <= 2000;
        if (priceRange === 'over_2000') return p.price > 2000;
        return true;
      });
    }

    // Rating Filter
    if (minRating > 0) {
      result = result.filter(p => parseFloat(p.rating) >= minRating);
    }
    
    // Feature Toggles
    if (verifiedOnly) result = result.filter(p => !!p.badge);
    if (b2bOnly) result = result.filter(p => p.isB2B);
    if (premiumOnly) result = result.filter(p => p.isPremium);

    // Sorting
    result = [...result];
    if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (sortBy === 'discount') {
      // Products with a discount label should be sorted higher
      result.sort((a, b) => {
        const hasDiscOrigA = a.originalPrice && a.originalPrice > a.price;
        const hasDiscOrigB = b.originalPrice && b.originalPrice > b.price;
        const hasDiscTextA = !!a.discount;
        const hasDiscTextB = !!b.discount;
        
        if ((hasDiscOrigA || hasDiscTextA) && !(hasDiscOrigB || hasDiscTextB)) return -1;
        if (!(hasDiscOrigA || hasDiscTextA) && (hasDiscOrigB || hasDiscTextB)) return 1;
        return 0;
      });
    }
    
    return result;
  }, [q, locationFilter, productType, selectedCategory, selectedSubcategory, dynamicFilters, priceRange, minRating, verifiedOnly, b2bOnly, premiumOnly, sortBy, products]);

  // Get unique categories from products
  const availableCategories = Array.from(new Set(products.map(p => p.category)));
  
  // Get unique subcategories for the selected category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const catProducts = products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    return Array.from(new Set(catProducts.map(p => p.subcategory).filter(Boolean))) as string[];
  }, [selectedCategory, products]);
  
  // Get available dynamic filters based on the selected category's parameters
  const availableDynamicFilters = useMemo(() => {
    if (!selectedCategory) return [];
    const categoryConfig = categories?.find(c => c.name === selectedCategory);
    
    // Fallback logic to extract keys from products directly if no global category config exists
    if (!categoryConfig || !categoryConfig.parameters) {
       const catProducts = products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
       const filterKeys = new Set<string>();
       catProducts.forEach(p => {
         if (p.parameters) {
           Object.keys(p.parameters).forEach(k => filterKeys.add(k));
         }
       });
       
       return Array.from(filterKeys).map(key => {
         const values = new Set<string>();
         catProducts.forEach(p => {
           if (p.parameters && p.parameters[key]) {
             const pVal = p.parameters[key];
             (Array.isArray(pVal) ? pVal : [pVal]).forEach(v => values.add(v));
           }
         });
         return { name: key, values: Array.from(values) };
       });
    }
    
    return categoryConfig.parameters.map(param => {
      // Extract unique values from products for this parameter
      const values = new Set<string>();
      products.filter(p => p.category === selectedCategory).forEach(p => {
        if (p.parameters && p.parameters[param.name]) {
          const pVal = p.parameters[param.name];
          (Array.isArray(pVal) ? pVal : [pVal]).forEach(v => values.add(v));
        }
      });
      return { name: param.name, values: Array.from(values) };
    }).filter(f => f.values.length > 0);
  }, [selectedCategory, products, categories]);

  return (
    <div className="max-w-[1400px] mx-auto p-5 min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col gap-6">
      
      {/* Horizontal Filters Bar */}
      <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-3 px-1 border-b border-slate-200/50 bg-white shadow-sm rounded-2xl w-full">
        <div className="pl-4 pr-2 flex items-center text-slate-400 shrink-0 border-r border-slate-200 mr-1">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        
        {/* Type Pill */}
        <select 
          value={productType} 
          onChange={(e) => setProductType(e.target.value)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none text-sm rounded-full px-4 py-2 font-medium cursor-pointer outline-none whitespace-nowrap appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%20fill%3D%22%2364748B%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.2rem_center] bg-[length:1.25rem_1.25rem] shrink-0 transition-colors"
        >
          <option value="all">All Types</option>
          <option value="products">Products Only</option>
          <option value="services">Services Only</option>
        </select>

        {/* Category Pill */}
        <select 
          value={selectedCategory} 
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory('');
            setDynamicFilters({});
          }}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none text-sm rounded-full px-4 py-2 font-medium cursor-pointer outline-none whitespace-nowrap appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%20fill%3D%22%2364748B%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.2rem_center] bg-[length:1.25rem_1.25rem] shrink-0 transition-colors"
        >
          <option value="">All Categories</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Subcategory Pill */}
        {selectedCategory && availableSubcategories.length > 0 && (
          <select 
            value={selectedSubcategory} 
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none text-sm rounded-full px-4 py-2 font-medium cursor-pointer outline-none whitespace-nowrap appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%20fill%3D%22%2364748B%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.2rem_center] bg-[length:1.25rem_1.25rem] shrink-0 transition-colors"
          >
            <option value="">All in {selectedCategory}</option>
            {availableSubcategories.map(subcat => (
              <option key={subcat} value={subcat}>{subcat}</option>
            ))}
          </select>
        )}
        
        {/* Dynamic Filters */}
        {selectedCategory && availableDynamicFilters.map(filter => (
          <select 
            key={filter.name}
            value={dynamicFilters[filter.name] || ''} 
            onChange={(e) => setDynamicFilters(prev => ({ ...prev, [filter.name]: e.target.value }))}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-none text-sm rounded-full px-4 py-2 font-bold cursor-pointer outline-none whitespace-nowrap appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%20fill%3D%22%23047857%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.2rem_center] bg-[length:1.25rem_1.25rem] shrink-0 transition-colors"
          >
            <option value="">Any {filter.name}</option>
            {filter.values.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        ))}

        {/* Location Pill */}
        <div className="relative flex items-center bg-slate-100 rounded-full px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 shrink-0 transition-all">
          <MapPin className="w-4 h-4 text-slate-500 mr-2" />
          <input 
            type="text" 
            placeholder="Near Me..." 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)} 
            className="bg-transparent border-none outline-none text-sm font-medium w-24 text-slate-700 placeholder-slate-400" 
          />
        </div>

        {/* Price Pill */}
        <select 
          value={priceRange} 
          onChange={(e) => setPriceRange(e.target.value)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none text-sm rounded-full px-4 py-2 font-medium cursor-pointer outline-none whitespace-nowrap appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%20fill%3D%22%2364748B%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.2rem_center] bg-[length:1.25rem_1.25rem] shrink-0 transition-colors"
        >
          <option value="all">Any Price</option>
          <option value="under_500">Under ₹500</option>
          <option value="500_2000">₹500 - ₹2,000</option>
          <option value="over_2000">Over ₹2,000</option>
        </select>

        {/* Rating Pill */}
        <select 
          value={minRating} 
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none text-sm rounded-full px-4 py-2 font-medium cursor-pointer outline-none whitespace-nowrap appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%20fill%3D%22%2364748B%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.2rem_center] bg-[length:1.25rem_1.25rem] shrink-0 transition-colors"
        >
          <option value={0}>Any Rating</option>
          <option value={4.5}>4.5 & up ⭐</option>
          <option value={4.0}>4.0 & up ⭐</option>
          <option value={3.0}>3.0 & up ⭐</option>
        </select>

        {/* Feature Pills (Toggles) */}
        <button 
          onClick={() => setVerifiedOnly(!verifiedOnly)} 
          className={`text-sm rounded-full px-4 py-2 font-medium whitespace-nowrap shrink-0 transition-colors border border-transparent ${verifiedOnly ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          ✓ Verified
        </button>
        <button 
          onClick={() => setB2BOnly(!b2bOnly)} 
          className={`text-sm rounded-full px-4 py-2 font-medium whitespace-nowrap shrink-0 transition-colors border border-transparent ${b2bOnly ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          🏢 B2B Only
        </button>
        <button 
          onClick={() => setPremiumOnly(!premiumOnly)} 
          className={`text-sm rounded-full px-4 py-2 font-medium whitespace-nowrap shrink-0 transition-colors border border-transparent ${premiumOnly ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          ✨ Premium
        </button>

        {/* Clear Filters */}
        {(productType !== 'all' || selectedCategory || locationFilter || priceRange !== 'all' || minRating > 0 || verifiedOnly || b2bOnly || premiumOnly) && (
          <button 
            onClick={() => {
              setProductType('all');
              setSelectedCategory('');
              setSelectedSubcategory('');
              setPriceRange('all');
              setMinRating(0);
              setLocationFilter('');
              setVerifiedOnly(false);
              setB2BOnly(false);
              setPremiumOnly(false);
              setSortBy('recommended');
            }}
            className="text-sm text-red-500 hover:text-red-600 font-bold whitespace-nowrap ml-4 shrink-0 px-2"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Main Results Area */}
      <div className="flex flex-col md:flex-row gap-6 flex-1">
        
        {/* Optional Sidebar Space for Banners on Desktop */}
        <div className="hidden md:block w-64 shrink-0 space-y-4">
           <SidebarBannerWidget />
           <AdvertisementWidget position="SIDEBAR" />
        </div>

        <main className="flex-1">
          <AdvertisementWidget position="SEARCH_PAGE" className="mb-6" />
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Search Results</h1>
            <p className="text-slate-500 font-medium">
              {filteredProducts.length} results found
              {q && ` for "${q}"`}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-lg shadow-sm w-fit">
            <span className="text-sm text-slate-500 font-medium pl-2">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border-none outline-none bg-transparent font-semibold text-slate-800 cursor-pointer pr-4"
            >
              <option value="recommended">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
        {isLoading ? (
          <ProductGridSkeleton count={12} />
        ) : productType === 'services' || categories.some(category => category.name === selectedCategory && category.primaryType === 'SERVICE') || selectedCategory === 'Services' || selectedCategory === 'Home Services' ? (
          <ServiceDirectoryList products={filteredProducts} />
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
        </main>
      </div>

    </div>
  );
}

import ProductGridSkeleton from '@/components/ProductGridSkeleton';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1400px] mx-auto p-5 min-h-[calc(100vh-80px)] bg-slate-50">
        <div className="mb-6"><div className="h-10 w-48 bg-slate-200 rounded animate-pulse"></div></div>
        <ProductGridSkeleton count={12} />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
