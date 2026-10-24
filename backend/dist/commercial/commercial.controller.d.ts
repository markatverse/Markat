import { CommercialService } from './commercial.service.js';
export declare class CommercialController {
    private readonly commercialService;
    constructor(commercialService: CommercialService);
    getAdvertisements(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }[]>;
    getAdvertisement(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }>;
    createAdvertisement(data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }>;
    updateAdvertisement(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }>;
    deleteAdvertisement(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        linkUrl: string | null;
        position: string;
        mediaUrl: string | null;
    }>;
    getCoupons(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        type: string;
        updatedAt: Date;
        code: string;
        discount: number;
        validUntil: Date | null;
    }[]>;
    getCoupon(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        type: string;
        updatedAt: Date;
        code: string;
        discount: number;
        validUntil: Date | null;
    }>;
    createCoupon(data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        type: string;
        updatedAt: Date;
        code: string;
        discount: number;
        validUntil: Date | null;
    }>;
    updateCoupon(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        type: string;
        updatedAt: Date;
        code: string;
        discount: number;
        validUntil: Date | null;
    }>;
    deleteCoupon(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        type: string;
        updatedAt: Date;
        code: string;
        discount: number;
        validUntil: Date | null;
    }>;
    getSubscriptions(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        features: string[];
        price: number;
        planName: string;
    }[]>;
    getSubscription(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        features: string[];
        price: number;
        planName: string;
    }>;
    createSubscription(data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        features: string[];
        price: number;
        planName: string;
    }>;
    updateSubscription(id: string, data: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        features: string[];
        price: number;
        planName: string;
    }>;
    deleteSubscription(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        features: string[];
        price: number;
        planName: string;
    }>;
    getCommissions(): Promise<{
        id: string;
        entityType: string;
        entityId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        percentage: number;
        fixedFee: number;
    }[]>;
    getCommission(id: string): Promise<{
        id: string;
        entityType: string;
        entityId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        percentage: number;
        fixedFee: number;
    }>;
    createCommission(data: any): Promise<{
        id: string;
        entityType: string;
        entityId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        percentage: number;
        fixedFee: number;
    }>;
    updateCommission(id: string, data: any): Promise<{
        id: string;
        entityType: string;
        entityId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        percentage: number;
        fixedFee: number;
    }>;
    deleteCommission(id: string): Promise<{
        id: string;
        entityType: string;
        entityId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        percentage: number;
        fixedFee: number;
    }>;
}
