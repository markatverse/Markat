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
        userId: string | null;
        productId: string | null;
        serviceId: string | null;
        type: string;
        weight: number;
        createdAt: Date;
    }>;
}
