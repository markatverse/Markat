import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class ContentService {
  private bannersCache: { data: any; expiry: number } | null = null;
  private adsCache: { data: any; expiry: number } | null = null;
  private blogCache: { data: any; expiry: number } | null = null;
  private layoutCache: { data: any; expiry: number } | null = null;

  constructor(private prisma: PrismaService) {}

  // --- CMS Pages ---
  async getCmsPages() {
    return this.prisma.cmsPage.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async getCmsPageById(id: string) {
    return this.prisma.cmsPage.findUnique({ where: { id } });
  }

  async createCmsPage(data: any) {
    return this.prisma.cmsPage.create({ data });
  }

  async updateCmsPage(id: string, data: any) {
    return this.prisma.cmsPage.update({ where: { id }, data });
  }

  async deleteCmsPage(id: string) {
    return this.prisma.cmsPage.delete({ where: { id } });
  }

  // --- Banners ---
  async getBanners() {
    if (this.bannersCache && Date.now() < this.bannersCache.expiry) {
      return this.bannersCache.data;
    }
    try {
      const banners = await this.prisma.banner.findMany({ take: 100 });
      const sorted = (banners || []).sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      this.bannersCache = { data: sorted, expiry: Date.now() + 30000 };
      return sorted;
    } catch (err: any) {
      console.error('Error in getBanners:', err?.message || err);
      return [];
    }
  }

  async getBannerById(id: string) {
    try {
      return await this.prisma.banner.findUnique({ where: { id } });
    } catch (err: any) {
      console.error('Error in getBannerById:', err?.message || err);
      return null;
    }
  }

  async createBanner(data: any) {
    this.bannersCache = null;
    try {
      return await this.prisma.banner.create({ data });
    } catch (err: any) {
      console.error('Error in createBanner:', err?.message || err);
      throw err;
    }
  }

  async updateBanner(id: string, data: any) {
    this.bannersCache = null;
    return this.prisma.banner.update({ where: { id }, data });
  }

  async deleteBanner(id: string) {
    this.bannersCache = null;
    return this.prisma.banner.delete({ where: { id } });
  }

  // --- Advertisements ---
  async getAdvertisements() {
    if (this.adsCache && Date.now() < this.adsCache.expiry) {
      return this.adsCache.data;
    }
    try {
      const ads = await this.prisma.advertisement.findMany({ take: 100 });
      const sorted = (ads || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.adsCache = { data: sorted, expiry: Date.now() + 30000 };
      return sorted;
    } catch (err: any) {
      console.error('Error in ContentService.getAdvertisements:', err?.message || err);
      return [];
    }
  }

  async getAdvertisementById(id: string) {
    try {
      return await this.prisma.advertisement.findUnique({ where: { id } });
    } catch (err: any) {
      console.error('Error in ContentService.getAdvertisementById:', err?.message || err);
      return null;
    }
  }

  async createAdvertisement(data: any) {
    this.adsCache = null;
    try {
      return await this.prisma.advertisement.create({ data });
    } catch (err: any) {
      console.error('Error in ContentService.createAdvertisement:', err?.message || err);
      throw err;
    }
  }

  async updateAdvertisement(id: string, data: any) {
    this.adsCache = null;
    return this.prisma.advertisement.update({ where: { id }, data });
  }

  async deleteAdvertisement(id: string) {
    this.adsCache = null;
    return this.prisma.advertisement.delete({ where: { id } });
  }

  // --- Blog Posts ---
  async getBlogPosts() {
    if (this.blogCache && Date.now() < this.blogCache.expiry) {
      return this.blogCache.data;
    }
    const posts = await this.prisma.blogPost.findMany({ orderBy: { updatedAt: 'desc' }, take: 100 });
    this.blogCache = { data: posts, expiry: Date.now() + 30000 };
    return posts;
  }

  async getBlogPostById(id: string) {
    return this.prisma.blogPost.findUnique({ where: { id } });
  }

  async createBlogPost(data: any) {
    this.blogCache = null;
    return this.prisma.blogPost.create({ data });
  }

  async updateBlogPost(id: string, data: any) {
    this.blogCache = null;
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async deleteBlogPost(id: string) {
    this.blogCache = null;
    return this.prisma.blogPost.delete({ where: { id } });
  }

  // --- SEO Metadata ---
  async getSeoMetadata() {
    return this.prisma.seoMetadata.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async getSeoMetadataById(id: string) {
    return this.prisma.seoMetadata.findUnique({ where: { id } });
  }

  async createSeoMetadata(data: any) {
    return this.prisma.seoMetadata.create({ data });
  }

  async updateSeoMetadata(id: string, data: any) {
    return this.prisma.seoMetadata.update({ where: { id }, data });
  }

  async deleteSeoMetadata(id: string) {
    return this.prisma.seoMetadata.delete({ where: { id } });
  }

  // --- Homepage Layout Configuration ---
  async getHomepageLayout() {
    if (this.layoutCache && Date.now() < this.layoutCache.expiry) {
      return this.layoutCache.data;
    }
    try {
      const config = await this.prisma.systemConfig.findUnique({
        where: { key: 'HOMEPAGE_LAYOUT' },
      });
      if (config && config.value) {
        try {
          const parsed = JSON.parse(config.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(parsed.map((s: any) => s.id));
            const missing = DEFAULT_HOMEPAGE_SECTIONS.filter((s: any) => !existingIds.has(s.id));
            let result = parsed;
            if (missing.length > 0) {
              const merged = [...parsed];
              for (const m of missing) {
                const targetIdx = merged.findIndex((s: any) => s.order >= m.order);
                if (targetIdx !== -1) {
                  merged.splice(targetIdx, 0, m);
                } else {
                  merged.push(m);
                }
              }
              result = merged.map((s: any, idx: number) => ({ ...s, order: idx + 1 }));
            }
            this.layoutCache = { data: result, expiry: Date.now() + 30000 };
            return result;
          }
        } catch { }
      }
    } catch (err: any) {
      console.error('Error fetching homepage layout config:', err?.message || err);
    }
    this.layoutCache = { data: DEFAULT_HOMEPAGE_SECTIONS, expiry: Date.now() + 30000 };
    return DEFAULT_HOMEPAGE_SECTIONS;
  }

  async updateHomepageLayout(sections: any[]) {
    this.layoutCache = null;
    try {
      const serialized = JSON.stringify(sections);
      await this.prisma.systemConfig.upsert({
        where: { key: 'HOMEPAGE_LAYOUT' },
        update: { value: serialized },
        create: {
          key: 'HOMEPAGE_LAYOUT',
          value: serialized,
          description: 'Homepage section arrangement and visibility configuration',
        },
      });
      return sections;
    } catch (err: any) {
      console.error('Error updating homepage layout config:', err?.message || err);
      throw err;
    }
  }
}

export const DEFAULT_HOMEPAGE_SECTIONS = [
  {
    id: 'banners',
    label: 'Promo & Hero Banners',
    description: 'Top rotating campaign and announcement banners slideshow',
    badge: 'Hero',
    category: 'banner',
    visible: true,
    order: 1,
  },
  {
    id: 'advertisements',
    label: 'Sponsored Advertisements',
    description: 'Targeted ad campaigns and marketplace brand highlights',
    badge: 'Ads',
    category: 'banner',
    visible: true,
    order: 2,
  },
  {
    id: 'live_booking',
    label: 'Live Token & Queue Status',
    description: 'Real-time live queue tracking and quick booking widget',
    badge: 'Interactive',
    category: 'services',
    visible: true,
    order: 3,
  },
  {
    id: 'quick_shortcuts',
    label: 'Quick Category Shortcuts',
    description: 'Circular top category links (Deals, Food, Salon, Services, Mobiles)',
    badge: 'Navigation',
    category: 'navigation',
    visible: true,
    order: 4,
  },
  {
    id: 'dual_hero',
    label: 'Dual Hero Hub (B2B, B2C, Services)',
    description: 'Split hero gateway banners with direct portal shortcuts',
    badge: 'Featured',
    category: 'navigation',
    visible: true,
    order: 5,
  },
  {
    id: 'categories_services',
    label: 'Browse Categories & Services',
    description: 'Everything You Need & Solutions That Drive Your Success panels',
    badge: 'Core Hub',
    category: 'navigation',
    visible: true,
    order: 6,
  },
  {
    id: 'recommendations',
    label: 'AI Recommendations',
    description: 'Personalized product and service recommendations for visitors',
    badge: 'Smart AI',
    category: 'products',
    visible: true,
    order: 7,
  },
  {
    id: 'top_picks',
    label: 'Top Picks For You',
    description: 'Trending and curated product collection grid',
    badge: 'Products',
    category: 'products',
    visible: true,
    order: 8,
  },
  {
    id: 'services_for_you',
    label: 'Services For You',
    description: 'Verified salon, dining, repair, and professional services',
    badge: 'Services',
    category: 'services',
    visible: true,
    order: 9,
  },
  {
    id: 'products_for_you',
    label: 'Products For You',
    description: 'Trending physical products, retail electronics, fashion, and goods',
    badge: 'Products',
    category: 'products',
    visible: true,
    order: 10,
  },
  {
    id: 'recently_viewed',
    label: 'Recently Viewed Products',
    description: 'Horizontal scrollable row preserving customer browsing history',
    badge: 'History',
    category: 'products',
    visible: true,
    order: 11,
  },
  {
    id: 'global_hubs',
    label: 'Global Markets & Hubs',
    description: 'Specialized enterprise cards for B2B, Construction, Events & Logistics',
    badge: 'Hubs',
    category: 'navigation',
    visible: true,
    order: 12,
  },
  {
    id: 'trust_badges',
    label: 'Trust & Assurance Badges',
    description: 'Secure payment, quality assured, and 7-day refund policy row',
    badge: 'Assurance',
    category: 'trust',
    visible: true,
    order: 13,
  },
  {
    id: 'blog_posts',
    label: 'Latest News & From Our Blog',
    description: 'Marketplace news, helpful merchant tips, and customer guides',
    badge: 'Editorial',
    category: 'content',
    visible: true,
    order: 14,
  },
];
