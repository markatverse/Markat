import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class AnalyticsService {
  private dashboardCache: { data: any; expiry: number } | null = null;

  constructor(private readonly prisma: PrismaService) { }

  async getDashboardMetrics() {
    if (this.dashboardCache && Date.now() < this.dashboardCache.expiry) {
      return this.dashboardCache.data;
    }

    // Parallel high-performance execution across indexed collections
    const [
      totalSellers,
      totalBuyers,
      activeOrders,
      ledgerAgg,
      exceptions,
      recentTransactions
    ] = await Promise.all([
      this.prisma.business.count(),
      this.prisma.user.count({
        where: { role: { in: ['buyer', 'CONSUMER'] } }
      }),
      this.prisma.order.count({
        where: { status: { in: ['PENDING', 'PROCESSING'] } }
      }),
      this.prisma.ledgerTransaction.aggregate({
        _sum: {
          grossAmount: true,
          platformFee: true
        },
        where: { type: 'CREDIT' }
      }),
      this.prisma.automationException.count({
        where: { status: 'OPEN' }
      }),
      this.prisma.ledgerTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { wallet: { include: { business: true } } }
      })
    ]);

    const result = {
      totalSellers,
      totalBuyers,
      activeOrders,
      totalVolume: ledgerAgg._sum.grossAmount || 0,
      totalPlatformRevenue: ledgerAgg._sum.platformFee || 0,
      openExceptions: exceptions,
      recentTransactions: recentTransactions.map(t => ({
        ...t,
        sellerName: t.wallet?.business?.name || 'Unknown'
      }))
    };

    this.dashboardCache = { data: result, expiry: Date.now() + 30000 };
    return result;
  }
}
