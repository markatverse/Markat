"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, X, ShieldCheck, Check, 
  RotateCcw, Sparkles, Building2, Calendar, FileText,
  Calculator, ArrowRight, Layers
} from 'lucide-react';
import Link from 'next/link';

interface SubscriptionPlan {
  id: string;
  planName: string;
  price: number;
  billingCycle?: string;
  taxPercent?: number;
  sacCode?: string;
  gstAmount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  totalPrice?: number;
  effectiveFormula?: string;
  features: string[];
  status: string;
  createdAt?: string;
}

export default function CommercialSubscriptionsPage() {
  const [items, setItems] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    planName: '',
    price: 999,
    billingCycle: 'MONTHLY',
    taxPercent: 18,
    sacCode: '998319',
    featuresText: '',
    status: 'ACTIVE'
  });

  // Simulator state
  const [simBase, setSimBase] = useState<number>(1499);
  const [simSupplyType, setSimSupplyType] = useState<'INTRA' | 'INTER'>('INTRA');

  const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') return 'http://' + window.location.hostname + ':3001';
    return 'http://localhost:3001';
  };
  const API_URL = getApiUrl();

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/commercial/subscriptions`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSeedDefaults = async () => {
    if (!confirm('This will restore official Starter, Growth Pro, and Enterprise subscription tiers with 18% GST (SAC 998319). Continue?')) return;
    setSeeding(true);
    try {
      const res = await fetch(`${API_URL}/commercial/subscriptions/seed-defaults`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  const openModal = (item: any = null) => {
    if (item) {
      setFormData({
        id: item.id,
        planName: item.planName,
        price: item.price,
        billingCycle: item.billingCycle || 'MONTHLY',
        taxPercent: item.taxPercent ?? 18,
        sacCode: item.sacCode || '998319',
        featuresText: Array.isArray(item.features) ? item.features.join('\n') : '',
        status: item.status || 'ACTIVE'
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: '',
        planName: '',
        price: 999,
        billingCycle: 'MONTHLY',
        taxPercent: 18,
        sacCode: '998319',
        featuresText: 'Official Verified Merchant Badge\nPriority Customer Inquiries\nUnlimited Product Menu Listings',
        status: 'ACTIVE'
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing 
      ? `${API_URL}/commercial/subscriptions/${formData.id}`
      : `${API_URL}/commercial/subscriptions`;
    const method = isEditing ? 'PATCH' : 'POST';
    
    const features = formData.featuresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: formData.planName,
          price: parseFloat(formData.price as any),
          billingCycle: formData.billingCycle,
          taxPercent: parseFloat(formData.taxPercent as any),
          sacCode: formData.sacCode,
          features,
          status: formData.status
        })
      });
      if (res.ok) {
        fetchItems();
        closeModal();
      }
    } catch (error) {
      console.error("Failed to save subscription", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) return;
    try {
      const res = await fetch(`${API_URL}/commercial/subscriptions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleToggleStatus = async (item: SubscriptionPlan) => {
    const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`${API_URL}/commercial/subscriptions/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Failed to toggle status", error);
    }
  };

  // Form preview calculations
  const formTax = useMemo(() => {
    const p = Math.max(0, parseFloat(formData.price as any) || 0);
    const r = Math.max(0, parseFloat(formData.taxPercent as any) || 18);
    const gst = Math.round(p * (r / 100) * 100) / 100;
    const total = Math.round((p + gst) * 100) / 100;
    return { p, r, gst, total };
  }, [formData.price, formData.taxPercent]);

  // Simulator calculations
  const simTax = useMemo(() => {
    const base = Math.max(0, simBase || 0);
    const gstRate = 18;
    const gstTotal = Math.round(base * 0.18 * 100) / 100;
    const isInter = simSupplyType === 'INTER';
    const cgst = isInter ? 0 : Math.round((gstTotal / 2) * 100) / 100;
    const sgst = isInter ? 0 : Math.round((gstTotal - cgst) * 100) / 100;
    const igst = isInter ? gstTotal : 0;
    const total = Math.round((base + gstTotal) * 100) / 100;
    return { base, gstTotal, cgst, sgst, igst, total, isInter };
  }, [simBase, simSupplyType]);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full pb-20">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-white tracking-tight">Subscription Plans & GST</h1>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              SAC 998319 • 18% GST
            </span>
          </div>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            Manage merchant verified membership plans. Platform automatically charges: <strong>Plan Base Price + 18% GST</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 px-4 py-2.5 rounded-xl font-bold transition-all text-xs flex items-center gap-2 disabled:opacity-50"
            title="Restore default verified merchant tiers"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-indigo-400 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Restoring...' : 'Restore Default Tiers'}
          </button>

          <button 
            onClick={() => openModal()} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Subscription Plan
          </button>
        </div>
      </header>

      {/* Statutory GST Notice Banner */}
      <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 flex items-start gap-4 text-xs shadow-xl">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-black text-white text-sm">
              Statutory GST on Subscriptions: Base Price + 18% GST (SAC 998319)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              Active Rule
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            Merchant verified store memberships and software directory subscriptions are classified as IT SaaS and portal access services under <strong>SAC 998319</strong> attracting <strong>18% GST</strong> (9% CGST + 9% SGST for Intra-State or 18% IGST for Inter-State). The marketplace issues a compliant B2B tax invoice enabling registered merchants to claim 100% Input Tax Credit (ITC).
          </p>
          <div className="pt-1 flex items-center gap-4 text-[11px] text-indigo-300">
            <Link href="/admin/settings/tax" className="inline-flex items-center gap-1 hover:text-white underline underline-offset-4 decoration-indigo-400/50">
              <span>View Central Tax Settings &amp; GST Slabs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href="/admin/commercial/commission" className="inline-flex items-center gap-1 hover:text-white underline underline-offset-4 decoration-indigo-400/50">
              <span>View Marketplace Commission + GST</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-slate-500 font-medium">Loading subscription tiers...</div>
        ) : items.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="mb-3">No subscription tiers configured.</p>
            <button 
              onClick={handleSeedDefaults}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              Restore Standard Verified Tiers
            </button>
          </div>
        ) : (
          items.map((plan) => {
            const basePrice = plan.price || 0;
            const taxPct = plan.taxPercent ?? 18;
            const gstAmt = plan.gstAmount ?? Math.round(basePrice * (taxPct / 100) * 100) / 100;
            const totalPayable = plan.totalPrice ?? Math.round((basePrice + gstAmt) * 100) / 100;

            return (
              <div 
                key={plan.id}
                className="bg-slate-900/80 rounded-3xl border border-slate-700/80 p-6 flex flex-col justify-between relative overflow-hidden shadow-xl hover:border-indigo-500/40 transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                      {plan.billingCycle || 'MONTHLY'} PLAN
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      plan.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {plan.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white mb-2">{plan.planName}</h3>

                  {/* Pricing Breakdown Card */}
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-2 mb-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400">Base Plan Price:</span>
                      <span className="text-sm font-mono font-bold text-slate-200">₹{basePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs text-indigo-300 border-b border-white/5 pb-2">
                      <span>18% GST (SAC 998319):</span>
                      <span className="font-mono font-bold">+ ₹{gstAmt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1">
                      <div>
                        <span className="text-xs font-bold text-white block">Total Payable:</span>
                        <span className="text-[10px] text-slate-500">Includes all taxes</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black font-mono text-emerald-400">
                          ₹{totalPayable.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-normal">
                          /{plan.billingCycle ? plan.billingCycle.toLowerCase() : 'mo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-2 mb-6">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Included Privileges:</div>
                    {Array.isArray(plan.features) && plan.features.length > 0 ? (
                      plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Standard verified store privileges.</p>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <button 
                    onClick={() => handleToggleStatus(plan)}
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    Toggle Status
                  </button>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openModal(plan)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl transition-colors"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 bg-slate-800 hover:bg-rose-900/30 hover:text-rose-400 text-slate-500 rounded-xl transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive B2B Subscription Tax Simulator */}
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">B2B Subscription Tax Invoice Simulator</h2>
            <p className="text-xs text-slate-400">Simulate exact GST invoice and Input Tax Credit (ITC) breakdown for any custom subscription price.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-white/5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Base Subscription Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input 
                  type="number"
                  min="0"
                  step="50"
                  value={simBase}
                  onChange={(e) => setSimBase(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono font-bold text-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Merchant Location / Supply Type
              </label>
              <select 
                value={simSupplyType}
                onChange={(e) => setSimSupplyType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="INTRA">Intra-State Supply (CGST 9% + SGST 9%)</option>
                <option value="INTER">Inter-State Supply (IGST 18%)</option>
              </select>
            </div>

            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                100% Input Tax Credit (ITC) eligible for all GST-registered merchants upon entering their GSTIN during subscription checkout.
              </span>
            </div>
          </div>

          <div className="md:col-span-7 bg-slate-950/70 p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
              <span className="text-slate-400 uppercase font-black">Tax Invoice Line Item</span>
              <span className="text-slate-400 uppercase font-black">Amount (INR)</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">Base Plan Price (Taxable Value):</span>
              <span className="font-mono font-bold text-white">₹{simTax.base.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-indigo-300 pl-4 border-l-2 border-indigo-500/30">
              <span>
                18% GST (SAC 998319):
                <span className="text-[10px] text-slate-500 ml-1.5">
                  {!simTax.isInter 
                    ? `(CGST 9% ₹${simTax.cgst.toFixed(2)} + SGST 9% ₹${simTax.sgst.toFixed(2)})` 
                    : `(IGST 18% ₹${simTax.igst.toFixed(2)})`}
                </span>
              </span>
              <span className="font-mono font-bold">+ ₹{simTax.gstTotal.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 p-4 rounded-xl border border-indigo-500/30">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-200 block">
                  Total Payable by Merchant
                </span>
                <span className="text-[10px] text-slate-400">Base Price + Statutory 18% GST</span>
              </div>
              <span className="text-2xl font-black font-mono text-emerald-400">
                ₹{simTax.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-white">{isEditing ? 'Edit Subscription Plan' : 'New Subscription Plan'}</h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Plan Name
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.planName} 
                  onChange={e => setFormData({...formData, planName: e.target.value})} 
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm" 
                  placeholder="e.g. Growth Pro Merchant" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Base Price (₹ excl. GST)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input 
                      required 
                      type="number" 
                      step="1" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} 
                      className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-indigo-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Billing Cycle
                  </label>
                  <select 
                    value={formData.billingCycle} 
                    onChange={e => setFormData({...formData, billingCycle: e.target.value})} 
                    className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly (Annual)</option>
                    <option value="LIFETIME">One-Time Lifetime</option>
                  </select>
                </div>
              </div>

              {/* Dynamic GST Calculation Box */}
              <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Base Price:</span>
                  <span className="font-mono font-bold text-white">₹{formTax.p.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-indigo-300">
                  <span>+ 18% GST (SAC 998319):</span>
                  <span className="font-mono font-bold">₹{formTax.gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-indigo-500/30">
                  <span className="font-bold text-white">Total Amount Charged to Seller:</span>
                  <span className="font-mono font-black text-emerald-400 text-lg">₹{formTax.total.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Features &amp; Privileges (one per line)
                </label>
                <textarea 
                  rows={4}
                  value={formData.featuresText} 
                  onChange={e => setFormData({...formData, featuresText: e.target.value})} 
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-sans" 
                  placeholder="Official Verified Merchant Badge&#10;Unlimited Catalog Creations&#10;Direct WhatsApp Leads" 
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Plan Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, status: 'ACTIVE'})}
                    className={`py-2 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 ${formData.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-950/50 border-slate-700 text-slate-500'}`}
                  >
                    {formData.status === 'ACTIVE' && <Check className="w-3.5 h-3.5" />} Active
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, status: 'INACTIVE'})}
                    className={`py-2 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 ${formData.status === 'INACTIVE' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-slate-950/50 border-slate-700 text-slate-500'}`}
                  >
                    {formData.status === 'INACTIVE' && <Check className="w-3.5 h-3.5" />} Inactive
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                >
                  Save Subscription Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
