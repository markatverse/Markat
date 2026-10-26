"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Star, Shield, Phone, Mail, Clock, CheckCircle, Ticket, ShoppingCart, Calendar, Stethoscope, Scissors, Wrench, MessageCircle, UtensilsCrossed, Utensils } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProductGridSkeleton from '@/components/ProductGridSkeleton';
import { isServiceProduct } from '@/utils/productSearch';


export default function PublicShopPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const shopName = decodeURIComponent(resolvedParams.id).replace(/-/g, ' ');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const [diningMenu, setDiningMenu] = useState<any[]>([]);

  useEffect(() => {
    const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        const items: any[] = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        const normalizedShop = shopName.toLowerCase().trim();
        const shopProducts = items.filter((p: any) => {
          const seller = (p.sellerName || p.seller || '').toLowerCase().trim();
          const sellerId = (p.sellerId || '').toLowerCase().trim();
          return seller === normalizedShop || 
                 seller.replace(/-/g, ' ') === normalizedShop ||
                 sellerId === normalizedShop ||
                 (normalizedShop.length > 2 && seller.includes(normalizedShop));
        });
        setProducts(shopProducts);

        // Load custom dining dishes managed by seller
        try {
          const sellerId = shopProducts[0]?.sellerId;
          if (sellerId) {
            const stored = localStorage.getItem(`markat_dining_menu_${sellerId}`);
            if (stored) {
              setDiningMenu(JSON.parse(stored));
            } else {
              setDiningMenu([]);
            }
          } else {
            setDiningMenu([]);
          }
        } catch {}
      })
      .catch(err => {
        console.error('Failed to load shop products:', err);
      })
      .finally(() => setIsLoading(false));
  }, [shopName]);

  // Check if this venue is Food & Dining / Restaurant
  const isFoodDining = products.some(p => {
    if (!isServiceProduct(p)) return false;
    const cat = (p.category || '').toLowerCase();
    const sub = (p.subcategory || '').toLowerCase();
    return cat.includes('restaurant') || cat.includes('dining') || sub.includes('restaurant') || sub.includes('cafe');
  }) || shopName.toLowerCase().includes('restaurant') || shopName.toLowerCase().includes('cafe') || shopName.toLowerCase().includes('bistro');

  // Categorize data into Services vs Products using strict isServiceProduct
  const services = products.filter(p => isServiceProduct(p));
  const physicalProducts = products.filter(p => !isServiceProduct(p));
  const shopProducts = products;

  // Determine Shop Theme based on what they offer
  const isMedical = shopName.toLowerCase().includes('clinic') || shopName.toLowerCase().includes('doctor') || shopName.toLowerCase().includes('hospital');
  const isSalon = shopName.toLowerCase().includes('salon') || shopName.toLowerCase().includes('spa') || shopName.toLowerCase().includes('barber');
  const isRepair = shopName.toLowerCase().includes('repair') || shopName.toLowerCase().includes('service');
  
  let Icon = Shield;
  let bannerColors = "from-blue-600 to-indigo-900";
  let themeColor = "blue";
  
  if (isFoodDining) {
    Icon = UtensilsCrossed;
    bannerColors = "from-rose-600 via-rose-700 to-amber-800";
    themeColor = "rose";
  } else if (isMedical) {
    Icon = Stethoscope;
    bannerColors = "from-emerald-600 to-teal-900";
    themeColor = "emerald";
  } else if (isSalon) {
    Icon = Scissors;
    bannerColors = "from-purple-600 to-fuchsia-900";
    themeColor = "purple";
  } else if (isRepair) {
    Icon = Wrench;
    bannerColors = "from-amber-600 to-orange-900";
    themeColor = "amber";
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Shop Cover Banner */}
      <div className={`h-72 w-full bg-gradient-to-r ${bannerColors} relative overflow-hidden flex items-center justify-center`}>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        
        {/* Shop Info Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          
          {/* Shop Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl shadow-xl border-4 border-white flex items-center justify-center text-5xl font-bold text-slate-800 relative overflow-hidden shrink-0">
            {shopName.charAt(0).toUpperCase()}
          </div>

          {/* Shop Details */}
          <div className="flex-1 text-center md:text-left mt-2">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 capitalize">{shopName}</h1>
              <span className={`bg-${themeColor}-100 text-${themeColor}-700 p-1.5 rounded-full`}><Icon className="w-5 h-5" /></span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-600 font-medium text-sm mb-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" /> {shopProducts.length > 0 && shopProducts[0].location ? shopProducts[0].location : 'Location unpinned'}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 4.9 (1,240 Reviews)</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500" /> Verified Business</span>
            </div>
            
            <p className="text-slate-500 leading-relaxed max-w-2xl">
              {isFoodDining 
                ? `Welcome to ${shopName}! Explore our culinary menu, reserve dining tables, or book exclusive private cabins for special occasions. We guarantee fresh preparation and top-tier hospitality.`
                : `Welcome to our official store on MarkatVerse! We specialize in providing high-quality ${services.length > 0 ? 'services' : ''} ${services.length > 0 && physicalProducts.length > 0 ? 'and' : ''} ${physicalProducts.length > 0 ? 'products' : ''} tailored to your needs. With over 5 years of excellence, we guarantee satisfaction and top-tier support.`
              }
            </p>
          </div>

          {/* Contact Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <a 
              href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello ${shopName}! I found your ${isFoodDining ? 'restaurant' : 'store'} on MarkatVerse and would like to inquire about reservations and menu.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> {isFoodDining ? 'WhatsApp Venue' : 'WhatsApp Store'}
            </a>
            <a 
              href="tel:+919876543210"
              className={`px-6 py-2.5 bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-${themeColor}-600/20 flex items-center justify-center gap-2`}
            >
              <Phone className="w-4 h-4" /> Call Direct
            </a>
            <a 
              href={`mailto:support@${shopName.replace(/\s+/g, '').toLowerCase()}.com?subject=${encodeURIComponent(`Customer Inquiry from MarkatVerse: ${shopName}`)}`}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" /> Send Email
            </a>
          </div>
        </div>

        {/* Shop Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
            <Clock className="w-6 h-6 text-slate-300 mb-2" />
            <div className="text-sm text-slate-500 font-medium mb-1">Working Hours</div>
            <div className="text-lg font-bold text-slate-900">10 AM - 8 PM</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-300 mb-2" />
            <div className="text-sm text-slate-500 font-medium mb-1">Orders/Bookings</div>
            <div className="text-lg font-bold text-slate-900">5,000+</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
            <Star className="w-6 h-6 text-amber-300 mb-2" />
            <div className="text-sm text-slate-500 font-medium mb-1">Satisfaction</div>
            <div className="text-lg font-bold text-emerald-600">98% Positive</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
            <Shield className="w-6 h-6 text-blue-300 mb-2" />
            <div className="text-sm text-slate-500 font-medium mb-1">Member Since</div>
            <div className="text-lg font-bold text-slate-900">2021</div>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8">
            <ProductGridSkeleton count={10} />
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* SERVICES SECTION */}
            {services.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-${themeColor}-100 text-${themeColor}-600 flex items-center justify-center`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Book Services</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <Link href={`/salon/${service.id}`} key={service.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-xl bg-${themeColor}-50 flex items-center justify-center overflow-hidden shrink-0`}>
                          {service.image ? (
                            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                          ) : (
                            <Icon className={`w-8 h-8 text-${themeColor}-400`} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">{service.name}</h3>
                          <div className="flex flex-col gap-1 mt-1">
                            {service.description && (
                              <p className="text-xs text-slate-500 line-clamp-1">{service.description}</p>
                            )}
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                              <Clock className="w-3.5 h-3.5" /> {service.duration || '30 mins'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <div className="text-xl font-bold text-slate-900">₹{service.price.toLocaleString()}</div>
                        <button className={`px-4 py-2 bg-${themeColor}-50 text-${themeColor}-700 rounded-lg font-bold text-sm flex items-center gap-2 group-hover:bg-${themeColor}-600 group-hover:text-white transition-colors`}>
                          <Ticket className="w-4 h-4" /> Join Queue
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* RESTAURANT FOOD MENU (When venue is Food & Dining) */}
            {isFoodDining ? (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <UtensilsCrossed className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Restaurant Menu</h2>
                      <p className="text-xs text-slate-500 font-medium">Freshly curated culinary selections, beverages & table dining</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-rose-600" /> Dine-in & Takeaway
                    </span>
                  </div>
                </div>

                {/* Menu Categories Grid */}
                {(() => {
                  const categoriesList = Array.from(new Set(diningMenu.map(d => d.category || 'Main Course')));
                  const defaultCats = categoriesList.length > 0 ? categoriesList : ['Starters', 'Main Course', 'Breads', 'Beverages'];

                  return (
                    <div className="space-y-8">
                      {defaultCats.map(cat => {
                        const itemsInCat = diningMenu.filter(d => (d.category || 'Main Course') === cat);
                        if (itemsInCat.length === 0) return null;

                        return (
                          <div key={cat} className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                              <h3 className="font-black text-slate-900 text-lg uppercase tracking-wide">{cat}</h3>
                              <span className="text-xs text-slate-400 font-bold ml-1">({itemsInCat.length})</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {itemsInCat.map(dish => (
                                <div 
                                  key={dish.id} 
                                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-3 mb-1.5">
                                      <div className="flex items-center gap-2">
                                        <span className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                                          dish.isVeg ? 'border-emerald-600' : 'border-rose-600'
                                        }`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                                        </span>
                                        <h4 className="font-extrabold text-slate-900 text-base leading-snug">{dish.name}</h4>
                                      </div>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                                      {dish.description}
                                    </p>
                                  </div>

                                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-lg font-black text-slate-900">₹{dish.price.toLocaleString('en-IN')}</span>
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                      dish.inStock !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                      {dish.inStock !== false ? 'Available' : 'Sold Out'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Table Reservation & Venue Specials Links */}
                {physicalProducts.length > 0 && (
                  <div className="pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                          <UtensilsCrossed className="w-5 h-5 text-rose-600" /> Table Reservations & Dining Setups
                        </h3>
                        <p className="text-xs text-slate-500">Book regular tables, candlelight setups, or rooftop cabins at this restaurant</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {physicalProducts.map(p => (
                        <Link href={`/service/${p.id}`} key={p.id} target="_blank" rel="noopener noreferrer">
                          <div className="bg-white rounded-2xl border border-rose-200/80 shadow-xs hover:shadow-lg transition-all p-4 flex items-center gap-4 group cursor-pointer">
                            <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-rose-400">
                                  <UtensilsCrossed className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-600 transition-colors truncate">
                                {p.name}
                              </h4>
                              <div className="text-xs text-slate-500 mt-0.5">Table & Dining Booking</div>
                              <div className="text-base font-black text-rose-600 mt-2">
                                ₹{p.price.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* PRODUCTS SECTION (Standard Retail Shop) */
              physicalProducts.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Buy Products</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {physicalProducts.map((product) => (
                      <Link href={`/product/${product.id}`} key={product.id} target="_blank" rel="noopener noreferrer">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer h-full flex flex-col">
                          <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <img src="/hero-left-logo.png" alt={product.name} className="w-full h-full object-contain opacity-50 p-4 group-hover:scale-105 transition-transform duration-500" />
                            )}
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-slate-900 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mb-3 text-xs">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span className="font-bold text-slate-700">{product.rating}</span>
                              <span className="text-slate-400">({product.reviews})</span>
                            </div>
                            <div className="mt-auto flex items-center justify-between">
                              <span className="text-lg font-black text-slate-900">₹{product.price.toLocaleString()}</span>
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <ShoppingCart className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}
            
            {services.length === 0 && physicalProducts.length === 0 && diningMenu.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Listings Yet</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  {shopName} has not added any products or services yet. Please check back later.
                </p>
                <div className="mt-6">
                  <Link href="/search">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all">
                      Explore Other Sellers
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
