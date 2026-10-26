import { PrismaService } from '../prisma.service.js';
export declare class ProductsService {
    private prisma;
    private listCache;
    private itemCache;
    private settingsCache;
    constructor(prisma: PrismaService);
    private clearCache;
    create(data: any): Promise<any>;
    findAll(location?: string, lat?: number, lng?: number, radius?: number, page?: number, limit?: number): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    updateAdminStatus(id: string, status: string): Promise<any>;
    toggleDummyData(enable: boolean): Promise<{
        success: boolean;
        message: string;
    }>;
    getDummyStatus(): Promise<{
        enabled: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    private mapProduct;
}
