var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { calculateDistance } from '../utils/geo.js';
let ProductsService = class ProductsService {
    prisma;
    listCache = new Map();
    itemCache = new Map();
    settingsCache = null;
    constructor(prisma) {
        this.prisma = prisma;
    }
    clearCache() {
        this.listCache.clear();
        this.itemCache.clear();
    }
    async create(data) {
        this.clearCache();
        let sellerId = null;
        if (data.sellerId && typeof data.sellerId === 'string' && /^[0-9a-fA-F]{24}$/.test(data.sellerId)) {
            sellerId = data.sellerId;
        }
        let price = 0;
        if (data.price !== undefined && data.price !== null && data.price !== '') {
            const parsed = parseFloat(data.price);
            if (!isNaN(parsed) && parsed >= 0)
                price = parsed;
        }
        if (price === 0 && Array.isArray(data.options) && data.options.length > 0) {
            const firstOptPrice = parseFloat(data.options[0]?.price);
            if (!isNaN(firstOptPrice) && firstOptPrice >= 0)
                price = firstOptPrice;
        }
        let originalPrice = null;
        if (data.originalPrice !== undefined && data.originalPrice !== null && data.originalPrice !== '') {
            const parsed = parseFloat(data.originalPrice);
            if (!isNaN(parsed))
                originalPrice = parsed;
        }
        let latitude = null;
        if (data.latitude !== undefined && data.latitude !== null && data.latitude !== '') {
            const parsed = parseFloat(data.latitude);
            if (!isNaN(parsed))
                latitude = parsed;
        }
        let longitude = null;
        if (data.longitude !== undefined && data.longitude !== null && data.longitude !== '') {
            const parsed = parseFloat(data.longitude);
            if (!isNaN(parsed))
                longitude = parsed;
        }
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
    async findAll(location, lat, lng, radius, page = 1, limit = 50, filters) {
        const cacheKey = JSON.stringify({ location, lat, lng, radius, page, limit, filters });
        const cached = this.listCache.get(cacheKey);
        if (cached && Date.now() < cached.expiry) {
            return cached.data;
        }
        const skip = (page - 1) * limit;
        const where = { status: 'ACTIVE' };
        if (filters?.q && filters.q.trim()) {
            const q = filters.q.trim();
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { categoryName: { contains: q, mode: 'insensitive' } },
                { subcategory: { contains: q, mode: 'insensitive' } },
                { sellerName: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (filters?.category && filters.category !== 'All Categories') {
            where.categoryName = { contains: filters.category, mode: 'insensitive' };
        }
        if (filters?.subcategory) {
            where.subcategory = { contains: filters.subcategory, mode: 'insensitive' };
        }
        if (filters?.type && filters.type !== 'all') {
            where.type = filters.type.toUpperCase() === 'SERVICES' ? 'SERVICE' : 'PRODUCT';
        }
        if (filters?.isB2B !== undefined) {
            where.isB2B = filters.isB2B;
        }
        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            where.price = {};
            if (filters?.minPrice !== undefined && !isNaN(filters.minPrice))
                where.price.gte = filters.minPrice;
            if (filters?.maxPrice !== undefined && !isNaN(filters.maxPrice))
                where.price.lte = filters.maxPrice;
        }
        if (location && location.trim() && !lat) {
            where.location = { contains: location.trim(), mode: 'insensitive' };
        }
        let orderBy = { createdAt: 'desc' };
        if (filters?.sortBy === 'price_low')
            orderBy = { price: 'asc' };
        else if (filters?.sortBy === 'price_high')
            orderBy = { price: 'desc' };
        else if (filters?.sortBy === 'rating')
            orderBy = { rating: 'desc' };
        const useDbPagination = !(lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng));
        let products = await this.prisma.product.findMany({
            where,
            orderBy,
            take: useDbPagination ? limit : 300,
            skip: useDbPagination ? skip : undefined,
        });
        let total = useDbPagination ? await this.prisma.product.count({ where }) : products.length;
        if (!useDbPagination && lat !== undefined && lng !== undefined) {
            let effectiveRadius = radius;
            let sectorRadiusMap = {};
            let data = null;
            if (this.settingsCache && Date.now() < this.settingsCache.expiry) {
                data = this.settingsCache.data;
            }
            else {
                const settings = await this.prisma.configuration.findFirst({
                    where: { type: 'SYSTEM_SETTINGS', name: 'global' },
                });
                data = settings?.data;
                this.settingsCache = { data, expiry: Date.now() + 60000 };
            }
            const strictRadius = data?.strictRadius === true;
            const globalMaxRadius = data?.searchRadius ?? 50;
            if (effectiveRadius === undefined || isNaN(effectiveRadius)) {
                effectiveRadius = globalMaxRadius;
            }
            else if (strictRadius && effectiveRadius > globalMaxRadius) {
                effectiveRadius = globalMaxRadius;
            }
            sectorRadiusMap = data?.sectorRadius || {};
            const getSectorForProduct = (p) => {
                if (p.isB2B)
                    return 'b2b';
                const cat = p.categoryName || '';
                if (cat === 'Beauty')
                    return 'salon';
                if (cat === 'Home')
                    return 'home';
                if (cat === 'Professional')
                    return 'events';
                if (cat === 'Rentals')
                    return 'transport';
                if (cat === 'B2B')
                    return 'b2b';
                return 'default';
            };
            const withDistances = products.map(p => {
                let dist = Infinity;
                if (p.latitude !== null && p.longitude !== null) {
                    dist = calculateDistance(lat, lng, p.latitude, p.longitude);
                }
                return { ...p, _distance: dist };
            });
            const showOutOfRange = data?.showOutOfRange === true;
            const productsNoRadiusLimit = data?.productsNoRadiusLimit !== false;
            const distanceWeight = data?.distanceWeight ?? 50;
            const serviceCategories = ['Services', 'Home Services', 'Transport', 'Rentals', 'Organizers', 'Beauty', 'Salon', 'Salon & Parlour', 'Salon & Parlor', 'Spa', 'Beauty Parlour', 'Home', 'Professional'];
            const isServiceItem = (p) => {
                if (p.primaryType)
                    return p.primaryType === 'SERVICE';
                return serviceCategories.includes(p.categoryName || '') || (p.categoryName || '').toLowerCase().includes('salon') || (p.categoryName || '').toLowerCase().includes('parlour');
            };
            products = withDistances.filter(p => {
                if (p._distance === Infinity)
                    return true;
                const isService = isServiceItem(p);
                if (!isService && productsNoRadiusLimit) {
                    return true;
                }
                const sectorName = getSectorForProduct(p);
                const radiusToUse = sectorRadiusMap[sectorName] ?? effectiveRadius ?? 50;
                if (p._distance > radiusToUse) {
                    if (showOutOfRange) {
                        p._outOfRange = true;
                        return true;
                    }
                    return false;
                }
                return true;
            });
            products.sort((a, b) => {
                if (a._outOfRange && !b._outOfRange)
                    return 1;
                if (!a._outOfRange && b._outOfRange)
                    return -1;
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
                const normDistA = Math.min(a._distance, 500) / 500;
                const normDistB = Math.min(b._distance, 500) / 500;
                const normRatA = ratA / 5;
                const normRatB = ratB / 5;
                const scoreA = (normDistA * wDist) - (normRatA * wRat);
                const scoreB = (normDistB * wDist) - (normRatB * wRat);
                return scoreA - scoreB;
            });
            total = products.length;
            products = products.slice(skip, skip + limit);
        }
        else if (location && location.trim() !== '') {
            const loc = location.toLowerCase();
            products.sort((a, b) => {
                const aLoc = (a.location || '').toLowerCase();
                const bLoc = (b.location || '').toLowerCase();
                const aMatch = aLoc.includes(loc);
                const bMatch = bLoc.includes(loc);
                if (aMatch && !bMatch)
                    return -1;
                if (!aMatch && bMatch)
                    return 1;
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
        this.listCache.set(cacheKey, { data: result, expiry: Date.now() + 30000 });
        return result;
    }
    async findOne(id) {
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
    async update(id, data) {
        let sellerId = undefined;
        if (data.sellerId !== undefined) {
            if (data.sellerId && typeof data.sellerId === 'string' && /^[0-9a-fA-F]{24}$/.test(data.sellerId)) {
                sellerId = data.sellerId;
            }
            else {
                sellerId = null;
            }
        }
        let price = undefined;
        if (data.price !== undefined && data.price !== null && data.price !== '') {
            const parsed = parseFloat(data.price);
            if (!isNaN(parsed) && parsed >= 0)
                price = parsed;
        }
        let originalPrice = undefined;
        if (data.originalPrice !== undefined) {
            if (data.originalPrice !== null && data.originalPrice !== '') {
                const parsed = parseFloat(data.originalPrice);
                originalPrice = !isNaN(parsed) ? parsed : null;
            }
            else {
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
    async updateAdminStatus(id, status) {
        const p = await this.prisma.product.update({
            where: { id },
            data: { status }
        });
        this.clearCache();
        return this.mapProduct(p);
    }
    async toggleDummyData(enable) {
        const status = enable ? 'ACTIVE' : 'SUSPENDED';
        await this.prisma.product.updateMany({
            where: { OR: [{ sellerId: null }, { sellerId: { isSet: false } }] },
            data: { status }
        });
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
    async remove(id) {
        await this.prisma.lead.deleteMany({ where: { productId: id } });
        await this.prisma.product.delete({ where: { id } });
        this.clearCache();
        return { success: true };
    }
    mapProduct(p) {
        return {
            ...p,
            seller: p.sellerName,
            sellerId: p.sellerId,
            category: p.categoryName,
            primaryType: p.type,
            images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
        };
    }
};
ProductsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ProductsService);
export { ProductsService };
//# sourceMappingURL=products.service.js.map