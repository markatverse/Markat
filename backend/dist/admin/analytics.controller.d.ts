import { AnalyticsService } from './analytics.service.js';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getRoot(): Promise<any>;
    getSummary(): Promise<any>;
    getFinanceData(): Promise<any>;
}
