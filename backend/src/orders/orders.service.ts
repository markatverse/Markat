import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import { PrismaService } from '../prisma.service.js';
import { IdGeneratorService } from '../id-generator/id-generator.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private notificationsService: NotificationsService
  ) {}

  async create(createOrderDto: CreateOrderDto) {
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

    // Fire Push Notification to customer (B2B or B2C)
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
    
    // Map to match frontend expectations
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

  async findBySeller(sellerId: string) {
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

  findByBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({ where: { id } });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: updateOrderDto.status }
    });
    return updated;
  }

  remove(id: string) {
    return this.prisma.order.delete({ where: { id } });
  }
}
