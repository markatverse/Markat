import { PrismaService } from '../prisma.service.js';
export declare class WalletService {
    private prisma;
    constructor(prisma: PrismaService);
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
    addBankAccount(businessId: string, data: {
        accountName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
    }): Promise<{
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
    requestWithdrawal(businessId: string, amount: number, bankAccountId: string): Promise<any>;
    payPlatform(businessId: string, fromBalance?: boolean): Promise<any>;
}
