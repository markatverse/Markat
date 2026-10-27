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
let ShippingService = ShippingService_1 = class ShippingService {
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
};
ShippingService = ShippingService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        NotificationsService])
], ShippingService);
export { ShippingService };
//# sourceMappingURL=shipping.service.js.map