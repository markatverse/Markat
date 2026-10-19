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
  subcategory?: string;
  sellerId?: string;
  seller?: string;
  location?: string;
  description?: string;
  parameters?: Record<string, any>;
  sku?: string;
  badge?: string;
  rating?: string | number;
  reviews?: string | number;
};

type CartContextType = {
  items: CartItem[];
  savedItems: CartItem[];
  isLoaded: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>) => boolean;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeSaved: (id: string) => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore cart and saved items from localStorage after initial client mount to avoid hydration mismatch
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('markatverse_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedSaved = localStorage.getItem('markatverse_saved_for_later');
      if (storedSaved) {
        setSavedItems(JSON.parse(storedSaved));
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
      localStorage.setItem('markatverse_saved_for_later', JSON.stringify(savedItems));
    } catch {
      // Ignore quota errors
    }
  }, [items, savedItems, isLoaded]);

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

  const saveForLater = (id: string) => {
    const itemToSave = items.find(item => item.id === id);
    if (!itemToSave) return;
    setItems(prev => prev.filter(item => item.id !== id));
    setSavedItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) return prev;
      return [itemToSave, ...prev];
    });
    toast.success('Moved to Saved For Later');
  };

  const moveToCart = (id: string) => {
    const itemToMove = savedItems.find(item => item.id === id);
    if (!itemToMove) return;
    setSavedItems(prev => prev.filter(item => item.id !== id));
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + itemToMove.quantity } : i);
      }
      return [...prev, itemToMove];
    });
    toast.success('Moved back to Cart');
  };

  const removeSaved = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
    toast.success('Removed from Saved For Later');
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      savedItems,
      isLoaded,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      saveForLater,
      moveToCart,
      removeSaved,
      total,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    return {
      items: [],
      savedItems: [],
      isLoaded: false,
      addToCart: () => false,
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      saveForLater: () => {},
      moveToCart: () => {},
      removeSaved: () => {},
      total: 0,
      totalItems: 0,
      totalPrice: 0,
    };
  }
  return context;
}
