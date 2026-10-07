"use client";
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Search, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

export default function ExceptionCenter() {
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const { token } = useAuth();

  useEffect(() => {
    fetchExceptions();
  }, [statusFilter]);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/exceptions?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setExceptions(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load exceptions');
    } finally {
      setLoading(false);
    }
  };

  const resolveException = async (id: string) => {
    const notes = prompt("Enter resolution notes (optional):");
    if (notes === null) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/exceptions/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });
      if (res.ok) {
        toast.success('Exception resolved');
        fetchExceptions();
      } else {
        toast.error('Failed to resolve exception');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error resolving exception');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Exception Center</h1>
          <p className="text-slate-400 text-sm mt-1">Review flagged workflows, verification failures, and system alerts.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/50">
          <div className="flex gap-2">
            {['PENDING', 'RESOLVED', 'ALL'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${statusFilter === status ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search exceptions..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Severity / Type</th>
                <th className="px-6 py-4 font-semibold">Message</th>
                <th className="px-6 py-4 font-semibold">Reference</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading exceptions...</td></tr>
              ) : exceptions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No exceptions found in this queue.</td></tr>
              ) : (
                exceptions.map(exc => (
                  <tr key={exc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {exc.severity === 'URGENT' || exc.severity === 'HIGH' ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : exc.severity === 'NORMAL' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-200">{exc.type}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold mt-1 inline-block ${exc.severity === 'URGENT' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{exc.severity}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 max-w-sm truncate">{exc.message}</p>
                      {exc.details && exc.details.resolveNotes && (
                        <p className="text-emerald-400 text-xs mt-1">Resolved: {exc.details.resolveNotes}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <span className="text-xs">{exc.referenceType}:</span><br/>
                      <span className="font-mono">{exc.referenceId}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(exc.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {exc.status === 'PENDING' ? (
                        <button 
                          onClick={() => resolveException(exc.id)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <CheckCircle className="w-3 h-3" /> Resolve
                        </button>
                      ) : (
                        <span className="text-emerald-500 font-bold text-xs flex items-center justify-end gap-1">
                          <CheckCircle className="w-3 h-3" /> Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
