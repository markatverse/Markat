"use client";

import React, { useState } from 'react';
import { Search, Send, CheckCircle, MessageCircle, PhoneCall, Filter, User } from 'lucide-react';
import toast from 'react-hot-toast';

type ChatSession = {
  id: string;
  customerName: string;
  type: 'chat' | 'call';
  status: 'active' | 'waiting' | 'resolved';
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: { sender: 'admin' | 'user', text: string, time: string }[];
};



export default function LiveChatDeskPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'waiting' | 'resolved'>('all');

  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const filteredSessions = sessions.filter(s => filter === 'all' || s.status === filter);

  React.useEffect(() => {
    const loadSessions = () => {
      try {
        const stored = localStorage.getItem('MV_LIVE_CHATS');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Filter out old dummy data without wiping real data
            const hasDummy = parsed.some((s: any) => s.id === 'CH-1001' && s.customerName === 'Aarav Sharma');
            if (hasDummy) {
              const cleaned = parsed.filter((s: any) => !(s.id === 'CH-1001' || s.id === 'CH-1002' || s.id === 'CH-1003'));
              localStorage.setItem('MV_LIVE_CHATS', JSON.stringify(cleaned));
              setSessions(cleaned);
            } else {
              setSessions(parsed);
            }
          } else {
            setSessions([]);
          }
        } else {
          localStorage.setItem('MV_LIVE_CHATS', JSON.stringify([]));
          setSessions([]);
        }
      } catch {
        setSessions([]);
      }
    };
    
    loadSessions();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'MV_LIVE_CHATS' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setSessions(parsed);
          }
        } catch {}
      }
    };

    const handleCustomSync = () => {
      loadSessions();
    };
    
    const syncInterval = setInterval(loadSessions, 1000);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('MV_CHAT_SYNC', handleCustomSync);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('MV_CHAT_SYNC', handleCustomSync);
    };
  }, []);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !selectedSessionId) return;
    
    const stored = localStorage.getItem('MV_LIVE_CHATS');
    const currentSessions = stored ? JSON.parse(stored) : sessions;
    
    const updatedSessions = currentSessions.map((s: any) => {
      if (s.id === selectedSessionId) {
        return {
          ...s,
          lastMessage: currentMessage,
          messages: [...(s.messages || []), { sender: 'admin' as const, text: currentMessage, time: 'Just now' }]
        };
      }
      return s;
    });
    
    setSessions(updatedSessions);
    localStorage.setItem('MV_LIVE_CHATS', JSON.stringify(updatedSessions));
    setCurrentMessage('');
    window.dispatchEvent(new Event('MV_CHAT_SYNC'));
  };

  const handleResolveSession = () => {
    if (!selectedSessionId) return;
    
    const stored = localStorage.getItem('MV_LIVE_CHATS');
    const currentSessions = stored ? JSON.parse(stored) : sessions;
    
    const updatedSessions = currentSessions.map((s: any) => {
      if (s.id === selectedSessionId) {
        return { ...s, status: 'resolved' as const, unreadCount: 0 };
      }
      return s;
    });
    
    setSessions(updatedSessions);
    localStorage.setItem('MV_LIVE_CHATS', JSON.stringify(updatedSessions));
    toast.success('Session marked as resolved');
    window.dispatchEvent(new Event('MV_CHAT_SYNC'));
  };

  const handleClearData = () => {
    localStorage.removeItem('MV_LIVE_CHATS');
    setSessions([]);
    setSelectedSessionId(null);
    window.dispatchEvent(new Event('MV_CHAT_SYNC'));
    toast.success('All test data cleared!');
  };

  return (
    <div className="w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)] -m-4 lg:-m-6 p-4 lg:p-6 bg-slate-950 animate-in fade-in duration-500 h-[calc(100vh-65px)] lg:h-screen flex flex-col min-h-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white tracking-tight">Live Chat Desk</h1>
          <p className="text-slate-400 text-sm mt-1">Manage real-time customer conversations and call requests.</p>
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'waiting', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors ${filter === status ? 'bg-blue-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 border border-white/5'}`}
            >
              {status}
            </button>
          ))}
          <button
            onClick={handleClearData}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors ml-4"
          >
            Clear Test Data
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* Sessions List */}
        <div className="w-full lg:w-1/3 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
          <div className="p-3 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-blue-500" /> Active Queues
            </h2>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredSessions.map(session => (
              <button 
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className={`w-full text-left p-3 rounded-2xl transition-all duration-300 flex gap-3 group ${selectedSessionId === session.id ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/5 border-l-4 border-blue-500 shadow-sm' : 'bg-transparent hover:bg-slate-800/50 border-l-4 border-transparent'}`}
              >
                <div className="relative">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105 ${session.type === 'chat' ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30' : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                    {session.type === 'chat' ? <MessageCircle className="w-5 h-5" /> : <PhoneCall className="w-5 h-5" />}
                  </div>
                  {session.status === 'active' && (
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
                    </span>
                  )}
                  {session.status === 'waiting' && (
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-slate-900"></span>
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-bold text-sm text-white truncate">{session.customerName}</h3>
                    <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{session.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-400 truncate">{session.lastMessage}</p>
                    {session.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center ml-2 shrink-0">
                        {session.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {filteredSessions.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No sessions found for this filter.
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-base">{selectedSession.customerName}</h2>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="font-mono text-xs bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded text-slate-300 shadow-sm">{selectedSession.id}</span>
                      <span className={`relative flex h-2 w-2`}>
                        {selectedSession.status === 'active' || selectedSession.status === 'waiting' ? (
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedSession.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        ) : null}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${selectedSession.status === 'active' ? 'bg-emerald-500' : selectedSession.status === 'waiting' ? 'bg-amber-500' : 'bg-slate-600'}`}></span>
                      </span>
                      <span className="capitalize font-medium">{selectedSession.status}</span>
                      {selectedSession.phone && (
                        <>
                          <span className="text-slate-600">•</span>
                          <a href={`tel:${selectedSession.phone}`} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors font-mono">
                            <PhoneCall className="w-3 h-3" /> {selectedSession.phone}
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  {selectedSession.status !== 'resolved' && (
                    <button 
                      onClick={handleResolveSession}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Resolved
                    </button>
                  )}
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col bg-[#0b1120]">
                {selectedSession.messages.map((msg, idx) => (
                  <div key={idx} className={`max-w-[75%] flex flex-col ${msg.sender === 'admin' ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'admin' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm border border-blue-500/50' : 'bg-slate-800 border border-slate-700/50 text-slate-200 rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-slate-950/50 border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={selectedSession.status === 'resolved' ? 'Session resolved. Cannot send messages.' : 'Type your reply...'}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={selectedSession.status === 'resolved'}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={selectedSession.status === 'resolved' || !currentMessage.trim()}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full"></div>
              <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center mb-6 relative z-10 shadow-xl">
                <MessageCircle className="w-10 h-10 text-blue-500/50" />
              </div>
              <p className="font-bold text-lg text-slate-300 relative z-10">No Session Selected</p>
              <p className="text-sm mt-2 relative z-10 text-slate-500">Choose a conversation from the active queue to start assisting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
