"use client";
import React from 'react';
import Link from 'next/link';
import { Briefcase, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { ProductItem } from './SellerProductsTab';

interface SellerServicesTabProps {
  services: ProductItem[];
  user: any;
  activeVertical: string;
  onAddNew: () => void;
  onEdit: (service: ProductItem) => void;
  onDelete: (serviceId: string) => void;
  onGoToSectorStation?: () => void;
}

export default function SellerServicesTab({
  services,
  user,
  activeVertical,
  onAddNew,
  onEdit,
  onDelete,
  onGoToSectorStation,
}: SellerServicesTabProps) {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {activeVertical === 'FOOD' ? 'Restaurant Venue & Dining Service' : (activeVertical === 'EVENT' ? 'Event & Party Packages' : 'My Service Offerings')}
          </h1>
          <p className="text-slate-500 mt-2">
            {activeVertical === 'FOOD' 
              ? 'Your restaurant storefront, table booking service, and dining experience.'
              : 'Manage your active services, packages, pricing, and client consultations.'}
          </p>
        </div>

        {/* For Food & Dining, a restaurant is a single establishment venue. If 1 exists, don't show duplicate "+ Add New"; show direct Customer Storefront and Manage Menu links */}
        {activeVertical === 'FOOD' && services.length > 0 ? (
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Single Establishment Active
            </span>
            <Link
              href={`/shop/${encodeURIComponent((services[0].sellerName || services[0].seller || user?.business?.name || user?.name || '').toLowerCase().replace(/ /g, '-'))}`}
              target="_blank"
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-orange-600/20 transition-colors flex items-center gap-2 text-sm"
            >
              🍽️ View Customer Storefront
            </Link>
          </div>
        ) : (
          <button 
            onClick={onAddNew}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-5 h-5" /> {activeVertical === 'FOOD' ? 'Setup Restaurant Venue' : 'Add New Service'}
          </button>
        )}
      </div>

      {/* Food & Dining Single-Establishment Guidance Banner */}
      {activeVertical === 'FOOD' && services.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🍴
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Your Complete Dining & Food Shop Profile</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Customers visit your live page to reserve dining tables, browse your food menu, and order. You manage dishes and tables directly from the workspace.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onGoToSectorStation && (
              <button
                onClick={onGoToSectorStation}
                className="px-3.5 py-2 rounded-xl bg-white text-orange-700 border border-orange-200 text-xs font-bold hover:bg-orange-50 transition-colors shadow-xs"
              >
                Manage Food Menu & Tables
              </button>
            )}
            <Link
              href={`/shop/${encodeURIComponent((services[0].sellerName || services[0].seller || user?.business?.name || user?.name || '').toLowerCase().replace(/ /g, '-'))}`}
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-xs flex items-center gap-1.5"
            >
              Customer Menu Page ↗
            </Link>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col group">
            <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden">
              {service.image ? (
                <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <img src="/hero-left-logo.png" alt={service.name} className="w-full h-full object-contain opacity-50 p-4 group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-purple-700 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                {service.category || 'Service'}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="font-bold text-base text-slate-900 mb-2 line-clamp-2 leading-snug">{service.name}</div>
              <div className="flex justify-between items-end mb-5 mt-auto">
                <div>
                  <span className="text-xl font-bold text-slate-900">₹{(service.price ?? 0).toLocaleString('en-IN')}</span>
                  {activeVertical === 'FOOD' && <span className="text-xs text-slate-400 block font-normal">dining cover charge</span>}
                  {activeVertical === 'EVENT' && <span className="text-xs text-fuchsia-600 block font-normal">package base fee</span>}
                </div>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active
                </span>
              </div>
              <div className="flex gap-2 flex-col">
                <div className="flex gap-3">
                  <button 
                    onClick={() => onEdit(service)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium text-sm transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg font-medium text-sm transition-colors"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this service?')) {
                        onDelete(service.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
                {/* Link to live public page */}
                <Link 
                  href={`/product/${service.id}`}
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-medium text-sm transition-colors">
                  🌐 View Service Page
                </Link>
              </div>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No services yet</h3>
            <p className="text-slate-500 mb-6">Start growing your client bookings by adding your first service package or appointment.</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={onAddNew}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors"
              >
                Add Service
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
