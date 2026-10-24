var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { IdGeneratorService } from '../id-generator/id-generator.service.js';
let ServiceQueueService = class ServiceQueueService {
    prisma;
    idGenerator;
    constructor(prisma, idGenerator) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
    }
    async createQueue(data) {
        const safeSellerId = data.sellerId || Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        return this.prisma.serviceQueue.create({
            data: {
                shopName: data.shopName,
                avgMinutes: data.avgMinutes ?? 20,
                pricePerHour: data.pricePerHour ?? 0,
                currentToken: 0,
                lastToken: 0,
                isOpen: true,
                sellerId: safeSellerId,
            },
        });
    }
    isValidObjectId(id) {
        return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
    }
    async getQueueBySeller(sellerId) {
        if (!this.isValidObjectId(sellerId)) {
            return null;
        }
        return this.prisma.serviceQueue.findFirst({
            where: { sellerId },
        });
    }
    async getAllQueues() {
        return this.prisma.serviceQueue.findMany({
            where: { isOpen: true, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getQueueStatus(queueId) {
        if (!this.isValidObjectId(queueId)) {
            throw new NotFoundException('Invalid queue ID format');
        }
        const queue = await this.prisma.serviceQueue.findUnique({
            where: { id: queueId },
            include: {
                staff: true,
                resources: true,
            }
        });
        if (!queue)
            throw new NotFoundException('Queue not found');
        const waiting = await this.prisma.serviceBooking.findMany({
            where: { queueId, status: { in: ['WAITING', 'CHECKED_IN', 'PENDING'] } },
            orderBy: [
                { appointmentTime: 'asc' },
                { tokenNumber: 'asc' }
            ],
        });
        const serving = await this.prisma.serviceBooking.findMany({
            where: { queueId, status: 'SERVING' },
        });
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const doneToday = await this.prisma.serviceBooking.count({
            where: { queueId, status: 'DONE', doneAt: { gte: todayStart } },
        });
        return {
            queue,
            staff: queue.staff,
            resources: queue.resources,
            serving,
            waiting,
            waitingCount: waiting.length,
            doneToday,
            estimatedWaitForNext: waiting.length > 0 ? queue.avgMinutes : 0,
        };
    }
    async joinQueue(queueId, data) {
        const queue = await this.prisma.serviceQueue.findUnique({
            where: { id: queueId },
        });
        if (!queue)
            throw new NotFoundException('Queue not found');
        const mode = data.bookingMode || 'TOKEN';
        let tokenNumber = null;
        let status = 'WAITING';
        if (mode === 'TOKEN') {
            if (!queue.isOpen)
                throw new NotFoundException('This service queue is closed for walk-ins');
            const updated = await this.prisma.serviceQueue.update({
                where: { id: queueId },
                data: { lastToken: { increment: 1 } },
            });
            tokenNumber = updated.lastToken;
        }
        else {
            status = 'PENDING';
        }
        const ahead = await this.prisma.serviceBooking.count({
            where: { queueId, status: { in: ['WAITING', 'CHECKED_IN'] } },
        });
        const estimatedWaitMin = mode === 'TOKEN' ? ahead * queue.avgMinutes : 0;
        const bookingNumber = await this.idGenerator.generateBookingId(mode === 'TOKEN');
        const token = await this.prisma.serviceBooking.create({
            data: {
                bookingNumber,
                queueId,
                tokenNumber,
                bookingMode: mode,
                appointmentTime: data.appointmentTime ? new Date(data.appointmentTime) : null,
                customerName: data.customerName,
                phone: data.phone,
                service: data.service ?? 'General',
                staffName: data.staffName,
                staffId: data.staffId,
                resourceId: data.resourceId,
                status: status,
            },
        });
        return { token, estimatedWaitMin, ahead };
    }
    async checkIn(tokenId) {
        const token = await this.prisma.serviceBooking.findUnique({
            where: { id: tokenId },
        });
        if (!token)
            throw new NotFoundException('Booking not found');
        return this.prisma.serviceBooking.update({
            where: { id: tokenId },
            data: { status: 'CHECKED_IN' },
        });
    }
    async getTokenStatus(tokenId) {
        const token = await this.prisma.serviceBooking.findUnique({
            where: { id: tokenId },
            include: { queue: true },
        });
        if (!token)
            throw new NotFoundException('Booking not found');
        const queue = token.queue;
        const ahead = await this.prisma.serviceBooking.count({
            where: {
                queueId: token.queueId,
                status: { in: ['WAITING', 'CHECKED_IN'] },
                tokenNumber: token.tokenNumber ? { lt: token.tokenNumber } : undefined,
                appointmentTime: token.appointmentTime ? { lt: token.appointmentTime } : undefined,
            },
        });
        const serving = await this.prisma.serviceBooking.findFirst({
            where: { queueId: token.queueId, status: 'SERVING' },
        });
        const estimatedWaitMin = ['WAITING', 'CHECKED_IN'].includes(token.status)
            ? ahead * queue.avgMinutes + (serving ? queue.avgMinutes : 0)
            : 0;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const recentDone = await this.prisma.serviceBooking.findMany({
            where: { queueId: token.queueId, status: 'DONE', doneAt: { gte: todayStart } },
            orderBy: { doneAt: 'desc' },
            take: 5,
        });
        const waitingTokens = await this.prisma.serviceBooking.findMany({
            where: { queueId: token.queueId, status: { in: ['WAITING', 'CHECKED_IN', 'ABSENT'] } },
            orderBy: [
                { appointmentTime: 'asc' },
                { tokenNumber: 'asc' }
            ],
        });
        const doneToday = await this.prisma.serviceBooking.count({
            where: { queueId: token.queueId, status: 'DONE', doneAt: { gte: todayStart } },
        });
        return {
            token,
            ahead,
            serving,
            estimatedWaitMin,
            queue,
            recentDone: recentDone.reverse(),
            waitingTokens,
            doneToday,
        };
    }
    async callNext(queueId, resourceId, staffId) {
        const queue = await this.prisma.serviceQueue.findUnique({
            where: { id: queueId },
        });
        if (!queue)
            throw new NotFoundException('Queue not found');
        const whereServing = { queueId, status: 'SERVING' };
        if (resourceId)
            whereServing.resourceId = resourceId;
        const currentlyServing = await this.prisma.serviceBooking.findFirst({
            where: whereServing,
        });
        if (currentlyServing) {
            await this.prisma.serviceBooking.update({
                where: { id: currentlyServing.id },
                data: { status: 'DONE', doneAt: new Date() },
            });
            await this.applyCommission(currentlyServing.id, queue.sellerId);
        }
        let nextToken = await this.prisma.serviceBooking.findFirst({
            where: { queueId, status: { in: ['WAITING', 'CHECKED_IN'] } },
            orderBy: [
                { appointmentTime: 'asc' },
                { tokenNumber: 'asc' }
            ],
        });
        if (!nextToken) {
            nextToken = await this.prisma.serviceBooking.findFirst({
                where: { queueId, status: 'ABSENT' },
                orderBy: [
                    { appointmentTime: 'asc' },
                    { tokenNumber: 'asc' }
                ],
            });
        }
        if (!nextToken) {
            await this.prisma.serviceQueue.update({
                where: { id: queueId },
                data: { currentToken: queue.lastToken },
            });
            return { message: 'Queue is empty', serving: null };
        }
        const serving = await this.prisma.serviceBooking.update({
            where: { id: nextToken.id },
            data: {
                status: 'SERVING',
                servedAt: new Date(),
                resourceId: resourceId || undefined,
                staffId: staffId || undefined,
            },
        });
        if (nextToken.bookingMode === 'TOKEN' && nextToken.tokenNumber) {
            await this.prisma.serviceQueue.update({
                where: { id: queueId },
                data: { currentToken: nextToken.tokenNumber },
            });
        }
        return { message: 'Next customer called', serving };
    }
    async markNoShow(tokenId) {
        const token = await this.prisma.serviceBooking.findUnique({
            where: { id: tokenId },
        });
        if (!token)
            throw new NotFoundException('Booking not found');
        return this.prisma.serviceBooking.update({
            where: { id: tokenId },
            data: { status: 'NO_SHOW', doneAt: new Date() },
        });
    }
    async markAbsent(tokenId) {
        const token = await this.prisma.serviceBooking.findUnique({
            where: { id: tokenId },
        });
        if (!token)
            throw new NotFoundException('Booking not found');
        return this.prisma.serviceBooking.update({
            where: { id: tokenId },
            data: { status: 'ABSENT', resourceId: null },
        });
    }
    async markWaiting(tokenId) {
        const token = await this.prisma.serviceBooking.findUnique({
            where: { id: tokenId },
        });
        if (!token)
            throw new NotFoundException('Booking not found');
        return this.prisma.serviceBooking.update({
            where: { id: tokenId },
            data: { status: 'WAITING' },
        });
    }
    async startServing(tokenId, resourceId) {
        const token = await this.prisma.serviceBooking.findUnique({
            where: { id: tokenId },
        });
        if (!token)
            throw new NotFoundException('Booking not found');
        let targetResourceId = resourceId || token.resourceId;
        if (!targetResourceId && token.queueId && this.prisma.queueResource) {
            const resource = await this.prisma.queueResource.findFirst({
                where: { queueId: token.queueId, isActive: true },
            });
            if (resource)
                targetResourceId = resource.id;
        }
        const updated = await this.prisma.serviceBooking.update({
            where: { id: tokenId },
            data: {
                status: 'SERVING',
                servedAt: new Date(),
                resourceId: targetResourceId || undefined,
            },
        });
        if (token.queueId && token.bookingMode === 'TOKEN' && token.tokenNumber) {
            await this.prisma.serviceQueue.update({
                where: { id: token.queueId },
                data: { currentToken: token.tokenNumber },
            });
        }
        return updated;
    }
    async markDone(tokenId) {
        const booking = await this.prisma.serviceBooking.update({
            where: { id: tokenId },
            data: { status: 'DONE', doneAt: new Date() },
        });
        const queue = await this.prisma.serviceQueue.findUnique({ where: { id: booking.queueId } });
        if (queue) {
            await this.applyCommission(booking.id, queue.sellerId);
        }
        return booking;
    }
    async getTodayStats(queueId) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const [done, noShow, waiting, serving, queue] = await Promise.all([
            this.prisma.serviceBooking.count({
                where: { queueId, status: 'DONE', doneAt: { gte: todayStart } },
            }),
            this.prisma.serviceBooking.count({
                where: { queueId, status: 'NO_SHOW', doneAt: { gte: todayStart } },
            }),
            this.prisma.serviceBooking.count({
                where: { queueId, status: { in: ['WAITING', 'CHECKED_IN'] } },
            }),
            this.prisma.serviceBooking.count({
                where: { queueId, status: 'SERVING' },
            }),
            this.prisma.serviceQueue.findUnique({ where: { id: queueId } }),
        ]);
        const totalHours = (done * (queue?.avgMinutes ?? 20)) / 60;
        const estimatedRevenue = totalHours * (queue?.pricePerHour ?? 0);
        return { done, noShow, waiting, serving, totalHours, estimatedRevenue, queue };
    }
    async updateQueueSettings(queueId, data) {
        return this.prisma.serviceQueue.update({
            where: { id: queueId },
            data,
        });
    }
    async resetQueue(queueId) {
        await this.prisma.serviceBooking.deleteMany({ where: { queueId } });
        return this.prisma.serviceQueue.update({
            where: { id: queueId },
            data: { currentToken: 0, lastToken: 0 },
        });
    }
    async addStaff(queueId, data) {
        return this.prisma.serviceStaff.create({
            data: {
                queueId,
                name: data.name,
                role: data.role,
                imageUrl: data.imageUrl,
                services: data.services || [],
            }
        });
    }
    async deleteStaff(queueId, staffId) {
        return this.prisma.serviceStaff.delete({
            where: { id: staffId }
        });
    }
    async addResource(queueId, data) {
        return this.prisma.serviceResource.create({
            data: {
                queueId,
                name: data.name,
                type: data.type || 'Chair',
                capacity: data.capacity || 1,
                services: data.services || [],
                assignedStaffId: data.assignedStaffId,
            }
        });
    }
    async deleteResource(queueId, resourceId) {
        return this.prisma.serviceResource.delete({
            where: { id: resourceId }
        });
    }
    async updateAdminStatus(queueId, status) {
        return this.prisma.serviceQueue.update({
            where: { id: queueId },
            data: { status },
        });
    }
    async getAnalytics(queueId) {
        if (!this.isValidObjectId(queueId)) {
            throw new NotFoundException('Invalid queue ID format');
        }
        const queue = await this.prisma.serviceQueue.findUnique({
            where: { id: queueId },
            include: { staff: true }
        });
        if (!queue)
            throw new NotFoundException('Queue not found');
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const [todayBookings, monthBookings] = await Promise.all([
            this.prisma.serviceBooking.findMany({
                where: { queueId, status: 'DONE', doneAt: { gte: todayStart } }
            }),
            this.prisma.serviceBooking.findMany({
                where: { queueId, status: 'DONE', doneAt: { gte: monthStart } }
            })
        ]);
        const todayEarnings = todayBookings.reduce((sum, b) => sum + (b.price || 0), 0);
        const monthEarnings = monthBookings.reduce((sum, b) => sum + (b.price || 0), 0);
        const staffStats = queue.staff.map((staff) => {
            const staffToday = todayBookings.filter((b) => b.staffId === staff.id);
            const staffMonth = monthBookings.filter((b) => b.staffId === staff.id);
            return {
                id: staff.id,
                name: staff.name,
                todayCustomers: staffToday.length,
                todayEarnings: staffToday.reduce((sum, b) => sum + (b.price || 0), 0),
                monthCustomers: staffMonth.length,
                monthEarnings: staffMonth.reduce((sum, b) => sum + (b.price || 0), 0)
            };
        });
        return {
            totalTodayCollection: todayEarnings,
            totalMonthCollection: monthEarnings,
            staffPerformance: staffStats
        };
    }
    async applyCommission(bookingId, sellerId) {
        if (!sellerId)
            return;
        try {
            const booking = await this.prisma.serviceBooking.findUnique({ where: { id: bookingId } });
            if (!booking || booking.price <= 0)
                return;
            const business = await this.prisma.business.findUnique({
                where: { userId: sellerId },
                include: { wallet: true }
            });
            if (!business)
                return;
            let amountOwed = 0;
            if (business.commissionType === 'PERCENTAGE') {
                amountOwed = booking.price * (business.commissionRate / 100);
            }
            else if (business.commissionType === 'FIXED') {
                amountOwed = business.commissionRate;
            }
            if (amountOwed > 0) {
                if (business.wallet) {
                    await this.prisma.wallet.update({
                        where: { id: business.wallet.id },
                        data: { owedToPlatform: { increment: amountOwed } }
                    });
                }
                else {
                    await this.prisma.wallet.create({
                        data: {
                            businessId: business.id,
                            owedToPlatform: amountOwed
                        }
                    });
                }
            }
        }
        catch (err) {
            console.error('Failed to apply commission', err);
        }
    }
};
ServiceQueueService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        IdGeneratorService])
], ServiceQueueService);
export { ServiceQueueService };
//# sourceMappingURL=service-queue.service.js.map