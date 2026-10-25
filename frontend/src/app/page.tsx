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
        return Array.isArray(data)
          ? data.filter((post: any) => post.status === 'PUBLISHED').slice(0, 3)
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
