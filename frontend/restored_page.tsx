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
  const isService = sellerName.toLowerCase().includes('salon') || sellerName.toLowerCase().includes('spa');

  const [activeTab, setActiveTab] = useState('services');

  // MOCK DATA FOR SPA/SALON
  const salonServices = [
    { id: 's1', name: 'Premium Haircut', duration: '45 mins', price: 499, category: 'Hair', description: 'Includes wash, cut, and professional styling.' },
    { id: 's2', name: 'Beard Trimming & Styling', duration: '30 mins', price: 299, category: 'Beard', description: 'Precision beard shaping and hot towel treatment.' },
    { id: 's3', name: 'Hair Dyeing & Highlights', duration: '90 mins', price: 1499, category: 'Color', description: 'Ammonia-free coloring with premium brands.' },
    { id: 's4', name: 'Relaxing Spa Massage', duration: '60 mins', price: 1999, category: 'Spa', description: 'Full body deep tissue massage with essential oils.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Storefront Hero Header */}
      <div className="bg-slate-900 text-white pt-20 pb-12 px-8 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center text-5xl border-4 border-slate-700 shadow-lg">
            {isService ? '✂️' : '🏬'}
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
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8 flex space-x-8">
              {['services', 'staff', 'reviews', 'about'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                    activeTab === tab 
                      ? 'border-b-4 border-indigo-600 text-indigo-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'services' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {salonServices.map(service => (
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
            )}
            
            {activeTab !== 'services' && (
              <div className="py-20 text-center bg-white rounded-xl border border-gray-100">
                <div className="text-4xl mb-4">🚧</div>
                <h3 className="text-lg font-bold text-gray-900">Module Under Construction</h3>
                <p className="text-gray-500 text-sm mt-2">The {activeTab} section is part of Phase 9/10.</p>
              </div>
            )}
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
