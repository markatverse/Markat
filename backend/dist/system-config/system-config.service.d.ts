import { PrismaService } from '../prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
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
        updatedAt: Date;
        name: string;
        rate: number;
        status: string;
        createdAt: Date;
    }[]>;
    addTaxRule(data: {
        name: string;
        rate: number;
        status?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        rate: number;
        status: string;
        createdAt: Date;
    }>;
    updateTaxRule(id: string, data: {
        name?: string;
        rate?: number;
        status?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        rate: number;
        status: string;
        createdAt: Date;
    }>;
    deleteTaxRule(id: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        rate: number;
        status: string;
        createdAt: Date;
    }>;
}
