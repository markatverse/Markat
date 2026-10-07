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

  const sellerProducts = products.filter(p => p.seller === sellerName);

  // Dynamic detection (Mocked based on name for demonstration)
  const isDoctor = sellerName.toLowerCase().includes('hospital') || sellerName.toLowerCase().includes('clinic') || sellerName.toLowerCase().includes('doctor');
  const isSpa = sellerName.toLowerCase().includes('spa');
  const isSalon = sellerName.toLowerCase().includes('salon');
  
  const isService = isDoctor || isSpa || isSalon;

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Storefront Hero Header */}
      <div className="bg-slate-900 text-white pt-20 pb-12 px-8 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center text-5xl border-4 border-slate-700 shadow-lg">
            {isService ? (isDoctor ? '🏥' : isSpa ? '💆' : '✂️') : '🏬'}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-extrabold flex items-center justify-center md:justify-start gap-4 mb-3">
              {sellerName}
              <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1 shadow">
                <span>🛡️</span> Verified
              </span>
            </h1>
            <div className="text-slate-400 text-sm flex flex-wrap justify-center md:justify-start gap-6 font-medium">
              <span className="flex items-center gap-1">⭐ 4.9/5 Rating (120 reviews)</span>
              <span className="flex items-center gap-1">📍 New Delhi, India</span>
              {!isService && <span className="flex items-center gap-1">📦 {sellerProducts.length} Products</span>}
            </div>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold shadow-lg transition">
              Contact
            </button>
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-semibold transition">
              + Follow
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* ======================= */}
        {/* SERVICE / SALON LAYOUT  */}
        {/* ======================= */}
        {isService ? (
          <div>
            {/* Top Dark Header Section */}
            <div className="bg-[#111827] text-white rounded-3xl p-6 md:p-10 mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 flex gap-3">
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur transition">♡</button>
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur transition">Share</button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-10 relative z-10">
                {/* Left Image */}
                <div className="w-full md:w-[320px] shrink-0 relative rounded-2xl overflow-hidden shadow-2xl h-[400px]">
                  <img src={isDoctor ? "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80" : "https://images.unsplash.com/photo-1521590832167-7bfc17484d20?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} alt="Service Image" className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold tracking-wider">SERVICES</div>
                  <div className="absolute bottom-4 left-4 right-4 bg-emerald-500 text-white font-bold text-sm py-3 px-4 rounded-xl text-center shadow-lg flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Live Token Queue Active
                  </div>
                </div>

                {/* Right Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">🎫 Smart Queue</span>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">⚡ Instant Booking</span>
                    <span className="bg-slate-700 text-slate-300 border border-slate-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">📈 Top Rated</span>
                  </div>

                  <h1 className="text-5xl font-black mb-4 tracking-tight">{sellerName}</h1>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-amber-500/20 text-amber-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                      ⭐ New <span className="text-amber-300/70 font-medium">(0 reviews)</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm text-slate-300 flex items-center gap-2">
                      📍 New Delhi, India
                    </div>
                  </div>

                  {/* Provider Card */}
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between backdrop-blur mt-auto md:mt-4 max-w-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
                        {sellerName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Service Provider</div>
                        <div className="text-xl font-bold text-white">Seller1</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        🛡️ Verified Pro
                      </div>
                      <button className="text-sm text-indigo-300 hover:text-indigo-200 font-semibold flex items-center gap-1">
                        📞 Call now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column (Main Info) */}
              <div className="flex-1 space-y-8">
                {/* Tabs */}
                <div className="flex bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                  <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-md transition">
                    ⓘ About
                  </button>
                  <button className="flex-1 text-gray-500 hover:bg-gray-50 py-3 rounded-xl font-bold text-sm transition">
                    ✓ What&apos;s Included
                  </button>
                  <button className="flex-1 text-gray-500 hover:bg-gray-50 py-3 rounded-xl font-bold text-sm transition">
                    📸 Gallery
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-indigo-500">ⓘ</span> About This Service
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Experience top-tier service tailored to your needs. Our professionals use the best practices and tools to ensure your complete satisfaction.
                  </p>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dynamicServices.map(service => (
                      <div key={service.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded mb-2 inline-block uppercase">
                              {service.category}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                          </div>
                          <div className="text-xl font-extrabold text-gray-900">
                            ₹{service.price}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 flex-1 mb-6">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                            ⏱️ {service.duration}
                          </span>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-semibold rounded-lg transition">
                              Get Token
                            </button>
                            <button className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold rounded-lg shadow transition">
                              Book Appt
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Queue Explainer */}
                <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-200">🎫</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Smart Queue System</h3>
                      <p className="text-sm text-gray-500">No appointments. Just walk in.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
                      <div className="absolute top-4 right-4 text-indigo-100 font-black text-xl">01</div>
                      <div className="text-3xl mb-4">🚶</div>
                      <h4 className="font-bold text-gray-900 mb-2">Walk In Anytime</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">No appointment. Show up whenever it&apos;s convenient.</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
                      <div className="absolute top-4 right-4 text-indigo-100 font-black text-xl">02</div>
                      <div className="text-3xl mb-4">🎟️</div>
                      <h4 className="font-bold text-gray-900 mb-2">Get a Token</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Enter your name, get an instant queue number.</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
                      <div className="absolute top-4 right-4 text-indigo-100 font-black text-xl">03</div>
                      <div className="text-3xl mb-4">📱</div>
                      <h4 className="font-bold text-gray-900 mb-2">Track & Return</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">See live wait time. Leave, come back just in time.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Booking Widget) */}
              <div className="w-full lg:w-[420px] shrink-0">
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
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-sm font-bold text-gray-900">Live Queue Status</span>
                  </div>

                  {/* Form Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">🎟️ Get Your Token</h3>
                    <button className="text-xs text-gray-400 font-medium hover:text-gray-600 transition">— Back</button>
                  </div>

                  {/* Service Selection */}
                  <div className="mb-6">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Select Services <span className="normal-case text-gray-400 font-normal">(pick one or more)</span></div>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {dynamicServices.map(service => {
                        const isSelected = selectedServices.includes(service.id);
                        return (
                          <div 
                            key={service.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedServices(prev => prev.filter(id => id !== service.id));
                              } else {
                                setSelectedServices(prev => [...prev, service.id]);
                              }
                            }}
                            className={`border-2 rounded-2xl p-4 flex items-center justify-between relative cursor-pointer transition ${
                              isSelected 
                                ? 'border-purple-500 bg-purple-50 hover:bg-purple-100' 
                                : 'border-gray-100 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{service.icon}</div>
                              <div>
                                <div className={`font-bold text-sm ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>{service.name}</div>
                                <div className={`font-black mt-1 ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>₹{service.price}</div>
                              </div>
                            </div>
                            
                            {isSelected ? (
                              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs shadow-sm">✓</div>
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-indigo-50/50 rounded-2xl p-5 mb-6">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Order</div>
                    
                    {selectedServices.length === 0 ? (
                      <div className="text-sm text-gray-500 italic mb-3">No services selected</div>
                    ) : (
                      <div className="space-y-2 mb-3">
                        {dynamicServices.filter(s => selectedServices.includes(s.id)).map(service => (
                          <div key={service.id} className="flex justify-between items-center">
                            <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <span>{service.icon}</span> {service.name}
                            </div>
                            <div className="text-sm font-bold text-gray-900">₹{service.price}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-indigo-100/50">
                      <div className="text-sm font-black text-gray-900">Total</div>
                      <div className="text-lg font-black text-indigo-700">
                        ₹{dynamicServices.filter(s => selectedServices.includes(s.id)).reduce((sum, s) => sum + s.price, 0)}
                      </div>
                    </div>
                  </div>

                  {/* Seller Status */}
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{sellerName}</div>
                      <div className="text-xs text-gray-500">Now serving #4 • 0 waiting</div>
                    </div>
                  </div>

                  {/* Type Tabs */}
                  <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                    <button className="flex-1 bg-white text-gray-900 py-2 rounded-lg font-bold text-xs shadow-sm transition">
                      Walk-in Now (Token)
                    </button>
                    <button className="flex-1 text-gray-500 hover:text-gray-700 py-2 rounded-lg font-bold text-xs transition">
                      Book Appointment
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
                    <span>🎟️</span> Pay ₹{dynamicServices.filter(s => selectedServices.includes(s.id)).reduce((sum, s) => sum + s.price, 0)} & Get Token <span>💳</span>
                  </button>

                  {/* Trust Badges */}
                  <div className="flex justify-center gap-8 border-t border-gray-100 pt-6">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xl">🔒</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Secure</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xl text-amber-500">⚡</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Instant</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xl">💯</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verified</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        ) : (
          
          /* ======================= */
          /* PRODUCT / B2C LAYOUT    */
          /* ======================= */
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">All Products</h2>
            
            {sellerProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {sellerProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col overflow-hidden">
                    {/* Image Area */}
                    <div className="relative h-64 bg-slate-100 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="text-5xl opacity-20 group-hover:scale-110 transition-transform">📸</span>
                      )}
                      
                      {/* Floating Add to Cart Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              category: product.category
                            });
                          }}
                          className="px-6 py-3 bg-white text-gray-900 font-bold rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-600 hover:text-white"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                        {product.category || 'Retail'}
                      </div>
                      
                      <Link href={`/product/${product.id}`} className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                        {product.name}
                      </Link>
                      
                      {/* Dynamic Options UI */}
                      <div className="mt-3 flex gap-2 mb-4">
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                          Size: <span className="font-semibold text-gray-900">M</span>
                        </div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                          Mat: <span className="font-semibold text-gray-900">Cotton</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-2xl font-black text-gray-900">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                        <button 
                          onClick={() => {
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              category: product.category
                            });
                          }}
                          className="w-10 h-10 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition shadow-sm"
                          title="Quick Add"
                        >
                          🛒
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-white rounded-2xl border border-gray-200 border-dashed">
                <div className="text-6xl mb-6">📦</div>
                <h3 className="text-xl font-bold text-gray-900">No products found</h3>
                <p className="text-gray-500 mt-2">This seller hasn&apos;t added any products to their catalog yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}