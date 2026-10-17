"use client";

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useAdminRole } from '@/context/AdminRoleContext';
import { useProducts } from '@/context/ProductContext';
import { ShieldAlert, Edit2, X, Check, Database, MapPin, Zap, Settings2, Package, Wrench, AlignLeft, LayoutTemplate } from 'lucide-react';
import SectorFieldBuilder from './SectorFieldBuilder';
import SectorBlueprintModal from './SectorBlueprintModal';

export default function SettingsPlatformPage() {
  const { sectors, toggleSector, editSector, systemConfig, updateSystemConfig } = useSettings();
  const { allProducts } = useProducts();
  const { canToggleSector } = useAdminRole();
  const hasTogglePermission = canToggleSector();

  const [isDummyActive, setIsDummyActive] = useState<boolean>(false);
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [managingFieldsSector, setManagingFieldsSector] = useState<any>(null);
  const [managingBlueprintSector, setManagingBlueprintSector] = useState<any>(null);

  React.useEffect(() => {
    const fetchDummyStatus = async () => {
      try {
        const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();
        const res = await fetch(`${API_URL}/products/dummy-status`);
        if (res.ok) {
          const data = await res.json();
          setIsDummyActive(data.enabled);
        }
      } catch (e) {
        console.error("Failed to fetch dummy status", e);
      }
    };
    fetchDummyStatus();
  }, []);

  const handleEditClick = (sector: any) => {
    if (!hasTogglePermission) return;
    setEditingSectorId(sector.id);
    setEditName(sector.name);
    setEditDesc(sector.description || '');
  };

  const handleCancelEdit = () => {
    setEditingSectorId(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!hasTogglePermission) return;
    try {
      await editSector(id, { name: editName, description: editDesc });
      setEditingSectorId(null);
    } catch {
      alert("Failed to update sector");
    }
  };

  const toggleDummyData = async () => {
    if (!hasTogglePermission) return;
    const enable = !isDummyActive;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    setIsDummyActive(enable);
    try {
      await fetch(`${API_URL}/products/toggle-dummy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable })
      });
    } catch {
      setIsDummyActive(!enable);
      alert('Failed to toggle dummy data');
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500 w-full relative pb-20">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <header className="flex justify-between items-end mb-10 relative z-10 border-b border-white/5 pb-8">
        <div className="flex gap-4 items-center">
          <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <Settings2 className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Platform Settings</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">Precision configuration controls for global system behavior.</p>
          </div>
        </div>
      </header>

      {!hasTogglePermission && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-5 rounded-2xl flex items-center gap-4 mb-10 backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.1)]">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
          <div>
            <h4 className="font-bold">Insufficient Permissions</h4>
            <p className="text-sm opacity-80">You do not have permission to toggle or edit platform configuration. Contact a Super Admin.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-12">
        {/* Global Search Radius */}
        <div className="group bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[50px] group-hover:bg-blue-500/30 transition-colors" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Left Side: Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Search Radius</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                Define the absolute geographical limit (in kilometers) for product and service discovery.
              </p>
            </div>
            
            {/* Right Side: Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
              <div className="relative w-full sm:w-48">
                <input
                  type="number"
                  value={systemConfig?.searchRadius || 50}
                  onChange={(e) => updateSystemConfig({ ...systemConfig, searchRadius: parseInt(e.target.value) || 50 })}
                  disabled={!hasTogglePermission}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-5 pr-12 py-4 text-white font-black text-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">KM</span>
              </div>
              
              <label className="flex items-center gap-3 group/label cursor-pointer p-4 rounded-xl bg-slate-950/30 border border-white/5 hover:border-blue-500/30 transition-colors whitespace-nowrap">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={systemConfig?.strictRadius || false} 
                    onChange={(e) => updateSystemConfig({ ...systemConfig, strictRadius: e.target.checked })}
                    disabled={!hasTogglePermission}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-600 rounded bg-transparent peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors"></div>
                  <Check className="absolute w-3.5 h-3.5 text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover/label:text-white transition-colors">Enforce Strict Boundary</span>
              </label>

              <label className="flex items-center gap-3 group/label cursor-pointer p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-colors whitespace-nowrap">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={systemConfig?.productsNoRadiusLimit ?? true} 
                    onChange={(e) => updateSystemConfig({ ...systemConfig, productsNoRadiusLimit: e.target.checked })}
                    disabled={!hasTogglePermission}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-blue-400/60 rounded bg-transparent peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors"></div>
                  <Check className="absolute w-3.5 h-3.5 text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <div>
                  <span className="text-sm font-bold text-blue-200 group-hover/label:text-white transition-colors block">Products: Pan-India (No Limit)</span>
                  <span className="text-[10px] text-blue-400 font-medium block">Recommend nearest first</span>
                </div>
              </label>
            </div>
            
          </div>
        </div>

        {/* Sectors Grid */}
        <div className="flex flex-col">
          {[
            { title: 'Product Sectors', icon: <Package className="w-5 h-5 text-blue-400" />, items: sectors.filter(s => s.businessType?.mainType !== 'SERVICE') },
            { title: 'Service Sectors', icon: <Wrench className="w-5 h-5 text-amber-400" />, items: sectors.filter(s => s.businessType?.mainType === 'SERVICE') }
          ].map((group, idx) => group.items.length > 0 && (
            <div key={idx} className="mb-12">
              <div className="flex items-center gap-3 mb-8 px-2">
                {group.icon}
                <h2 className="text-2xl font-bold text-white tracking-wide">{group.title}</h2>
                <div className="flex-1 border-b border-white/10 ml-4"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map(sector => (
              <div key={sector.id} className="group bg-slate-900/40 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20 relative overflow-hidden flex flex-col h-full">
                {sector.isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />}
                
                {editingSectorId === sector.id ? (
                  <div className="flex flex-col h-full relative z-10 animate-in fade-in duration-200">
                    <div className="mb-5 space-y-4 flex-1">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block">Sector Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-black/40 border border-indigo-500/50 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-indigo-400 transition-colors"
                          placeholder="e.g. Retail"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block">Description</label>
                        <textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-indigo-400 transition-colors h-28 resize-none"
                          placeholder="Sector details..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleCancelEdit} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                      <button onClick={() => handleSaveEdit(sector.id)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Save Edit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-black text-white capitalize tracking-tight">{sector.name}</h3>
                      <div className="flex items-center gap-3 bg-black/30 p-1.5 rounded-full border border-white/5">
                        {hasTogglePermission && (
                          <button onClick={() => setManagingBlueprintSector(sector)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full transition-all" title="Manage Structure & Blueprint">
                            <LayoutTemplate className="w-4 h-4" />
                          </button>
                        )}
                        {hasTogglePermission && (
                          <button onClick={() => handleEditClick(sector)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Edit Metadata">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <label className={`relative inline-flex items-center ${hasTogglePermission ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'} transition-transform`}>
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={sector.isActive} 
                            onChange={() => hasTogglePermission && toggleSector(sector.id, !sector.isActive)}
                            disabled={!hasTogglePermission}
                          />
                          <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
                        </label>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed flex-1">
                      {sector.description || `Controls global routing, merchant configurations, and consumer discovery mechanics for ${sector.name}.`}
                    </p>
                    
                    <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-end">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Status</div>
                        <div className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-md border flex items-center gap-2 w-fit ${sector.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sector.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                          {sector.isActive ? 'Online' : 'Offline'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Sector ID</div>
                        <div className="text-xs font-mono text-slate-400 bg-black/30 px-2 py-1 rounded border border-white/5">
                          {sector.id.slice(0,8)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
            
          {sectors.length === 0 && (
            <div className="col-span-full py-20 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5 flex flex-col items-center justify-center border-dashed">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                <Database className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Sectors Configured</h3>
              <p className="text-slate-400 text-sm max-w-md text-center">
                The system requires backend connection to load dynamic sector configuration matrices.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {managingBlueprintSector && (
        <SectorBlueprintModal
          sector={managingBlueprintSector}
          onClose={() => setManagingBlueprintSector(null)}
          onSave={async (parameters) => {
            await editSector(managingBlueprintSector.id, { parameters });
          }}
          onOpenFormBuilder={() => {
            setManagingFieldsSector(managingBlueprintSector);
            setManagingBlueprintSector(null);
          }}
        />
      )}
      
      {managingFieldsSector && (
        <SectorFieldBuilder 
          sector={managingFieldsSector} 
          onClose={() => {
            setManagingBlueprintSector(managingFieldsSector);
            setManagingFieldsSector(null);
          }} 
          onSave={async (parameters) => {
            await editSector(managingFieldsSector.id, { parameters });
          }}
        />
      )}
    </div>
  );
}
