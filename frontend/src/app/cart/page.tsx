"use client";
import React from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, CreditCard, Camera, Star, Bookmark, BookmarkCheck, Zap } from 'lucide-react';
import MascotState from '@/components/MascotState';

export default function CartPage() {
  const router = useRouter();
  const { items, savedItems, isLoaded, updateQuantity, removeFromCart, saveForLater, moveToCart, removeSaved, total } = useCart();

  if (!isLoaded) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-10 bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 bg-slate-50/60">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 w-full max-w-lg">
          <MascotState
            state="cart-empty"
            title="Your Cart is Empty"
            description="Looks like you haven't added anything yet. Discover amazing products and services in our global marketplace."
            actionText="Start Shopping"
            actionHref="/"
            secondaryText="Explore Categories"
            secondaryHref="/categories"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 px-2.5 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" /> 
          Shopping Cart <span className="text-slate-400 font-medium text-base sm:text-lg ml-1 sm:ml-2">({items.length} items)</span>
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items List */}
          <div className="flex-[2]">
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center shadow-sm">
                <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Your active cart is empty</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm">Items you saved for later are listed below. Move them back to cart anytime to checkout.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
                {items.map((item, idx) => (
                  <div key={item.id} style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }} className={`flex flex-col gap-3 py-3 sm:py-4 rounded-xl transition-all hover:bg-slate-50/80 border border-transparent animate-in fade-in slide-in-from-bottom-4 duration-500 ${idx !== items.length - 1 ? 'border-b-slate-100' : ''}`}>
                    {/* Top Row: Thumbnail + Core Details */}
                    <div className="flex gap-3 sm:gap-4 items-start">
                      {/* Image Container */}
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden p-1 shadow-sm">
                        {item.image ? (
                          <img src={item.image || "/hero-left-logo.png"} alt={item.name} className="w-full h-full object-contain transition-transform hover:scale-105 duration-300" />
                        ) : (
                          <Camera className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <Link href={`/product/${item.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug line-clamp-2">{item.name}</h3>
                          </Link>
                          {/* Price */}
                          <div className="text-base sm:text-lg font-bold text-slate-900 shrink-0">
                            ₹{item.price.toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* Specification Overview Line */}
                        {(() => {
                          const specSummary = item.parameters && Object.keys(item.parameters).length > 0
                            ? Object.entries(item.parameters).slice(0, 3).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('/') : v}`).join(', ')
                            : (item.description || (item.category ? `${item.category}${item.subcategory ? ' › ' + item.subcategory : ''}` : ''));
                          
                          return specSummary ? (
                            <p className="text-xs text-slate-500 font-normal mt-0.5 line-clamp-1">
                              {specSummary}
                            </p>
                          ) : null;
                        })()}

                        {/* Rating & Review Count */}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((starIdx) => {
                              const ratingNum = item.rating ? Number(item.rating) : 4.2;
                              const isFilled = starIdx <= Math.floor(ratingNum);
                              const isHalf = !isFilled && starIdx === Math.ceil(ratingNum);
                              return (
                                <Star
                                  key={starIdx}
                                  className={`w-3 h-3 ${
                                    isFilled
                                      ? 'text-emerald-600 fill-emerald-600'
                                      : isHalf
                                      ? 'text-emerald-600 fill-emerald-600/50'
                                      : 'text-slate-200 fill-slate-200'
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <span className="text-xs font-semibold text-emerald-600">
                            {item.rating ? Number(item.rating).toFixed(1) : '4.2'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            • ({item.reviews ? Number(item.reviews).toLocaleString('en-IN') : '1,727'})
                          </span>

                          {item.seller && (
                            <span className="text-[11px] text-slate-400 ml-1 hidden sm:inline">
                              | Seller: <strong className="text-slate-600 font-medium">{item.seller}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom Row: Quantity + Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-slate-100/90 rounded-md border border-slate-200 p-0.5 shadow-inner">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-white hover:bg-slate-50 shadow-sm text-slate-600 hover:text-blue-600 transition-all font-bold text-xs"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-7 sm:w-9 text-center font-bold text-slate-900 text-xs sm:text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-white hover:bg-slate-50 shadow-sm text-slate-600 hover:text-blue-600 transition-all font-bold text-xs"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Action Buttons: Buy Now, Save for Later & Remove */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button 
                          onClick={() => router.push('/checkout')} 
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-all shadow-sm"
                        >
                          <Zap className="w-3 h-3 fill-white" /> Buy Now
                        </button>
                        <button 
                          onClick={() => saveForLater(item.id)} 
                          className="text-slate-600 hover:text-blue-600 font-medium text-[11px] sm:text-xs flex items-center gap-1 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg hover:bg-blue-50 transition-colors border border-slate-200 bg-white"
                        >
                          <Bookmark className="w-3 h-3" /> <span className="hidden xs:inline">Save</span><span className="xs:hidden">Save</span>
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="text-slate-400 hover:text-rose-500 font-medium text-[11px] sm:text-xs flex items-center gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Saved for Later Section (Flipkart-style) */}
            {savedItems.length > 0 && (
              <div className="mt-5 sm:mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-3.5 sm:p-5">
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Saved for Later <span className="text-slate-400 font-medium text-xs sm:text-sm">({savedItems.length})</span>
                  </h2>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4 divide-y divide-slate-100">
                  {savedItems.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
                      <div className="flex gap-3 items-center w-full sm:w-auto">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden p-1 shadow-sm">
                          {item.image ? (
                            <img src={item.image || "/hero-left-logo.png"} alt={item.name} className="w-full h-full object-contain" />
                          ) : (
                            <Camera className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <Link href={`/product/${item.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">{item.name}</h4>
                            </Link>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 sm:hidden">
                              ₹{item.price.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((starIdx) => (
                                <Star
                                  key={starIdx}
                                  className={`w-2.5 h-2.5 ${starIdx <= Math.floor(Number(item.rating || 4.2)) ? 'text-emerald-600 fill-emerald-600' : 'text-slate-200 fill-slate-200'}`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-600">{Number(item.rating || 4.2).toFixed(1)}</span>
                          </div>
                          <div className="hidden sm:block text-sm font-bold text-slate-900 mt-1">
                            ₹{item.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                        <button
                          onClick={() => {
                            moveToCart(item.id);
                            router.push('/checkout');
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] sm:text-xs font-bold px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg shadow-sm transition-all flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 fill-white" /> Buy Now
                        </button>
                        <button
                          onClick={() => moveToCart(item.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg shadow-sm transition-all flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3 h-3" /> Move to Cart
                        </button>
                        <button
                          onClick={() => removeSaved(item.id)}
                          className="text-slate-400 hover:text-rose-500 text-[11px] sm:text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  <span title="Cards Accepted">
                    <CreditCard className="w-7 h-7 hover:text-slate-400 transition-colors cursor-help" />
                  </span>
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
