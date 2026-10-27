import { ShippingService } from './shipping.service.js';
export declare class ShippingController {
    private readonly shippingService;
    constructor(shippingService: ShippingService);
    checkServiceability(body: {
        pickupPincode: string;
        deliveryPincode: string;
        weightKg?: number;
        isB2B?: boolean;
    }): Promise<import("./shipping.service.js").ServiceabilityResult>;
    createShipment(orderId: string, body: {
        sellerId?: string;
    }): Promise<{
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
    requestPickup(orderId: string): Promise<{
        success: boolean;
        orderId: string;
        status: string;
        pickupTimeSlot: string;
        message: string;
    }>;
    trackShipment(trackingNumber: string): Promise<{
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
