import { MetadataRoute } from 'next';
import { getApiUrl } from '@/utils/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://markatverse.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/b2b`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/seller/register`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamically fetch published categories and products if API is reachable
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = getApiUrl();
    const [catRes, prodRes] = await Promise.allSettled([
      fetch(`${apiUrl}/categories`, { next: { revalidate: 3600 } }),
      fetch(`${apiUrl}/products?limit=100`, { next: { revalidate: 3600 } }),
    ]);

    if (catRes.status === 'fulfilled' && catRes.value.ok) {
      const categories = await catRes.value.json();
      if (Array.isArray(categories)) {
        categories.forEach((cat: any) => {
          if (cat.slug || cat.id) {
            dynamicRoutes.push({
              url: `${baseUrl}/category/${cat.slug || cat.id}`,
              lastModified: new Date(cat.updatedAt || Date.now()),
              changeFrequency: 'weekly',
              priority: 0.7,
            });
          }
        });
      }
    }

    if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
      const prodData = await prodRes.value.json();
      const products = Array.isArray(prodData) ? prodData : (prodData.products || []);
      if (Array.isArray(products)) {
        products.forEach((prod: any) => {
          if (prod.id) {
            dynamicRoutes.push({
              url: `${baseUrl}/product/${prod.id}`,
              lastModified: new Date(prod.updatedAt || Date.now()),
              changeFrequency: 'weekly',
              priority: 0.7,
            });
          }
        });
      }
    }
  } catch {
    // Graceful fallback to static routes during isolated builds
  }

  return [...staticRoutes, ...dynamicRoutes];
}
