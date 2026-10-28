"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Scissors, User, Phone, ChevronRight, Clock, Users, Star, ArrowLeft, Loader2 } from "lucide-react";

import { getApiUrl } from "@/utils/api";

const API = getApiUrl();

const SERVICES = [
  { name: "Haircut", icon: "✂️", time: "20 min" },
  { name: "Shave", icon: "🪒", time: "15 min" },
  { name: "Hair Color", icon: "🎨", time: "60 min" },
  { name: "Beard Trim", icon: "🧔", time: "10 min" },
  { name: "Facial", icon: "✨", time: "30 min" },
  { name: "Head Massage", icon: "💆", time: "20 min" },
];

interface Queue {
  id: string;
  shopName: string;
  currentToken: number;
  lastToken: number;
  avgMinutes: number;
  isOpen: boolean;
}

interface TokenResult {
  token: { id: string; tokenNumber: number; service: string; customerName: string };
  estimatedWaitMin: number;
  ahead: number;
}

export default function SalonJoinPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [step, setStep] = useState<"select" | "form" | "success">("select");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("Haircut");
  const [loading, setLoading] = useState(false);
  const [loadingQueues, setLoadingQueues] = useState(true);
  const [result, setResult] = useState<TokenResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/service-queue/queues`)
      .then((r) => r.json())
      .then((data) => {
        setQueues(Array.isArray(data) ? data : []);
        setLoadingQueues(false);
      })
      .catch(() => setLoadingQueues(false));
  }, []);

  async function handleJoin() {
    if (!name.trim()) { setError("Please enter your name"); return; }
    if (!selectedQueue) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/service-queue/${selectedQueue.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name.trim(), phone: phone.trim() || undefined, service }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to join");
      setResult(data);
      setStep("success");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">

      {/* Background blur blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/30 backdrop-blur border border-purple-500/30 rounded-2xl mb-4 shadow-xl">
            <Scissors className="w-8 h-8 text-purple-300" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Smart Queue</h1>
          <p className="text-purple-300/80 mt-1 font-medium">Walk in · Get a token · Relax</p>
        </div>

        {/* STEP 1: Select Salon */}
        {step === "select" && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" /> Choose Your Salon
            </h2>

            {loadingQueues ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            ) : queues.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 mb-4">No salon queues open right now.</p>
                <Link href="/salon/manage" className="text-purple-400 underline text-sm">
                  Are you a salon owner? Set up your queue →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {queues.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => { setSelectedQueue(q); setStep("form"); }}
                    className="w-full bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-400/40 rounded-2xl p-4 flex items-center justify-between transition-all duration-200 group"
                  >
                    <div className="text-left">
                      <div className="text-white font-bold text-base">{q.shopName}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-purple-300 text-sm flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {q.lastToken - q.currentToken} waiting
                        </span>
                        <span className="text-slate-400 text-sm flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> ~{q.avgMinutes} min/person
                        </span>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full mr-1 ${q.isOpen ? "bg-emerald-400 shadow-lg shadow-emerald-400/50" : "bg-red-400"}`} />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-white/10 text-center">
              <Link href="/salon/manage" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                📺 View Live Queue Board →
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: Fill Form */}
        {step === "form" && selectedQueue && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <button onClick={() => setStep("select")} className="flex items-center gap-1 text-purple-300 hover:text-white mb-5 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="bg-purple-600/20 border border-purple-400/20 rounded-2xl px-4 py-3 mb-6">
              <div className="text-purple-200 text-xs font-semibold uppercase tracking-wider mb-0.5">Joining queue at</div>
              <div className="text-white font-bold text-lg">{selectedQueue.shopName}</div>
              <div className="text-purple-300 text-sm">Currently serving #{selectedQueue.currentToken}</div>
            </div>

            {/* Service picker */}
            <div className="mb-5">
              <label className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3 block">Select Service</label>
              <div className="grid grid-cols-3 gap-2">
                {SERVICES.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setService(s.name)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 ${
                      service === s.name
                        ? "bg-purple-600 border-purple-400 shadow-lg shadow-purple-600/30"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <span className={`text-xs font-bold ${service === s.name ? "text-white" : "text-slate-300"}`}>{s.name}</span>
                    <span className={`text-[10px] ${service === s.name ? "text-purple-200" : "text-slate-500"}`}>{s.time}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-2 block">Your Name *</label>
              <div className="flex items-center bg-white/5 border border-white/15 focus-within:border-purple-400 rounded-xl px-4 transition-colors">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent py-3 px-3 text-white placeholder-slate-500 outline-none font-medium"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-2 block">Phone (optional)</label>
              <div className="flex items-center bg-white/5 border border-white/15 focus-within:border-purple-400 rounded-xl px-4 transition-colors">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent py-3 px-3 text-white placeholder-slate-500 outline-none font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-400/30 text-red-300 rounded-xl px-4 py-3 text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
              {loading ? "Getting your token..." : "Get My Token 🎫"}
            </button>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === "success" && result && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl text-center">
            
            {/* Token Number */}
            <div className="mb-6">
              <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Your Token Number</div>
              <div className="relative inline-flex items-center justify-center">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-2xl shadow-purple-600/40 flex items-center justify-center">
                  <div>
                    <div className="text-white/60 text-xs font-bold tracking-wider"># TOKEN</div>
                    <div className="text-white text-6xl font-black leading-none">{result.token.tokenNumber}</div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-white font-black text-2xl mb-1">You&apos;re in the queue!</h2>
            <p className="text-purple-300 mb-6">
              {result.ahead === 0
                ? "🎉 You're next up! Head in now."
                : `${result.ahead} ${result.ahead === 1 ? "person" : "people"} ahead of you`}
            </p>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <div className="text-white font-bold text-xl">{result.estimatedWaitMin} min</div>
                <div className="text-slate-400 text-xs">Est. wait time</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl mb-1">{SERVICES.find(s => s.name === result.token.service)?.icon ?? "✂️"}</div>
                <div className="text-white font-bold text-sm">{result.token.service}</div>
                <div className="text-slate-400 text-xs">Selected service</div>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              💡 Go grab a coffee or shop nearby — come back in time!
            </p>

            <div className="space-y-3">
              <Link
                href={`/salon/token/${result.token.id}`}
                className="block w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-purple-600/30 text-center"
              >
                📍 Track My Token Live
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
