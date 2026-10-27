"use client";
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import TopBannerWidget from './TopBannerWidget';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar on checkout, seller dashboard, admin portals, and standalone kiosk pages
  if (
    pathname === '/checkout' ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/seller/dashboard') || 
    pathname?.startsWith('/seller/onboarding') ||
    pathname?.startsWith('/seller/login') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/admin') ||
    pathname === '/salon/join'
  ) {
    return null;
  }

  return (
    <>
      <TopBannerWidget />
      <Navbar />
      <BottomNav />
    </>
  );
}
