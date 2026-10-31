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
import { PrismaService } from '../prisma.service.js';
let AdminBusinessService = class AdminBusinessService {
    prisma;
    businessesCache = null;
    branchesCache = null;
    constructor(prisma) {
        this.prisma = prisma;
    }
    clearCache() {
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
    async updateSubscription(id, data) {
        this.clearCache();
        return this.prisma.business.update({
            where: { id },
            data
        });
    }
    async updateBilling(id, data) {
        this.clearCache();
        return this.prisma.business.update({
            where: { id },
            data
        });
    }
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
    async createBranch(data) {
        this.clearCache();
        return this.prisma.branch.create({ data });
    }
    async updateBranch(id, data) {
        this.clearCache();
        return this.prisma.branch.update({ where: { id }, data });
    }
    async deleteBranch(id) {
        this.clearCache();
        return this.prisma.branch.delete({ where: { id } });
    }
};
AdminBusinessService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AdminBusinessService);
export { AdminBusinessService };
//# sourceMappingURL=admin-business.service.js.map