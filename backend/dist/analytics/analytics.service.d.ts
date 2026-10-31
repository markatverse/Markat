import { PrismaService } from '../prisma.service.js';
export declare class AnalyticsService {
    private readonly prisma;
    private dashboardCache;
    constructor(prisma: PrismaService);
    getDashboardMetrics(): Promise<any>;
}
