import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CommercialService {
  constructor(private prisma: PrismaService) {}

  // Advertisements
  async getAdvertisements() {
    try {
      const ads = await this.prisma.advertisement.findMany({ take: 100 });
      return (ads || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err: any) {
      console.error('Error in getAdvertisements:', err?.message || err);
      return [];
    }
  }
  async getAdvertisement(id: string) {
    try {
      const item = await this.prisma.advertisement.findUnique({ where: { id } });
      if (!item) throw new NotFoundException('Advertisement not found');
      return item;
    } catch (err: any) {
      console.error('Error in getAdvertisement:', err?.message || err);
      throw err;
    }
  }
  async createAdvertisement(data: any) {
    try {
      return await this.prisma.advertisement.create({ data });
    } catch (err: any) {
      console.error('Error in createAdvertisement:', err?.message || err);
      throw err;
    }
  }
  async updateAdvertisement(id: string, data: any) {
    return this.prisma.advertisement.update({ where: { id }, data });
  }
  async deleteAdvertisement(id: string) {
    return this.prisma.advertisement.delete({ where: { id } });
  }

  // Coupons
  async getCoupons() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }
  async getCoupon(id: string) {
    const item = await this.prisma.coupon.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Coupon not found');
    return item;
  }
  async createCoupon(data: any) {
    return this.prisma.coupon.create({ data });
  }
  async updateCoupon(id: string, data: any) {
    return this.prisma.coupon.update({ where: { id }, data });
  }
  async deleteCoupon(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }

  // Subscriptions
  async getSubscriptions() {
    return this.prisma.subscription.findMany({ orderBy: { createdAt: 'desc' } });
  }
  async getSubscription(id: string) {
    const item = await this.prisma.subscription.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Subscription not found');
    return item;
  }
  async createSubscription(data: any) {
    return this.prisma.subscription.create({ data });
  }
  async updateSubscription(id: string, data: any) {
    return this.prisma.subscription.update({ where: { id }, data });
  }
  async deleteSubscription(id: string) {
    return this.prisma.subscription.delete({ where: { id } });
  }

  // Commission
  async getCommissions() {
    return this.prisma.commissionRule.findMany({ orderBy: { createdAt: 'desc' } });
  }
  async getCommission(id: string) {
    const item = await this.prisma.commissionRule.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Commission not found');
    return item;
  }
  async createCommission(data: any) {
    // Basic formatting for creation
    if (data.percentage) data.percentage = parseFloat(data.percentage);
    if (data.fixedFee) data.fixedFee = parseFloat(data.fixedFee);
    
    return this.prisma.commissionRule.create({ data });
  }
  async updateCommission(id: string, data: any) {
    if (data.percentage !== undefined) data.percentage = parseFloat(data.percentage);
    if (data.fixedFee !== undefined) data.fixedFee = parseFloat(data.fixedFee);

    return this.prisma.commissionRule.update({ where: { id }, data });
  }
  async deleteCommission(id: string) {
    return this.prisma.commissionRule.delete({ where: { id } });
  }
}
