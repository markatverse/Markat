"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function UserWidget() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="user-widget" style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '10px' }}>Welcome to MarkatVerse</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Sign in for the best experience</p>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ width: '100%' }}>Login securely</button>
        </Link>
        <div style={{ marginTop: '15px', fontSize: '12px' }}>
          New to MarkatVerse? <Link href="/login" style={{ color: 'var(--accent-blue)' }}>Create an account</Link>
        </div>
      </div>
    );
  }

  const isAdmin = user.role.includes('admin') || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  return (
    <div className="user-widget">
      <Link href={isAdmin ? "/admin" : "/profile/settings"} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="user-header" style={{ cursor: 'pointer' }}>
          <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            {user.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Welcome back,</div>
            <div style={{ fontWeight: '600' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--accent-blue)' }}>
              {isAdmin ? 'Admin Account ✓' : user.role === 'business' || user.role === 'seller' || user.role === 'SELLER' || user.role === 'elite' || user.role === 'ELITE' ? 'Business Account ✓' : 'Verified Buyer ✓'}
            </div>
          </div>
        </div>
      </Link>
      
      {!isAdmin && (
        <div className="balance">
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Account Balance</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>₹ 48,750.00</div>
          </div>
          <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>My Wallet</button>
        </div>
      )}
      
      <div style={{ fontSize: '14px', fontWeight: '600', margin: '20px 0 12px 0' }}>Quick Actions</div>
      <div className="quick-actions">
        {isAdmin ? (
          <>
            <Link href="/admin" style={{textDecoration: 'none', color: 'inherit'}}>
              <div className="action-btn">
                <div className="action-icon">🛡️</div>
                <span>Dashboard</span>
              </div>
            </Link>
            <Link href="/admin/users" style={{textDecoration: 'none', color: 'inherit'}}>
              <div className="action-btn">
                <div className="action-icon">👥</div>
                <span>Manage Users</span>
              </div>
            </Link>
          </>
        ) : (
          <>
            <Link href="/profile/settings" style={{textDecoration: 'none', color: 'inherit'}}>
              <div className="action-btn">
                <div className="action-icon">📦</div>
                <span>My Orders</span>
              </div>
            </Link>
            <Link href="/seller/dashboard" style={{textDecoration: 'none', color: 'inherit'}}>
              <div className="action-btn">
                <div className="action-icon">📋</div>
                <span>My Listings</span>
              </div>
            </Link>
            <Link href="/seller/dashboard?action=add" style={{textDecoration: 'none', color: 'inherit'}}>
              <div className="action-btn">
                <div className="action-icon">➕</div>
                <span>Add Product</span>
              </div>
            </Link>
            <Link href="/profile/settings" style={{textDecoration: 'none', color: 'inherit'}}>
              <div className="action-btn">
                <div className="action-icon">💸</div>
                <span>Wallet</span>
              </div>
            </Link>
          </>
        )}
        <div 
          className="action-btn" 
          onClick={() => {
            logout();
            router.push('/login');
          }}
          style={{ cursor: 'pointer', borderTop: '1px solid #f1f5f9', marginTop: '8px', paddingTop: '8px' }}
        >
          <div className="action-icon" style={{ color: '#ef4444' }}>🚪</div>
          <span style={{ color: '#ef4444' }}>Logout</span>
        </div>
      </div>
    </div>
  );
}
