import { CommercialService } from './commercial.service.js';
export declare class CommercialController {
    private readonly commercialService;
    constructor(commercialService: CommercialService);
    getAdvertisements(): Promise<any>;
    getAdvertisement(id: string): Promise<{
        id: string;
        title: string;
        mediaUrl: string | null;
        linkUrl: string | null;
        position: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createAdvertisement(data: any): Promise<{
        id: string;
        title: string;
        mediaUrl: string | null;
        linkUrl: string | null;
        position: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateAdvertisement(id: string, data: any): Promise<{
        id: string;
        title: string;
        mediaUrl: string | null;
        linkUrl: string | null;
        position: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteAdvertisement(id: string): Promise<{
        id: string;
        title: string;
        mediaUrl: string | null;
        linkUrl: string | null;
        position: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCoupons(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: number;
        type: string;
        validUntil: Date | null;
    }[]>;
    getCoupon(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: number;
        type: string;
        validUntil: Date | null;
    }>;
    createCoupon(data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: number;
        type: string;
        validUntil: Date | null;
    }>;
    updateCoupon(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: number;
        type: string;
        validUntil: Date | null;
    }>;
    deleteCoupon(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discount: number;
        type: string;
        validUntil: Date | null;
    }>;
    getSubscriptions(): Promise<any[]>;
    getSubscription(id: string): Promise<any>;
    createSubscription(data: any): Promise<any>;
    seedDefaultSubscriptions(): Promise<any[]>;
    updateSubscription(id: string, data: any): Promise<any>;
    deleteSubscription(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        planName: string;
        price: number;
        billingCycle: string | null;
        taxPercent: number | null;
        sacCode: string | null;
        features: string[];
    }>;
    getCommissions(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        entityType: string;
        entityId: string;
        percentage: number;
        fixedFee: number;
        isActive: boolean;
    }[]>;
    getCommission(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        entityType: string;
        entityId: string;
        percentage: number;
        fixedFee: number;
        isActive: boolean;
    }>;
    createCommission(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        entityType: string;
        entityId: string;
        percentage: number;
        fixedFee: number;
        isActive: boolean;
    }>;
    updateCommission(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        entityType: string;
        entityId: string;
        percentage: number;
        fixedFee: number;
        isActive: boolean;
    }>;
    deleteCommission(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        entityType: string;
        entityId: string;
        percentage: number;
        fixedFee: number;
        isActive: boolean;
    }>;
    getRegistrationFeeStats(): Promise<{
        total: number;
        paid: number;
        waived: number;
        pending: number;
        totalCollected: number;
    }>;
    getRegistrationFee(): Promise<any>;
    updateRegistrationFee(data: any): Promise<any>;
    patchRegistrationFee(data: any): Promise<any>;
    getAdsAdminOverview(): Promise<{
        metrics: {
            activeCampaigns: number;
            pendingModeration: number;
            totalImpressions: number;
            totalClicks: number;
            avgCtr: number;
            totalGrossSpend: number;
            taxAmount: number;
            netAdRevenue: number;
            totalPrepaidWallets: number;
            sacCode: string;
            taxRate: number;
        };
        policy: any;
        placementsConfig: any;
        campaigns: {
            id: string;
            advertiserId: string;
            advertiserName: string;
            campaignTitle: string;
            creativeUrl: string;
            placement: string;
            targetCategory: string;
            dailyBudget: number;
            totalBudget: number;
            bidType: string;
            cpcBid: number;
            impressions: number;
            clicks: number;
            status: string;
            submittedAt: string;
            rejectionReason: string | null;
        }[];
        advertisers: {
            id: string;
            name: string;
            contactPerson: string;
            email: string;
            phone: string;
            gstin: string;
            isVerified: boolean;
            walletBalance: number;
            totalLifetimeSpend: number;
            activeCampaigns: number;
        }[];
    }>;
    moderateCampaign(body: {
        campaignId: string;
        status: 'APPROVED' | 'REJECTED';
        reason?: string;
    }): Promise<{
        success: boolean;
        message: string;
        campaign: {
            id: string;
            advertiserId: string;
            advertiserName: string;
            campaignTitle: string;
            creativeUrl: string;
            placement: string;
            targetCategory: string;
            dailyBudget: number;
            totalBudget: number;
            bidType: string;
            cpcBid: number;
            impressions: number;
            clicks: number;
            status: string;
            submittedAt: string;
            rejectionReason: string | null;
        };
    }>;
    getPlacementsConfig(): Promise<any>;
    updatePlacementsConfig(body: any): Promise<{
        success: boolean;
        config: any;
    }>;
    topupAdvertiserWallet(body: {
        advertiserId: string;
        amount: number;
    }): Promise<{
        success: boolean;
        message: string;
        advertiser: {
            id: string;
            name: string;
            contactPerson: string;
            email: string;
            phone: string;
            gstin: string;
            isVerified: boolean;
            walletBalance: number;
            totalLifetimeSpend: number;
            activeCampaigns: number;
        };
        netCredited: number;
        gstCollected: number;
        sacCode: string;
        totalCharged: number;
    }>;
    getAdvertiserCampaigns(advertiserId?: string): Promise<{
        id: string;
        advertiserId: string;
        advertiserName: string;
        campaignTitle: string;
        creativeUrl: string;
        placement: string;
        targetCategory: string;
        dailyBudget: number;
        totalBudget: number;
        bidType: string;
        cpcBid: number;
        impressions: number;
        clicks: number;
        status: string;
        submittedAt: string;
        rejectionReason: string | null;
    }[]>;
    createAdvertiserCampaign(data: any): Promise<{
        success: boolean;
        message: string;
        campaign: {
            id: string;
            advertiserId: string;
            advertiserName: string;
            campaignTitle: string;
            creativeUrl: string;
            placement: string;
            targetCategory: string;
            dailyBudget: number;
            totalBudget: number;
            bidType: string;
            cpcBid: number;
            impressions: number;
            clicks: number;
            status: string;
            submittedAt: string;
            rejectionReason: null;
        };
    }>;
    toggleCampaignStatus(id: string): Promise<{
        success: boolean;
        message: string;
        campaign: {
            id: string;
            advertiserId: string;
            advertiserName: string;
            campaignTitle: string;
            creativeUrl: string;
            placement: string;
            targetCategory: string;
            dailyBudget: number;
            totalBudget: number;
            bidType: string;
            cpcBid: number;
            impressions: number;
            clicks: number;
            status: string;
            submittedAt: string;
            rejectionReason: string | null;
        };
    }>;
    getAdvertiserProfile(id: string): Promise<{
        id: string;
        name: string;
        contactPerson: string;
        email: string;
        phone: string;
        gstin: string;
        isVerified: boolean;
        walletBalance: number;
        totalLifetimeSpend: number;
        activeCampaigns: number;
    }>;
}
