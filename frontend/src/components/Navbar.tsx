"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { Search, MapPin, Headphones, Store, ShoppingCart, User, ChevronDown, Package, Loader2 } from "lucide-react";
import LiveTokenToggle from "@/components/LiveTokenToggle";
import EcosystemSwitcher from "@/components/EcosystemSwitcher";
import { isServiceProduct, matchesProductSearch } from '@/utils/productSearch';
import { LOGO_DATA_URI } from '@/utils/logoDataUri';

export default function Navbar() {
  const { items } = useCart();
  const { user, isLoading } = useAuth();
  const { userLocation, setUserLocation, setUserLat, setUserLng, products, categories } = useProducts();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [isApplyingLocation, setIsApplyingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleApplyLocation = async () => {
    const rawInput = locationInput.trim();
    if (!rawInput) return;

    setIsApplyingLocation(true);
    setLocationError(null);

    const cleanPin = rawInput.replace(/\D/g, '');
    const isPincode = cleanPin.length === 6;

    try {
      if (isPincode) {
        let district = '';
        let state = '';
        let locality = '';

        try {
          const pinRes = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`).then(r => r.json());
          if (pinRes && pinRes[0] && pinRes[0].Status === 'Success' && Array.isArray(pinRes[0].PostOffice) && pinRes[0].PostOffice.length > 0) {
            const po = pinRes[0].PostOffice[0];
            district = po.District || '';
            state = po.State || '';
            locality = (po.Block && po.Block !== 'NA') ? po.Block : (po.Name || '');
          }
        } catch (e) {
          console.warn('Pincode lookup error:', e);
        }

        let lat: number | null = null;
        let lng: number | null = null;

        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${cleanPin}&country=India&format=json`, {
            headers: { 'User-Agent': 'MarkatVerse/1.0' }
          }).then(r => r.json());

          if (Array.isArray(geoRes) && geoRes.length > 0) {
            lat = parseFloat(geoRes[0].lat);
            lng = parseFloat(geoRes[0].lon);
          } else if (district) {
            const districtRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${district}, ${state}, India`)}&format=json&limit=1`, {
              headers: { 'User-Agent': 'MarkatVerse/1.0' }
            }).then(r => r.json());
            if (Array.isArray(districtRes) && districtRes.length > 0) {
              lat = parseFloat(districtRes[0].lat);
              lng = parseFloat(districtRes[0].lon);
            }
          }
        } catch (e) {
          console.warn('Nominatim lookup error:', e);
        }

        let displayLocation = cleanPin;
        if (locality && district && locality !== district) {
          displayLocation = `${locality}, ${district} (${cleanPin})`;
        } else if (district) {
          displayLocation = `${district}, ${cleanPin}`;
        } else if (state) {
          displayLocation = `${state}, ${cleanPin}`;
        }

        setUserLocation(displayLocation);
        setUserLat(lat);
        setUserLng(lng);
        setLocationInput(displayLocation);
        setIsLocationPopupOpen(false);
      } else {
        // City or text query
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(rawInput)}&countrycodes=in&format=json&limit=1`, {
          headers: { 'User-Agent': 'MarkatVerse/1.0' }
        }).then(r => r.json());

        if (Array.isArray(geoRes) && geoRes.length > 0) {
          const lat = parseFloat(geoRes[0].lat);
          const lng = parseFloat(geoRes[0].lon);
          const parts = (geoRes[0].display_name || '').split(',').map((s: string) => s.trim());
          const cleanName = parts.slice(0, 2).join(', ');

          setUserLocation(cleanName || rawInput);
          setUserLat(lat);
          setUserLng(lng);
          setLocationInput(cleanName || rawInput);
        } else {
          setUserLocation(rawInput);
          setUserLat(null);
          setUserLng(null);
        }
        setIsLocationPopupOpen(false);
      }
    } catch (err) {
      console.error('Failed to resolve location:', err);
      setUserLocation(rawInput);
      setUserLat(null);
      setUserLng(null);
      setIsLocationPopupOpen(false);
    } finally {
      setIsApplyingLocation(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const searchRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 120);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const suggestions = useMemo(() => {
    const query = debouncedQuery.trim();
    if (query.length < 2) return [];
    const matchingProducts = products
      .filter(product => matchesProductSearch(product, query))
      .slice(0, 5)
      .map(product => ({
        id: product.id,
        label: product.name,
        detail: [product.category, product.seller].filter(Boolean).join(' · '),
        href: isServiceProduct(product) ? `/service/${product.id}` : `/product/${product.id}`,
        type: 'listing' as const,
      }));
    const matchingCategories = categories
      .filter(category => category.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
      .slice(0, 3)
      .map(category => ({
        id: category.id,
        label: category.name,
        detail: `Browse ${category.name}`,
        href: `/search?cat=${encodeURIComponent(category.name)}`,
        type: 'category' as const,
      }));

    return [...matchingCategories, ...matchingProducts].slice(0, 7);
  }, [categories, products, debouncedQuery]);

  useEffect(() => {
    const closeSuggestions = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setIsSearchFocused(false);
        setActiveSuggestion(-1);
      }
    };
    document.addEventListener('mousedown', closeSuggestions);
    return () => document.removeEventListener('mousedown', closeSuggestions);
  }, []);

  const openSuggestion = (suggestion: (typeof suggestions)[number]) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    if (suggestion.type === 'listing') {
      window.open(suggestion.href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(suggestion.href);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = debouncedQuery.trim();
    if (!query) return;
    const params = new URLSearchParams();
    params.set("q", query);
    setIsSearchFocused(false);
    setActiveSuggestion(-1);
    router.push(`/search?${params.toString()}`);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchFocused || suggestions.length === 0) {
      if (event.key === 'Escape') setIsSearchFocused(false);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestion(index => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestion(index => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter' && activeSuggestion >= 0) {
      event.preventDefault();
      openSuggestion(suggestions[activeSuggestion]);
    } else if (event.key === 'Escape') {
      setIsSearchFocused(false);
      setActiveSuggestion(-1);
    }
  };

  const roleLower = (user?.role || '').toLowerCase();
  const isAdmin = roleLower.includes('admin');
  const isSellerOrBusiness = roleLower === 'seller' || roleLower === 'business' || roleLower === 'elite';

  return (
    <nav className="flex flex-wrap md:flex-nowrap items-center justify-between py-2.5 px-3 sm:px-6 bg-white border-b border-slate-200 sticky top-0 z-[999] shadow-xs gap-y-3 gap-x-3 md:gap-x-4">
      {/* 1. Logo (Top Left on Mobile, Left on Desktop) */}
      <div className="flex items-center shrink-0 order-1">
        <Link href="/" className="flex items-center no-underline hover:opacity-90 transition-opacity mr-2 sm:mr-4 md:mr-5 shrink-0">
          <picture>
            <source srcSet="/logo.svg" type="image/svg+xml" />
            <source srcSet="/logo-optimized.webp" type="image/webp" />
            <img 
              src="/logo.svg" 
              alt="MarkatVerse" 
              loading="eager" 
              fetchPriority="high" 
              decoding="sync"
              width={164}
              height={40}
              className="h-9 sm:h-10 lg:h-11 w-auto object-contain" 
            />
          </picture>
        </Link>
      </div>

      {!isAdmin && (
        <>
          {/* Deliver to (Hidden on Mobile, Left on Desktop) */}
          <div
            className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 cursor-pointer relative hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200 shrink-0 order-2"
            onClick={() => setIsLocationPopupOpen(!isLocationPopupOpen)}
          >
            <MapPin className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
            <div className="flex flex-col gap-0">
              <span className="text-[11px] text-slate-600 font-medium leading-none">Deliver to</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5 leading-none">
                {userLocation || "Select Location"}
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </span>
            </div>

            {isLocationPopupOpen && (
              <div
                className="absolute top-full left-0 mt-3 bg-white p-5 rounded-xl shadow-xl w-[320px] z-[1000] border border-slate-200 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="mb-2 text-sm font-bold text-slate-800">Choose your location</h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">Delivery options and speeds may vary depending on your specific location</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Enter pincode or city"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
                    value={locationInput}
                    disabled={isApplyingLocation}
                    onChange={(e) => {
                      setLocationInput(e.target.value);
                      if (locationError) setLocationError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyLocation();
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={isApplyingLocation || !locationInput.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[72px] cursor-pointer"
                    onClick={handleApplyLocation}
                  >
                    {isApplyingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {locationError && (
                  <p className="text-[11px] text-rose-500 mb-2 font-medium">{locationError}</p>
                )}
                <button
                  onClick={() => {
                    if (!navigator.geolocation) {
                      alert("Geolocation is not supported by your browser");
                      return;
                    }
                    setUserLocation("Locating...");
                    navigator.geolocation.getCurrentPosition(async (position) => {
                      try {
                        const { latitude, longitude } = position.coords;
                        setUserLat(latitude);
                        setUserLng(longitude);
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
                          headers: { 'User-Agent': 'MarkatVerse/1.0' }
                        });
                        const data = res.ok ? await res.json() : null;

                        if (data && data.address) {
                          const houseNumber = data.address.house_number || data.address.building || '';
                          const road = data.address.road || data.address.street || data.address.pedestrian || data.address.residential || data.address.footway || data.address.path || data.address.alley || data.address.hamlet || data.address.locality;
                          const neighbourhood = data.address.neighbourhood || data.address.suburb || data.address.quarter;
                          const city = data.address.city || data.address.town || data.address.village || data.address.state_district;
                          const pincode = data.address.postcode;
                          
                          const streetArea = [houseNumber, road].filter(Boolean).join(' ');
                          const parts = [streetArea, neighbourhood, city].filter(Boolean);
                          const preciseShort = parts.slice(0, 2).join(', ');
                          
                          if (city) {
                            const displayStr = city + (pincode ? `, ${pincode}` : '');
                            setLocationInput(pincode || city || preciseShort);
                            setUserLocation(displayStr);
                          } else if (data.display_name) {
                            const fallback = data.display_name.split(',').slice(0, 2).join(',');
                            setLocationInput(pincode || fallback);
                            setUserLocation(fallback);
                          } else {
                            setUserLocation("Select Location");
                            alert("Could not determine your address.");
                          }
                        } else {
                          setUserLocation("Select Location");
                          alert("Could not determine your precise location.");
                        }
                      } catch (error) {
                        console.error("Error fetching location:", error);
                        setUserLocation("Select Location");
                        alert("Failed to fetch location details.");
                      } finally {
                        setIsLocationPopupOpen(false);
                      }
                    }, (error) => {
                      console.error("Geolocation error:", error);
                      setUserLocation("Select Location");
                      alert("Unable to retrieve your location. Please check your browser permissions.");
                    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Use my current location
                </button>
              </div>
            )}
          </div>

          {/* 3. Search Bar (Bottom Row on Mobile, Middle on Desktop) */}
          <form ref={searchRef} onSubmit={handleSearch} className="relative flex items-stretch order-3 md:order-2 w-full md:flex-1 md:max-w-[620px] lg:max-w-[700px] bg-white rounded-xl overflow-hidden md:mx-3 lg:mx-5 border border-[#E5D8BF] hover:border-blue-500 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-xs">
            <input
              type="text"
              placeholder="Search for products, brands, services..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveSuggestion(-1);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isSearchFocused && suggestions.length > 0}
              aria-controls="navbar-search-suggestions"
              aria-activedescendant={activeSuggestion >= 0 ? `search-suggestion-${activeSuggestion}` : undefined}
              className="flex-1 bg-transparent text-slate-800 border-none py-2.5 px-4 outline-none placeholder:text-slate-400 text-sm"
            />

            <button type="submit" aria-label="Search" className="cursor-pointer px-5 md:px-6 bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center justify-center transition-colors shrink-0 rounded-r-xl">
              <Search className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            </button>
            {isSearchFocused && suggestions.length > 0 && (
              <div
                id="navbar-search-suggestions"
                role="listbox"
                className="absolute left-0 right-0 top-full z-[110] mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    id={`search-suggestion-${index}`}
                    key={`${suggestion.type}-${suggestion.id}`}
                    type="button"
                    role="option"
                    aria-selected={activeSuggestion === index}
                    onMouseEnter={() => setActiveSuggestion(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => openSuggestion(suggestion)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      activeSuggestion === index ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {suggestion.type === 'category' ? (
                      <Search className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : (
                      <Package className="h-4 w-4 shrink-0 text-blue-500" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">{suggestion.label}</span>
                      <span className="block truncate text-xs text-slate-500">{suggestion.detail}</span>
                    </span>
                  </button>
                ))}
                <div className="border-t border-slate-100 px-4 pt-2 text-xs text-slate-500">
                  Press Enter to search for “{searchQuery.trim()}”
                </div>
              </div>
            )}
          </form>
        </>
      )}

      {isAdmin && (
        <div className="flex-1 flex justify-center hidden md:flex order-2">
          <div className="bg-amber-50 px-5 py-2 rounded-lg border border-amber-500/50 flex items-center gap-2 shadow-sm">
            <span className="text-amber-500">🛡️</span>
            <span className="text-amber-600 font-bold text-sm tracking-wide">ADMIN MODE</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 text-slate-700 shrink-0 order-2 md:order-3 ml-auto md:ml-0">
        <EcosystemSwitcher />

        {!isAdmin && (
          <>
            <Link href="/help" className="hidden lg:flex flex-col items-center justify-center h-11 px-2.5 rounded-xl hover:bg-slate-100 hover:text-blue-700 transition-all group">
              <Headphones className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-700">Help</span>
            </Link>

            {isLoading ? (
              <div className="hidden md:flex flex-col items-center gap-1 ml-2 opacity-50">
                <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
                <div className="hidden lg:block w-16 h-3 bg-slate-200 rounded animate-pulse mt-1"></div>
              </div>
            ) : user && isSellerOrBusiness ? (
              // Logged in as Seller
              <Link href="/seller/dashboard" className="flex flex-col items-center justify-center h-11 px-2.5 rounded-xl hover:bg-slate-100 hover:text-blue-700 transition-all group">
                <Store className="w-5 h-5 group-hover:scale-110 transition-transform text-indigo-600" strokeWidth={1.5} />
                <span className="hidden lg:block text-[11px] font-bold text-indigo-600">Seller Dashboard</span>
                <span className="lg:hidden text-[10px] font-bold text-indigo-600">Dashboard</span>
              </Link>
            ) : (
              // Not logged in or Logged in as Buyer: show Become a Seller
              <Link href={user ? "/seller/onboarding" : "/seller/login"} className="flex flex-col items-center justify-center h-11 px-2.5 rounded-xl hover:bg-slate-100 hover:text-blue-700 transition-all group">
                <Store className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <span className="hidden lg:block text-[11px] font-medium">Become a Seller</span>
                <span className="lg:hidden text-[10px] font-medium">Seller</span>
              </Link>
            )}
          </>
        )}

        {user && (
          <>
            <LiveTokenToggle />
          </>
        )}

        {!isAdmin && (
          <>
            {isLoading ? (
              <div className="hidden md:flex flex-col items-center gap-1 ml-2 opacity-50">
                <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
                <div className="w-6 h-3 bg-slate-200 rounded animate-pulse mt-1"></div>
              </div>
            ) : user && (
              <>
                <Link href="/cart" className="hidden md:flex flex-col items-center justify-center h-11 px-2.5 rounded-xl hover:bg-slate-100 hover:text-blue-700 transition-all relative group">
                  {cartItemCount > 0 && (
                    <div className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-900 font-bold text-[10px] py-[1px] px-1.5 rounded-full border border-white">{cartItemCount}</div>
                  )}
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                  <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-700">Cart</span>
                </Link>
              </>
            )}
          </>
        )}

        <div className="hidden md:flex ml-1 pl-3 sm:pl-4 border-l border-slate-200 items-center">
          {isLoading ? (
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>
              <div className="hidden lg:flex flex-col gap-1">
                <div className="w-20 h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="w-16 h-3 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          ) : user ? (
            <Link href="/profile/settings" className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-slate-100 transition-all">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm border-2 border-white ring-2 ring-amber-300/70">
                {user.name.charAt(0)}
              </div>
              <div className="hidden lg:flex flex-col items-start gap-0">
                <span className="font-semibold text-sm text-slate-800">{user.name}</span>
                <span className="text-[11px] text-slate-500 font-medium">My Account <ChevronDown className="inline w-3 h-3" /></span>
              </div>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-2 cursor-pointer bg-white hover:bg-white/95 px-4 py-2 rounded-xl transition-all border border-slate-200 shadow-xs group">
              <User className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" strokeWidth={2} />
              <span className="font-semibold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
