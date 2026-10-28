"use client";
import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus, GitMerge } from 'lucide-react';

import { getApiUrl } from '@/utils/api';

const API = getApiUrl();

interface Workflow {
  id: string;
  name: string;
  description: string;
  version: number;
  steps: any;
  updatedAt: string;
}

export default function OperationsWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '', version: 1, steps: '[]' });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch(`${API}/workflows`);
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      const res = await fetch(`${API}/workflows/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWorkflows(prev => prev.filter(w => w.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setNewWorkflow({
      name: workflow.name,
      description: workflow.description || '',
      version: workflow.version || 1,
      steps: typeof workflow.steps === 'string' ? workflow.steps : JSON.stringify(workflow.steps, null, 2)
    });
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditingWorkflow(null);
    setNewWorkflow({ name: '', description: '', version: 1, steps: '[\n  {\n    "stepNumber": 1,\n    "title": "Booking Received",\n    "type": "AUTOMATIC",\n    "notifyUser": true\n  },\n  {\n    "stepNumber": 2,\n    "title": "Provider Confirmation",\n    "type": "MANUAL",\n    "requiredAction": "ACCEPT_OR_RESCHEDULE"\n  },\n  {\n    "stepNumber": 3,\n    "title": "Service Fulfillment / Live Queue",\n    "type": "IN_PERSON",\n    "station": "ASSIGNED_CHAIR_OR_ROOM"\n  },\n  {\n    "stepNumber": 4,\n    "title": "Service Completed & Payment Settlement",\n    "type": "SETTLEMENT"\n  }\n]' });
    setShowModal(true);
  };

  const handleSaveWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let parsedSteps;
      try {
        parsedSteps = JSON.parse(newWorkflow.steps);
      } catch {
        alert('Invalid JSON in steps');
        setSubmitting(false);
        return;
      }

      const url = editingWorkflow ? `${API}/workflows/${editingWorkflow.id}` : `${API}/workflows`;
      const method = editingWorkflow ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkflow.name,
          description: newWorkflow.description,
          version: Number(newWorkflow.version),
          steps: parsedSteps
        })
      });

      if (res.ok) {
        setShowModal(false);
        setEditingWorkflow(null);
        setNewWorkflow({ name: '', description: '', version: 1, steps: '[]' });
        fetchWorkflows();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to save workflow: ${err.message || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to backend API');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto w-full pb-20 animate-in fade-in zoom-in-95 duration-500 relative">
      {/* Background Glow Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <header className="flex justify-between items-end mb-10 relative z-10 border-b border-white/5 pb-8">
        <div className="flex gap-4 items-center">
          <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <GitMerge className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Workflows</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">Manage and configure automated workflows and booking logic.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenCreate}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" /> Add New Workflow
          </button>
        </div>
      </header>

      <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
        <div className="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search workflows..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-inner" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Name / Title</th>
                <th className="p-4">Version</th>
                <th className="p-4">Steps count</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <div className="font-bold text-white">Loading workflows...</div>
                    </div>
                  </td>
                </tr>
              ) : filteredWorkflows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <GitMerge className="w-12 h-12 text-slate-600 mb-4" />
                      <div className="font-bold text-white text-lg">No workflows found</div>
                      <p className="text-sm text-slate-400 mt-1">Create one to get started, or try a different search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWorkflows.map(w => (
                  <tr key={w.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 pl-6 font-mono text-xs text-slate-500">
                      ...{w.id.slice(-6)}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">{w.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{w.description}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-bold font-mono">
                        v{w.version}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-inner">
                        {Array.isArray(w.steps) ? w.steps.length : 0} step(s)
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">{new Date(w.updatedAt).toLocaleDateString()}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEdit(w)}
                          title="Edit Workflow" 
                          className="p-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(w.id)} title="Delete Workflow" className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-lg transition-colors border border-slate-700 hover:border-rose-500/30">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl p-8 w-full max-w-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
              <GitMerge className="w-6 h-6 text-emerald-400" />
              {editingWorkflow ? `Edit Workflow: ${editingWorkflow.name}` : 'Create New Workflow'}
            </h2>
            <p className="text-slate-400 text-xs mb-5">
              Configure stage transitions, station requirements, and notification triggers.
            </p>

            {/* Quick Templates */}
            {!editingWorkflow && (
              <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Load Preset Workflow Template:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setNewWorkflow({
                      name: 'EVENT_ORGANIZER_FLOW',
                      description: 'Proposal, Quote Negotiation, Milestone Advance & Event Day Execution',
                      version: 1,
                      steps: JSON.stringify([
                        { stepNumber: 1, title: 'Inquiry & Requirements Received', type: 'INQUIRY', trigger: 'USER_SUBMIT' },
                        { stepNumber: 2, title: 'Custom Quote / Proposal Issued', type: 'QUOTE_SUBMIT', requiredAction: 'WHATSAPP_OR_PORTAL' },
                        { stepNumber: 3, title: 'Advance Deposit Paid & Date Blocked', type: 'MILESTONE_PAYMENT' },
                        { stepNumber: 4, title: 'Event Day Production & Final Settlement', type: 'FULFILLMENT' }
                      ], null, 2)
                    })}
                    className="text-xs px-2.5 py-1 bg-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/30 rounded-lg border border-fuchsia-500/30 font-semibold transition"
                  >
                    Event / Party Planner
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewWorkflow({
                      name: 'SALON_WALKIN_QUEUE_FLOW',
                      description: 'Live token generation, waiting chair assignment, stylist execution',
                      version: 1,
                      steps: JSON.stringify([
                        { stepNumber: 1, title: 'Token Generated', type: 'TOKEN_ISSUANCE' },
                        { stepNumber: 2, title: 'Customer Called to Station Chair', type: 'STATION_CALL' },
                        { stepNumber: 3, title: 'Service Rendered', type: 'EXECUTION' },
                        { stepNumber: 4, title: 'Checkout & Review', type: 'PAYMENT_COMPLETE' }
                      ], null, 2)
                    })}
                    className="text-xs px-2.5 py-1 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 rounded-lg border border-violet-500/30 font-semibold transition"
                  >
                    Salon Live Queue
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewWorkflow({
                      name: 'CLINIC_OPD_APPOINTMENT_FLOW',
                      description: 'Scheduled OPD doctor consultation & prescription dispatch',
                      version: 1,
                      steps: JSON.stringify([
                        { stepNumber: 1, title: 'OPD Slot Booked', type: 'APPOINTMENT_CONFIRMED' },
                        { stepNumber: 2, title: 'Patient Check-in / Vitals Recorded', type: 'TRIAGE' },
                        { stepNumber: 3, title: 'Doctor Consultation in Chamber', type: 'CONSULTATION' },
                        { stepNumber: 4, title: 'Prescription & Pharmacy Routing', type: 'PRESCRIPTION' }
                      ], null, 2)
                    })}
                    className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg border border-emerald-500/30 font-semibold transition"
                  >
                    Doctor OPD
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveWorkflow} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Workflow Name</label>
                <input required type="text" value={newWorkflow.name} onChange={e => setNewWorkflow({...newWorkflow, name: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 text-white font-bold transition-colors text-sm" placeholder="e.g. EVENT_ORGANIZER_FLOW" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                <input type="text" value={newWorkflow.description} onChange={e => setNewWorkflow({...newWorkflow, description: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 text-white transition-colors text-sm" placeholder="Describe the workflow purpose..." />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Version</label>
                <input required type="number" min="1" value={newWorkflow.version} onChange={e => setNewWorkflow({...newWorkflow, version: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 text-white font-bold font-mono transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Workflow Steps (JSON format)</label>
                <textarea required rows={7} value={newWorkflow.steps} onChange={e => setNewWorkflow({...newWorkflow, steps: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 font-mono text-xs text-emerald-400 transition-colors" placeholder="[{}]" />
              </div>
              <div className="flex gap-4 pt-3">
                <button type="button" onClick={() => { setShowModal(false); setEditingWorkflow(null); }} className="flex-1 px-4 py-2.5 border border-white/10 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-slate-300 transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 flex items-center justify-center text-sm">
                  {submitting ? 'Saving...' : (editingWorkflow ? 'Update Workflow' : 'Create Workflow')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

