import { PrismaService } from '../prisma.service.js';
export declare class WalletService {
    private prisma;
    constructor(prisma: PrismaService);
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
    addBankAccount(businessId: string, data: {
        accountName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
    }): Promise<{
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
    requestWithdrawal(businessId: string, amount: number, bankAccountId: string): Promise<any>;
    payPlatform(businessId: string, fromBalance?: boolean): Promise<any>;
}
