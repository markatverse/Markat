var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ShippingService_1;
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
let ShippingService = class ShippingService {
    static { ShippingService_1 = this; }
    prisma;
    notificationsService;
    logger = new Logger(ShippingService_1.name);
    shiprocketToken = null;
    tokenExpiresAt = 0;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async getShiprocketToken() {
        const email = process.env.SHIPROCKET_EMAIL;
        const password = process.env.SHIPROCKET_PASSWORD;
        if (!email || !password) {
            return null;
        }
        if (this.shiprocketToken && Date.now() < this.tokenExpiresAt) {
            return this.shiprocketToken;
        }
        try {
            const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (res.ok) {
                const data = await res.json();
                this.shiprocketToken = data.token;
                this.tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
                return this.shiprocketToken;
            }
        }
        catch (err) {
            this.logger.warn(`Shiprocket auth failed, falling back to simulated sandbox mode: ${err}`);
        }
        return null;
    }
    async checkServiceability(pickupPincode, deliveryPincode, weightKg = 0.5, isB2B = false) {
        if (isB2B) {
            throw new BadRequestException('Automated courier delivery is reserved for B2C retail orders. B2B wholesale deals use custom RFQ freight and logistics agreements finalized between buyer and seller.');
        }
        const token = await this.getShiprocketToken();
        if (token) {
            try {
                const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weightKg}&cod=0`;
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    const recommended = data?.data?.available_courier_companies?.[0];
                    if (recommended) {
                        return {
                            serviceable: true,
                            courierName: recommended.courier_name || 'Delhivery Surface',
                            estimatedDays: parseInt(recommended.estimated_delivery_days, 10) || 3,
                            rate: parseFloat(recommended.rate) || 60,
                            zone: recommended.zone || 'Domestic',
                            isB2C: true,
                        };
                    }
                }
            }
            catch (err) {
                this.logger.warn(`Shiprocket rate check failed: ${err}`);
            }
        }
        const isServiceable = Boolean(deliveryPincode && deliveryPincode.length === 6 && /^\d+$/.test(deliveryPincode));
        return {
            serviceable: isServiceable,
            courierName: 'Delhivery / BlueDart Express (B2C)',
            estimatedDays: pickupPincode.slice(0, 2) === deliveryPincode.slice(0, 2) ? 2 : 4,
            rate: 49.0,
            zone: 'Standard Zone A',
            isB2C: true,
        };
    }
    async createB2CShipment(orderId, sellerId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order) {
            throw new NotFoundException(`Order ${orderId} not found`);
        }
        const productIds = order.items.map((i) => i.productId);
        const b2bProducts = await this.prisma.product.findMany({
            where: {
                id: { in: productIds },
                isB2B: true,
            },
        });
        if (b2bProducts.length > 0) {
            throw new BadRequestException(`Cannot dispatch automated courier delivery: Order contains wholesale B2B items (${b2bProducts.map((p) => p.name).join(', ')}). B2B deals require custom freight / transport agreements finalized through the RFQ deal workflow.`);
        }
        const trackingNumber = `MV-AWB-${Math.floor(100000000 + Math.random() * 900000000)}`;
        const courierPartner = 'Delhivery Express (B2C)';
        const shippingLabelUrl = `https://markatverse.com/api/shipping/label/${trackingNumber}.pdf`;
        const token = await this.getShiprocketToken();
        let liveAwb = trackingNumber;
        if (token) {
            try {
                const payload = {
                    order_id: order.orderNumber || order.id,
                    order_date: new Date().toISOString().split('T')[0],
                    pickup_location: 'Primary Store',
                    billing_customer_name: order.buyerId || 'Customer',
                    billing_address: 'Delivery Address',
                    billing_city: 'Delhi',
                    billing_pincode: '110001',
                    billing_state: 'Delhi',
                    billing_country: 'India',
                    billing_email: 'customer@markatverse.com',
                    billing_phone: '9876543210',
                    shipping_is_billing: true,
                    order_items: order.items.map((i) => ({
                        name: i.productName || 'Product',
                        sku: i.productId,
                        units: i.quantity,
                        selling_price: i.price,
                    })),
                    payment_method: 'Prepaid',
                    sub_total: order.total,
                    length: 10,
                    breadth: 10,
                    height: 10,
                    weight: 0.5,
                };
                const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
                if (res.ok) {
                    const resData = await res.json();
                    liveAwb = resData.awb_code || resData.shipment_id || trackingNumber;
                }
            }
            catch (err) {
                this.logger.warn(`Live Shiprocket order push failed, utilizing MarkatVerse AWB: ${err}`);
            }
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'READY_FOR_PICKUP',
            },
        });
        if (order.buyerId) {
            await this.notificationsService.sendNotification({
                type: 'ORDER_PROCESSING',
                recipientId: order.buyerId,
                data: {
                    orderId: order.orderNumber || order.id,
                    trackingNumber: liveAwb,
                    courier: courierPartner,
                },
            });
        }
        return {
            success: true,
            orderId: order.id,
            orderNumber: order.orderNumber,
            orderType: 'B2C',
            trackingNumber: liveAwb,
            courierPartner,
            shippingLabelUrl,
            status: 'READY_FOR_PICKUP',
            message: 'B2C Shipment generated successfully! Print label and pack product for courier pickup.',
        };
    }
    async requestCourierPickup(orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            throw new NotFoundException(`Order ${orderId} not found`);
        }
        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PICKUP_SCHEDULED',
            },
        });
        return {
            success: true,
            orderId: order.id,
            status: 'PICKUP_SCHEDULED',
            pickupTimeSlot: 'Today between 2:00 PM - 6:00 PM',
            message: 'Courier pickup scheduled! A pickup agent will visit your location today.',
        };
    }
    async getTrackingDetails(trackingNumber) {
        return {
            trackingNumber,
            carrier: 'Delhivery / Shiprocket B2C Express',
            currentStatus: 'IN_TRANSIT',
            estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            }),
            checkpoints: [
                {
                    status: 'Order Placed',
                    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString('en-IN'),
                    completed: true,
                },
                {
                    status: 'Picked up by Courier Agent',
                    time: new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleString('en-IN'),
                    completed: true,
                },
                {
                    status: 'In Transit to Hub',
                    time: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString('en-IN'),
                    completed: true,
                },
                {
                    status: 'Out for Delivery',
                    time: 'Expected Tomorrow',
                    completed: false,
                },
                {
                    status: 'Delivered',
                    time: 'Pending',
                    completed: false,
                },
            ],
        };
    }
    async handleWebhook(payload) {
        const { order_id, current_status, awb } = payload;
        this.logger.log(`Received courier webhook for order ${order_id}: status ${current_status}, awb ${awb}`);
        if (!order_id) {
            return { status: 'ignored', reason: 'No order_id provided' };
        }
        const order = await this.prisma.order.findFirst({
            where: {
                OR: [{ id: order_id }, { orderNumber: order_id }],
            },
        });
        if (!order) {
            return { status: 'ignored', reason: 'Order not found' };
        }
        if (current_status === 'DELIVERED') {
            await this.prisma.order.update({
                where: { id: order.id },
                data: { status: 'DELIVERED' },
            });
            const sellerItem = await this.prisma.orderItem.findFirst({
                where: { orderId: order.id },
            });
            if (sellerItem?.sellerId) {
                const wallet = await this.prisma.wallet.findFirst({
                    where: { businessId: sellerItem.sellerId },
                });
                if (wallet) {
                    await this.prisma.wallet.update({
                        where: { id: wallet.id },
                        data: {
                            availableBalance: { increment: order.total * 0.95 },
                            pendingBalance: { decrement: order.total * 0.95 },
                        },
                    });
                }
            }
        }
        else if (current_status === 'OUT_FOR_DELIVERY') {
            await this.prisma.order.update({
                where: { id: order.id },
                data: { status: 'OUT_FOR_DELIVERY' },
            });
        }
        else if (current_status === 'IN_TRANSIT' || current_status === 'PICKED_UP') {
            await this.prisma.order.update({
                where: { id: order.id },
                data: { status: 'SHIPPED' },
            });
        }
        return { status: 'success', current_status };
    }
    static inMemoryFleet = [
        {
            id: 'RDR-101',
            name: 'Vikram Singh',
            phone: '+91 98765 43210',
            vehicleType: 'Electric Scooter (EV)',
            vehicleNumber: 'UP 16 EV 9021',
            zone: 'Noida Sector 18 & Central',
            status: 'AVAILABLE',
            rating: 4.9,
            todayTrips: 8,
            todayEarnings: 740,
            codInHand: 1850,
            kycStatus: 'APPROVED',
            joinedDate: '2026-08-15',
            dlNumber: 'DL-0420210088921',
        },
        {
            id: 'RDR-102',
            name: 'Rahul Sharma',
            phone: '+91 98112 34567',
            vehicleType: 'Motorcycle (150cc)',
            vehicleNumber: 'DL 03 AB 4512',
            zone: 'South Delhi & Connaught',
            status: 'BUSY',
            rating: 4.8,
            todayTrips: 11,
            todayEarnings: 1020,
            codInHand: 3420,
            kycStatus: 'APPROVED',
            joinedDate: '2026-07-10',
            dlNumber: 'DL-1120190019283',
        },
        {
            id: 'RDR-103',
            name: 'Mohd. Imran',
            phone: '+91 99554 11223',
            vehicleType: 'Electric Scooter (EV)',
            vehicleNumber: 'HR 26 EV 3341',
            zone: 'Gurugram Cyber Hub',
            status: 'AVAILABLE',
            rating: 4.95,
            todayTrips: 6,
            todayEarnings: 560,
            codInHand: 980,
            kycStatus: 'APPROVED',
            joinedDate: '2026-09-01',
            dlNumber: 'HR-2620220038472',
        },
        {
            id: 'RDR-104',
            name: 'Ajay Verma',
            phone: '+91 97123 99887',
            vehicleType: 'Eco Bicycle',
            vehicleNumber: 'N/A',
            zone: 'East Delhi & Mayur Vihar',
            status: 'AVAILABLE',
            rating: 4.7,
            todayTrips: 5,
            todayEarnings: 390,
            codInHand: 450,
            kycStatus: 'PENDING',
            joinedDate: '2026-10-28',
            dlNumber: 'DL-0720230099112',
        },
        {
            id: 'RDR-105',
            name: 'Suresh Yadav',
            phone: '+91 98991 77665',
            vehicleType: 'Mini Delivery Van',
            vehicleNumber: 'UP 14 BT 8820',
            zone: 'Ghaziabad & Indirapuram',
            status: 'BUSY',
            rating: 4.85,
            todayTrips: 4,
            todayEarnings: 980,
            codInHand: 5120,
            kycStatus: 'APPROVED',
            joinedDate: '2026-06-20',
            dlNumber: 'UP-1420180055198',
        }
    ];
    static inMemoryDispatches = [
        {
            id: 'DSP-901',
            orderNumber: 'ORD-2026-8819',
            customerName: 'Pooja Agarwal',
            customerPhone: '+91 98101 22334',
            pickupStore: 'Sharma Organic Mart (Noida Sec 18)',
            deliveryAddress: 'Flat 402, Lotus Boulevard, Sector 100, Noida',
            distanceKm: 4.2,
            orderTotal: 840,
            codAmount: 840,
            paymentMode: 'COD',
            assignedRiderId: 'RDR-101',
            assignedRiderName: 'Vikram Singh',
            status: 'OUT_FOR_DELIVERY',
            slaMinutes: 35,
            elapsedMinutes: 18,
            createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
        },
        {
            id: 'DSP-902',
            orderNumber: 'ORD-2026-8824',
            customerName: 'Ankit Gupta',
            customerPhone: '+91 98711 55667',
            pickupStore: 'Reliance Digital Express (South Ext)',
            deliveryAddress: 'House 12B, Lajpat Nagar IV, New Delhi',
            distanceKm: 2.8,
            orderTotal: 2499,
            codAmount: 0,
            paymentMode: 'PREPAID_UPI',
            assignedRiderId: 'RDR-102',
            assignedRiderName: 'Rahul Sharma',
            status: 'PICKED_UP',
            slaMinutes: 30,
            elapsedMinutes: 12,
            createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
        },
        {
            id: 'DSP-903',
            orderNumber: 'ORD-2026-8831',
            customerName: 'Simran Chadha',
            customerPhone: '+91 98990 44332',
            pickupStore: 'Bikanervala Sweets (DLF Phase 3)',
            deliveryAddress: 'Tower 4, Ambience Island, Gurugram',
            distanceKm: 3.5,
            orderTotal: 620,
            codAmount: 620,
            paymentMode: 'COD',
            assignedRiderId: null,
            assignedRiderName: 'Unassigned (Awaiting Dispatch)',
            status: 'PENDING_DISPATCH',
            slaMinutes: 40,
            elapsedMinutes: 4,
            createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
        },
        {
            id: 'DSP-904',
            orderNumber: 'ORD-2026-8837',
            customerName: 'Karan Mehra',
            customerPhone: '+91 97110 88221',
            pickupStore: 'MedPlus Pharmacy (Sector 62)',
            deliveryAddress: 'Block C, Stellar Park, Sector 62, Noida',
            distanceKm: 1.4,
            orderTotal: 340,
            codAmount: 0,
            paymentMode: 'PREPAID_CARD',
            assignedRiderId: null,
            assignedRiderName: 'Unassigned (Awaiting Dispatch)',
            status: 'PENDING_DISPATCH',
            slaMinutes: 25,
            elapsedMinutes: 2,
            createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
        }
    ];
    async getDeliveryOverview() {
        try {
            const zonesConfig = await this.getDeliveryZones();
            const fleet = ShippingService_1.inMemoryFleet;
            const dispatches = ShippingService_1.inMemoryDispatches;
            const onlineRiders = fleet.filter(r => r.status === 'AVAILABLE').length;
            const busyRiders = fleet.filter(r => r.status === 'BUSY').length;
            const totalRiders = fleet.length;
            const pendingDispatches = dispatches.filter(d => d.status === 'PENDING_DISPATCH').length;
            const inTransitDispatches = dispatches.filter(d => d.status === 'OUT_FOR_DELIVERY' || d.status === 'PICKED_UP').length;
            const deliveredToday = 48;
            const avgDeliveryMinutes = 26;
            const totalCodCashInHand = fleet.reduce((acc, r) => acc + (r.codInHand || 0), 0);
            const pendingRiderEarnings = fleet.reduce((acc, r) => acc + (r.todayEarnings || 0), 0);
            return {
                metrics: {
                    onlineRiders,
                    busyRiders,
                    offlineRiders: totalRiders - (onlineRiders + busyRiders),
                    totalRiders,
                    pendingDispatches,
                    inTransitDispatches,
                    deliveredToday,
                    avgDeliveryMinutes,
                    totalCodCashInHand,
                    pendingRiderEarnings,
                    activeSurgeMultiplier: zonesConfig.surgeMultiplier || 1.0,
                },
                fleet,
                dispatches,
                zonesConfig,
                autoDispatchEnabled: true,
            };
        }
        catch (err) {
            this.logger.error('Error fetching delivery overview:', err);
            throw err;
        }
    }
    async assignDispatch(dispatchId, riderId) {
        const dispatch = ShippingService_1.inMemoryDispatches.find(d => d.id === dispatchId || d.orderNumber === dispatchId);
        if (!dispatch)
            throw new NotFoundException('Dispatch order not found');
        const rider = ShippingService_1.inMemoryFleet.find(r => r.id === riderId);
        if (!rider)
            throw new NotFoundException('Delivery rider not found');
        dispatch.assignedRiderId = rider.id;
        dispatch.assignedRiderName = rider.name;
        dispatch.status = 'ASSIGNED';
        rider.status = 'BUSY';
        return {
            success: true,
            message: `Order ${dispatch.orderNumber} successfully assigned to ${rider.name} (${rider.vehicleType})`,
            dispatch,
            rider,
        };
    }
    async updateRiderKyc(riderId, status, reason) {
        const rider = ShippingService_1.inMemoryFleet.find(r => r.id === riderId);
        if (!rider)
            throw new NotFoundException('Delivery rider not found');
        rider.kycStatus = status;
        return {
            success: true,
            message: `Rider ${rider.name} KYC status updated to ${status}${reason ? ` (${reason})` : ''}`,
            rider,
        };
    }
    async getDeliveryZones() {
        try {
            const cfg = await this.prisma.systemConfig.findUnique({
                where: { key: 'DELIVERY_ZONES_CONFIG' },
            });
            if (cfg && cfg.value) {
                return cfg.value;
            }
        }
        catch { }
        return {
            surgeMultiplier: 1.0,
            freeDeliveryThreshold: 999,
            zones: [
                {
                    id: 'ZONE-HYPERLOCAL',
                    name: 'Hyperlocal Express',
                    tagline: 'Instant 30-45m local delivery',
                    maxDistanceKm: 5,
                    baseFare: 40,
                    perKmRate: 10,
                    slaTarget: '30-45 mins',
                    isActive: true,
                },
                {
                    id: 'ZONE-INTRACITY',
                    name: 'Intra-City Standard',
                    tagline: 'Same-day metro courier coverage',
                    maxDistanceKm: 20,
                    baseFare: 70,
                    perKmRate: 8,
                    slaTarget: '2-4 Hours',
                    isActive: true,
                },
                {
                    id: 'ZONE-REGIONAL',
                    name: 'Regional Surface Courier',
                    tagline: 'Inter-city parcels & heavy shipments',
                    maxDistanceKm: 150,
                    baseFare: 120,
                    perKmRate: 5,
                    slaTarget: '1-2 Days',
                    isActive: true,
                },
            ],
        };
    }
    async updateDeliveryZones(zonesConfig) {
        try {
            await this.prisma.systemConfig.upsert({
                where: { key: 'DELIVERY_ZONES_CONFIG' },
                update: { value: zonesConfig },
                create: { key: 'DELIVERY_ZONES_CONFIG', value: zonesConfig },
            });
            return { success: true, zonesConfig };
        }
        catch (err) {
            this.logger.error('Error updating delivery zones config:', err);
            throw err;
        }
    }
    async settleRiderPayouts(options) {
        const targetFleet = options.riderIds && options.riderIds.length > 0
            ? ShippingService_1.inMemoryFleet.filter(r => options.riderIds.includes(r.id))
            : ShippingService_1.inMemoryFleet;
        let totalAmount = 0;
        targetFleet.forEach(r => {
            totalAmount += r.todayEarnings;
            r.todayEarnings = 0;
        });
        return {
            success: true,
            settledCount: targetFleet.length,
            totalSettledAmount: totalAmount,
            currency: 'INR',
            settlementUtr: `UTR-UPI-${Date.now().toString().slice(-8)}`,
            timestamp: new Date().toISOString(),
            note: options.note || 'Regular daily rider earnings payout settlement executed successfully.',
        };
    }
};
ShippingService = ShippingService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        NotificationsService])
], ShippingService);
export { ShippingService };
//# sourceMappingURL=shipping.service.js.map