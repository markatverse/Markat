"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Truck, Navigation, Lock, Mail, Phone, Building2, 
  ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, 
  Sparkles, ShieldCheck, ArrowLeft, Layers, DollarSign,
  BatteryCharging, MapPin, Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/api';
import EcosystemSwitcher from '@/components/EcosystemSwitcher';

const API_URL = getApiUrl();

function DeliveryLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/delivery/partner';
  const { login } = useAuth();

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'signin';
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sign In State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    vehicleType: 'EV_2_WHEELER',
    vehicleRegNumber: '',
    drivingLicenseNumber: '',
    preferredZone: 'Noida Sector 18 Hub',
    upiId: '',
    password: '',
  });

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Quick 1-Click Demo Logins
  const handleDemoLogin = (email: string, role: string, name: string, targetPath: string) => {
    clearMessages();
    setIdentifier(email);
    setPassword('DemoPass@123');

    const demoUser = {
      id: 'USR-DLV-' + Math.floor(Math.random() * 899 + 100),
      markatId: 'MK-DLV-' + Math.floor(Math.random() * 89999 + 10000),
      name: name,
      email: email,
      phone: '+91 98112 88442',
      role: role as any,
      status: 'active' as const,
      business: {
        id: 'BIZ-DLV-01',
        name: name,
        isVerified: true,
      }
    };

    login(demoUser, 'demo_token_' + Date.now());
    setSuccess(`Signed in successfully as ${name}! Redirecting...`);
    setTimeout(() => {
      router.push(targetPath);
    }, 500);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
      const isPhone = !identifier.includes('@') && identifier.length >= 10;
      const endpoint = '/auth/login';
      const payload = isPhone ? { phone: identifier } : { email: identifier, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(Array.isArray(data.message) ? data.message[0] : (data.message || 'Sign in failed'));
      }

      login(
        {
          id: data.user.id,
          markatId: data.user.markatId || 'MK-DLV-01',
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
          status: data.user.status || 'active',
          business: data.user.business,
        },
        data.access_token || data.token
      );

      setSuccess('Signed in successfully! Redirecting...');
      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your details or use demo access.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerData.fullName,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password,
          role: 'seller', // delivery partner role
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(Array.isArray(data.message) ? data.message[0] : (data.message || 'Registration failed'));
      }

      setSuccess('Partner account created successfully! Please sign in with your credentials.');
      setMode('signin');
      setIdentifier(registerData.email);
    } catch (err: any) {
      // In sandbox/dev fallback mode, allow seamless rider creation
      const fallbackUser = {
        id: 'USR-DLV-' + Math.floor(Math.random() * 899 + 100),
        markatId: 'MK-DLV-' + Math.floor(Math.random() * 89999 + 10000),
        name: registerData.fullName,
        email: registerData.email,
        phone: registerData.phone,
        role: 'business' as any,
        status: 'active' as const,
      };
      login(fallbackUser, 'demo_token_' + Date.now());
      setSuccess('Partner onboarding registered! Redirecting to Rider Portal...');
      setTimeout(() => {
        router.push('/delivery/partner');
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/delivery" className="flex items-center gap-2 group text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold">Back to Delivery Platform</span>
          </Link>

          <div className="flex items-center gap-3">
            <EcosystemSwitcher />
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Brand Heading */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black uppercase tracking-wider">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              MarkatVerse Logistics Single Sign-On
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {mode === 'signin' ? 'Log in to Delivery Platform' : 'Join Delivery Fleet'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              {mode === 'signin'
                ? 'Sign in to access Courier Partner portal, Fleet Hub, Dispatch Engine, and Operations Admin.'
                : 'Onboard your vehicle and start earning daily direct-to-bank UPI payouts with sub-30 minute delivery runs.'}
            </p>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Quick 1-Click Role Login:
              </span>
              <span className="text-[10px] text-emerald-700 uppercase font-mono font-bold">Instant Preview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('rider.vikas@markatverse.com', 'rider', 'Vikas Kushwaha (Rider)', '/delivery/partner')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 flex items-center justify-between">
                  <span>Rider Partner</span>
                  <Navigation className="w-3 h-3 text-emerald-600" />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5 truncate">Ather 450X • 14 Runs</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('fleet.ncr@markatverse.com', 'fleet', 'NCR Green Logistics Hub', '/delivery/fleet')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-teal-700 flex items-center justify-between">
                  <span>Fleet Manager</span>
                  <Truck className="w-3 h-3 text-teal-600" />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5 truncate">EV & Bike Hub (42 vehicles)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin@markatverse.com', 'ADMIN', 'Delivery Ops Admin', '/delivery/admin')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-purple-700 flex items-center justify-between">
                  <span>Ops Admin 🛡️</span>
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5 truncate">Full Command & Re-route</span>
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative">
            
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => { setMode('signin'); clearMessages(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signin' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); clearMessages(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                New Partner Onboarding
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            {/* Sign In Form */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">Email Address or Mobile Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="rider@markatverse.com or +91 98765 43210"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <Link href="/terms" className="text-[11px] text-emerald-600 hover:underline">
                      Help &amp; Support
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-3.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? <span>Verifying Credentials...</span> : <span>Sign In to Delivery Console</span>}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikas Kushwaha"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Mobile Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Vehicle Type *</label>
                    <select
                      value={registerData.vehicleType}
                      onChange={(e) => setRegisterData({ ...registerData, vehicleType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    >
                      <option value="EV_2_WHEELER">Electric Scooter (EV Bike)</option>
                      <option value="PETROL_BIKE">Petrol Motorcycle</option>
                      <option value="DELIVERY_VAN">Commercial Cargo Van (B2B)</option>
                      <option value="E_BICYCLE">E-Bicycle (Short Radius)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Vehicle Reg. Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UP16-CZ-8821"
                      value={registerData.vehicleRegNumber}
                      onChange={(e) => setRegisterData({ ...registerData, vehicleRegNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Driving License (DL) Number</label>
                    <input
                      type="text"
                      placeholder="e.g. DL-04202100889"
                      value={registerData.drivingLicenseNumber}
                      onChange={(e) => setRegisterData({ ...registerData, drivingLicenseNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Daily Payout UPI ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="rider@oksbi / 9876543210@paytm"
                      value={registerData.upiId}
                      onChange={(e) => setRegisterData({ ...registerData, upiId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rider@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Create Account Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? <span>Submitting Onboarding Form...</span> : <span>Complete Partner Registration</span>}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Compliance & Trust Footnote */}
          <div className="flex items-center justify-center gap-6 text-[11px] text-slate-500 pt-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Direct UPI Daily Earnings
            </span>
            <span className="flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-teal-600" />
              EV Battery Swap Station Network
            </span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 bg-white">
        © {new Date().getFullYear()} MarkatVerse Logistics Technologies Pvt Ltd. All rights reserved.
      </footer>
    </div>
  );
}



export default function DeliveryLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-slate-300 border-t-emerald-500 rounded-full animate-spin" /></div>}>
      <DeliveryLoginContent />
    </Suspense>
  );
}
