"use client";

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Sparkles, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  Loader2, 
  Percent, 
  Gift, 
  Plus, 
  Trash2, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiUrl } from '@/utils/api';

const API_URL = getApiUrl();

const OCCASION_PRESETS = [
  {
    name: 'Diwali Festive Offer 🪔',
    type: 'PERCENTAGE',
    value: 50,
    reason: 'Diwali Special Celebration: 50% OFF merchant registration fee!',
  },
  {
    name: 'Platform Launch Waiver 🚀',
    type: 'WAIVED',
    value: 100,
    reason: 'Grand Launch Celebration: 100% Free Registration for early merchants!',
  },
  {
    name: 'New Year Mega Offer 🎊',
    type: 'PERCENTAGE',
    value: 40,
    reason: 'New Year Kickoff: Flat 40% OFF for all onboarding sellers!',
  },
  {
    name: 'Independence Day Special 🇮🇳',
    type: 'FLAT',
    value: 1000,
    reason: 'Azadi Ka Amrit Mahotsav: Flat ₹1,000 instant discount!',
  },
  {
    name: 'Holi Colors of Trade 🎨',
    type: 'PERCENTAGE',
    value: 30,
    reason: 'Holi Festive Offer: 30% OFF merchant onboarding packages!',
  },
];

export default function RegistrationFeeSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [isEnabled, setIsEnabled] = useState(true);
  const [baseFee, setBaseFee] = useState<number>(1999);
  const [taxPercent, setTaxPercent] = useState<number>(18);
  const [isDiscountActive, setIsDiscountActive] = useState(true);
  const [occasionName, setOccasionName] = useState('Diwali Festive Launch Offer 🪔');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FLAT' | 'WAIVED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(50);
  const [discountReason, setDiscountReason] = useState('Special festive season celebration - 50% OFF one-time seller onboarding fee!');
  const [validUntil, setValidUntil] = useState<string>('2026-11-30');
  const [benefits, setBenefits] = useState<string[]>([
    'Official Verified Merchant Badge on Store & Listings',
    'Unlimited Product & Service Catalog Creation',
    'Direct Phone Calls & WhatsApp Customer Leads',
    'Live Token & Queue Appointment Booking System',
    'Dedicated Merchant Support & Priority Onboarding Assistance',
    '0% Additional Commission for First 30 Days'
  ]);
  const [newBenefitText, setNewBenefitText] = useState('');
  const [stats, setStats] = useState<{ total: number; paid: number; waived: number; pending: number; totalCollected: number }>({
    total: 0,
    paid: 0,
    waived: 0,
    pending: 0,
    totalCollected: 0
  });

  // Fetch current config on load
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        fetch(`${API_URL}/commercial/registration-fee`),
        fetch(`${API_URL}/commercial/registration-fee/stats`)
      ]);
      if (res.ok) {
        const data = await res.json();
        setIsEnabled(data.isEnabled !== false);
        setBaseFee(data.baseFee ?? 1999);
        setTaxPercent(data.taxPercent ?? 0);
        setIsDiscountActive(data.isDiscountActive ?? true);
        setOccasionName(data.occasionName || 'Diwali Festive Launch Offer 🪔');
        setDiscountType(data.discountType || 'PERCENTAGE');
        setDiscountValue(data.discountValue ?? 50);
        setDiscountReason(data.discountReason || '');
        setValidUntil(data.validUntil || '');
        if (Array.isArray(data.benefits) && data.benefits.length > 0) {
          setBenefits(data.benefits);
        }
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to load registration fee config', err);
      toast.error('Could not load current fee configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSyncTagline = () => {
    let synced = '';
    if (discountType === 'WAIVED') {
      synced = `Special ${occasionName || 'festive'} offer - 100% Free merchant onboarding registration!`;
    } else if (discountType === 'PERCENTAGE') {
      synced = `Special festive season celebration - ${discountValue}% OFF one-time seller onboarding fee!`;
    } else {
      synced = `Special festive celebration - Flat ₹${discountValue} OFF one-time seller onboarding fee!`;
    }
    setDiscountReason(synced);
    toast.success('Promotional tagline updated to match discount!');
  };

  // Live Calculations
  const calculated = React.useMemo(() => {
    let effective = baseFee;
    let savings = 0;

    if (!isEnabled) {
      return { effectiveFee: 0, savingsAmount: baseFee, isFree: true };
    }

    if (isDiscountActive) {
      if (discountType === 'WAIVED') {
        effective = 0;
        savings = baseFee;
      } else if (discountType === 'PERCENTAGE') {
        const discountAmt = (baseFee * Math.min(100, Math.max(0, discountValue))) / 100;
        effective = Math.max(0, Math.round(baseFee - discountAmt));
        savings = Math.round(discountAmt);
      } else if (discountType === 'FLAT') {
        effective = Math.max(0, Math.round(baseFee - discountValue));
        savings = Math.min(baseFee, discountValue);
      }
    }

    const taxAmt = effective > 0 && taxPercent > 0 ? Math.round(effective * (taxPercent / 100) * 100) / 100 : 0;
    const totalWithTax = Math.round((effective + taxAmt) * 100) / 100;

    return {
      discountedBase: effective,
      taxAmount: taxAmt,
      effectiveFee: totalWithTax,
      savingsAmount: savings,
      isFree: totalWithTax === 0
    };
  }, [baseFee, isEnabled, isDiscountActive, discountType, discountValue, taxPercent]);

  const handleApplyPreset = (preset: typeof OCCASION_PRESETS[0]) => {
    setOccasionName(preset.name);
    setDiscountType(preset.type as any);
    setDiscountValue(preset.value);
    setDiscountReason(preset.reason);
    setIsDiscountActive(true);
    toast.success(`Applied "${preset.name}" preset!`);
  };

  const handleAddBenefit = () => {
    if (!newBenefitText.trim()) return;
    setBenefits(prev => [...prev, newBenefitText.trim()]);
    setNewBenefitText('');
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        isEnabled,
        baseFee: Number(baseFee),
        taxPercent: Number(taxPercent),
        isDiscountActive,
        occasionName,
        discountType,
        discountValue: Number(discountValue),
        discountReason,
        validUntil: validUntil || null,
        benefits,
      };

      const res = await fetch(`${API_URL}/commercial/registration-fee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update registration fee');
      const updated = await res.json();
      toast.success('Registration fee & occasion discount saved successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Error updating registration fee');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner Alert / Summary */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/60 border border-indigo-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5" />
            Merchant Monetization & Festive Promotions
          </div>
          <h2 className="text-xl font-black text-white">Seller Registration Fee & Occasion Discounts</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Control the one-time registration fee charged to sellers during store onboarding. Set festival discounts, launch waivers, and customize the value proposition shown to registering merchants.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Publishing Changes...' : 'Save & Publish Changes'}
        </button>
      </div>

      {/* Fee Collections & Compliance KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Merchants</span>
          <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Registered stores</span>
        </div>

        <div className="bg-slate-800/90 border border-emerald-500/30 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Total Revenue Collected</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">₹{stats.totalCollected.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">From {stats.paid} paid merchants</span>
        </div>

        <div className="bg-slate-800/90 border border-blue-500/30 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Waived / Free Stores</span>
          <div className="text-2xl font-black text-blue-400 mt-1">{stats.waived}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">100% free / waived</span>
        </div>

        <div className="bg-slate-800/90 border border-amber-500/30 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Pending Fee / Verification</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.pending}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting admin review</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Base Fee Controls */}
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Master Registration Fee</h3>
                  <p className="text-xs text-slate-400">Enable or disable charging merchants for store verification</p>
                </div>
              </div>

              {/* Master Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Base Registration Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={!isEnabled}
                    value={baseFee}
                    onChange={(e) => setBaseFee(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-base focus:border-indigo-500 focus:outline-none disabled:opacity-40"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Standard full price before any festive discount</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Applicable GST / Tax (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="28"
                    step="1"
                    disabled={!isEnabled}
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                    className="w-full pr-8 pl-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-base focus:border-indigo-500 focus:outline-none disabled:opacity-40"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Set 0% for inclusive / tax-free registration</p>
              </div>
            </div>
          </div>

          {/* Section 2: Occasion / Festival Discount Controls */}
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Occasion & Festival Discount</h3>
                  <p className="text-xs text-slate-400">Provide special promotions on festivals, celebrations & events</p>
                </div>
              </div>

              {/* Discount Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isEnabled}
                  checked={isDiscountActive}
                  onChange={(e) => setIsDiscountActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500 disabled:opacity-40"></div>
              </label>
            </div>

            {/* Quick Presets Strip */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-2">⚡ Quick Occasion Presets</span>
              <div className="flex flex-wrap gap-2">
                {OCCASION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Occasion Details Form */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Occasion / Festival Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diwali Festive Offer 🪔, Launch Promo 🚀, New Year Special"
                  disabled={!isEnabled || !isDiscountActive}
                  value={occasionName}
                  onChange={(e) => setOccasionName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    disabled={!isEnabled || !isDiscountActive}
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-40"
                  >
                    <option value="PERCENTAGE">Percentage Discount (% OFF)</option>
                    <option value="FLAT">Flat Cash Discount (₹ OFF)</option>
                    <option value="WAIVED">100% Free / Fee Waived (₹0)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    {discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : discountType === 'FLAT' ? 'Discount Amount (₹)' : 'Waiver Mode'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={discountType === 'PERCENTAGE' ? 100 : baseFee}
                    disabled={!isEnabled || !isDiscountActive || discountType === 'WAIVED'}
                    value={discountType === 'WAIVED' ? 100 : discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Promotional Tagline / Merchant Reason
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoSyncTagline}
                    disabled={!isEnabled || !isDiscountActive}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition-colors"
                  >
                    ⚡ Auto-sync with {discountType === 'WAIVED' ? '100% Free' : discountType === 'PERCENTAGE' ? `${discountValue}%` : `₹${discountValue}`} Discount
                  </button>
                </div>
                <textarea
                  rows={2}
                  disabled={!isEnabled || !isDiscountActive}
                  placeholder="e.g. Special festive celebration offer - Get verified and start selling at flat 50% discount!"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:border-indigo-500 focus:outline-none disabled:opacity-40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Offer Valid Until (Optional)
                </label>
                <input
                  type="date"
                  disabled={!isEnabled || !isDiscountActive}
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-40"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Editable Value Proposition / Benefits */}
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Merchant Inclusions & Benefits</h3>
                <p className="text-xs text-slate-400">Bullet points displayed to registering merchants</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {benefits.map((b, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="flex-1 font-medium">{b}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove benefit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Benefit */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add a new onboarding perk..."
                value={newBenefitText}
                onChange={(e) => setNewBenefitText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBenefit(); } }}
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Live Merchant Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 space-y-4">
            
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Eye className="w-4 h-4" /> Live Merchant Preview
              </span>
              <span>Renders on /seller/register</span>
            </div>

            {/* The Live Card as Seen by the Registering Seller */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl text-slate-900 relative overflow-hidden">
              
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Status Header */}
              <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Store Onboarding
                </span>

                {isDiscountActive && calculated.savingsAmount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                    {discountType === 'WAIVED' ? '100% Free Waiver' : `${discountValue}% Festive Discount`}
                  </span>
                )}
              </div>

              {/* Occasion Banner */}
              {isDiscountActive && occasionName && (
                <div className="mb-4 p-3 bg-gradient-to-r from-pink-50 to-amber-50 border border-pink-200/80 rounded-2xl relative z-10">
                  <div className="flex items-center gap-2 text-pink-700 font-extrabold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    <span>{occasionName}</span>
                  </div>
                  {discountReason && (
                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                      {discountReason}
                    </p>
                  )}
                  {validUntil && (
                    <div className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Offer valid through: {validUntil}
                    </div>
                  )}
                </div>
              )}

              {/* Pricing Display */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-5 relative z-10">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Payable Onboarding Fee</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-slate-900">
                        {calculated.isFree ? 'FREE' : `₹${calculated.effectiveFee.toLocaleString('en-IN')}`}
                      </span>
                      {calculated.savingsAmount > 0 && (
                        <span className="text-sm font-semibold text-slate-400 line-through">
                          ₹{baseFee.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    {(calculated.taxAmount ?? 0) > 0 && (
                      <span className="text-[10px] text-indigo-600 font-semibold block mt-1">
                        Base ₹{calculated.discountedBase} + {taxPercent}% GST (₹{calculated.taxAmount ?? 0})
                      </span>
                    )}
                  </div>

                  {calculated.savingsAmount > 0 && (
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black inline-block">
                        Save ₹{calculated.savingsAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-1">One-Time Lifetime Fee</span>
                    </div>
                  )}
                </div>
              </div>

              {/* What's Included */}
              <div className="space-y-3 relative z-10">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  What's included in this registration:
                </span>
                <div className="space-y-2">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 relative z-10">
                <div className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20">
                  {calculated.isFree ? 'Claim Free Verification & Launch 🚀' : `Pay ₹${calculated.effectiveFee} & Submit for Verification`}
                </div>
              </div>

            </div>

            {/* Quick Helper Note */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <AlertCircle className="w-4 h-4 text-indigo-400" /> Administrative Notice
              </div>
              <p>
                When you click "Save & Publish Changes", the new fee and occasion discount immediately update on the live website and Vercel production API for all new registering sellers.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

