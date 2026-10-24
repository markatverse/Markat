import { PrismaService } from '../prisma.service.js';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardMetrics(): Promise<{
        totalSellers: number;
        totalBuyers: number;
        activeOrders: number;
        totalVolume: number;
        totalPlatformRevenue: number;
        openExceptions: number;
        recentTransactions: {
            sellerName: string;
            wallet: {
                business: {
                    businessType: string;
                    sector: string | null;
                    id: string;
                    name: string;
                    userId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    pincode: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    businessCode: string | null;
                    logo: string | null;
                    description: string | null;
                    businessModel: import(".prisma/client").$Enums.MainType;
                    address: string | null;
                    gstNumber: string | null;
                    panNumber: string | null;
                    aadharNumber: string | null;
                    idProofType: string | null;
                    idProofUrl: string | null;
                    businessHours: import("@prisma/client/runtime/library").JsonValue | null;
                    verified: boolean;
                    verificationStatus: string;
                    verificationLevel: number;
                    verificationNotes: string | null;
                    kycCallStatus: string | null;
                    kycNotes: string | null;
                    capabilities: string[];
                    maxListings: number;
                    commissionType: string;
                    commissionRate: number;
                    subscriptionStatus: string;
                    subscriptionStartDate: Date | null;
                    subscriptionEndDate: Date | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                businessId: string;
                totalEarnings: number;
                pendingBalance: number;
                availableBalance: number;
                withdrawn: number;
                owedToPlatform: number;
            };
            commission: number;
            id: string;
            status: string;
            createdAt: Date;
            type: string;
            referenceId: string | null;
            referenceType: string | null;
            walletId: string;
            paymentRef: string | null;
            grossAmount: number;
            platformFee: number;
            tax: number;
            netAmount: number;
            settledAt: Date | null;
        }[];
    }>;
}
