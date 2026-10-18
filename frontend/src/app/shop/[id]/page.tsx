"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Star, Shield, Phone, Mail, Clock, CheckCircle, Ticket, ShoppingCart, Calendar, Stethoscope, Scissors, Wrench, MessageCircle, UtensilsCrossed, Utensils } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProductGridSkeleton from '@/components/ProductGridSkeleton';


export default function PublicShopPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const shopName = decodeURIComponent(resolvedParams.id).replace(/-/g, ' ');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        const items: any[] = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        let shopProducts = items.filter((p: any) => 
          (p.sellerName || p.seller || '').toLowerCase().includes(shopName.toLowerCase().split(' ')[0])
        );
        if (shopProducts.length === 0) {
          shopProducts = items.slice(0, 6);
        }
        setProducts(shopProducts);
      })
      .catch(err => {
        console.error('Failed to load shop products:', err);
      })
      .finally(() => setIsLoading(false));
  }, [shopName]);

  // Check if this venue is Food & Dining / Restaurant
  const isFoodDining = products.some(p => {
    const cat = (p.category || '').toLowerCase();
    const sub = (p.subcategory || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    return cat.includes('food') || cat.includes('dining') || cat.includes('restaurant') ||
           sub.includes('food') || sub.includes('dining') || sub.includes('restaurant') || sub.includes('cafe') ||
           name.includes('restaurant') || name.includes('cafe') || name.includes('dining');
  }) || shopName.toLowerCase().includes('restaurant') || shopName.toLowerCase().includes('cafe') || shopName.toLowerCase().includes('dining') || shopName.toLowerCase().includes('kitchen') || shopName.toLowerCase().includes('food');

  // Categorize mock data into Services vs Products
  const services = products.filter(p => {
    const searchStr = `${p.category || ''} ${p.name} ${p.tags?.join(' ') || ''}`.toLowerCase();
    return !isFoodDining && (searchStr.includes('service') || searchStr.includes('salon') || searchStr.includes('hair') || searchStr.includes('doctor') || searchStr.includes('repair') || searchStr.includes('consultation') || searchStr.includes('spa') || searchStr.includes('trim'));
  });
  
  const physicalProducts = products.filter(p => !services.includes(p));
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

            {/* PRODUCTS / DINING MENU SECTION */}
            {physicalProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isFoodDining 
                      ? 'bg-rose-100 text-rose-600' 
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {isFoodDining ? (
                      <UtensilsCrossed className="w-5 h-5" />
                    ) : (
                      <ShoppingCart className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {isFoodDining ? 'Food & Dining Menu' : 'Buy Products'}
                    </h2>
                    {isFoodDining && (
                      <p className="text-xs text-slate-500 font-medium">Explore dishes, special platters, table reservations & dining setups</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {physicalProducts.map((product) => (
                    <Link href={`/product/${product.id}`} key={product.id}>
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer h-full flex flex-col">
                        <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <img src="/hero-left-logo.png" alt={product.name} className="w-full h-full object-contain opacity-50 p-4 group-hover:scale-105 transition-transform duration-500" />
                          )}
                          {isFoodDining && (
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <UtensilsCrossed className="w-3 h-3 text-rose-400" /> Menu
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-bold text-slate-900 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mb-3 text-xs">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="font-bold text-slate-700">{product.rating}</span>
                            <span className="text-slate-400">({product.reviews})</span>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <span className="text-lg font-black text-slate-900">₹{product.price.toLocaleString()}</span>
                            {!isFoodDining && (
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <ShoppingCart className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
