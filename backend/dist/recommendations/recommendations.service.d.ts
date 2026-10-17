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
        productId: string | null;
        serviceId: string | null;
        type: string;
        weight: number;
        createdAt: Date;
    }>;
    getRecommendations(userId?: string): Promise<any[]>;
}
