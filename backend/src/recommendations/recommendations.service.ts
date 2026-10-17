import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async logInteraction(data: { userId?: string; productId?: string; serviceId?: string; type: string }) {
    const weight = data.type === 'CLICK' ? 3 : 1; // Clicks matter more than views
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

  async getRecommendations(userId?: string) {
    // 1. Get all products and services
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

    // Helper to accurately classify if a product record is actually a service
    const isServiceRecord = (p: any) => {
      const serviceCategories = ['Services', 'Home Services', 'Transport', 'Rentals', 'Organizers', 'Salon', 'Restaurant', 'Food & Dining', 'Healthcare', 'Clinic'];
      return p.primaryType === 'SERVICE' || serviceCategories.some(sc => (p.category || '').toLowerCase().includes(sc.toLowerCase()));
    };

    // Format all items to a generic structure
    const allItems = [
      ...products.map((p: any) => ({
        ...p,
        itemType: isServiceRecord(p) ? 'service' : 'product',
      })),
      ...services.map((s: any) => ({ ...s, itemType: 'service' }))
    ];

    // Default sorting (e.g. newest first if no interactions)
    let recommended = allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 2. If user exists, factor in their past interactions
    if (userId) {
      const userInteractions = await this.prisma.userInteraction.findMany({
        where: { userId }
      });

      // Calculate scores per item based on interactions
      const itemScores = new Map<string, number>();
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

      // Sort items based on their score (descending)
      recommended = allItems.sort((a, b) => {
        const scoreA = itemScores.get(a.id) || 0;
        const scoreB = itemScores.get(b.id) || 0;
        
        // Also factor in global ratings (if we had a direct rating field, or we just rely on clicks here)
        // For simplicity, we strictly sort by interaction score, then fallback to newest.
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    // Limit to top 10
    return recommended.slice(0, 10);
  }
}
