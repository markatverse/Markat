import { PrismaService } from '../prisma.service.js';
export declare class PaymentService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getRazorpayCredentials(): Promise<{
        keyId: string;
        keySecret: string;
    }>;
    getPublicKey(): Promise<{
        keyId: string;
        isConfigured: boolean;
    }>;
    private getRazorpayClient;
    createRazorpayOrder(amount: number, receipt?: string, notes?: Record<string, any>): Promise<{
        id: string;
        entity: string;
        amount: number;
        amount_paid: number;
        amount_due: number;
        currency: string;
        receipt: string;
        status: string;
        attempts: number;
        notes: Record<string, any>;
        keyId: string;
        isMock: boolean;
    } | {
        keyId: string;
        isMock: boolean;
        id: string;
        entity: string;
        amount_paid: number;
        amount_due: number;
        status: "created" | "attempted" | "paid";
        attempts: number;
        created_at: number;
        description: string;
        token: import("razorpay/dist/types/tokens.js").Tokens.RazorpayAuthorizationToken;
        payments?: {
            [key: string]: string;
        };
        offers?: {
            [key: string]: string;
        };
        transfers?: {
            entity: string;
            count: string;
            items: import("razorpay/dist/types/transfers.js").Transfers.RazorpayTransfer[];
        } | import("razorpay/dist/types/transfers.js").Transfers.RazorpayTransfer[];
        amount: number | string;
        method?: "netbanking" | "upi" | "card" | "emandate" | "nach" | undefined;
        currency: string;
        offer_id?: string | null | undefined;
        bank_account?: import("razorpay/dist/types/orders.js").Orders.RazorpayOrderBankDetailsCreateRequestBody | undefined;
        partial_payment?: boolean | undefined;
        first_payment_min_amount?: number | undefined;
        receipt?: string | undefined;
        notes?: import("razorpay/dist/types/api.js").IMap<string | number> | undefined;
        rto_review?: boolean | undefined;
        line_items?: import("razorpay/dist/types/orders.js").Orders.LineItems[] | undefined;
        line_items_total?: number | string | undefined;
        shipping_fee?: number | undefined;
        cod_fee?: number | undefined;
        customer_details?: import("razorpay/dist/types/orders.js").Orders.CustomerDetails | undefined;
        promotions?: import("razorpay/dist/types/orders.js").Orders.Promotion[] | undefined;
        device_details?: import("razorpay/dist/types/orders.js").Orders.DeviceDetails | undefined;
        phonepe_switch_context?: string | undefined;
    }>;
    verifyPayment(data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): Promise<{
        verified: boolean;
        message: string;
        paymentId: string;
    }>;
}
