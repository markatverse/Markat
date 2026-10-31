export interface HomepageSection {
  id: string;
  label: string;
  description: string;
  badge: string;
  category: 'banner' | 'navigation' | 'products' | 'services' | 'trust' | 'content';
  visible: boolean;
  order: number;
}

export const INITIAL_HOMEPAGE_SECTIONS: HomepageSection[] = [
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

export function mergeLayoutWithDefaults(sections?: HomepageSection[] | null): HomepageSection[] {
  if (!Array.isArray(sections) || sections.length === 0) {
    return INITIAL_HOMEPAGE_SECTIONS;
  }
  const existingIds = new Set(sections.map((s) => s.id));
  const missing = INITIAL_HOMEPAGE_SECTIONS.filter((s) => !existingIds.has(s.id));
  return [...sections, ...missing].sort((a, b) => a.order - b.order);
}

