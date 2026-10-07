"use client";

import React, { useState, useEffect } from 'react';
import { useProducts, Product } from '@/context/ProductContext';
import { useAdminRole } from '@/context/AdminRoleContext';
import { ShieldAlert, Edit2, Trash2, Search, Filter } from 'lucide-react';

export default function MarketplaceServicesPage() {
  const { allProducts, deleteProduct, editProduct } = useProducts();
  const { canEdit } = useAdminRole();
  const hasEditPermission = canEdit('services');

  const [searchTerm, setSearchTerm] = useState('');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);

  // Filter products to only Services
  const services = allProducts.filter(p => p.category === 'Services' || p.primaryType === 'SERVICE');

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.seller.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (service: Product) => {
    if (!hasEditPermission) return;
    setEditingServiceId(service.id);
    setEditingPrice(service.price);
  };

  const handleSaveEdit = async (id: string) => {
    if (!hasEditPermission) return;
    await editProduct(id, { price: editingPrice });
    setEditingServiceId(null);
  };

  const handleDelete = async (id: string) => {
    if (!hasEditPermission) return;
    if (window.confirm("Are you sure you want to delete this service?")) {
      await deleteProduct(id);
    }
  };

  const handleToggleStatus = async (service: Product) => {
    if (!hasEditPermission) return;
    const newStatus = service.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    // Optimistic update
    setProducts(products.map(p => p.id === service.id ? { ...p, status: newStatus } : p));
    
    try {
      const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/products/${service.id}/admin-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
    } catch (e) {
      console.error(e);
      // Revert optimistic update on error
      setProducts(products.map(p => p.id === service.id ? { ...p, status: service.status } : p));
      alert('Error updating status');
    }
  };

  useEffect(() => {
    const handleAdd = () => {
      if (hasEditPermission) {
        // Assume handleStartAdd exists or implement simple alert
        alert('Add Service clicked');
      }
    };
    window.addEventListener('marketplace:add-service', handleAdd);
    return () => window.removeEventListener('marketplace:add-service', handleAdd);
  }, [hasEditPermission]);

  return (
    <div className="w-full relative">

      {!hasEditPermission && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-8">
          <ShieldAlert className="w-5 h-5" />
          <p className="text-sm font-medium">You do not have permission to edit services. Contact a Super Admin or Catalog Admin.</p>
        </div>
      )}

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex flex-wrap gap-4 justify-between items-center bg-slate-900/50">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search services or sellers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 w-full sm:w-80 text-sm transition-colors" 
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors text-slate-300">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 pl-6">Service Name</th>
                <th className="p-4">Provider / Seller</th>
                <th className="p-4">Price (₹)</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredServices.map(service => (
                <tr key={service.id} className="hover:bg-slate-700/30 transition-all group">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-white text-sm">{service.name}</div>
                    <div className="text-[10px] mt-1 font-mono flex items-center">
                      <span className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/50">SRV-{service.id.slice(0, 5).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-300">{service.seller}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{service.location}</div>
                  </td>
                  <td className="p-4 font-bold text-emerald-400">
                    {editingServiceId === service.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">₹</span>
                        <input
                          type="number"
                          value={editingPrice}
                          onChange={(e) => setEditingPrice(Number(e.target.value))}
                          className="w-24 bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-white text-sm focus:outline-none"
                        />
                      </div>
                    ) : (
                      `₹${service.price.toLocaleString()}`
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      service.status === 'SUSPENDED' 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {service.status === 'SUSPENDED' ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {hasEditPermission && (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingServiceId === service.id ? (
                          <button 
                            onClick={() => handleSaveEdit(service.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            Save
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleToggleStatus(service)}
                              className={`p-1.5 rounded-lg transition-colors ${service.status === 'SUSPENDED' ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-amber-400 hover:bg-amber-500/10'}`}
                              title={service.status === 'SUSPENDED' ? 'Activate Service' : 'Suspend Service'}
                            >
                              <span className="text-[10px] font-black uppercase">{service.status === 'SUSPENDED' ? 'Enable' : 'Disable'}</span>
                            </button>
                            <button 
                              onClick={() => handleEditClick(service)}
                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No services found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
