"use client";
import React, { useState } from 'react';
import { MessageSquare, Handshake, CheckCircle2, ShieldCheck, Truck, FileText } from 'lucide-react';

interface LeadItem {
  id: string;
  createdAt: string;
  product?: { name: string };
  quantityRequested: number;
  message: string;
  status: 'PENDING' | 'REPLIED' | 'DEAL_FINALIZED' | string;
}

interface SellerLeadsTabProps {
  leads: LeadItem[];
  apiUrl: string;
  onUpdateStatus: (leadId: string, status: string) => void;
}

export default function SellerLeadsTab({
  leads,
  apiUrl,
  onUpdateStatus,
}: SellerLeadsTabProps) {
  const [localLeads, setLocalLeads] = useState<LeadItem[]>(leads);
  const [activeNegotiationLead, setActiveNegotiationLead] = useState<LeadItem | null>(null);

  const handleMarkReplied = async (leadId: string) => {
    try {
      await fetch(`${apiUrl}/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REPLIED' })
      });
    } catch {
      // safe fallback
    }
    setLocalLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'REPLIED' } : l));
    onUpdateStatus(leadId, 'REPLIED');
  };

  const handleFinalizeDeal = async (leadId: string) => {
    try {
      await fetch(`${apiUrl}/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DEAL_FINALIZED' })
      });
    } catch {
      // safe fallback
    }
    setLocalLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'DEAL_FINALIZED' } : l));
    onUpdateStatus(leadId, 'DEAL_FINALIZED');
    setActiveNegotiationLead(null);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              B2B Leads & RFQ Inquiries
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase">
              Wholesale Negotiation
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Negotiate bulk quantities, custom pricing, and freight logistics terms directly with wholesale buyers.
          </p>
        </div>
      </div>

      {/* Distinction Banner: B2B RFQ vs B2C Courier */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Handshake className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-extrabold text-amber-950 block text-sm mb-0.5">
            Wholesale RFQ & Custom Deal Closing
          </span>
          B2B bulk orders do not use automated consumer courier delivery. You negotiate the deal parameters (advance payment, bulk discount, and transport freight/truck) directly with the buyer before clicking <strong>Finalize Deal</strong>.
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 pl-6">Inquiry Date</th>
                <th className="p-4">Product / Item</th>
                <th className="p-4">Requested Qty</th>
                <th className="p-4">Buyer Requirement</th>
                <th className="p-4">Deal Status</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {localLeads.map((lead) => {
                const isPending = lead.status === 'PENDING';
                const isReplied = lead.status === 'REPLIED';
                const isFinalized = lead.status === 'DEAL_FINALIZED';

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 text-slate-500 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4 font-bold text-slate-900">{lead.product?.name || 'Wholesale Item'}</td>
                    <td className="p-4">
                      <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                        {lead.quantityRequested} Units
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 max-w-[240px] truncate" title={lead.message}>
                      {lead.message}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isPending ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        isReplied ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isFinalized && <CheckCircle2 className="w-3 h-3" />}
                        <span>{isFinalized ? 'Deal Finalized' : lead.status}</span>
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPending && (
                          <button 
                            onClick={() => handleMarkReplied(lead.id)}
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Reply & Quote
                          </button>
                        )}
                        {!isFinalized && (
                          <button 
                            onClick={() => setActiveNegotiationLead(lead)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Handshake className="w-3.5 h-3.5" />
                            <span>Finalize Deal</span>
                          </button>
                        )}
                        {isFinalized && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                            <ShieldCheck className="w-4 h-4" /> Agreed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {localLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-slate-700 text-base">No B2B wholesale inquiries yet</div>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      When wholesale buyers submit requests for quotation on your B2B items, they will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finalize Deal Modal */}
      {activeNegotiationLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Handshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Finalize B2B Wholesale Deal</h3>
                <p className="text-xs text-slate-500">Confirm logistics and terms agreed with the buyer</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Product:</span>
                <span className="font-bold text-slate-900">{activeNegotiationLead.product?.name || 'Wholesale Order'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity Agreed:</span>
                <span className="font-bold text-blue-700">{activeNegotiationLead.quantityRequested} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Logistics Agreement:</span>
                <span className="font-bold text-emerald-700">Custom Freight / Ex-Factory Agreed</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              By confirming, this wholesale RFQ deal will be marked as finalized. Commercial invoices and transport documentation will be recorded for both parties.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActiveNegotiationLead(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleFinalizeDeal(activeNegotiationLead.id)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Deal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
