import { PrismaService } from '../prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
export declare const STATUTORY_GST_RULES: {
    name: string;
    rate: number;
    status: string;
}[];
export declare class SystemConfigService {
    private prisma;
    private redis;
    private readonly SEO_CACHE_KEY;
    constructor(prisma: PrismaService, redis: RedisService);
    getSeoConfig(): Promise<any>;
    updateSeoConfig(data: {
        title: string;
        description: string;
    }): Promise<any>;
    getAuthConfig(): Promise<{
        enableEmail: boolean;
        enablePhone: boolean;
        enableGoogle: boolean;
        require2FA: boolean;
    }>;
    updateAuthConfig(data: {
        enableEmail: boolean;
        enablePhone: boolean;
        enableGoogle: boolean;
        require2FA: boolean;
    }): Promise<{
        enableEmail: boolean;
        enablePhone: boolean;
        enableGoogle: boolean;
        require2FA: boolean;
    }>;
    getQueueConfig(): Promise<{
        travelSpeedKmh: number;
        notificationBufferMin: number;
    }>;
    updateQueueConfig(data: {
        travelSpeedKmh: number;
        notificationBufferMin: number;
    }): Promise<{
        travelSpeedKmh: number;
        notificationBufferMin: number;
    }>;
    getPaymentMethods(): Promise<any>;
    savePaymentMethods(methods: any[]): Promise<any[]>;
    addPaymentMethod(data: any): Promise<any[]>;
    updatePaymentMethod(id: string, data: any): Promise<any[]>;
    deletePaymentMethod(id: string): Promise<any[]>;
    getTaxRules(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        rate: number;
    }[]>;
    seedStatutoryGstRules(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        rate: number;
    }[]>;
    addTaxRule(data: {
        name: string;
        rate: number;
        status?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        rate: number;
    }>;
    updateTaxRule(id: string, data: {
        name?: string;
        rate?: number;
        status?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        rate: number;
    }>;
    deleteTaxRule(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        rate: number;
    }>;
}
