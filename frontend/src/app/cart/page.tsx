"use client";
import React from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, CreditCard, Camera } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-10 bg-slate-50">
        <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <ShoppingBag className="w-16 h-16 text-slate-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Your Shopping Cart is Empty</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center text-lg">Discover amazing products and services in our global marketplace. There&apos;s so much to explore!</p>
        <Link href="/">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2">
            Start Shopping <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-blue-600" /> 
          Shopping Cart <span className="text-slate-400 font-medium text-lg ml-2">({items.length} items)</span>
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items List */}
          <div className="flex-[2]">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 flex flex-col gap-4">
              {items.map((item, idx) => (
                <div key={item.id} style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }} className={`flex flex-col sm:flex-row gap-4 py-4 rounded-xl transition-all hover:bg-slate-50 border border-transparent animate-in fade-in slide-in-from-bottom-4 duration-500 ${idx !== items.length -1 ? 'border-b-slate-100' : ''}`}>
                  {/* Image Placeholder */}
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-sm">
                    {item.image ? (
                      <img src={item.image || "/hero-left-logo.png"} alt={item.name} className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.name}</h3>
                        <div className="text-xl font-bold text-slate-900">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 font-bold mt-1 uppercase tracking-widest">{item.category}</div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-slate-100/80 rounded-lg border border-slate-200 p-1 shadow-inner">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                          className="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-slate-50 shadow-sm text-slate-600 hover:text-blue-600 transition-all font-bold text-sm"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          className="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-slate-50 shadow-sm text-slate-600 hover:text-blue-600 transition-all font-bold text-sm"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-slate-400 hover:text-rose-500 font-semibold text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex-1">
            <div className="bg-gradient-to-b from-white to-slate-50/50 p-6 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24 animate-in fade-in slide-in-from-right-4 duration-700">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4 mb-5">Order Summary</h3>
              
              <div className="flex flex-col gap-3.5 mb-5">
                <div className="flex justify-between text-slate-500 font-medium text-sm">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="text-slate-900 font-bold">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium text-sm">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold tracking-wide uppercase text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Free</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium text-sm">
                  <span>Tax</span>
                  <span className="text-slate-400 text-xs italic">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end pt-5 border-t border-slate-100 mb-6">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</div>
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  ₹{total.toLocaleString('en-IN')}
                </div>
              </div>

              <Link href="/checkout">
                <button className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group">
                  Proceed to Checkout <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </Link>
              
              <div className="mt-8 flex flex-col items-center gap-4 border-t border-slate-100 pt-6">
                <div className="flex gap-2 text-slate-300">
                  <CreditCard className="w-7 h-7 hover:text-slate-400 transition-colors cursor-help" title="Cards Accepted" />
                  <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400 hover:text-slate-500 transition-colors cursor-help" style={{fontSize: '0.55rem'}} title="UPI Accepted">UPI</div>
                  <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400 hover:text-slate-500 transition-colors cursor-help" style={{fontSize: '0.55rem'}} title="EMI Available">EMI</div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Secure Payments
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
