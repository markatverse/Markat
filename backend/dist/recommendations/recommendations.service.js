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
let RecommendationsService = class RecommendationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logInteraction(data) {
        const weight = data.type === 'CLICK' ? 3 : 1;
        return this.prisma.userInteraction.create({
            data: {
                userId: data.userId,
                productId: data.productId,
                serviceId: data.serviceId,
                type: data.type,
                weight,
            },
        });
    }
    async getRecommendations(userId) {
        const [products, services] = await Promise.all([
            this.prisma.product.findMany({
                where: { status: { not: 'SUSPENDED' }, sellerId: { not: null } },
                include: { seller: true }
            }),
            this.prisma.serviceQueue.findMany({
                where: { status: { not: 'SUSPENDED' }, sellerId: { not: null } },
                include: { seller: true }
            })
        ]);
        const isServiceRecord = (p) => {
            if (p.type === 'SERVICE' || p.primaryType === 'SERVICE')
                return true;
            const cat = `${p.categoryName || ''} ${p.category || ''} ${p.subcategory || ''}`.toLowerCase();
            const serviceCategories = [
                'service', 'services', 'salon', 'saloon', 'spa', 'parlour', 'parlor',
                'restaurant', 'dining', 'food & dining', 'cafe', 'food',
                'doctor', 'clinic', 'healthcare', 'medical', 'hospital', 'dentist',
                'repair', 'cleaning', 'mechanic', 'carpenter', 'plumber', 'electrician',
                'wedding', 'consultant', 'lawyer', 'organizer', 'transport', 'rental'
            ];
            return serviceCategories.some(sc => cat.includes(sc));
        };
        const allItems = [
            ...products.map((p) => ({
                ...p,
                category: p.categoryName || p.category,
                primaryType: p.type || p.primaryType,
                itemType: isServiceRecord(p) ? 'service' : 'product',
            })),
            ...services.map((s) => ({ ...s, itemType: 'service' }))
        ];
        let recommended = allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (userId) {
            const userInteractions = await this.prisma.userInteraction.findMany({
                where: { userId }
            });
            const interactedIds = new Set();
            const categoryScores = new Map();
            for (const interaction of userInteractions) {
                if (interaction.productId)
                    interactedIds.add(interaction.productId);
                if (interaction.serviceId)
                    interactedIds.add(interaction.serviceId);
            }
            for (const item of allItems) {
                if (interactedIds.has(item.id) && item.category) {
                    const current = categoryScores.get(item.category) || 0;
                    categoryScores.set(item.category, current + 1);
                }
            }
            const unviewedItems = allItems.filter(item => !interactedIds.has(item.id));
            const candidates = unviewedItems.length >= 5 ? unviewedItems : allItems;
            recommended = candidates.sort((a, b) => {
                const catA = categoryScores.get(a.category) || 0;
                const catB = categoryScores.get(b.category) || 0;
                if (catA !== catB)
                    return catB - catA;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        }
        return recommended.slice(0, 10);
    }
};
RecommendationsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], RecommendationsService);
export { RecommendationsService };
//# sourceMappingURL=recommendations.service.js.map