import { JwtService } from '@nestjs/jwt';
import { WalletService } from './wallet.service.js';
export declare class WalletController {
    private readonly walletService;
    private readonly jwtService;
    constructor(walletService: WalletService, jwtService: JwtService);
    private verifyWalletAccess;
    getWallet(businessId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        totalEarnings: number;
        pendingBalance: number;
        availableBalance: number;
        withdrawn: number;
        owedToPlatform: number;
    }>;
    getTransactions(walletId: string): Promise<{
        commission: number;
        id: string;
        createdAt: Date;
        status: string;
        type: string;
        paymentRef: string | null;
        referenceId: string | null;
        referenceType: string | null;
        walletId: string;
        grossAmount: number;
        platformFee: number;
        tax: number;
        netAmount: number;
        settledAt: Date | null;
    }[]>;
    getBankAccounts(businessId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
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
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
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
