import React from 'react';
import type { Metadata } from 'next';
import { Shield, Globe, Users, TrendingUp, CheckCircle, Award, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: "About MarkatVerse | India's Next-Gen Hyperlocal Marketplace & Services",
  description: "Discover MarkatVerse – Empowering local businesses, retail shoppers, and verified service professionals across India with seamless deliveries, wholesale B2B trades, and real-time appointments.",
  keywords: [
    "MarkatVerse",
    "About MarkatVerse",
    "Hyperlocal Marketplace",
    "B2B wholesale India",
    "B2C online shopping",
    "salon booking",
    "verified service providers",
    "fast local delivery"
  ],
  openGraph: {
    title: "About MarkatVerse | India's Next-Gen Hyperlocal Marketplace & Services",
    description: "Discover MarkatVerse – Empowering local businesses, retail shoppers, and verified service professionals across India.",
    url: "https://markatverse.com/about",
    siteName: "MarkatVerse",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Commerce & Services
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            About <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">MarkatVerse</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Your unified hyperlocal marketplace connecting buyers, verified local sellers, and professional service specialists with instant, secure transactions.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <div className="text-xs uppercase tracking-widest font-black text-blue-600 mb-2">Our Vision</div>
            <h2 className="text-3xl font-black text-slate-900 mb-6">Redefining How India Shops, Trades, and Books Services</h2>
            <p className="text-slate-600 mb-4 leading-relaxed text-lg">
              At MarkatVerse, our mission is to eliminate friction across digital commerce. We empower local shops, retail customers, and service businesses by providing a single, trustworthy ecosystem that bridges retail shopping with professional appointments.
            </p>
            <p className="text-slate-600 leading-relaxed text-lg">
              Whether you are scheduling salon and wellness visits, purchasing genuine retail goods with automated courier delivery, or negotiating bulk wholesale B2B contracts, MarkatVerse ensures absolute transparency, buyer protection, and speed.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div className="font-bold text-slate-900 mb-1">Hyperlocal Reach</div>
              <div className="text-sm text-slate-500">Fast delivery across cities</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="font-bold text-slate-900 mb-1">100% Secure</div>
              <div className="text-sm text-slate-500">Escrow & payment safety</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="font-bold text-slate-900 mb-1">Verified Sellers</div>
              <div className="text-sm text-slate-500">KYC audited merchants</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-rose-600" />
              </div>
              <div className="font-bold text-slate-900 mb-1">Smart Queues</div>
              <div className="text-sm text-slate-500">Real-time live token alerts</div>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="border-t border-slate-200 pt-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-2xl font-black text-slate-900 mb-3">Why Thousands Trust MarkatVerse</h3>
            <p className="text-slate-500 text-sm">Engineered for seamless commerce, verified logistics, and service satisfaction.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" /> Automated Courier Shipping
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Direct integration with leading logistics partners (Shiprocket, Delhivery, Ekart) for door-to-door B2C dispatch and live tracking.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" /> Wholesale B2B RFQs
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dedicated quotation and negotiation workflow for bulk purchase orders, transparent pricing, and agreed commercial logistics.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" /> Cloud Media CDN
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                High-speed media streaming for products, demonstration videos, and seller storefronts powered by MongoDB GridFS & global edge caching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
