import { JwtService } from '@nestjs/jwt';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
export declare class OrdersController {
    private readonly ordersService;
    private readonly jwtService;
    constructor(ordersService: OrdersService, jwtService: JwtService);
    create(createOrderDto: CreateOrderDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sellerId: string | null;
            price: number;
            productId: string;
            productName: string | null;
            quantity: number;
            orderId: string;
        }[];
    } & {
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        orderNumber: string | null;
        total: number;
        orderType: string | null;
        trackingNumber: string | null;
        courierPartner: string | null;
        shippingLabelUrl: string | null;
        estimatedDelivery: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        orderNumber: string | null;
        customerId: string | null;
        customerName: string;
        totalAmount: number;
        status: string;
        createdAt: Date;
    }[]>;
    findBySeller(sellerId: string): Promise<{
        id: string;
        orderNumber: string | null;
        buyer: string;
        item: string;
        amount: string;
        date: string;
        status: string;
        customerId: string | null;
    }[]>;
    findByBuyer(buyerId: string, authorization?: string): Promise<({
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sellerId: string | null;
            price: number;
            productId: string;
            productName: string | null;
            quantity: number;
            orderId: string;
        }[];
    } & {
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        orderNumber: string | null;
        total: number;
        orderType: string | null;
        trackingNumber: string | null;
        courierPartner: string | null;
        shippingLabelUrl: string | null;
        estimatedDelivery: string | null;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__OrderClient<{
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        orderNumber: string | null;
        total: number;
        orderType: string | null;
        trackingNumber: string | null;
        courierPartner: string | null;
        shippingLabelUrl: string | null;
        estimatedDelivery: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<{
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        orderNumber: string | null;
        total: number;
        orderType: string | null;
        trackingNumber: string | null;
        courierPartner: string | null;
        shippingLabelUrl: string | null;
        estimatedDelivery: string | null;
    }>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__OrderClient<{
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        orderNumber: string | null;
        total: number;
        orderType: string | null;
        trackingNumber: string | null;
        courierPartner: string | null;
        shippingLabelUrl: string | null;
        estimatedDelivery: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
