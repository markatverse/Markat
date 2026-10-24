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
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const product = await this.prisma.product.create({
            data: {
                name: data.name,
                type: data.primaryType || data.type || 'PRODUCT',
                price: parseFloat(data.price),
                originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
                description: data.description || null,
                categoryName: data.category || data.categoryName || null,
                sellerId: data.sellerId || null,
                sellerName: data.seller || data.sellerName || 'MarkatVerse Seller',
                location: data.location || 'India',
                latitude: data.latitude ? parseFloat(data.latitude) : null,
                longitude: data.longitude ? parseFloat(data.longitude) : null,
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
                isB2B: data.isB2B || false,
                moq: data.moq ? parseInt(data.moq) : 1,
                stock: data.stock ? parseInt(data.stock) : 0,
                sku: data.sku || null,
            },
        });
        return this.mapProduct(product);
    }
    async findAll(location, lat, lng, radius, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const useDbPagination = !(lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng));
        let products = await this.prisma.product.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            ...(useDbPagination ? { skip, take: limit } : {})
        });
        let total = useDbPagination ? await this.prisma.product.count({ where: { status: 'ACTIVE' } }) : 0;
        if (!useDbPagination && lat !== undefined && lng !== undefined) {
            let effectiveRadius = radius;
            let sectorRadiusMap = {};
            const settings = await this.prisma.configuration.findFirst({
                where: { type: 'SYSTEM_SETTINGS', name: 'global' },
            });
            const data = settings?.data;
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
        return {
            data: products.map(p => this.mapProduct(p)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async findOne(id) {
        const p = await this.prisma.product.findUnique({ where: { id } });
        return p ? this.mapProduct(p) : null;
    }
    async update(id, data) {
        const p = await this.prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                type: data.primaryType || data.type,
                price: data.price ? parseFloat(data.price) : undefined,
                originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
                description: data.description,
                categoryName: data.category || data.categoryName,
                sellerId: data.sellerId,
                sellerName: data.seller || data.sellerName,
                discount: data.discount !== undefined ? data.discount : undefined,
                badge: data.badge !== undefined ? data.badge : undefined,
                badgeColor: data.badgeColor !== undefined ? data.badgeColor : undefined,
                subcategory: data.subcategory !== undefined ? data.subcategory : undefined,
                parameters: data.parameters !== undefined ? data.parameters : undefined,
                options: data.options !== undefined ? data.options : undefined,
                image: data.image !== undefined ? data.image : undefined,
                images: data.images !== undefined ? data.images : undefined,
                isB2B: data.isB2B,
                moq: data.moq ? parseInt(data.moq) : undefined,
                stock: data.stock ? parseInt(data.stock) : undefined,
            },
        });
        return this.mapProduct(p);
    }
    async updateAdminStatus(id, status) {
        const p = await this.prisma.product.update({
            where: { id },
            data: { status }
        });
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