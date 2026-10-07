"use client";

import React, { useState, useEffect } from 'react';
import { useProducts, Category, ListingType, BusinessModel, FeatureRule, FormField } from '@/context/ProductContext';
import { useAdminRole } from '@/context/AdminRoleContext';
import { ShieldAlert, ChevronRight, Check, X, Circle, Plus, Trash2, Settings, List, Tags, Shield, Eye } from 'lucide-react';

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
    'Salon Booking Workflow',
    'Doctor / Queue Workflow',
    'Home Services Workflow',
    'Meeting / Proposal Workflow',
    'Vehicle Enquiry / Asset Workflow',
    'RFQ / Quote Workflow',
    'Project Milestone Workflow',
  ];

  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const selectedCat = categories.find(c => c.id === selectedCatId);

  const [draft, setDraft] = useState<Partial<Category>>(selectedCat || {});
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'features' | 'subcategories' | 'attributes'>('general');

  // Auto-select first category when they load
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
    { label: '📦 Product', type: 'PRODUCT' },
    { label: '🛠️ Service', type: 'SERVICE' },
    { label: '🚗 Vehicle', type: 'VEHICLE' },
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
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Category Engine 2.0</h1>
        <p className="text-slate-400 mt-2 text-sm">Advanced granular control over category features, attributes, and structures.</p>
      </div>

      {!hasEditPermission && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-8">
          <ShieldAlert className="w-5 h-5" />
          <p className="text-sm font-medium">You do not have permission to edit category relationships. Contact a Catalog Admin.</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-220px)] lg:min-h-[700px]">
        {/* LEFT - Category List */}
        <div className="w-full lg:w-[260px] shrink-0 bg-slate-900/50 rounded-2xl border border-slate-700 overflow-y-auto flex flex-col h-[300px] lg:h-full backdrop-blur-xl">
          {grouped.map(group => {
            const cats = categories.filter(c => c.primaryType === group.type);
            if (cats.length === 0) return null;
            return (
              <div key={group.type} className="mb-2">
                <div className="px-5 pt-5 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky top-0 bg-slate-900/90 backdrop-blur-md z-10 border-b border-slate-800/50">{group.label}</div>
                <div className="p-2 space-y-1">
                  {cats.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCatId === cat.id
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-900/20'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                        }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      {selectedCatId === cat.id && <ChevronRight className="w-4 h-4 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT — Detail Editor */}
        {selectedCat ? (
          <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            {/* Header / Breadcrumb */}
            <div className="bg-slate-800/50 border-b border-slate-700 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">{selectedCat.primaryType}</span>
                </div>
                <h2 className="text-2xl font-black text-white">{selectedCat.name}</h2>
              </div>
              {hasEditPermission && (
                <button
                  onClick={handleSave}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${saved
                      ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]'
                    }`}
                >
                  {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Configuration'}
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-700 bg-slate-800/30 hide-scrollbar">
              {[
                { id: 'general', icon: Settings, label: 'General' },
                { id: 'features', icon: Shield, label: 'Access Rules Matrix' },
                { id: 'subcategories', icon: List, label: 'Subcategories' },
                { id: 'attributes', icon: Tags, label: 'Attributes Builder' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    const el = document.getElementById(`section-${tab.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap border-b-2 ${
                    activeTab === tab.id 
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-12 pb-32">
              
              {/* SECTION: GENERAL */}
              <div id="section-general" className="grid grid-cols-1 gap-6 animate-in fade-in duration-300">
                <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings className="w-4 h-4"/> Allowed Listing Types</h3>
                      <p className="text-xs text-slate-500 mt-1">Select the formats in which sellers can create listings in this category.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {ALL_LISTING_TYPES.map(lt => {
                        const on = (draft.allowedListingTypes || []).includes(lt);
                        return (
                          <label key={lt} className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all font-bold text-sm ${on ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_15px_rgba(79,70,229,0.15)]' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                            } ${!hasEditPermission && 'opacity-50 cursor-not-allowed'}`}>
                            <input type="checkbox" className="hidden" disabled={!hasEditPermission} checked={on} onChange={() => setDraft(d => ({ ...d, allowedListingTypes: toggleArray(d.allowedListingTypes, lt) }))} />
                            {on ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded border border-slate-500 opacity-30" />}
                            {lt}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Business Models</h3>
                      <p className="text-xs text-slate-500 mt-1">Which business structures are permitted for these listings? (e.g., direct to consumer, business to business, bulk pricing).</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {ALL_BUSINESS_MODELS.map(bm => {
                        const on = (draft.businessModels || []).includes(bm);
                        return (
                          <label key={bm} className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all text-xs font-bold ${on ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                            } ${!hasEditPermission && 'opacity-50 cursor-not-allowed'}`}>
                            <input type="checkbox" className="hidden" disabled={!hasEditPermission} checked={on} onChange={() => setDraft(d => ({ ...d, businessModels: toggleArray(d.businessModels, bm) }))} />
                            {bm}
                            {on && <Check className="w-3 h-3 text-indigo-400" />}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary Workflow</h3>
                      <p className="text-xs text-slate-500 mt-1">Determine the main checkout or inquiry process for the buyer.</p>
                    </div>
                    <select
                      value={draft.workflow || ''}
                      onChange={e => setDraft(d => ({ ...d, workflow: e.target.value }))}
                      disabled={!hasEditPermission}
                      className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-inner"
                    >
                      <option value="">— Select a workflow —</option>
                      {WORKFLOWS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: FEATURES MATRIX */}
              <div id="section-features" className="animate-in fade-in duration-300">
                <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="px-6 py-5 bg-slate-900/30 border-b border-slate-700/50">
                      <h3 className="text-sm font-black text-slate-200">Feature Access Rules</h3>
                      <p className="text-xs text-slate-500 mt-1">Configure exactly which platform features are strictly required, optional for the seller to enable, or completely disabled in this category.</p>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-700/50">
                          <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest w-1/2">Feature Rule</th>
                          <th className="py-4 px-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest text-center">Required (Yes)</th>
                          <th className="py-4 px-4 text-[10px] font-black text-amber-400 uppercase tracking-widest text-center">Optional (Maybe)</th>
                          <th className="py-4 px-4 text-[10px] font-black text-rose-400 uppercase tracking-widest text-center">Disabled (No)</th>
                          <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Inherit Default</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {ALL_FEATURE_RULES.map(feature => {
                          const state = getFeatureState(feature);
                          return (
                            <tr key={feature} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-4 px-6 text-sm font-bold text-slate-200">{feature}</td>
                              
                              {/* Enabled (Allowed) */}
                              <td className="py-4 px-4 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name={`feature-${feature}`} 
                                    className="hidden" 
                                    checked={state === 'allowed'} 
                                    onChange={() => setFeatureState(feature, 'allowed')} 
                                    disabled={!hasEditPermission} 
                                  />
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${state === 'allowed' ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-600 bg-slate-800 hover:border-emerald-500/50'}`}>
                                    {state === 'allowed' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />}
                                  </div>
                                </label>
                              </td>

                              {/* Optional */}
                              <td className="py-4 px-4 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name={`feature-${feature}`} 
                                    className="hidden" 
                                    checked={state === 'optional'} 
                                    onChange={() => setFeatureState(feature, 'optional')} 
                                    disabled={!hasEditPermission} 
                                  />
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${state === 'optional' ? 'border-amber-500 bg-amber-500/20' : 'border-slate-600 bg-slate-800 hover:border-amber-500/50'}`}>
                                    {state === 'optional' && <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />}
                                  </div>
                                </label>
                              </td>

                              {/* Disabled (Not Applicable) */}
                              <td className="py-4 px-4 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name={`feature-${feature}`} 
                                    className="hidden" 
                                    checked={state === 'notApplicable'} 
                                    onChange={() => setFeatureState(feature, 'notApplicable')} 
                                    disabled={!hasEditPermission} 
                                  />
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${state === 'notApplicable' ? 'border-rose-500 bg-rose-500/20' : 'border-slate-600 bg-slate-800 hover:border-rose-500/50'}`}>
                                    {state === 'notApplicable' && <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />}
                                  </div>
                                </label>
                              </td>
                              
                              {/* Unset (None) */}
                              <td className="py-4 px-4 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name={`feature-${feature}`} 
                                    className="hidden" 
                                    checked={state === 'none'} 
                                    onChange={() => setFeatureState(feature, 'none')} 
                                    disabled={!hasEditPermission} 
                                  />
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${state === 'none' ? 'border-slate-400 bg-slate-700' : 'border-slate-600 bg-slate-800 hover:border-slate-400/50'}`}>
                                    {state === 'none' && <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />}
                                  </div>
                                </label>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
              </div>

              {/* SECTION: SUBCATEGORIES */}
              <div id="section-subcategories" className="animate-in fade-in duration-300 space-y-6">
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
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                              <List className="w-4 h-4" />
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

              {/* SECTION: ATTRIBUTES */}
              <div id="section-attributes" className="animate-in fade-in duration-300 space-y-6">
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

                  {draft.parameters && draft.parameters.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 mb-6">
                        <Eye className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-black text-white">Live Seller Preview</h3>
                      </div>
                      <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 md:p-8 max-w-2xl shadow-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Listing Details</p>
                        <div className="space-y-5">
                          {draft.parameters.map((param, idx) => (
                            <div key={idx} className="space-y-2">
                              <label className="block text-sm font-bold text-slate-300">
                                {param.name || 'Unnamed Field'}
                              </label>
                              
                              {param.type === 'text' && (
                                <input type="text" placeholder={param.placeholder || ''} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600 transition-colors" disabled />
                              )}
                              
                              {param.type === 'number' && (
                                <input type="number" placeholder={param.placeholder || ''} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600 transition-colors" disabled />
                              )}
                              
                              {param.type === 'radio' && (
                                <div className="space-y-2">
                                  {param.options?.map((opt, i) => (
                                    <label key={i} className="flex items-center gap-3 text-sm text-slate-300 cursor-not-allowed opacity-80">
                                      <input type="radio" name={`preview-radio-${idx}`} className="w-4 h-4 text-indigo-500 border-slate-600 bg-slate-800" disabled />
                                      {opt}
                                    </label>
                                  ))}
                                  {(!param.options || param.options.length === 0) && <span className="text-xs text-slate-500 italic">No options defined</span>}
                                </div>
                              )}
                              
                              {param.type === 'checkbox' && (
                                <div className="space-y-2">
                                  {param.options?.map((opt, i) => (
                                    <label key={i} className="flex items-center gap-3 text-sm text-slate-300 cursor-not-allowed opacity-80">
                                      <input type="checkbox" className="w-4 h-4 text-indigo-500 border-slate-600 rounded bg-slate-800" disabled />
                                      {opt}
                                    </label>
                                  ))}
                                  {(!param.options || param.options.length === 0) && <span className="text-xs text-slate-500 italic">No options defined</span>}
                                </div>
                              )}
                              
                              {param.type === 'pricelist' && (
                                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden opacity-80 mt-2">
                                  <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-800/80 border-b border-slate-700">
                                      <tr>
                                        <th className="px-4 py-2 font-semibold text-slate-400">Option</th>
                                        <th className="px-4 py-2 font-semibold text-slate-400 w-32">Price (₹)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                      {param.options?.map((opt, i) => (
                                        <tr key={i}>
                                          <td className="px-4 py-3 text-slate-300">{opt}</td>
                                          <td className="px-4 py-2"><input type="number" placeholder="0" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500" disabled /></td>
                                        </tr>
                                      ))}
                                      {(!param.options || param.options.length === 0) && (
                                        <tr><td colSpan={2} className="px-4 py-3 text-xs text-slate-500 italic">No options defined</td></tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          ))}
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
