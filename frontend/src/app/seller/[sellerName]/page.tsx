"use client";
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function SellerStorefront() {
  const params = useParams();
  const sellerNameRaw = params?.sellerName as string;
  const sellerName = sellerNameRaw ? decodeURIComponent(sellerNameRaw) : '';
  
  const { products } = useProducts();
  const { addToCart } = useCart();

  const sellerProducts = products.filter(p => 
    p.seller === sellerName || 
    p.seller?.toLowerCase().replace(/ /g, '-') === sellerName?.toLowerCase()
  );

  // If we found a matching product, use its proper seller name for display, otherwise fallback to the URL name
  const displaySellerName = sellerProducts.length > 0 ? sellerProducts[0].seller : sellerName;

  // Dynamic detection (Mocked based on name for demonstration)
  const isDoctor = sellerName.toLowerCase().includes('hospital') || sellerName.toLowerCase().includes('clinic') || sellerName.toLowerCase().includes('doctor');
  const isSpa = sellerName.toLowerCase().includes('spa');
  const isSalon = sellerName.toLowerCase().includes('salon');
  const isCarWash = sellerName.toLowerCase().includes('wash') || sellerName.toLowerCase().includes('car');
  
  const isService = isDoctor || isSpa || isSalon || isCarWash;

  const [activeTab, setActiveTab] = useState('services');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // MOCK DATA FOR SERVICES
  const getMockServices = () => {
    if (isDoctor) {
      return [
        { id: 'm1', name: 'General Consultation', duration: '15 mins', price: 500, category: 'Consult', description: 'Basic checkup and medical advice.', icon: '🩺' },
        { id: 'm2', name: 'Dental Checkup', duration: '30 mins', price: 1000, category: 'Dental', description: 'Teeth cleaning and cavity check.', icon: '🦷' },
        { id: 'm3', name: 'Eye Examination', duration: '20 mins', price: 800, category: 'Vision', description: 'Comprehensive eye test.', icon: '👁️' },
        { id: 'm4', name: 'Full Body Checkup', duration: '60 mins', price: 3500, category: 'Lab', description: 'Complete pathology and blood work.', icon: '🧪' },
      ];
    } else if (isSpa) {
      return [
        { id: 'sp1', name: 'Aromatherapy Massage', duration: '60 mins', price: 2500, category: 'Massage', description: 'Relaxing massage with essential oils.', icon: '💆' },
        { id: 'sp2', name: 'Deep Tissue Massage', duration: '90 mins', price: 3500, category: 'Massage', description: 'Intensive muscle relaxation.', icon: '💆‍♂️' },
        { id: 'sp3', name: 'Facial Treatment', duration: '45 mins', price: 1500, category: 'Skin', description: 'Deep cleansing and glowing facial.', icon: '✨' },
        { id: 'sp4', name: 'Hot Stone Therapy', duration: '60 mins', price: 3000, category: 'Therapy', description: 'Therapeutic heated stones.', icon: '🪨' },
      ];
    } else if (isCarWash) {
      return [
        { id: 'cw1', name: 'Mini Car Wash', duration: '30 mins', price: 300, category: 'Wash', description: 'Exterior and interior cleaning for small cars.', icon: '🚗' },
        { id: 'cw2', name: 'Car Wash', duration: '45 mins', price: 500, category: 'Wash', description: 'Standard exterior and interior cleaning.', icon: '🚙' },
        { id: 'cw3', name: 'Bike Wash', duration: '20 mins', price: 150, category: 'Wash', description: 'Two-wheeler pressure wash and polish.', icon: '🏍️' },
        { id: 'cw4', name: 'Bus Wash', duration: '90 mins', price: 1200, category: 'Wash', description: 'Heavy vehicle deep cleaning.', icon: '🚌' },
        { id: 'cw5', name: 'Truck Wash', duration: '120 mins', price: 1500, category: 'Wash', description: 'Complete wash for commercial trucks.', icon: '🚛' },
      ];
    } else {
      // Default to Salon
      return [
        { id: 's1', name: 'Premium Haircut', duration: '45 mins', price: 499, category: 'Hair', description: 'Includes wash, cut, and professional styling.', icon: '✂️' },
        { id: 's2', name: 'Beard Trimming & Styling', duration: '30 mins', price: 299, category: 'Beard', description: 'Precision beard shaping and hot towel treatment.', icon: '🧔' },
        { id: 's3', name: 'Hair Dyeing & Highlights', duration: '90 mins', price: 1499, category: 'Color', description: 'Ammonia-free coloring with premium brands.', icon: '🎨' },
        { id: 's4', name: 'Relaxing Spa Massage', duration: '60 mins', price: 1999, category: 'Spa', description: 'Full body deep tissue massage with essential oils.', icon: '💆' },
      ];
    }
  };

  const dynamicServices = getMockServices();
  const availableServices = dynamicServices;
  const [selectedProductOptions, setSelectedProductOptions] = useState<Record<string, string>>({});

  const cartTotal = availableServices.filter(s => selectedServices.includes(s.id)).reduce((sum, s) => sum + s.price, 0);

  const firstProduct = sellerProducts.length > 0 ? sellerProducts[0] : null;
  const locationString = firstProduct?.location || 'Location unpinned';
  const distanceString = firstProduct?._distance != null && firstProduct._distance !== Infinity 
    ? `${firstProduct._distance.toFixed(1)} km away • ` 
    : '';

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-20">
      {/* Storefront Hero Header */}
      <div className="bg-slate-900 text-white pt-20 pb-12 px-4 sm:px-8 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-800 rounded-2xl md:rounded-full overflow-hidden flex items-center justify-center text-4xl sm:text-5xl border-4 border-slate-700 shadow-lg shrink-0">
            {firstProduct?.image ? (
              <img src={firstProduct.image} alt={displaySellerName} className="w-full h-full object-cover" />
            ) : (
              isService ? (isDoctor ? '🏥' : isSpa ? '💆' : '✂️') : '🏬'
            )}
          </div>
          <div className="flex-1 text-center md:text-left w-full">
            <h1 className="text-3xl sm:text-4xl font-extrabold flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 mb-3">
              {displaySellerName}
              <span className="bg-emerald-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1 shadow">
                <span>🛡️</span> Verified
              </span>
            </h1>
            <div className="text-slate-400 text-xs sm:text-sm flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6 font-medium">
              <span className="flex items-center gap-1">⭐ New Seller</span>
              <span className="flex items-center gap-1">📍 {distanceString}{locationString}</span>
              {!isService && <span className="flex items-center gap-1">📦 {sellerProducts.length} Products</span>}
            </div>
          </div>
          <div className="flex gap-3 sm:gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 sm:px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold shadow-lg transition text-sm sm:text-base">
              Contact
            </button>
            <button className="flex-1 md:flex-none px-4 sm:px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-semibold transition text-sm sm:text-base">
              + Follow
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
        
        {/* ======================= */}
        {/* SERVICE / SALON LAYOUT  */}
        {/* ======================= */}
        {isService ? (
          <div>
            {/* Top Dark Header Section */}
            <div className="bg-[#111827] text-white rounded-2xl md:rounded-3xl p-5 md:p-10 mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 md:p-6 flex gap-2 md:gap-3 z-20">
                <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur transition text-sm md:text-base">♡</button>
                <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur transition text-xs md:text-sm font-medium">Share</button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 relative z-10">
                {/* Left Image */}
                <div className="w-full md:w-[320px] shrink-0 relative rounded-2xl overflow-hidden shadow-2xl h-64 md:h-[400px]">
                  <img 
                    src={
                      firstProduct?.image 
                        ? firstProduct.image 
                        : (isDoctor 
                            ? "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80" 
                            : isSpa 
                            ? "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80" 
                            : "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80")
                    } 
                    alt={displaySellerName} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-wider">SERVICES</div>
                  <div className="absolute bottom-4 left-4 right-4 bg-emerald-500 text-white font-bold text-xs md:text-sm py-2 md:py-3 px-3 md:px-4 rounded-xl text-center shadow-lg flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Live Token Queue Active
                  </div>
                </div>

                {/* Right Info */}
                <div className="flex-1 flex flex-col justify-center mt-2 md:mt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold flex items-center gap-1">🎫 Smart Queue</span>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold flex items-center gap-1">⚡ Instant Booking</span>
                    <span className="bg-slate-700 text-slate-300 border border-slate-600 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold flex items-center gap-1">📈 Top Rated</span>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black mb-3 md:mb-4 tracking-tight">{displaySellerName}</h1>
                  
                  <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 flex-wrap">
                    <div className="bg-amber-500/20 text-amber-300 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5">
                      ⭐ New <span className="text-amber-300/70 font-medium">(0 reviews)</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm text-slate-300 flex items-center gap-1.5">
                      📍 {distanceString}{locationString}
                    </div>
                  </div>

                  {/* Provider Card */}
                  <div className="bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl flex items-center justify-between backdrop-blur mt-auto max-w-xl w-full">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-500 rounded-full flex items-center justify-center text-lg md:text-xl font-bold shadow-inner">
                        {sellerName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5 md:mb-1">Service Provider</div>
                        <div className="text-base md:text-xl font-bold text-white">{displaySellerName}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 md:gap-2">
                      <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1">
                        🛡️ Verified Pro
                      </div>
                      <button className="text-xs md:text-sm text-indigo-300 hover:text-indigo-200 font-semibold flex items-center gap-1">
                        📞 Call now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
              {/* Left Column (Main Info) */}
              <div className="flex-1 space-y-6 md:space-y-8">
                {/* Tabs - Scrollable on mobile */}
                <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto hide-scrollbar">
                  <button className="flex-1 min-w-[120px] bg-indigo-600 text-white py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm shadow-md transition">
                    ⓘ About
                  </button>
                  <button className="flex-1 min-w-[140px] text-gray-500 hover:bg-gray-50 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm transition">
                    ✓ What&apos;s Included
                  </button>
                  <button className="flex-1 min-w-[120px] text-gray-500 hover:bg-gray-50 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm transition">
                    📸 Gallery
                  </button>
                </div>

                <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-indigo-500">ⓘ</span> About This Business
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6">
                    Experience top-tier service tailored to your needs. Our professionals use the best practices and tools to ensure your complete satisfaction. We specialize in providing high-quality experiences with a focus on hygiene, safety, and customer care.
                  </p>
                  
                  {/* Detailed Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">🕒</div>
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Business Hours</div>
                        <div className="text-sm font-medium text-gray-900">Mon - Sat: 9:00 AM - 8:00 PM</div>
                        <div className="text-xs text-red-500 font-medium">Sunday: Closed</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">💬</div>
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Languages Spoken</div>
                        <div className="text-sm font-medium text-gray-900">English, Hindi</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 sm:col-span-2 mt-2">
                      <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">📍</div>
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Exact Location</div>
                        <div className="text-sm font-medium text-gray-900">{distanceString}{locationString}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 sm:col-span-2 mt-2">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">🛡️</div>
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Store Policies</div>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mt-1">
                          <li>Instant token generation upon walk-in.</li>
                          <li>Cancellations allowed up to 2 hours prior to appointments.</li>
                          <li>Sanitized tools and premium hygiene standards maintained.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Our Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {dynamicServices.map(service => (
                      <div key={service.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 md:p-6 border border-gray-100 flex flex-col">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                          <div>
                            <span className="text-[10px] md:text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded mb-2 inline-block uppercase">
                              {service.category}
                            </span>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">{service.name}</h3>
                          </div>
                          <div className="text-lg md:text-xl font-extrabold text-gray-900 shrink-0 ml-2">
                            ₹{service.price}
                          </div>
                        </div>
                        
                        <p className="text-xs md:text-sm text-gray-600 flex-1 mb-4 md:mb-6">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <span className="text-xs md:text-sm font-medium text-gray-500 flex items-center gap-1">
                            ⏱️ {service.duration}
                          </span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                if (selectedServices.includes(service.id)) {
                                  setSelectedServices(prev => prev.filter(id => id !== service.id));
                                } else {
                                  setSelectedServices(prev => [...prev, service.id]);
                                }
                              }}
                              className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold rounded-lg transition border ${
                                selectedServices.includes(service.id)
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-50 hover:bg-indigo-100'
                              }`}
                            >
                              {selectedServices.includes(service.id) ? 'Selected ✓' : 'Select'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Queue Explainer */}
                <div className="bg-indigo-50/50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-indigo-100">
                  <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-lg shadow-indigo-200">🎫</div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900">Smart Queue System</h3>
                      <p className="text-xs md:text-sm text-gray-500">No appointments. Just walk in.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
                      <div className="absolute top-3 right-3 text-indigo-100 font-black text-lg md:text-xl">01</div>
                      <div className="text-2xl md:text-3xl mb-3">🚶</div>
                      <h4 className="font-bold text-sm md:text-base text-gray-900 mb-1 md:mb-2">Walk In Anytime</h4>
                      <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">No appointment. Show up whenever it&apos;s convenient.</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
                      <div className="absolute top-3 right-3 text-indigo-100 font-black text-lg md:text-xl">02</div>
                      <div className="text-2xl md:text-3xl mb-3">🎟️</div>
                      <h4 className="font-bold text-sm md:text-base text-gray-900 mb-1 md:mb-2">Get a Token</h4>
                      <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">Enter your name, get an instant queue number.</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
                      <div className="absolute top-3 right-3 text-indigo-100 font-black text-lg md:text-xl">03</div>
                      <div className="text-2xl md:text-3xl mb-3">📱</div>
                      <h4 className="font-bold text-sm md:text-base text-gray-900 mb-1 md:mb-2">Track & Return</h4>
                      <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">See live wait time. Leave, come back just in time.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Booking Widget) */}
              <div className="w-full lg:w-[420px] shrink-0 hidden md:block">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-6">
                  {/* Price Header */}
                  <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Starting Price</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-gray-900">₹500</span>
                        <span className="text-sm text-gray-500 font-medium">/session</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 font-medium">Per Hour</div>
                      <div className="text-indigo-600 font-bold">Premium Rate</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-bold text-gray-900">Live Queue Status</span>
                  </div>

                  {/* Form Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">🎟️ Get Your Token</h3>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-indigo-50/50 rounded-2xl p-5 mb-6">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Order</div>
                    
                    {selectedServices.length === 0 ? (
                      <div className="text-sm text-gray-500 italic mb-3">Select services from the list</div>
                    ) : (
                      <div className="space-y-2 mb-3">
                        {availableServices.filter(s => selectedServices.includes(s.id)).map(service => (
                          <div key={service.id} className="flex justify-between items-center">
                            <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <span className="truncate max-w-[200px]">{service.name}</span>
                            </div>
                            <div className="text-sm font-bold text-gray-900">₹{service.price}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-indigo-100/50">
                      <div className="text-sm font-black text-gray-900">Total</div>
                      <div className="text-lg font-black text-indigo-700">
                        ₹{cartTotal}
                      </div>
                    </div>
                  </div>

                  {/* Seller Status */}
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-lg shadow-inner">
                      {isDoctor ? '🏥' : isSpa ? '💆' : '✂️'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{sellerName}</div>
                      <div className="text-xs text-gray-500">Now serving #4 • 0 waiting</div>
                    </div>
                  </div>

                  {/* Type Tabs */}
                  <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                    <button className="flex-1 bg-white text-gray-900 py-2 rounded-lg font-bold text-xs shadow-sm transition">
                      Walk-in Now
                    </button>
                    <button className="flex-1 text-gray-500 hover:text-gray-700 py-2 rounded-lg font-bold text-xs transition">
                      Appointment
                    </button>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-3 mb-6">
                    <input type="text" placeholder="Your name *" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
                    <input type="text" placeholder="Phone number (optional)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
                  </div>

                  {/* Submit */}
                  <button 
                    disabled={selectedServices.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 mb-6"
                  >
                    <span>🎟️</span> Pay ₹{cartTotal} & Get Token <span>💳</span>
                  </button>
                </div>
              </div>

              {/* Mobile Sticky Action Bar for Services */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="text-xs text-gray-500 font-semibold">{selectedServices.length} selected</div>
                  <div className="text-base font-black text-indigo-700">Total: ₹{cartTotal}</div>
                </div>
                <button 
                  disabled={selectedServices.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  Pay ₹{cartTotal} & Get Token 🎟️
                </button>
              </div>

            </div>
          </div>
        ) : (
          
          /* ======================= */
          /* PRODUCT / B2C LAYOUT    */
          /* ======================= */
          <div className="pb-16 md:pb-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">All Products</h2>
            
            {sellerProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {sellerProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col overflow-hidden">
                    {/* Image Area */}
                    <div className="relative h-40 sm:h-56 lg:h-64 bg-slate-100 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <img src="/hero-left-logo.png" alt={product.name} className="w-full h-full object-contain opacity-50 p-4 group-hover:scale-105 transition-transform duration-500" />
                      )}
                      
                      {/* Floating Add to Cart Overlay (Desktop only) */}
                      <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center backdrop-blur-sm">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              category: product.category,
                              sellerId: product.sellerId
                            });
                          }}
                          className="px-4 py-2 lg:px-6 lg:py-3 bg-white text-gray-900 font-bold rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-600 hover:text-white text-sm lg:text-base"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-3 sm:p-4 lg:p-5 flex-1 flex flex-col">
                      <div className="text-[10px] sm:text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 lg:mb-2">
                        {product.category || 'Retail'}
                      </div>
                      
                      <Link href={`/product/${product.id}`} className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors mb-2 line-clamp-2 leading-snug">
                        {product.name}
                      </Link>
                      
                      <div className="text-base sm:text-lg lg:text-xl font-black text-gray-900 mb-3 sm:mb-4 mt-auto">
                        ₹{product.options && product.options.length > 0 && selectedProductOptions[product.id] 
                          ? product.options.find(o => o.id === selectedProductOptions[product.id])?.price || product.price 
                          : product.price}
                      </div>

                      {product.options && product.options.length > 0 && (
                        <div className="mb-3 sm:mb-4">
                          <label className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 block">Select Option:</label>
                          <select 
                            value={selectedProductOptions[product.id] || product.options[0].id}
                            onChange={e => setSelectedProductOptions({...selectedProductOptions, [product.id]: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {product.options.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.name} - ₹{opt.price}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          const selectedOptId = selectedProductOptions[product.id] || (product.options && product.options.length > 0 ? product.options[0].id : null);
                          const selectedOpt = product.options?.find(o => o.id === selectedOptId);
                          addToCart({
                            id: selectedOpt ? `${product.id}-${selectedOpt.id}` : product.id,
                            name: selectedOpt ? `${product.name} (${selectedOpt.name})` : product.name,
                            price: selectedOpt ? selectedOpt.price : product.price,
                            image: product.image,
                            category: product.category
                          });
                          alert('Added to Cart!');
                        }}
                        className="w-full py-2 sm:py-2.5 bg-gray-900 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 md:hidden"
                      >
                        <span className="text-xs sm:text-sm">🛒</span> <span className="text-xs sm:text-sm">Add</span>
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 sm:py-24 text-center bg-white rounded-2xl border border-gray-200 border-dashed mx-2 sm:mx-0">
                <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">📦</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">No products found</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">This seller hasn&apos;t added any products to their catalog yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}