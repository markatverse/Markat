import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import * as bcrypt from 'bcryptjs';
import { BadRequestException } from '@nestjs/common';

import { PrismaService } from '../prisma.service.js';
import { IdGeneratorService } from '../id-generator/id-generator.service.js';
import { EventsService } from '../events/events.service.js';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
    private events: EventsService
  ) {}

  async create(createUserDto: any) {
    const markatId = await this.idGenerator.generateUserId();
    return this.prisma.user.create({ 
      data: { ...createUserDto, markatId } 
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: { business: true }
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, updateUserDto: any) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    
    // Log the intervention automatically
    this.events.logAction({
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: id,
      actorRole: 'ADMIN',
      details: {
        updates: updateUserDto,
        targetEmail: updated.email
      }
    });
    
    return updated;
  }

  async updatePassword(id: string, currentPassword?: string, newPassword?: string) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current and new password are required');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestException('User not found');
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    this.events.logAction({
      action: 'UPDATE_PASSWORD',
      entityType: 'User',
      entityId: id,
      actorRole: 'USER',
      details: { message: 'User changed their password' }
    });

    return { message: 'Password updated successfully' };
  }

  async remove(id: string) {
    // Log the intervention automatically
    this.events.logAction({
      action: 'DELETE_USER',
      entityType: 'User',
      entityId: id,
      actorRole: 'ADMIN',
      details: {
        reason: 'Admin intervention'
      }
    });

    // 1. Delete ServiceQueues and related
    const queues = await this.prisma.serviceQueue.findMany({ where: { sellerId: id } });
    const queueIds = queues.map(q => q.id);
    if (queueIds.length > 0) {
      await this.prisma.serviceBooking.deleteMany({ where: { queueId: { in: queueIds } } });
      await this.prisma.serviceStaff.deleteMany({ where: { queueId: { in: queueIds } } });
      await this.prisma.serviceResource.deleteMany({ where: { queueId: { in: queueIds } } });
      await this.prisma.serviceQueue.deleteMany({ where: { sellerId: id } });
    }

    // 2. Delete Businesses and related
    const businesses = await this.prisma.business.findMany({ where: { userId: id } });
    const businessIds = businesses.map(b => b.id);
    if (businessIds.length > 0) {
      const wallets = await this.prisma.wallet.findMany({ where: { businessId: { in: businessIds } } });
      const walletIds = wallets.map(w => w.id);
      if (walletIds.length > 0) {
        await this.prisma.ledgerTransaction.deleteMany({ where: { walletId: { in: walletIds } } });
        await this.prisma.withdrawalRequest.deleteMany({ where: { walletId: { in: walletIds } } });
        await this.prisma.wallet.deleteMany({ where: { businessId: { in: businessIds } } });
      }
      
      const bankAccounts = await this.prisma.bankAccount.findMany({ where: { businessId: { in: businessIds } } });
      const bankAccountIds = bankAccounts.map(ba => ba.id);
      if (bankAccountIds.length > 0) {
        await this.prisma.withdrawalRequest.deleteMany({ where: { bankAccountId: { in: bankAccountIds } } });
        await this.prisma.bankAccount.deleteMany({ where: { businessId: { in: businessIds } } });
      }

      await this.prisma.businessFeature.deleteMany({ where: { businessId: { in: businessIds } } });
      await this.prisma.business.deleteMany({ where: { userId: id } });
    }

    // 3. Delete Leads
    await this.prisma.lead.deleteMany({ where: { OR: [{ buyerId: id }, { sellerId: id }] } });

    // 4. Delete Products
    await this.prisma.product.deleteMany({ where: { sellerId: id } });

    // 5. Delete Listings
    await this.prisma.listing.deleteMany({ where: { sellerId: id } });

    // Delete the user itself
    return this.prisma.user.delete({ where: { id } });
  }

  async getAddresses(userId: string) {
    return this.prisma.shippingAddress.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addAddress(userId: string, data: any) {
    if (data.isDefault) {
      await this.prisma.shippingAddress.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    } else {
      const count = await this.prisma.shippingAddress.count({ where: { userId } });
      if (count === 0) data.isDefault = true;
    }
    return this.prisma.shippingAddress.create({
      data: { ...data, userId }
    });
  }

  async updateAddress(addressId: string, data: any) {
    if (data.isDefault) {
      const address = await this.prisma.shippingAddress.findUnique({ where: { id: addressId } });
      if (address) {
        await this.prisma.shippingAddress.updateMany({
          where: { userId: address.userId },
          data: { isDefault: false }
        });
      }
    }
    return this.prisma.shippingAddress.update({
      where: { id: addressId },
      data
    });
  }

  async deleteAddress(addressId: string) {
    return this.prisma.shippingAddress.delete({
      where: { id: addressId }
    });
  }
}
