import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { calculateDistance } from '../utils/geo.js';

@Injectable()
export class ProductsService {
  // Ultra low-latency in-memory cache for high-frequency queries (<2ms response)
  private listCache = new Map<string, { data: any; expiry: number }>();
  private itemCache = new Map<string, { data: any; expiry: number }>();
  private settingsCache: { data: any; expiry: number } | null = null;

  constructor(private prisma: PrismaService) {}

  private clearCache() {
    this.listCache.clear();
    this.itemCache.clear();
  }

  async create(data: any) {
    this.clearCache();
    // 1. Sanitize sellerId (must be a 24-character hexadecimal ObjectId or null)
    let sellerId: string | null = null;
    if (data.sellerId && typeof data.sellerId === 'string' && /^[0-9a-fA-F]{24}$/.test(data.sellerId)) {
      sellerId = data.sellerId;
    }

    // 2. Sanitize price (fallback to 0 or first option price if missing/empty/NaN)
    let price = 0;
    if (data.price !== undefined && data.price !== null && data.price !== '') {
      const parsed = parseFloat(data.price);
      if (!isNaN(parsed) && parsed >= 0) price = parsed;
    }
    if (price === 0 && Array.isArray(data.options) && data.options.length > 0) {
      const firstOptPrice = parseFloat(data.options[0]?.price);
      if (!isNaN(firstOptPrice) && firstOptPrice >= 0) price = firstOptPrice;
    }

    // 3. Sanitize originalPrice
    let originalPrice: number | null = null;
    if (data.originalPrice !== undefined && data.originalPrice !== null && data.originalPrice !== '') {
      const parsed = parseFloat(data.originalPrice);
      if (!isNaN(parsed)) originalPrice = parsed;
    }

    // 4. Coordinates
    let latitude: number | null = null;
    if (data.latitude !== undefined && data.latitude !== null && data.latitude !== '') {
      const parsed = parseFloat(data.latitude);
      if (!isNaN(parsed)) latitude = parsed;
    }
    let longitude: number | null = null;
    if (data.longitude !== undefined && data.longitude !== null && data.longitude !== '') {
      const parsed = parseFloat(data.longitude);
      if (!isNaN(parsed)) longitude = parsed;
    }

    // 5. moq and stock
    const moq = data.moq && !isNaN(parseInt(data.moq)) ? parseInt(data.moq) : 1;
    const stock = data.stock && !isNaN(parseInt(data.stock)) ? parseInt(data.stock) : 0;

    const product = await this.prisma.product.create({
      data: {
        name: data.name || 'Untitled Listing',
        type: data.primaryType || data.type || 'PRODUCT',
        price,
        originalPrice,
        description: data.description || null,
        categoryName: data.category || data.categoryName || null,
        sellerId,
        sellerName: data.seller || data.sellerName || 'MarkatVerse Seller',
        location: data.location || 'India',
        pincode: data.pincode || null,
        latitude,
        longitude,
        rating: data.rating || '0.0',
        reviews: data.reviews || '0',
        discount: data.discount || null,
        badge: data.badge || null,
        badgeColor: data.badgeColor || null,
        subcategory: data.subcategory || null,
        parameters: data.parameters || null,
        options: data.options || null,
        image: data.image || (data.images && data.images.length > 0 ? data.images[0] : null),
        images: data.images || (data.image ? [data.image] : []),
        isB2B: !!data.isB2B,
        moq,
        stock,
        sku: data.sku || null,
      },
    });
    return this.mapProduct(product);
  }

  async findAll(
    location?: string, 
    lat?: number, 
    lng?: number, 
    radius?: number, 
    page: number = 1, 
    limit: number = 50,
    filters?: {
      q?: string;
      category?: string;
      subcategory?: string;
      type?: string;
      isB2B?: boolean;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: string;
    }
  ) {
    const cacheKey = JSON.stringify({ location, lat, lng, radius, page, limit, filters });
    const cached = this.listCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    const skip = (page - 1) * limit;

    const andConditions: any[] = [{ status: 'ACTIVE' }];

    if (filters?.q && filters.q.trim()) {
      const q = filters.q.trim();
      andConditions.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { categoryName: { contains: q, mode: 'insensitive' } },
          { subcategory: { contains: q, mode: 'insensitive' } },
          { sellerName: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ]
      });
    }

    if (filters?.category && filters.category !== 'All Categories') {
      const catLower = filters.category.toLowerCase().trim();
      if (catLower === 'construction materials' || catLower === 'construction' || catLower.includes('infrastructure')) {
        andConditions.push({
          OR: [
            { categoryName: { contains: 'construction', mode: 'insensitive' } },
            { categoryName: { contains: 'building', mode: 'insensitive' } },
            { subcategory: { contains: 'cement', mode: 'insensitive' } }
          ]
        });
      } else if (catLower === 'home services' || catLower.includes('retail & home') || catLower === 'repair') {
        andConditions.push({
          OR: [
            { categoryName: { in: ['Home Services', 'Cleaner', 'Mechanic', 'Carpenter', 'Electrician', 'Plumber', 'Painter'] } },
            { categoryName: { contains: 'clean', mode: 'insensitive' } },
            { categoryName: { contains: 'repair', mode: 'insensitive' } },
            { categoryName: { contains: 'plumb', mode: 'insensitive' } }
          ]
        });
      } else if (catLower === 'salon & spa' || catLower === 'salon, spa & beauty' || catLower.includes('wellness') || catLower === 'salon') {
        andConditions.push({
          OR: [
            { categoryName: { in: ['Salon & Parlour', 'Spa', 'Beauty', 'Salon'] } },
            { categoryName: { contains: 'salon', mode: 'insensitive' } },
            { categoryName: { contains: 'spa', mode: 'insensitive' } },
            { categoryName: { contains: 'beauty', mode: 'insensitive' } }
          ]
        });
      } else if (catLower === 'events & planning' || catLower === 'top organizers' || catLower.includes('organizer') || catLower === 'events') {
        andConditions.push({
          OR: [
            { categoryName: { in: ['Event Planner', 'Photographer', 'Events & Planning'] } },
            { categoryName: { contains: 'event', mode: 'insensitive' } },
            { categoryName: { contains: 'planner', mode: 'insensitive' } },
            { categoryName: { contains: 'photograph', mode: 'insensitive' } }
          ]
        });
      } else if (catLower === 'transport' || catLower === 'mobility & freight' || catLower.includes('freight') || catLower === 'logistics') {
        andConditions.push({
          OR: [
            { categoryName: { in: ['Transport', 'Car Wash & Automobile', 'Car Wash', 'Automotive Parts & Accessories', 'Rentals', 'Logistics'] } },
            { categoryName: { contains: 'transport', mode: 'insensitive' } },
            { categoryName: { contains: 'automobile', mode: 'insensitive' } },
            { categoryName: { contains: 'car wash', mode: 'insensitive' } },
            { categoryName: { contains: 'logistics', mode: 'insensitive' } }
          ]
        });
      } else {
        andConditions.push({ categoryName: { contains: filters.category, mode: 'insensitive' } });
      }
    }

    if (filters?.subcategory) {
      andConditions.push({ subcategory: { contains: filters.subcategory, mode: 'insensitive' } });
    }
    if (filters?.type && filters.type !== 'all') {
      andConditions.push({ type: filters.type.toUpperCase() === 'SERVICES' ? 'SERVICE' : 'PRODUCT' });
    }
    if (filters?.isB2B !== undefined) {
      if (filters.isB2B) {
        andConditions.push({
          OR: [
            { isB2B: true },
            { categoryName: { in: ['Construction', 'Agriculture', 'Industrial Machinery & Tools', 'B2B'] } }
          ]
        });
      } else {
        andConditions.push({ isB2B: false });
      }
    }
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      const priceCond: any = {};
      if (filters?.minPrice !== undefined && !isNaN(filters.minPrice)) priceCond.gte = filters.minPrice;
      if (filters?.maxPrice !== undefined && !isNaN(filters.maxPrice)) priceCond.lte = filters.maxPrice;
      andConditions.push({ price: priceCond });
    }
    if (location && location.trim() && !lat) {
      andConditions.push({ location: { contains: location.trim(), mode: 'insensitive' } });
    }

    const where = { AND: andConditions };

    let orderBy: any = { createdAt: 'desc' };
    if (filters?.sortBy === 'price_low') orderBy = { price: 'asc' };
    else if (filters?.sortBy === 'price_high') orderBy = { price: 'desc' };
    else if (filters?.sortBy === 'rating') orderBy = { rating: 'desc' };

    // If no coordinates provided, we can use DB-level pagination
    const useDbPagination = !(lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng));

    let products = await this.prisma.product.findMany({
      where,
      orderBy,
      take: useDbPagination ? limit : 300,
      skip: useDbPagination ? skip : undefined,
    });
    
    let total = useDbPagination ? await this.prisma.product.count({ where }) : products.length;

    if (!useDbPagination && lat !== undefined && lng !== undefined) {
      // 1. Get system settings for radii (cached for 60s)
      let effectiveRadius = radius;
      let sectorRadiusMap: Record<string, number> = {};

      let data: any = null;
      if (this.settingsCache && Date.now() < this.settingsCache.expiry) {
        data = this.settingsCache.data;
      } else {
        const settings = await this.prisma.configuration.findFirst({
          where: { type: 'SYSTEM_SETTINGS', name: 'global' },
        });
        data = settings?.data as any;
        this.settingsCache = { data, expiry: Date.now() + 60000 };
      }

      const strictRadius = data?.strictRadius === true;
      const globalMaxRadius = data?.searchRadius ?? 50;

      if (effectiveRadius === undefined || isNaN(effectiveRadius)) {
        effectiveRadius = globalMaxRadius; // fallback
      } else if (strictRadius && effectiveRadius > globalMaxRadius) {
        effectiveRadius = globalMaxRadius; // clamp to max if strict
      }
      sectorRadiusMap = data?.sectorRadius || {};

      // Helper to map category to sector name
      const getSectorForProduct = (p: any) => {
        if (p.isB2B) return 'b2b';
        const cat = p.categoryName || '';
        if (cat === 'Beauty') return 'salon';
        if (cat === 'Home') return 'home';
        if (cat === 'Professional') return 'events';
        if (cat === 'Rentals') return 'transport';
        if (cat === 'B2B') return 'b2b';
        return 'default';
      };

      // 2. Calculate distances and filter
      const withDistances = products.map(p => {
        let dist = Infinity;
        if (p.latitude !== null && p.longitude !== null) {
          dist = calculateDistance(lat, lng, p.latitude, p.longitude);
        }
        return { ...p, _distance: dist };
      });

      const showOutOfRange = data?.showOutOfRange === true;
      const productsNoRadiusLimit = data?.productsNoRadiusLimit !== false; // Default true (products have no hard radius barrier)
      const distanceWeight = data?.distanceWeight ?? 50; // 0-100

      // Helper to check if an item is a physical good vs a service
      const serviceCategories = ['Services', 'Home Services', 'Transport', 'Rentals', 'Organizers', 'Beauty', 'Salon', 'Salon & Parlour', 'Salon & Parlor', 'Spa', 'Beauty Parlour', 'Home', 'Professional'];
      const isServiceItem = (p: any) => {
        if (p.primaryType) return p.primaryType === 'SERVICE';
        return serviceCategories.includes(p.categoryName || '') || (p.categoryName || '').toLowerCase().includes('salon') || (p.categoryName || '').toLowerCase().includes('parlour');
      };

      // Filter out products outside the radius (unless they have no coordinates)
      products = withDistances.filter(p => {
        if (p._distance === Infinity) return true;
        
        // If it's a physical product and pan-India product discovery is enabled, do not filter out by distance limit
        const isService = isServiceItem(p);
        if (!isService && productsNoRadiusLimit) {
          return true; // Keep physical products; distance sorting will rank nearer ones first!
        }

        // Find specific radius for this item's sector
        const sectorName = getSectorForProduct(p);
        const radiusToUse = sectorRadiusMap[sectorName] ?? effectiveRadius ?? 50;
        
        if (p._distance > radiusToUse) {
          if (showOutOfRange) {
            (p as any)._outOfRange = true; // Tag it for UI
            return true;
          }
          return false;
        }
        return true;
      });

      // Sort by distance vs rating
      products.sort((a: any, b: any) => {
        // Always push out of range items to bottom
        if (a._outOfRange && !b._outOfRange) return 1;
        if (!a._outOfRange && b._outOfRange) return -1;

        const wDist = distanceWeight / 100;
        const wRat = 1 - wDist;

        if (wDist === 1) {
          return a._distance - b._distance;
        }

        const ratA = parseFloat(a.rating) || 0;
        const ratB = parseFloat(b.rating) || 0;

        if (wRat === 1) {
          return ratB - ratA;
        }

        // Hybrid score: normalize distance (assume 500km max scale) and rating (5 max scale)
        // We want lower distance, higher rating
        const normDistA = Math.min(a._distance, 500) / 500;
        const normDistB = Math.min(b._distance, 500) / 500;
        
        const normRatA = ratA / 5;
        const normRatB = ratB / 5;

        // Lower score is better
        const scoreA = (normDistA * wDist) - (normRatA * wRat);
        const scoreB = (normDistB * wDist) - (normRatB * wRat);

        return scoreA - scoreB;
      });
      
      total = products.length;
      products = products.slice(skip, skip + limit);
      
    } else if (location && location.trim() !== '') {
      // Fallback to text matching if no coords
      const loc = location.toLowerCase();
      // Only sort by location match if we're not using DB pagination, or we apply it post-pagination.
      // With DB pagination, we might miss better matches. But doing it in memory is what it used to do.
      products.sort((a, b) => {
        const aLoc = (a.location || '').toLowerCase();
        const bLoc = (b.location || '').toLowerCase();
        const aMatch = aLoc.includes(loc);
        const bMatch = bLoc.includes(loc);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    const mapped = products.map(p => this.mapProduct(p));
    const result = {
      data: mapped,
      products: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    // Cache list results for 30 seconds for ultra-low latency (<2ms)
    this.listCache.set(cacheKey, { data: result, expiry: Date.now() + 30000 });
    return result;
  }

  async findOne(id: string) {
    const cached = this.itemCache.get(id);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    const p = await this.prisma.product.findUnique({ where: { id } });
    const mapped = p ? this.mapProduct(p) : null;
    if (mapped) {
      this.itemCache.set(id, { data: mapped, expiry: Date.now() + 30000 });
    }
    return mapped;
  }

  async update(id: string, data: any) {
    let sellerId: string | null | undefined = undefined;
    if (data.sellerId !== undefined) {
      if (data.sellerId && typeof data.sellerId === 'string' && /^[0-9a-fA-F]{24}$/.test(data.sellerId)) {
        sellerId = data.sellerId;
      } else {
        sellerId = null;
      }
    }

    let price: number | undefined = undefined;
    if (data.price !== undefined && data.price !== null && data.price !== '') {
      const parsed = parseFloat(data.price);
      if (!isNaN(parsed) && parsed >= 0) price = parsed;
    }

    let originalPrice: number | null | undefined = undefined;
    if (data.originalPrice !== undefined) {
      if (data.originalPrice !== null && data.originalPrice !== '') {
        const parsed = parseFloat(data.originalPrice);
        originalPrice = !isNaN(parsed) ? parsed : null;
      } else {
        originalPrice = null;
      }
    }

    const p = await this.prisma.product.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        type: data.primaryType || data.type || undefined,
        price,
        originalPrice,
        description: data.description !== undefined ? data.description : undefined,
        categoryName: data.category || data.categoryName || undefined,
        sellerId,
        sellerName: data.seller || data.sellerName || undefined,
        discount: data.discount !== undefined ? data.discount : undefined,
        badge: data.badge !== undefined ? data.badge : undefined,
        badgeColor: data.badgeColor !== undefined ? data.badgeColor : undefined,
        subcategory: data.subcategory !== undefined ? data.subcategory : undefined,
        parameters: data.parameters !== undefined ? data.parameters : undefined,
        options: data.options !== undefined ? data.options : undefined,
        image: data.image !== undefined ? data.image : undefined,
        images: data.images !== undefined ? data.images : undefined,
        isB2B: data.isB2B !== undefined ? !!data.isB2B : undefined,
        moq: data.moq && !isNaN(parseInt(data.moq)) ? parseInt(data.moq) : undefined,
        stock: data.stock !== undefined && !isNaN(parseInt(data.stock)) ? parseInt(data.stock) : undefined,
      },
    });
    this.clearCache();
    return this.mapProduct(p);
  }

  async updateAdminStatus(id: string, status: string) {
    const p = await this.prisma.product.update({
      where: { id },
      data: { status }
    });
    this.clearCache();
    return this.mapProduct(p);
  }

  async toggleDummyData(enable: boolean) {
    const status = enable ? 'ACTIVE' : 'SUSPENDED';
    
    // Toggle Products
    await this.prisma.product.updateMany({
      where: { OR: [{ sellerId: null }, { sellerId: { isSet: false } }] },
      data: { status }
    });

    // Toggle Queues
    await this.prisma.serviceQueue.updateMany({
      where: { OR: [{ sellerId: null }, { sellerId: { isSet: false } }] },
      data: { status }
    });

    this.clearCache();
    return { success: true, message: `Dummy data set to ${status}` };
  }

  async getDummyStatus() {
    const dummyProduct = await this.prisma.product.findFirst({
      where: { 
        OR: [{ sellerId: null }, { sellerId: { isSet: false } }], 
        status: 'ACTIVE' 
      }
    });
    return { enabled: !!dummyProduct };
  }

  async remove(id: string) {
    // Delete related leads first to prevent relation errors
    await this.prisma.lead.deleteMany({ where: { productId: id } });
    
    await this.prisma.product.delete({ where: { id } });
    this.clearCache();
    return { success: true };
  }

  // Maps DB field names to frontend-expected field names
  private mapProduct(p: any) {
    return {
      ...p,
      seller: p.sellerName,
      sellerId: p.sellerId,
      category: p.categoryName,
      primaryType: p.type,
      images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
    };
  }
}
