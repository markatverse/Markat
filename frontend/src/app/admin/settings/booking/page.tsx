"use client";
import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

import { getApiUrl } from '@/utils/api';

const API = getApiUrl();

export default function SettingsBookingPage() {
  const [config, setConfig] = useState({ travelSpeedKmh: 30, notificationBufferMin: 5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`${API}/system-config/queue`)
      .then(res => res.json())
      .then(data => {
        setConfig({ travelSpeedKmh: data.travelSpeedKmh, notificationBufferMin: data.notificationBufferMin });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/system-config/queue`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-slate-400 flex items-center gap-2"><Loader2 className="animate-spin w-5 h-5"/> Loading config...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300 w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Queue & Smart Booking</h1>
          <p className="text-slate-400 mt-2 text-sm">Configure global parameters for smart queues, geofencing, and automated notifications.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (success ? <CheckCircle2 className="w-5 h-5 text-green-300" /> : <Save className="w-5 h-5" />)}
          {saving ? 'Saving...' : (success ? 'Saved!' : 'Save Config')}
        </button>
      </header>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden p-6">
        <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Smart Push Notifications (Location Based)</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-slate-300 text-sm font-bold mb-2">Estimated City Travel Speed (km/h)</label>
              <p className="text-slate-500 text-xs mb-3">Used to estimate how long it will take a customer to travel from their current location to the shop.</p>
              <input 
                type="number" 
                value={config.travelSpeedKmh}
                onChange={e => setConfig({...config, travelSpeedKmh: parseInt(e.target.value) || 0})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-bold mb-2">Notification Buffer (Minutes)</label>
              <p className="text-slate-500 text-xs mb-3">Alerts the customer this many minutes before their travel time exactly matches the wait time (gives them time to put shoes on).</p>
              <input 
                type="number" 
                value={config.notificationBufferMin}
                onChange={e => setConfig({...config, notificationBufferMin: parseInt(e.target.value) || 0})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
