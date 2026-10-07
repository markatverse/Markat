"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Ticket, ArrowLeft, ArrowRight, Clock, Stethoscope, Scissors, Wrench, MapPin, 
  Search, User, Calendar, AlertCircle, CheckCircle2,
  XCircle, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export interface TokenItem {
  id: string;
  serviceName: string;
  shopName?: string;
  category?: string;
  tokenNumber: number;
  timestamp: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  price?: number;
  provider?: string;
  estimatedWaitMin?: number;
  ahead?: number;
}

const getCategoryEmoji = (category?: string) => {
  const c = category?.toLowerCase() || '';
  if (c.includes('doctor') || c.includes('clinic') || c.includes('health') || c.includes('medical')) return '⚕️';
  if (c.includes('salon') || c.includes('hair') || c.includes('barber')) return '✂️';
  if (c.includes('beauty') || c.includes('spa') || c.includes('parlor') || c.includes('makeup')) return '💅';
  if (c.includes('repair') || c.includes('mechanic') || c.includes('garage') || c.includes('auto')) return '🛠️';
  if (c.includes('astrologer') || c.includes('astro') || c.includes('tarot')) return '🔮';
  if (c.includes('ca') || c.includes('accountant') || c.includes('tax') || c.includes('finance')) return '💼';
  if (c.includes('restaurant') || c.includes('food') || c.includes('cafe')) return '🍽️';
  if (c.includes('gym') || c.includes('fitness') || c.includes('yoga')) return '🏋️';
  if (c.includes('education') || c.includes('tutor') || c.includes('class') || c.includes('school')) return '🎓';
  if (c.includes('cleaning') || c.includes('maid') || c.includes('housekeeping')) return '🧹';
  if (c.includes('real_estate') || c.includes('property') || c.includes('broker')) return '🏠';
  if (c.includes('lawyer') || c.includes('legal') || c.includes('advocate')) return '⚖️';
  if (c.includes('pet') || c.includes('vet') || c.includes('grooming')) return '🐾';
  if (c.includes('event') || c.includes('party') || c.includes('wedding')) return '🎉';
  if (c.includes('tech') || c.includes('computer') || c.includes('it')) return '💻';
  return '📌';
};

export default function CustomerBookingsDashboard() {
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard State
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Completed' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        let activeTokenMeta: any[] = [];
        const stored = localStorage.getItem('markatverse_active_tokens');
        if (stored) {
          activeTokenMeta = JSON.parse(stored);
        } else {
          const singleToken = localStorage.getItem('markatverse_active_token_id');
          if (singleToken) {
            activeTokenMeta = [{ id: singleToken }];
          }
        }

        // Fetch live data for all tokens
        const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
        
        const tokenPromises = activeTokenMeta.map(async (meta) => {
          try {
            const res = await fetch(`${API}/service-queue/token/${meta.id}`);
            if (!res.ok) return null; // Token deleted or not found
            
            const data = await res.json();
            
            // Map the backend status to our frontend UI status
            let uiStatus: 'Pending' | 'Completed' | 'Cancelled' = 'Pending';
            if (data.token.status === 'DONE' || data.token.status === 'COMPLETED') uiStatus = 'Completed';
            if (data.token.status === 'NO_SHOW' || data.token.status === 'CANCELLED') uiStatus = 'Cancelled';
            
            return {
              id: meta.id,
              serviceName: data.token.service || meta.serviceName || 'Service',
              shopName: data.queue?.shopName || meta.shopName || 'Store',
              category: meta.category || 'general',
              tokenNumber: data.token.tokenNumber || meta.tokenNumber,
              timestamp: data.token.joinedAt || meta.timestamp || new Date().toISOString(),
              status: uiStatus,
              price: data.token.price || meta.price || 0,
              provider: data.token.staffName || meta.provider || 'Unassigned',
              estimatedWaitMin: data.estimatedWaitMin || 0,
              ahead: data.ahead || 0
            } as TokenItem;
          } catch {
            return null;
          }
        });

        const results = await Promise.all(tokenPromises);
        const validTokens = results.filter((t): t is TokenItem => t !== null);
        
        // Sort by newest first
        validTokens.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setTokens(validTokens);
        if (validTokens.length > 0) {
          setSelectedTokenId(validTokens[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTokens();
    
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter Logic
  const filteredTokens = useMemo(() => {
    return tokens.filter(t => {
      const matchesTab = activeTab === 'All' || t.status === activeTab;
      const matchesSearch = 
        t.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.shopName && t.shopName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.tokenNumber.toString().includes(searchQuery);
      return matchesTab && matchesSearch;
    });
  }, [tokens, activeTab, searchQuery]);

  const selectedToken = useMemo(() => {
    return tokens.find(t => t.id === selectedTokenId) || null;
  }, [tokens, selectedTokenId]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">Loading your bookings...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-blue-600" /> 
                  Tokens & Bookings
                </h1>
                <p className="text-sm text-slate-500 font-medium hidden sm:block">
                  Manage your active queue tokens and past appointment history.
                </p>
              </div>
            </div>
            <Link href="/explore" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm text-sm shrink-0 whitespace-nowrap self-start sm:self-auto">
              + New Booking
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ── STATS ROW ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">{tokens.length}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Total Bookings</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">{tokens.filter(t => t.status === 'Pending').length}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Pending</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">{tokens.filter(t => t.status === 'Completed').length}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Completed</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">{tokens.filter(t => t.status === 'Cancelled').length}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Cancelled</div>
            </div>
          </div>
        </div>

        {/* ── MAIN DASHBOARD LAYOUT ─────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT COLUMN: LIST */}
          <div className={`flex-[2] lg:min-w-[60%] flex flex-col gap-4 ${selectedTokenId ? 'hidden lg:flex' : 'flex'}`}>
            
            {/* Toolbar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search by shop, service, or token..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide shrink-0">
                {(['All', 'Pending', 'Completed', 'Cancelled'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {filteredTokens.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No bookings found</h3>
                  <p className="text-slate-500">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {/* Table Header (Desktop Only) */}
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-3">Token / Shop</div>
                    <div className="col-span-3">Service</div>
                    <div className="col-span-3">Date & Time</div>
                    <div className="col-span-3">Status</div>
                  </div>

                  {/* Rows */}
                  {filteredTokens.map(token => {
                    const isSelected = selectedTokenId === token.id;
                    
                    let StatusIcon = Clock;
                    let statusColor = "bg-amber-100 text-amber-700";
                    if (token.status === 'Completed') {
                      StatusIcon = CheckCircle2;
                      statusColor = "bg-emerald-100 text-emerald-700";
                    } else if (token.status === 'Cancelled') {
                      StatusIcon = XCircle;
                      statusColor = "bg-red-100 text-red-700";
                    }

                    return (
                      <div 
                        key={token.id}
                        onClick={() => setSelectedTokenId(token.id)}
                        className={`p-4 cursor-pointer transition-all border-l-4 ${
                          isSelected 
                            ? 'bg-blue-100 border-blue-600 shadow-sm scale-[1.01] rounded-r-xl relative z-10' 
                            : 'border-transparent hover:bg-blue-50 hover:border-blue-300 opacity-90 hover:opacity-100'
                        }`}
                      >
                        {/* Mobile Layout */}
                        <div className="md:hidden flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isSelected ? 'bg-white text-blue-700 shadow-sm' : 'bg-slate-100 text-slate-700'}`}>
                                #{token.tokenNumber || '-'}
                              </div>
                              <div>
                                <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                  <span className="text-[10px]">{getCategoryEmoji(token.category)}</span>
                                  {token.shopName || 'Unknown Shop'}
                                </div>
                                <div className="font-bold text-slate-900 text-sm">{token.serviceName}</div>
                              </div>
                            </div>
                            <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${statusColor}`}>
                              <StatusIcon className="w-3 h-3" /> {token.status}
                            </div>
                          </div>
                          <div className={`flex items-center gap-4 text-xs font-medium text-slate-500 p-2 rounded-lg border ${isSelected ? 'bg-white/50 border-blue-200' : 'bg-white border-slate-100'}`}>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(token.timestamp).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(token.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-3 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${isSelected ? 'bg-white text-blue-700 shadow-sm' : 'bg-slate-100 text-slate-700'}`}>
                              #{token.tokenNumber || '-'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                <span className="text-[12px]">{getCategoryEmoji(token.category)}</span>
                                {token.shopName || 'Unknown Shop'}
                              </div>
                              <div className="text-xs font-medium text-slate-500 truncate">Token #{token.tokenNumber}</div>
                            </div>
                          </div>
                          <div className="col-span-3 min-w-0">
                            <div className="font-bold text-slate-700 truncate">{token.serviceName}</div>
                            <div className="text-xs font-medium text-slate-500 truncate">₹{token.price}</div>
                          </div>
                          <div className="col-span-3 text-sm font-medium text-slate-600">
                            <div>{new Date(token.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric'})}</div>
                            <div className="text-xs text-slate-400">{new Date(token.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </div>
                          <div className="col-span-3 flex justify-between items-center">
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 inline-flex ${statusColor}`}>
                              <StatusIcon className="w-3.5 h-3.5" /> {token.status}
                            </div>
                            {isSelected && <ArrowRight className="w-5 h-5 text-blue-600" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILS PANEL */}
          {selectedToken && (
            <div className="flex-1 lg:max-w-[400px]">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm sticky top-[100px] overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => setSelectedTokenId(null)}
                      className="lg:hidden p-2 -ml-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-full text-slate-600 transition-colors shadow-sm shrink-0"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">Token #{selectedToken.tokenNumber || '-'}</h2>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        Created on {new Date(selectedToken.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start shrink-0 ${
                    selectedToken.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    selectedToken.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedToken.status}
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                  {/* Shop Details */}
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Service Center</h3>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                          {selectedToken.category?.toLowerCase().includes('doctor') ? <Stethoscope className="w-5 h-5 text-emerald-600" /> :
                           selectedToken.category?.toLowerCase().includes('salon') ? <Scissors className="w-5 h-5 text-purple-600" /> :
                           <Wrench className="w-5 h-5 text-blue-600" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{selectedToken.shopName || 'Unknown Shop'}</div>
                          <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Local Store
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Service Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm font-medium text-slate-600">Service</span>
                        <span className="text-sm font-bold text-slate-900">{selectedToken.serviceName}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm font-medium text-slate-600">Assigned To</span>
                        <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" /> {selectedToken.provider}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm font-medium text-slate-600">Price</span>
                        <span className="text-sm font-bold text-slate-900">₹{selectedToken.price}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-slate-600">Booking Type</span>
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">Live Token</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline Placeholder */}
                  {selectedToken.status === 'Pending' && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Timeline</h3>
                      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3">
                        <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                          <div className="text-sm font-bold text-amber-900">Waiting in Queue</div>
                          <div className="text-xs text-amber-700/80 mt-1">
                            {selectedToken.ahead !== undefined && selectedToken.ahead > 0 
                              ? `${selectedToken.ahead} people ahead of you.`
                              : "You are next in line!"}
                            {selectedToken.estimatedWaitMin !== undefined && ` Estimated wait: ~${selectedToken.estimatedWaitMin} mins.`}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                  {selectedToken.status === 'Pending' ? (
                    <>
                      <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                      <Link href={`/salon/token/${selectedToken.id}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20">
                        <ExternalLink className="w-4 h-4" /> Track Live
                      </Link>
                    </>
                  ) : (
                    <button className="w-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                      Book Again
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
