"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Building2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShippingAddressesTab({ user }: { user: any }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_URL}/users/${user.id}/addresses`);
      if (res.ok) setAddresses(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      label: formData.get('label'),
      name: formData.get('name'),
      street: formData.get('street'),
      city: formData.get('city'),
      state: formData.get('state'),
      pinCode: formData.get('pinCode'),
      country: formData.get('country') || 'India',
      phone: formData.get('phone'),
      isDefault: formData.get('isDefault') === 'on',
    };

    try {
      const url = editingAddress 
        ? `${API_URL}/users/addresses/${editingAddress.id}`
        : `${API_URL}/users/${user.id}/addresses`;
      
      const method = editingAddress ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(editingAddress ? 'Address updated' : 'Address added');
        setShowModal(false);
        setEditingAddress(null);
        fetchAddresses();
      } else {
        toast.error('Failed to save address');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    try {
      const res = await fetch(`${API_URL}/users/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Address removed');
        fetchAddresses();
      }
    } catch (e) {
      toast.error('Failed to remove address');
    }
  };

  const handleSetDefault = async (address: any) => {
    try {
      const res = await fetch(`${API_URL}/users/addresses/${address.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        toast.success('Default address updated');
        fetchAddresses();
      }
    } catch (e) {
      toast.error('Failed to update address');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Shipping Addresses</h2>
          <p className="text-slate-400 text-sm">Manage where your orders get delivered.</p>
        </div>
        <button 
          onClick={() => { setEditingAddress(null); setShowModal(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div key={addr.id} className={`border rounded-2xl p-6 relative transition-colors group ${addr.isDefault ? 'bg-slate-950/50 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-slate-950/50 border-slate-800 hover:border-slate-600'}`}>
            {addr.isDefault && (
              <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl rounded-tr-2xl">Default</div>
            )}
            <div className={`flex items-center gap-3 mb-4 font-bold text-lg ${addr.isDefault ? 'text-white' : 'text-slate-300'}`}>
              <MapPin className={`w-5 h-5 ${addr.isDefault ? 'text-amber-500' : 'text-slate-500'}`} /> {addr.label}
            </div>
            <div className="text-slate-400 text-sm leading-relaxed mb-6">
              <span className="text-white font-semibold">{addr.name}</span><br/>
              {addr.street}<br/>
              {addr.city}, {addr.state} {addr.pinCode}<br/>
              {addr.country}<br/>
              {addr.phone}
            </div>
            <div className="flex gap-4 border-t border-slate-800 pt-4">
              <button onClick={() => { setEditingAddress(addr); setShowModal(true); }} className="text-sm font-semibold text-blue-400 hover:text-blue-300">Edit</button>
              <button onClick={() => handleDelete(addr.id)} className="text-sm font-semibold text-slate-500 hover:text-red-400">Remove</button>
              {!addr.isDefault && (
                <button onClick={() => handleSetDefault(addr)} className="text-sm font-semibold text-slate-500 hover:text-white ml-auto opacity-0 group-hover:opacity-100 transition-opacity">Set Default</button>
              )}
            </div>
          </div>
        ))}
        {addresses.length === 0 && (
          <div className="col-span-full text-center text-slate-500 py-10">
            No shipping addresses found. Add one to get started!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Label</label>
                  <input name="label" required defaultValue={editingAddress?.label || 'Home'} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Home, Office" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input name="name" required defaultValue={editingAddress?.name} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Street Address</label>
                <input name="street" required defaultValue={editingAddress?.street} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="123 Main St, Apt 4B" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">City</label>
                  <input name="city" required defaultValue={editingAddress?.city} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="New York" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">State</label>
                  <input name="state" required defaultValue={editingAddress?.state} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="NY" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">PIN Code</label>
                  <input name="pinCode" required defaultValue={editingAddress?.pinCode} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="10001" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                  <input name="phone" required defaultValue={editingAddress?.phone} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="+1 234 567 8900" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" name="isDefault" id="isDefault" defaultChecked={editingAddress?.isDefault} className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900" />
                <label htmlFor="isDefault" className="text-sm text-slate-300">Set as default shipping address</label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
