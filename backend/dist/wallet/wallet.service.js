var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
let WalletService = class WalletService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWallet(businessId) {
        let wallet = await this.prisma.wallet.findUnique({
            where: { businessId }
        });
        if (!wallet) {
            wallet = await this.prisma.wallet.create({
                data: { businessId }
            });
        }
        return wallet;
    }
    async getTransactions(walletId) {
        return this.prisma.ledgerTransaction.findMany({
            where: { walletId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async addBankAccount(businessId, data) {
        return this.prisma.bankAccount.create({
            data: {
                businessId,
                ...data
            }
        });
    }
    async getBankAccounts(businessId) {
        return this.prisma.bankAccount.findMany({
            where: { businessId }
        });
    }
    async requestWithdrawal(businessId, amount, bankAccountId) {
        const wallet = await this.getWallet(businessId);
        if (wallet.availableBalance < amount) {
            throw new BadRequestException('Insufficient available balance');
        }
        return this.prisma.$transaction(async (tx) => {
            const request = await tx.withdrawalRequest.create({
                data: {
                    walletId: wallet.id,
                    bankAccountId,
                    amount,
                    netAmount: amount,
                    status: 'REQUESTED'
                }
            });
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    availableBalance: { decrement: amount },
                    withdrawn: { increment: amount }
                }
            });
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
    async payPlatform(businessId, fromBalance = false) {
        const wallet = await this.getWallet(businessId);
        if (!wallet)
            throw new NotFoundException('Wallet not found');
        const amountOwed = wallet.owedToPlatform;
        if (amountOwed <= 0)
            return wallet;
        if (fromBalance) {
            if (wallet.availableBalance < amountOwed) {
                throw new BadRequestException('Insufficient available balance to settle commission');
            }
            return this.prisma.$transaction(async (tx) => {
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
                return updatedWallet;
            });
        }
        return this.prisma.$transaction(async (tx) => {
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
};
WalletService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], WalletService);
export { WalletService };
//# sourceMappingURL=wallet.service.js.map