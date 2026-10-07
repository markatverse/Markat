"use client";

import React, { useState, useEffect } from 'react';
import { useAdminRole } from '@/context/AdminRoleContext';
import { ShieldAlert, Search, Check, X, Store, Phone, Mail, Settings } from 'lucide-react';

export default function AdminSellersPage() {
  const { canEdit } = useAdminRole();
  const hasEditPermission = canEdit('sellers');

  const [allSellers, setAllSellers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'FLAGGED' | 'SUSPENDED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [modelType, setModelType] = useState('commission');
  const [rate, setRate] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

  useEffect(() => {
    fetchSellers();
  }, [API_URL]);

  const fetchSellers = () => {
    setLoading(true);
    fetch(`${API_URL}/sellers`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllSellers(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const openReviewModal = (seller: any) => {
    setSelectedSeller(seller);
    const mType = seller.commissionType === 'FIXED' ? 'subscription' : 'commission';
    setModelType(mType);
    setRate(seller.commissionRate ?? (mType === 'commission' ? 10 : 1000));
  };

  const closeReviewModal = () => {
    setSelectedSeller(null);
    setIsSubmitting(false);
  };

  const handleApproveAndSave = async () => {
    if (!hasEditPermission || !selectedSeller) return;
    setIsSubmitting(true);
    try {
      const resStatus = await fetch(`${API_URL}/sellers/${selectedSeller.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      });
      
      const resBilling = await fetch(`${API_URL}/admin/businesses/${selectedSeller.id}/billing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          commissionType: modelType === 'commission' ? 'PERCENTAGE' : 'FIXED',
          commissionRate: rate,
          subscriptionStatus: selectedSeller.subscriptionStatus || 'ACTIVE',
          subscriptionStartDate: selectedSeller.subscriptionStartDate || null,
          subscriptionEndDate: selectedSeller.subscriptionEndDate || null
        })
      });
      
      if (resStatus.ok && resBilling.ok) {
        fetchSellers();
        closeReviewModal();
      } else {
        alert('Failed to approve seller or save settings');
      }
    } catch (e) {
      console.error(e);
      alert('Error approving seller');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!hasEditPermission || !selectedSeller) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/businesses/${selectedSeller.id}/billing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          commissionType: modelType === 'commission' ? 'PERCENTAGE' : 'FIXED',
          commissionRate: rate,
          subscriptionStatus: selectedSeller.subscriptionStatus || 'ACTIVE',
          subscriptionStartDate: selectedSeller.subscriptionStartDate || null,
          subscriptionEndDate: selectedSeller.subscriptionEndDate || null
        })
      });
      
      if (res.ok) {
        fetchSellers();
        closeReviewModal();
      } else {
        alert('Failed to update settings');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectSeller = async (id: string) => {
    if (!hasEditPermission) return;
    if (!confirm('Are you sure you want to reject this application?')) return;
    try {
      const res = await fetch(`${API_URL}/sellers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' })
      });
      if (res.ok) {
        fetchSellers();
      }
    } catch (e) {
      console.error(e);
      alert('Error rejecting seller');
    }
  };

  const filterSellers = (sellers: any[]) => {
    return sellers.filter(s => 
      s.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const pendingSellers = allSellers.filter(s => s.status !== 'Approved' && s.status !== 'Rejected' && s.status !== 'Suspended' && s.status !== 'Flagged');
  const flaggedSellers = allSellers.filter(s => s.status === 'Flagged');
  const suspendedSellers = allSellers.filter(s => s.status === 'Suspended');
  
  let baseSellers = allSellers;
  if (activeTab === 'PENDING') baseSellers = pendingSellers;
  else if (activeTab === 'FLAGGED') baseSellers = flaggedSellers;
  else if (activeTab === 'SUSPENDED') baseSellers = suspendedSellers;

  const displaySellers = filterSellers(baseSellers);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full pb-20">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Seller Onboarding & Approvals</h1>
          <p className="text-slate-400 mt-2 text-sm">Review incoming applications, verify details, and configure business models.</p>
        </div>
      </header>

      {!hasEditPermission && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-8">
          <ShieldAlert className="w-5 h-5" />
          <p className="text-sm font-medium">You do not have permission to approve or configure sellers. Contact an Onboarding Admin.</p>
        </div>
      )}

      <div className="mb-6 relative w-full sm:w-96">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search by business name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 w-full text-sm transition-colors" 
        />
      </div>

      <div className="flex overflow-x-auto border-b border-slate-700/50 mb-8 gap-8">
        <button onClick={() => setActiveTab('ALL')} className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'ALL' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          All Sellers
        </button>
        <button onClick={() => setActiveTab('PENDING')} className={`pb-4 text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'PENDING' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          Pending Verification
          <span className="bg-amber-500/20 text-amber-400 text-[10px] py-0.5 px-2 rounded-full border border-amber-500/30">{pendingSellers.length}</span>
        </button>
        <button onClick={() => setActiveTab('FLAGGED')} className={`pb-4 text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'FLAGGED' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          Flagged Sellers
          {flaggedSellers.length > 0 && <span className="bg-rose-500/20 text-rose-400 text-[10px] py-0.5 px-2 rounded-full border border-rose-500/30">{flaggedSellers.length}</span>}
        </button>
        <button onClick={() => setActiveTab('SUSPENDED')} className={`pb-4 text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'SUSPENDED' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          Suspended
          {suspendedSellers.length > 0 && <span className="bg-slate-500/20 text-slate-400 text-[10px] py-0.5 px-2 rounded-full border border-slate-500/30">{suspendedSellers.length}</span>}
        </button>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 pl-6">Business</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Model & Rate</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {displaySellers.map(seller => (
                <tr key={seller.id} className="hover:bg-slate-700/30 transition-all group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{seller.businessName}</div>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono flex items-center gap-1.5">
                          <span className="text-emerald-400">{seller.businessCode || 'N/A'}</span>
                          <span className="text-slate-600">|</span>
                          <span className="text-blue-400">{seller.user?.markatId || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-300 flex items-center gap-2"><Mail className="w-3 h-3"/> {seller.email}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2"><Phone className="w-3 h-3"/> {seller.phone || 'No phone'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-emerald-400 font-bold capitalize">{seller.commissionType === 'FIXED' ? 'Subscription' : 'Commission'}</div>
                    <div className="text-xs text-slate-400">{seller.commissionRate !== undefined ? `${seller.commissionType === 'PERCENTAGE' ? seller.commissionRate + '%' : '₹' + seller.commissionRate}` : 'N/A'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      seller.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      seller.status === 'Flagged' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      seller.status === 'Suspended' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                      seller.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {seller.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {seller.status !== 'Approved' && seller.status !== 'Rejected' && seller.status !== 'Suspended' ? (
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => rejectSeller(seller.id)} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Reject</button>
                        <button onClick={() => openReviewModal(seller)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]">Review</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => openReviewModal(seller)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                      >
                        Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && displaySellers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 flex flex-col items-center justify-center w-full">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                      <Check className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-lg font-bold text-slate-400">No sellers found</p>
                    <p className="text-sm mt-1">There are no sellers in this category.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Setup Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-xl border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <Settings className="w-5 h-5 text-emerald-400" />
                {selectedSeller.status === 'Approved' ? 'Configure Seller' : 'Review & Setup Approval'}
              </h2>
              <button onClick={closeReviewModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              
              {/* Seller Information */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Seller Details (Verify via Call)</h3>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Business Name</div>
                      <div className="text-sm font-bold text-white">{selectedSeller.businessName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Business & User IDs</div>
                      <div className="text-sm font-bold text-slate-300 font-mono flex gap-2">
                        <span className="text-emerald-400">{selectedSeller.businessCode || 'N/A'}</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-blue-400">{selectedSeller.user?.markatId || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Contact Person / Email</div>
                      <div className="text-sm font-bold text-white">{selectedSeller.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Phone Number</div>
                      <div className="text-sm font-bold text-white">{selectedSeller.phone || 'Not provided'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Model Configuration */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Platform Fees Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${modelType === 'commission' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}>
                    <input type="radio" name="modelType" value="commission" checked={modelType === 'commission'} onChange={(e) => { setModelType('commission'); if(!selectedSeller.rate) setRate(10); }} className="sr-only" />
                    <div className={`font-bold ${modelType === 'commission' ? 'text-emerald-400' : 'text-slate-300'}`}>Commission-based</div>
                    <div className="text-xs text-slate-500 mt-1">Take a percentage of each transaction.</div>
                  </label>
                  
                  <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${modelType === 'subscription' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}>
                    <input type="radio" name="modelType" value="subscription" checked={modelType === 'subscription'} onChange={(e) => { setModelType('subscription'); if(!selectedSeller.rate) setRate(1000); }} className="sr-only" />
                    <div className={`font-bold ${modelType === 'subscription' ? 'text-emerald-400' : 'text-slate-300'}`}>Subscription-based</div>
                    <div className="text-xs text-slate-500 mt-1">Charge a fixed monthly/flat fee.</div>
                  </label>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    {modelType === 'commission' ? 'Commission Percentage (%)' : 'Fixed Subscription Fee (Rs)'}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      value={rate}
                      onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-black text-lg focus:outline-none focus:border-emerald-500 pl-12"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500">
                      {modelType === 'commission' ? '%' : '₹'}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {modelType === 'commission' 
                      ? `The platform will automatically deduct ${rate}% from the seller's sales.` 
                      : `The seller will be billed ₹${rate} as a fixed subscription/fee.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-4">
              <button 
                onClick={closeReviewModal} 
                className="flex-1 px-4 py-3 border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              
              {selectedSeller.status !== 'Approved' ? (
                <button 
                  onClick={handleApproveAndSave}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {isSubmitting ? 'Approving...' : 'Approve & Save Settings'}
                </button>
              ) : (
                <button 
                  onClick={handleUpdateSettings}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Settings className="w-5 h-5" />
                  {isSubmitting ? 'Updating...' : 'Update Settings'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
