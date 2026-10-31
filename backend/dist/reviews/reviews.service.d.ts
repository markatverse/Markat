import { PrismaService } from '../prisma.service.js';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    createReview(data: {
        entityId: string;
        entityType: string;
        rating: number;
        comment?: string;
        userId: string;
        userName?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        entityType: string;
        entityId: string;
        userId: string;
        rating: number;
        comment: string | null;
        userName: string | null;
    }>;
    getReviews(entityType: string, entityId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        entityType: string;
        entityId: string;
        userId: string;
        rating: number;
        comment: string | null;
        userName: string | null;
    }[]>;
}
