"use client";
import { useSearchParams } from 'next/navigation';
import { useProducts, Product } from '@/context/ProductContext';
import ProductGrid from '@/components/ProductGrid';
import ServiceDirectoryList from '@/components/ServiceDirectoryList';
import SidebarBannerWidget from '@/components/SidebarBannerWidget';
import AdvertisementWidget from '@/components/AdvertisementWidget';
import MascotState from '@/components/MascotState';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { SlidersHorizontal, MapPin } from 'lucide-react';
import { isServiceProduct, matchesProductSearch } from '@/utils/productSearch';
import { fastFetch } from '@/utils/api';

function matchCategory(pCategory: string | null = '', targetCategory: string | null = '', pSubcategory: string | null = '', pName: string | null = '') {
  const pCat = (pCategory || '').toLowerCase().trim();
  const tCat = (targetCategory || '').toLowerCase().trim();
  const pSub = (pSubcategory || '').toLowerCase().trim();
  const name = (pName || '').toLowerCase().trim();

  if (!tCat || tCat === 'all' || tCat === 'all categories') return true;
  if (pCat === tCat) return true;

  // 1. Business to Business / Wholesale
  if (tCat === 'b2b' || tCat.includes('wholesale')) {
    return pCat === 'b2b' || pCat.includes('b2b') || pCat.includes('wholesale') || pSub.includes('wholesale') || name.includes('wholesale') || name.includes('bulk');
  }

  // 2. Building & Infrastructure / Construction Materials
  if (tCat === 'construction materials' || tCat === 'construction' || tCat.includes('infrastructure')) {
    return pCat.includes('construction') || pCat.includes('building') || pCat.includes('raw material') || pSub.includes('contractor') || name.includes('cement') || name.includes('steel') || name.includes('sand');
  }

  // 3. Direct to Consumer / Home Services
  if (tCat === 'home services' || tCat.includes('retail & home') || tCat === 'repair') {
    return pCat === 'home services' || pCat === 'plumber' || pCat === 'electrician' || pCat === 'carpenter' || pCat === 'cleaner' || pCat === 'mechanic' || pSub.includes('repair') || pSub.includes('cleaning') || pSub.includes('plumbing') || name.includes('repair') || name.includes('cleaning') || name.includes('plumbing');
  }

  // 4. Wellness & Care / Salon & Spa
  if (tCat === 'salon & spa' || tCat === 'salon, spa & beauty' || tCat === 'salon & parlour' || tCat === 'salon' || tCat === 'spa' || tCat.includes('wellness')) {
    return pCat === 'salon & parlour' || pCat === 'spa' || pCat === 'salon & spa' || (pCat === 'services' && (pSub === 'salon' || pSub === 'spa' || name.includes('hair') || name.includes('salon') || name.includes('spa') || name.includes('pedicure') || name.includes('nail') || name.includes('facial') || name.includes('makeup')));
  }

  // 5. Events & Planning / Top Organizers
  if (tCat === 'events & planning' || tCat === 'top organizers' || tCat === 'organizers' || tCat === 'event planner' || tCat === 'events') {
    return pCat === 'organizers' || pCat === 'event planner' || pCat === 'events & planning' || name.includes('event') || name.includes('wedding') || name.includes('organizer') || pSub.includes('wedding');
  }

  // 6. Mobility & Freight / Transport Services
  if (tCat === 'transport' || tCat === 'mobility & freight' || tCat === 'transport services' || tCat === 'logistics & transport' || tCat === 'logistics') {
    return pCat === 'transport' || pCat === 'logistics & transport' || pCat === 'rentals' || name.includes('transport') || name.includes('freight') || name.includes('logistics') || name.includes('auto rental') || name.includes('cargo') || name.includes('movers');
  }

  // 7. Food & Dining / Restaurants / Cafes
  if (tCat === 'food & dining' || tCat === 'food' || tCat === 'dining' || tCat === 'restaurant' || tCat === 'restaurants' || tCat === 'cafes') {
    return pCat === 'food & dining' || pCat.includes('food') || pCat.includes('dining') || pCat.includes('restaurant') || pSub.includes('biryani') || pSub.includes('pizza') || pSub.includes('beverage') || pSub.includes('cafe') || name.includes('biryani') || name.includes('pizza') || name.includes('coffee') || name.includes('tea') || name.includes('food') || name.includes('dining');
  }

  // 8. Mobiles & Smartphones
  if (tCat === 'mobiles' || tCat === 'mobile' || tCat === 'smartphones' || tCat === 'phone' || tCat === 'phones') {
    return pCat === 'mobiles' || pCat === 'smartphones' || (pCat === 'electronics' && (pSub.includes('mobile') || pSub.includes('smartphone') || pSub.includes('phone') || name.includes('galaxy') || name.includes('iphone') || name.includes('oneplus') || name.includes('phone')));
  }

  // 9. Electronics & Gadgets
  if (tCat === 'electronics' || tCat === 'electronics & gadgets' || tCat === 'gadgets') {
    return pCat === 'electronics' || pCat.includes('electronic') || pCat === 'mobiles' || pSub.includes('audio') || pSub.includes('laptop') || pSub.includes('television') || pSub.includes('mobile') || name.includes('earbuds') || name.includes('tv') || name.includes('macbook');
  }

  // 10. Fashion & Apparel
  if (tCat === 'fashion' || tCat === 'clothing' || tCat === 'apparel') {
    return pCat === 'fashion' || pCat.includes('fashion') || pCat.includes('clothing') || pSub.includes('men') || pSub.includes('women') || pSub.includes('footwear') || name.includes('shirt') || name.includes('kurti') || name.includes('sneaker');
  }

  // 11. Home & Living / Kitchen / Furniture
  if (tCat === 'home' || tCat === 'home & living' || tCat === 'home & kitchen' || tCat === 'furniture') {
    return pCat === 'home' || pCat.includes('home') || pCat.includes('furniture') || pSub.includes('kitchen') || pSub.includes('furniture') || pSub.includes('bedding') || name.includes('kitchen') || name.includes('table') || name.includes('bedsheet');
  }

  // 12. Beauty & Personal Care / Cosmetics
  if (tCat === 'beauty' || tCat === 'cosmetics' || tCat === 'skincare' || tCat === 'personal care') {
    return pCat === 'beauty' || pCat.includes('beauty') || pCat.includes('cosmetic') || pSub.includes('skincare') || pSub.includes('makeup') || pSub.includes('haircare') || name.includes('serum') || name.includes('lipstick') || name.includes('hair oil') || name.includes('glow');
  }

  // 13. Auto & Vehicles / Car Detailing / Parts
  if (tCat === 'auto' || tCat === 'automobile' || tCat === 'vehicles' || tCat === 'automobile & car wash' || tCat === 'automotive') {
    return pCat === 'auto' || pCat === 'automobile' || pCat.includes('automobile') || pCat.includes('car wash') || pCat === 'transport' || pCat === 'rentals' || pSub.includes('car') || pSub.includes('vehicle') || pSub.includes('rider') || name.includes('car') || name.includes('engine oil') || name.includes('helmet') || name.includes('auto rental') || name.includes('suv');
  }

  // 14. Sports & Fitness
  if (tCat === 'sports' || tCat === 'sports & fitness' || tCat === 'fitness' || tCat === 'gym') {
    return pCat === 'sports' || pCat.includes('sports') || pCat.includes('fitness') || pSub.includes('gym') || pSub.includes('fitness') || pSub.includes('yoga') || pSub.includes('outdoor') || name.includes('dumbbell') || name.includes('football') || name.includes('yoga');
  }

  return pCat.includes(tCat) || tCat.includes(pCat);
}


export const isServiceCategory = (catName: string): boolean => {
  if (!catName) return false;
  const lower = catName.toLowerCase().trim();
  return (
    lower === 'services' ||
    lower === 'salon & spa' ||
    lower === 'salon, spa & beauty' ||
    lower === 'salon & parlour' ||
    lower === 'salon' ||
    lower === 'spa' ||
    lower === 'home services' ||
    lower === 'transport' ||
    lower === 'transport & logistics' ||
    lower === 'transport services' ||
    lower === 'mobility & freight' ||
    lower === 'events & planning' ||
    lower === 'top organizers' ||
    lower === 'organizers' ||
    lower === 'event planner' ||
    lower === 'car wash' ||
    lower === 'car wash & detailing' ||
    lower === 'cleaning' ||
    lower === 'repair' ||
    lower === 'electrician' ||
    lower === 'plumber' ||
    lower === 'carpenter' ||
    lower === 'painter' ||
    lower.includes('service')
  );
};

const SERVICE_CATEGORIES = [
  'Services',
  'Salon & Spa',
  'Home Services',
  'Transport & Logistics',
  'Events & Planning'
];

const PRODUCT_CATEGORIES = [
  'Mobiles',
  'Electronics',
  'Fashion',
  'Home',
  'Beauty',
  'Auto',
  'Sports',
  'Food & Dining',
  'B2B',
  'Construction Materials'
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialLoc = searchParams.get('loc') || '';
  const initialService = searchParams.get('service') || '';
  const initialCat = searchParams.get('category') || searchParams.get('cat') || (initialService ? 'Salon & Spa' : '');
  
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
  const [isTopDeals, setIsTopDeals] = useState((searchParams.get('filter') || '') === 'top_deals');
  const [serverResults, setServerResults] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!q.trim() && !selectedCategory) {
      setServerResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        let url = `/products?limit=100`;
        if (q.trim()) url += `&q=${encodeURIComponent(q.trim())}`;
        if (selectedCategory && selectedCategory !== 'All Categories') url += `&category=${encodeURIComponent(selectedCategory)}`;
        if (productType !== 'all') url += `&type=${productType}`;
        if (locationFilter.trim()) url += `&location=${encodeURIComponent(locationFilter.trim())}`;

        const res = await fastFetch<any>(url, { ttlMs: 30000 });
        let items: any[] = [];
        if (res && Array.isArray(res.data)) items = res.data;
        else if (res && Array.isArray(res.products)) items = res.products;
        else if (Array.isArray(res)) items = res;

        if (items.length > 0) {
          const mapped = items.map((item: any) => ({
            ...item,
            seller: item.sellerName || item.seller,
            category: item.categoryName || item.category,
            primaryType: (item.type === 'SERVICE' || item.primaryType === 'SERVICE') ? 'SERVICE' : (item.primaryType || 'PRODUCT'),
            image: item.image || item.sku || undefined,
            images: item.images || (item.image ? [item.image] : []),
          }));
          setServerResults(mapped);
        } else {
          setServerResults(null);
        }
      } catch {
        setServerResults(null);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [q, selectedCategory, productType, locationFilter]);

  const handleResetFilters = () => {
    setProductType('all');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setPriceRange('all');
    setMinRating(0);
    setLocationFilter('');
    setVerifiedOnly(false);
    setB2BOnly(false);
    setPremiumOnly(false);
    setIsTopDeals(false);
    setSortBy('recommended');
  };

  // Sync with URL if it changes
  useEffect(() => {
    setQ((searchParams.get('q') || '').trim());
    const service = searchParams.get('service');
    const cat = searchParams.get('category') || searchParams.get('cat') || (service ? 'Salon & Spa' : '');
    const type = searchParams.get('type');

    let resolvedType = type === 'services' ? 'services' : type === 'products' ? 'products' : 'all';
    let resolvedCat = cat && cat !== 'All Categories' ? cat : '';

    // Synchronize type and category to avoid contradiction
    if (resolvedCat) {
      if (isServiceCategory(resolvedCat)) {
        resolvedType = 'services';
      } else if (resolvedType === 'all') {
        resolvedType = 'products';
      }
    } else if (resolvedType === 'services' && resolvedCat && !isServiceCategory(resolvedCat)) {
      resolvedCat = '';
    } else if (resolvedType === 'products' && resolvedCat && isServiceCategory(resolvedCat)) {
      resolvedCat = '';
    }

    setProductType(resolvedType);
    setSelectedCategory(resolvedCat);
    setLocationFilter(searchParams.get('loc') || '');

    const filter = searchParams.get('filter');
    const dealsActive = filter === 'top_deals';
    setIsTopDeals(dealsActive);
    setSortBy(dealsActive ? 'discount' : 'recommended');
    setB2BOnly(filter === 'b2b');
  }, [searchParams]);

  // Synchronized Handlers to prevent contradictory filter states
  const handleProductTypeChange = (newType: string) => {
    setProductType(newType);
    setSelectedSubcategory('');
    setDynamicFilters({});

    if (newType === 'services') {
      if (selectedCategory && !isServiceCategory(selectedCategory)) {
        setSelectedCategory('');
      }
    } else if (newType === 'products') {
      if (selectedCategory && isServiceCategory(selectedCategory)) {
        setSelectedCategory('');
      }
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setSelectedCategory(newCat);
    setSelectedSubcategory('');
    setDynamicFilters({});

    if (newCat) {
      if (isServiceCategory(newCat)) {
        setProductType('services');
      } else {
        setProductType('products');
      }
    }
  };

  // Derived filtered products
  const filteredProducts = useMemo(() => {
    let result = (serverResults !== null && serverResults.length > 0) ? serverResults : products;
    
    // Search Query
    if (q.trim()) result = result.filter(product => matchesProductSearch(product, q));
    
    // Location Filter (from text input)
    if (locationFilter) {
      result = result.filter(p => (p.location || '').toLowerCase().includes(locationFilter.toLowerCase()));
    }
    
    // Top Deals Filter
    if (isTopDeals) {
      result = result.filter(p => {
        const hasOrig = p.originalPrice && p.originalPrice > p.price;
        const hasDisc = !!p.discount && p.discount !== '0%' && p.discount !== '0% OFF';
        return hasOrig || hasDisc;
      });
    }

    // Strict Product vs. Service Separation:
    // If services are selected (either by Type or by Service Category), DO NOT SHOW PRODUCTS! ONLY SHOW SERVICES!
    // If products are selected (either by Type or by Product Category), DO NOT SHOW SERVICES! ONLY SHOW PRODUCTS!
    const isServiceMode = productType === 'services' || (selectedCategory && isServiceCategory(selectedCategory));
    const isProductMode = productType === 'products' || (selectedCategory && !isServiceCategory(selectedCategory));

    if (isServiceMode) {
      result = result.filter(p => isServiceProduct(p));
    } else if (isProductMode) {
      result = result.filter(p => !isServiceProduct(p));
    }

    // Category Filter
    if (selectedCategory) {
      result = result.filter(p => matchCategory(p.category, selectedCategory, p.subcategory, p.name));
      // Subcategory Filter
      if (selectedSubcategory) {
        result = result.filter(p => p.subcategory && (p.subcategory || '').toLowerCase() === selectedSubcategory.toLowerCase());
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
    if (b2bOnly) {
      result = result.filter(p => 
        p.isB2B || 
        p.category === 'B2B' || 
        (p.category || '').toLowerCase().includes('b2b') ||
        (p.subcategory || '').toLowerCase().includes('wholesale') ||
        (p.name || '').toLowerCase().includes('wholesale') ||
        (p.name || '').toLowerCase().includes('bulk') ||
        (p.badge || '').toLowerCase().includes('b2b') ||
        (typeof p.moq === 'number' && p.moq > 1)
      );
    }
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
  }, [q, locationFilter, productType, selectedCategory, selectedSubcategory, dynamicFilters, priceRange, minRating, verifiedOnly, b2bOnly, premiumOnly, sortBy, products, serverResults]);

  // Dynamically filter available categories based on selected productType
  const availableCategories = useMemo(() => {
    let list: string[] = [];

    if (productType === 'services') {
      // ONLY service categories
      const set = new Set<string>();
      SERVICE_CATEGORIES.forEach(c => set.add(c));
      (categories || []).forEach(c => {
        if (c.primaryType === 'SERVICE' || isServiceCategory(c.name)) set.add(c.name);
      });
      products.forEach(p => {
        if (isServiceProduct(p) && p.category && isServiceCategory(p.category)) set.add(p.category);
      });
      list = Array.from(set);
    } else if (productType === 'products') {
      // ONLY physical product categories
      const set = new Set<string>();
      PRODUCT_CATEGORIES.forEach(c => set.add(c));
      (categories || []).forEach(c => {
        if (c.primaryType !== 'SERVICE' && !isServiceCategory(c.name)) set.add(c.name);
      });
      products.forEach(p => {
        if (!isServiceProduct(p) && p.category && !isServiceCategory(p.category)) set.add(p.category);
      });
      list = Array.from(set);
    } else {
      // All Types: show all categories
      const set = new Set<string>();
      [...PRODUCT_CATEGORIES, ...SERVICE_CATEGORIES].forEach(c => set.add(c));
      (categories || []).forEach(c => { if (c.name) set.add(c.name); });
      products.forEach(p => { if (p.category) set.add(p.category); });
      list = Array.from(set);
    }

    if (selectedCategory && !list.includes(selectedCategory)) {
      list.unshift(selectedCategory);
    }

    return list;
  }, [productType, categories, products, selectedCategory]);
  
  // Get unique subcategories for the selected category filtered by type
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const catProducts = products.filter(p => {
      const matchCat = matchCategory(p.category, selectedCategory, p.subcategory, p.name);
      const isServ = isServiceProduct(p);
      if (productType === 'services') return matchCat && isServ;
      if (productType === 'products') return matchCat && !isServ;
      return matchCat;
    });
    return Array.from(new Set(catProducts.map(p => p.subcategory).filter(Boolean))) as string[];
  }, [selectedCategory, products, productType]);
  
  // Get available dynamic filters based on the selected category's parameters
  const availableDynamicFilters = useMemo(() => {
    if (!selectedCategory) return [];
    const categoryConfig = categories?.find(c => (c.name || '').toLowerCase() === (selectedCategory || '').toLowerCase());
    
    // Fallback logic to extract keys from products directly if no global category config exists
    if (!categoryConfig || !categoryConfig.parameters) {
       const catProducts = products.filter(p => matchCategory(p.category, selectedCategory, p.subcategory, p.name));
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
      products.filter(p => matchCategory(p.category, selectedCategory, p.subcategory, p.name)).forEach(p => {
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
          onChange={(e) => handleProductTypeChange(e.target.value)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none text-sm rounded-full px-4 py-2 font-medium cursor-pointer outline-none whitespace-nowrap appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%20fill%3D%22%2364748B%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.2rem_center] bg-[length:1.25rem_1.25rem] shrink-0 transition-colors"
        >
          <option value="all">All Types</option>
          <option value="products">Products Only</option>
          <option value="services">Services Only</option>
        </select>

        {/* Category Pill */}
        <select 
          value={selectedCategory} 
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none text-sm rounded-full px-4 py-2 font-medium cursor-pointer outline-none whitespace-nowrap appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%20fill%3D%22%2364748B%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.2rem_center] bg-[length:1.25rem_1.25rem] shrink-0 transition-colors"
        >
          <option value="">{productType === 'services' ? 'All Services' : productType === 'products' ? 'All Products' : 'All Categories'}</option>
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
          onClick={() => {
            const next = !isTopDeals;
            setIsTopDeals(next);
            if (next) setSortBy('discount');
          }} 
          className={`text-sm rounded-full px-4 py-2 font-bold whitespace-nowrap shrink-0 transition-colors border ${isTopDeals ? 'bg-red-50 text-red-600 border-red-300 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent'}`}
        >
          🔥 Top Deals
        </button>
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
            onClick={handleResetFilters}
            className="text-sm text-red-500 hover:text-red-600 font-bold whitespace-nowrap ml-4 shrink-0 px-2 cursor-pointer"
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              {isTopDeals ? '🔥 Top Deals & Exclusive Discounts' :
               b2bOnly ? '🏢 B2B Wholesale & Enterprise' :
               productType === 'services' && !selectedCategory ? '🛠️ All Services & Bookings' :
               selectedCategory ? selectedCategory : 'Search Results'}
            </h1>
            <p className="text-slate-500 font-medium">
              {filteredProducts.length} results found
              {q && ` for "${q}"`}
              {locationFilter && ` near "${locationFilter}"`}
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
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-12 my-4">
            <MascotState
              state="no-search"
              title="No Search Results"
              description={`We couldn't find anything matching ${q ? `"${q}"` : 'your filters'}. Try different keywords or reset your filters.`}
              actionText="Try Different Keywords"
              onAction={() => {
                const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
                if (searchInput) {
                  searchInput.focus();
                  searchInput.select();
                } else {
                  window.location.href = '/search';
                }
              }}
              secondaryText="Clear All Filters"
              onSecondaryAction={handleResetFilters}
            />
          </div>
        ) : (productType === 'services' || isServiceCategory(selectedCategory) || (filteredProducts.length > 0 && filteredProducts.every(p => isServiceProduct(p)))) ? (
          <ServiceDirectoryList products={filteredProducts} />
        ) : (
          <ProductGrid products={filteredProducts} productOnly={true} />
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
