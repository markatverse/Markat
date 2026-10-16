"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type WishlistContextType = {
  wishlistIds: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('markatverse_wishlist');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('markatverse_wishlist', JSON.stringify(wishlistIds));
    }
  }, [wishlistIds, isLoaded]);

  const addToWishlist = (productId: string) => {
    setWishlistIds(prev => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistIds(prev => prev.filter(id => id !== productId));
  };

  const toggleWishlist = (productId: string) => {
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
