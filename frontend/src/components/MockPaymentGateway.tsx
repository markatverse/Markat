"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Smartphone, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  QrCode, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  Wallet, 
  Copy, 
  Check, 
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { loadRazorpayScript } from '@/utils/loadRazorpay';

interface MockPaymentGatewayProps {
  amount: number;
  items?: Array<{ name: string; price: number; quantity: number }>;
  defaultMethod?: 'upi' | 'card' | 'cod' | 'wallet';
  inline?: boolean;
  customerDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onSuccess: (paymentDetails?: { paymentRef: string; method: string }) => void;
  onCancel?: () => void;
}

type PaymentMethodType = 'upi' | 'card' | 'cod' | 'wallet';

export default function MockPaymentGateway({ 
  amount, 
  items = [], 
  defaultMethod = 'upi',
  inline = false,
  customerDetails,
  onSuccess, 
  onCancel 
}: MockPaymentGatewayProps) {
  const [method, setMethod] = useState<PaymentMethodType>(defaultMethod);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('Contacting banking network...');
  
  // Razorpay Integration State
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [razorpayError, setRazorpayError] = useState('');

  // UPI State
  const [upiSubMode, setUpiSubMode] = useState<'qr' | 'vpa'>('qr');
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [vpaVerified, setVpaVerified] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrExpiry, setQrExpiry] = useState(300); // 5 minutes countdown

  // Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(customerDetails?.name || '');
  const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'rupay' | 'generic'>('generic');
  const [cardError, setCardError] = useState('');

  // COD State
  const [codAgreed, setCodAgreed] = useState(true);

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState<string>('markat');

  // Transaction reference ID generated dynamically
  const txRef = useMemo(() => `MV-${Math.floor(100000 + Math.random() * 900000)}-${Date.now().toString().slice(-4)}`, []);

  const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') {
      return 'http://' + window.location.hostname + ':3001';
    }
    return 'http://localhost:3001';
  };

  // Countdown timer for QR code
  useEffect(() => {
    if (qrExpiry <= 0) return;
    const timer = setInterval(() => {
      setQrExpiry(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [qrExpiry]);

  const formattedQrTimer = useMemo(() => {
    const mins = Math.floor(qrExpiry / 60);
    const secs = qrExpiry % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, [qrExpiry]);

  // Card brand detection & formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);

    if (raw.startsWith('4')) {
      setCardBrand('visa');
    } else if (/^(5[1-5]|2[2-7])/.test(raw)) {
      setCardBrand('mastercard');
    } else if (/^(60|65|81|82|508)/.test(raw)) {
      setCardBrand('rupay');
    } else {
      setCardBrand('generic');
    }

    if (raw.length === 16) {
      setCardError('');
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  const handleVerifyUpi = () => {
    if (!upiId || !upiId.includes('@')) {
      setUpiError('Enter a valid UPI ID (e.g. name@okhdfcbank or 9876543210@paytm)');
      setVpaVerified(false);
      return;
    }
    setUpiError('');
    setVpaVerified(true);
  };

  const playSuccessChime = () => {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      }
    } catch {
      // Audio not permitted or supported
    }
  };

  /**
   * Real Razorpay Standard Checkout Launcher
   */
  const handleLaunchRazorpay = async () => {
    setRazorpayLoading(true);
    setRazorpayError('');
    setStatusMessage('Initiating Razorpay Gateway...');

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 1. Create Order on Backend
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/payment/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          receipt: txRef,
          notes: {
            itemsCount: items.length,
            buyerName: customerDetails?.name || 'Markat Buyer'
          }
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to initialize payment order');
      }

      const orderData = await res.json();
      const razorpayKey = orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_MarkatVerseKey';

      // 2. Open official Razorpay modal
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'MarkatVerse Marketplace',
        description: `Order Payment (${items.length} items)`,
        image: '/logo.png',
        order_id: orderData.id,
        handler: async function (response: any) {
          setStatus('processing');
          setStatusMessage('Verifying Razorpay signature...');

          try {
            const verifyRes = await fetch(`${apiUrl}/payment/razorpay/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderData.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || 'mock_signature'
              })
            });

            if (!verifyRes.ok) {
              const verifyErr = await verifyRes.json().catch(() => ({}));
              throw new Error(verifyErr.message || 'Signature verification failed');
            }

            setStatus('success');
            playSuccessChime();
            setTimeout(() => {
              onSuccess({ 
                paymentRef: response.razorpay_payment_id || txRef, 
                method: 'razorpay' 
              });
            }, 1800);
          } catch (vErr: any) {
            console.error('Verification error:', vErr);
            setStatus('failed');
            setRazorpayError(vErr.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: customerDetails?.name || '',
          email: customerDetails?.email || '',
          contact: customerDetails?.phone || ''
        },
        notes: {
          merchant_order_id: txRef
        },
        theme: {
          color: '#2563eb' // Blue 600
        },
        modal: {
          ondismiss: function () {
            setRazorpayLoading(false);
          }
        }
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (failureResponse: any) {
        console.error('Razorpay payment failed:', failureResponse.error);
        setRazorpayError(failureResponse.error?.description || 'Payment was declined or failed.');
        setRazorpayLoading(false);
      });

      rzpInstance.open();
    } catch (err: any) {
      console.error('Razorpay Launch Exception:', err);
      setRazorpayError(err.message || 'Unable to start Razorpay checkout. You can also use other payment modes below.');
    } finally {
      setRazorpayLoading(false);
    }
  };

  const handlePay = () => {

    if (method === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 16) {
        setCardError('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setCardError('Please enter a valid expiry (MM/YY)');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setCardError('Please enter a valid 3 or 4 digit CVV');
        return;
      }
    }

    if (method === 'upi' && upiSubMode === 'vpa' && !vpaVerified) {
      if (!upiId || !upiId.includes('@')) {
        setUpiError('Please verify your UPI ID before continuing');
        return;
      }
    }

    if (method === 'cod') {
      setStatus('processing');
      setStatusMessage('Confirming Cash on Delivery Order...');
      setTimeout(() => {
        setStatusMessage('Order booked with Pay on Delivery!');
        setStatus('success');
        playSuccessChime();

        setTimeout(() => {
          onSuccess({ paymentRef: `COD-${txRef}`, method: 'cod' });
        }, 1500);
      }, 900);
      return;
    }

    setStatus('processing');
    setStatusMessage('Authenticating with NPCI / Gateway...');

    setTimeout(() => {
      setStatusMessage('Authorizing transaction token...');
      setTimeout(() => {
        setStatusMessage('Payment verified successfully!');
        setStatus('success');
        playSuccessChime();

        setTimeout(() => {
          onSuccess({ paymentRef: txRef, method });
        }, 1800);
      }, 1000);
    }, 1200);
  };

  // Success Screen
  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300 p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 relative border border-emerald-100 shadow-inner">
            <div className="absolute inset-0 bg-emerald-400 rounded-2xl animate-ping opacity-25"></div>
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Payment Verified
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 text-center">₹{amount.toLocaleString('en-IN')} Paid</h2>
          <p className="text-slate-500 text-sm font-medium mb-6 text-center">Transaction ID: <span className="font-mono text-slate-700 font-bold">{txRef}</span></p>

          <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-xs space-y-2 mb-6">
            <div className="flex justify-between text-slate-600">
              <span>Payment Mode</span>
              <span className="font-bold uppercase text-slate-800">{method}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gateway Engine</span>
              <span className="font-bold text-slate-800">Razorpay Protected</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Timestamp</span>
              <span className="font-mono text-slate-800">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 256-bit Bank Grade Encryption
          </div>
        </div>
      </div>
    );
  }

  const cardContainerClass = inline
    ? "bg-white rounded-3xl w-full flex flex-col md:flex-row overflow-hidden shadow-sm border border-slate-200"
    : "bg-white rounded-3xl w-full max-w-[900px] h-[92vh] sm:h-[640px] max-h-[92vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative border border-slate-200 animate-in zoom-in-95 duration-300";

  const outerWrapperClass = inline
    ? "w-full"
    : "fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300 p-2 sm:p-4";

  return (
    <div className={outerWrapperClass}>
      <div className={cardContainerClass}>
        
        {/* Left Side: Summary & Trust Badges (Only shown when opened as a standalone modal) */}
        {!inline && (
          <div className="w-full md:w-[300px] bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Brand Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/30">
                    M
                  </div>
                  <div>
                    <span className="font-extrabold text-base tracking-tight block leading-tight">MarkatVerse</span>
                    <span className="text-[10px] text-blue-400 font-bold tracking-wider uppercase">Pay Gateway</span>
                  </div>
                </div>
                
                {onCancel && (
                  <button 
                    onClick={onCancel}
                    className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/80"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Total Amount Display */}
              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 mb-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Payable</span>
                <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline gap-1">
                  <span className="text-xl text-blue-400">₹</span>
                  {amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                  Ref: {txRef}
                </div>
              </div>

              {/* Order Items Snapshot */}
              {items.length > 0 && (
                <div className="hidden sm:block mb-6">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Order Items ({items.length})</span>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 text-xs">
                    {items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300">
                        <span className="truncate max-w-[170px]">{it.quantity}x {it.name}</span>
                        <span className="font-mono text-slate-400">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Security Badges */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">100% Secure & PCI-DSS Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Instant Razorpay Confirmation</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Interactive Payment Methods & Forms */}
        <div className="flex-1 bg-white flex flex-col relative h-full overflow-hidden">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Select Payment Method</h3>
              <p className="text-xs text-slate-500">Choose your preferred payment method below</p>
            </div>
            
            {!inline && onCancel && (
              <button 
                onClick={onCancel}
                className="hidden md:flex text-slate-400 hover:text-slate-800 transition-colors p-2 bg-white rounded-full border border-slate-200/80 hover:bg-slate-100 shadow-sm"
                title="Close payment window"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Payment Method Selector Sidebar */}
            <div className="w-full md:w-[210px] border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/70 overflow-x-auto md:overflow-y-auto flex md:flex-col shrink-0 p-2 md:p-3 gap-1.5">

              {/* UPI Option */}
              <button 
                onClick={() => setMethod('upi')}
                className={`flex-1 md:flex-none flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  method === 'upi' 
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60 font-semibold'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${method === 'upi' ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs sm:text-sm">UPI</div>
                  <div className={`text-[10px] truncate ${method === 'upi' ? 'text-blue-100' : 'text-slate-400'}`}>QR & Apps</div>
                </div>
              </button>

              {/* Card Option */}
              <button 
                onClick={() => setMethod('card')}
                className={`flex-1 md:flex-none flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  method === 'card' 
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60 font-semibold'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${method === 'card' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs sm:text-sm">Cards</div>
                  <div className={`text-[10px] truncate ${method === 'card' ? 'text-blue-100' : 'text-slate-400'}`}>Debit & Credit</div>
                </div>
              </button>

              {/* Cash on Delivery (COD) Option */}
              <button 
                onClick={() => setMethod('cod')}
                className={`flex-1 md:flex-none flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  method === 'cod' 
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60 font-semibold'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${method === 'cod' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Banknote className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs sm:text-sm">Cash on Delivery</div>
                  <div className={`text-[10px] truncate ${method === 'cod' ? 'text-blue-100' : 'text-slate-400'}`}>Pay at Doorstep</div>
                </div>
              </button>

              {/* Wallet Option */}
              <button 
                onClick={() => setMethod('wallet')}
                className={`flex-1 md:flex-none flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  method === 'wallet' 
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60 font-semibold'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${method === 'wallet' ? 'bg-white/20' : 'bg-purple-50 text-purple-600'}`}>
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs sm:text-sm">Wallets</div>
                  <div className={`text-[10px] truncate ${method === 'wallet' ? 'text-blue-100' : 'text-slate-400'}`}>Markat, Paytm</div>
                </div>
              </button>

            </div>

            {/* Active Method Form Body */}
            <div className="flex-1 p-5 sm:p-7 overflow-y-auto custom-scrollbar">

              {/* UPI MODE */}
              {method === 'upi' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                    <button 
                      onClick={() => setUpiSubMode('qr')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${upiSubMode === 'qr' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
                    >
                      <QrCode className="w-3.5 h-3.5" /> Scan QR Code
                    </button>
                    <button 
                      onClick={() => setUpiSubMode('vpa')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${upiSubMode === 'vpa' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Enter UPI ID / Number
                    </button>
                  </div>

                  {upiSubMode === 'qr' ? (
                    <div className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-center">
                      <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200 mb-3 group">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=markatverse@icici&pn=MarkatVerse%20Commerce&am=${amount}&tr=${txRef}&cu=INR`} 
                          alt="UPI Payment QR Code" 
                          className="w-40 h-40 object-contain rounded-xl"
                        />
                        <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[0.5px] rounded-2xl pointer-events-none" />
                      </div>

                      <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                        <span>Scan with any app</span>
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <span className="text-blue-600 font-extrabold">GPay</span> • 
                          <span className="text-purple-600 font-extrabold">PhonePe</span> • 
                          <span className="text-sky-600 font-extrabold">Paytm</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                        <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" /> QR expires in <span className="font-bold font-mono text-slate-800">{formattedQrTimer}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Virtual Payment Address (VPA)
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              setVpaVerified(false);
                              setUpiError('');
                            }}
                            placeholder="e.g. mobileNumber@upi or yourname@okaxis" 
                            className={`flex-1 bg-slate-50 border rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white transition-all ${
                              upiError ? 'border-red-400 focus:border-red-500' : vpaVerified ? 'border-emerald-500 focus:border-emerald-500' : 'border-slate-200 focus:border-blue-500'
                            }`}
                          />
                          <button 
                            onClick={handleVerifyUpi}
                            className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                              vpaVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {vpaVerified ? 'Verified ✓' : 'Verify'}
                          </button>
                        </div>
                        {upiError && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {upiError}
                          </p>
                        )}
                        {vpaVerified && (
                          <p className="text-emerald-600 text-xs mt-1.5 flex items-center gap-1 font-medium">
                            <Check className="w-3.5 h-3.5" /> Verified Name: Markat Registered Buyer
                          </p>
                        )}
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Popular UPI Apps</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { name: 'Google Pay', suffix: '@okaxis' },
                            { name: 'PhonePe', suffix: '@ybl' },
                            { name: 'Paytm UPI', suffix: '@paytm' }
                          ].map(app => (
                            <button
                              key={app.name}
                              type="button"
                              onClick={() => {
                                setUpiId(`customer${app.suffix}`);
                                setVpaVerified(true);
                                setUpiError('');
                              }}
                              className="border border-slate-200 rounded-xl p-2.5 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all text-xs font-bold text-slate-700"
                            >
                              {app.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Paying To</span>
                      <span className="font-bold text-slate-800">markatverse@icici</span>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard?.writeText('markatverse@icici');
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs"
                    >
                      {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CARD MODE */}
              {method === 'card' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Card Number
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4111 2222 3333 4444" 
                        maxLength={19}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-16 py-3 text-slate-900 font-mono text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        {cardBrand === 'visa' && (
                          <span className="bg-blue-600 text-white font-black italic text-[11px] px-2 py-0.5 rounded shadow-xs">VISA</span>
                        )}
                        {cardBrand === 'mastercard' && (
                          <span className="bg-red-500 text-white font-bold text-[11px] px-2 py-0.5 rounded shadow-xs">MC</span>
                        )}
                        {cardBrand === 'rupay' && (
                          <span className="bg-emerald-600 text-white font-bold text-[11px] px-2 py-0.5 rounded shadow-xs">RuPay</span>
                        )}
                        {cardBrand === 'generic' && (
                          <CreditCard className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Valid Thru
                      </label>
                      <input 
                        type="text" 
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY" 
                        maxLength={5}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>CVV</span>
                        <span className="text-[10px] text-slate-400 font-normal">3-4 digits</span>
                      </label>
                      <input 
                        type="password" 
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••" 
                        maxLength={4}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Cardholder Name
                    </label>
                    <input 
                      type="text" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name as printed on card" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  {cardError && (
                    <p className="text-red-500 text-xs flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {cardError}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Card details are tokenized in compliance with RBI safety guidelines.</span>
                  </div>
                </div>
              )}

              {/* CASH ON DELIVERY (COD) MODE */}
              {method === 'cod' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Cash / Pay on Delivery</h4>
                        <p className="text-xs text-emerald-700 font-medium">Pay via Cash, UPI, or Card upon doorstep delivery</p>
                      </div>
                    </div>

                    <div className="bg-white/90 rounded-xl p-3.5 border border-emerald-100 text-xs text-slate-600 space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>No advance online payment required. Pay directly to the delivery executive.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Our delivery partners carry wireless QR & POS swipe machines for UPI / Card payment at door.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Free delivery & hassle-free verification on order delivery.</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total Amount to Pay</span>
                      <span className="text-xl font-black text-slate-900">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                      Zero Extra Convenience Fee
                    </span>
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                    <input 
                      type="checkbox" 
                      checked={codAgreed} 
                      onChange={(e) => setCodAgreed(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-600 font-medium">
                      I confirm I will be available at the delivery address to receive and pay for this order.
                    </span>
                  </label>
                </div>
              )}

              {/* WALLET MODE */}
              {method === 'wallet' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Available Wallets
                  </span>

                  <div className="space-y-2.5">
                    <div 
                      onClick={() => setSelectedWallet('markat')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedWallet === 'markat' 
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-xs">
                          M
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-800">MarkatVerse Balance</div>
                          <div className="text-xs text-slate-500">Instant one-tap checkout</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-bold">Balance</div>
                        <div className="text-sm font-extrabold text-emerald-600">₹{(amount + 500).toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    <div 
                      onClick={() => setSelectedWallet('paytm')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedWallet === 'paytm' 
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs">
                          Paytm
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-800">Paytm Wallet & Postpaid</div>
                          <div className="text-xs text-slate-500">Link your Paytm mobile number</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                    <div 
                      onClick={() => setSelectedWallet('mobikwik')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedWallet === 'mobikwik' 
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs">
                          Mobi
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-800">MobiKwik / ZIP Pay Later</div>
                          <div className="text-xs text-slate-500">Pay next month with 0% interest</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payments are encrypted with AES-256 via Razorpay</span>
            </div>

            <button 
              onClick={handlePay}
              disabled={status === 'processing' || razorpayLoading || (method === 'cod' && !codAgreed)}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-75 disabled:shadow-none min-w-[200px]"
            >
              {status === 'processing' || razorpayLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{statusMessage}</span>
                </>
              ) : (
                <>
                  <span>{method === 'cod' ? `Place COD Order (₹${amount.toLocaleString('en-IN')})` : `Pay ₹${amount.toLocaleString('en-IN')}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
