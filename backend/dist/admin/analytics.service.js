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
    summaryCache = null;
    financeCache = null;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary() {
        if (this.summaryCache && Date.now() < this.summaryCache.expiry) {
            return this.summaryCache.data;
        }
        const [totalUsers, totalSellers, totalProducts, totalQueues, totalOrders, totalLeads, completedOrdersAgg, businesses] = await Promise.all([
            this.prisma.user.count({ where: { role: 'CONSUMER' } }),
            this.prisma.business.count(),
            this.prisma.product.count(),
            this.prisma.serviceQueue.count(),
            this.prisma.order.count(),
            this.prisma.lead.count(),
            this.prisma.order.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { total: true }
            }),
            this.prisma.business.findMany({
                select: { wallet: { select: { totalEarnings: true } }, commissionType: true, commissionRate: true },
                take: 100
            })
        ]);
        const gmvFromOrders = completedOrdersAgg._sum.total || 0;
        let walletGMV = 0;
        let commission = 0;
        for (const b of businesses) {
            const bal = b.wallet?.totalEarnings || 0;
            walletGMV += bal;
            let baseComm = 0;
            if (b.commissionType === 'FIXED') {
                baseComm = (b.commissionRate || 999);
            }
            else {
                baseComm = bal * ((b.commissionRate || 5) / 100);
            }
            commission += Math.round(baseComm * 1.18 * 100) / 100;
        }
        const gmv = Math.max(gmvFromOrders, walletGMV);
        const result = {
            totalUsers,
            totalSellers,
            totalProducts,
            totalQueues,
            totalOrders,
            totalLeads,
            gmv,
            commission,
            bookings: totalOrders + totalQueues,
            retentionRate: '68%'
        };
        this.summaryCache = { data: result, expiry: Date.now() + 30000 };
        return result;
    }
    async getFinanceData() {
        if (this.financeCache && Date.now() < this.financeCache.expiry) {
            return this.financeCache.data;
        }
        const [transactions, withdrawalRequests] = await Promise.all([
            this.prisma.ledgerTransaction.findMany({
                orderBy: { createdAt: 'desc' },
                take: 100,
                include: {
                    wallet: {
                        include: {
                            business: {
                                select: { name: true }
                            }
                        }
                    }
                }
            }),
            this.prisma.withdrawalRequest.findMany({
                orderBy: { createdAt: 'desc' },
                take: 100,
                include: {
                    wallet: {
                        include: {
                            business: {
                                select: { name: true }
                            }
                        }
                    },
                    bankAccount: true
                }
            })
        ]);
        const result = {
            transactions,
            withdrawals: withdrawalRequests
        };
        this.financeCache = { data: result, expiry: Date.now() + 30000 };
        return result;
    }
};
AnalyticsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AnalyticsService);
export { AnalyticsService };
//# sourceMappingURL=analytics.service.js.map