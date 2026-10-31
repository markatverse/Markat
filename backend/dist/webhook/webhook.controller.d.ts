import { WebhookService } from './webhook.service.js';
export declare class WebhookController {
    private readonly webhookService;
    constructor(webhookService: WebhookService);
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
