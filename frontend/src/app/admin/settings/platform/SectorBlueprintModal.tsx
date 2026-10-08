import React, { useState } from 'react';
import { X, LayoutTemplate, Store, Users, ShoppingCart, Calendar, MessageSquare, AlignLeft, Star, Gift, Package, Users2, Download, CreditCard, ChevronRight } from 'lucide-react';

interface Props {
  sector: any;
  onClose: () => void;
  onSave: (parameters: any) => Promise<void>;
  onOpenFormBuilder: () => void;
}

export default function SectorBlueprintModal({ sector, onClose, onSave, onOpenFormBuilder }: Props) {
  const [activeTab, setActiveTab] = useState<'SELLER' | 'CUSTOMER'>('SELLER');
  const [hoverFeature, setHoverFeature] = useState<string | null>(null);
  
  const [features, setFeatures] = useState({
    shoppingCart: sector.parameters?.features?.shoppingCart ?? false,
    bookingQueue: sector.parameters?.features?.bookingQueue ?? false,
    b2bQuotes: sector.parameters?.features?.b2bQuotes ?? false,
    liveChat: sector.parameters?.features?.liveChat ?? true,
    portfolio: sector.parameters?.features?.portfolio ?? false,
    reviews: sector.parameters?.features?.reviews ?? true,
    loyaltyProgram: sector.parameters?.features?.loyaltyProgram ?? false,
    subscriptionPlans: sector.parameters?.features?.subscriptionPlans ?? false,
    inventoryTracking: sector.parameters?.features?.inventoryTracking ?? false,
    staffManagement: sector.parameters?.features?.staffManagement ?? false,
    digitalDownloads: sector.parameters?.features?.digitalDownloads ?? false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const parameters = { ...(sector.parameters || {}), features };
      await onSave(parameters);
    } finally {
      setIsSaving(false);
    }
  };

  const FeatureToggle = ({ id, icon: Icon, title, desc, recommended = false }: any) => {
    const isActive = features[id as keyof typeof features];
    return (
      <div 
        className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${isActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/5 bg-slate-900/50 hover:border-white/10'}`} 
        onClick={() => toggleFeature(id as keyof typeof features)}
        onMouseEnter={() => setHoverFeature(id)}
        onMouseLeave={() => setHoverFeature(null)}
      >
        {recommended && (
          <div className="absolute top-0 right-0 bg-indigo-500 text-[9px] font-black uppercase px-2 py-1 rounded-bl-xl tracking-wider">
            Standard
          </div>
        )}
        <div className="flex justify-between items-start mb-3">
          <div className={`p-2.5 rounded-xl ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className={`w-10 h-5 rounded-full transition-colors relative ${isActive ? 'bg-indigo-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isActive ? 'left-6' : 'left-1'}`} />
          </div>
        </div>
        <h4 className="text-sm font-bold text-white mb-1 leading-tight">{title}</h4>
        <p className="text-xs text-slate-400 leading-snug">{desc}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-slate-950 border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-[1400px] h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-950 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">{sector.name} <span className="text-slate-500 font-medium">Structure</span></h2>
              <p className="text-sm text-slate-400 mt-1">Granular control over modules and capabilities for this business sector.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onOpenFormBuilder} className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 border border-indigo-500/20 hover:border-indigo-500/50">
              <AlignLeft className="w-4 h-4" /> Edit Data Fields
            </button>
            <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Architecture'}
            </button>
            <button onClick={onClose} className="p-3 text-slate-400 hover:text-white bg-slate-900 rounded-2xl transition-colors border border-white/5 hover:border-white/20 ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden bg-slate-950">
          {/* Tabs Sidebar */}
          <div className="w-72 bg-slate-900/30 border-r border-white/5 p-6 flex flex-col gap-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 pl-2">View Perspectives</h3>
            <button 
              onClick={() => setActiveTab('SELLER')}
              className={`w-full text-left px-5 py-4 rounded-2xl flex items-center justify-between transition-all group ${activeTab === 'SELLER' ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-inner' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5" />
                <span className="font-bold text-sm">Seller Backend</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'SELLER' ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-50 group-hover:translate-x-0'}`} />
            </button>
            <button 
              onClick={() => setActiveTab('CUSTOMER')}
              className={`w-full text-left px-5 py-4 rounded-2xl flex items-center justify-between transition-all group ${activeTab === 'CUSTOMER' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span className="font-bold text-sm">Customer Frontend</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'CUSTOMER' ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-50 group-hover:translate-x-0'}`} />
            </button>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950">
            
            {activeTab === 'SELLER' && (
              <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-500 pb-12">
                <div className="mb-8">
                  <h3 className="text-3xl font-black text-white mb-2">Configure Backend Modules</h3>
                  <p className="text-slate-400 text-sm">Select the structural capabilities that sellers in the <strong className="text-indigo-400">{sector.name}</strong> sector will have access to.</p>
                </div>

                <div className="space-y-10">
                  {/* Core Commerce */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                      <div className="w-8 h-[1px] bg-slate-700"></div>
                      Core Commerce Model
                      <div className="flex-1 h-[1px] bg-slate-800"></div>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <FeatureToggle id="shoppingCart" icon={ShoppingCart} title="Retail & Cart" desc="Physical products, shipping, and shopping cart flows." recommended />
                      <FeatureToggle id="bookingQueue" icon={Calendar} title="Booking & Queue" desc="Services, appointments, and live queuing systems." />
                      <FeatureToggle id="digitalDownloads" icon={Download} title="Digital Goods" desc="Non-physical digital files and licensing flows." />
                      <FeatureToggle id="b2bQuotes" icon={MessageSquare} title="B2B Quotes (RFQ)" desc="Wholesale quoting, leads, and custom pricing." />
                    </div>
                  </div>

                  {/* Operations & Fulfillment */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                      <div className="w-8 h-[1px] bg-slate-700"></div>
                      Operations & Fulfillment
                      <div className="flex-1 h-[1px] bg-slate-800"></div>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <FeatureToggle id="inventoryTracking" icon={Package} title="Inventory Tracking" desc="Advanced stock levels, alerts, and multi-location." />
                      <FeatureToggle id="staffManagement" icon={Users2} title="Staff Management" desc="Assign services/shifts to individual team members." />
                      <FeatureToggle id="subscriptionPlans" icon={CreditCard} title="Recurring Subs" desc="Allow sellers to offer subscription boxes or retainers." />
                    </div>
                  </div>

                  {/* Engagement & Growth */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                      <div className="w-8 h-[1px] bg-slate-700"></div>
                      Engagement & Marketing
                      <div className="flex-1 h-[1px] bg-slate-800"></div>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <FeatureToggle id="reviews" icon={Star} title="Reviews & Ratings" desc="Enable public customer reviews and 5-star ratings." recommended />
                      <FeatureToggle id="loyaltyProgram" icon={Gift} title="Loyalty & Points" desc="Rewards program, points accumulation, and tiers." />
                      <FeatureToggle id="portfolio" icon={LayoutTemplate} title="Media Portfolio" desc="Showcase previous work, galleries, and lookbooks." />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'CUSTOMER' && (
              <div className="max-w-5xl mx-auto flex gap-10 animate-in slide-in-from-bottom-8 duration-500 h-full">
                {/* Info Panel */}
                <div className="w-1/3 py-4">
                  <h3 className="text-3xl font-black text-white mb-4">Customer Wireframe</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    This is how the public storefront will automatically structure itself based on the modules you enabled. Sections will dynamically appear or hide.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <h4 className="text-emerald-400 font-bold text-sm mb-1">Interactive Preview</h4>
                      <p className="text-xs text-slate-300">Switch back to the Seller tab to toggle features and watch this layout adapt in real-time.</p>
                    </div>
                  </div>
                </div>

                {/* Highly Detailed Customer Wireframe */}
                <div className="flex-1 bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[70vh]">
                  {/* Mock Browser Header */}
                  <div className="h-10 bg-slate-950 flex items-center px-4 gap-2 border-b border-white/5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                    <div className="mx-auto w-1/2 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                      <span className="text-[9px] text-slate-600 font-mono tracking-widest">markatverse.com/store/demo</span>
                    </div>
                  </div>

                  {/* Storefront Layout */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-900 pb-10">
                    
                    {/* Hero Banner */}
                    <div className="h-40 bg-gradient-to-r from-slate-800 to-indigo-900/40 relative border-b border-white/5">
                      <div className="absolute -bottom-10 left-8 flex items-end gap-4">
                        <div className="w-24 h-24 bg-slate-700 rounded-2xl border-4 border-slate-900 shadow-xl overflow-hidden flex items-center justify-center">
                          <Store className="w-8 h-8 text-slate-500" />
                        </div>
                        <div className="pb-2">
                          <div className="h-6 w-48 bg-white/90 rounded mb-2"></div>
                          {features.reviews && (
                            <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                              {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                              <span className="text-xs font-bold text-slate-300 ml-1">4.9 (128)</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons Container */}
                      <div className="absolute -bottom-6 right-8 flex gap-2">
                        {features.liveChat && <div className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 animate-in fade-in slide-in-from-right duration-300">Message</div>}
                        {features.b2bQuotes && <div className="px-4 py-2 bg-slate-800 text-slate-300 border border-white/10 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-right duration-300 delay-75">Request Quote</div>}
                      </div>
                    </div>

                    <div className="mt-16 px-8 grid grid-cols-3 gap-6">
                      
                      {/* Left Column: Main Content */}
                      <div className="col-span-2 space-y-6">
                        {/* Bookings / Services */}
                        {features.bookingQueue && (
                          <div className="bg-slate-950 border border-white/5 rounded-2xl p-5 animate-in slide-in-from-bottom duration-500">
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="font-bold text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-400" /> Book an Appointment</h5>
                            </div>
                            <div className="space-y-3">
                              {[1, 2].map(i => (
                                <div key={i} className="p-3 border border-white/5 rounded-xl flex justify-between items-center bg-slate-900/50 hover:bg-slate-900 transition-colors">
                                  <div>
                                    <div className="h-3 w-32 bg-slate-700 rounded mb-1.5"></div>
                                    <div className="h-2 w-20 bg-slate-800 rounded"></div>
                                  </div>
                                  <div className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold">Book Now</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Shopping Cart / Products */}
                        {features.shoppingCart && (
                          <div className="bg-slate-950 border border-white/5 rounded-2xl p-5 animate-in slide-in-from-bottom duration-500 delay-75">
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="font-bold text-white flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-emerald-400" /> Products</h5>
                              <div className="h-2 w-12 bg-slate-800 rounded"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              {[1, 2, 3, 4].map(i => (
                                <div key={i} className="border border-white/5 rounded-xl overflow-hidden bg-slate-900/30 group">
                                  <div className="h-24 bg-slate-800/80 relative">
                                    {features.digitalDownloads && i === 1 && (
                                      <div className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur rounded text-white">
                                        <Download className="w-3 h-3" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-3">
                                    <div className="h-3 w-full bg-slate-700 rounded mb-1.5"></div>
                                    <div className="h-2 w-1/2 bg-slate-800 rounded mb-3"></div>
                                    <div className="flex justify-between items-center">
                                      <div className="h-3 w-10 bg-slate-600 rounded"></div>
                                      <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
                                        <Plus className="w-3 h-3 text-emerald-400" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Portfolio */}
                        {features.portfolio && (
                          <div className="bg-slate-950 border border-white/5 rounded-2xl p-5 animate-in slide-in-from-bottom duration-500 delay-150">
                            <h5 className="font-bold text-white flex items-center gap-2 mb-4"><LayoutTemplate className="w-4 h-4 text-amber-400" /> Portfolio</h5>
                            <div className="grid grid-cols-3 gap-2">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-slate-800 rounded-lg"></div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Sidebar Info */}
                      <div className="space-y-4">
                        {/* Status/Hours */}
                        <div className="bg-slate-950 border border-white/5 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-500 uppercase">Open Now</span>
                          </div>
                          <div className="space-y-2">
                            {[1,2,3].map(i => (
                              <div key={i} className="flex justify-between">
                                <div className="h-2 w-12 bg-slate-800 rounded"></div>
                                <div className="h-2 w-16 bg-slate-700 rounded"></div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Loyalty/Subscriptions */}
                        {(features.loyaltyProgram || features.subscriptionPlans) && (
                          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-4 animate-in fade-in duration-300">
                            {features.loyaltyProgram && (
                              <div className="mb-3">
                                <h6 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 mb-1"><Gift className="w-3 h-3" /> Reward Member</h6>
                                <p className="text-[10px] text-slate-400">Earn points on every purchase.</p>
                              </div>
                            )}
                            {features.loyaltyProgram && features.subscriptionPlans && <div className="h-px bg-white/5 my-3"></div>}
                            {features.subscriptionPlans && (
                              <div>
                                <h6 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1"><CreditCard className="w-3 h-3" /> Subscribe & Save</h6>
                                <p className="text-[10px] text-slate-400">Monthly auto-renewal plans available.</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Staff */}
                        {features.staffManagement && (
                          <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 animate-in fade-in duration-300">
                            <h5 className="font-bold text-white text-xs mb-3 flex items-center gap-2"><Users2 className="w-3 h-3 text-slate-400" /> Our Team</h5>
                            <div className="flex -space-x-2">
                              {[1,2,3,4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950"></div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
