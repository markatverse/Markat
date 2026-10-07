"use client";

import React, { useState, useEffect } from 'react';
import { useAdminRole } from '@/context/AdminRoleContext';
import { useSettings } from '@/context/SettingsContext';
import { ShieldAlert, Map, Hexagon, Crosshair, Save, Check, Search } from 'lucide-react';

export default function AdminLocationsPage() {
  const { canToggleSector } = useAdminRole();
  const hasSettingsPermission = canToggleSector(); // Super Admin only for core platform settings
  const { systemConfig, updateSystemConfig, sectors } = useSettings();

  const [hexagonalRouting, setHexagonalRouting] = useState(true);
  const [defaultRadius, setDefaultRadius] = useState(50);
  const [sectorRadii, setSectorRadii] = useState<Record<string, number>>({});
  
  const [strictRadius, setStrictRadius] = useState(false);
  const [showOutOfRange, setShowOutOfRange] = useState(false);
  const [distanceWeight, setDistanceWeight] = useState(50);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Initialize state from systemConfig when it loads
  useEffect(() => {
    if (systemConfig) {
      if (typeof systemConfig.h3Indexing === 'boolean') {
        setHexagonalRouting(systemConfig.h3Indexing);
      }
      if (typeof systemConfig.searchRadius === 'number') {
        setDefaultRadius(systemConfig.searchRadius);
      }
      if (systemConfig.sectorRadius && typeof systemConfig.sectorRadius === 'object') {
        setSectorRadii(systemConfig.sectorRadius);
      }
      if (typeof systemConfig.strictRadius === 'boolean') {
        setStrictRadius(systemConfig.strictRadius);
      }
      if (typeof systemConfig.showOutOfRange === 'boolean') {
        setShowOutOfRange(systemConfig.showOutOfRange);
      }
      if (typeof systemConfig.distanceWeight === 'number') {
        setDistanceWeight(systemConfig.distanceWeight);
      }
    }
  }, [systemConfig]);

  const handleSave = async () => {
    if (!hasSettingsPermission) return;
    setIsSaving(true);
    try {
      await updateSystemConfig({
        ...systemConfig,
        h3Indexing: hexagonalRouting,
        searchRadius: defaultRadius,
        sectorRadius: sectorRadii,
        strictRadius,
        showOutOfRange,
        distanceWeight
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save settings", e);
      alert("Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectorRadiusChange = (sectorName: string, value: number) => {
    setSectorRadii(prev => ({
      ...prev,
      [sectorName]: value
    }));
  };

  const activeSectors = sectors.filter(s => s.isActive);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300 w-full pb-20">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Hyperlocal Locations</h1>
          <p className="text-slate-400 mt-2 text-sm">Configure routing, distance search parameters, and hexagonal indexing.</p>
        </div>
        {hasSettingsPermission && (
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${saved ? 'bg-emerald-600 text-white shadow-emerald-900/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'} disabled:opacity-50`}
          >
            {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Saved!' : isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        )}
      </header>

      {!hasSettingsPermission && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-8">
          <ShieldAlert className="w-5 h-5" />
          <p className="text-sm font-medium">You do not have permission to modify platform location algorithms. Contact a Super Admin.</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Hexagonal Routing */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30 text-violet-400 shrink-0">
                <Hexagon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">H3 Hexagonal Spatial Indexing</h2>
                <p className="text-sm text-slate-400 mt-1 max-w-xl">
                  When enabled, the platform uses Uber&apos;s H3 Hexagonal Grid system to partition geographic areas.
                  This significantly speeds up &quot;nearest to me&quot; searches for products and services.
                </p>
              </div>
            </div>
            
            <label className={`relative inline-flex items-center cursor-pointer ${!hasSettingsPermission && 'opacity-50 cursor-not-allowed'}`}>
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={hexagonalRouting}
                disabled={!hasSettingsPermission}
                onChange={(e) => setHexagonalRouting(e.target.checked)}
              />
              <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>
          
          {hexagonalRouting && (
            <div className="mt-6 ml-16 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-2">
                <Check className="w-4 h-4" /> Hexagonal Sorting is Active
              </div>
              <p className="text-xs text-slate-500">
                Search queries will first locate the user&apos;s current H3 hexagon, then expand search outwards to neighboring rings.
                Products inside the inner hexagon rings are always prioritized in search results.
              </p>
            </div>
          )}
        </div>

        {/* Global Radius Limits */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400 shrink-0">
              <Crosshair className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Default Discovery Radius</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Set the default maximum radius constraint for discovering products and businesses when a user lands on the platform. This serves as the fallback for all queries.
              </p>
            </div>
          </div>

          <div className="ml-16 pb-6 border-b border-slate-700/50 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Radius (km)</span>
              <span className="text-xl font-black text-white">{defaultRadius} km</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="500" 
              value={defaultRadius}
              disabled={!hasSettingsPermission}
              onChange={(e) => setDefaultRadius(parseInt(e.target.value))}
              className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 ${!hasSettingsPermission && 'opacity-50 cursor-not-allowed'}`}
            />
            <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2">
              <span>1 km (Hyperlocal)</span>
              <span>250 km (Regional)</span>
              <span>500 km (National)</span>
            </div>
          </div>

          {/* Dynamic Sector Radii */}
          <div className="ml-16">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Sector-Specific Radii overrides</h3>
            </div>
            
            {activeSectors.length === 0 && (
              <p className="text-sm text-slate-500 italic">No active sectors found to configure.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeSectors.map(sector => {
                const currentVal = sectorRadii[sector.name] ?? defaultRadius;
                return (
                  <div key={sector.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-bold text-slate-200 capitalize">{sector.name} Radius</span>
                        {sectorRadii[sector.name] === undefined && (
                          <span className="ml-2 text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-medium">Using Default</span>
                        )}
                      </div>
                      <span className="text-lg font-black text-emerald-400">{currentVal} km</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="500" 
                      value={currentVal}
                      disabled={!hasSettingsPermission}
                      onChange={(e) => handleSectorRadiusChange(sector.name, parseInt(e.target.value))}
                      className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 ${!hasSettingsPermission && 'opacity-50 cursor-not-allowed'}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Advanced Discovery Customizations */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg space-y-6 mt-6">
          <div className="flex items-start gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30 text-pink-400 shrink-0">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Advanced Search Customizations</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Fine-tune how strict the platform is about location limits and how ranking algorithms prioritize distance versus user ratings.
              </p>
            </div>
          </div>

          <div className="ml-16 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-700/50 pb-6">
              {/* Strict Radius Enforcement */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-bold mb-1">Strict Radius Enforcement</h3>
                  <p className="text-sm text-slate-400">Lock the maximum radius. Users will not be able to override search beyond your configured maximums.</p>
                </div>
                <label className={`relative inline-flex items-center cursor-pointer flex-shrink-0 ${!hasSettingsPermission && 'opacity-50 cursor-not-allowed'}`}>
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={strictRadius}
                    disabled={!hasSettingsPermission}
                    onChange={(e) => setStrictRadius(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>

              {/* Out-of-Range Visibility */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-bold mb-1">Out-of-Range Visibility</h3>
                  <p className="text-sm text-slate-400">Show out-of-range products at the bottom of search results instead of completely hiding them.</p>
                </div>
                <label className={`relative inline-flex items-center cursor-pointer flex-shrink-0 ${!hasSettingsPermission && 'opacity-50 cursor-not-allowed'}`}>
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={showOutOfRange}
                    disabled={!hasSettingsPermission}
                    onChange={(e) => setShowOutOfRange(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
            </div>

            {/* Distance vs Rating Weight */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold">Sorting Weight: Distance vs. Rating</span>
                <span className="text-lg font-black text-pink-400">{distanceWeight}% Distance</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                At 100%, the algorithm sorts purely by nearest distance. At 0%, it sorts purely by highest rating.
              </p>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={distanceWeight}
                disabled={!hasSettingsPermission}
                onChange={(e) => setDistanceWeight(parseInt(e.target.value))}
                className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500 ${!hasSettingsPermission && 'opacity-50 cursor-not-allowed'}`}
              />
              <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2">
                <span>0% (Ratings Focus)</span>
                <span>50% (Balanced)</span>
                <span>100% (Hyperlocal Focus)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
