"use client";

import React, { useState, useEffect } from 'react';
import { useProducts, Category, ListingType, BusinessModel, FeatureRule, FormField } from '@/context/ProductContext';
import { useAdminRole } from '@/context/AdminRoleContext';
import { ShieldAlert, ChevronRight, Check, Plus, Trash2, Settings, List, Tags, Shield, CreditCard, Maximize2, Minimize2 } from 'lucide-react';
import { getCategoryEmoji, getSubcategoryEmoji } from '@/utils/categoryEmoji';

export default function CategoryRelationsPage() {
  const { canEdit } = useAdminRole();
  const hasEditPermission = canEdit('categories');

  const { categories, updateCategory } = useProducts();
  const ALL_LISTING_TYPES: ListingType[] = ['Product', 'Service', 'Vehicle'];
  const ALL_BUSINESS_MODELS: BusinessModel[] = ['B2C', 'B2B', 'Appointment', 'RFQ', 'Bulk Pricing', 'MOQ', 'Quote', 'Token', 'Meeting', 'Sample'];
  const ALL_FEATURE_RULES: FeatureRule[] = ['Product Stock', 'Service', 'Appointment', 'Token', 'RFQ', 'B2C', 'B2B', 'Bulk Pricing', 'MOQ', 'Quote', 'Meeting', 'Sample', 'Vehicle Test Drive'];
  const WORKFLOWS = [
    'Product Sales Workflow',
    'B2B / Manufacturer Workflow',
    'Restaurant Booking Workflow',
    'Salon Booking Workflow',
    'Doctor / Queue Workflow',
    'Home Services Workflow',
    'Meeting / Proposal Workflow',
    'Vehicle Enquiry / Asset Workflow',
    'RFQ / Quote Workflow',
    'Project Milestone Workflow',
  ];

  // Local editing state — mirrors the selected category
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const selectedCat = categories.find(c => c.id === selectedCatId);

  const [draft, setDraft] = useState<Partial<Category>>(selectedCat || {});
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'features' | 'subcategories' | 'attributes' | 'billing'>('general');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Auto-select first category when categories load
  useEffect(() => {
    if (!selectedCatId && categories.length > 0) {
      setSelectedCatId(categories[0].id);
    }
  }, [categories, selectedCatId]);

  // Sync draft when user picks different category
  useEffect(() => {
    if (selectedCat) setDraft({ ...selectedCat });
    setSaved(false);
    setActiveTab('general');
  }, [selectedCatId, selectedCat]);

  const toggleArray = <T,>(arr: T[] | undefined, item: T): T[] => {
    const list = arr || [];
    return list.includes(item) ? list.filter(x => x !== item) : [...list, item];
  };

  const getFeatureState = (feature: FeatureRule): 'allowed' | 'notApplicable' | 'optional' | 'none' => {
    if ((draft.allowedFeatures || []).includes(feature)) return 'allowed';
    if ((draft.notApplicable || []).includes(feature)) return 'notApplicable';
    if ((draft.optionalFeatures || []).includes(feature)) return 'optional';
    return 'none';
  };

  const setFeatureState = (feature: FeatureRule, state: 'allowed' | 'optional' | 'notApplicable' | 'none') => {
    if (!hasEditPermission) return;
    const remove = (arr: FeatureRule[] | undefined) => (arr || []).filter(f => f !== feature);
    const next = {
      allowedFeatures: remove(draft.allowedFeatures) as FeatureRule[],
      notApplicable: remove(draft.notApplicable) as FeatureRule[],
      optionalFeatures: remove(draft.optionalFeatures) as FeatureRule[],
    };
    if (state === 'allowed') next.allowedFeatures.push(feature);
    if (state === 'optional') next.optionalFeatures.push(feature);
    if (state === 'notApplicable') next.notApplicable.push(feature);
    
    setDraft(d => ({ ...d, ...next }));
  };

  const handleSave = () => {
    if (!hasEditPermission) return;
    if (!selectedCatId) return;
    updateCategory(selectedCatId, draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Group categories by primaryType
  const grouped = [
    { icon: '📦', label: 'PRODUCT', type: 'PRODUCT' },
    { icon: '🛠️', label: 'SERVICE', type: 'SERVICE' },
    { icon: '🚗', label: 'VEHICLE', type: 'VEHICLE' },
  ];

  const addSubcategory = () => {
    if (!hasEditPermission) return;
    const newName = window.prompt("Enter new subcategory name:");
    if (!newName) return;
    setDraft(d => ({
      ...d,
      subcategories: [...(d.subcategories || []), { name: newName }]
    }));
  };

  const removeSubcategory = (idx: number) => {
    if (!hasEditPermission) return;
    setDraft(d => ({
      ...d,
      subcategories: (d.subcategories || []).filter((_, i) => i !== idx)
    }));
  };

  const addAttribute = () => {
    if (!hasEditPermission) return;
    const newParam: FormField = { name: 'New Attribute', type: 'text' };
    setDraft(d => ({
      ...d,
      parameters: [...(d.parameters || []), newParam]
    }));
  };

  const updateAttribute = (idx: number, field: keyof FormField, value: any) => {
    if (!hasEditPermission) return;
    setDraft(d => {
      const params = [...(d.parameters || [])];
      if (field === 'options') {
        params[idx] = { ...params[idx], options: value.split(',').map((s: string) => s.trim()).filter(Boolean) };
      } else {
        params[idx] = { ...params[idx], [field]: value };
      }
      return { ...d, parameters: params };
    });
  };

  const removeAttribute = (idx: number) => {
    if (!hasEditPermission) return;
    setDraft(d => ({
      ...d,
      parameters: (d.parameters || []).filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className={`animate-in fade-in duration-300 transition-all ${isFullScreen ? 'fixed inset-0 z-50 bg-slate-950 p-2 md:p-6 overflow-hidden flex flex-col' : 'max-w-7xl mx-auto'}`}>
      {!hasEditPermission && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2 md:p-4 rounded-xl flex items-center gap-2 mb-2 md:mb-8 text-xs md:text-sm">
          <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
          <p className="font-medium">You do not have permission to edit category relationships. Contact a Catalog Admin.</p>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row gap-2 lg:gap-3 ${isFullScreen ? 'flex-1 min-h-0' : 'h-auto lg:h-[calc(100vh-220px)] lg:min-h-[700px]'}`}>
        {/* LEFT - Category List */}
        <div className={`group w-full lg:w-[70px] lg:hover:w-[220px] transition-all duration-300 ease-out shrink-0 bg-slate-900/50 rounded-xl md:rounded-2xl border border-slate-700 overflow-y-auto overflow-x-hidden flex flex-col backdrop-blur-xl ${isFullScreen ? 'h-full' : 'h-auto max-h-[200px] md:max-h-[300px] lg:max-h-none lg:h-full'}`}>
          {grouped.map(group => {
            const cats = categories.filter(c => c.primaryType === group.type);
            if (cats.length === 0) return null;
            return (
              <div key={group.type} className="mb-0">
                <div className="flex items-center px-4 md:px-5 pt-2 md:pt-5 pb-1 md:pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky top-0 bg-slate-900/95 backdrop-blur-xl z-10 border-b border-slate-800/50">
                  <span className="shrink-0 text-center w-5">{group.icon}</span>
                  <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap hidden lg:block">{group.label}</span>
                  <span className="ml-3 lg:hidden whitespace-nowrap">{group.label}</span>
                </div>
                <div className="p-1 md:p-2 space-y-0 md:space-y-1">
                  {cats.map(cat => {
                    const emoji = getCategoryEmoji(cat);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCatId(cat.id)}
                        className={`w-full flex items-center px-3 py-1.5 md:py-2.5 rounded-md md:rounded-xl text-[11px] md:text-sm font-semibold transition-all ${selectedCatId === cat.id
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-900/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                          }`}
                      >
                        <span className="shrink-0 text-base w-6 flex justify-center items-center">{emoji}</span>
                        <span className="truncate ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block whitespace-nowrap">{cat.name}</span>
                        <span className="truncate ml-3 lg:hidden whitespace-nowrap">{cat.name}</span>
                        {selectedCatId === cat.id && <ChevronRight className="w-3 h-3 md:w-4 md:h-4 shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block" />}
                        {selectedCatId === cat.id && <ChevronRight className="w-3 h-3 md:w-4 md:h-4 shrink-0 ml-auto lg:hidden" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT — Detail Editor */}
        {selectedCat ? (
          <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-xl rounded-xl md:rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            {/* Header / Breadcrumb */}
            <div className="bg-slate-800/50 border-b border-slate-700 p-2 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3">
              <div>
                <div className="flex items-center gap-1.5 md:gap-2 mb-0 md:mb-0.5">
                  <span className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1.5 md:px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">{selectedCat.primaryType}</span>
                </div>
                <h2 className="text-base md:text-xl font-black text-white flex items-center gap-2.5">
                  <span className="text-2xl shrink-0">{getCategoryEmoji(selectedCat)}</span>
                  <span>{selectedCat.name}</span>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1.5 md:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 hover:border-slate-500 hidden sm:flex items-center justify-center h-full"
                  title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
                {hasEditPermission && (
                  <button
                    onClick={handleSave}
                    className={`w-full sm:w-auto px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${saved
                        ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]'
                      }`}
                  >
                    {saved ? <><Check className="w-3 h-3 md:w-4 md:h-4" /> Saved!</> : 'Save Configuration'}
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-700 bg-slate-800/30 hide-scrollbar">
              {[
                { id: 'general', icon: Settings, label: 'General & Access Rules' },
                { id: 'subcategories', icon: List, label: 'Subcategories' },
                { id: 'attributes', icon: Tags, label: 'Attributes Builder' },
                { id: 'billing', icon: CreditCard, label: 'Billing & Commercials' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-3 text-[11px] md:text-sm font-bold transition-colors whitespace-nowrap border-b-2 ${
                    activeTab === tab.id 
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4">
              
              {/* TAB: GENERAL */}
              {activeTab === 'general' && (
                <div className="grid grid-cols-1 gap-2 md:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-slate-800/40 rounded-xl md:rounded-2xl border border-slate-700/50 p-3 md:p-4 space-y-2">
                    <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Settings className="w-3 h-3 md:w-3.5 md:h-3.5"/> Allowed Listing Types</h3>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {ALL_LISTING_TYPES.map(lt => {
                        const on = (draft.allowedListingTypes || []).includes(lt);
                        return (
                          <label key={lt} className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:py-2 rounded-lg border-2 cursor-pointer transition-all font-bold text-[11px] md:text-xs ${on ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_15px_rgba(79,70,229,0.15)]' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                            } ${!hasEditPermission && 'opacity-50 cursor-not-allowed'}`}>
                            <input type="checkbox" className="hidden" disabled={!hasEditPermission} checked={on} onChange={() => setDraft(d => ({ ...d, allowedListingTypes: toggleArray(d.allowedListingTypes, lt) }))} />
                            {on && <Check className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                            {lt}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-800/40 rounded-xl md:rounded-2xl border border-slate-700/50 p-3 md:p-4 space-y-2">
                    <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Models</h3>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {ALL_BUSINESS_MODELS.map(bm => {
                        const on = (draft.businessModels || []).includes(bm);
                        return (
                          <label key={bm} className={`flex items-center gap-1.5 px-2.5 py-1.5 md:py-2 rounded-lg border cursor-pointer transition-all text-[11px] md:text-xs font-bold ${on ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                            } ${!hasEditPermission && 'opacity-50 cursor-not-allowed'}`}>
                            <input type="checkbox" className="hidden" disabled={!hasEditPermission} checked={on} onChange={() => setDraft(d => ({ ...d, businessModels: toggleArray(d.businessModels, bm) }))} />
                            {on && <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-indigo-400" />}
                            {bm}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-800/40 rounded-xl md:rounded-2xl border border-slate-700/50 p-3 md:p-4 space-y-2">
                    <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Workflow</h3>
                    <select
                      value={draft.workflow || ''}
                      onChange={e => setDraft(d => ({ ...d, workflow: e.target.value }))}
                      disabled={!hasEditPermission}
                      className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-lg md:rounded-xl px-2.5 md:px-3 py-1.5 md:py-2 text-white text-[11px] md:text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-inner"
                    >
                      <option value="">— Select a workflow —</option>
                      {WORKFLOWS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>

                  {/* MERGED: FEATURES MATRIX */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4">
                  {[
                    {
                      title: 'Sales & Pricing',
                      icon: CreditCard,
                      features: ['B2C', 'B2B', 'Bulk Pricing', 'MOQ', 'Quote', 'RFQ'] as FeatureRule[]
                    },
                    {
                      title: 'Booking & Services',
                      icon: Shield,
                      features: ['Service', 'Appointment', 'Token', 'Meeting'] as FeatureRule[]
                    },
                    {
                      title: 'Specialized Features',
                      icon: Tags,
                      features: ['Product Stock', 'Sample', 'Vehicle Test Drive'] as FeatureRule[]
                    }
                  ].map(group => (
                    <div key={group.title} className={`bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden shadow-sm ${group.title === 'Sales & Pricing' ? 'lg:row-span-2' : ''}`}>
                      <div className="bg-slate-900/50 px-3 py-2 border-b border-slate-700/50 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                          <group.icon className="w-3 h-3 text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-slate-200 text-[11px] md:text-xs">{group.title}</h3>
                      </div>
                      
                      <div className="divide-y divide-slate-700/30">
                        {group.features.map(feature => {
                          const state = getFeatureState(feature);
                          return (
                            <div key={feature} className="px-3 py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/20 transition-colors">
                              <div className="font-semibold text-[10px] md:text-[11px] text-slate-300">{feature}</div>
                              
                              <div className="flex bg-slate-900/80 rounded p-0.5 border border-slate-700 shadow-inner shrink-0">
                                <button
                                  onClick={() => setFeatureState(feature, 'allowed')}
                                  disabled={!hasEditPermission}
                                  className={`w-9 sm:w-11 py-1 text-[9px] sm:text-[10px] font-bold rounded-sm transition-all flex items-center justify-center ${
                                    state === 'allowed' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                                  }`}
                                >
                                  Req
                                </button>
                                
                                <button
                                  onClick={() => setFeatureState(feature, 'optional')}
                                  disabled={!hasEditPermission}
                                  className={`w-9 sm:w-11 py-1 text-[9px] sm:text-[10px] font-bold rounded-sm transition-all flex items-center justify-center ${
                                    state === 'optional' ? 'bg-amber-500/20 text-amber-400 shadow-sm border border-amber-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                                  }`}
                                >
                                  Opt
                                </button>
                                
                                <button
                                  onClick={() => setFeatureState(feature, 'notApplicable')}
                                  disabled={!hasEditPermission}
                                  className={`w-9 sm:w-11 py-1 text-[9px] sm:text-[10px] font-bold rounded-sm transition-all flex items-center justify-center ${
                                    state === 'notApplicable' ? 'bg-rose-500/20 text-rose-400 shadow-sm border border-rose-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                                  }`}
                                >
                                  Off
                                </button>

                                <button
                                  onClick={() => setFeatureState(feature, 'none')}
                                  disabled={!hasEditPermission}
                                  className={`w-6 sm:w-8 py-1 text-[9px] sm:text-[10px] font-bold rounded-sm transition-all flex items-center justify-center ${
                                    state === 'none' ? 'bg-slate-700 text-white shadow-sm border border-slate-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent'
                                  }`}
                                >
                                  -
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {/* TAB: SUBCATEGORIES */}
              {activeTab === 'subcategories' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-300">Manage Category Hierarchy</h3>
                    {hasEditPermission && (
                      <button onClick={addSubcategory} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Subcategory
                      </button>
                    )}
                  </div>
                  
                  {(!draft.subcategories || draft.subcategories.length === 0) ? (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 border-dashed">
                      <List className="w-12 h-12 mb-4 opacity-50" />
                      <p className="font-bold">No subcategories defined.</p>
                      <p className="text-sm">Add a subcategory to organize listings more effectively.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {draft.subcategories.map((sub, idx) => (
                        <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between group hover:border-indigo-500/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-base shrink-0 shadow-inner">
                              <span>{getSubcategoryEmoji(sub.name, selectedCat?.name)}</span>
                            </div>
                            <span className="font-bold text-slate-200">{sub.name}</span>
                          </div>
                          {hasEditPermission && (
                            <button onClick={() => removeSubcategory(idx)} className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-2 bg-slate-900 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ATTRIBUTES */}
              {activeTab === 'attributes' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-300">Dynamic Attributes Builder</h3>
                      <p className="text-xs text-slate-500 mt-1">Define custom fields that sellers must fill out when creating a listing in this category.</p>
                    </div>
                    {hasEditPermission && (
                      <button onClick={addAttribute} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Attribute
                      </button>
                    )}
                  </div>

                  {(!draft.parameters || draft.parameters.length === 0) ? (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 border-dashed">
                      <Tags className="w-12 h-12 mb-4 opacity-50" />
                      <p className="font-bold">No custom attributes.</p>
                      <p className="text-sm">Click &quot;Add Attribute&quot; to build dynamic forms for this category.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {draft.parameters.map((param, idx) => (
                        <div key={idx} className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 flex flex-col md:flex-row gap-4 md:items-start group">
                          <div className="flex-1 space-y-4 w-full">
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Attribute Name</label>
                                <input 
                                  type="text" 
                                  value={param.name}
                                  onChange={e => updateAttribute(idx, 'name', e.target.value)}
                                  disabled={!hasEditPermission}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                />
                              </div>
                              <div className="w-full md:w-48">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Input Type</label>
                                <select 
                                  value={param.type}
                                  onChange={e => updateAttribute(idx, 'type', e.target.value)}
                                  disabled={!hasEditPermission}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                >
                                  <option value="text">Text Input</option>
                                  <option value="number">Number</option>
                                  <option value="radio">Radio Buttons</option>
                                  <option value="checkbox">Checkboxes</option>
                                  <option value="pricelist">Price List Options</option>
                                </select>
                              </div>
                            </div>
                            
                            {/* Options field for multi-choice types */}
                            {['radio', 'checkbox', 'pricelist'].includes(param.type) && (
                              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Options (Comma Separated)</label>
                                <input 
                                  type="text" 
                                  value={param.options?.join(', ') || ''}
                                  onChange={e => updateAttribute(idx, 'options', e.target.value)}
                                  placeholder="e.g. Red, Blue, Green"
                                  disabled={!hasEditPermission}
                                  className="w-full bg-slate-900 border border-indigo-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50 placeholder-slate-600"
                                />
                                {param.options && param.options.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {param.options.map((opt, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded text-[10px] font-bold border border-indigo-500/20">{opt}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {['text', 'number'].includes(param.type) && (
                              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Placeholder Text (Optional)</label>
                                <input 
                                  type="text" 
                                  value={param.placeholder || ''}
                                  onChange={e => updateAttribute(idx, 'placeholder', e.target.value)}
                                  placeholder="e.g. Enter product warranty in months"
                                  disabled={!hasEditPermission}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50 placeholder-slate-600"
                                />
                              </div>
                            )}
                          </div>
                          
                          {hasEditPermission && (
                            <div className="pt-6">
                              <button onClick={() => removeAttribute(idx)} className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-rose-500/20">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: BILLING & COMMERCIALS */}
              {activeTab === 'billing' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                  <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-slate-300">Commercial Settings</h3>
                      <p className="text-xs text-slate-500 mt-1">Set the default commission percentage or flat subscription rate for businesses operating in this category.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Default Commission Rate (%)
                        </label>
                        <div className="relative">
                          <input 
                            type="number" 
                            min="0" max="100" step="0.1"
                            value={draft.defaultCommissionRate ?? 5.0}
                            onChange={e => setDraft(d => ({ ...d, defaultCommissionRate: parseFloat(e.target.value) }))}
                            disabled={!hasEditPermission}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-white font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 shadow-inner"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                        </div>
                        <p className="text-[10px] text-slate-500">The percentage taken from each sale.</p>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Default Subscription / Flat Rate (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                          <input 
                            type="number" 
                            min="0" step="100"
                            value={draft.defaultFlatRate ?? 999.0}
                            onChange={e => setDraft(d => ({ ...d, defaultFlatRate: parseFloat(e.target.value) }))}
                            disabled={!hasEditPermission}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 shadow-inner"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500">The fixed monthly/yearly fee if not using percentage.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-700/50 border-dashed backdrop-blur-sm">
            <List className="w-16 h-16 mb-4 opacity-20" />
            <span className="text-lg font-bold text-slate-400">Select a category</span>
            <span className="text-sm mt-1">Choose a category from the left panel to begin configuring</span>
          </div>
        )}
      </div>
    </div>
  );
}
