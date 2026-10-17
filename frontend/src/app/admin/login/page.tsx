"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      const role = user.role?.toUpperCase();
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        router.replace('/admin');
      } else if (['SELLER', 'BUSINESS'].includes(role)) {
        router.replace('/seller/dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [user, router]);

  const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      if (data.user.role.toUpperCase() !== 'SUPER_ADMIN' && data.user.role.toUpperCase() !== 'ADMIN') {
        throw new Error('Unauthorized. Admin access required.');
      }

      login(
        { 
          id: data.user.id, 
          name: data.user.name, 
          email: data.user.email, 
          role: data.user.role.toLowerCase() as any, 
          phone: data.user.phone || '' 
        },
        data.access_token
      );
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:bg-white transition-all text-sm";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";
  const btnPrimary = "w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 flex">
      
      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex w-[480px] bg-gradient-to-br from-slate-900 via-slate-950 to-neutral-950 relative overflow-hidden flex-col justify-between p-10 shrink-0 border-r border-slate-800 shadow-2xl">
        
        {/* Top Bar: Back & Tag */}
        <div className="relative z-20 flex items-center justify-between pb-4">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>

          <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            Internal Console
          </span>
        </div>

        {/* Decorative Ambient Background Rings */}
        <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] border border-amber-500/10 rounded-full pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[420px] h-[420px] border border-amber-500/10 rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Main Content (Balanced Spacing, No Dead Gap) */}
        <div className="relative z-10 flex flex-col justify-center my-auto py-4">
          
          {/* Prominent High-Visibility Brand Logo */}
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-md">
              <img 
                src="/logo.png" 
                alt="MarkatVerse" 
                className="h-12 w-auto brightness-0 invert object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-base font-extrabold tracking-wide uppercase">
                MarkatVerse
              </span>
              <span className="text-amber-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                Admin Control Center
              </span>
            </div>
          </div>

          {/* Security Chip */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-md border border-amber-500/25 rounded-full px-3.5 py-1.5 w-fit mb-5 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-200 text-xs font-medium">
              Authorized Personnel Access Only
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-3 tracking-tight">
            Platform Command & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-orange-300">
              Operations Center
            </span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Real-time management for marketplace sellers, inventory catalog, automated financial settlements, and security governance.
          </p>
          
          {/* Features */}
          <div className="space-y-2.5">
            {[
              { icon: '🛡️', title: 'Seller & Business Verification', desc: 'Onboard and verify KYC with audit tracking' },
              { icon: '📊', title: 'Platform Real-Time Analytics', desc: 'Live gross merchandise value and active sessions' },
              { icon: '💰', title: 'Settlements & Escrow Payouts', desc: 'Automated gateway reconciliation and taxes' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:border-amber-500/30 transition-colors">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-base shrink-0">{f.icon}</div>
                <div>
                  <div className="text-white text-xs font-bold">{f.title}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-slate-400 text-xs">
          <span>🔒 256-bit Encrypted</span>
          <span>🛡️ 2FA Hardware Ready</span>
          <span>📋 Immutable Audit Log</span>
        </div>
      </div>

      {/* ── Right Form Panel (Expanded Comfortable Width) ── */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center p-6 pt-12 lg:p-12 overflow-y-auto relative">
        <div className="w-full max-w-[520px]">
          
          {/* Mobile Header (Logo & Back) */}
          <div className="lg:hidden w-full flex items-center justify-between mb-10">
            <Link href="/" className="text-slate-400 hover:text-amber-600 p-2 -ml-2">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex flex-col items-center">
              <img src="/logo.png" alt="MarkatVerse" className="h-12 object-contain" />
              <div className="text-amber-600 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">Admin Portal</div>
            </div>
            <div className="w-10"></div> {/* Spacer to balance flex-between */}
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-1">Secure Admin Login</h2>
            <p className="text-slate-500 text-sm">Authorized Personnel Only</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className={labelCls}>Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com" 
                  className={inputCls} 
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  className={`${inputCls} pr-11`} 
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" disabled={isLoading || email.length < 5}
              className={btnPrimary}
            >
              {isLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Authenticating...</>
              ) : (
                <>Secure Login <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link href="/login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              ← Return to Main Portal
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
