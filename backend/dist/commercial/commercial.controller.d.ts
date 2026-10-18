import { CommercialService } from './commercial.service.js';
export declare class CommercialController {
    private readonly commercialService;
    constructor(commercialService: CommercialService);
    getAdvertisements(): Promise<{
        id: string;
        title: string;
        mediaUrl: string | null;
        linkUrl: string | null;
        position: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
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
    getSubscriptions(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        planName: string;
        price: number;
        features: string[];
    }[]>;
    getSubscription(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        planName: string;
        price: number;
        features: string[];
    }>;
    createSubscription(data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        planName: string;
        price: number;
        features: string[];
    }>;
    updateSubscription(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        planName: string;
        price: number;
        features: string[];
    }>;
    deleteSubscription(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        planName: string;
        price: number;
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
}
