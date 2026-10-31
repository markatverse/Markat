import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

export const DEFAULT_REGISTRATION_FEE = {
  isEnabled: true,
  baseFee: 1999,
  currency: 'INR',
  taxPercent: 18.0, // SAC 998319: Statutory 18% GST
  sacCode: '998319',
  isDiscountActive: true,
  occasionName: 'Diwali Festive Launch Offer 🪔',
  discountType: 'PERCENTAGE', // 'PERCENTAGE' | 'FLAT' | 'WAIVED'
  discountValue: 50,
  discountReason: 'Special festive season celebration - 50% OFF one-time seller onboarding fee!',
  validUntil: '2026-11-30',
  benefits: [
    'Official Verified Merchant Badge on Store & Listings',
    'Unlimited Product & Service Catalog Creation',
    'Direct Phone Calls & WhatsApp Customer Leads',
    'Live Token & Queue Appointment Booking System',
    'Dedicated Merchant Support & Priority Onboarding Assistance',
    '0% Additional Commission for First 30 Days'
  ]
};

export const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    planName: 'Starter Verified Store',
    price: 499,
    billingCycle: 'MONTHLY',
    taxPercent: 18.0, // SAC 998319
    sacCode: '998319',
    status: 'ACTIVE',
    features: [
      'Official Blue Verified Store Badge',
      'Up to 50 Products & Services in Catalog',
      'Direct Phone & WhatsApp Customer Leads',
      'Standard Directory Listing & Map Pins'
    ]
  },
  {
    planName: 'Growth Pro Merchant',
    price: 1499,
    billingCycle: 'MONTHLY',
    taxPercent: 18.0, // SAC 998319
    sacCode: '998319',
    status: 'ACTIVE',
    features: [
      'Priority Search Placement in Local Area',
      'Unlimited Product & Menu Catalog Items',
      'Live Queue & Token Appointment Booking',
      '0% Extra Transaction Surcharge',
      'Multi-staff Access & Realtime Inventory Alerts'
    ]
  },
  {
    planName: 'Enterprise Gold Merchant',
    price: 3999,
    billingCycle: 'MONTHLY',
    taxPercent: 18.0, // SAC 998319
    sacCode: '998319',
    status: 'ACTIVE',
    features: [
      'Homepage Featured Store Banner Placement',
      'Dedicated Key Account Manager & Phone Onboarding',
      'B2B Wholesale Invoicing & GST Credit Reports',
      '24/7 Priority Support & Dispute Resolution',
      'Custom Storefront Slug & Social Media Marketing Boost'
    ]
  }
];

export function enrichSubscriptionWithGst(sub: any) {
  const price = typeof sub.price === 'number' ? sub.price : parseFloat(sub.price) || 0;
  const taxPercent = typeof sub.taxPercent === 'number' ? sub.taxPercent : 18.0;
  const gstAmount = Math.round(price * (taxPercent / 100) * 100) / 100;
  const cgst = Math.round((gstAmount / 2) * 100) / 100;
  const sgst = Math.round((gstAmount - cgst) * 100) / 100;
  const igst = gstAmount;
  const totalPrice = Math.round((price + gstAmount) * 100) / 100;

  return {
    ...sub,
    price,
    taxPercent,
    sacCode: sub.sacCode || '998319',
    billingCycle: sub.billingCycle || 'MONTHLY',
    gstAmount,
    cgst,
    sgst,
    igst,
    totalPrice,
    effectiveFormula: `Base ₹${price} + ${taxPercent}% GST (₹${gstAmount}) = ₹${totalPrice}`
  };
}

@Injectable()
export class CommercialService {
  private adsCache: { data: any; expiry: number } | null = null;
  private couponsCache: { data: any; expiry: number } | null = null;
  private commissionsCache: { data: any; expiry: number } | null = null;
  private registrationFeeCache: { data: any; expiry: number } | null = null;

  constructor(private prisma: PrismaService) {}

  // Advertisements
  async getAdvertisements() {
    if (this.adsCache && Date.now() < this.adsCache.expiry) {
      return this.adsCache.data;
    }
    try {
      // Check Public Ads Display Policy (Default is ADMIN_ONLY: strictly show official Admin ads, hide public ads)
      const policyConfig = await this.prisma.systemConfig.findUnique({
        where: { key: 'PUBLIC_ADS_POLICY' },
      });
      let allowPublic = false;
      if (policyConfig && policyConfig.value) {
        try {
          allowPublic = JSON.parse(policyConfig.value).allowPublicAds === true;
        } catch {}
      }

      const whereClause: any = {
        status: 'ACTIVE'
      };

      if (!allowPublic) {
        // ADMIN ONLY: strictly do NOT show public ads
        whereClause.OR = [
          { source: 'ADMIN' },
          { source: null },
          { source: { not: 'PUBLIC_ADVERTISER' } }
        ];
      }

      const ads = await this.prisma.advertisement.findMany({
        where: whereClause,
        take: 100,
        orderBy: { createdAt: 'desc' }
      });

      this.adsCache = { data: ads, expiry: Date.now() + 30000 };
      return ads;
    } catch (err: any) {
      console.error('Error in getAdvertisements:', err?.message || err);
      return [];
    }
  }
  async getAdvertisement(id: string) {
    try {
      const item = await this.prisma.advertisement.findUnique({ where: { id } });
      if (!item) throw new NotFoundException('Advertisement not found');
      return item;
    } catch (err: any) {
      console.error('Error in getAdvertisement:', err?.message || err);
      throw err;
    }
  }
  async createAdvertisement(data: any) {
    try {
      return await this.prisma.advertisement.create({ data });
    } catch (err: any) {
      console.error('Error in createAdvertisement:', err?.message || err);
      throw err;
    }
  }
  async updateAdvertisement(id: string, data: any) {
    return this.prisma.advertisement.update({ where: { id }, data });
  }
  async deleteAdvertisement(id: string) {
    return this.prisma.advertisement.delete({ where: { id } });
  }

  // Coupons
  async getCoupons() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }
  async getCoupon(id: string) {
    const item = await this.prisma.coupon.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Coupon not found');
    return item;
  }
  async createCoupon(data: any) {
    return this.prisma.coupon.create({ data });
  }
  async updateCoupon(id: string, data: any) {
    return this.prisma.coupon.update({ where: { id }, data });
  }
  async deleteCoupon(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }

  // Subscriptions with Statutory 18% GST (SAC 998319)
  async getSubscriptions() {
    let items = await this.prisma.subscription.findMany({ orderBy: { createdAt: 'desc' } });
    if (!items || items.length === 0) {
      // Auto-seed default verified merchant subscription tiers
      for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
        await this.prisma.subscription.create({ data: plan });
      }
      items = await this.prisma.subscription.findMany({ orderBy: { createdAt: 'desc' } });
    }
    return items.map(enrichSubscriptionWithGst);
  }

  async getSubscription(id: string) {
    const item = await this.prisma.subscription.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Subscription not found');
    return enrichSubscriptionWithGst(item);
  }

  async createSubscription(data: any) {
    const price = typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0;
    const taxPercent = data.taxPercent !== undefined ? parseFloat(data.taxPercent) : 18.0;
    const created = await this.prisma.subscription.create({
      data: {
        planName: data.planName,
        price,
        billingCycle: data.billingCycle || 'MONTHLY',
        taxPercent,
        sacCode: data.sacCode || '998319',
        features: Array.isArray(data.features) ? data.features : [],
        status: data.status || 'ACTIVE',
      }
    });
    return enrichSubscriptionWithGst(created);
  }

  async updateSubscription(id: string, data: any) {
    const payload: any = { ...data };
    if (payload.price !== undefined) payload.price = parseFloat(payload.price);
    if (payload.taxPercent !== undefined) payload.taxPercent = parseFloat(payload.taxPercent);
    const updated = await this.prisma.subscription.update({
      where: { id },
      data: payload
    });
    return enrichSubscriptionWithGst(updated);
  }

  async deleteSubscription(id: string) {
    return this.prisma.subscription.delete({ where: { id } });
  }

  async seedDefaultSubscriptions() {
    await this.prisma.subscription.deleteMany({});
    for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
      await this.prisma.subscription.create({ data: plan });
    }
    return this.getSubscriptions();
  }

  // Commission
  async getCommissions() {
    return this.prisma.commissionRule.findMany({ orderBy: { createdAt: 'desc' } });
  }
  async getCommission(id: string) {
    const item = await this.prisma.commissionRule.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Commission not found');
    return item;
  }
  async createCommission(data: any) {
    if (data.percentage) data.percentage = parseFloat(data.percentage);
    if (data.fixedFee) data.fixedFee = parseFloat(data.fixedFee);
    return this.prisma.commissionRule.create({ data });
  }
  async updateCommission(id: string, data: any) {
    if (data.percentage !== undefined) data.percentage = parseFloat(data.percentage);
    if (data.fixedFee !== undefined) data.fixedFee = parseFloat(data.fixedFee);
    return this.prisma.commissionRule.update({ where: { id }, data });
  }
  async deleteCommission(id: string) {
    return this.prisma.commissionRule.delete({ where: { id } });
  }

  // Registration Fee & Occasion Discounts
  async getRegistrationFeeStats() {
    try {
      const [total, paid, waived, pending, paidBusinesses] = await Promise.all([
        this.prisma.business.count(),
        this.prisma.business.count({ where: { registrationFeeStatus: 'PAID' } }),
        this.prisma.business.count({ where: { registrationFeeStatus: 'WAIVED' } }),
        this.prisma.business.count({ where: { registrationFeeStatus: { in: ['PENDING', null as any] } } }),
        this.prisma.business.findMany({
          where: { registrationFeeStatus: 'PAID' },
          select: { registrationFeeAmount: true },
        }),
      ]);

      const totalCollected = paidBusinesses.reduce((acc, curr) => acc + (curr.registrationFeeAmount || 0), 0);

      return {
        total,
        paid,
        waived,
        pending,
        totalCollected,
      };
    } catch (err: any) {
      console.error('Error fetching registration fee stats:', err?.message || err);
      return { total: 0, paid: 0, waived: 0, pending: 0, totalCollected: 0 };
    }
  }

  async getRegistrationFee() {
    if (this.registrationFeeCache && Date.now() < this.registrationFeeCache.expiry) {
      return this.registrationFeeCache.data;
    }
    try {
      const config = await this.prisma.systemConfig.findUnique({
        where: { key: 'SELLER_REGISTRATION_FEE' },
      });
      let parsed = DEFAULT_REGISTRATION_FEE;
      if (config && config.value) {
        try {
          parsed = { ...DEFAULT_REGISTRATION_FEE, ...JSON.parse(config.value) };
        } catch {}
      }
      const computed = this.computeEffectiveFee(parsed);
      this.registrationFeeCache = { data: computed, expiry: Date.now() + 30000 };
      return computed;
    } catch (err: any) {
      console.error('Error fetching registration fee config:', err?.message || err);
      return this.computeEffectiveFee(DEFAULT_REGISTRATION_FEE);
    }
  }

  async updateRegistrationFee(data: any) {
    this.registrationFeeCache = null;
    try {
      const current = await this.getRegistrationFee();
      const merged = {
        ...current,
        ...data,
        baseFee: data.baseFee !== undefined ? parseFloat(data.baseFee) : current.baseFee,
        discountValue: data.discountValue !== undefined ? parseFloat(data.discountValue) : current.discountValue,
        taxPercent: data.taxPercent !== undefined ? parseFloat(data.taxPercent) : current.taxPercent,
        updatedAt: new Date().toISOString(),
      };
      const computed = this.computeEffectiveFee(merged);
      const serialized = JSON.stringify(computed);

      await this.prisma.systemConfig.upsert({
        where: { key: 'SELLER_REGISTRATION_FEE' },
        update: { value: serialized },
        create: {
          key: 'SELLER_REGISTRATION_FEE',
          value: serialized,
          description: 'Merchant onboarding registration fee and festive/occasion discount rules',
        },
      });

      this.registrationFeeCache = { data: computed, expiry: Date.now() + 30000 };
      return computed;
    } catch (err: any) {
      console.error('Error updating registration fee config:', err?.message || err);
      throw err;
    }
  }

  private computeEffectiveFee(cfg: any) {
    const isEnabled = cfg.isEnabled !== false;
    const baseFee = typeof cfg.baseFee === 'number' ? cfg.baseFee : 1999;
    const isDiscountActive = cfg.isDiscountActive === true;
    const discountType = cfg.discountType || 'PERCENTAGE';
    const discountValue = typeof cfg.discountValue === 'number' ? cfg.discountValue : 50;

    let discountedBase = baseFee;
    let savingsAmount = 0;

    if (!isEnabled) {
      discountedBase = 0;
      savingsAmount = baseFee;
    } else if (isDiscountActive) {
      if (discountType === 'WAIVED') {
        discountedBase = 0;
        savingsAmount = baseFee;
      } else if (discountType === 'PERCENTAGE') {
        const discountAmt = (baseFee * Math.min(100, Math.max(0, discountValue))) / 100;
        discountedBase = Math.max(0, Math.round(baseFee - discountAmt));
        savingsAmount = Math.round(discountAmt);
      } else if (discountType === 'FLAT') {
        discountedBase = Math.max(0, Math.round(baseFee - discountValue));
        savingsAmount = Math.min(baseFee, discountValue);
      }
    }

    // Statutory 18% GST (SAC 998319)
    const taxPercent = typeof cfg.taxPercent === 'number' ? cfg.taxPercent : 18.0;
    const taxAmount = discountedBase > 0 && taxPercent > 0 
      ? Math.round(discountedBase * (taxPercent / 100) * 100) / 100 
      : 0;
    const effectiveFee = Math.round((discountedBase + taxAmount) * 100) / 100;

    return {
      ...cfg,
      isEnabled,
      baseFee,
      isDiscountActive,
      discountType,
      discountValue,
      discountedBase,
      effectiveFee, // Payable amount including GST
      netFeeWithoutTax: discountedBase,
      taxPercent,
      taxAmount,
      sacCode: cfg.sacCode || '998319',
      taxBreakdown: {
        taxableAmount: discountedBase,
        taxPercent,
        taxAmount,
        cgst: Math.round((taxAmount / 2) * 100) / 100,
        sgst: Math.round((taxAmount - Math.round((taxAmount / 2) * 100) / 100) * 100) / 100,
        igst: taxAmount,
        sacCode: '998319'
      },
      savingsAmount,
      currency: cfg.currency || 'INR',
      occasionName: cfg.occasionName || 'Diwali Festive Launch Offer 🪔',
      discountReason: cfg.discountReason || 'Special festive season celebration - 50% OFF one-time seller onboarding fee!',
      validUntil: cfg.validUntil || '2026-11-30',
      benefits: Array.isArray(cfg.benefits) && cfg.benefits.length > 0 ? cfg.benefits : DEFAULT_REGISTRATION_FEE.benefits,
    };
  }

  // ===============================================
  // --- Advertising Platform Management (Admin) ---
  // ===============================================

  async getPublicAdsPolicy() {
    try {
      const config = await this.prisma.systemConfig.findUnique({
        where: { key: 'PUBLIC_ADS_POLICY' },
      });
      if (config && config.value) {
        return typeof config.value === 'string' ? JSON.parse(config.value) : config.value;
      }
    } catch {}
    return {
      mode: 'ADMIN_ONLY',
      allowPublicAds: false,
      description: 'Official Admin Content Banners Only. Public user ads are hidden from customer interface.',
      updatedAt: new Date().toISOString(),
    };
  }

  private static inMemoryCampaigns: Array<{
    id: string;
    advertiserId: string;
    advertiserName: string;
    campaignTitle: string;
    creativeUrl: string;
    placement: string;
    targetCategory: string;
    dailyBudget: number;
    totalBudget: number;
    bidType: string;
    cpcBid: number;
    impressions: number;
    clicks: number;
    status: string;
    submittedAt: string;
    rejectionReason: string | null;
  }> = [
    {
      id: 'CMP-801',
      advertiserId: 'ADV-101',
      advertiserName: 'Shree Balaji Electronics',
      campaignTitle: 'Super Smart TV Mega Cashback 📺',
      creativeUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
      placement: 'HOMEPAGE',
      targetCategory: 'Electronics & Appliances',
      dailyBudget: 2500,
      totalBudget: 25000,
      bidType: 'CPC',
      cpcBid: 16.5,
      impressions: 48200,
      clicks: 1840,
      status: 'ACTIVE',
      submittedAt: '10 mins ago',
      rejectionReason: null,
    },
    {
      id: 'CMP-802',
      advertiserId: 'ADV-102',
      advertiserName: 'Gourmet Curry Express',
      campaignTitle: 'Flat 50% Off Lunch Combos 🍛',
      creativeUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      placement: 'HOMEPAGE_MIDDLE',
      targetCategory: 'Dining & Restaurants',
      dailyBudget: 1200,
      totalBudget: 15000,
      bidType: 'CPM',
      cpcBid: 85.0,
      impressions: 82400,
      clicks: 2890,
      status: 'ACTIVE',
      submittedAt: '25 mins ago',
      rejectionReason: null,
    },
    {
      id: 'CMP-803',
      advertiserId: 'ADV-103',
      advertiserName: 'FastFix Mobile Repairs',
      campaignTitle: '1-Hour Screen Replacement at Home 📱',
      creativeUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      placement: 'SEARCH_PAGE',
      targetCategory: 'Home Services & Repairs',
      dailyBudget: 1800,
      totalBudget: 18000,
      bidType: 'CPC',
      cpcBid: 14.0,
      impressions: 62400,
      clicks: 2950,
      status: 'ACTIVE',
      submittedAt: '1 hour ago',
      rejectionReason: null,
    },
    {
      id: 'CMP-804',
      advertiserId: 'ADV-104',
      advertiserName: 'Vedic Ayurveda Herbs',
      campaignTitle: 'Pure Organic Immunity Kadha 🌿',
      creativeUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      placement: 'PRODUCT_PAGE',
      targetCategory: 'Health & Wellness',
      dailyBudget: 800,
      totalBudget: 8000,
      bidType: 'CPC',
      cpcBid: 9.5,
      impressions: 18900,
      clicks: 890,
      status: 'PAUSED',
      submittedAt: '3 hours ago',
      rejectionReason: null,
    },
    {
      id: 'CMP-805',
      advertiserId: 'ADV-101',
      advertiserName: 'Shree Balaji Electronics',
      campaignTitle: 'Diwali Festive Apparel Megasale 🪔',
      creativeUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
      placement: 'CATEGORY_HEADER',
      targetCategory: 'Fashion & Apparel',
      dailyBudget: 1500,
      totalBudget: 15000,
      bidType: 'CPC',
      cpcBid: 6.0,
      impressions: 0,
      clicks: 0,
      status: 'PENDING',
      submittedAt: 'Just now',
      rejectionReason: null,
    }
  ];

  private static inMemoryAdvertisers = [
    {
      id: 'ADV-101',
      name: 'Shree Balaji Electronics',
      contactPerson: 'Ramesh Sharma',
      email: 'ads@balajielectronics.com',
      phone: '+91 98112 88442',
      gstin: '07AAACB2233L1Z4',
      isVerified: true,
      walletBalance: 14500,
      totalLifetimeSpend: 68400,
      activeCampaigns: 2,
    },
    {
      id: 'ADV-102',
      name: 'Gourmet Curry Express',
      contactPerson: 'Sunita Mehra',
      email: 'marketing@gourmetcurry.in',
      phone: '+91 98711 33221',
      gstin: '07BBBPK8899M2Z8',
      isVerified: true,
      walletBalance: 8200,
      totalLifetimeSpend: 42100,
      activeCampaigns: 1,
    },
    {
      id: 'ADV-103',
      name: 'FastFix Mobile Repairs',
      contactPerson: 'Mohit Chawla',
      email: 'partners@fastfix.com',
      phone: '+91 99100 55443',
      gstin: '07CCCPD4455K3Z2',
      isVerified: true,
      walletBalance: 21000,
      totalLifetimeSpend: 114500,
      activeCampaigns: 3,
    },
    {
      id: 'ADV-104',
      name: 'Vedic Ayurveda Herbs',
      contactPerson: 'Dr. Anand Joshi',
      email: 'growth@vedicherbs.org',
      phone: '+91 98200 99881',
      gstin: '27DDDPT1122J4Z6',
      isVerified: true,
      walletBalance: 5400,
      totalLifetimeSpend: 28900,
      activeCampaigns: 1,
    }
  ];

  async getAdsAdminOverview() {
    try {
      const policy = await this.getPublicAdsPolicy();
      const placementsConfig = await this.getPlacementsConfig();

      const campaigns = CommercialService.inMemoryCampaigns;
      const advertisers = CommercialService.inMemoryAdvertisers;

      const activeCampaigns = campaigns.filter(c => c.status === 'APPROVED').length;
      const pendingModeration = campaigns.filter(c => c.status === 'PENDING').length;

      const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
      const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
      const avgCtr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 3.42;

      const totalGrossSpend = 253900;
      const taxAmount = Math.round(totalGrossSpend * (18 / 118) * 100) / 100;
      const netAdRevenue = Math.round((totalGrossSpend - taxAmount) * 100) / 100;
      const totalPrepaidWallets = advertisers.reduce((acc, a) => acc + (a.walletBalance || 0), 0);

      return {
        metrics: {
          activeCampaigns,
          pendingModeration,
          totalImpressions,
          totalClicks,
          avgCtr,
          totalGrossSpend,
          taxAmount,
          netAdRevenue,
          totalPrepaidWallets,
          sacCode: '998319',
          taxRate: 18,
        },
        policy,
        placementsConfig,
        campaigns,
        advertisers,
      };
    } catch (err: any) {
      console.error('Error in getAdsAdminOverview:', err);
      throw err;
    }
  }

  async moderateCampaign(campaignId: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    const campaign = CommercialService.inMemoryCampaigns.find(c => c.id === campaignId);
    if (!campaign) throw new NotFoundException('Campaign not found');

    campaign.status = status;
    campaign.rejectionReason = status === 'REJECTED' ? (reason || 'Violates safety guidelines') : null;

    return {
      success: true,
      message: `Campaign "${campaign.campaignTitle}" has been ${status.toLowerCase()}`,
      campaign,
    };
  }

  async getPlacementsConfig() {
    try {
      const cfg = await this.prisma.systemConfig.findUnique({
        where: { key: 'ADS_PLACEMENTS_CONFIG' },
      });
      if (cfg && cfg.value) {
        return cfg.value as any;
      }
    } catch {}

    return {
      slots: [
        {
          id: 'HOMEPAGE',
          name: 'Homepage Hero Carousel',
          minCpc: 15.0,
          minCpm: 120.0,
          maxActiveAds: 5,
          isActive: true,
          dimensions: '1200 x 480 px',
        },
        {
          id: 'HOMEPAGE_MIDDLE',
          name: 'Homepage Middle Featured Banner',
          minCpc: 10.0,
          minCpm: 80.0,
          maxActiveAds: 4,
          isActive: true,
          dimensions: '1200 x 300 px',
        },
        {
          id: 'SEARCH_PAGE',
          name: 'Search & Category Top Sponsored',
          minCpc: 12.0,
          minCpm: 90.0,
          maxActiveAds: 3,
          isActive: true,
          dimensions: '960 x 180 px',
        },
        {
          id: 'PRODUCT_PAGE',
          name: 'Product Detail Sponsored Showcase',
          minCpc: 8.0,
          minCpm: 60.0,
          maxActiveAds: 6,
          isActive: true,
          dimensions: '400 x 400 px',
        },
        {
          id: 'SIDEBAR',
          name: 'Category Sidebar Display',
          minCpc: 6.0,
          minCpm: 50.0,
          maxActiveAds: 4,
          isActive: true,
          dimensions: '300 x 600 px',
        },
        {
          id: 'TOP_BAR',
          name: 'Top Announcement Bar',
          minCpc: 5.0,
          minCpm: 40.0,
          maxActiveAds: 2,
          isActive: true,
          dimensions: '1920 x 50 px',
        },
      ],
      minDailyBudget: 500,
      currency: 'INR',
    };
  }

  async updatePlacementsConfig(config: any) {
    try {
      await this.prisma.systemConfig.upsert({
        where: { key: 'ADS_PLACEMENTS_CONFIG' },
        update: { value: config },
        create: { key: 'ADS_PLACEMENTS_CONFIG', value: config },
      });
      return { success: true, config };
    } catch (err: any) {
      console.error('Error updating placements config:', err);
      throw err;
    }
  }

  async topupAdvertiserWallet(advertiserId: string, amount: number) {
    const adv = CommercialService.inMemoryAdvertisers.find(a => a.id === advertiserId);
    if (!adv) throw new NotFoundException('Advertiser not found');

    const gst = Math.round(amount * 0.18 * 100) / 100;
    const totalDeducted = Math.round((amount + gst) * 100) / 100;

    adv.walletBalance += amount;

    return {
      success: true,
      message: `Successfully credited ₹${amount} (plus ₹${gst} GST) to ${adv.name}`,
      advertiser: adv,
      netCredited: amount,
      gstCollected: gst,
      sacCode: '998319',
      totalCharged: totalDeducted,
    };
  }


  // --- Advertiser Campaigns & Management ---
  async getAdvertiserCampaigns(advertiserId?: string) {
    if (!advertiserId) {
      return CommercialService.inMemoryCampaigns;
    }
    // Return campaigns matching advertiserId, or fallback to first advertiser if mock
    const filtered = CommercialService.inMemoryCampaigns.filter(c => c.advertiserId === advertiserId);
    return filtered.length > 0 ? filtered : CommercialService.inMemoryCampaigns;
  }

  async createAdvertiserCampaign(data: {
    advertiserId?: string;
    advertiserName?: string;
    campaignTitle: string;
    placement: string;
    targetCategory: string;
    dailyBudget: number;
    totalBudget?: number;
    bidType?: string;
    cpcBid?: number;
    creativeUrl?: string;
    linkUrl?: string;
  }) {
    const newId = `CMP-${Math.floor(100 + Math.random() * 900)}`;
    const newCampaign = {
      id: newId,
      advertiserId: data.advertiserId || 'ADV-101',
      advertiserName: data.advertiserName || 'Registered Advertiser',
      campaignTitle: data.campaignTitle || 'New Ad Campaign',
      creativeUrl: data.creativeUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
      placement: data.placement || 'HOMEPAGE',
      targetCategory: data.targetCategory || 'General Retail',
      dailyBudget: Number(data.dailyBudget) || 1000,
      totalBudget: Number(data.totalBudget) || (Number(data.dailyBudget) * 10 || 10000),
      bidType: data.bidType || 'CPC',
      cpcBid: Number(data.cpcBid) || 5.0,
      impressions: 0,
      clicks: 0,
      status: 'PENDING', // Sent to Admin moderation queue
      submittedAt: 'Just now',
      rejectionReason: null,
    };

    CommercialService.inMemoryCampaigns.unshift(newCampaign);

    return {
      success: true,
      message: 'Campaign created successfully and submitted for Admin policy review.',
      campaign: newCampaign,
    };
  }

  async toggleCampaignStatus(campaignId: string) {
    const campaign = CommercialService.inMemoryCampaigns.find(c => c.id === campaignId);
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.status === 'ACTIVE' || campaign.status === 'APPROVED') {
      campaign.status = 'PAUSED';
    } else {
      campaign.status = 'ACTIVE';
    }

    return {
      success: true,
      message: `Campaign status updated to ${campaign.status}`,
      campaign,
    };
  }

  async getAdvertiserProfile(advertiserId: string) {
    let adv = CommercialService.inMemoryAdvertisers.find(a => a.id === advertiserId);
    if (!adv) {
      adv = {
        id: advertiserId,
        name: 'My Business Store',
        contactPerson: 'Merchant Owner',
        email: 'advertiser@markatverse.com',
        phone: '+91 98000 00000',
        gstin: '07AAAPM9999K1Z2',
        isVerified: true,
        walletBalance: 12500,
        totalLifetimeSpend: 42000,
        activeCampaigns: 1,
      };
      CommercialService.inMemoryAdvertisers.push(adv);
    }
    return adv;
  }

}
