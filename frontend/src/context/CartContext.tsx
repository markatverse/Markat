"use client";
import React, { createContext, useContext, useState } from 'react';

import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  sellerId?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => boolean;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore cart from localStorage after initial client mount to avoid hydration mismatch
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('markatverse_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore parse/storage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage only after initial load has finished
  React.useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('markatverse_cart', JSON.stringify(items));
    } catch {
      // Ignore quota errors
    }
  }, [items, isLoaded]);

  const addToCart = (product: Omit<CartItem, 'quantity'>): boolean => {
    if (!user) {
      toast.error('Please log in to add items to your cart');
      if (typeof window !== 'undefined') {
        const redirectPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      } else {
        router.push('/login');
      }
      return false;
    }

    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    return true;
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    return {
      items: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      totalItems: 0,
      totalPrice: 0,
    };
  }
  return context;
}
