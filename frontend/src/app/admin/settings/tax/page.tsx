"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, X, Percent, Check, 
  RotateCcw, ShieldCheck, Calculator, FileText, 
  Building2, ArrowRight, Info, AlertTriangle, Layers
} from 'lucide-react';

interface TaxRule {
  id: string;
  name: string;
  rate: number;
  status: string;
  updatedAt: string;
}

export default function SettingsTaxPage() {
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'STATUTORY' | 'GOODS_SLABS'>('ALL');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [rate, setRate] = useState<number | string>('');
  const [status, setStatus] = useState('ACTIVE');

  // Interactive Settlement Simulator State
  const [simGross, setSimGross] = useState<number>(1000);
  const [simProfile, setSimProfile] = useState<'GOODS_GST' | 'RESTAURANT_9_5' | 'UNREG_SERVICE_9_5' | 'EXEMPT_GOODS'>('GOODS_GST');
  const [simSupplyType, setSimSupplyType] = useState<'INTRA' | 'INTER'>('INTRA');
  const [simCommRate, setSimCommRate] = useState<number>(10);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchRules = async () => {
    try {
      const res = await fetch(`${API_URL}/system-config/tax`);
      if (res.ok) {
        setRules(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSeedStatutory = async () => {
    if (!confirm('This will restore all Indian Statutory GST & TCS rules (Sec 9(1), Sec 52 TCS, Sec 9(5), and Product Slabs 0%-28%). Continue?')) return;
    setSeeding(true);
    try {
      const res = await fetch(`${API_URL}/system-config/tax/seed-statutory`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchRules();
      } else {
        alert('Failed to restore statutory rules');
      }
    } catch (e) {
      console.error(e);
      alert('Error communicating with backend server');
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenModal = (rule?: TaxRule) => {
    if (rule) {
      setEditingId(rule.id);
      setName(rule.name);
      setRate(rule.rate);
      setStatus(rule.status);
    } else {
      setEditingId(null);
      setName('');
      setRate('');
      setStatus('ACTIVE');
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name || rate === '') return alert('Name and Rate are required');
    const method = editingId ? 'PATCH' : 'POST';
    const endpoint = editingId ? `/system-config/tax/${editingId}` : '/system-config/tax';
    
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rate: parseFloat(rate as string), status })
      });
      if (res.ok) {
        setShowModal(false);
        fetchRules();
      } else {
        alert('Failed to save tax rule');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax rule?')) return;
    try {
      const res = await fetch(`${API_URL}/system-config/tax/${id}`, { method: 'DELETE' });
      if (res.ok) fetchRules();
    } catch (e) {
      console.error(e);
    }
  };

  // Tag helper
  const getRuleBadge = (ruleName: string) => {
    const lower = ruleName.toLowerCase();
    if (lower.includes('9(1)') || lower.includes('commission')) {
      return { label: 'SECTION 9(1)', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    }
    if (lower.includes('52') || lower.includes('tcs')) {
      return { label: 'SECTION 52 TCS', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
    if (lower.includes('9(5)')) {
      return { label: 'SECTION 9(5) ECO', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
    if (lower.includes('slab')) {
      return { label: 'GOODS SLAB', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    }
    return { label: 'CUSTOM TAX', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
  };

  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter.toUpperCase();
      
      const lower = r.name.toLowerCase();
      const isStatutory = lower.includes('section 9') || lower.includes('section 52') || lower.includes('tcs');
      const isGoodsSlab = lower.includes('slab');

      let matchesCategory = true;
      if (categoryFilter === 'STATUTORY') matchesCategory = isStatutory;
      if (categoryFilter === 'GOODS_SLABS') matchesCategory = isGoodsSlab;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [rules, searchTerm, statusFilter, categoryFilter]);

  // Simulation calculations
  const simResults = useMemo(() => {
    const gross = Math.max(0, simGross || 0);
    const commPct = Math.max(0, simCommRate || 0);
    const baseComm = Math.round((gross * (commPct / 100)) * 100) / 100;
    
    // 18% GST on Commission (SAC 998319)
    const commGst = Math.round((baseComm * 0.18) * 100) / 100;
    const isInter = simSupplyType === 'INTER';
    const commCgst = isInter ? 0 : Math.round((commGst / 2) * 100) / 100;
    const commSgst = isInter ? 0 : Math.round((commGst - commCgst) * 100) / 100;
    const commIgst = isInter ? commGst : 0;

    // Section 52 TCS: 1% on net value of goods by registered suppliers
    const isTcs = simProfile === 'GOODS_GST';
    const tcsRate = isTcs ? 1 : 0;
    const tcsAmount = isTcs ? Math.round((gross * 0.01) * 100) / 100 : 0;
    const tcsCgst = isInter ? 0 : Math.round((tcsAmount / 2) * 100) / 100;
    const tcsSgst = isInter ? 0 : Math.round((tcsAmount - tcsCgst) * 100) / 100;
    const tcsIgst = isInter ? tcsAmount : 0;

    // Section 9(5) ECO Liability
    let ecoRate = 0;
    let ecoSection = '';
    if (simProfile === 'RESTAURANT_9_5') {
      ecoRate = 5;
      ecoSection = 'Section 9(5) Restaurant Food (5% without ITC)';
    } else if (simProfile === 'UNREG_SERVICE_9_5') {
      ecoRate = 18;
      ecoSection = 'Section 9(5) Unregistered Home Services (18%)';
    }
    const ecoTaxAmount = Math.round((gross * (ecoRate / 100)) * 100) / 100;

    // Deductions from Seller
    const totalPlatformFee = Math.round((baseComm + commGst) * 100) / 100;
    const totalDeduction = Math.round((totalPlatformFee + tcsAmount) * 100) / 100;
    const netSellerPayout = Math.max(0, Math.round((gross - totalDeduction) * 100) / 100);

    return {
      gross,
      baseComm,
      commGst,
      commCgst,
      commSgst,
      commIgst,
      isTcs,
      tcsRate,
      tcsAmount,
      tcsCgst,
      tcsSgst,
      tcsIgst,
      ecoRate,
      ecoSection,
      ecoTaxAmount,
      totalPlatformFee,
      totalDeduction,
      netSellerPayout
    };
  }, [simGross, simProfile, simSupplyType, simCommRate]);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-500 w-full relative pb-20">
      
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 relative z-10 border-b border-white/5 pb-8 gap-4">
        <div className="flex gap-4 items-center">
          <div className="p-4 bg-gradient-to-br from-indigo-500/20 via-blue-500/20 to-emerald-500/20 rounded-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-400 tracking-tight">
                GST & Tax Configuration
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                CGST & IGST Compliant
              </span>
            </div>
            <p className="text-slate-400 mt-1 text-sm font-medium">
              Statutory E-Commerce Operator (ECO) sections: Sec 9(1) SAC 998319 commission, Sec 52 TCS, Sec 9(5) restaurant/services, and standard product GST slabs.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleSeedStatutory}
            disabled={seeding}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-2 disabled:opacity-50"
            title="Restore official Indian GST & TCS rules"
          >
            <RotateCcw className={`w-4 h-4 text-indigo-400 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Restoring...' : 'Restore Statutory Rules'}
          </button>

          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Tax Rule
          </button>
        </div>
      </header>

      {/* Statutory ECO Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        
        {/* Section 9(1) Card */}
        <div className="p-6 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 rounded-3xl border border-indigo-500/20 backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black tracking-widest uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
              Section 9(1) • SAC 998319
            </span>
            <div className="text-2xl font-black text-indigo-400 font-mono">18%</div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Marketplace Commission GST</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Platform charges 18% GST (9% CGST + 9% SGST or 18% IGST) on commission fees. Invoiced to merchants with valid GSTIN for Input Tax Credit.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-indigo-300 font-semibold bg-indigo-500/10 rounded-xl px-3 py-2 border border-indigo-500/20">
            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
            Remitted via GSTR-1 & GSTR-3B monthly
          </div>
        </div>

        {/* Section 52 Card */}
        <div className="p-6 bg-gradient-to-br from-amber-950/40 to-slate-900/60 rounded-3xl border border-amber-500/20 backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black tracking-widest uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
              Section 52 • Form GSTR-8
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono">1% TCS</div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">E-Commerce TCS on Goods</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Mandatory 1% Tax Collected at Source (0.5% CGST + 0.5% SGST or 1% IGST) withheld on net taxable supplies of goods by registered merchants.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-amber-300 font-semibold bg-amber-500/10 rounded-xl px-3 py-2 border border-amber-500/20">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            Auto-credited to Merchant Cash Ledger
          </div>
        </div>

        {/* Section 9(5) Card */}
        <div className="p-6 bg-gradient-to-br from-emerald-950/40 to-slate-900/60 rounded-3xl border border-emerald-500/20 backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
              Section 9(5) • Deemed Supplier
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono">5% / 18%</div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">ECO Reverse Charge Liability</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            5% on Restaurant & Cloud Kitchen supplies (Notif. 17/2021) and 18% on unregistered technicians & salons (Notif. 14/2017) remitted by platform.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-semibold bg-emerald-500/10 rounded-xl px-3 py-2 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            Operator is legally treated as the supplier
          </div>
        </div>
      </div>

      {/* Interactive Settlement Simulator Widget */}
      <div className="mb-10 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Statutory GST & Settlement Simulator</h2>
            <p className="text-xs text-slate-400">Simulate order settlement breakdown across statutory sections before dispatching payouts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Form */}
          <div className="lg:col-span-5 space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-white/5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Order / Booking Gross Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input 
                  type="number"
                  min="0"
                  step="10"
                  value={simGross}
                  onChange={(e) => setSimGross(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono font-bold text-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Seller Profile & Tax Status
              </label>
              <select 
                value={simProfile}
                onChange={(e) => setSimProfile(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="GOODS_GST">Registered Goods Seller (Sec 52 TCS 1% Applicable)</option>
                <option value="RESTAURANT_9_5">Restaurant / Cloud Kitchen (Sec 9(5) ECO 5% GST)</option>
                <option value="UNREG_SERVICE_9_5">Unregistered Technician / Salon (Sec 9(5) ECO 18%)</option>
                <option value="EXEMPT_GOODS">Exempt Goods / Below Threshold (0% TCS)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                  Supply Nature
                </label>
                <select 
                  value={simSupplyType}
                  onChange={(e) => setSimSupplyType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="INTRA">Intra-State (CGST + SGST)</option>
                  <option value="INTER">Inter-State (IGST)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                  Commission Rate (%)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={simCommRate}
                    onChange={(e) => setSimCommRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-8 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/20 text-slate-400 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>
                Marketplace fees automatically add 18% GST (SAC 998319). Seller receives net payout after platform fees and statutory TCS.
              </span>
            </div>
          </div>

          {/* Breakdown Preview Display */}
          <div className="lg:col-span-7 bg-slate-950/70 p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Ledger Item</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Statutory Amount</span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Customer Payment (Gross)</span>
                <span className="font-mono font-bold text-white">₹{simResults.gross.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pl-4 border-l-2 border-indigo-500/30">
                <span>Platform Commission ({simCommRate}%)</span>
                <span className="font-mono text-indigo-300">- ₹{simResults.baseComm.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pl-4 border-l-2 border-indigo-500/30">
                <span>
                  18% GST on Commission (SAC 998319)
                  <span className="text-[10px] text-slate-500 ml-1.5">
                    {simSupplyType === 'INTRA' 
                      ? `(CGST 9% ₹${simResults.commCgst.toFixed(2)} + SGST 9% ₹${simResults.commSgst.toFixed(2)})` 
                      : `(IGST 18% ₹${simResults.commIgst.toFixed(2)})`}
                  </span>
                </span>
                <span className="font-mono text-indigo-300">- ₹{simResults.commGst.toFixed(2)}</span>
              </div>

              {simResults.isTcs && (
                <div className="flex justify-between items-center text-xs text-amber-400/90 pl-4 border-l-2 border-amber-500/30 bg-amber-500/5 py-1 px-2 rounded-r-lg">
                  <div>
                    <span className="font-semibold">Section 52 TCS Withheld (1%)</span>
                    <span className="text-[10px] text-amber-300/80 ml-1.5">
                      {simSupplyType === 'INTRA'
                        ? `(CGST 0.5% ₹${simResults.tcsCgst.toFixed(2)} + SGST 0.5% ₹${simResults.tcsSgst.toFixed(2)})`
                        : `(IGST 1% ₹${simResults.tcsIgst.toFixed(2)})`}
                    </span>
                  </div>
                  <span className="font-mono font-bold">- ₹{simResults.tcsAmount.toFixed(2)}</span>
                </div>
              )}

              {simResults.ecoRate > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-400/90 pl-4 border-l-2 border-emerald-500/30 bg-emerald-500/5 py-1 px-2 rounded-r-lg">
                  <div>
                    <span className="font-semibold">{simResults.ecoSection}</span>
                    <span className="text-[10px] text-emerald-300/80 ml-1.5">(ECO Remits Directly to Govt)</span>
                  </div>
                  <span className="font-mono font-bold">₹{simResults.ecoTaxAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Total Deductions by Marketplace:</span>
                <span className="font-mono text-rose-400 font-bold">₹{simResults.totalDeduction.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4 rounded-xl border border-emerald-500/30">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300 block">
                    Net Merchant Payout (Credit to Wallet)
                  </span>
                  <span className="text-[11px] text-slate-400">Available for auto-settlement</span>
                </div>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ₹{simResults.netSellerPayout.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Rules Directory */}
      <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Filter Bar */}
        <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center bg-slate-900/50">
          
          {/* Category Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              All Rules ({rules.length})
            </button>
            <button
              onClick={() => setCategoryFilter('STATUTORY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === 'STATUTORY'
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Statutory Sections (Sec 9, 52)
            </button>
            <button
              onClick={() => setCategoryFilter('GOODS_SLABS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === 'GOODS_SLABS'
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Goods Slabs (0% - 28%)
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search rules..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs" 
              />
            </div>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/50 border-b border-white/5 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 pl-8">Statutory Section / Rule</th>
                <th className="p-4">Category</th>
                <th className="p-4">Statutory Rate (%)</th>
                <th className="p-4">Compliance Status</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4 pr-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">Loading statutory tax rules...</td>
                </tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    <p className="mb-3 font-medium">No tax rules found matching criteria.</p>
                    <button 
                      onClick={handleSeedStatutory}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      Restore Statutory Rules
                    </button>
                  </td>
                </tr>
              ) : (
                filteredRules.map(rule => {
                  const badge = getRuleBadge(rule.name);
                  return (
                    <tr key={rule.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 pl-8 font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                          <Percent className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{rule.name}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-blue-400 font-bold text-lg">{rule.rate}%</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          rule.status === 'ACTIVE' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                        }`}>
                          {rule.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-xs font-medium">
                        {new Date(rule.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 pr-8 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenModal(rule)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors"
                            title="Edit Rule"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(rule.id)}
                            className="p-2 bg-slate-800 hover:bg-rose-900/30 hover:text-rose-400 text-slate-500 rounded-lg transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <Percent className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Tax Rule' : 'New Tax Rule'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Rule Name / Statutory Section
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="e.g. Section 9(1) Platform Commission GST (SAC 998319)"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Sec 9(1) SAC 998319 (18%)', n: 'Section 9(1) - Platform Commission GST (SAC 998319)', r: 18 },
                    { label: 'Sec 52 TCS (1%)', n: 'Section 52 - E-Commerce TCS (Tax Collected at Source on Goods)', r: 1 },
                    { label: 'Sec 9(5) Food (5%)', n: 'Section 9(5) - Restaurant & Cloud Kitchen Food Services', r: 5 },
                    { label: 'Product 18%', n: 'Product GST Slab: 18% (Standard Rate)', r: 18 }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { setName(p.n); setRate(p.r); }}
                      className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Tax Rate (%)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                    placeholder="e.g. 18.00"
                  />
                  <Percent className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setStatus('ACTIVE')}
                    className={`py-2.5 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 ${status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-950/50 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                  >
                    {status === 'ACTIVE' && <Check className="w-3.5 h-3.5" />} Active
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStatus('INACTIVE')}
                    className={`py-2.5 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 ${status === 'INACTIVE' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-slate-950/50 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                  >
                    {status === 'INACTIVE' && <Check className="w-3.5 h-3.5" />} Inactive
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 bg-slate-800/30 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              >
                Save Tax Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
