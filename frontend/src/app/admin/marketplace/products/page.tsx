"use client";

import React, { useState, useEffect } from 'react';
import { useProducts, Product } from '@/context/ProductContext';
import { useAdminRole } from '@/context/AdminRoleContext';
import { ShieldAlert, Search, Trash2, Edit2, Box, Check } from 'lucide-react';

export default function AdminProductsPage() {
  const { allProducts, deleteProduct, editProduct, addProduct, categories } = useProducts();
  const { canEdit } = useAdminRole();
  const hasEditPermission = canEdit('products');

  const products = allProducts.filter(p => p.primaryType === 'PRODUCT');

  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Product>>({});

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartAdd = () => {
    if (!hasEditPermission) return;
    setDraft({ 
      name: '', 
      description: '', 
      price: 0, 
      category: categories[0]?.name || categories[0]?.id || '', 
      primaryType: 'PRODUCT',
      seller: 'MarkatVerse Store',
      sellerId: 'current-user-seller' // Just a placeholder for admin addition
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleStartEdit = (product: Product) => {
    if (!hasEditPermission) return;
    setDraft({ ...product });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!hasEditPermission) return;
    if (!draft.name || !draft.category) return alert("Name and Category are required");

    if (isEditing && draft.id) {
      await editProduct(draft.id, draft);
    } else {
      await addProduct({ ...draft, id: Date.now().toString(), status: 'ACTIVE' } as Product);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!hasEditPermission) return;
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    if (!hasEditPermission) return;
    const newStatus = product.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await editProduct(product.id, { status: newStatus } as any);
      const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/products/${product.id}/admin-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
    } catch (e) {
      console.error(e);
      alert('Error updating status');
    }
  };

  useEffect(() => {
    const handleAdd = () => {
      if (hasEditPermission) {
        handleStartAdd();
      }
    };
    window.addEventListener('marketplace:add-product', handleAdd);
    return () => window.removeEventListener('marketplace:add-product', handleAdd);
  }, [hasEditPermission]);

  return (
    <div className="w-full relative">

      {!hasEditPermission && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-8">
          <ShieldAlert className="w-5 h-5" />
          <p className="text-sm font-medium">You do not have permission to edit or moderate products. Contact a Catalog Admin.</p>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && hasEditPermission && (
        <div className="bg-slate-800 p-6 rounded-2xl border border-indigo-500/50 shadow-lg mb-8">
          <h3 className="text-lg font-bold text-white mb-4">{isEditing ? 'Edit Product' : 'Create New Product'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Name</label>
              <input 
                type="text" 
                value={draft.name || ''}
                onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Description</label>
              <textarea 
                value={draft.description || ''}
                onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 h-24 resize-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Category</label>
              <select 
                value={draft.category || ''}
                onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select a Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Price (₹)</label>
              <input 
                type="number" 
                value={draft.price || 0}
                onChange={e => setDraft(d => ({ ...d, price: Number(e.target.value) }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsModalOpen(false)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleSaveModal} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Check className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 w-full text-sm transition-colors" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 pl-6">Product</th>
                <th className="p-4">Seller ID</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-700/30 transition-all group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 text-purple-400">
                        <Box className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{product.name}</div>
                        <div className="text-[10px] mt-1 font-mono flex items-center">
                          <span className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/50">PRD-{product.id.slice(0, 5).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-[10px] font-mono flex items-center">
                      <span className="text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                        {product.seller || (product.sellerId ? `USR-${product.sellerId.slice(0, 5).toUpperCase()}` : 'MARKAT')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-indigo-300">
                    ₹{product.price}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      product.status === 'ACTIVE' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {product.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {hasEditPermission && (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleStatus(product)}
                          className={`p-1.5 rounded-lg transition-colors ${product.status === 'SUSPENDED' ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-amber-400 hover:bg-amber-500/10'}`}
                          title={product.status === 'SUSPENDED' ? 'Activate Product' : 'Suspend Product'}
                        >
                          <span className="text-[10px] font-black uppercase">{product.status === 'SUSPENDED' ? 'Enable' : 'Disable'}</span>
                        </button>
                        <button 
                          onClick={() => handleStartEdit(product)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No products found.
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
