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
import * as bcrypt from 'bcryptjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { IdGeneratorService } from '../id-generator/id-generator.service.js';
import { EventsService } from '../events/events.service.js';
let UsersService = class UsersService {
    prisma;
    idGenerator;
    events;
    usersCache = null;
    clearCache() {
        this.usersCache = null;
    }
    safeUserSelect = {
        id: true,
        markatId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        business: true,
    };
    constructor(prisma, idGenerator, events) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
        this.events = events;
    }
    async create(createUserDto) {
        this.clearCache();
        const markatId = await this.idGenerator.generateUserId();
        return this.prisma.user.create({
            data: { ...createUserDto, markatId }
        });
    }
    findAll() {
        return this.prisma.user.findMany({
            select: this.safeUserSelect,
        });
    }
    findOne(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: this.safeUserSelect,
        });
    }
    async findRole(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { role: true },
        });
        return user?.role ?? null;
    }
    async update(id, updateUserDto) {
        this.clearCache();
        const updated = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
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
    async updatePassword(id, currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            throw new BadRequestException('Current and new password are required');
        }
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new BadRequestException('User not found');
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch)
            throw new BadRequestException('Current password is incorrect');
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
    async remove(id) {
        this.clearCache();
        this.events.logAction({
            action: 'DELETE_USER',
            entityType: 'User',
            entityId: id,
            actorRole: 'ADMIN',
            details: {
                reason: 'Admin intervention'
            }
        });
        const queues = await this.prisma.serviceQueue.findMany({ where: { sellerId: id } });
        const queueIds = queues.map(q => q.id);
        if (queueIds.length > 0) {
            await this.prisma.serviceBooking.deleteMany({ where: { queueId: { in: queueIds } } });
            await this.prisma.serviceStaff.deleteMany({ where: { queueId: { in: queueIds } } });
            await this.prisma.serviceResource.deleteMany({ where: { queueId: { in: queueIds } } });
            await this.prisma.serviceQueue.deleteMany({ where: { sellerId: id } });
        }
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
        await this.prisma.lead.deleteMany({ where: { OR: [{ buyerId: id }, { sellerId: id }] } });
        await this.prisma.product.deleteMany({ where: { sellerId: id } });
        await this.prisma.listing.deleteMany({ where: { sellerId: id } });
        return this.prisma.user.delete({ where: { id } });
    }
    async getAddresses(userId) {
        return this.prisma.shippingAddress.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async addAddress(userId, data) {
        if (data.isDefault) {
            await this.prisma.shippingAddress.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        else {
            const count = await this.prisma.shippingAddress.count({ where: { userId } });
            if (count === 0)
                data.isDefault = true;
        }
        const addressData = {
            label: data.label,
            isDefault: data.isDefault,
            name: data.name,
            street: data.street,
            city: data.city,
            state: data.state,
            pinCode: data.pinCode,
            country: data.country,
            phone: data.phone,
        };
        return this.prisma.shippingAddress.create({
            data: { ...addressData, userId }
        });
    }
    async updateAddress(userId, addressId, data) {
        const address = await this.prisma.shippingAddress.findFirst({
            where: { id: addressId, userId },
        });
        if (!address)
            throw new NotFoundException('Address not found');
        if (data.isDefault) {
            await this.prisma.shippingAddress.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        const addressData = {
            label: data.label,
            isDefault: data.isDefault,
            name: data.name,
            street: data.street,
            city: data.city,
            state: data.state,
            pinCode: data.pinCode,
            country: data.country,
            phone: data.phone,
        };
        return this.prisma.shippingAddress.update({
            where: { id: addressId },
            data: addressData
        });
    }
    async deleteAddress(userId, addressId) {
        const address = await this.prisma.shippingAddress.findFirst({
            where: { id: addressId, userId },
        });
        if (!address)
            throw new NotFoundException('Address not found');
        return this.prisma.shippingAddress.delete({
            where: { id: addressId }
        });
    }
};
UsersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        IdGeneratorService,
        EventsService])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map