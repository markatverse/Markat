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
      if (p.type === 'SERVICE' || p.primaryType === 'SERVICE') return true;
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

    // Format all items to a generic structure
    const allItems = [
      ...products.map((p: any) => ({
        ...p,
        category: p.categoryName || p.category,
        primaryType: p.type || p.primaryType,
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

      const interactedIds = new Set<string>();
      const categoryScores = new Map<string, number>();

      for (const interaction of userInteractions) {
        if (interaction.productId) interactedIds.add(interaction.productId);
        if (interaction.serviceId) interactedIds.add(interaction.serviceId);
      }

      // Learn user's preferred categories from their interactions
      for (const item of allItems) {
        if (interactedIds.has(item.id) && item.category) {
          const current = categoryScores.get(item.category) || 0;
          categoryScores.set(item.category, current + 1);
        }
      }

      // Recommend fresh items that user hasn't already interacted with
      const unviewedItems = allItems.filter(item => !interactedIds.has(item.id));
      const candidates = unviewedItems.length >= 5 ? unviewedItems : allItems;

      recommended = candidates.sort((a, b) => {
        const catA = categoryScores.get(a.category) || 0;
        const catB = categoryScores.get(b.category) || 0;
        if (catA !== catB) return catB - catA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    // Limit to top 10
    return recommended.slice(0, 10);
  }
}
