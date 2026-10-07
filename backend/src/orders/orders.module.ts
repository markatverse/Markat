import { Module } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service.js';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { PrismaService } from '../prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, NotificationsService],
})
export class OrdersModule {}
