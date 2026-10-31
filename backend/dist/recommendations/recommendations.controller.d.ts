import { RecommendationsService } from './recommendations.service.js';
export declare class RecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    getRecommendations(userId?: string): Promise<any[]>;
    logInteraction(body: {
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
}
