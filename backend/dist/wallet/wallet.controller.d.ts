import { JwtService } from '@nestjs/jwt';
import { WalletService } from './wallet.service.js';
export declare class WalletController {
    private readonly walletService;
    private readonly jwtService;
    constructor(walletService: WalletService, jwtService: JwtService);
    private verifyWalletAccess;
    getWallet(businessId: string): Promise<{
        id: string;
        businessId: string;
        totalEarnings: number;
        pendingBalance: number;
        availableBalance: number;
        withdrawn: number;
        owedToPlatform: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getTransactions(walletId: string): Promise<{
        id: string;
        createdAt: Date;
        walletId: string;
        referenceId: string | null;
        referenceType: string | null;
        paymentRef: string | null;
        grossAmount: number;
        platformFee: number;
        commission: number;
        tax: number;
        netAmount: number;
        type: string;
        status: string;
        settledAt: Date | null;
    }[]>;
    getBankAccounts(businessId: string): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        accountName: string;
        accountNumber: string;
        ifscCode: string | null;
        bankName: string;
        isPrimary: boolean;
        isVerified: boolean;
    }[]>;
    addBankAccount(businessId: string, data: {
        accountName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
    }, authHeader?: string): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        accountName: string;
        accountNumber: string;
        ifscCode: string | null;
        bankName: string;
        isPrimary: boolean;
        isVerified: boolean;
    }>;
    requestWithdrawal(businessId: string, body: {
        amount: number;
        bankAccountId: string;
    }, authHeader?: string): Promise<any>;
    payPlatform(businessId: string, body?: {
        fromBalance?: boolean;
    }, authHeader?: string): Promise<any>;
}
