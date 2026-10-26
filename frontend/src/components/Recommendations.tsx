"use client";
import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useUserTrends } from '@/hooks/useUserTrends';
import { useProducts } from '@/context/ProductContext';
import { getApiUrl, fastFetch } from '@/utils/api';

const API_URL = getApiUrl();

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { trends, getTopCategories } = useUserTrends();
  const { products: contextProducts } = useProducts();
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const endpoint = user?.id
          ? `/recommendations?userId=${user.id}`
          : `/recommendations`;
        const data = await fastFetch<any[]>(endpoint, { ttlMs: 30000 });
        if (data && Array.isArray(data)) {
          setRecommendations(data);
        }
      } catch (e) {
        console.error('Failed to fetch recommendations:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [user?.id]);

  const handleClick = async (item: any) => {
    // Log interaction
    try {
      await fetch(`${API_URL}/recommendations/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          productId: item.itemType === 'product' ? item.id : undefined,
          serviceId: item.itemType === 'service' ? item.id : undefined,
          type: 'CLICK'
        })
      });
    } catch (e) {
      console.error('Failed to log interaction', e);
    }
    const isService = item.itemType === 'service' || item.type === 'SERVICE';
    const targetRoute = isService ? `/service/${item.id}` : `/product/${item.id}`;
    window.open(targetRoute, '_blank', 'noopener,noreferrer');
  };

  const handleMouseEnter = (item: any) => {
    fetch(`${API_URL}/recommendations/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.id || null,
        productId: item.itemType === 'product' ? item.id : undefined,
        serviceId: item.itemType === 'service' ? item.id : undefined,
        type: 'VIEW'
      })
    }).catch(() => {});
  };

  if (loading) {
    return (
      <section className="mt-4">
        <div className="flex justify-between items-end border-b border-slate-200 pb-3 mb-4">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Recommended For You</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-[145px] sm:w-[170px] shrink-0 bg-slate-200 rounded-xl h-32 animate-pulse snap-start" />
          ))}
        </div>
      </section>
    );
  }

  // Filter out any items that the user has recently viewed
  const recentIds = new Set(trends.recentlyViewed || []);
  const unviewedRecs = recommendations.filter(
    (item) => item.images?.[0] && !recentIds.has(item.id)
  );

  let realItems = [...unviewedRecs];

  // If there are fewer than 12 recommendations after excluding recent items,
  // backfill with high-quality candidates from contextProducts that have NOT been recently viewed
  if (realItems.length < 12 && contextProducts && contextProducts.length > 0) {
    const existingIds = new Set(realItems.map((r) => r.id));
    const topCategories = getTopCategories();

    const candidates = contextProducts
      .filter((p) => p.image && !recentIds.has(p.id) && !existingIds.has(p.id))
      .sort((a, b) => {
        const catA = topCategories.indexOf(a.category);
        const catB = topCategories.indexOf(b.category);
        const scoreA = catA !== -1 ? topCategories.length - catA : 0;
        const scoreB = catB !== -1 ? topCategories.length - catB : 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return Number(b.rating || 0) - Number(a.rating || 0);
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        images: [p.image],
        category: p.category,
        subcategory: p.subcategory,
        seller: p.seller,
        primaryType: p.primaryType,
        parameters: p.parameters,
        itemType: (p.primaryType === 'SERVICE' || (p.category && ['service', 'salon', 'spa', 'doctor', 'repair', 'cleaning'].some(s => p.category.toLowerCase().includes(s)))) ? 'service' : 'product'
      }));

    realItems = [...realItems, ...candidates].slice(0, 12);
  }

  if (realItems.length === 0) return null;

  return (
    <section className="mt-4">
      <div className="flex justify-between items-end border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Star className="text-indigo-500 w-4 h-4" />
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Recommended For You</h2>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory">
        {realItems.map((item) => {
          const typeStr = (item.primaryType || item.type || item.itemType || '').toUpperCase();
          const catStr = `${item.categoryName || ''} ${item.category || ''} ${item.subcategory || ''} ${item.name || ''} ${item.title || ''}`.toLowerCase();
          
          const serviceKeywords = [
            'service', 'salon', 'saloon', 'spa', 'beauty parlour', 'parlor', 'haircut', 'trim',
            'restaurant', 'dining', 'food & dining', 'cafe', 'food', 'table', 'dine-in', 'takeaway',
            'doctor', 'clinic', 'healthcare', 'medical', 'hospital', 'dentist', 'physiotherapy',
            'repair', 'plumber', 'electrician', 'carpenter', 'mechanic', 'cleaning',
            'wedding', 'consultant', 'lawyer', 'organizer', 'transport', 'rental'
          ];
          
          const isService = typeStr === 'SERVICE' || 
            item.itemType === 'service' ||
            !!item.parameters?.bookingModel ||
            serviceKeywords.some(k => catStr.includes(k));
          
          return (
            <div
              key={item.id}
              className="w-[145px] sm:w-[170px] shrink-0 snap-start bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-300 transition-all group cursor-pointer"
              onMouseEnter={() => handleMouseEnter(item)}
              onClick={() => handleClick({ ...item, itemType: isService ? 'service' : 'product' })}
              onAuxClick={(e) => {
                if (e.button === 1) {
                  handleClick({ ...item, itemType: isService ? 'service' : 'product' });
                }
              }}
            >
              <div className="h-24 sm:h-28 bg-slate-50 relative overflow-hidden flex items-center justify-center">
                <img
                  src={item.images[0]}
                  alt={item.name || item.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute top-2 left-2 text-white text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md shadow-xs ${
                  isService ? 'bg-purple-600' : 'bg-blue-600'
                }`}>
                  {isService ? 'SERVICE' : 'PRODUCT'}
                </div>
              </div>

              <div className="p-2.5">
                <h3 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors mb-0.5">
                  {item.name || item.title}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-black text-slate-900">₹{(item.price ?? 0).toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-slate-400 font-medium truncate max-w-[50%]">
                    {item.seller?.name || item.seller?.storeName || item.seller || ''}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
