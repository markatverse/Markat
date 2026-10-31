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
import { WalletService } from '../wallet/wallet.service.js';
import { EventsService } from '../events/events.service.js';
import { calculateStatutoryGst } from '../common/gst-engine.js';
let WebhookService = class WebhookService {
    prisma;
    walletService;
    eventsService;
    constructor(prisma, walletService, eventsService) {
        this.prisma = prisma;
        this.walletService = walletService;
        this.eventsService = eventsService;
    }
    async handlePaymentSuccess(data) {
        const { businessId, amount, referenceId, referenceType, paymentRef } = data;
        const wallet = await this.walletService.getWallet(businessId);
        const existingTx = await this.prisma.ledgerTransaction.findFirst({
            where: { paymentRef }
        });
        if (existingTx) {
            return { status: 'ignored', message: 'Transaction already processed' };
        }
        let commType = 'PERCENTAGE';
        let commRate = 5.0;
        let fixedFee = 0;
        const business = await this.prisma.business.findUnique({ where: { id: businessId } });
        if (business) {
            if (business.commissionType === 'PERCENTAGE' && business.commissionRate !== undefined && business.commissionRate > 0) {
                commType = 'PERCENTAGE';
                commRate = business.commissionRate;
            }
            else if (business.commissionType === 'FIXED' && business.commissionRate !== undefined && business.commissionRate > 0) {
                commType = 'FIXED';
                commRate = business.commissionRate;
            }
            else {
                const rule = await this.prisma.commissionRule.findFirst({
                    where: {
                        isActive: true,
                        OR: [
                            { entityType: 'SECTOR', entityId: business.sector || 'DEFAULT' },
                            { entityType: 'BUSINESS_TYPE', entityId: business.businessType || 'DEFAULT' },
                            { entityType: 'GLOBAL', entityId: 'ALL' }
                        ]
                    },
                    orderBy: { percentage: 'desc' }
                });
                if (rule) {
                    commType = 'PERCENTAGE';
                    commRate = rule.percentage;
                    fixedFee = rule.fixedFee || 0;
                }
            }
        }
        const gstBreakdown = calculateStatutoryGst({
            grossAmount: amount,
            sector: business?.sector,
            businessType: business?.businessType,
            hasGst: Boolean(business?.gstNumber),
            commissionType: commType,
            commissionRate: commRate,
            fixedFee,
        });
        const baseCommission = gstBreakdown.baseCommission;
        const taxWithheld = Math.round((gstBreakdown.commissionGst + gstBreakdown.tcsAmount) * 100) / 100;
        const platformFee = gstBreakdown.totalPlatformDeduction;
        const netAmount = gstBreakdown.netSellerPayout;
        await this.prisma.$transaction(async (tx) => {
            await tx.ledgerTransaction.create({
                data: {
                    walletId: wallet.id,
                    referenceId,
                    referenceType,
                    paymentRef,
                    grossAmount: amount,
                    commission: baseCommission,
                    tax: taxWithheld,
                    platformFee,
                    netAmount,
                    type: 'CREDIT',
                    status: 'PENDING_SETTLEMENT'
                }
            });
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    totalEarnings: { increment: amount },
                    pendingBalance: { increment: netAmount }
                }
            });
        });
        this.eventsService.emit('payment.confirmed', {
            referenceId,
            referenceType,
            businessId,
            amount
        });
        return {
            status: 'success',
            settlement: {
                grossAmount: amount,
                baseCommission,
                commissionGst: gstBreakdown.commissionGst,
                tcsAmount: gstBreakdown.tcsAmount,
                platformFee,
                netAmount,
                sacCode: gstBreakdown.sacCode
            }
        };
    }
};
WebhookService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        WalletService,
        EventsService])
], WebhookService);
export { WebhookService };
//# sourceMappingURL=webhook.service.js.map