"use client";
import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';

export default function Footer() {
  const { isSectorActive } = useSettings();
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 pb-24 md:py-16 md:pb-16 border-t border-slate-800">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4 hover:opacity-90 transition-opacity">
              <img 
                src="/logo-optimized.webp" 
                alt="MarkatVerse" 
                loading="lazy"
                decoding="async"
                className="h-20 object-contain brightness-0 invert" 
              />
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
              Your premium global marketplace connecting buyers, sellers, and services instantly and securely.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-400 hover:text-white transition-colors cursor-pointer" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.557z"/></svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/143944654/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer" 
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white transition-colors cursor-pointer" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a 
                href="https://www.instagram.com/markatverse/?hl=en" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white transition-colors cursor-pointer" 
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold mb-4">Categories</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/category/electronics" className="hover:text-blue-400 transition-colors">Electronics</Link></li>
              <li><Link href="/category/fashion" className="hover:text-blue-400 transition-colors">Fashion</Link></li>
              <li><Link href="/category/home" className="hover:text-blue-400 transition-colors">Home & Living</Link></li>
              {isSectorActive('b2b') && (
                <li><Link href="/search?filter=b2b" className="hover:text-blue-400 transition-colors">B2B Wholesale</Link></li>
              )}
              <li><Link href="/categories" className="hover:text-blue-400 transition-colors">All Categories</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold mb-4">Services</h4>
            <ul className="flex flex-col gap-3 text-sm">
              {isSectorActive('home') && (
                <li><Link href="/search?cat=Home Services" className="hover:text-blue-400 transition-colors">Home Repairs</Link></li>
              )}
              {isSectorActive('salon') && (
                <li><Link href="/search?cat=Services" className="hover:text-blue-400 transition-colors">Salon & Beauty</Link></li>
              )}
              {isSectorActive('events') && (
                <li><Link href="/search?cat=Organizers" className="hover:text-blue-400 transition-colors">Event Organizers</Link></li>
              )}
              {isSectorActive('transport') && (
                <li><Link href="/search?cat=Transport" className="hover:text-blue-400 transition-colors">Transport & Rentals</Link></li>
              )}
            </ul>
          </div>

          {/* Support & Company */}
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
              <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} MarkatVerse. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Secure Payments</span>
            <span>Verified Sellers</span>
            <span>Global Reach</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
