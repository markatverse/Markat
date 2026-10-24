"use client";
import React from 'react';

interface LeadItem {
  id: string;
  createdAt: string;
  product?: { name: string };
  quantityRequested: number;
  message: string;
  status: 'PENDING' | 'REPLIED' | string;
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
  const handleMarkReplied = async (leadId: string) => {
    try {
      await fetch(`${apiUrl}/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REPLIED' })
      });
      onUpdateStatus(leadId, 'REPLIED');
    } catch {
      onUpdateStatus(leadId, 'REPLIED');
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">B2B Leads & Inquiries</h1>
        <p className="text-slate-500 mt-2">Manage Requests for Quotation (RFQs) and business inquiries.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
              <th className="p-4 pl-6">Date</th>
              <th className="p-4">Product</th>
              <th className="p-4">Qty Req.</th>
              <th className="p-4">Message</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 text-sm text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-slate-900 font-medium">{lead.product?.name || 'Unknown'}</td>
                <td className="p-4 font-bold text-blue-600">{lead.quantityRequested} Units</td>
                <td className="p-4 text-slate-600 text-sm truncate max-w-[200px]" title={lead.message}>{lead.message}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    lead.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    lead.status === 'REPLIED' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  {lead.status === 'PENDING' ? (
                    <button 
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                      onClick={() => handleMarkReplied(lead.id)}
                    >
                      Mark Replied
                    </button>
                  ) : (
                    <button className="text-slate-400 hover:text-slate-600 font-medium text-sm">View</button>
                  )}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No leads found. When a buyer requests a quote, it will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
