const fs = require('fs');
const path = require('path');

const routes = [
  'users/customers', 'users/sellers', 'users/staff', 'users/delivery-partners',
  'businesses/sellers', 'businesses/stores', 'businesses/branches', 'businesses/staff', 'businesses/resources',
  'marketplace/products', 'marketplace/services', 'marketplace/categories', 'marketplace/industries', 'marketplace/brands',
  'transactions/orders', 'transactions/bookings', 'transactions/payments', 'transactions/refunds', 'transactions/wallets', 'transactions/payouts',
  'commercial/commission', 'commercial/subscriptions', 'commercial/coupons', 'commercial/advertisements',
  'operations/tokens', 'operations/delivery', 'operations/workflows', 'operations/locations',
  'support/tickets', 'support/complaints', 'support/disputes',
  'content/cms', 'content/banners', 'content/blog', 'content/seo',
  'analytics/marketplace', 'analytics/sales', 'analytics/services', 'analytics/customers', 'analytics/finance',
  'security/roles', 'security/permissions', 'security/audit', 'security/logins', 'security/alerts',
  'notifications/email', 'notifications/sms', 'notifications/push', 'notifications/templates',
  'settings/platform', 'settings/payment', 'settings/authentication', 'settings/commission', 'settings/tax', 'settings/booking', 'settings/seo', 'settings/integrations'
];

const basePath = path.join(__dirname, 'src', 'app', 'admin');

const generatePageContent = (title) => {
  return `"use client";
import React from 'react';

export default function ${title.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 w-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">${title}</h1>
          <p className="text-slate-400 mt-2 text-sm">Manage and configure ${title.toLowerCase()}.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2">
          + Add New
        </button>
      </header>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between">
          <input type="text" placeholder="Search..." className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 w-64" />
          <select className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Name / Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Modified</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              <tr className="hover:bg-slate-700/50 transition-all">
                <td className="p-4 pl-6 font-mono text-xs text-slate-500">#1001</td>
                <td className="p-4 font-bold text-white">Sample Entry A</td>
                <td className="p-4">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold">Active</span>
                </td>
                <td className="p-4 text-slate-400 text-sm">Just now</td>
                <td className="p-4 pr-6 text-right">
                  <button className="text-slate-500 hover:text-blue-400 px-2">Edit</button>
                  <button className="text-slate-500 hover:text-rose-400 px-2">Delete</button>
                </td>
              </tr>
              <tr className="hover:bg-slate-700/50 transition-all">
                <td className="p-4 pl-6 font-mono text-xs text-slate-500">#1002</td>
                <td className="p-4 font-bold text-white">Sample Entry B</td>
                <td className="p-4">
                  <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-bold">Inactive</span>
                </td>
                <td className="p-4 text-slate-400 text-sm">2 hours ago</td>
                <td className="p-4 pr-6 text-right">
                  <button className="text-slate-500 hover:text-blue-400 px-2">Edit</button>
                  <button className="text-slate-500 hover:text-rose-400 px-2">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`;
};

routes.forEach(route => {
  const dirPath = path.join(basePath, route);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const pagePath = path.join(dirPath, 'page.tsx');
  
  const titleParts = route.split('/');
  const title = titleParts.map(part => part.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(' &gt; ');
  
  fs.writeFileSync(pagePath, generatePageContent(title));
  console.log(`Created ${pagePath}`);
});

console.log('Done creating routes!');
