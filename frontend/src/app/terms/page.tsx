"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Utensils, 
  Factory, 
  Wrench, 
  Sparkles, 
  Clock, 
  ShoppingBag, 
  Truck, 
  Scale, 
  FileText, 
  Mail, 
  CheckCircle2, 
  ChevronRight, 
  Printer,
  Search,
  Building2,
  Lock
} from 'lucide-react';

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'FOOD' | 'B2B' | 'SERVICES' | 'SALON' | 'LIABILITY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16 text-slate-800">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Legal Shield Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Statutory Legal Terms & Intermediary Shield
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Terms of Service & Platform Disclaimers
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
              MarkatVerse operates strictly as an <strong>Online Marketplace Intermediary</strong> under Section 79 of the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020. Please review our comprehensive risk allocations, sector-specific disclaimers, and limitation of liability.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-slate-400 font-medium">
              <span>Effective Date: September 2026</span>
              <span>•</span>
              <span>Governing Jurisdiction: Republic of India</span>
              <span>•</span>
              <button 
                type="button" 
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-white transition-colors cursor-pointer font-bold"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Provisions
            </button>
            <button
              onClick={() => setActiveTab('FOOD')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'FOOD' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" /> Restaurants & Food Safety
            </button>
            <button
              onClick={() => setActiveTab('B2B')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'B2B' ? 'bg-blue-600 text-white shadow-xs' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              <Factory className="w-3.5 h-3.5" /> B2B Wholesale & Production
            </button>
            <button
              onClick={() => setActiveTab('SERVICES')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'SERVICES' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> Home Repairs & Technicians
            </button>
            <button
              onClick={() => setActiveTab('SALON')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'SALON' ? 'bg-pink-600 text-white shadow-xs' : 'bg-pink-50 text-pink-800 hover:bg-pink-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Beauty Salons & Wellness
            </button>
            <button
              onClick={() => setActiveTab('LIABILITY')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'LIABILITY' ? 'bg-purple-600 text-white shadow-xs' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> Liability Shield & Indemnity
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search legal clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Main Terms Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Table of Contents (Sticky on Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Clause Directory
              </span>
              <nav className="space-y-1.5 text-xs font-medium">
                <a href="#intermediary-status" className="block p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors">
                  1. Intermediary Status & Safe Harbor
                </a>
                <a href="#sector-food" className="block p-2 rounded-lg hover:bg-amber-50 text-amber-900 font-semibold transition-colors">
                  2. Food, Restaurant & FSSAI Disclaimers
                </a>
                <a href="#sector-b2b" className="block p-2 rounded-lg hover:bg-blue-50 text-blue-900 font-semibold transition-colors">
                  3. B2B Wholesale & Manufacturing Terms
                </a>
                <a href="#sector-services" className="block p-2 rounded-lg hover:bg-emerald-50 text-emerald-900 font-semibold transition-colors">
                  4. On-Demand Repairs & Technicians
                </a>
                <a href="#sector-salon" className="block p-2 rounded-lg hover:bg-pink-50 text-pink-900 font-semibold transition-colors">
                  5. Salons, Beauty & Chemical Treatments
                </a>
                <a href="#sector-tokens" className="block p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors">
                  6. Appointments, Tokens & Live Queues
                </a>
                <a href="#sector-retail" className="block p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors">
                  7. Retail Goods, Electronics & Warranty
                </a>
                <a href="#liability-shield" className="block p-2 rounded-lg hover:bg-purple-50 text-purple-900 font-bold transition-colors">
                  8. Absolute Limitation of Liability Cap
                </a>
                <a href="#seller-indemnity" className="block p-2 rounded-lg hover:bg-rose-50 text-rose-900 font-bold transition-colors">
                  9. Comprehensive Seller Indemnity Agreement
                </a>
                <a href="#dispute-arbitration" className="block p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors">
                  10. Binding Arbitration & Governing Law
                </a>
                <a href="#grievance-officer" className="block p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors">
                  11. Statutory Grievance Redressal Officer
                </a>
              </nav>
            </div>

            {/* Quick Summary Pill Box */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <Lock className="w-4 h-4 text-indigo-600" /> Platform Immunity Summary
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                MarkatVerse never takes title to goods, does not prepare food, and does not employ technicians. All operational, safety, hygiene, and product liabilities rest 100% upon independent third-party vendors.
              </p>
            </div>
          </div>

          {/* Right Column: Full Legal Content */}
          <div className="lg:col-span-8 space-y-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm leading-relaxed">
            
            {/* Clause 1: Intermediary Status */}
            {(activeTab === 'ALL' || activeTab === 'LIABILITY') && (
              <section id="intermediary-status" className="space-y-4 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Section 1 • Legal Framework
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  1. Marketplace Intermediary Role & Safe Harbor Protection
                </h2>
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                    <Scale className="w-4 h-4 text-indigo-600" /> Statutory Intermediary Declaration
                  </div>
                  <p>
                    MarkatVerse (including its corporate entity, operating founders, directors, employees, and affiliates) functions strictly and exclusively as an <strong>Online Marketplace Intermediary</strong> as defined under Section 2(1)(w) of the Information Technology Act, 2000 and is protected by the statutory safe-harbor immunity under <strong>Section 79 of the Information Technology Act, 2000</strong> read with Rule 3 of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  MarkatVerse merely provides an electronic venue and technology communications interface that facilitates discovery, booking, and commercial transactions between independent third-party merchants, manufacturers, wholesalers, service contractors, and restaurants (collectively, <strong>&quot;Vendors&quot;</strong> or <strong>&quot;Sellers&quot;</strong>) and end-users, buyers, or clients (collectively, <strong>&quot;Users&quot;</strong> or <strong>&quot;Buyers&quot;</strong>).
                </p>
                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No Ownership or Custody:</strong> MarkatVerse never takes title, ownership, possession, or physical custody of any goods, raw materials, or consumables listed on the platform.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Direct Bilateral Contracts:</strong> The contractual relationship for the sale of goods, preparation of meals, or provision of services is strictly and exclusively a direct bilateral contract between the Buyer and the respective Seller. MarkatVerse is not a party, guarantor, or insurer to such contracts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No Agency or Employment:</strong> No seller, delivery partner, technician, chef, artisan, or beautician is an employee, agent, partner, or joint venturer of MarkatVerse.</span>
                  </li>
                </ul>
              </section>
            )}

            {/* Clause 2: Restaurant & Food Safety Disclaimers */}
            {(activeTab === 'ALL' || activeTab === 'FOOD') && (
              <section id="sector-food" className="space-y-4 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                  <Utensils className="w-4 h-4" /> Section 2 • Food, Dining & Perishables
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  2. Food Safety, Hygiene, Restaurant & FSSAI Disclaimers
                </h2>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Absolute Food Poisoning & Culinary Liability Exclusion
                  </div>
                  <p className="leading-relaxed">
                    MarkatVerse is NOT a Food Business Operator (FBO) and does not prepare, cook, store, package, or inspect any edible items, cooked food, groceries, or beverages. All culinary preparation, kitchen sanitary hygiene, taste, quality, freshness, and packaging are the sole and exclusive responsibility of the listed restaurant or food vendor.
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <p>
                    <strong>2.1 Statutory FSSAI Compliance:</strong> Every restaurant, cloud kitchen, bakery, or food establishment listed on MarkatVerse expressly warrants and represents that it possesses a valid, active license or registration issued by the <em>Food Safety and Standards Authority of India (FSSAI)</em> pursuant to the Food Safety and Standards Act, 2006. The restaurant alone is legally answerable to regulatory food safety inspectors and public health authorities.
                  </p>

                  <p>
                    <strong>2.2 Complete Foodborne Illness & Medical Waiver:</strong> Under no circumstances shall MarkatVerse, its holding company, founders, directors, employees, or tech operators be held liable for any foodborne illness, food poisoning, indigestion, allergic reaction, microbial contamination, foreign physical objects (such as glass, plastic, hair, stones, or insects), stomach ailments, hospitalization, medical expenses, or wrongful death resulting from the consumption of food or drink ordered from or prepared by any merchant.
                  </p>

                  <p>
                    <strong>2.3 Allergens & Religious Dietary Designations:</strong> All descriptions, including but not limited to Vegetarian (Green Dot), Non-Vegetarian (Brown Dot), Jain, Halal, Kosher, Gluten-Free, Dairy-Free, or Nut-Free, are published solely on the basis of representations made by the merchant. MarkatVerse does not perform laboratory analyses or ingredient verifications. Customers with acute or life-threatening food allergies order entirely at their own risk and are advised to verify ingredients directly with the restaurant before consuming.
                  </p>

                  <p>
                    <strong>2.4 Spoilage & Temperature in Delivery:</strong> The restaurant is strictly responsible for providing tamper-evident, sealed food containers suitable for transit. MarkatVerse disclaims all liability for temperature drops, condensation, melted frozen items, or minor spillage occurring during third-party delivery transport.
                  </p>
                </div>
              </section>
            )}

            {/* Clause 3: B2B Wholesale & Manufacturing Terms */}
            {(activeTab === 'ALL' || activeTab === 'B2B') && (
              <section id="sector-b2b" className="space-y-4 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                  <Factory className="w-4 h-4" /> Section 3 • B2B & Wholesale Manufacturing
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  3. Business-to-Business (B2B), Bulk Orders & Manufacturing
                </h2>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-blue-900">
                    <Building2 className="w-4 h-4 text-blue-600" /> Commercial Enterprise Safe Harbor
                  </div>
                  <p className="leading-relaxed">
                    B2B wholesale transactions involve high-volume commercial dealings between independent business enterprises. MarkatVerse provides only the digital directory, inquiry system, and catalog showcase. The platform does not guarantee production schedules, industrial grade standards, or creditworthiness.
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <p>
                    <strong>3.1 Sample vs. Production Bulk Tolerances:</strong> In mass manufacturing (textiles, plastics, steel, construction supplies, packaging), natural industrial tolerances, dye-lot variations, slight dimensional shrinkages, and finish variations may occur. Discrepancies between pre-production prototypes and bulk shipments must be negotiated directly between buyer and supplier under their bilateral purchase order (PO).
                  </p>

                  <p>
                    <strong>3.2 Commercial Inspection Duty:</strong> B2B commercial buyers have a strict legal duty to inspect bulk consignments upon arrival at their warehouse/factory within 48 hours and raise formal notices of defect directly with the manufacturer before consuming, transforming, or reselling the stock.
                  </p>

                  <p>
                    <strong>3.3 GST Tax Invoices & Input Tax Credit (ITC):</strong> The seller is solely and legally responsible for issuing valid GST tax invoices complying with Section 31 of the CGST Act and correctly uploading invoice details into GSTR-1 to enable the buyer to claim Input Tax Credit (ITC). MarkatVerse shall not be liable for any tax disallowance, penalty, or interest imposed on the buyer due to a supplier&apos;s tax non-compliance.
                  </p>

                  <p>
                    <strong>3.4 MOQs, Production Lead Times & Force Majeure:</strong> Production delays caused by raw material shortages, power grid outages, factory strikes, governmental export/import restrictions, or natural calamities constitute force majeure between the manufacturer and the commercial purchaser.
                  </p>
                </div>
              </section>
            )}

            {/* Clause 4: Home Repairs & On-Demand Services */}
            {(activeTab === 'ALL' || activeTab === 'SERVICES') && (
              <section id="sector-services" className="space-y-4 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                  <Wrench className="w-4 h-4" /> Section 4 • On-Demand Services & Technicians
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  4. Home Repairs, Technicians & Contractor Disclaimers
                </h2>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Independent Contractor Liability Allocation
                  </div>
                  <p className="leading-relaxed">
                    Plumbers, electricians, AC mechanics, carpenters, painters, cleaning personnel, and pest control technicians are independent freelance contractors or employees of independent service agencies. They are NOT employees or agents of MarkatVerse.
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <p>
                    <strong>4.1 Accidental Property Damage & Appliance Breakage:</strong> While performing repairs or maintenance, if any technician accidentally causes damage to electrical wiring, water pipelines, flooring, furniture, air conditioner compressors, TV displays, or any electronic gadget, the liability for repair, replacement, or compensation rests solely with the attending technician or their registered agency. MarkatVerse provides no casualty or property insurance and disclaims all liability for accidental damage.
                  </p>

                  <p>
                    <strong>4.2 Supervision Duty & Personal Conduct:</strong> Customers are strictly advised to supervise all in-home service visits and safeguard their valuables, cash, jewelry, and delicate items. MarkatVerse assumes zero liability for theft, trespass, misconduct, verbal altercations, negligence, or criminal acts committed by service personnel. In the event of criminal misconduct, users must report directly to local law enforcement authorities.
                  </p>

                  <p>
                    <strong>4.3 Post-Service Warranty:</strong> Any repair warranty (e.g. 15-day or 30-day post-service guarantee) displayed by a service provider is backed exclusively by that provider. MarkatVerse does not repair, inspect, or guarantee the technical durability of third-party repair work.
                  </p>
                </div>
              </section>
            )}

            {/* Clause 5: Beauty Salons & Wellness */}
            {(activeTab === 'ALL' || activeTab === 'SALON') && (
              <section id="sector-salon" className="space-y-4 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2 text-pink-600 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Section 5 • Salons, Spas & Wellness
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  5. Beauty Salons, Spas, Chemical Treatments & Wellness
                </h2>

                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <p>
                    <strong>5.1 Chemical Products & Skin / Hair Reactions:</strong> Beauty treatments involving hair dyes, keratin treatments, chemical straightening, bleaching agents, waxing strips, facial peels, and cosmetic lotions carry inherent risks of skin irritation, burns, allergic rashes, or hair breakage. The salon merchant alone is responsible for conducting mandatory patch tests and inquiring about customer medical or dermatological sensitivities. MarkatVerse bears zero liability for bodily injury, scarring, hair loss, or cosmetic dissatisfaction.
                  </p>

                  <p>
                    <strong>5.2 Sanitation & Sterilization:</strong> Salons are legally required to maintain strict sterilization of blades, scissors, clippers, manicure sets, and needles. Compliance with public health and hygiene guidelines is the sole responsibility of the salon establishment.
                  </p>

                  <p>
                    <strong>5.3 Non-Medical Nature:</strong> Wellness and spa listings do not constitute medical, clinical, or dermatological advice. Users undergoing specialized medical care must consult their licensed physician before booking beauty or spa sessions.
                  </p>
                </div>
              </section>
            )}

            {/* Clause 6: Appointments & Live Queue */}
            {(activeTab === 'ALL' || activeTab === 'SERVICES') && (
              <section id="sector-tokens" className="space-y-4 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4" /> Section 6 • Tokens & Scheduling
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  6. Appointments, Token Systems & Virtual Queue Disclaimers
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  The live token numbers, appointment slots, and estimated wait-times displayed on MarkatVerse are dynamic approximations generated for scheduling convenience. They do NOT constitute an absolute contractual guarantee of immediate service at that exact minute. Delays caused by emergency medical cases, salon queues, or technician traffic do not give rise to claims for consequential loss, transit reimbursement, or compensatory damages against MarkatVerse.
                </p>
              </section>
            )}

            {/* Clause 7: Retail Goods & Warranty */}
            {(activeTab === 'ALL') && (
              <section id="sector-retail" className="space-y-4 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <ShoppingBag className="w-4 h-4" /> Section 7 • Retail & Consumer Goods
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  7. Retail Products, Genuine Goods & Manufacturer Warranties
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <p>
                    <strong>7.1 Anti-Counterfeiting & Genuine Warranty:</strong> Every retail seller expressly warrants that all items listed are 100% authentic, brand-new, and legally imported or manufactured without infringing any third-party intellectual property rights. Sellers found listing counterfeit, replica, or unauthorized items will be immediately banned and reported to brand protection agencies.
                  </p>
                  <p>
                    <strong>7.2 Manufacturer Warranty:</strong> Consumer electronics, home appliances, and branded accessories carry manufacturer warranties that can be redeemed solely at authorized brand service centers. MarkatVerse is not an authorized repair station and offers no independent product warranty.
                  </p>
                </div>
              </section>
            )}

            {/* Clause 8: Absolute Limitation of Liability (The Platform Shield) */}
            {(activeTab === 'ALL' || activeTab === 'LIABILITY') && (
              <section id="liability-shield" className="space-y-4 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
                  <Scale className="w-4 h-4" /> Section 8 • Platform Shield
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  8. Absolute Limitation of Liability & Damages Waiver
                </h2>

                <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-3">
                  <div className="font-bold flex items-center gap-1.5 text-purple-900 text-sm">
                    <Scale className="w-4 h-4 text-purple-700" /> Irrevocable Damages Ceiling
                  </div>
                  <p className="leading-relaxed font-medium">
                    TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE INDIAN LAW, IN NO EVENT SHALL MARKATVERSE, ITS PARENT COMPANY, SUBSIDIARIES, AFFILIATES, PROMOTERS, DIRECTORS, EMPLOYEES, AGENTS, OR REPRESENTATIVES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, PUNITIVE, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF REVENUE, LOSS OF BUSINESS OPPORTUNITY, PERSONAL INJURY, ILLNESS, FOOD POISONING, EMOTIONAL DISTRESS, LOSS OF REPUTATION, OR PROPERTY DAMAGE.
                  </p>
                  <p className="leading-relaxed font-bold text-purple-900">
                    NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, THE TOTAL AGGREGATE FINANCIAL LIABILITY OF MARKATVERSE FOR ANY AND ALL CLAIMS, DISPUTES, OR ACTIONS ARISING OUT OF OR IN CONNECTION WITH ANY ORDER, SERVICE, OR PLATFORM USAGE SHALL BE STRICTLY CAPPED AT THE LESSER OF:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-white rounded-xl border border-purple-200 text-center font-bold text-purple-900">
                      (A) Net Platform Commission/Fee actually retained by MarkatVerse for that specific transaction
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-purple-200 text-center font-bold text-purple-900">
                      (B) A flat maximum amount of ₹1,000 (One Thousand Indian Rupees)
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Clause 9: Comprehensive Seller Indemnity Agreement */}
            {(activeTab === 'ALL' || activeTab === 'LIABILITY') && (
              <section id="seller-indemnity" className="space-y-4 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Section 9 • Seller Indemnity
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  9. Comprehensive Seller & User Indemnification (Hold Harmless)
                </h2>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Mandatory Seller Legal Defense Obligation
                  </div>
                  <p className="leading-relaxed">
                    By registering, onboarding, or listing goods or services on MarkatVerse, every Seller, Restaurant, and Service Provider agrees to fully indemnify, defend, and hold harmless MarkatVerse, its owners, founders, directors, employees, and software engineers against all third-party claims, legal notices, consumer court suits, damages, penalties, and legal costs.
                  </p>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>
                    This indemnification covers any claims arising directly or indirectly from:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700 font-medium">
                    <li>Food safety violations, food poisoning, adulteration, or non-compliance with the FSSAI Act;</li>
                    <li>Defective, expired, unsafe, substandard, or dangerous products sold by the merchant;</li>
                    <li>Accidental damage, personal injury, structural harm, or negligence committed by technicians or service personnel during site visits;</li>
                    <li>Chemical burns, allergic reactions, or scalp injuries during beauty, spa, or salon procedures;</li>
                    <li>Intellectual property infringements, counterfeit goods, or unauthorized trademark usage;</li>
                    <li>Taxation defaults, non-issuance of GST invoices, or GSTR-1 filing discrepancies;</li>
                    <li>Consumer complaints filed before any District, State, or National Consumer Disputes Redressal Commission.</li>
                  </ul>
                </div>
              </section>
            )}

            {/* Clause 10: Arbitration & Jurisdiction */}
            {(activeTab === 'ALL') && (
              <section id="dispute-arbitration" className="space-y-4 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <Scale className="w-4 h-4" /> Section 10 • Dispute Resolution
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  10. Governing Law, Binding Arbitration & Jurisdiction
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <p>
                    <strong>10.1 Governing Law:</strong> These Terms and any dispute arising out of your relationship with MarkatVerse shall be governed by, construed, and interpreted in accordance with the laws of the Republic of India, without regard to its conflict of law principles.
                  </p>
                  <p>
                    <strong>10.2 Mandatory Arbitration:</strong> Any dispute, controversy, or claim arising out of or relating to these Terms shall first be attempted to be resolved amicably through mutual executive conciliation for a period of thirty (30) days. Failing such resolution, the dispute shall be finally settled by binding arbitration in accordance with the <em>Arbitration and Conciliation Act, 1996</em> by a sole arbitrator mutually appointed by MarkatVerse. The seat and venue of arbitration shall be in India, and the proceedings shall be conducted in the English language.
                  </p>
                  <p>
                    <strong>10.3 Exclusive Court Jurisdiction:</strong> Subject to the arbitration clause above, the competent courts located within the jurisdiction of the company&apos;s registered office in India shall have exclusive territorial jurisdiction over any legal proceedings.
                  </p>
                </div>
              </section>
            )}

            {/* Clause 11: Grievance Redressal Officer */}
            {(activeTab === 'ALL') && (
              <section id="grievance-officer" className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                  <Mail className="w-4 h-4" /> Section 11 • Statutory Grievance Redressal
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  11. Grievance Redressal Officer & Nodal Contact
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the Consumer Protection (E-Commerce) Rules, 2020, the details of the designated Grievance Redressal Officer for MarkatVerse are set out below:
                </p>

                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 text-xs">
                  <div className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Grievance Redressal & Nodal Desk
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Designation:</span>
                      <strong className="text-white">Grievance Officer & Legal Counsel</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Statutory Email:</span>
                      <a href="mailto:grievance@markatverse.com" className="text-emerald-400 font-mono hover:underline">
                        grievance@markatverse.com
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Customer Support:</span>
                      <a href="mailto:support@markatverse.com" className="text-emerald-400 font-mono hover:underline">
                        support@markatverse.com
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Resolution Protocol:</span>
                      <span className="text-slate-300">Acknowledgment within 48 hours; resolution within 30 days.</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
