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
    private static inMemoryFleet;
    private static inMemoryDispatches;
    getDeliveryOverview(): Promise<{
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
    assignDispatch(dispatchId: string, riderId: string): Promise<{
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
    updateRiderKyc(riderId: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED', reason?: string): Promise<{
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
    updateDeliveryZones(zonesConfig: any): Promise<{
        success: boolean;
        zonesConfig: any;
    }>;
    settleRiderPayouts(options: {
        riderIds?: string[];
        note?: string;
    }): Promise<{
        success: boolean;
        settledCount: number;
        totalSettledAmount: number;
        currency: string;
        settlementUtr: string;
        timestamp: string;
        note: string;
    }>;
}
