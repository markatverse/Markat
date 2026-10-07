"use client";

import React, { useState, useEffect } from 'react';
import { useAdminRole } from '@/context/AdminRoleContext';
import { ShieldAlert, Users, Plus, Trash2, Search } from 'lucide-react';

export default function AdminStaffPage() {
  const { canEdit } = useAdminRole();
  const hasEditPermission = canEdit('businesses');
  const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQueue, setSelectedQueue] = useState<any>(null);

  // Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Hair Stylist');
  const [isAdding, setIsAdding] = useState(false);

  const fetchQueues = async () => {
    try {
      const res = await fetch(`${API_URL}/service-queue/queues`);
      const data = await res.json();
      setQueues(Array.isArray(data) ? data : []);
      
      if (selectedQueue) {
        const updated = data.find((q: any) => q.id === selectedQueue.id);
        if (updated) setSelectedQueue(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEditPermission || !selectedQueue || !newStaffName) return;

    try {
      const res = await fetch(`${API_URL}/service-queue/${selectedQueue.id}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStaffName, role: newStaffRole })
      });
      if (res.ok) {
        setNewStaffName('');
        setIsAdding(false);
        fetchQueues(); // Refresh
      } else {
        alert("Failed to add staff member.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!hasEditPermission || !selectedQueue) return;
    if (!confirm("Are you sure you want to remove this staff member?")) return;

    try {
      const res = await fetch(`${API_URL}/service-queue/${selectedQueue.id}/staff/${staffId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchQueues();
      } else {
        alert("Failed to remove staff.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const filteredQueues = queues.filter(q => 
    q.shopName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full relative">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Business Staff & Professionals</h1>
          <p className="text-slate-400 mt-2 text-sm">Manage staff members assigned to service queues and storefronts.</p>
        </div>
      </header>

      {!hasEditPermission && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-8">
          <ShieldAlert className="w-5 h-5" />
          <p className="text-sm font-medium">You do not have permission to manage business staff.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Queue Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm h-full">
            <h3 className="text-lg font-bold text-white mb-4">Select Store/Queue</h3>
            
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search shops..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm" 
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {loading && queues.length === 0 ? (
                <div className="text-slate-500 text-sm animate-pulse">Loading queues...</div>
              ) : (
                filteredQueues.map(queue => (
                  <button
                    key={queue.id}
                    onClick={() => setSelectedQueue(queue)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedQueue?.id === queue.id ? 'bg-indigo-500/20 border-indigo-500/50 text-white' : 'bg-slate-900/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/30'}`}
                  >
                    <div className="font-bold">{queue.shopName || 'Unknown Shop'}</div>
                    <div className="text-xs opacity-60 flex items-center gap-2 mt-1">
                      <Users className="w-3 h-3" /> {queue.staff?.length || 0} Staff
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Staff Management */}
        <div className="lg:col-span-2">
          {selectedQueue ? (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedQueue.shopName}</h3>
                  <p className="text-sm text-slate-400">Manage professionals for this queue.</p>
                </div>
                {hasEditPermission && (
                  <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Staff
                  </button>
                )}
              </div>

              {isAdding && hasEditPermission && (
                <div className="p-6 bg-indigo-500/5 border-b border-indigo-500/20">
                  <form onSubmit={handleAddStaff} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Staff Name</label>
                      <input 
                        type="text" 
                        required
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Role</label>
                      <input 
                        type="text" 
                        required
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" 
                      />
                    </div>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold transition-all h-[42px]">
                      Save
                    </button>
                  </form>
                </div>
              )}

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedQueue.staff && selectedQueue.staff.length > 0 ? (
                  selectedQueue.staff.map((member: any) => (
                    <div key={member.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{member.name}</div>
                          <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider mt-0.5">{member.role}</div>
                        </div>
                      </div>
                      {hasEditPermission && (
                        <button 
                          onClick={() => handleDeleteStaff(member.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                    No staff members assigned to this queue.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 p-12 rounded-2xl border border-slate-700 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Users className="w-16 h-16 text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Shop Selected</h3>
              <p className="text-slate-400 max-w-sm">Select a storefront or queue from the list on the left to manage its professional staff.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
