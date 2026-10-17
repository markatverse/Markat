"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type WishlistContextType = {
  wishlistIds: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('markatverse_wishlist');
      if (stored) {
        setWishlistIds(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('markatverse_wishlist', JSON.stringify(wishlistIds));
    }
  }, [wishlistIds, isLoaded]);

  const redirectToLogin = () => {
    toast.error('Please log in to save items to your wishlist');
    if (typeof window !== 'undefined') {
      const redirectPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    } else {
      router.push('/login');
    }
  };

  const addToWishlist = (productId: string) => {
    if (!user) {
      redirectToLogin();
      return;
    }
    setWishlistIds(prev => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistIds(prev => prev.filter(id => id !== productId));
  };

  const toggleWishlist = (productId: string) => {
    if (!user) {
      redirectToLogin();
      return;
    }
    setWishlistIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    // Return safe fallback so dynamically loaded/SSR components never crash
    return {
      wishlistIds: [],
      addToWishlist: () => {},
      removeFromWishlist: () => {},
      toggleWishlist: () => {},
      isInWishlist: () => false,
    };
  }
  return context;
}
