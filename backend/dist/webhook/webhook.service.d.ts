import { PrismaService } from '../prisma.service.js';
import { WalletService } from '../wallet/wallet.service.js';
import { EventsService } from '../events/events.service.js';
export declare class WebhookService {
    private prisma;
    private walletService;
    private eventsService;
    constructor(prisma: PrismaService, walletService: WalletService, eventsService: EventsService);
    handlePaymentSuccess(data: any): Promise<{
        status: string;
        message: string;
        settlement?: undefined;
    } | {
        status: string;
        settlement: {
            grossAmount: any;
            baseCommission: number;
            commissionGst: number;
            tcsAmount: number;
            platformFee: number;
            netAmount: number;
            sacCode: string;
        };
        message?: undefined;
    }>;
}
