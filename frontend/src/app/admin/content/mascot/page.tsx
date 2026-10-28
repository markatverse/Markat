"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  RotateCcw, 
  Save, 
  Eye, 
  Edit3, 
  Search, 
  ExternalLink, 
  Download, 
  Upload, 
  Check, 
  X, 
  AlertCircle,
  Sliders,
  Power
} from 'lucide-react';
import MascotState, { 
  MascotStateType, 
  MascotStateConfig, 
  DEFAULT_MASCOT_CONFIGS, 
  MASCOT_STORAGE_KEY 
} from '@/components/MascotState';

interface StateMetadata {
  key: MascotStateType;
  label: string;
  badge: string;
  badgeColor: string;
  recommendedRoute?: string;
  category: 'error' | 'system' | 'ux' | 'network';
}

const METADATA_LIST: StateMetadata[] = [
  {
    key: '404',
    label: '404 Not Found',
    badge: 'Page Not Found',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    recommendedRoute: '/non-existent-page-demo',
    category: 'error',
  },
  {
    key: 'server-error',
    label: 'Server Error (500)',
    badge: 'Internal 500',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    category: 'system',
  },
  {
    key: 'no-internet',
    label: 'No Internet / Offline',
    badge: 'Network Disconnected',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    category: 'network',
  },
  {
    key: 'no-search',
    label: 'No Search Results',
    badge: 'Zero Query Results',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    recommendedRoute: '/search?q=xyznonexistent123',
    category: 'ux',
  },
  {
    key: 'cart-empty',
    label: 'Empty Shopping Cart',
    badge: 'Cart State',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    recommendedRoute: '/cart',
    category: 'ux',
  },
  {
    key: 'access-denied',
    label: 'Access Denied (403)',
    badge: 'Unauthorized 403',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    recommendedRoute: '/seller/dashboard',
    category: 'error',
  },
  {
    key: 'payment-failed',
    label: 'Payment Failed',
    badge: 'Gateway Failure',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    category: 'system',
  },
  {
    key: 'maintenance',
    label: 'Under Maintenance',
    badge: 'Planned Downtime',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    category: 'system',
  },
  {
    key: 'something-wrong',
    label: 'Something Went Wrong',
    badge: 'Generic Error',
    badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    category: 'system',
  },
  {
    key: 'try-again',
    label: "Let's Try Again",
    badge: 'Retry / Helper',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    category: 'ux',
  },
];

export default function AdminMascotControlPage() {
  const [configs, setConfigs] = useState<Record<MascotStateType, MascotStateConfig>>({ ...DEFAULT_MASCOT_CONFIGS });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'error' | 'system' | 'ux' | 'network'>('all');
  const [editingKey, setEditingKey] = useState<MascotStateType | null>(null);
  const [previewKey, setPreviewKey] = useState<MascotStateType | null>(null);
  const [previewCompact, setPreviewCompact] = useState(false);
  const [editFormData, setEditFormData] = useState<MascotStateConfig | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavedLocally, setIsSavedLocally] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState('');

  // Load configs from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(MASCOT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setConfigs(prev => ({
          ...prev,
          ...parsed,
        }));
        setIsSavedLocally(true);
      }
    } catch (e) {
      console.warn('Could not read mascot configuration from localStorage', e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenEdit = (key: MascotStateType) => {
    setEditingKey(key);
    setEditFormData({ ...configs[key] });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey || !editFormData) return;

    const updated = {
      ...configs,
      [editingKey]: { ...editFormData },
    };

    setConfigs(updated);
    try {
      localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('markat_mascot_config_updated'));
      setIsSavedLocally(true);
    } catch {}

    setEditingKey(null);
    setEditFormData(null);
    showToast(`Updated "${METADATA_LIST.find(m => m.key === editingKey)?.label}" successfully!`);
  };

  const handleToggleState = (key: MascotStateType) => {
    const currentEnabled = configs[key]?.enabled !== false;
    const updated = {
      ...configs,
      [key]: {
        ...configs[key],
        enabled: !currentEnabled,
      },
    };
    setConfigs(updated);
    try {
      localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('markat_mascot_config_updated'));
      setIsSavedLocally(true);
    } catch {}
    showToast(`Mascot state "${key}" is now ${!currentEnabled ? 'Enabled' : 'Disabled'}.`);
  };

  const handleResetSingle = (key: MascotStateType) => {
    if (!confirm(`Reset "${METADATA_LIST.find(m => m.key === key)?.label}" to factory default settings?`)) return;

    const updated = {
      ...configs,
      [key]: { ...DEFAULT_MASCOT_CONFIGS[key] },
    };
    setConfigs(updated);
    try {
      localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('markat_mascot_config_updated'));
    } catch {}
    showToast(`Reset "${key}" to factory default.`);
  };

  const handleResetAll = () => {
    if (!confirm('Are you sure you want to reset ALL 10 Mascot and Error states back to factory defaults?')) return;

    setConfigs({ ...DEFAULT_MASCOT_CONFIGS });
    try {
      localStorage.removeItem(MASCOT_STORAGE_KEY);
      window.dispatchEvent(new Event('markat_mascot_config_updated'));
      setIsSavedLocally(false);
    } catch {}
    showToast('All 10 mascot states restored to factory default settings.');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(configs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'markatverse-mascot-config.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Configuration downloaded as JSON.');
  };

  const handleImportJsonApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (typeof parsed === 'object' && parsed !== null) {
        const merged = { ...configs, ...parsed };
        setConfigs(merged);
        localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event('markat_mascot_config_updated'));
        setIsSavedLocally(true);
        setShowJsonModal(false);
        setJsonText('');
        showToast('Imported JSON configuration applied successfully.');
      } else {
        alert('Invalid JSON structure. Please verify the format.');
      }
    } catch {
      alert('Failed to parse JSON. Please check for syntax errors.');
    }
  };

  // Filtered items
  const filteredList = METADATA_LIST.filter(item => {
    const conf = configs[item.key];
    const matchesSearch =
      !searchTerm ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conf?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conf?.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalEnabled = Object.values(configs).filter(c => c.enabled !== false).length;

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-300 pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400/30 animate-in slide-in-from-top-4 duration-200">
          <Check className="w-5 h-5 text-emerald-200 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black tracking-widest uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Interactive Branding System
            </span>
            {isSavedLocally && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Custom Overrides Active
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Mascot & Error States Control</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700 font-semibold">
              10 States
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            Control the 3D mascot character, custom titles, friendly messages, action buttons, and destination links for all error, empty, and system states across MarkatVerse.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/mascot-preview"
            target="_blank"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Full Visual Gallery</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <button
            type="button"
            onClick={handleExportJson}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setJsonText(JSON.stringify(configs, null, 2));
              setShowJsonModal(true);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Import JSON</span>
          </button>
          <button
            type="button"
            onClick={handleResetAll}
            className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/40 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset All</span>
          </button>
        </div>
      </header>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Mascot States</div>
          <div className="text-2xl font-black text-white">10 / 10</div>
          <div className="text-[11px] text-slate-500 mt-1">Full character coverage</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active States</div>
          <div className="text-2xl font-black text-emerald-400">{totalEnabled} Active</div>
          <div className="text-[11px] text-slate-500 mt-1">{10 - totalEnabled} muted/disabled</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Storage Status</div>
          <div className="text-2xl font-black text-indigo-400">{isSavedLocally ? 'Customized' : 'Defaults'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Live synchronizing</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Character Asset</div>
          <div className="text-2xl font-black text-amber-400">3D WebP</div>
          <div className="text-[11px] text-slate-500 mt-1">Lightweight & fast</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search mascot by title or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All (10)' },
              { id: 'error', label: 'Errors (2)' },
              { id: 'system', label: 'System (4)' },
              { id: 'ux', label: 'UX & Empty (3)' },
              { id: 'network', label: 'Network (1)' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mascot State Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredList.map((meta) => {
          const conf = configs[meta.key] || DEFAULT_MASCOT_CONFIGS[meta.key];
          const isEnabled = conf.enabled !== false;

          return (
            <div
              key={meta.key}
              className={`bg-slate-800/90 rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg flex flex-col justify-between ${
                isEnabled ? 'border-slate-700 hover:border-slate-600' : 'border-slate-800 opacity-60'
              }`}
            >
              {/* Card Header & Mascot Visual */}
              <div className="p-6 border-b border-slate-700/60">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${meta.badgeColor}`}>
                      {meta.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      key: {meta.key}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title={isEnabled ? 'Click to disable' : 'Click to enable'}
                      onClick={() => handleToggleState(meta.key)}
                      className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isEnabled
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/60'
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isEnabled ? 'Enabled' : 'Muted'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  {/* 3D Character Avatar */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-2 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner group">
                    <img
                      src={conf.image}
                      alt={conf.title}
                      className="w-full h-full object-contain filter contrast-105 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Texts */}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span>MarkatVerse</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 font-normal">{meta.label}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight truncate mb-1">
                      {conf.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {conf.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold">
                        Btn: {conf.actionText}
                      </span>
                      {conf.defaultHref && (
                        <span className="text-slate-500 font-mono text-[11px] truncate max-w-[140px]">
                          &rarr; {conf.defaultHref}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-900/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewKey(meta.key);
                      setPreviewCompact(false);
                    }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Preview</span>
                  </button>

                  {meta.recommendedRoute && (
                    <Link
                      href={meta.recommendedRoute}
                      target="_blank"
                      className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-xl border border-slate-700/60 transition-all flex items-center gap-1.5"
                    >
                      <span>Test Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleResetSingle(meta.key)}
                    title="Reset to factory default"
                    className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(meta.key)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Customize</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingKey && editFormData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Customize Mascot: {METADATA_LIST.find(m => m.key === editingKey)?.label}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">key: {editingKey}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingKey(null);
                  setEditFormData(null);
                }}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-5">
              {/* Live Preview Box */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Live Rendering Preview</div>
                <div className="bg-white rounded-xl w-full p-4 max-w-md shadow-inner">
                  <MascotState
                    state={editingKey}
                    title={editFormData.title}
                    description={editFormData.description}
                    actionText={editFormData.actionText}
                    actionHref={editFormData.defaultHref}
                    secondaryText={editFormData.secondaryText}
                    secondaryHref={editFormData.secondaryHref}
                    compact={true}
                  />
                </div>
              </div>

              {/* Title Field */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Display Headline / Title
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm font-semibold"
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Helper Copy / Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm leading-relaxed"
                />
              </div>

              {/* Primary Action Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.actionText}
                    onChange={(e) => setEditFormData({ ...editFormData, actionText: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Primary Target Route / Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. / or /search or /cart"
                    value={editFormData.defaultHref || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, defaultHref: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Secondary Action Button (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Secondary Button (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Contact Support or View Deals"
                    value={editFormData.secondaryText || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, secondaryText: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Secondary Target Route (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /help or /contact"
                    value={editFormData.secondaryHref || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, secondaryHref: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Image Path (Default mascot asset) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Mascot Asset Path
                </label>
                <input
                  type="text"
                  value={editFormData.image}
                  onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm font-mono text-slate-400"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const def = DEFAULT_MASCOT_CONFIGS[editingKey];
                    setEditFormData({ ...def });
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Factory Defaults for this State</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingKey(null);
                      setEditFormData(null);
                    }}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2 cursor-pointer active:scale-95 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Preview Modal */}
      {previewKey && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 w-full max-w-xl shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  State Preview: {METADATA_LIST.find(m => m.key === previewKey)?.label}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewCompact(!previewCompact)}
                  className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
                >
                  Mode: {previewCompact ? 'Compact' : 'Standard'}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewKey(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Display rendered component */}
            <div className="bg-white rounded-2xl p-6 shadow-inner overflow-hidden">
              <MascotState
                state={previewKey}
                compact={previewCompact}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>This reflects what shoppers & users see in real production.</span>
              <button
                type="button"
                onClick={() => {
                  const keyToEdit = previewKey;
                  setPreviewKey(null);
                  handleOpenEdit(keyToEdit);
                }}
                className="text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                Customize this state &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 w-full max-w-xl shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Import Mascot Configuration JSON</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Paste your customized JSON configuration below to apply it to all 10 mascot states.
            </p>

            <textarea
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-sky-500 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportJsonApply}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Apply Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
