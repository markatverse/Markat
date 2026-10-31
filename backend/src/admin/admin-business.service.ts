import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class AdminBusinessService {
  private businessesCache: { data: any; expiry: number } | null = null;
  private branchesCache: { data: any; expiry: number } | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private clearCache() {
    this.businessesCache = null;
    this.branchesCache = null;
  }

  async getAllBusinesses() {
    if (this.businessesCache && Date.now() < this.businessesCache.expiry) {
      return this.businessesCache.data;
    }

    const businesses = await this.prisma.business.findMany({
      include: {
        wallet: true,
        user: {
          select: { id: true, markatId: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = businesses.map(b => {
      let businessCode = b.businessCode;
      let userMarkatId = b.user?.markatId;
      if (!businessCode) {
        businessCode = `BUS-${Math.floor(10000 + Math.random() * 90000)}`;
        this.prisma.business.update({ where: { id: b.id }, data: { businessCode } }).catch(() => null);
      }
      if (b.user && !userMarkatId) {
        userMarkatId = `MV-${Math.floor(10000000 + Math.random() * 90000000)}`;
        this.prisma.user.update({ where: { id: b.user.id }, data: { markatId: userMarkatId } }).catch(() => null);
      }
      return {
        ...b,
        businessCode,
        user: b.user ? { ...b.user, markatId: userMarkatId } : null
      };
    });

    this.businessesCache = { data: formatted, expiry: Date.now() + 30000 };
    return formatted;
  }

  async updateSubscription(id: string, data: { subscriptionStatus: string, subscriptionStartDate: Date | null, subscriptionEndDate: Date | null }) {
    this.clearCache();
    return this.prisma.business.update({
      where: { id },
      data
    });
  }

  async updateBilling(id: string, data: { commissionType: string, commissionRate: number, subscriptionStatus: string, subscriptionStartDate: Date | null, subscriptionEndDate: Date | null }) {
    this.clearCache();
    return this.prisma.business.update({
      where: { id },
      data
    });
  }

  // Branches
  async getAllBranches() {
    if (this.branchesCache && Date.now() < this.branchesCache.expiry) {
      return this.branchesCache.data;
    }
    const branches = await this.prisma.branch.findMany({
      include: { business: true },
      orderBy: { createdAt: 'desc' }
    });
    this.branchesCache = { data: branches, expiry: Date.now() + 30000 };
    return branches;
  }

  async createBranch(data: { name: string, status: string, businessId: string }) {
    this.clearCache();
    return this.prisma.branch.create({ data });
  }

  async updateBranch(id: string, data: { name?: string, status?: string, businessId?: string }) {
    this.clearCache();
    return this.prisma.branch.update({ where: { id }, data });
  }

  async deleteBranch(id: string) {
    this.clearCache();
    return this.prisma.branch.delete({ where: { id } });
  }
}
