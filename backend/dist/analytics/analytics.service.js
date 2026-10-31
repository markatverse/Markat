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
let AnalyticsService = class AnalyticsService {
    prisma;
    dashboardCache = null;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardMetrics() {
        if (this.dashboardCache && Date.now() < this.dashboardCache.expiry) {
            return this.dashboardCache.data;
        }
        const [totalSellers, totalBuyers, activeOrders, ledgerAgg, exceptions, recentTransactions] = await Promise.all([
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
};
AnalyticsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AnalyticsService);
export { AnalyticsService };
//# sourceMappingURL=analytics.service.js.map