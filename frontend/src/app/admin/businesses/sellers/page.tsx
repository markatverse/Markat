"use client";

import React, { useState, useEffect } from 'react';
import { useAdminRole } from '@/context/AdminRoleContext';
import { 
  ShieldAlert, Search, Check, X, Store, Phone, Mail, Settings,
  ShieldCheck, ExternalLink, FileText, FileCheck, Eye, EyeOff, MapPin, 
  PhoneCall, AlertCircle, Building2, User, Clock
} from 'lucide-react';
import { maskAadhaar } from '@/utils/kycValidation';

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
  const [kycCallStatus, setKycCallStatus] = useState<string>('PENDING');
  const [kycNotes, setKycNotes] = useState<string>('');
  const [showAadhaar, setShowAadhaar] = useState<boolean>(false);
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
    setKycCallStatus(seller.kycCallStatus || 'PENDING');
    setKycNotes(seller.kycNotes || '');
    setShowAadhaar(false);
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
        body: JSON.stringify({ 
          status: 'Approved',
          kycCallStatus: 'VERIFIED',
          kycNotes: kycNotes || 'KYC verification call completed and approved by admin.'
        })
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

  const handleSaveKycOnly = async () => {
    if (!hasEditPermission || !selectedSeller) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/sellers/${selectedSeller.id}/kyc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycCallStatus, kycNotes })
      });
      if (res.ok) {
        fetchSellers();
        alert('KYC Call notes and status saved successfully!');
      } else {
        alert('Failed to save KYC notes');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating KYC notes');
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
                <th className="p-4 pl-6">Business & Owner</th>
                <th className="p-4">Contact & Phone</th>
                <th className="p-4">KYC Identifiers</th>
                <th className="p-4">KYC Call Status</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {displaySellers.map(seller => (
                <tr key={seller.id} className="hover:bg-slate-700/30 transition-all group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 font-bold">
                        <Store className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          {seller.businessName}
                          {seller.idProofUrl && (
                            <span title="ID Document Attached" className="text-xs">📄</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono flex items-center gap-1.5">
                          <span className="text-emerald-400">{seller.businessCode || 'N/A'}</span>
                          <span className="text-slate-600">|</span>
                          <span className="text-blue-400">{seller.user?.markatId || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-emerald-400"/> 
                      {seller.phone ? (
                        <a href={`tel:${seller.phone}`} className="hover:underline hover:text-white">
                          +91-{seller.phone}
                        </a>
                      ) : 'No phone'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 truncate max-w-[160px]">
                      <Mail className="w-3 h-3"/> {seller.email}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-mono text-slate-300">
                      {seller.gstNumber ? (
                        <span className="text-emerald-400 font-semibold" title="GSTIN">GST: {seller.gstNumber}</span>
                      ) : (
                        <span className="text-slate-400">PAN: {seller.panNumber || 'Exempt'}</span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {seller.aadharNumber ? `Aadhaar: ${maskAadhaar(seller.aadharNumber)}` : 'No Aadhaar'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      seller.kycCallStatus === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      seller.kycCallStatus === 'CALLED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      seller.kycCallStatus === 'FAILED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      <PhoneCall className="w-3 h-3" />
                      {seller.kycCallStatus === 'VERIFIED' ? 'Verified' : seller.kycCallStatus === 'CALLED' ? 'Called' : seller.kycCallStatus === 'FAILED' ? 'Failed' : 'Call Pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      seller.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      seller.status === 'Flagged' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      seller.status === 'Suspended' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                      seller.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {seller.status === 'Approved' ? '✓ Approved' : seller.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {seller.status !== 'Approved' && seller.status !== 'Rejected' && seller.status !== 'Suspended' ? (
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => rejectSeller(seller.id)} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Reject</button>
                        <button onClick={() => openReviewModal(seller)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          Verify & KYC
                        </button>
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
                  <td colSpan={6} className="p-12 text-center text-slate-500 flex flex-col items-center justify-center w-full">
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

      {/* Review & KYC Verification Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-700 shadow-[0_0_60px_rgba(0,0,0,0.6)] transform animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    Seller KYC & Onboarding Review
                  </h2>
                  <p className="text-xs text-slate-400">
                    Verify applicant identity, conduct phone KYC, review documents, and activate store.
                  </p>
                </div>
              </div>
              <button onClick={closeReviewModal} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
              
              {/* 1. Seller Profile & Direct Phone Call */}
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/50">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Store Profile</span>
                    <h3 className="text-lg font-black text-white">{selectedSeller.businessName}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Model: <span className="font-bold text-white">{selectedSeller.mainType || selectedSeller.businessType || 'B2C'}</span> • Sector: <span className="text-slate-300">{selectedSeller.sector || 'General'}</span>
                    </div>
                  </div>

                  {selectedSeller.phone && (
                    <a
                      href={`tel:${selectedSeller.phone}`}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 shrink-0 self-start sm:self-auto"
                    >
                      <PhoneCall className="w-4 h-4 animate-pulse" /> Call Seller (+91-{selectedSeller.phone})
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Owner / Contact</span>
                    <span className="font-semibold text-white">{selectedSeller.ownerName || selectedSeller.user?.name || selectedSeller.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Account / Business IDs</span>
                    <span className="font-mono text-emerald-400 font-semibold">{selectedSeller.businessCode || 'N/A'}</span>
                    <span className="text-slate-500 font-mono text-[10px] block">{selectedSeller.user?.markatId || ''}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Registered Email</span>
                    <span className="text-slate-300 truncate block">{selectedSeller.email}</span>
                  </div>
                </div>

                {selectedSeller.address && (
                  <div className="pt-2 border-t border-slate-700/50 flex items-start gap-2 text-xs text-slate-300">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      {selectedSeller.address} {selectedSeller.pincode ? `- ${selectedSeller.pincode}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Tax & KYC Submitted Identifiers */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> Submitted Tax & Aadhaar Identifiers
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">GST Number</span>
                    <span className="font-mono text-xs font-bold text-emerald-400 break-all">
                      {selectedSeller.gstNumber || 'GST Exempt'}
                    </span>
                  </div>

                  <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">PAN Number</span>
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {selectedSeller.panNumber || (selectedSeller.gstNumber?.length === 15 ? selectedSeller.gstNumber.substring(2, 12) : 'Not Provided')}
                    </span>
                  </div>

                  <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Aadhaar Number</span>
                      <button
                        type="button"
                        onClick={() => setShowAadhaar(!showAadhaar)}
                        className="text-slate-400 hover:text-white"
                      >
                        {showAadhaar ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {selectedSeller.aadharNumber 
                        ? (showAadhaar ? selectedSeller.aadharNumber : maskAadhaar(selectedSeller.aadharNumber))
                        : 'Not Provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Uploaded Document Proof Preview */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> Uploaded Document Proof ({selectedSeller.idProofType || 'Identity Proof'})
                </h3>

                {selectedSeller.idProofUrl ? (
                  <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                          {selectedSeller.idProofType || 'KYC Document'}
                        </span>
                        <span className="text-xs text-slate-300 font-medium truncate max-w-xs">
                          Proof Document Attached
                        </span>
                      </div>
                      <a
                        href={selectedSeller.idProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Document
                      </a>
                    </div>

                    {/* Image preview if URL is image */}
                    {(selectedSeller.idProofUrl.match(/\.(jpeg|jpg|png|webp)($|\?)/i) || selectedSeller.idProofUrl.startsWith('data:image')) && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 max-h-56 flex items-center justify-center p-2">
                        <img 
                          src={selectedSeller.idProofUrl} 
                          alt="KYC Document Proof" 
                          className="max-h-52 object-contain rounded"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    No uploaded document proof on record for this seller.
                  </div>
                )}
              </div>

              {/* 4. Admin KYC Phone Call Protocol & Notes */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Admin KYC Call Protocol & Notes
                  </h3>
                  <button
                    type="button"
                    onClick={handleSaveKycOnly}
                    disabled={isSubmitting}
                    className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-200 rounded-lg transition-colors"
                  >
                    Save Notes Only
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Call Status</label>
                    <select
                      value={kycCallStatus}
                      onChange={(e) => setKycCallStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="PENDING">⏳ Call Pending</option>
                      <option value="CALLED">📞 Called / In Progress</option>
                      <option value="VERIFIED">✅ KYC Call Verified</option>
                      <option value="FAILED">❌ Unreachable / Failed</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">KYC Call Notes</label>
                    <input
                      type="text"
                      value={kycNotes}
                      onChange={(e) => setKycNotes(e.target.value)}
                      placeholder="e.g. Called owner on phone, verified shop & PAN, approved for start."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Platform Fees Configuration */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
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

            {/* Modal Actions */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={closeReviewModal} 
                className="px-4 py-3 border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-slate-300 transition-colors"
              >
                Close
              </button>
              
              {selectedSeller.status !== 'Approved' && (
                <button
                  onClick={() => {
                    rejectSeller(selectedSeller.id);
                    closeReviewModal();
                  }}
                  className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-bold transition-colors"
                >
                  Reject Application
                </button>
              )}

              {selectedSeller.status !== 'Approved' ? (
                <button 
                  onClick={handleApproveAndSave}
                  disabled={isSubmitting}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {isSubmitting ? 'Verifying & Activating...' : 'Approve & Verify Seller (Start Journey) 🚀'}
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
