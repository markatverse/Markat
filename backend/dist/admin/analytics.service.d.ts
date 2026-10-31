import { PrismaService } from '../prisma.service.js';
export declare class AnalyticsService {
    private readonly prisma;
    private summaryCache;
    private financeCache;
    constructor(prisma: PrismaService);
    getSummary(): Promise<any>;
    getFinanceData(): Promise<any>;
}
