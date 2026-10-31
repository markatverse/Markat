import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { WalletService } from '../wallet/wallet.service.js';
import { EventsService } from '../events/events.service.js';
import { calculateStatutoryGst } from '../common/gst-engine.js';

@Injectable()
export class WebhookService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private eventsService: EventsService
  ) {}

  async handlePaymentSuccess(data: any) {
    // Mock webhook payload: { businessId, amount, referenceId, referenceType, paymentRef }
    const { businessId, amount, referenceId, referenceType, paymentRef } = data;

    const wallet = await this.walletService.getWallet(businessId);

    // Idempotency check
    const existingTx = await this.prisma.ledgerTransaction.findFirst({
      where: { paymentRef }
    });

    if (existingTx) {
      return { status: 'ignored', message: 'Transaction already processed' };
    }

    // Statutory GST Engine (Section 9(1) SAC 998319 18% GST on Commission, Section 52 1% TCS, Section 9(5) ECO)
    let commType: 'PERCENTAGE' | 'FIXED' = 'PERCENTAGE';
    let commRate = 5.0;
    let fixedFee = 0;

    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (business) {
      if (business.commissionType === 'PERCENTAGE' && business.commissionRate !== undefined && business.commissionRate > 0) {
        commType = 'PERCENTAGE';
        commRate = business.commissionRate;
      } else if (business.commissionType === 'FIXED' && business.commissionRate !== undefined && business.commissionRate > 0) {
        commType = 'FIXED';
        commRate = business.commissionRate;
      } else {
        // Find rule by main category/sector or fallback
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
    // Total statutory tax withheld: 18% GST on commission + 1% Section 52 TCS
    const taxWithheld = Math.round((gstBreakdown.commissionGst + gstBreakdown.tcsAmount) * 100) / 100;
    const platformFee = gstBreakdown.totalPlatformDeduction;
    const netAmount = gstBreakdown.netSellerPayout;

    await this.prisma.$transaction(async (tx: any) => {
      // 1. Add ledger entry with full statutory breakdown
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

      // 2. Update wallet pending balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          totalEarnings: { increment: amount },
          pendingBalance: { increment: netAmount }
        }
      });
    });

    // Phase 3: Emit Event for Order/Token Automation
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
}
