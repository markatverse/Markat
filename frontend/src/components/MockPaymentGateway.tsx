"use client";
import React, { useState } from 'react';
import { X, Smartphone, CreditCard, ShieldCheck, CheckCircle2, Loader2, Building2 } from 'lucide-react';

interface MockPaymentGatewayProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MockPaymentGateway({ amount, onSuccess, onCancel }: MockPaymentGatewayProps) {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handlePay = () => {
    setStatus('processing');
    // Simulate network delay for payment
    setTimeout(() => {
      setStatus('success');
      // Wait a moment so user sees the success state before closing
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center justify-center max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Payment Successful</h2>
          <p className="text-slate-500 font-medium">₹{amount.toLocaleString('en-IN')} paid securely.</p>
          <div className="mt-8 text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secured by Razorpay
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[850px] h-[90vh] md:h-[600px] max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        
        {/* Left Side: Summary */}
        <div className="hidden md:flex w-full md:w-[300px] bg-slate-900 text-white p-6 md:p-8 flex-col">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-black text-lg">M</div>
            <span className="font-bold tracking-wide">MarkatVerse</span>
          </div>
          
          <div className="text-slate-400 text-sm font-medium mb-1">Amount to pay</div>
          <div className="text-4xl font-black mb-8 flex items-start gap-1">
            <span className="text-xl mt-1 text-slate-300">₹</span>
            {amount.toLocaleString('en-IN')}
          </div>

          <div className="mt-auto hidden md:block">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>100% Secure Payments</span>
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Test Mode Gateway
            </div>
          </div>
        </div>

        {/* Right Side: Payment Methods */}
        <div className="flex-1 bg-white flex flex-col relative h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg">Select Payment Method</h3>
            <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 transition-colors p-2 bg-slate-50 rounded-full hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Methods */}
            <div className="w-full md:w-[200px] border-r border-slate-100 bg-slate-50/50 overflow-y-auto">
              <button 
                onClick={() => setMethod('upi')}
                className={`w-full flex flex-col items-start p-4 border-l-4 transition-colors ${method === 'upi' ? 'border-blue-600 bg-white shadow-[inset_0_0_10px_rgba(0,0,0,0.02)]' : 'border-transparent text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className={`w-5 h-5 ${method === 'upi' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className={`font-bold text-sm ${method === 'upi' ? 'text-blue-700' : ''}`}>UPI</span>
                </div>
                <span className="text-[10px] text-slate-400 ml-8 mt-1 text-left">GPay, PhonePe, Paytm</span>
              </button>

              <button 
                onClick={() => setMethod('card')}
                className={`w-full flex flex-col items-start p-4 border-l-4 transition-colors ${method === 'card' ? 'border-blue-600 bg-white shadow-[inset_0_0_10px_rgba(0,0,0,0.02)]' : 'border-transparent text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className={`w-5 h-5 ${method === 'card' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className={`font-bold text-sm ${method === 'card' ? 'text-blue-700' : ''}`}>Card</span>
                </div>
                <span className="text-[10px] text-slate-400 ml-8 mt-1 text-left">Visa, MasterCard, RuPay</span>
              </button>

              <button 
                onClick={() => setMethod('netbanking')}
                className={`w-full flex flex-col items-start p-4 border-l-4 transition-colors ${method === 'netbanking' ? 'border-blue-600 bg-white shadow-[inset_0_0_10px_rgba(0,0,0,0.02)]' : 'border-transparent text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className={`w-5 h-5 ${method === 'netbanking' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className={`font-bold text-sm ${method === 'netbanking' ? 'text-blue-700' : ''}`}>Netbanking</span>
                </div>
                <span className="text-[10px] text-slate-400 ml-8 mt-1 text-left">All Indian Banks</span>
              </button>
            </div>

            {/* Active Method Details */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              
              {method === 'upi' && (
                <div className="animate-in fade-in duration-300 slide-in-from-right-4">
                  <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    Pay via UPI <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4" />
                  </h4>
                  <div className="space-y-4">
                    <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-400 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">📸</div>
                          <div>
                            <div className="font-bold text-sm text-slate-800">Show QR Code</div>
                            <div className="text-xs text-slate-500">Scan with any UPI app</div>
                          </div>
                        </div>
                        <div className="w-4 h-4 rounded-full border border-slate-300 group-hover:border-blue-500"></div>
                      </div>
                    </div>

                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-slate-100"></div>
                      <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">OR</span>
                      <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enter UPI ID</label>
                      <input type="text" placeholder="e.g. 9876543210@ybl" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-sm font-medium" />
                    </div>
                  </div>
                </div>
              )}

              {method === 'card' && (
                <div className="animate-in fade-in duration-300 slide-in-from-right-4">
                  <h4 className="font-bold text-slate-800 mb-6">Enter Card Details</h4>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Card Number</label>
                      <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-sm font-medium font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Expiry</label>
                        <input type="text" placeholder="MM/YY" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">CVV</label>
                        <input type="password" placeholder="***" maxLength={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-sm font-medium font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cardholder Name</label>
                      <input type="text" placeholder="Name on card" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-sm font-medium" />
                    </div>
                  </div>
                </div>
              )}

              {method === 'netbanking' && (
                <div className="animate-in fade-in duration-300 slide-in-from-right-4">
                  <h4 className="font-bold text-slate-800 mb-6">Select Bank</h4>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {['HDFC', 'SBI', 'ICICI', 'Axis'].map(bank => (
                      <div key={bank} className="border border-slate-200 rounded-xl p-3 text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                        <span className="font-bold text-slate-700 text-sm">{bank}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 text-sm font-medium appearance-none">
                      <option>Select other bank...</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Yes Bank</option>
                      <option>Bank of Baroda</option>
                    </select>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer / Pay Button */}
          <div className="p-4 md:p-6 border-t border-slate-100 bg-white mt-auto">
            <button 
              onClick={handlePay}
              disabled={status === 'processing'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:shadow-none"
            >
              {status === 'processing' ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Processing Payment...
                </>
              ) : (
                `Pay ₹${amount.toLocaleString('en-IN')} securely`
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
