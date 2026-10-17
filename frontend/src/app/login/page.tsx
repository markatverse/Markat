"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Phone, Lock, User, ArrowRight, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

type View = 'signin' | 'register' | 'register-email-otp' | 'forgot' | 'otp' | 'reset-password' | 'success';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { user, login, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      const role = user.role?.toUpperCase();
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        router.replace('/admin');
      } else {
        if (redirectUrl) {
          router.replace(redirectUrl);
        } else {
          router.replace('/');
        }
      }
    }
  }, [user, authLoading, router, redirectUrl]);

  const [view, setView] = useState<View>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sign In fields
  const [siIdentifier, setSiIdentifier] = useState('');
  const [siPassword, setSiPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');

  // Forgot password fields
  const [fpIdentifier, setFpIdentifier] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpResetToken, setFpResetToken] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((view === 'otp' || view === 'register-email-otp') && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, otpTimer]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const clearErrors = () => { setError(''); setSuccessMsg(''); };

  // ── Sign In ──────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);
    try {
      if (!siIdentifier) { setError("Email or Phone is required"); return; }
      if (!siPassword) { setError("Password is required"); return; }
      
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: siIdentifier, password: siPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      if (data.user.role.toUpperCase() === 'ADMIN' || data.user.role.toUpperCase() === 'SUPER_ADMIN') {
        throw new Error('Admin accounts must log in via the Admin Portal.');
      }

      // Sellers can also log in here — they land on the customer homepage.
      // To access the seller dashboard, use /seller/login instead.
      login(
        { id: data.user.id, markatId: data.user.markatId, name: data.user.name, email: data.user.email, role: data.user.role.toLowerCase() as any, phone: data.user.phone || '', business: data.user.business },
        data.access_token
      );
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────
  const handleRegisterInit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (regPassword !== regConfirmPassword) { setError("Passwords do not match"); return; }
    if (regPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (!regEmail) { setError("Email Address is required"); return; }
    if (!regPhone || !/^\d{10}$/.test(regPhone.replace(/\D/g, ''))) { setError("Phone number is required and must be exactly 10 digits"); return; }

    setIsLoading(true);
    try {
      // Send OTP to Email directly (Mobile OTP disabled by admin)
      const res = await fetch(`${API_URL}/auth/send-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: regEmail, type: 'email', phone: regPhone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send Email OTP');
      
      toast.success(`OTP sent to ${regEmail}`);
      setOtpTimer(300);
      setView('register-email-otp');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (emailOtp.length !== 6) { setError("Enter a valid 6-digit code"); return; }
    
    setIsLoading(true);
    try {
      // Verify Email OTP
      const verifyRes = await fetch(`${API_URL}/auth/verify-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: regEmail, code: emailOtp, type: 'email' }),
      });
      if (!verifyRes.ok) throw new Error('Invalid Email OTP');

      // Proceed with actual Signup
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          role: 'CONSUMER',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || 'Registration failed');

      login(
        { id: data.user.id, markatId: data.user.markatId, name: data.user.name, email: data.user.email, role: data.user.role.toLowerCase() as any, phone: data.user.phone || '', business: data.user.business },
        data.access_token
      );
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot Password Step 1: send OTP ─────────────────────────
  const handleForgotSend = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: fpIdentifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      // Store reset token returned from backend (in prod this would come via email/SMS)
      setSuccessMsg(`Code sent to your email! (check your spam box)`);
      setOtpTimer(300); // Reset timer to 5 mins
      setView('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot Password Step 2: verify OTP ───────────────────────
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (fpOtp.length !== 6) { setError("Please enter a valid 6-character code"); return; }
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: fpIdentifier, code: fpOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid or expired code');
      setView('reset-password');
      setSuccessMsg('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot Password Step 3: new password ─────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (fpNewPassword !== fpConfirmPassword) { setError("Passwords do not match"); return; }
    if (fpNewPassword.length < 6) { setError("Password must be at least 6 characters"); return; }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: fpIdentifier, code: fpOtp, new_password: fpNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      setView('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full p-4 pl-12 rounded-2xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-400 text-sm";
  const labelCls = "block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider";
  const btnPrimary = "w-full py-4 bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-bold transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm";

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex">
      <Toaster position="top-right" />
      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex w-[480px] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 relative overflow-hidden flex-col justify-between p-10 shrink-0 border-r border-blue-600/30 shadow-2xl">
        
        {/* Top Bar: Back & Tag */}
        <div className="relative z-20 flex items-center justify-between pb-4">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>

          <span className="text-[11px] font-semibold tracking-wider text-blue-300 uppercase bg-blue-950/70 px-3 py-1 rounded-full border border-blue-500/30">
            Customer Account
          </span>
        </div>

        {/* Decorative Ambient Background Rings */}
        <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[420px] h-[420px] border border-blue-400/10 rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

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
              <span className="text-blue-300 text-[10px] font-bold tracking-[0.2em] uppercase">
                Global Marketplace
              </span>
            </div>
          </div>

          {/* Social Proof Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-3.5 py-1.5 w-fit mb-5 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-white text-xs font-medium">
              Trusted by <strong className="text-amber-300 font-bold">2M+</strong> buyers & sellers worldwide
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-3 tracking-tight">
            Your gateway to the<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-blue-200">
              global marketplace
            </span>
          </h1>

          <p className="text-blue-100/90 text-sm leading-relaxed mb-6">
            Join millions of buyers and sellers worldwide. Discover products, explore verified local services, and track all your orders securely.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-2">
            {[
              { icon: '🛒', title: 'Millions of Products', desc: 'Shop top verified brands and local stores' },
              { icon: '✂️', title: 'Local Services & Live Booking', desc: 'Book salons, clinics & services with live queue tokens' },
              { icon: '🔒', title: '100% Safe Payments', desc: 'End-to-end encrypted escrow checkout protection' },
              { icon: '⚡', title: 'Fast Deliveries & Tracking', desc: 'Real-time order tracking right to your doorstep' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 hover:border-white/20 transition-colors">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center text-base shrink-0">{item.icon}</div>
                <div>
                  <div className="text-white text-xs font-bold">{item.title}</div>
                  <div className="text-blue-200/70 text-[11px] mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-blue-200/70 text-xs">
          <span className="flex items-center gap-1.5">
            <span>🛡️</span> Buyer Protection
          </span>
          <span className="flex items-center gap-1.5">
            <span>🔒</span> 256-bit SSL Security
          </span>
        </div>
      </div>

      {/* ── Right Form Panel (Expanded Comfortable Width) ── */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center p-6 pt-12 lg:p-12 overflow-y-auto relative">
        <div className="w-full max-w-[520px]">

          {/* Mobile Header (Logo & Back) */}
          <div className="lg:hidden w-full flex items-center justify-between mb-10">
            <Link href="/" className="text-slate-400 hover:text-slate-800 p-2 -ml-2">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <img src="/logo.png" alt="MarkatVerse" className="h-12 object-contain" />
            <div className="w-10"></div> {/* Spacer to balance flex-between */}
          </div>

          {/* ── Sign In View ── */}
          {view === 'signin' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-1">Welcome back</h2>
                <p className="text-slate-500 text-sm">Sign in to your MarkatVerse account</p>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
                <button className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-white text-blue-600 shadow-sm transition-all">
                  Sign In
                </button>
                <button
                  onClick={() => { setView('register'); clearErrors(); }}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-all"
                >
                  Register
                </button>
              </div>

              {error && (
                <div className="mb-5 p-3.5 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-5">
                <div>
                  <label className={labelCls}>Email or Phone Number</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required type="text" value={siIdentifier}
                      onChange={e => setSiIdentifier(e.target.value)}
                      placeholder="Enter email or phone"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Password</label>
                    <button type="button" onClick={() => { setView('forgot'); clearErrors(); }} className="text-xs font-semibold text-blue-600 hover:underline">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required type={showPassword ? 'text' : 'password'} value={siPassword}
                      onChange={e => setSiPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`${inputCls} pr-11`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className={btnPrimary} disabled={isLoading || siIdentifier.length < 5}>
                  {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
                    : <>Sign In <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Don&apos;t have an account?{' '}
                <button onClick={() => { setView('register'); clearErrors(); }} className="text-blue-600 font-semibold hover:underline">
                  Create one free
                </button>
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
                <p className="text-sm text-slate-500">
                  Are you a seller?{' '}
                  <Link href="/seller/login" className="text-emerald-600 font-semibold hover:underline">Seller Login →</Link>
                </p>
                <Link href="/admin/login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  Admin Portal →
                </Link>
              </div>
            </div>
          )}

          {/* ── Register View ── */}
          {view === 'register' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-1">Create account</h2>
                <p className="text-slate-500 text-sm">Join MarkatVerse for free today</p>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
                <button
                  onClick={() => { setView('signin'); clearErrors(); }}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-all"
                >
                  Sign In
                </button>
                <button className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-white text-blue-600 shadow-sm transition-all">
                  Register
                </button>
              </div>

              {error && (
                <div className="mb-5 p-3.5 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleRegisterInit} className="space-y-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input required type="text" value={regName} onChange={e => setRegName(e.target.value)}
                      placeholder="John Doe" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input required type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                      placeholder="john@gmail.com" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Mobile Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <span className="text-slate-700 font-medium">+91</span>
                      <div className="w-px h-5 bg-slate-200"></div>
                    </div>
                    <input required type="tel" maxLength={10} value={regPhone} onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setRegPhone(val);
                      }}
                      placeholder="9876543210" className={`${inputCls} pl-24`} />
                  </div>
                  {regPhone && regPhone.length > 0 && regPhone.length < 10 && (
                    <p className="text-xs text-red-500 mt-1">Phone number must be 10 digits</p>
                  )}
                  {regPhone && regPhone.length === 10 && (
                    <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Valid phone number</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input required type={showPassword ? 'text' : 'password'} value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Min. 6 characters" className={`${inputCls} pr-11`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input required type={showConfirmPassword ? 'text' : 'password'} value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password" className={`${inputCls} pr-11`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {regConfirmPassword && regPassword !== regConfirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords don&apos;t match</p>
                  )}
                  {regConfirmPassword && regPassword === regConfirmPassword && regPassword.length >= 6 && (
                    <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match</p>
                  )}
                </div>

                <p className="text-xs text-slate-400">
                  By registering, you agree to our{' '}
                  <span className="text-blue-600 cursor-pointer hover:underline">Terms of Service</span> and{' '}
                  <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>.
                </p>

                <button type="submit" className={btnPrimary} disabled={isLoading || !regName || !regEmail || !regPhone || regPhone.length !== 10}>
                  {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending Email OTP...</>
                    : <>Verify Email <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Already have an account?{' '}
                <button onClick={() => { setView('signin'); clearErrors(); }} className="text-blue-600 font-semibold hover:underline">
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* ── Register Email OTP View ── */}
          {view === 'register-email-otp' && (
            <div>
              <button onClick={() => { setView('register'); clearErrors(); }}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Registration
              </button>
              <div className="mb-8">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                  <Mail className="w-7 h-7 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">Verify Email</h2>
                <p className="text-slate-500 text-sm">
                  We&apos;ve sent an OTP to <span className="font-semibold text-slate-700">{regEmail}</span>
                  <br /><span className="text-xs text-amber-600 mt-1 inline-block">If you don&apos;t see it in your inbox, please check your <strong>spam folder</strong>.</span>
                </p>
              </div>

              {successMsg && (
                <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-100">
                  ✅ {successMsg}
                </div>
              )}
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleEmailVerifyAndSignup} className="space-y-5">
                <div>
                  <label className={labelCls}>6-Digit Email OTP</label>
                  <input
                    required type="text" value={emailOtp} onChange={e => setEmailOtp(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6))}
                    placeholder="- - - - - -" maxLength={6}
                    className="w-full py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-center tracking-[12px] text-2xl font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all uppercase"
                  />
                </div>

                <button type="submit" className={btnPrimary} disabled={emailOtp.length !== 6 || otpTimer === 0 || isLoading}>
                  {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Account...</>
                    : <>Verify Email & Finish <CheckCircle className="w-4 h-4" /></>
                  }
                </button>

                <div className="flex items-center justify-between text-sm mt-4">
                  <p className="text-slate-500">
                    Didn&apos;t receive it?{' '}
                    <button type="button" onClick={handleRegisterInit as any} className="text-blue-600 font-semibold hover:underline">
                      Resend OTP
                    </button>
                  </p>
                  <p className="text-slate-500 text-right">
                    {otpTimer > 0 ? (
                      <>Code expires in <span className="font-semibold text-rose-500">{formatTime(otpTimer)}</span></>
                    ) : (
                      <span className="text-red-500 font-semibold">Code has expired</span>
                    )}
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* ── Forgot Password Step 1 ── */}
          {view === 'forgot' && (
            <div>
              <button onClick={() => { setView('signin'); clearErrors(); }}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>
              <div className="mb-8">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">Forgot password?</h2>
                <p className="text-slate-500 text-sm">Enter your registered email or phone and we&apos;ll send you an OTP to reset your password.</p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleForgotSend} className="space-y-5">
                <div>
                  <label className={labelCls}>Email or Phone Number</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input required type="text" value={fpIdentifier} onChange={e => setFpIdentifier(e.target.value)}
                      placeholder="john@example.com or 9876543210" className={inputCls} />
                  </div>
                </div>

                <button type="submit" className={btnPrimary} disabled={isLoading || fpIdentifier.length < 5}>
                  {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending OTP...</>
                    : <>Send OTP <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>
            </div>
          )}

          {/* ── OTP Verification ── */}
          {view === 'otp' && (
            <div>
              <button onClick={() => { setView('forgot'); clearErrors(); }}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="mb-8">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                  <Mail className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">Enter Code</h2>
                <p className="text-slate-500 text-sm">
                  A 6-character code was sent to <span className="font-semibold text-slate-700">{fpIdentifier}</span>
                </p>
              </div>

              {successMsg && (
                <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-100">
                  ✅ {successMsg}
                </div>
              )}
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleOtpVerify} className="space-y-5">
                <div>
                  <label className={labelCls}>6-Character Code</label>
                  <input
                    required type="text" value={fpOtp} onChange={e => setFpOtp(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6))}
                    placeholder="- - - - - -" maxLength={6}
                    className="w-full py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-center tracking-[12px] text-2xl font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all uppercase"
                  />
                </div>

                <button type="submit" className={btnPrimary} disabled={fpOtp.length !== 6 || otpTimer === 0 || isLoading}>
                  {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</>
                    : <>Verify Code <ArrowRight className="w-4 h-4" /></>
                  }
                </button>

                <div className="flex items-center justify-between text-sm">
                  <p className="text-slate-500">
                    Didn&apos;t receive it?{' '}
                    <button type="button" onClick={handleForgotSend as any} className="text-blue-600 font-semibold hover:underline">
                      Resend OTP
                    </button>
                  </p>
                  <p className="text-slate-500 text-right">
                    {otpTimer > 0 ? (
                      <>Code expires in <span className="font-semibold text-rose-500">{formatTime(otpTimer)}</span></>
                    ) : (
                      <span className="text-red-500 font-semibold">Code has expired</span>
                    )}
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* ── Reset Password ── */}
          {view === 'reset-password' && (
            <div>
              <div className="mb-8">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">Set new password</h2>
                <p className="text-slate-500 text-sm">Choose a strong password for your account.</p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className={labelCls}>New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input required type={showPassword ? 'text' : 'password'} value={fpNewPassword}
                      onChange={e => setFpNewPassword(e.target.value)} placeholder="Min. 6 characters"
                      className={`${inputCls} pr-11`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input required type={showConfirmPassword ? 'text' : 'password'} value={fpConfirmPassword}
                      onChange={e => setFpConfirmPassword(e.target.value)} placeholder="Re-enter password"
                      className={`${inputCls} pr-11`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fpConfirmPassword && fpNewPassword !== fpConfirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords don&apos;t match</p>
                  )}
                </div>

                <button type="submit" className={btnPrimary} disabled={isLoading || fpNewPassword.length < 6}>
                  {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>
                    : <>Update Password <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>
            </div>
          )}

          {/* ── Success View ── */}
          {view === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Password Updated!</h2>
              <p className="text-slate-500 text-sm mb-8">Your password has been successfully reset. You can now sign in with your new password.</p>
              <button onClick={() => { setView('signin'); clearErrors(); }} className={btnPrimary}>
                Go to Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
