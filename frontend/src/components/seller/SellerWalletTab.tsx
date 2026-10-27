"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Plus, 
  X, 
  Download, 
  Search, 
  ChevronRight,
  TrendingUp,
  Percent,
  Check,
  Smartphone,
  Banknote,
  Receipt,
  Info,
  Lock,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiUrl } from '@/utils/api';

interface WalletData {
  id: string;
  businessId: string;
  totalEarnings: number;
  pendingBalance: number;
  availableBalance: number;
  withdrawn: number;
  owedToPlatform: number;
  createdAt?: string;
  updatedAt?: string;
}

interface BankAccount {
  id: string;
  businessId: string;
  accountName: string;
  accountNumber: string;
  ifscCode?: string;
  bankName: string;
  isPrimary?: boolean;
  isVerified?: boolean;
}

interface LedgerTransaction {
  id: string;
  walletId: string;
  referenceId?: string;
  referenceType?: string;
  paymentRef?: string;
  grossAmount: number;
  platformFee: number;
  commission: number;
  tax: number;
  netAmount: number;
  type: string; // CREDIT, DEBIT, SETTLEMENT, WITHDRAWAL, REFUND
  status: string; // PENDING, SETTLED, AVAILABLE, COMPLETED, FAILED
  createdAt: string;
  settledAt?: string;
}

interface SellerWalletTabProps {
  businessId: string;
  businessName?: string;
  commissionRate?: number;
}

export default function SellerWalletTab({ 
  businessId, 
  businessName = 'Seller Business',
  commissionRate = 5
}: SellerWalletTabProps) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);

  // Settle modal states
  const [settleMethod, setSettleMethod] = useState<'balance' | 'online'>('balance');
  const [isSettling, setIsSettling] = useState(false);

  // Withdraw modal states
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Add Bank form states
  const [newBank, setNewBank] = useState({
    accountName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: ''
  });
  const [isAddingBank, setIsAddingBank] = useState(false);

  // Filter & Search
  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'SETTLEMENT' | 'DEBIT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const apiUrl = getApiUrl();

  const fetchWalletData = async (showToast = false) => {
    if (!businessId) return;
    try {
      if (showToast) setIsRefreshing(true);
      
      // 1. Fetch Wallet
      const walletRes = await fetch(`${apiUrl}/wallet/business/${businessId}`);
      if (walletRes.ok) {
        const wData = await walletRes.json();
        setWallet(wData);

        // 2. Fetch Transactions if wallet exists
        if (wData?.id) {
          const txRes = await fetch(`${apiUrl}/wallet/${wData.id}/transactions`);
          if (txRes.ok) {
            const txData = await txRes.json();
            setTransactions(Array.isArray(txData) ? txData : []);
          }
        }
      }

      // 3. Fetch Banks
      const banksRes = await fetch(`${apiUrl}/wallet/business/${businessId}/banks`);
      if (banksRes.ok) {
        const bData = await banksRes.json();
        const list = Array.isArray(bData) ? bData : [];
        setBanks(list);
        if (list.length > 0 && !selectedBankId) {
          setSelectedBankId(list[0].id);
        }
      }

      if (showToast) toast.success('Wallet data refreshed');
    } catch (e) {
      console.error('Failed to load seller wallet data', e);
      if (showToast) toast.error('Failed to refresh wallet');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [businessId]);

  // Handle Settle Commission Fee
  const handleSettleCommission = async () => {
    if (!wallet || wallet.owedToPlatform <= 0) return;

    if (settleMethod === 'balance' && wallet.availableBalance < wallet.owedToPlatform) {
      toast.error('Available balance is lower than commission owed. Please select Online Payment.');
      return;
    }

    setIsSettling(true);
    try {
      const res = await fetch(`${apiUrl}/wallet/business/${businessId}/pay-platform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromBalance: settleMethod === 'balance'
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to settle commission fees');
      }

      toast.success('Commission fee settled successfully! All dues cleared.');
      setIsSettleModalOpen(false);
      fetchWalletData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to settle fees');
    } finally {
      setIsSettling(false);
    }
  };

  // Handle Withdrawal Request
  const handleRequestWithdrawal = async () => {
    const numAmount = parseFloat(withdrawAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }

    if (!wallet || numAmount > wallet.availableBalance) {
      toast.error('Withdrawal amount exceeds your available balance');
      return;
    }

    if (!selectedBankId) {
      toast.error('Please select a destination bank account');
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await fetch(`${apiUrl}/wallet/business/${businessId}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          bankAccountId: selectedBankId
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit withdrawal request');
      }

      toast.success(`Withdrawal request of ₹${numAmount.toLocaleString('en-IN')} submitted! Payout processing.`);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      fetchWalletData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to request withdrawal');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Handle Add Bank Account
  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBank.accountName || !newBank.accountNumber || !newBank.bankName) {
      toast.error('Please complete all required bank fields');
      return;
    }

    if (newBank.accountNumber !== newBank.confirmAccountNumber) {
      toast.error('Account numbers do not match');
      return;
    }

    setIsAddingBank(true);
    try {
      const res = await fetch(`${apiUrl}/wallet/business/${businessId}/banks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: newBank.accountName.trim(),
          accountNumber: newBank.accountNumber.trim(),
          ifscCode: newBank.ifscCode.trim().toUpperCase(),
          bankName: newBank.bankName.trim()
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to add bank account');
      }

      toast.success('Bank account linked successfully!');
      setIsAddBankModalOpen(false);
      setNewBank({
        accountName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        bankName: ''
      });
      fetchWalletData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to link bank account');
    } finally {
      setIsAddingBank(false);
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Type Filter
      if (filterType !== 'ALL') {
        if (filterType === 'CREDIT' && t.type !== 'CREDIT') return false;
        if (filterType === 'SETTLEMENT' && t.type !== 'SETTLEMENT') return false;
        if (filterType === 'DEBIT' && (t.type !== 'DEBIT' && t.type !== 'WITHDRAWAL')) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ref = (t.referenceId || '').toLowerCase();
        const refType = (t.referenceType || '').toLowerCase();
        const pRef = (t.paymentRef || '').toLowerCase();
        if (!ref.includes(q) && !refType.includes(q) && !pRef.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, filterType, searchQuery]);

  const owedAmount = wallet?.owedToPlatform ?? 0;
  const availBalance = wallet?.availableBalance ?? 0;
  const pendBalance = wallet?.pendingBalance ?? 0;
  const totalEarned = wallet?.totalEarnings ?? 0;
  const withdrawnTotal = wallet?.withdrawn ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300 font-sans pb-16">
      
      {/* 1. TOP HEADER & QUICK ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Seller Wallet & Payouts
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Manage earnings, settle platform commission fees, and request direct bank payouts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => fetchWalletData(true)}
            disabled={isRefreshing}
            className="p-2.5 sm:px-3 sm:py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Refresh balances"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Settle Commission Fee Button */}
          <button
            type="button"
            onClick={() => setIsSettleModalOpen(true)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
              owedAmount > 0
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/25 ring-2 ring-amber-400/30 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Settle Commission ({owedAmount > 0 ? `₹${owedAmount.toLocaleString('en-IN')}` : '₹0'})</span>
          </button>

          {/* Withdraw Funds Button */}
          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw to Bank</span>
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC 5-METRIC FINANCIAL KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Metric 1: Available Balance */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">Available Balance</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₹{availBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ready for bank payout
          </div>
        </div>

        {/* Metric 2: Commission Fee Due (Owed to Platform) */}
        <div className={`rounded-2xl p-4 sm:p-5 border shadow-2xs relative overflow-hidden transition-all ${
          owedAmount > 0 
            ? 'bg-amber-50/60 border-amber-300/80 ring-1 ring-amber-300/50' 
            : 'bg-white border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">Commission Dues</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${owedAmount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black tracking-tight ${owedAmount > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
            ₹{owedAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-semibold mt-1 flex items-center justify-between">
            <span className={owedAmount > 0 ? 'text-amber-700 font-bold' : 'text-slate-400'}>
              {owedAmount > 0 ? '● Pending settlement' : '✓ All clear (0 dues)'}
            </span>
            {owedAmount > 0 && (
              <button 
                onClick={() => setIsSettleModalOpen(true)}
                className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-0.5 rounded-md cursor-pointer"
              >
                Settle
              </button>
            )}
          </div>
        </div>

        {/* Metric 3: Pending Settlement */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Settlement</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₹{pendBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Maturing in T+1 cycle
          </div>
        </div>

        {/* Metric 4: Lifetime Earnings */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">Lifetime Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₹{totalEarned.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1">
            Total sales volume
          </div>
        </div>

        {/* Metric 5: Total Withdrawn */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">Withdrawn Payouts</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₹{withdrawnTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Transferred to bank
          </div>
        </div>

      </div>

      {/* 3. COMMISSION FEE BANNER WITH INSTANT SETTLE SHORTCUT */}
      {owedAmount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow-md shadow-amber-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-950 text-sm sm:text-base">
                Platform Commission Fee Settlement Required (₹{owedAmount.toLocaleString('en-IN')})
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5 leading-relaxed">
                You have ₹{owedAmount.toLocaleString('en-IN')} in unpaid platform commission fees from completed orders/tokens. Settle via your available balance or online checkout to keep your storefront active without interruption.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSettleModalOpen(true)}
            className="w-full md:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-amber-600/20 shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Settle ₹{owedAmount.toLocaleString('en-IN')} Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. CONNECTED BANK ACCOUNTS SECTION */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Linked Bank Accounts</h2>
              <p className="text-xs text-slate-500">Destination accounts for your revenue withdrawals & settlements</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddBankModalOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Link Bank Account
          </button>
        </div>

        {banks.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">No Bank Account Linked Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Add your current or savings business bank account to receive automatic settlements and withdraw your wallet earnings.
            </p>
            <button
              type="button"
              onClick={() => setIsAddBankModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              + Link Your Bank Account Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {banks.map((bank, idx) => (
              <div 
                key={bank.id} 
                className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 bg-slate-50/40 hover:bg-white transition-all relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{bank.bankName}</span>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/50">
                        Primary
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-medium">Account Holder</div>
                <div className="text-sm font-bold text-slate-800 mb-2 truncate">{bank.accountName}</div>

                <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-200/60 font-mono">
                  <span>A/C: •••• {bank.accountNumber.slice(-4)}</span>
                  <span>IFSC: {bank.ifscCode || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. TRANSACTION LEDGER & SETTLEMENT HISTORY */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Ledger & Settlement Statement</h2>
            <p className="text-xs text-slate-500">Chronological history of sales credits, commission fee deductions, and bank payouts</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Filter Pills */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterType === 'ALL' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('CREDIT')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterType === 'CREDIT' ? 'bg-white text-emerald-600 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Earnings
              </button>
              <button
                type="button"
                onClick={() => setFilterType('SETTLEMENT')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterType === 'SETTLEMENT' ? 'bg-white text-amber-600 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Commissions
              </button>
              <button
                type="button"
                onClick={() => setFilterType('DEBIT')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterType === 'DEBIT' ? 'bg-white text-purple-600 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Payouts
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ref ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all w-full sm:w-40"
              />
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 border border-slate-100 rounded-2xl bg-slate-50/40">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">No Ledger Transactions Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Transactions from sales, commission settlements, and bank withdrawals will be recorded here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="pb-3 pl-2">Date & Time</th>
                  <th className="pb-3">Reference / Type</th>
                  <th className="pb-3 text-right">Gross Amount</th>
                  <th className="pb-3 text-right">Commission Fee</th>
                  <th className="pb-3 text-right">Net Amount</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(tx => {
                  const isCredit = tx.type === 'CREDIT';
                  const isSettlement = tx.type === 'SETTLEMENT';
                  const isWithdrawal = tx.type === 'DEBIT' || tx.type === 'WITHDRAWAL';
                  
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pl-2 text-slate-500 font-medium whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td className="py-3.5">
                        <div className="font-bold text-slate-800">
                          {tx.referenceType === 'COMMISSION_SETTLEMENT' 
                            ? 'Platform Commission Settlement'
                            : (tx.referenceType || tx.type)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {tx.referenceId || tx.paymentRef || tx.id}
                        </div>
                      </td>

                      <td className="py-3.5 text-right font-medium text-slate-700">
                        ₹{tx.grossAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 text-right font-medium text-amber-600">
                        {tx.platformFee > 0 ? `-₹${tx.platformFee.toLocaleString('en-IN')}` : '₹0'}
                      </td>

                      <td className="py-3.5 text-right font-extrabold text-sm">
                        <span className={isCredit ? 'text-emerald-600' : isSettlement ? 'text-amber-700' : 'text-purple-600'}>
                          {isCredit ? '+' : '-'}₹{tx.netAmount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'COMPLETED' || tx.status === 'SETTLED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. TRANSPARENCY & COMMISSION POLICY CARD */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                ℹ️
              </span>
              <h3 className="text-base sm:text-lg font-bold">MarkatVerse Marketplace Commission Policy</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Standard platform commission is <strong className="text-blue-400 font-bold">{commissionRate}%</strong> on successful customer sales and service tokens. Commission helps power marketplace listing distribution, secure payment gateways, automated customer SMS/token queues, and 24x7 merchant support.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shrink-0 text-xs space-y-1.5 w-full md:w-auto">
            <div className="flex justify-between gap-4 text-slate-300">
              <span>Standard Commission Rate:</span>
              <strong className="text-white font-mono">{commissionRate}%</strong>
            </div>
            <div className="flex justify-between gap-4 text-slate-300">
              <span>Automated Payout Cycle:</span>
              <strong className="text-white font-mono">T+1 Daily</strong>
            </div>
            <div className="flex justify-between gap-4 text-slate-300">
              <span>Bank Transfer Gateway:</span>
              <strong className="text-emerald-400 font-mono">NEFT / IMPS</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: SETTLE COMMISSION FEE MODAL */}
      {/* ======================================================== */}
      {isSettleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Settle Commission Fees</h3>
                  <p className="text-xs text-slate-500">Clear platform commission dues</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettleModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Dues Display */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 mb-5 text-center">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Total Outstanding Commission</span>
              <div className="text-3xl font-black text-amber-900">
                ₹{owedAmount.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-amber-700 mt-1 block">
                Includes all completed queue tokens and product order commissions
              </span>
            </div>

            {/* Settlement Method Selection */}
            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Select Settlement Method
              </label>

              {/* Method A: Deduct from Available Balance */}
              <label 
                className={`border-2 rounded-2xl p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                  settleMethod === 'balance' 
                    ? 'border-blue-600 bg-blue-50/50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="settle_method"
                  checked={settleMethod === 'balance'} 
                  onChange={() => setSettleMethod('balance')}
                  className="mt-1 text-blue-600 focus:ring-blue-500" 
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">Deduct from Wallet Balance</span>
                    <span className="text-xs font-bold text-slate-600">₹{availBalance.toLocaleString('en-IN')} avail</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {availBalance >= owedAmount 
                      ? 'Instant 1-click settlement from your earnings.'
                      : 'Insufficient balance. Please choose Online Payment below.'}
                  </p>
                </div>
              </label>

              {/* Method B: Pay Online (UPI / Card) */}
              <label 
                className={`border-2 rounded-2xl p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                  settleMethod === 'online' 
                    ? 'border-blue-600 bg-blue-50/50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="settle_method"
                  checked={settleMethod === 'online'} 
                  onChange={() => setSettleMethod('online')}
                  className="mt-1 text-blue-600 focus:ring-blue-500" 
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">Pay Online via UPI / Card</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">Instant</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay using GPay, PhonePe, Paytm, RuPay, or Debit/Credit Card.
                  </p>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSettleModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSettleCommission}
                disabled={isSettling || owedAmount <= 0}
                className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-amber-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isSettling ? 'Settling Dues...' : `Pay ₹${owedAmount.toLocaleString('en-IN')} & Settle`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: WITHDRAW FUNDS MODAL */}
      {/* ======================================================== */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Request Bank Payout</h3>
                  <p className="text-xs text-slate-500">Transfer available wallet funds to your bank</p>
                </div>
              </div>
              <button 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Available Balance Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available for Payout</span>
                <span className="text-2xl font-black text-slate-900">₹{availBalance.toLocaleString('en-IN')}</span>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawAmount(String(availBalance))}
                className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Withdraw Max
              </button>
            </div>

            {/* Amount Input */}
            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Withdrawal Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 pl-8 text-slate-900 text-base font-bold focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* Preset Chips */}
              <div className="flex gap-2">
                {[0.25, 0.5, 0.75, 1].map(pct => {
                  const val = Math.floor(availBalance * pct);
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setWithdrawAmount(String(val))}
                      className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      {pct * 100}%
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bank Selection */}
            <div className="space-y-2 mb-6">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Destination Bank Account
              </label>
              {banks.length === 0 ? (
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs">
                  Please link a bank account before requesting a payout.
                </div>
              ) : (
                <select
                  value={selectedBankId}
                  onChange={e => setSelectedBankId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {banks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} - •••• {b.accountNumber.slice(-4)} ({b.accountName})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRequestWithdrawal}
                disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || banks.length === 0}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isWithdrawing ? 'Processing Payout...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: LINK BANK ACCOUNT MODAL */}
      {/* ======================================================== */}
      {isAddBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Link Business Bank Account</h3>
                  <p className="text-xs text-slate-500">For direct settlements and revenue payouts</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddBankModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBankAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navneet Kumar / Store Name"
                  value={newBank.accountName}
                  onChange={e => setNewBank({ ...newBank, accountName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank, SBI, ICICI"
                  value={newBank.bankName}
                  onChange={e => setNewBank({ ...newBank, bankName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Account Number *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter account number"
                    value={newBank.accountNumber}
                    onChange={e => setNewBank({ ...newBank, accountNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Confirm Account *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Re-enter account"
                    value={newBank.confirmAccountNumber}
                    onChange={e => setNewBank({ ...newBank, confirmAccountNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC0000123"
                  value={newBank.ifscCode}
                  onChange={e => setNewBank({ ...newBank, ifscCode: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBankModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isAddingBank}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isAddingBank ? 'Verifying...' : 'Link Bank Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
