"use client";
import { useParams } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import ProductGrid from '@/components/ProductGrid';

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  
  const { products } = useProducts();
  
  // Basic mapping of slugs to our simple categories
  let targetCategory = "All";
  if (slug === 'electronics' || slug === 'mobiles') targetCategory = "Electronics";
  else if (slug === 'fashion') targetCategory = "Fashion";
  else if (slug === 'home') targetCategory = "Home";
  else if (slug === 'services' || slug === 'salon') targetCategory = "Services";
  
  const filteredProducts = targetCategory === "All" || slug === 'all' 
    ? products 
    : products.filter(p => (p.category || '').toLowerCase() === targetCategory.toLowerCase());

  const displayTitle = slug === 'all' ? "All Categories" : slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ');

  return (
    <div className="max-w-[1400px] mx-auto p-5 min-h-[calc(100vh-80px)] text-white">
      <h1 className="text-3xl font-medium mb-6">{displayTitle}</h1>
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
