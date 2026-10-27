var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { IdGeneratorService } from '../id-generator/id-generator.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
let OrdersService = class OrdersService {
    prisma;
    idGenerator;
    notificationsService;
    constructor(prisma, idGenerator, notificationsService) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
        this.notificationsService = notificationsService;
    }
    async create(createOrderDto) {
        const orderNumber = await this.idGenerator.generateOrderId();
        const newOrder = await this.prisma.order.create({
            data: {
                orderNumber,
                buyerId: createOrderDto.buyerId,
                total: createOrderDto.total,
                status: createOrderDto.status || 'PENDING',
                items: {
                    create: createOrderDto.items.map(item => ({
                        productId: item.productId,
                        productName: item.productName || 'Unknown Product',
                        sellerId: item.sellerId || 'unknown-seller',
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            },
            include: {
                items: true
            }
        });
        await this.notificationsService.sendNotification({
            type: 'ORDER_PROCESSING',
            recipientId: createOrderDto.buyerId || 'Guest',
            data: {
                orderId: orderNumber,
            }
        });
        return newOrder;
    }
    async findAll() {
        const orders = await this.prisma.order.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return orders.map(o => ({
            id: o.id,
            orderNumber: o.orderNumber,
            customerId: o.buyerId,
            customerName: o.buyerId || 'Guest',
            totalAmount: o.total,
            status: o.status,
            createdAt: o.createdAt
        }));
    }
    async findBySeller(sellerId) {
        const orders = await this.prisma.order.findMany({
            where: {
                items: {
                    some: {
                        sellerId: sellerId
                    }
                }
            },
            include: {
                items: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return orders.map(o => ({
            id: o.id,
            orderNumber: o.orderNumber,
            buyer: o.buyerId || 'Guest User',
            item: o.items.map(i => i.productName || 'Unknown Item').join(', '),
            amount: `₹${o.total}`,
            date: new Date(o.createdAt).toLocaleDateString(),
            status: o.status,
            customerId: o.buyerId
        }));
    }
    async findByBuyer(buyerId, alternateIds = []) {
        const ids = Array.from(new Set([buyerId, ...alternateIds].filter(Boolean)));
        return this.prisma.order.findMany({
            where: {
                OR: ids.map(id => ({ buyerId: id })),
            },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    findOne(id) {
        return this.prisma.order.findUnique({ where: { id } });
    }
    async update(id, updateOrderDto) {
        const updated = await this.prisma.order.update({
            where: { id },
            data: { status: updateOrderDto.status }
        });
        return updated;
    }
    remove(id) {
        return this.prisma.order.delete({ where: { id } });
    }
};
OrdersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        IdGeneratorService,
        NotificationsService])
], OrdersService);
export { OrdersService };
//# sourceMappingURL=orders.service.js.map