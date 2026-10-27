import { PrismaService } from '../prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
export interface ServiceabilityResult {
    serviceable: boolean;
    courierName: string;
    estimatedDays: number;
    rate: number;
    zone: string;
    isB2C: boolean;
}
export declare class ShippingService {
    private readonly prisma;
    private readonly notificationsService;
    private readonly logger;
    private shiprocketToken;
    private tokenExpiresAt;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    private getShiprocketToken;
    checkServiceability(pickupPincode: string, deliveryPincode: string, weightKg?: number, isB2B?: boolean): Promise<ServiceabilityResult>;
    createB2CShipment(orderId: string, sellerId?: string): Promise<{
        success: boolean;
        orderId: string;
        orderNumber: string | null;
        orderType: string;
        trackingNumber: string;
        courierPartner: string;
        shippingLabelUrl: string;
        status: string;
        message: string;
    }>;
    requestCourierPickup(orderId: string): Promise<{
        success: boolean;
        orderId: string;
        status: string;
        pickupTimeSlot: string;
        message: string;
    }>;
    getTrackingDetails(trackingNumber: string): Promise<{
        trackingNumber: string;
        carrier: string;
        currentStatus: string;
        estimatedDelivery: string;
        checkpoints: {
            status: string;
            time: string;
            completed: boolean;
        }[];
    }>;
    handleWebhook(payload: any): Promise<{
        status: string;
        reason: string;
        current_status?: undefined;
    } | {
        status: string;
        current_status: any;
        reason?: undefined;
    }>;
}
