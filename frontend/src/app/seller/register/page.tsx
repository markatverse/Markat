"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();

export default function SellerRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessModel, setBusinessModel] = useState<string>('');
  
  const [businessTypes, setBusinessTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  
  const [sectors, setSectors] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('');
  
  const [businessName, setBusinessName] = useState<string>('');
  const [businessPhone, setBusinessPhone] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { user, login, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect to seller login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/seller/login');
    }
  }, [user, authLoading, router]);

  // Redirect if already a seller
  useEffect(() => {
    if (user && (user.role?.toUpperCase() === 'SELLER' || user.business)) {
      router.replace('/seller/dashboard');
    }
  }, [user, router]);

  // Fetch Business Types when Model changes
  useEffect(() => {
    if (businessModel) {
      setLoading(true);
      setSelectedType('');
      setSelectedSector('');
      fetch(`${API_URL}/configuration/business-types?mainType=${businessModel}`)
        .then(res => res.json())
        .then(data => setBusinessTypes(data))
        .finally(() => setLoading(false));
    }
  }, [businessModel]);

  // Fetch Sectors when Type changes
  useEffect(() => {
    if (selectedType) {
      setLoading(true);
      setSelectedSector('');
      fetch(`${API_URL}/configuration/sectors?businessTypeId=${selectedType}`)
        .then(res => res.json())
        .then(data => setSectors(data))
        .finally(() => setLoading(false));
    } else {
      setSectors([]);
      setSelectedSector('');
    }
  }, [selectedType]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  // Show loading state while checking auth
  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Seller Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Step {step} of 3
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Select Business Model <span className="text-red-500">*</span></h3>
              <div className="grid grid-cols-2 gap-4">
                {['B2B', 'B2C', 'BOTH', 'SERVICE'].map((model) => (
                  <button
                    key={model}
                    onClick={() => setBusinessModel(model)}
                    className={`p-4 border rounded-lg text-center ${
                      businessModel === model ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="block font-semibold">{model}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleNext}
                disabled={!businessModel}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Business Configuration</h3>
              
              <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl space-y-4 shadow-sm mb-6">
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                    <span>🎯</span> Core Business Categorization
                  </h4>
                  <p className="text-xs text-indigo-700 mt-1">Please accurately select your business category to enable the right dashboard features.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-indigo-900">Business Type <span className="text-red-500">*</span></label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-indigo-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border bg-white shadow-sm transition-shadow"
                  >
                    <option value="">Select a type...</option>
                    {businessTypes.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {selectedType && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-indigo-900">Sector <span className="text-red-500">*</span></label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-indigo-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border bg-white shadow-sm transition-shadow"
                    >
                      <option value="">Select a sector...</option>
                      {sectors.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Business Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Business Phone (Optional)</label>
                <input
                  type="text"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="e.g. +91-9876543210"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedSector || !businessName.trim()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Business Capabilities</h3>
              <p className="text-sm text-gray-500">
                Based on your {businessModel} sector selection, the following capabilities will be enabled for your account.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md border space-y-3">
                <p className="text-xs font-mono text-gray-700 pb-2 border-b">
                  Provisioning specific capabilities for {businessModel}...
                </p>
                
                <div className="flex items-center">
                  <input type="checkbox" checked readOnly className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                  <label className="ml-2 block text-sm text-gray-900">Base Business Profile</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked readOnly className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                  <label className="ml-2 block text-sm text-gray-900">Seller Wallet</label>
                </div>

                {businessModel === 'SERVICE' && (
                  <>
                    <div className="flex items-center">
                      <input type="checkbox" checked readOnly className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                      <label className="ml-2 block text-sm font-medium text-indigo-900">Service Booking Engine</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked readOnly className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                      <label className="ml-2 block text-sm font-medium text-indigo-900">Token Queue System</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked readOnly className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                      <label className="ml-2 block text-sm font-medium text-indigo-900">Staff & Resource Management</label>
                    </div>
                  </>
                )}

                {(businessModel === 'B2C' || businessModel === 'BOTH') && (
                  <>
                    <div className="flex items-center">
                      <input type="checkbox" checked readOnly className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                      <label className="ml-2 block text-sm font-medium text-green-900">Product Sales (B2C)</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked readOnly className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                      <label className="ml-2 block text-sm font-medium text-green-900">Inventory Management</label>
                    </div>
                  </>
                )}

                {(businessModel === 'B2B' || businessModel === 'BOTH') && (
                  <>
                    <div className="flex items-center">
                      <input type="checkbox" checked readOnly className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                      <label className="ml-2 block text-sm font-medium text-blue-900">Bulk RFQ System</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked readOnly className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                      <label className="ml-2 block text-sm font-medium text-blue-900">B2B Wholesale Pricing</label>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                  <span>✨</span> Dynamic Customization Enabled
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Once registered, you can dynamically build your {businessModel === 'SERVICE' ? 'Service Menu (e.g. Haircut, Spa)' : 'Product Variants (e.g. Sizes, Materials)'} with custom pricing directly from your dashboard.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  disabled={submitting}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={async () => {
                    setSubmitting(true);
                    setError('');
                    try {
                      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                      if (!token) {
                        router.replace('/seller/login');
                        return;
                      }

                      const payload = {
                        email: user?.email,
                        phone: businessPhone || user?.phone,
                        ownerName: user?.name,
                        mainType: businessModel,
                        businessType: selectedType,
                        businessName: businessName,
                      };

                      const res = await fetch(`${API_URL}/sellers`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload)
                      });

                      if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.message || 'Registration failed. Please try again.');
                      }

                      // Refresh user session to get updated SELLER role and business data
                      const meRes = await fetch(`${API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (meRes.ok) {
                        const data = await meRes.json();
                        login({
                          id: data.id,
                          markatId: data.markatId,
                          name: data.name,
                          email: data.email,
                          phone: data.phone || '',
                          role: data.role?.toLowerCase() as any,
                          status: 'active',
                          business: data.business,
                        }, token);
                      }

                      router.push('/seller/dashboard');
                    } catch (err: any) {
                      setError(err.message || 'Registration failed. Please try again.');
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
