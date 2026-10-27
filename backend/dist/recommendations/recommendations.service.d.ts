import { PrismaService } from '../prisma.service.js';
export declare class RecommendationsService {
    private prisma;
    constructor(prisma: PrismaService);
    logInteraction(data: {
        userId?: string;
        productId?: string;
        serviceId?: string;
        type: string;
    }): Promise<{
        id: string;
        userId: string | null;
        createdAt: Date;
        type: string;
        productId: string | null;
        serviceId: string | null;
        weight: number;
    }>;
    getRecommendations(userId?: string): Promise<any[]>;
}
