import { JwtService } from '@nestjs/jwt';
import { ShippingService } from './shipping.service.js';
export declare class ShippingController {
    private readonly shippingService;
    private readonly jwtService;
    constructor(shippingService: ShippingService, jwtService: JwtService);
    private verifyAdminOrStaff;
    getDeliveryOverview(authHeader?: string): Promise<{
        metrics: {
            onlineRiders: number;
            busyRiders: number;
            offlineRiders: number;
            totalRiders: number;
            pendingDispatches: number;
            inTransitDispatches: number;
            deliveredToday: number;
            avgDeliveryMinutes: number;
            totalCodCashInHand: number;
            pendingRiderEarnings: number;
            activeSurgeMultiplier: any;
        };
        fleet: {
            id: string;
            name: string;
            phone: string;
            vehicleType: string;
            vehicleNumber: string;
            zone: string;
            status: string;
            rating: number;
            todayTrips: number;
            todayEarnings: number;
            codInHand: number;
            kycStatus: string;
            joinedDate: string;
            dlNumber: string;
        }[];
        dispatches: ({
            id: string;
            orderNumber: string;
            customerName: string;
            customerPhone: string;
            pickupStore: string;
            deliveryAddress: string;
            distanceKm: number;
            orderTotal: number;
            codAmount: number;
            paymentMode: string;
            assignedRiderId: string;
            assignedRiderName: string;
            status: string;
            slaMinutes: number;
            elapsedMinutes: number;
            createdAt: string;
        } | {
            id: string;
            orderNumber: string;
            customerName: string;
            customerPhone: string;
            pickupStore: string;
            deliveryAddress: string;
            distanceKm: number;
            orderTotal: number;
            codAmount: number;
            paymentMode: string;
            assignedRiderId: null;
            assignedRiderName: string;
            status: string;
            slaMinutes: number;
            elapsedMinutes: number;
            createdAt: string;
        })[];
        zonesConfig: any;
        autoDispatchEnabled: boolean;
    }>;
    assignDispatch(body: {
        dispatchId: string;
        riderId: string;
    }, authHeader?: string): Promise<{
        success: boolean;
        message: string;
        dispatch: {
            id: string;
            orderNumber: string;
            customerName: string;
            customerPhone: string;
            pickupStore: string;
            deliveryAddress: string;
            distanceKm: number;
            orderTotal: number;
            codAmount: number;
            paymentMode: string;
            assignedRiderId: string;
            assignedRiderName: string;
            status: string;
            slaMinutes: number;
            elapsedMinutes: number;
            createdAt: string;
        } | {
            id: string;
            orderNumber: string;
            customerName: string;
            customerPhone: string;
            pickupStore: string;
            deliveryAddress: string;
            distanceKm: number;
            orderTotal: number;
            codAmount: number;
            paymentMode: string;
            assignedRiderId: null;
            assignedRiderName: string;
            status: string;
            slaMinutes: number;
            elapsedMinutes: number;
            createdAt: string;
        };
        rider: {
            id: string;
            name: string;
            phone: string;
            vehicleType: string;
            vehicleNumber: string;
            zone: string;
            status: string;
            rating: number;
            todayTrips: number;
            todayEarnings: number;
            codInHand: number;
            kycStatus: string;
            joinedDate: string;
            dlNumber: string;
        };
    }>;
    updateRiderKyc(id: string, body: {
        status: 'APPROVED' | 'REJECTED' | 'SUSPENDED';
        reason?: string;
    }, authHeader?: string): Promise<{
        success: boolean;
        message: string;
        rider: {
            id: string;
            name: string;
            phone: string;
            vehicleType: string;
            vehicleNumber: string;
            zone: string;
            status: string;
            rating: number;
            todayTrips: number;
            todayEarnings: number;
            codInHand: number;
            kycStatus: string;
            joinedDate: string;
            dlNumber: string;
        };
    }>;
    getDeliveryZones(): Promise<any>;
    updateDeliveryZones(body: any, authHeader?: string): Promise<{
        success: boolean;
        zonesConfig: any;
    }>;
    settleRiderPayouts(body: {
        riderIds?: string[];
        note?: string;
    }, authHeader?: string): Promise<{
        success: boolean;
        settledCount: number;
        totalSettledAmount: number;
        currency: string;
        settlementUtr: string;
        timestamp: string;
        note: string;
    }>;
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
