"use client";

import React, { useState, useEffect } from 'react';
import { useAdminRole } from '@/context/AdminRoleContext';
import { ShieldAlert, Wallet, ArrowDownRight, ArrowUpRight, Building2, CreditCard } from 'lucide-react';

export default function AdminWalletsPage() {
  const { canEdit } = useAdminRole();
  const hasEditPermission = canEdit('transactions'); // Re-using transactions permission
  const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

  const [sellers, setSellers] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all active sellers first to populate the wallet selector
  useEffect(() => {
    fetch(`${API_URL}/sellers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSellers(data.filter(s => s.status === 'Approved'));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const loadWalletDetails = async (businessId: string) => {
    try {
      setLoading(true);
      // Fetch Wallet
      const walletRes = await fetch(`${API_URL}/wallet/business/${businessId}`);
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setSelectedWallet(walletData);

        // Fetch Transactions
        if (walletData?.id) {
          const txRes = await fetch(`${API_URL}/wallet/${walletData.id}/transactions`);
          if (txRes.ok) setWalletTransactions(await txRes.json());
        }

        // Fetch Banks
        const bankRes = await fetch(`${API_URL}/wallet/business/${businessId}/banks`);
        if (bankRes.ok) setBankAccounts(await bankRes.json());
      } else {
        setSelectedWallet(null);
        setWalletTransactions([]);
        setBankAccounts([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPlatform = async () => {
    if (!hasEditPermission || !selectedWallet?.businessId) return;
    try {
      const res = await fetch(`${API_URL}/wallet/business/${selectedWallet.businessId}/pay-platform`, {
        method: 'POST'
      });
      if (res.ok) {
        alert("Platform fee deducted successfully");
        loadWalletDetails(selectedWallet.businessId);
      } else {
        alert("Failed to deduct platform fee");
      }
    } catch {
      alert("Error processing transaction");
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full relative">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Business Wallets</h1>
          <p className="text-slate-400 mt-2 text-sm">Monitor business balances, transactions, and bank accounts across the platform.</p>
        </div>
      </header>

      {!hasEditPermission && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-8">
          <ShieldAlert className="w-5 h-5" />
          <p className="text-sm font-medium">You do not have permission to execute wallet transactions.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Seller Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm h-full">
            <h3 className="text-lg font-bold text-white mb-4">Select Business</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {loading && sellers.length === 0 ? (
                <div className="text-slate-500 text-sm animate-pulse">Loading businesses...</div>
              ) : (
                sellers.map(seller => (
                  <button
                    key={seller.id}
                    onClick={() => loadWalletDetails(seller.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${selectedWallet?.businessId === seller.id ? 'bg-indigo-500/20 border-indigo-500/50 text-white' : 'bg-slate-900/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/30'}`}
                  >
                    <div>
                      <div className="font-bold">{seller.name || seller.ownerName}</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono flex items-center gap-1.5">
                        <span className="text-emerald-400">{seller.businessCode || 'N/A'}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-blue-400">{seller.user?.markatId || 'N/A'}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Wallet Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedWallet ? (
            <>
              {/* Balances */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 rounded-2xl border border-emerald-500/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                  <div className="text-emerald-400 text-sm font-semibold mb-2 flex items-center gap-2"><Wallet className="w-4 h-4"/> Available Balance</div>
                  <div className="text-4xl font-black text-white">₹{(selectedWallet.balance || 0).toFixed(2)}</div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6 rounded-2xl border border-amber-500/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                  <div className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2"><ArrowDownRight className="w-4 h-4"/> Pending Clearance</div>
                  <div className="text-4xl font-black text-white">₹{(selectedWallet.pendingBalance || 0).toFixed(2)}</div>
                </div>
              </div>

              {/* Bank Accounts & Actions */}
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    Linked Bank Accounts
                  </h3>
                  {hasEditPermission && (
                    <button 
                      onClick={handlePayPlatform}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                    >
                      Deduct Platform Fee
                    </button>
                  )}
                </div>
                
                {bankAccounts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bankAccounts.map(bank => (
                      <div key={bank.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                          <CreditCard className="w-5 h-5 text-slate-400" />
                          <div className="font-bold text-white">{bank.bankName}</div>
                        </div>
                        <div className="text-sm text-slate-400 font-mono">{bank.accountNumber.replace(/.(?=.{4})/g, '*')}</div>
                        <div className="text-xs text-slate-500 mt-1 uppercase">IFSC: {bank.ifscCode}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm py-4">No bank accounts linked to this business.</div>
                )}
              </div>

              {/* Transactions */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-lg font-bold text-white">Transaction History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                      <tr>
                        <th className="p-4 pl-6">Type</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {walletTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-700/30 transition-all">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-2">
                              {tx.type === 'CREDIT' ? <ArrowDownRight className="w-4 h-4 text-emerald-400" /> : <ArrowUpRight className="w-4 h-4 text-rose-400" />}
                              <span className="font-bold text-slate-300 text-sm">{tx.description}</span>
                            </div>
                          </td>
                          <td className={`p-4 font-bold ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                              tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 
                              tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right text-xs text-slate-500 font-mono">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {walletTransactions.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-500">
                            No transactions found for this wallet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-800 p-12 rounded-2xl border border-slate-700 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Wallet className="w-16 h-16 text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Wallet Selected</h3>
              <p className="text-slate-400 max-w-sm">Select a business from the list on the left to view their wallet balance and transaction history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
