"use client";
import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, Wallet, TrendingUp, Download } from 'lucide-react';
import { fastFetch } from '@/utils/api';

export default function AnalyticsFinancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ledger' | 'withdrawals'>('ledger');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchFinance = async () => {
      try {
        const json = await fastFetch<any>('/admin/analytics/finance', { ttlMs: 15000 });
        if (isMounted && json) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFinance();
    return () => { isMounted = false; };
  }, []);

  const transactions = data?.transactions || [];
  const withdrawals = data?.withdrawals || [];

  const totalRevenue = transactions.reduce((sum: number, tx: any) => sum + (tx.platformFee || 0) + (tx.commission || 0), 0);
  const totalVolume = transactions.reduce((sum: number, tx: any) => sum + (tx.grossAmount || 0), 0);
  const totalPayouts = withdrawals.filter((w: any) => w.status === 'COMPLETED').reduce((sum: number, w: any) => sum + (w.netAmount || 0), 0);
  const pendingPayouts = withdrawals.filter((w: any) => w.status === 'REQUESTED').reduce((sum: number, w: any) => sum + (w.netAmount || 0), 0);

  const filteredTransactions = transactions.filter((tx: any) => 
    tx.referenceId?.toLowerCase().includes(search.toLowerCase()) ||
    tx.wallet?.business?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredWithdrawals = withdrawals.filter((w: any) => 
    w.bankAccount?.accountName?.toLowerCase().includes(search.toLowerCase()) ||
    w.wallet?.business?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 w-full space-y-8">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            Financial Analytics
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Monitor platform revenue, ledger transactions, and payouts.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-bold transition-all border border-slate-700 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-emerald-400/80 text-sm font-bold tracking-wider uppercase mb-1">Total Revenue</p>
          <h3 className="text-3xl font-black text-white">₹{totalRevenue.toLocaleString()}</h3>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-1">Gross Volume (GMV)</p>
          <h3 className="text-3xl font-black text-white">₹{totalVolume.toLocaleString()}</h3>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-1">Pending Payouts</p>
          <h3 className="text-3xl font-black text-white">₹{pendingPayouts.toLocaleString()}</h3>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-1">Total Payouts Done</p>
          <h3 className="text-3xl font-black text-white">₹{totalPayouts.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden flex flex-col min-h-[500px]">
        {/* Tabs & Search */}
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setActiveTab('ledger')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ledger' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              Ledger Transactions
            </button>
            <button 
              onClick={() => setActiveTab('withdrawals')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'withdrawals' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              Withdrawal Requests
            </button>
          </div>
          <input 
            type="text" 
            placeholder="Search by ID or Name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 w-full sm:w-64" 
          />
        </div>
        
        <div className="overflow-x-auto flex-1">
          {activeTab === 'ledger' ? (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black sticky top-0">
                <tr>
                  <th className="p-4 pl-6">Ref ID</th>
                  <th className="p-4">Business</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Gross</th>
                  <th className="p-4 text-right">Platform Fee</th>
                  <th className="p-4 text-right">Net</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">No ledger transactions found.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-700/30 transition-all">
                      <td className="p-4 pl-6 font-mono text-xs text-slate-400">{tx.referenceId || 'N/A'}</td>
                      <td className="p-4 font-bold text-white">{tx.wallet?.business?.name || 'Unknown'}</td>
                      <td className="p-4 text-slate-300 text-sm">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${tx.type === 'CREDIT' ? 'bg-emerald-500/20 text-emerald-400' : tx.type === 'DEBIT' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-sm text-slate-300">₹{tx.grossAmount}</td>
                      <td className="p-4 text-right font-mono text-sm text-emerald-400">+₹{(tx.platformFee || 0) + (tx.commission || 0)}</td>
                      <td className="p-4 text-right font-mono text-sm font-bold text-white">₹{tx.netAmount}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'SETTLED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                          'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-slate-400 text-xs">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black sticky top-0">
                <tr>
                  <th className="p-4 pl-6">Request ID</th>
                  <th className="p-4">Business</th>
                  <th className="p-4">Bank Details</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-right">Fee</th>
                  <th className="p-4 text-right">Net Payout</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">No withdrawal requests found.</td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((w: any) => (
                    <tr key={w.id} className="hover:bg-slate-700/30 transition-all">
                      <td className="p-4 pl-6 font-mono text-xs text-slate-400">{w.id.substring(18)}</td>
                      <td className="p-4 font-bold text-white">{w.wallet?.business?.name || 'Unknown'}</td>
                      <td className="p-4 text-slate-400 text-xs">
                        <div className="font-bold text-slate-300">{w.bankAccount?.accountName}</div>
                        <div>{w.bankAccount?.bankName} ({w.bankAccount?.accountNumber?.slice(-4)})</div>
                      </td>
                      <td className="p-4 text-right font-mono text-sm text-slate-300">₹{w.amount}</td>
                      <td className="p-4 text-right font-mono text-sm text-rose-400">-₹{w.fee}</td>
                      <td className="p-4 text-right font-mono text-sm font-bold text-white">₹{w.netAmount}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          w.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          w.status === 'REQUESTED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                          'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {w.status === 'REQUESTED' && (
                          <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded font-bold transition-colors">
                            Process
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
