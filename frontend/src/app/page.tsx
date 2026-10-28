import { getApiUrl } from "@/utils/api";
import HomeSectionsContainer from "@/components/HomeSectionsContainer";

export const dynamic = 'force-dynamic';

async function getAdvertisements() {
  try {
    const apiUrl = getApiUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      let res = await fetch(`${apiUrl}/commercial/advertisements`, {
        cache: 'no-store',
        signal: controller.signal,
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${apiUrl}/content/advertisements`, {
          cache: 'no-store',
          signal: controller.signal,
        }).catch(() => null);
      }
      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json().catch(() => []);
        return Array.isArray(data)
          ? data.filter((ad: any) => ad.status === 'ACTIVE' && (ad.position === 'HOMEPAGE' || !ad.position))
          : [];
      }
    } catch {
      clearTimeout(timeoutId);
      return [];
    }
  } catch {
    // Graceful fallback
  }
  return [];
}

async function getBanners() {
  try {
    const apiUrl = getApiUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(`${apiUrl}/content/banners`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res && res.ok) {
        const data = await res.json().catch(() => []);
        return Array.isArray(data)
          ? data.filter((banner: any) => banner.status === 'ACTIVE' && (banner.position === 'HOME_HERO' || banner.position === 'HOMEPAGE' || !banner.position))
          : [];
      }
    } catch {
      clearTimeout(timeoutId);
      return [];
    }
  } catch {
    // Graceful fallback
  }
  return [];
}

const FALLBACK_BLOG_POSTS = [
  {
    id: 'post-1',
    title: 'Top 10 Hyperlocal Shopping Secrets Across India',
    slug: 'top-10-hyperlocal-shopping-secrets-india',
    content: 'Discover how MarkatVerse connects buyers directly to trusted neighborhood merchants with same-day delivery and live token tracking.',
    author: 'MarkatVerse Editorial',
    featuredImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    status: 'PUBLISHED',
  },
  {
    id: 'post-2',
    title: 'How Live Token Queue Tracking is Transforming Local Salons',
    slug: 'live-token-queue-salon-transformation',
    content: 'Salons and barbers are saving hours of waiting time with real-time token queues and instant slot notifications.',
    author: 'Services Team',
    featuredImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    status: 'PUBLISHED',
  },
  {
    id: 'post-3',
    title: 'B2B Trade & Wholesale: Unlocking Margin Growth for MSMEs',
    slug: 'b2b-trade-wholesale-msme-growth',
    content: 'How small businesses are procuring raw materials and bulk products at manufacturer prices with transparent RFQs.',
    author: 'Trade Desk',
    featuredImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    status: 'PUBLISHED',
  },
];

async function getBlogPosts() {
  try {
    const apiUrl = getApiUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(`${apiUrl}/content/blog`, {
        next: { revalidate: 60 },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res && res.ok) {
        const data = await res.json().catch(() => []);
        if (Array.isArray(data)) {
          const published = data.filter((post: any) => post.status === 'PUBLISHED').slice(0, 3);
          if (published.length > 0) return published;
        }
      }
    } catch {
      clearTimeout(timeoutId);
    }
  } catch {
    // Graceful fallback
  }
  return FALLBACK_BLOG_POSTS;
}

async function getHomepageLayout() {
  try {
    const apiUrl = getApiUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(`${apiUrl}/content/homepage-layout`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      clearTimeout(timeoutId);
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

export default async function Home() {
  const [blogPosts, serverBanners, serverAds, initialLayout] = await Promise.all([
    getBlogPosts(),
    getBanners(),
    getAdvertisements(),
    getHomepageLayout(),
  ]);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex bg-slate-50">
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3 lg:pt-4 pb-6 sm:pb-10 flex flex-col gap-2 sm:gap-4 overflow-hidden">
        <HomeSectionsContainer
          initialLayout={initialLayout}
          serverBanners={serverBanners}
          serverAds={serverAds}
          blogPosts={blogPosts}
        />
      </main>
    </div>
  );
}
