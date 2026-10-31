import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(businessId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { businessId }
    });

    if (!wallet) {
      // Auto-create wallet if it doesn't exist
      wallet = await this.prisma.wallet.create({
        data: { businessId }
      });
    }

    return wallet;
  }

  async getTransactions(walletId: string) {
    return this.prisma.ledgerTransaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addBankAccount(businessId: string, data: { accountName: string, accountNumber: string, ifscCode: string, bankName: string }) {
    return this.prisma.bankAccount.create({
      data: {
        businessId,
        ...data
      }
    });
  }

  async getBankAccounts(businessId: string) {
    return this.prisma.bankAccount.findMany({
      where: { businessId }
    });
  }

  async requestWithdrawal(businessId: string, amount: number, bankAccountId: string) {
    if (!amount || typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
      throw new BadRequestException('Withdrawal amount must be a positive number greater than 0');
    }

    const wallet = await this.getWallet(businessId);

    if (wallet.availableBalance < amount) {
      throw new BadRequestException('Insufficient available balance');
    }

    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id: bankAccountId, businessId }
    });
    if (!bankAccount) {
      throw new BadRequestException('Selected bank account does not belong to this business');
    }

    // Wrap in transaction to ensure atomicity
    return this.prisma.$transaction(async (tx: any) => {
      // Create withdrawal request
      const request = await tx.withdrawalRequest.create({
        data: {
          walletId: wallet.id,
          bankAccountId,
          amount,
          netAmount: amount, // Assuming no withdrawal fee for now
          status: 'REQUESTED'
        }
      });

      // Update wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { decrement: amount },
          withdrawn: { increment: amount }
        }
      });

      // Add ledger entry
      await tx.ledgerTransaction.create({
        data: {
          walletId: wallet.id,
          referenceId: request.id,
          referenceType: 'WITHDRAWAL',
          grossAmount: amount,
          netAmount: amount,
          type: 'DEBIT',
          status: 'PENDING'
        }
      });

      return request;
    });
  }

  async payPlatform(businessId: string, fromBalance: boolean = false) {
    const wallet = await this.getWallet(businessId);
    if (!wallet) throw new NotFoundException('Wallet not found');

    const amountOwed = wallet.owedToPlatform;
    if (amountOwed <= 0) return wallet;

    if (fromBalance) {
      if (wallet.availableBalance < amountOwed) {
        throw new BadRequestException('Insufficient available balance to settle commission');
      }

      return this.prisma.$transaction(async (tx: any) => {
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            owedToPlatform: 0,
            availableBalance: { decrement: amountOwed }
          }
        });

        await tx.ledgerTransaction.create({
          data: {
            walletId: wallet.id,
            referenceType: 'COMMISSION_SETTLEMENT',
            grossAmount: amountOwed,
            platformFee: amountOwed,
            netAmount: amountOwed,
            type: 'SETTLEMENT',
            status: 'COMPLETED'
          }
        });

        
        // Automatically resume business and any suspended service queues
        await tx.business.update({
          where: { id: businessId },
          data: { commissionSuspended: false }
        });
        const bus = await tx.business.findUnique({ where: { id: businessId } });
        if (bus && bus.userId) {
          await tx.serviceQueue.updateMany({
            where: { sellerId: bus.userId },
            data: { status: 'ACTIVE', isOpen: true, commissionSuspended: false }
          });
        }

        return updatedWallet;
      });
    }

    return this.prisma.$transaction(async (tx: any) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { owedToPlatform: 0 }
      });

      await tx.ledgerTransaction.create({
        data: {
          walletId: wallet.id,
          referenceType: 'COMMISSION_SETTLEMENT',
          grossAmount: amountOwed,
          platformFee: amountOwed,
          netAmount: amountOwed,
          type: 'SETTLEMENT',
          status: 'COMPLETED'
        }
      });

      return updatedWallet;
    });
  }
}

