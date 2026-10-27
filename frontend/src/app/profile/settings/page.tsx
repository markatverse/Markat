"use client";
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { User, CreditCard, MapPin, Package, Camera, ShieldCheck, Bell, ChevronRight, ChevronLeft, LogOut, Edit3, Trash2, Star, Heart, ShoppingBag, Key, Smartphone, Laptop, Download, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import ShippingAddressesTab from '@/components/ShippingAddressesTab';

type ProfileNotification = {
  id: string;
  triggerType: string;
  title?: string | null;
  message: string;
  createdAt: string;
};

type ProfileOrder = {
  id: string;
  orderNumber?: string | null;
  createdAt: string;
  status: string;
  total: number;
  items: { id: string; productName?: string | null; quantity: number; price: number }[];
};
import { getApiUrl } from '@/utils/api';

const API_URL = getApiUrl();

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState('personal');
  const [notifications, setNotifications] = useState<ProfileNotification[]>([]);
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [profileDataError, setProfileDataError] = useState('');
  const [isProfileDataLoading, setIsProfileDataLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, login, logout, isLoading } = useAuth();
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const { products } = useProducts();
  const { addToCart } = useCart();
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const profileFormRef = useRef<HTMLFormElement>(null);

  // Web Push Subscription State
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW registration:', err));
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setIsPushSubscribed(!!sub);
        });
      });
    }
  }, []);

  const handleTogglePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Web Push is not supported by your current browser.');
      return;
    }

    setIsPushLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const existingSub = await reg.pushManager.getSubscription();

      if (existingSub) {
        await existingSub.unsubscribe();
        setIsPushSubscribed(false);
        toast.success('Push notifications paused on this device.');
        return;
      }

      // 1. Fetch public key
      const keyRes = await fetch(`${API_URL}/admin/notifications/public-key`);
      const { publicKey } = await keyRes.json();
      if (!publicKey) throw new Error('VAPID public key unavailable');

      // Convert VAPID key to Uint8Array
      const padding = '='.repeat((4 - (publicKey.length % 4)) % 4);
      const base64 = (publicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      // 2. Request browser permission and subscribe
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: outputArray
      });

      // 3. Register endpoint with backend
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/admin/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: user?.id,
          subscription: subscription.toJSON()
        })
      });

      setIsPushSubscribed(true);
      toast.success('Push notifications activated successfully!');
    } catch (err: any) {
      console.error('Push subscription failed:', err);
      toast.error(err.message || 'Permission denied or failed to activate push.');
    } finally {
      setIsPushLoading(false);
    }
  };

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/profile/settings');
    }
  }, [isLoading, user, router]);

  // Auto-scroll window to top when any sidebar tab is clicked
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  React.useEffect(() => {
    if ((activeTab !== 'notifications' && activeTab !== 'orders') || !user?.id) return;

    const loadProfileData = async () => {
      setProfileDataError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setProfileDataError('Your session has expired. Please sign in again.');
        return;
      }

      setIsProfileDataLoading(true);
      const isOrdersTab = activeTab === 'orders';
      const resource = isOrdersTab ? 'orders' : 'notifications';
      const targetUserId = user?.id || 'me';
      const endpoint = isOrdersTab
        ? `${API_URL}/orders/buyer/${encodeURIComponent(targetUserId)}`
        : `${API_URL}/admin/notifications/history/${encodeURIComponent(targetUserId)}`;
      try {
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Could not load ${resource} (${res.status})`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data?.orders) ? data.orders : (Array.isArray(data?.logs) ? data.logs : []));
        if (isOrdersTab) setOrders(list);
        else setNotifications(list);
      } catch (error) {
        console.warn(`Profile ${resource} load notice:`, error);
        if (isOrdersTab) setOrders([]);
        else setNotifications([]);
      } finally {
        setIsProfileDataLoading(false);
      }
    };

    void loadProfileData();
  }, [activeTab, user]);

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) return toast.error('Please fill all password fields');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Your session has expired. Please sign in again.');
      const res = await fetch(`${API_URL}/users/${user?.id}/password`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      if (res.ok) {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const [firstName, lastName] = user?.name ? user.name.split(' ') : ['', ''];
  const email = user?.email || '';
  const phone = user?.phone || '';

  const navItems = [
    { id: 'personal', label: 'Personal Info', icon: <User className="w-5 h-5" /> },
    { id: 'elite', label: 'Elite Membership', icon: <Star className="w-5 h-5 text-amber-500" /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'shipping', label: 'Shipping Addresses', icon: <MapPin className="w-5 h-5" /> },
    { id: 'orders', label: 'Order History', icon: <Package className="w-5 h-5" /> },
    { id: 'wishlist', label: 'My Wishlist', icon: <Heart className="w-5 h-5" /> },
    { id: 'security', label: 'Security & Privacy', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications & Alerts', icon: <Bell className="w-5 h-5" /> },
  ];

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    const updatedFirstName = formData.get('firstName') as string;
    const updatedLastName = formData.get('lastName') as string;
    const updatedEmail = formData.get('email') as string;
    const updatedPhone = formData.get('phone') as string;

    const fullName = `${updatedFirstName} ${updatedLastName}`.trim();

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Your session has expired. Please sign in again.');
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: fullName,
          email: updatedEmail,
          phone: updatedPhone
        })
      });
      
      if (res.ok) {
        toast.success('Profile updated successfully!');
        const updatedUser = { ...user, name: fullName, email: updatedEmail, phone: updatedPhone };
        login(updatedUser, token || undefined); 
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return null;
  }


  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* Sidebar Navigation */}
        <aside className={`w-full md:w-[300px] shrink-0 ${!showMobileMenu ? 'hidden md:block' : 'block'}`}>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-full relative overflow-hidden">
            {/* Glossy top edge highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <Link href="/" className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors p-2 bg-slate-800/50 hover:bg-blue-600/20 rounded-full border border-slate-700/50 hover:border-blue-500/50 group z-20" title="Back to Home">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            <div className="text-center mb-10 relative mt-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 mx-auto mb-4 relative shadow-lg shadow-blue-500/20 group cursor-pointer">
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center relative overflow-hidden">
                  <span className="text-3xl font-bold text-white tracking-widest">
                    {(firstName?.[0] || '') + (lastName?.[0] || '')}
                  </span>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <span className="w-3 h-3 bg-white rounded-full"></span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{user?.name || ''}</h3>
              <div className="text-blue-400 text-sm font-medium">{email}</div>
              {user && (
                <div className="mt-3 px-3 py-2 bg-slate-950/50 rounded-lg border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors" onClick={() => { navigator.clipboard.writeText(user.markatId || 'Pending'); alert('ID Copied!'); }}>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">MV Account ID</span>
                  <span className="text-xs font-mono text-slate-300 font-bold">{user.markatId || 'Pending'}</span>
                </div>
              )}
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Account
              </div>
            </div>
            
            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMobileMenu(false);
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                    activeTab === item.id 
                      ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 border shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]' 
                      : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 border hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>
                  {activeTab === item.id && <ChevronRight className="w-4 h-4 text-blue-500 animate-pulse" />}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <button 
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-semibold text-sm">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 ${showMobileMenu ? 'hidden md:block' : 'block'}`}>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl min-h-full relative overflow-hidden">
            
            {/* Mobile Back Button */}
            <button 
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors font-medium text-sm bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Menu
            </button>

            {/* Top highlight line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

            {activeTab === 'personal' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Personal Information</h2>
                    <p className="text-slate-400 text-sm">Update your profile details and contact information.</p>
                  </div>
                  <button type="button" onClick={() => profileFormRef.current?.querySelector<HTMLInputElement>('input[name="firstName"]')?.focus()} aria-label="Edit personal information" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors border border-slate-700">
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>

                <form
                  key={`${user.name}:${email}:${phone}`}
                  ref={profileFormRef}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  onSubmit={handleProfileUpdate}
                >
                  <div className="group">
                    <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-slate-400 group-focus-within:text-blue-400 transition-colors">First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      defaultValue={firstName} 
                      className="w-full p-4 bg-slate-950/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all shadow-inner font-medium text-lg" 
                    />
                  </div>
                  <div className="group">
                    <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-slate-400 group-focus-within:text-blue-400 transition-colors">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      defaultValue={lastName} 
                      className="w-full p-4 bg-slate-950/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all shadow-inner font-medium text-lg" 
                    />
                  </div>

                  <div className="md:col-span-2 group">
                    <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-slate-400 group-focus-within:text-blue-400 transition-colors">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        name="email"
                        defaultValue={email} 
                        className="w-full p-4 pl-12 bg-slate-950/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all shadow-inner font-medium text-lg" 
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                  </div>

                  <div className="md:col-span-2 group">
                    <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-slate-400 group-focus-within:text-blue-400 transition-colors">Phone Number</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        name="phone"
                        defaultValue={phone} 
                        className="w-full p-4 pl-12 bg-slate-950/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all shadow-inner font-medium text-lg" 
                      />
                      <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-800 flex justify-end gap-4">
                    <button type="button" onClick={() => profileFormRef.current?.reset()} className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isUpdating} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 flex items-center gap-2">
                      {isUpdating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'elite' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                      <Star className="w-8 h-8 text-amber-500 fill-amber-500" /> Elite Membership
                    </h2>
                    <p className="text-slate-400 text-sm">Unlock wholesale pricing, direct seller contact, and priority support.</p>
                  </div>
                </div>
                
                <div className="max-w-3xl mx-auto">
                  <div className="relative p-1 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="bg-slate-950 rounded-[22px] p-8 lg:p-12 relative z-10 overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Star className="w-48 h-48 text-amber-500 fill-amber-500" />
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                        <div className="flex-1">
                          <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-widest rounded-full mb-4">
                            Premium Plan
                          </div>
                          <h3 className="text-4xl font-bold text-white mb-4">MarkatVerse <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Elite</span></h3>
                          
                          <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-slate-300">
                              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                              <span>Access to <strong className="text-white">Wholesale Pricing</strong> on retail items</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                              <span>Directly <strong className="text-white">call and contact suppliers</strong></span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                              <span>0% Platform convenience fees on bulk orders</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                              <span>24/7 Priority VIP Support</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="w-full md:w-[280px] bg-slate-900 rounded-2xl p-6 border border-slate-800 text-center shrink-0">
                          <div className="text-slate-400 text-sm font-semibold mb-2">Annual Subscription</div>
                          <div className="text-5xl font-bold text-white mb-2">₹1,999</div>
                          <div className="text-slate-500 text-xs mb-6">per year, billed annually</div>
                          
                          <button disabled className="w-full cursor-not-allowed rounded-xl bg-slate-700 py-4 text-lg font-bold text-slate-300 opacity-70" title="Membership checkout is not configured">
                            Membership checkout unavailable
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Payment Methods</h2>
                <p className="text-slate-400 text-sm mb-8 border-b border-slate-800 pb-6">Saved payment methods are unavailable because secure payment-method management is not configured.</p>
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-sm text-slate-400">
                  No payment details are stored in this profile. Payment information is collected only through an enabled checkout provider.
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <ShippingAddressesTab user={user} />
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 border-b border-slate-800 pb-6">
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Order History</h2>
                  <p className="text-slate-400 text-sm">Your recent orders and their current status.</p>
                </div>
                {isProfileDataLoading ? (
                  <p className="py-10 text-center text-slate-400">Loading your orders…</p>
                ) : profileDataError ? (
                  <p role="alert" className="py-10 text-center text-red-300">{profileDataError}</p>
                ) : orders.length === 0 ? (
                  <p className="py-10 text-center text-slate-400">No orders found for this account.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <article key={order.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-white">Order {order.orderNumber || order.id}</h3>
                            <p className="mt-1 text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">{order.status}</span>
                        </div>
                        <div className="mt-4 space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between gap-4 text-sm text-slate-300">
                              <span>{item.productName || 'Item'} × {item.quantity}</span>
                              <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-slate-800 pt-3 text-right font-bold text-white">
                          Total: ₹{Number(order.total || 0).toLocaleString('en-IN')}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                      <Bell className="w-7 h-7 text-blue-500" /> Notifications & Alerts
                    </h2>
                    <p className="text-slate-400 text-sm">Stay updated with your orders, messages, and account security.</p>
                  </div>
                  <button
                    onClick={handleTogglePush}
                    disabled={isPushLoading}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md self-start sm:self-auto ${
                      isPushSubscribed 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    {isPushLoading ? 'Connecting…' : isPushSubscribed ? 'Web Push Active (Click to Pause)' : 'Enable Browser Push Notifications'}
                  </button>
                </div>


                <div className="space-y-4">
                  {isProfileDataLoading ? (
                    <div className="py-10 text-center text-slate-400">Loading notifications…</div>
                  ) : profileDataError ? (
                    <div role="alert" className="py-10 text-center text-red-300">{profileDataError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isSecurity = notif.triggerType.includes('LOGIN') || notif.triggerType.includes('SECURITY');
                      const isOrder = notif.triggerType.includes('ORDER');
                      return (
                        <div key={notif.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex gap-4 items-start relative overflow-hidden group">
                          {isOrder && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                          {isSecurity && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>}
                          
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border 
                            ${isSecurity ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                            : isOrder ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                            : 'bg-amber-500/20 border-amber-500/30 text-amber-400'}`}>
                            {isSecurity ? <ShieldCheck className="w-6 h-6" /> : isOrder ? <Package className="w-6 h-6" /> : <Star className="w-6 h-6" />}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-white font-bold text-base">{notif.title || notif.triggerType}</h4>
                              <span className="text-xs text-slate-500 font-medium">{new Date(notif.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed mb-3">{notif.message}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-500" /> Security & Privacy
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">Manage your password, 2FA, and data privacy.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left Column */}
                  <div className="space-y-5">
                    {/* Change Password */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                          <Key className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">Change Password</h3>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
                          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <button onClick={handlePasswordUpdate} disabled={isUpdating} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 rounded-lg transition-colors">
                          {isUpdating ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>

                    {/* Two Factor Authentication */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-900/30 rounded-lg flex items-center justify-center border border-emerald-800/50">
                          <Smartphone className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">Two-Factor Auth (2FA)</h3>
                          <p className="text-slate-400 text-[10px] mt-0.5 max-w-[200px]">Require a code upon login.</p>
                        </div>
                      </div>
                      <button disabled title="Multi-factor authentication is not configured" className="cursor-not-allowed rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-500">
                        Not available
                      </button>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    {/* Active Sessions */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                          <Laptop className="w-4 h-4 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white">Active Sessions</h3>
                      </div>
                      <p className="text-slate-500 text-xs">
                        Only this browser session is available. Remote session management is not configured.
                      </p>
                    </div>

                    {/* Data & Privacy */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white">Data & Privacy</h3>
                      </div>
                      <div className="flex gap-3">
                        <button disabled title="Data export is not configured" className="flex-1 cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950 p-3 text-left opacity-60">
                          <Download className="w-4 h-4 text-blue-400 mb-1.5" />
                          <div className="text-xs font-bold text-white">Export unavailable</div>
                        </button>
                        <button disabled title="Account deletion must be implemented with secure ownership checks" className="flex-1 cursor-not-allowed rounded-xl border border-red-900/30 bg-slate-950 p-3 text-left opacity-60">
                          <Trash2 className="w-4 h-4 text-red-400 mb-1.5" />
                          <div className="text-xs font-bold text-white">Deletion unavailable</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Heart className="w-7 h-7 text-red-500" /> My Wishlist
                    </h2>
                    <p className="text-slate-400 mt-1">Items you&apos;ve saved for later.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlistIds.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 text-center py-12">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                        <Heart className="w-8 h-8 text-slate-500" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1">Your wishlist is empty</h3>
                      <p className="text-slate-400 text-sm">Explore products and services to save them here.</p>
                      <Link href="/explore" className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors">
                        Explore Now
                      </Link>
                    </div>
                  ) : (
                    wishlistIds.map((id) => {
                      const product = products.find(p => p.id === id);
                      if (!product) return null;
                      return (
                        <div key={id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex gap-4 hover:border-slate-600 transition-colors group">
                          <div className="w-24 h-24 bg-slate-700 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag className="w-8 h-8 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">{product.category}</div>
                              <h4 className="text-white font-bold text-sm line-clamp-2">{product.name}</h4>
                              <div className="text-white font-black mt-1">₹{product.price?.toLocaleString('en-IN') || '0'}</div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-700/50">
                              <button 
                                onClick={() => removeFromWishlist(id)}
                                className="text-xs font-bold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                              <button 
                                onClick={() => {
                                  addToCart({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price || 0,
                                    image: product.image,
                                    sellerId: product.sellerId || product.seller
                                  });
                                  removeFromWishlist(id);
                                  toast.success('Moved to cart');
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                              >
                                Move to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

// Helper icons missing from standard import
function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}
