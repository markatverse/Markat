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
            productId: string;
            productName: string | null;
            quantity: number;
            price: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        status: string;
        orderNumber: string | null;
        total: number;
    }>;
    findAll(authorization?: string): Promise<{
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
            productId: string;
            productName: string | null;
            quantity: number;
            price: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        status: string;
        orderNumber: string | null;
        total: number;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__OrderClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        status: string;
        orderNumber: string | null;
        total: number;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        status: string;
        orderNumber: string | null;
        total: number;
    }>;
    remove(id: string, authorization?: string): import(".prisma/client").Prisma.Prisma__OrderClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        status: string;
        orderNumber: string | null;
        total: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
