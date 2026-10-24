"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAdminRole } from '@/context/AdminRoleContext';
import { 
  ShieldAlert, Search, Trash2, Edit2, Check, X, User, Plus,
  Store, Phone, Mail, Building2, MapPin, ShieldCheck, Eye, EyeOff,
  ExternalLink, PhoneCall, AlertCircle, FileCheck, ShoppingBag, Calendar
} from 'lucide-react';
import { maskAadhaar } from '@/utils/kycValidation';

export default function UserTable({ title, subtitle, allowedRoles }: { title: string, subtitle: string, allowedRoles?: string[] }) {
  const { allUsers, deleteUser, updateUserRole, addUser } = useAuth();
  const { canEdit } = useAdminRole();
  const hasEditPermission = canEdit('users');

  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'super_admin' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User / Seller / Customer Details Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showAadhaar, setShowAadhaar] = useState<boolean>(false);
  const [adminKycNotes, setAdminKycNotes] = useState<string>('');
  const [isUpdatingKyc, setIsUpdatingKyc] = useState<boolean>(false);

  const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

  const handleUpdateKycCall = async (status: string) => {
    if (!selectedUser?.business?.id) return;
    setIsUpdatingKyc(true);
    try {
      const res = await fetch(`${API_URL}/sellers/${selectedUser.business.id}/kyc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycCallStatus: status, kycNotes: adminKycNotes })
      });
      if (res.ok) {
        setSelectedUser((prev: any) => ({
          ...prev,
          business: { ...prev.business, kycCallStatus: status, kycNotes: adminKycNotes }
        }));
        if (selectedUser.business) {
          selectedUser.business.kycCallStatus = status;
          selectedUser.business.kycNotes = adminKycNotes;
        }
      }
    } catch (err) {
      console.error('Failed to update KYC call status', err);
    } finally {
      setIsUpdatingKyc(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedUser?.business?.id) return;
    setIsUpdatingKyc(true);
    try {
      const res = await fetch(`${API_URL}/sellers/${selectedUser.business.id}/kyc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycNotes: adminKycNotes })
      });
      if (res.ok) {
        setSelectedUser((prev: any) => ({
          ...prev,
          business: { ...prev.business, kycNotes: adminKycNotes }
        }));
        if (selectedUser.business) {
          selectedUser.business.kycNotes = adminKycNotes;
        }
      }
    } catch (err) {
      console.error('Failed to save KYC notes', err);
    } finally {
      setIsUpdatingKyc(false);
    }
  };

  const handleApproveSeller = async () => {
    if (!selectedUser?.business?.id) return;
    setIsUpdatingKyc(true);
    try {
      const notes = adminKycNotes || 'KYC call verification completed and approved by admin.';
      const res = await fetch(`${API_URL}/sellers/${selectedUser.business.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Approved',
          kycCallStatus: 'VERIFIED',
          kycNotes: notes
        })
      });
      if (res.ok) {
        setSelectedUser((prev: any) => ({
          ...prev,
          business: {
            ...prev.business,
            verified: true,
            verificationStatus: 'APPROVED',
            kycCallStatus: 'VERIFIED',
            kycNotes: notes
          }
        }));
        if (selectedUser.business) {
          selectedUser.business.verified = true;
          selectedUser.business.verificationStatus = 'APPROVED';
          selectedUser.business.kycCallStatus = 'VERIFIED';
          selectedUser.business.kycNotes = notes;
        }
      }
    } catch (err) {
      console.error('Failed to approve seller', err);
    } finally {
      setIsUpdatingKyc(false);
    }
  };

  const filteredUsers = allUsers
    .filter(u => allowedRoles ? allowedRoles.some(r => r.toLowerCase() === u.role?.toLowerCase()) : true)
    .filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm)
    );

  const handleEditClick = (user: any) => {
    if (!hasEditPermission) return;
    setEditingUserId(user.id);
    setEditingRole(user.role);
  };

  const handleSaveEdit = (id: string) => {
    if (!hasEditPermission) return;
    updateUserRole(id, editingRole as any);
    setEditingUserId(null);
  };

  const handleDelete = (id: string) => {
    if (!hasEditPermission) return;
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(id);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEditPermission) return;
    setIsSubmitting(true);
    try {
      const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(newStaff)
      });
      if (!res.ok) throw new Error('Failed to create staff');
      
      const data = await res.json();
      if (data && data.user) addUser(data.user);
      setShowAddModal(false);
      setNewStaff({ name: '', email: '', password: '', role: 'super_admin' });
    } catch (err) {
      console.error(err);
      alert('Error creating staff account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Add New Staff</h2>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Name</label>
                <input required type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Email</label>
                <input required type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Temporary Password</label>
                <input required type="password" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Role</label>
                <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500">
                  <option value="super_admin">Super Admin</option>
                  <option value="catalog_admin">Catalog Admin</option>
                  <option value="onboarding_admin">Onboarding Admin</option>
                  <option value="support_admin">Support Admin</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-semibold transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-bold transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!hasEditPermission && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-8">
          <ShieldAlert className="w-5 h-5" />
          <p className="text-sm font-medium">You do not have permission to edit users. Contact a Super Admin or Support Admin.</p>
        </div>
      )}

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center flex-wrap gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 w-full text-sm transition-colors" 
            />
          </div>
          
          {hasEditPermission && title.includes('Staff') && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" /> Add Staff
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 pl-6">User</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                {title.includes('Seller') && <th className="p-4">Revenue Model</th>}
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 font-bold shrink-0">
                        {user.business ? <Store className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          {user.business?.name ? user.business.name : user.name}
                          {user.business?.idProofUrl && (
                            <span title="ID Document Attached" className="text-xs">📄</span>
                          )}
                        </div>
                        {user.business?.name && (
                          <div className="text-xs text-slate-400 font-medium">
                            Owner: {user.name}
                          </div>
                        )}
                        <div className="text-[10px] mt-0.5 font-mono flex items-center gap-1.5">
                          {user.markatId ? (
                            <span className="text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">{user.markatId}</span>
                          ) : (
                            <span className="text-slate-500">ID: {user.id?.slice(0,8)}...</span>
                          )}
                          {user.business?.businessCode && (
                            <span className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                              {user.business.businessCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-300">{user.email || 'No email provided'}</div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {user.phone && !user.phone.startsWith('missing-phone') ? (
                        <a href={`tel:${user.phone}`} className="hover:underline hover:text-white">
                          +91-{user.phone}
                        </a>
                      ) : 'No phone provided'}
                    </div>
                  </td>
                  <td className="p-4">
                    {editingUserId === user.id ? (
                      <select 
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="bg-slate-900 text-indigo-400 text-xs font-bold rounded-lg px-2 py-1 border border-indigo-500 focus:outline-none"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="catalog_admin">Catalog Admin</option>
                        <option value="onboarding_admin">Onboarding Admin</option>
                        <option value="support_admin">Support Admin</option>
                        <option value="user">Regular User</option>
                      </select>
                    ) : (
                      <div className="flex flex-col items-start gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          user.role?.includes('admin') 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {user.role?.replace('_', ' ')}
                        </span>
                        {user.business?.verificationStatus && (
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            user.business.verificationStatus === 'APPROVED' || user.business.verified
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {user.business.verificationStatus === 'APPROVED' || user.business.verified ? '✓ Verified' : '⏳ Pending KYC'}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  {title.includes('Seller') && (
                    <td className="p-4">
                      {user.business ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-max border border-emerald-500/20">
                            {user.business.commissionType === 'PERCENTAGE' 
                              ? `${user.business.commissionRate}% Commission` 
                              : `₹${user.business.commissionRate} Flat Fee`}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                            Sub: {user.business.subscriptionStatus === 'ACTIVE' ? <span className="text-emerald-400 font-bold">Active</span> : 'Inactive'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">No Business Profile</span>
                      )}
                    </td>
                  )}
                  <td className="p-4 pr-6 text-right">
                    {(() => {
                      const isRegularUser = ['seller', 'business', 'consumer', 'buyer', 'user'].includes(user.role?.toLowerCase() || '');
                      const isSeller = ['seller', 'business'].includes(user.role?.toLowerCase() || '') || !!user.business;
                      const canEditThisUser = hasEditPermission && !isRegularUser;
                      
                      return (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowAadhaar(false);
                              setAdminKycNotes(user.business?.kycNotes || '');
                            }}
                            title={isSeller ? "Show Seller Details" : "Show Customer Details"}
                            className="p-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500 rounded-lg transition-all flex items-center justify-center shadow-sm cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {isRegularUser ? (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                            </span>
                          ) : (
                            canEditThisUser && (
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {editingUserId === user.id ? (
                                  <>
                                    <button onClick={() => setEditingUserId(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
                                      <X className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleSaveEdit(user.id)} className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors">
                                      <Check className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    onClick={() => handleEditClick(user)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDelete(user.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={title.includes('Seller') ? 5 : 4} className="p-8 text-center text-slate-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User / Seller / Customer Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-black text-xl shadow-inner">
                  {selectedUser.business ? <Store className="w-6 h-6 text-indigo-400" /> : <User className="w-6 h-6 text-indigo-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-white">
                      {selectedUser.business?.name || selectedUser.name}
                    </h2>
                    {selectedUser.business ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        selectedUser.business?.verified || selectedUser.business?.verificationStatus === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {selectedUser.business?.verified || selectedUser.business?.verificationStatus === 'APPROVED' ? '✓ Verified Seller' : '⏳ KYC Pending'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        ✓ Active Customer
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedUser.business 
                      ? 'Complete Seller Dossier, KYC Identifiers & Contact Details' 
                      : 'Registered Customer Profile, Contact Info & Order Activity'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs">
              
              {/* Quick Contact & Action Bar */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {selectedUser.business ? 'Authorized Owner' : 'Customer Name'}
                  </span>
                  <span className="font-bold text-white text-sm">{selectedUser.name}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedUser.phone && !selectedUser.phone.startsWith('missing-phone') && (
                    <a
                      href={`tel:${selectedUser.phone}`}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Call: +91-{selectedUser.phone}
                    </a>
                  )}
                  {selectedUser.email && (
                    <a
                      href={`mailto:${selectedUser.email}`}
                      className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>
                  )}
                </div>
              </div>

              {/* Account & Identification Numbers */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Account Identifiers
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Markat ID</span>
                    <span className="font-mono font-bold text-blue-400 text-xs">{selectedUser.markatId || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {selectedUser.business ? 'Business Code' : 'User ID'}
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      {selectedUser.business?.businessCode || (selectedUser.id ? `${selectedUser.id.slice(0, 10)}...` : 'N/A')}
                    </span>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">User Role</span>
                    <span className="font-bold text-amber-400 uppercase text-xs">{selectedUser.role}</span>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                    <span className="font-bold text-emerald-400 uppercase text-xs">Active</span>
                  </div>
                </div>
              </div>

              {/* If Seller: Show Store & Operational Details + KYC Dossier */}
              {selectedUser.business ? (
                <>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Store & Operational Details
                    </h4>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Business Model</span>
                          <span className="font-bold text-white text-xs">{selectedUser.business.mainType || selectedUser.business.businessType || 'Retail (B2C)'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Sector</span>
                          <span className="font-bold text-white text-xs">{selectedUser.business.sector || 'General'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Commission Model</span>
                          <span className="font-bold text-emerald-400 text-xs">
                            {selectedUser.business.commissionType === 'PERCENTAGE' 
                              ? `${selectedUser.business.commissionRate}% Commission` 
                              : `₹${selectedUser.business.commissionRate} Fixed Fee`}
                          </span>
                        </div>
                      </div>

                      {selectedUser.business.address && (
                        <div className="pt-2 border-t border-slate-700/50 flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Store Address</span>
                            <span className="text-slate-200">
                              {selectedUser.business.address} {selectedUser.business.pincode ? ` - ${selectedUser.business.pincode}` : ''}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

              {/* Tax & KYC Dossier */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Tax & KYC Verification Dossier
                </h4>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">GST Number</span>
                      <span className="font-mono text-xs font-bold text-emerald-400 break-all">
                        {selectedUser.business?.gstNumber || 'GST Exempt'}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">PAN Number</span>
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {selectedUser.business?.panNumber || (selectedUser.business?.gstNumber?.length === 15 ? selectedUser.business.gstNumber.substring(2, 12) : 'Not Provided')}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Aadhaar Number</span>
                        <button
                          type="button"
                          onClick={() => setShowAadhaar(!showAadhaar)}
                          className="text-slate-400 hover:text-white"
                        >
                          {showAadhaar ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {selectedUser.business?.aadharNumber
                          ? (showAadhaar ? selectedUser.business.aadharNumber : maskAadhaar(selectedUser.business.aadharNumber))
                          : 'Not Provided'}
                      </span>
                    </div>
                  </div>

                  {/* KYC Call & Verification Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">KYC Phone Call Status</span>
                      <span className={`inline-block mt-1 font-bold text-xs ${
                        selectedUser.business?.kycCallStatus === 'VERIFIED' ? 'text-emerald-400' :
                        selectedUser.business?.kycCallStatus === 'CALLED' ? 'text-blue-400' :
                        selectedUser.business?.kycCallStatus === 'FAILED' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {selectedUser.business?.kycCallStatus === 'VERIFIED' ? '✅ Call Verified' :
                         selectedUser.business?.kycCallStatus === 'CALLED' ? '📞 Called / Follow-up' :
                         selectedUser.business?.kycCallStatus === 'FAILED' ? '❌ Verification Failed' : '⏳ Call Pending'}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Store Approval Status</span>
                      <span className={`inline-block mt-1 font-bold text-xs ${
                        selectedUser.business?.verified || selectedUser.business?.verificationStatus === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {selectedUser.business?.verified || selectedUser.business?.verificationStatus === 'APPROVED' ? '✓ Approved & Ready' : '⏳ Pending Approval'}
                      </span>
                    </div>
                  </div>

                  {/* KYC Notes */}
                  {selectedUser.business?.kycNotes && (
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Admin KYC Notes</span>
                      <p className="text-slate-300 italic text-xs leading-relaxed">{selectedUser.business.kycNotes}</p>
                    </div>
                  )}

                  {/* Document Proof Attachment */}
                  {selectedUser.business?.idProofUrl ? (
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold text-white text-xs block">
                            {selectedUser.business.idProofType || 'KYC'} Proof Document Attached
                          </span>
                          <span className="text-[10px] text-slate-400">Verified identity / business proof</span>
                        </div>
                      </div>
                      <a
                        href={selectedUser.business.idProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Proof
                      </a>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg text-[11px] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      No physical proof document attached on file.
                    </div>
                  )}

                  {/* Interactive Admin KYC Actions & Approval Panel */}
                  <div className="pt-3 border-t border-slate-700/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                          <PhoneCall className="w-3.5 h-3.5 text-indigo-400" /> Admin KYC Actions & Store Approval
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          selectedUser.business?.verified || selectedUser.business?.verificationStatus === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {selectedUser.business?.verified || selectedUser.business?.verificationStatus === 'APPROVED' ? '✓ Approved' : 'Action Required'}
                        </span>
                      </div>

                      {/* Call Status Selector */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Update Call Status</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {(['PENDING', 'CALLED', 'VERIFIED', 'FAILED'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleUpdateKycCall(st)}
                              disabled={isUpdatingKyc}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                                (selectedUser.business?.kycCallStatus || 'PENDING') === st
                                  ? st === 'VERIFIED'
                                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                                    : st === 'CALLED'
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                                    : st === 'FAILED'
                                    ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                                    : 'bg-amber-600 text-white border-amber-500 shadow-sm'
                                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
                              }`}
                            >
                              {st === 'VERIFIED' ? '✅ Verified' :
                               st === 'CALLED' ? '📞 Called' :
                               st === 'FAILED' ? '❌ Failed' : '⏳ Pending'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Admin Notes Input */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">KYC Notes & Verification Remarks</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={adminKycNotes}
                            onChange={(e) => setAdminKycNotes(e.target.value)}
                            placeholder="Add verification notes (e.g. Phone call completed, IDs verified)..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={handleSaveNotes}
                            disabled={isUpdatingKyc}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 shrink-0 cursor-pointer"
                          >
                            Save Notes
                          </button>
                        </div>
                      </div>

                      {/* Direct Approval Button */}
                      {selectedUser.business?.verificationStatus !== 'APPROVED' && !selectedUser.business?.verified ? (
                        <button
                          type="button"
                          onClick={handleApproveSeller}
                          disabled={isUpdatingKyc}
                          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Approve Seller & Ready for Start Journey
                        </button>
                      ) : (
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4" /> Seller is Approved & Ready for Selling
                        </div>
                      )}
                    </div>
                </div>
              </div>
            </>
          ) : (
            /* Customer Information Section */
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Customer Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Full Legal Name</span>
                    <span className="font-bold text-white text-sm">{selectedUser.name}</span>
                  </div>
                  <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Primary Mobile</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {selectedUser.phone && !selectedUser.phone.startsWith('missing-phone') 
                        ? `+91-${selectedUser.phone}` 
                        : 'Not Provided'}
                    </span>
                  </div>
                  <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Email Address</span>
                    <span className="font-mono text-white text-xs">{selectedUser.email || 'No email on record'}</span>
                  </div>
                  <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Registration Date</span>
                    <span className="text-white text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {selectedUser.createdAt 
                        ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Registered Customer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Orders & Transactions Activity */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Customer Orders & Transactions</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      View purchase orders, service bookings, and invoices for this customer.
                    </p>
                  </div>
                </div>
                <Link
                  href={`/admin/transactions/orders?search=${encodeURIComponent(selectedUser.phone || selectedUser.email || selectedUser.name)}`}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-indigo-600/30"
                >
                  View Orders →
                </Link>
              </div>
            </div>
          )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/70 flex items-center justify-between">
              {selectedUser.business ? (
                <Link
                  href="/admin/businesses/sellers"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
                >
                  Open in Onboarding Approvals →
                </Link>
              ) : (
                <Link
                  href="/admin/transactions/orders"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
                >
                  Browse Customer Orders →
                </Link>
              )}
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
