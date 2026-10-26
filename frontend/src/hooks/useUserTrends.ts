import { useState, useEffect, useCallback } from 'react';

export interface UserTrends {
  categories: Record<string, number>;
  recentlyViewed: string[];
}

export function useUserTrends() {
  const [trends, setTrends] = useState<UserTrends>({ categories: {}, recentlyViewed: [] });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('markatverse_trends');
      if (stored) {
        setTrends(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const trackCategory = useCallback((category: string) => {
    if (!category) return;
    setTrends(prev => {
      const newTrends = { ...prev };
      newTrends.categories = { ...prev.categories };
      newTrends.categories[category] = (newTrends.categories[category] || 0) + 1;
      localStorage.setItem('markatverse_trends', JSON.stringify(newTrends));
      return newTrends;
    });
  }, []);

  const trackProductView = useCallback((productId: string) => {
    if (!productId) return;
    setTrends(prev => {
      const newTrends = { ...prev };
      const filtered = prev.recentlyViewed.filter(id => id !== productId);
      newTrends.recentlyViewed = [productId, ...filtered].slice(0, 12); // Keep last 12 views
      localStorage.setItem('markatverse_trends', JSON.stringify(newTrends));
      return newTrends;
    });
  }, []);

  const getTopCategories = useCallback(() => {
    return Object.entries(trends.categories)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
  }, [trends.categories]);

  return { trends, trackCategory, trackProductView, getTopCategories };
}
