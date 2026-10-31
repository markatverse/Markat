"use client";
import React from 'react';
import Link from 'next/link';

export default function AllCategoriesPage() {
  const categorySections = [
    {
      id: 'mobiles',
      title: 'Mobiles & Smartphones',
      subtitle: '5G Tech & Smart Devices',
      theme: 'blue',
      link: '/search?category=Mobiles',
      items: [
        { name: 'Samsung Galaxy S24 Ultra', type: 'Flagship Smartphone', rating: '4.9', icon: '📱', link: '/product/samsung-galaxy-s24-ultra' },
        { name: 'OnePlus 12 5G', type: 'Performance Phone', rating: '4.8', icon: '⚡', link: '/product/oneplus-12-5g' },
        { name: 'Apple iPhone 15 Pro', type: 'Titanium iOS Device', rating: '4.9', icon: '🍎', link: '/product/apple-iphone-15-pro' }
      ]
    },
    {
      id: 'food-dining',
      title: 'Food & Dining',
      subtitle: 'Restaurants, Cafes & Bakeries',
      theme: 'amber',
      link: '/search?category=Food%20%26%20Dining',
      items: [
        { name: 'Hyderabadi Dum Biryani', type: 'Mughlai & Biryani', rating: '4.8', icon: '🍛', link: '/product/hyderabadi-dum-biryani' },
        { name: 'Artisan Wood-Fired Pizza', type: 'Italian Pizzeria', rating: '4.7', icon: '🍕', link: '/product/wood-fired-farmhouse-pizza' },
        { name: 'Roasted Arabica Coffee', type: 'Beverages & Beans', rating: '4.9', icon: '☕', link: '/product/specialty-arabica-coffee-beans' }
      ]
    },
    {
      id: 'salon-spa',
      title: 'Salon, Spa & Wellness',
      subtitle: 'Personal Grooming & Care',
      theme: 'pink',
      link: '/search?category=Salon%20%26%20Spa',
      items: [
        { name: 'Hair Cutting & Styling', type: 'Hair Salon', rating: '4.8', icon: '💇‍♀️', link: '/product/hair-cutting-styling' },
        { name: 'Spa Pedicure & Manicure', type: 'Spa & Wellness', rating: '4.9', icon: '💅', link: '/product/premium-pedicure' },
        { name: 'Complete Bridal HD Makeup', type: 'Bridal Artistry', rating: '4.9', icon: '💄', link: '/product/bridal-makeup-package' }
      ]
    },
    {
      id: 'electronics',
      title: 'Electronics & Computing',
      subtitle: 'Gadgets & Home Entertainment',
      theme: 'indigo',
      link: '/search?category=Electronics',
      items: [
        { name: 'Apple MacBook Air M2', type: 'Ultrabook Laptop', rating: '4.9', icon: '💻', link: '/product/macbook-air-m2' },
        { name: 'Sony Bravia 55" 4K TV', type: 'Smart LED TV', rating: '4.8', icon: '📺', link: '/product/sony-bravia-4k-tv' },
        { name: 'Wireless Noise Canceling Earbuds', type: 'Audio Gear', rating: '4.5', icon: '🎧', link: '/product/wireless-earbuds' }
      ]
    },
    {
      id: 'fashion',
      title: 'Fashion & Apparel',
      subtitle: 'Clothing, Footwear & Accessories',
      theme: 'purple',
      link: '/search?category=Fashion',
      items: [
        { name: "Men's Casual Cotton Shirt", type: "Men's Fashion", rating: '4.3', icon: '👔', link: '/product/mens-casual-shirt' },
        { name: 'Embroidered Anarkali Kurti', type: "Women's Ethnic", rating: '4.7', icon: '👗', link: '/product/anarkali-kurti-set' },
        { name: 'Classic Leather Sneakers', type: 'Streetwear Footwear', rating: '4.6', icon: '👟', link: '/product/white-sneakers-classic' }
      ]
    },
    {
      id: 'home',
      title: 'Home, Kitchen & Living',
      subtitle: 'Furniture & Daily Essentials',
      theme: 'slate',
      link: '/search?category=Home',
      items: [
        { name: 'Solid Sheesham Coffee Table', type: 'Handcrafted Furniture', rating: '4.8', icon: '🛋️', link: '/product/solid-wood-coffee-table' },
        { name: 'Egyptian Cotton Bedsheet', type: 'Bedding & Linen', rating: '4.7', icon: '🛏️', link: '/product/egyptian-cotton-bedsheet' },
        { name: '5-Piece Kitchen Appliance Set', type: 'Kitchenware', rating: '4.7', icon: '🍳', link: '/product/kitchen-appliance-set' }
      ]
    },
    {
      id: 'beauty',
      title: 'Beauty & Skincare',
      subtitle: 'Dermatology & Cosmetics',
      theme: 'pink',
      link: '/search?category=Beauty',
      items: [
        { name: '10% Vitamin C Face Glow Serum', type: 'Facial Skincare', rating: '4.7', icon: '✨', link: '/product/vitamin-c-glow-serum' },
        { name: 'Velvet Matte Liquid Lipstick Combo', type: 'Lip Makeup', rating: '4.6', icon: '💋', link: '/product/matte-liquid-lipstick-set' },
        { name: 'Moroccan Argan Hair Serum', type: 'Organic Haircare', rating: '4.8', icon: '🌿', link: '/product/organic-argan-hair-oil' }
      ]
    },
    {
      id: 'auto',
      title: 'Auto, Detailing & Vehicles',
      subtitle: 'Car Care, Bikes & Spares',
      theme: 'blue',
      link: '/search?category=Auto',
      items: [
        { name: 'Doorstep Foam Car Wash', type: 'Car Detailing Service', rating: '4.9', icon: '🧼', link: '/product/doorstep-car-wash-detailing' },
        { name: 'Castrol EDGE 5W-40 Synthetic Oil', type: 'Engine Lubricants', rating: '4.8', icon: '🛢️', link: '/product/castrol-synthetic-engine-oil' },
        { name: 'Vega Bolt Full Face Helmet', type: 'Rider Safety', rating: '4.7', icon: '🪖', link: '/product/vega-dot-certified-helmet' }
      ]
    },
    {
      id: 'sports',
      title: 'Sports & Fitness',
      subtitle: 'Gym Gear, Outdoor & Wellness',
      theme: 'emerald',
      link: '/search?category=Sports',
      items: [
        { name: 'Rubber Hex Dumbbells Pair (10kg)', type: 'Strength Training', rating: '4.8', icon: '🏋️', link: '/product/rubber-hex-dumbbell-set' },
        { name: 'Nivia Storm Official Match Football', type: 'Outdoor Sports', rating: '4.6', icon: '⚽', link: '/product/nivia-storm-football' },
        { name: 'Boldfit Anti-Skid Yoga Mat', type: 'Yoga & Pilates', rating: '4.8', icon: '🧘', link: '/product/boldfit-anti-tear-yoga-mat' }
      ]
    },
    {
      id: 'services',
      title: 'Home Repair & Services',
      subtitle: 'Verified Experts at Your Doorstep',
      theme: 'emerald',
      link: '/search?type=services',
      items: [
        { name: 'AC Repair & Servicing', type: 'Appliance Repair', rating: '4.9', icon: '❄️', link: '/product/ac-repair-service' },
        { name: 'Full Home Deep Cleaning', type: 'House Cleaning', rating: '4.8', icon: '🧹', link: '/product/urban-home-deep-cleaning' },
        { name: 'Express Plumbing Leak Repair', type: 'Plumbing Services', rating: '4.7', icon: '🔧', link: '/product/express-plumbing-service' }
      ]
    },
    {
      id: 'b2b',
      title: 'B2B Wholesale & Enterprise',
      subtitle: 'Direct Bulk Procurement',
      theme: 'blue',
      link: '/search?filter=b2b',
      items: [
        { name: 'Wholesale Mixed Clothing Bale', type: 'Textiles & Garments', rating: '4.7', icon: '📦', link: '/product/wholesale-clothing-bale' },
        { name: '42U Enterprise Server Rack Cabinet', type: 'IT Infrastructure', rating: '4.9', icon: '🖥️', link: '/product/enterprise-server-rack' },
        { name: 'Heavy Freight Cargo Logistics', type: 'Logistics & Shipping', rating: '4.9', icon: '🚢', link: '/product/heavy-freight-movers' }
      ]
    },
    {
      id: 'raw-materials',
      title: 'Construction Materials',
      subtitle: 'Building & Infrastructure',
      theme: 'amber',
      link: '/search?category=Construction%20Materials',
      items: [
        { name: 'UltraTech Cement (50kg Bag)', type: 'Portland Cement', rating: '4.8', icon: '🧱', link: '/product/portland-cement-50kg' },
        { name: 'Tata Tiscon 550SD TMT Steel Bars', type: 'Structural Steel', rating: '4.9', icon: '🏗️', link: '/product/tmt-steel-bars' },
        { name: 'High Quality River Sand Truck', type: 'Aggregate Sand', rating: '4.6', icon: '⏳', link: '/product/river-sand-truck' }
      ]
    }
  ];

  const getThemeClasses = (theme: string) => {
    switch(theme) {
      case 'amber': return { bg: 'bg-amber-50', border: 'border-amber-200', textLight: 'text-amber-700', textDark: 'text-amber-900', btnBg: 'bg-amber-600', btnHover: 'hover:bg-amber-700', iconBg: 'bg-amber-100/70', iconText: 'text-amber-700', groupHover: 'group-hover:bg-amber-600', glow: 'bg-amber-500/10' };
      case 'blue': return { bg: 'bg-blue-50', border: 'border-blue-200', textLight: 'text-blue-700', textDark: 'text-blue-900', btnBg: 'bg-blue-600', btnHover: 'hover:bg-blue-700', iconBg: 'bg-blue-100/70', iconText: 'text-blue-700', groupHover: 'group-hover:bg-blue-600', glow: 'bg-blue-500/10' };
      case 'emerald': return { bg: 'bg-emerald-50', border: 'border-emerald-200', textLight: 'text-emerald-700', textDark: 'text-emerald-900', btnBg: 'bg-emerald-600', btnHover: 'hover:bg-emerald-700', iconBg: 'bg-emerald-100/70', iconText: 'text-emerald-700', groupHover: 'group-hover:bg-emerald-600', glow: 'bg-emerald-500/10' };
      case 'pink': return { bg: 'bg-pink-50', border: 'border-pink-200', textLight: 'text-pink-700', textDark: 'text-pink-900', btnBg: 'bg-pink-600', btnHover: 'hover:bg-pink-700', iconBg: 'bg-pink-100/70', iconText: 'text-pink-700', groupHover: 'group-hover:bg-pink-600', glow: 'bg-pink-500/10' };
      case 'purple': return { bg: 'bg-purple-50', border: 'border-purple-200', textLight: 'text-purple-700', textDark: 'text-purple-900', btnBg: 'bg-purple-600', btnHover: 'hover:bg-purple-700', iconBg: 'bg-purple-100/70', iconText: 'text-purple-700', groupHover: 'group-hover:bg-purple-600', glow: 'bg-purple-500/10' };
      case 'indigo': return { bg: 'bg-indigo-50', border: 'border-indigo-200', textLight: 'text-indigo-700', textDark: 'text-indigo-900', btnBg: 'bg-indigo-600', btnHover: 'hover:bg-indigo-700', iconBg: 'bg-indigo-100/70', iconText: 'text-indigo-700', groupHover: 'group-hover:bg-indigo-600', glow: 'bg-indigo-500/10' };
      case 'slate': default: return { bg: 'bg-slate-50', border: 'border-slate-200', textLight: 'text-slate-700', textDark: 'text-slate-900', btnBg: 'bg-slate-700', btnHover: 'hover:bg-slate-800', iconBg: 'bg-slate-100', iconText: 'text-slate-700', groupHover: 'group-hover:bg-slate-700', glow: 'bg-slate-500/10' };
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">All Categories</h1>
        <p className="text-slate-500 text-sm sm:text-base font-medium">Browse through our comprehensive directory of 5G mobiles, dining, salon & spa, fashion, home decor, local services, and bulk wholesale suppliers.</p>
      </div>

      {/* Grid of Category Sections */}
      <div className="flex flex-col gap-8">
        {categorySections.map((section) => {
          const t = getThemeClasses(section.theme);
          
          return (
            <section key={section.id} className={`${t.bg} p-6 sm:p-8 rounded-3xl border ${t.border} shadow-sm relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 w-64 h-64 ${t.glow} rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3`}></div>
              <div className={`absolute bottom-0 right-0 w-96 h-96 ${t.glow} rounded-full blur-3xl translate-y-1/3 translate-x-1/3`}></div>
              
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-end border-b ${t.border} pb-4 mb-6 relative z-10 gap-4`}>
                <div>
                  <div className={`text-[11px] font-black ${t.textLight} tracking-widest uppercase mb-1`}>{section.subtitle}</div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{section.title}</h2>
                </div>
                <Link href={section.link} className={`${t.btnBg} text-white px-5 py-2.5 rounded-xl text-sm font-bold ${t.btnHover} transition-colors shadow-sm whitespace-nowrap`}>
                  Explore All ➤
                </Link>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 sm:gap-5 relative z-10">
                {section.items.map((item, i) => (
                  <Link 
                    key={i} 
                    href={item.link} 
                    className="no-underline text-inherit outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
                  >
                    <div className={`bg-white p-4 sm:p-5 rounded-2xl border ${t.border} shadow-xs hover:shadow-md flex items-center gap-4 hover:-translate-y-1 transition-all cursor-pointer h-full group`}>
                      <div className={`w-14 h-14 ${t.iconBg} ${t.iconText} rounded-xl flex items-center justify-center text-2xl shrink-0 border ${t.border} ${t.groupHover} group-hover:text-white transition-colors shadow-xs`}>
                        {item.icon}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className={`text-[10px] ${t.textLight} uppercase tracking-wider font-black mb-0.5`}>{item.type}</div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">{item.name}</div>
                        <div className="text-xs text-amber-500 font-bold mt-1 flex items-center gap-1">
                          ★ {item.rating} <span className="text-slate-400 font-normal text-[11px]">• Popular</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
