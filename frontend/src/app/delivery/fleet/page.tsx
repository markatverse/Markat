"use client";

import React, { useState } from 'react';
import { 
  Truck, BatteryCharging, Zap, Shield, Search, 
  CheckCircle2, AlertTriangle, User, Navigation, Plus,
  X, Check, RefreshCw
} from 'lucide-react';
import { getApiUrl } from '@/utils/api';

const API_URL = getApiUrl();

interface FleetVehicle {
  id: string;
  regNumber: string;
  type: 'EV_2_WHEELER' | 'PETROL_BIKE' | 'DELIVERY_VAN' | 'E_BICYCLE';
  riderName: string;
  riderPhone: string;
  batteryLevel: number;
  assignedZone: string;
  tripsToday: number;
  status: 'ONLINE' | 'DELIVERING' | 'CHARGING' | 'MAINTENANCE';
  rating: number;
}

export default function FleetManagementPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([
    {
      id: 'FLT-01',
      regNumber: 'UP16-CZ-8821',
      type: 'EV_2_WHEELER',
      riderName: 'Vikas Kushwaha',
      riderPhone: '+91 98112 34567',
      batteryLevel: 78,
      assignedZone: 'Noida Sector 18 Hub',
      tripsToday: 14,
      status: 'DELIVERING',
      rating: 4.94
    },
    {
      id: 'FLT-02',
      regNumber: 'DL04-EQ-4120',
      type: 'EV_2_WHEELER',
      riderName: 'Mohd. Imran',
      riderPhone: '+91 98223 45678',
      batteryLevel: 22,
      assignedZone: 'South Ext Hub Delhi',
      tripsToday: 18,
      status: 'CHARGING',
      rating: 4.88
    },
    {
      id: 'FLT-03',
      regNumber: 'UP16-BK-9191',
      type: 'PETROL_BIKE',
      riderName: 'Sunny Kumar',
      riderPhone: '+91 98334 56789',
      batteryLevel: 85,
      assignedZone: 'Indirapuram Ghaziabad',
      tripsToday: 12,
      status: 'ONLINE',
      rating: 4.90
    },
    {
      id: 'FLT-04',
      regNumber: 'DL01-VN-5521',
      type: 'DELIVERY_VAN',
      riderName: 'Rameshwar Yadav (B2B Cargo)',
      riderPhone: '+91 98445 67890',
      batteryLevel: 92,
      assignedZone: 'Okhla Industrial Area',
      tripsToday: 6,
      status: 'ONLINE',
      rating: 4.98
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    regNumber: '',
    type: 'EV_2_WHEELER' as const,
    riderName: '',
    riderPhone: '',
    batteryLevel: 90,
    assignedZone: 'Noida Sector 18 Hub',
  });

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.regNumber || !newVehicle.riderName) {
      alert('Please enter vehicle registration number and rider name');
      return;
    }

    const created: FleetVehicle = {
      id: `FLT-0${vehicles.length + 1}`,
      regNumber: newVehicle.regNumber.toUpperCase(),
      type: newVehicle.type,
      riderName: newVehicle.riderName,
      riderPhone: newVehicle.riderPhone || '+91 98000 00000',
      batteryLevel: Number(newVehicle.batteryLevel) || 85,
      assignedZone: newVehicle.assignedZone,
      tripsToday: 0,
      status: 'ONLINE',
      rating: 5.0,
    };

    setVehicles([created, ...vehicles]);
    setIsModalOpen(false);
    setNewVehicle({
      regNumber: '',
      type: 'EV_2_WHEELER',
      riderName: '',
      riderPhone: '',
      batteryLevel: 90,
      assignedZone: 'Noida Sector 18 Hub',
    });
    alert(`Vehicle ${created.regNumber} assigned to ${created.riderName} successfully registered!`);
  };

  const handleToggleStatus = (id: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
        const nextStatus: FleetVehicle['status'] = 
          v.status === 'ONLINE' ? 'DELIVERING' :
          v.status === 'DELIVERING' ? 'CHARGING' :
          v.status === 'CHARGING' ? 'MAINTENANCE' : 'ONLINE';
        return { ...v, status: nextStatus };
      }
      return v;
    }));
  };

  const filtered = vehicles.filter(v => {
    const matchesSearch = v.riderName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.assignedZone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || v.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Fleet &amp; Asset Management</h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Zero-Emission Fleet Focus
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry across electric scooters, delivery bikes, and B2B freight vans.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <Plus className="w-4 h-4" /> Register New Fleet Vehicle
        </button>
      </div>

      {/* Fleet Mix KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Fleet Active</span>
          <div className="text-2xl font-black text-white mt-1 font-mono">{840 + vehicles.length} Vehicles</div>
          <span className="text-[11px] text-emerald-400 mt-0.5 block">94% active utilization</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/20">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Electric Vehicles (EV)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">620 (74%)</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Zero emission green fleet</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Low Battery Alerts (&lt;25%)</span>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">18 Units</div>
          <span className="text-[11px] text-amber-300 mt-0.5 block">Re-routed to swap station</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fuel &amp; Carbon Saved</span>
          <div className="text-2xl font-black text-teal-400 mt-1 font-mono">1,840 kg CO₂</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Saved this month</span>
        </div>
      </div>

      {/* Vehicle Roster Table */}
      <div className="bg-slate-900/60 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'EV_2_WHEELER', 'PETROL_BIKE', 'DELIVERY_VAN'].map(tab => (
              <button
                key={tab}
                onClick={() => setTypeFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  typeFilter === tab
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search vehicle reg or rider..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/60 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-4 pl-6">Vehicle &amp; Rider</th>
                <th className="p-4">Vehicle Type</th>
                <th className="p-4">Assigned Zone</th>
                <th className="p-4">Battery / Fuel</th>
                <th className="p-4">Today's Trips</th>
                <th className="p-4">Status (Click to Switch)</th>
                <th className="p-4 pr-6 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6 font-bold text-white">
                    <div className="font-mono text-emerald-400">{v.regNumber}</div>
                    <span className="text-slate-300 font-medium block">{v.riderName}</span>
                    <span className="text-[10px] text-slate-500">{v.riderPhone}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
                      {v.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{v.assignedZone}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full ${v.batteryLevel > 50 ? 'bg-emerald-500' : v.batteryLevel > 20 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${v.batteryLevel}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-white">{v.batteryLevel}%</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-white">{v.tripsToday} runs</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(v.id)}
                      title="Click to cycle status"
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border transition-all ${
                        v.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' :
                        v.status === 'DELIVERING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' :
                        v.status === 'CHARGING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                    >
                      {v.status} ⟳
                    </button>
                  </td>
                  <td className="p-4 pr-6 text-right font-mono font-bold text-amber-400">
                    {v.rating} ★
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Register Fleet Vehicle
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL04-AB-1234"
                  value={newVehicle.regNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, regNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Vehicle Type *</label>
                  <select
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="EV_2_WHEELER">EV 2-Wheeler</option>
                    <option value="PETROL_BIKE">Petrol Bike</option>
                    <option value="DELIVERY_VAN">Delivery Van</option>
                    <option value="E_BICYCLE">E-Bicycle</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Battery / Fuel (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={newVehicle.batteryLevel}
                    onChange={(e) => setNewVehicle({ ...newVehicle, batteryLevel: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Assigned Rider Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arvind Mishra"
                  value={newVehicle.riderName}
                  onChange={(e) => setNewVehicle({ ...newVehicle, riderName: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Rider Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newVehicle.riderPhone}
                  onChange={(e) => setNewVehicle({ ...newVehicle, riderPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Operating Hub Zone</label>
                <input
                  type="text"
                  value={newVehicle.assignedZone}
                  onChange={(e) => setNewVehicle({ ...newVehicle, assignedZone: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
