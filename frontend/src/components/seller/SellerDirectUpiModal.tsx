"use client";
import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  X,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Receipt,
  ExternalLink,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiUrl } from '@/utils/api';

interface SellerDirectUpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  shopName?: string;
  onUpdated?: () => void;
}

export default function SellerDirectUpiModal({
  isOpen,
  onClose,
  sellerId,
  shopName = 'Service Desk',
  onUpdated,
}: SellerDirectUpiModalProps) {
  const apiUrl = getApiUrl();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settling, setSettling] = useState(false);
  const [copied, setCopied] = useState(false);

  const [upiId, setUpiId] = useState('');
  const [upiQr, setUpiQr] = useState('');
  const [threshold, setThreshold] = useState(1000);
  const [owedToPlatform, setOwedToPlatform] = useState(0);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isServiceActive, setIsServiceActive] = useState(true);

  // Fetch current payment & commission settings
  const fetchSettings = async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/service-queue/seller/${sellerId}/payment-settings`);
      if (res.ok) {
        const data = await res.json();
        setUpiId(data.sellerUpiId || '');
        setUpiQr(data.sellerUpiQr || '');
        setThreshold(data.commissionThreshold || 1000);
        setOwedToPlatform(data.owedToPlatform || 0);
        setIsSuspended(Boolean(data.commissionSuspended));
        setIsServiceActive(Boolean(data.isServiceActive));
      }
    } catch (err) {
      console.error('Failed to load seller payment settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && sellerId) {
      fetchSettings();
    }
  }, [isOpen, sellerId]);

  // Handle Image Upload for Barcode/QR
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUpiQr(result);
      toast.success('QR Code Barcode loaded! Remember to click Save.');
    };
    reader.readAsDataURL(file);
  };

  // Save UPI ID and Barcode QR
  const handleSaveSettings = async () => {
    if (!upiId.trim() && !upiQr.trim()) {
      toast.error('Please provide at least a UPI ID or upload a QR Barcode');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/service-queue/seller/${sellerId}/payment-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerUpiId: upiId.trim(),
          sellerUpiQr: upiQr.trim(),
          commissionThreshold: Number(threshold) || 1000,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Direct UPI & QR Barcode settings saved successfully!');
      if (onUpdated) onUpdated();
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Error saving payment settings');
    } finally {
      setSaving(false);
    }
  };

  // Settle Commission and Resume Services
  const handleSettleAndResume = async () => {
    setSettling(true);
    try {
      const res = await fetch(`${apiUrl}/service-queue/seller/${sellerId}/pay-commission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: owedToPlatform,
          paymentRef: `SETTLE-UPI-${Date.now().toString().slice(-6)}`,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to settle commission dues');
      }

      const result = await res.json();
      toast.success(result.message || 'Platform commission settled! Services resumed.');
      setIsSuspended(false);
      setIsServiceActive(true);
      setOwedToPlatform(0);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Failed to settle commission');
    } finally {
      setSettling(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('UPI ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  // Dynamic QR Fallback URL
  const dynamicQrUrl = upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        `upi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(shopName)}&cu=INR`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
              <QrCode className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-tight">
                Direct UPI &amp; QR Barcode Setup
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                100% direct customer payments to your account · Zero platform escrow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">

          {/* 1. Commission Status & Auto-Suspension Banner */}
          <div
            className={`rounded-2xl p-4.5 border transition-all ${
              isSuspended || owedToPlatform >= threshold
                ? 'bg-red-50 border-red-300 text-red-900 ring-2 ring-red-400/20'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSuspended || owedToPlatform >= threshold
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/30'
                      : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  }`}
                >
                  {isSuspended || owedToPlatform >= threshold ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider">
                      {isSuspended || owedToPlatform >= threshold
                        ? '🚨 Services Suspended'
                        : '✅ Services Live & Active'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white border border-current">
                      Commission Due: ₹{owedToPlatform.toLocaleString('en-IN')} / Limit: ₹{threshold.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-slate-600">
                    {isSuspended || owedToPlatform >= threshold
                      ? 'Unpaid platform commission has exceeded your threshold limit. Settle dues to resume booking slots instantly.'
                      : 'Customers pay 100% directly to your UPI/QR. Platform charges 5% + 18% GST billed when reaching threshold or monthly.'}
                  </p>
                </div>
              </div>

              {(isSuspended || owedToPlatform > 0) && (
                <button
                  type="button"
                  onClick={handleSettleAndResume}
                  disabled={settling}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  {settling ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                  <span>
                    {isSuspended
                      ? `Pay ₹${owedToPlatform} & Resume Services Now`
                      : `Settle Dues (₹${owedToPlatform})`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Direct UPI ID & Shop QR Barcode Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Left: Input Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seller UPI ID (VPA) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all shadow-2xs"
                  />
                  {upiId && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(upiId)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 p-1 rounded-lg"
                      title="Copy UPI ID"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Customer payments from GPay, PhonePe, Paytm, or BHIM go directly to this VPA.
                </p>
              </div>

              {/* Upload Physical QR Barcode / Standee Photo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Upload Shop Barcode / QR Standee Photo
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-50 hover:bg-emerald-50/20 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <Upload className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">
                      {upiQr ? 'Replace Barcode / QR Image' : 'Click to Upload Shop Standee QR'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PNG, JPG, WebP up to 2MB
                    </span>
                  </div>
                </div>
                {upiQr && (
                  <div className="flex items-center justify-between text-xs mt-1.5">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Custom Barcode Loaded
                    </span>
                    <button
                      type="button"
                      onClick={() => setUpiQr('')}
                      className="text-red-500 hover:underline font-semibold text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Commission Suspension Threshold */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Commission Billing Threshold (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all shadow-2xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Services auto-pause if unpaid commission touches ₹{threshold}. Settle anytime to resume immediately.
                </p>
              </div>
            </div>

            {/* Right: Live Dynamic Preview */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                Live Customer Scan Preview
              </span>

              <div className="w-48 h-48 bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-md flex items-center justify-center relative overflow-hidden group">
                {upiQr ? (
                  <img
                    src={upiQr}
                    alt="Seller QR Barcode"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : dynamicQrUrl ? (
                  <img
                    src={dynamicQrUrl}
                    alt="Dynamic UPI QR"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center p-3 text-slate-400">
                    <QrCode className="w-12 h-12 mx-auto mb-1 text-slate-300" />
                    <span className="text-xs font-semibold block">
                      Enter UPI ID or upload standee QR to see preview
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <span className="text-xs font-black text-slate-900 block truncate max-w-[200px]">
                  {shopName}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold block truncate max-w-[200px]">
                  {upiId || 'UPI ID not configured'}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Save Payment Settings</span>
          </button>
        </div>

      </div>
    </div>
  );
}

