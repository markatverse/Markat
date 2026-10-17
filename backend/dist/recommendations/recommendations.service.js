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
            const serviceCategories = ['Services', 'Home Services', 'Transport', 'Rentals', 'Organizers', 'Salon', 'Restaurant', 'Food & Dining', 'Healthcare', 'Clinic'];
            return p.primaryType === 'SERVICE' || serviceCategories.some(sc => (p.category || '').toLowerCase().includes(sc.toLowerCase()));
        };
        const allItems = [
            ...products.map((p) => ({
                ...p,
                itemType: isServiceRecord(p) ? 'service' : 'product',
            })),
            ...services.map((s) => ({ ...s, itemType: 'service' }))
        ];
        let recommended = allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (userId) {
            const userInteractions = await this.prisma.userInteraction.findMany({
                where: { userId }
            });
            const itemScores = new Map();
            for (const interaction of userInteractions) {
                if (interaction.productId) {
                    const current = itemScores.get(interaction.productId) || 0;
                    itemScores.set(interaction.productId, current + interaction.weight);
                }
                if (interaction.serviceId) {
                    const current = itemScores.get(interaction.serviceId) || 0;
                    itemScores.set(interaction.serviceId, current + interaction.weight);
                }
            }
            recommended = allItems.sort((a, b) => {
                const scoreA = itemScores.get(a.id) || 0;
                const scoreB = itemScores.get(b.id) || 0;
                if (scoreA !== scoreB) {
                    return scoreB - scoreA;
                }
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