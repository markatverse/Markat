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
        createdAt: Date;
        userId: string | null;
        productId: string | null;
        type: string;
        serviceId: string | null;
        weight: number;
    }>;
    getRecommendations(userId?: string): Promise<any[]>;
}
