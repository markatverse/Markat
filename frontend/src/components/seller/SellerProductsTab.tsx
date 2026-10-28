"use client";
import React from 'react';
import Link from 'next/link';
import { Package, PlusCircle, Edit2, Trash2 } from 'lucide-react';

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description?: string;
  category?: string;
  location?: string;
  image?: string;
  images?: string[];
  isB2B?: boolean;
  wholesaleTiers?: any;
  parameters?: Record<string, any>;
  primaryType?: string;
  sellerName?: string;
  seller?: string;
}

interface SellerProductsTabProps {
  products: ProductItem[];
  user: any;
  activeVertical: string;
  isServiceProvider: boolean;
  isB2C: boolean;
  isB2B: boolean;
  isCartFlow: boolean;
  isRfqFlow: boolean;
  isService: boolean;
  isQueueFlow: boolean;
  isMeetingFlow: boolean;
  isProjectFlow: boolean;
  onAddNew: () => void;
  onEdit: (product: ProductItem) => void;
  onDelete: (productId: string) => void;
}

export default function SellerProductsTab({
  products,
  user,
  activeVertical,
  isServiceProvider,
  isB2C,
  isB2B,
  isCartFlow,
  isRfqFlow,
  isService,
  isQueueFlow,
  isMeetingFlow,
  isProjectFlow,
  onAddNew,
  onEdit,
  onDelete,
}: SellerProductsTabProps) {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            My Product Inventory
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your physical retail and wholesale products, stock, pricing, and catalog.
          </p>
        </div>

        <button 
          onClick={onAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" /> Add New Product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col group">
            <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <img src="/hero-left-logo.png" alt={product.name} className="w-full h-full object-contain opacity-50 p-4 group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                {product.category || 'Retail'}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="font-bold text-base text-slate-900 mb-2 line-clamp-2 leading-snug">{product.name}</div>
              <div className="flex justify-between items-end mb-5 mt-auto">
                <div>
                  <span className="text-xl font-bold text-slate-900">₹{(product.price ?? 0).toLocaleString('en-IN')}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-slate-400 block line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> In Stock
                </span>
              </div>
              <div className="flex gap-2 flex-col">
                <div className="flex gap-3">
                  <button 
                    onClick={() => onEdit(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium text-sm transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg font-medium text-sm transition-colors"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this product?')) {
                        onDelete(product.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
                {/* Link to live public page */}
                <Link 
                  href={product.primaryType === 'SERVICE' || (product.category && ['services', 'salon', 'spa', 'car wash', 'food & dining', 'organizers', 'transport'].some(c => product.category?.toLowerCase().includes(c))) ? `/service/${product.id}` : `/product/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-medium text-sm transition-colors">
                  {product.primaryType === 'SERVICE' || (product.category && ['services', 'salon', 'spa', 'car wash', 'food & dining', 'organizers', 'transport'].some(c => product.category?.toLowerCase().includes(c))) ? '🌐 View Service Page' : '🌐 View Product Page'}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No physical products yet</h3>
            <p className="text-slate-500 mb-6">Start expanding your storefront by adding physical retail or wholesale products.</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={onAddNew}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors"
              >
                Add Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
