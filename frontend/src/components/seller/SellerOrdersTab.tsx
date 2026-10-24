"use client";
import React from 'react';
import { Package } from 'lucide-react';

interface OrderItem {
  id: string;
  orderNumber?: string;
  buyer: string;
  item: string;
  date: string;
  amount: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | string;
}

interface SellerOrdersTabProps {
  orders: OrderItem[];
  onMarkShipped: (orderId: string) => void;
}

export default function SellerOrdersTab({
  orders,
  onMarkShipped,
}: SellerOrdersTabProps) {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Recent Product Orders</h1>
        <p className="text-slate-500 mt-2">Track, dispatch, and fulfill your customer orders.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
              <th className="p-4 pl-6">Order ID</th>
              <th className="p-4">Buyer</th>
              <th className="p-4">Item</th>
              <th className="p-4">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 font-medium text-slate-900">{order.orderNumber || order.id}</td>
                <td className="p-4 text-slate-700">{order.buyer}</td>
                <td className="p-4 text-slate-600 truncate max-w-[200px]">{order.item}</td>
                <td className="p-4 text-slate-500 text-sm">{order.date}</td>
                <td className="p-4 font-bold text-slate-900">{order.amount}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  {order.status === 'Pending' ? (
                    <button 
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                      onClick={() => onMarkShipped(order.id)}
                    >
                      Mark Shipped
                    </button>
                  ) : (
                    <button className="text-slate-400 hover:text-slate-600 font-medium text-sm">View</button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-500">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6" />
                  </div>
                  No customer orders received yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
