import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl font-black text-slate-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-blue-600">
            <p className="font-medium text-slate-500">Last Updated: September 2026</p>
            
            <h2 className="text-xl mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using MarkatVerse, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-xl mt-8 mb-4">2. Description of Service</h2>
            <p>
              MarkatVerse provides users with a premium marketplace ecosystem that includes online product sales, business-to-business commerce, and service bookings.
            </p>

            <h2 className="text-xl mt-8 mb-4">3. User Conduct</h2>
            <p>
              You agree to use MarkatVerse only for lawful purposes. You agree not to take any action that might compromise the security of the site, render the site inaccessible to others, or otherwise cause damage to the site or its content.
            </p>

            <h2 className="text-xl mt-8 mb-4">4. Merchant Terms</h2>
            <p>
              Sellers and merchants on the platform must adhere to the local regulations and accurately describe their products and services. Misrepresentation of goods or services can result in immediate termination of the seller account.
            </p>
            
            <h2 className="text-xl mt-8 mb-4">5. Disclaimer of Warranties</h2>
            <p>
              The materials on MarkatVerse&apos;s website are provided on an &apos;as is&apos; basis. MarkatVerse makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
