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
let CommercialService = class CommercialService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAdvertisements() {
        return this.prisma.advertisement.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
    }
    async getAdvertisement(id) {
        const item = await this.prisma.advertisement.findUnique({ where: { id } });
        if (!item)
            throw new NotFoundException('Advertisement not found');
        return item;
    }
    async createAdvertisement(data) {
        return this.prisma.advertisement.create({ data });
    }
    async updateAdvertisement(id, data) {
        return this.prisma.advertisement.update({ where: { id }, data });
    }
    async deleteAdvertisement(id) {
        return this.prisma.advertisement.delete({ where: { id } });
    }
    async getCoupons() {
        return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async getCoupon(id) {
        const item = await this.prisma.coupon.findUnique({ where: { id } });
        if (!item)
            throw new NotFoundException('Coupon not found');
        return item;
    }
    async createCoupon(data) {
        return this.prisma.coupon.create({ data });
    }
    async updateCoupon(id, data) {
        return this.prisma.coupon.update({ where: { id }, data });
    }
    async deleteCoupon(id) {
        return this.prisma.coupon.delete({ where: { id } });
    }
    async getSubscriptions() {
        return this.prisma.subscription.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async getSubscription(id) {
        const item = await this.prisma.subscription.findUnique({ where: { id } });
        if (!item)
            throw new NotFoundException('Subscription not found');
        return item;
    }
    async createSubscription(data) {
        return this.prisma.subscription.create({ data });
    }
    async updateSubscription(id, data) {
        return this.prisma.subscription.update({ where: { id }, data });
    }
    async deleteSubscription(id) {
        return this.prisma.subscription.delete({ where: { id } });
    }
    async getCommissions() {
        return this.prisma.commissionRule.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async getCommission(id) {
        const item = await this.prisma.commissionRule.findUnique({ where: { id } });
        if (!item)
            throw new NotFoundException('Commission not found');
        return item;
    }
    async createCommission(data) {
        if (data.percentage)
            data.percentage = parseFloat(data.percentage);
        if (data.fixedFee)
            data.fixedFee = parseFloat(data.fixedFee);
        return this.prisma.commissionRule.create({ data });
    }
    async updateCommission(id, data) {
        if (data.percentage !== undefined)
            data.percentage = parseFloat(data.percentage);
        if (data.fixedFee !== undefined)
            data.fixedFee = parseFloat(data.fixedFee);
        return this.prisma.commissionRule.update({ where: { id }, data });
    }
    async deleteCommission(id) {
        return this.prisma.commissionRule.delete({ where: { id } });
    }
};
CommercialService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], CommercialService);
export { CommercialService };
//# sourceMappingURL=commercial.service.js.map