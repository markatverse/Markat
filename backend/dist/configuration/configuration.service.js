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
let ConfigurationService = class ConfigurationService {
    prisma;
    sectorsCache = new Map();
    systemSettingsCache = null;
    businessTypesCache = null;
    constructor(prisma) {
        this.prisma = prisma;
    }
    clearCache() {
        this.sectorsCache.clear();
        this.systemSettingsCache = null;
        this.businessTypesCache = null;
    }
    async getBusinessTypes(mainType) {
        if (!mainType && this.businessTypesCache && Date.now() < this.businessTypesCache.expiry) {
            return this.businessTypesCache.data;
        }
        const types = await this.prisma.businessType.findMany({
            where: mainType ? { mainType } : undefined,
            include: { sectors: true },
        });
        if (!mainType) {
            this.businessTypesCache = { data: types, expiry: Date.now() + 30000 };
        }
        return types;
    }
    async createBusinessType(data) {
        this.clearCache();
        return this.prisma.businessType.create({ data });
    }
    async getSectors(businessTypeId) {
        const cacheKey = businessTypeId || 'all';
        const cached = this.sectorsCache.get(cacheKey);
        if (cached && Date.now() < cached.expiry) {
            return cached.data;
        }
        const sectors = await this.prisma.sector.findMany({
            where: businessTypeId ? { businessTypeId } : undefined,
            include: { categories: true, businessType: true },
        });
        this.sectorsCache.set(cacheKey, { data: sectors, expiry: Date.now() + 30000 });
        return sectors;
    }
    async createSector(data) {
        this.clearCache();
        return this.prisma.sector.create({ data });
    }
    async updateSector(id, data) {
        this.clearCache();
        return this.prisma.sector.update({
            where: { id },
            data,
        });
    }
    async getCategories(sectorId) {
        return this.prisma.category.findMany({
            where: sectorId ? { sectorId } : undefined,
        });
    }
    async createCategory(data) {
        this.clearCache();
        return this.prisma.category.create({ data });
    }
    async getWorkflows() {
        return this.prisma.workflow.findMany();
    }
    async createWorkflow(data) {
        return this.prisma.workflow.create({ data });
    }
    async getSystemSettings() {
        if (this.systemSettingsCache && Date.now() < this.systemSettingsCache.expiry) {
            return this.systemSettingsCache.data;
        }
        let settings = await this.prisma.configuration.findFirst({
            where: { type: 'SYSTEM_SETTINGS', name: 'global' },
        });
        if (!settings) {
            settings = await this.prisma.configuration.create({
                data: {
                    name: 'global',
                    type: 'SYSTEM_SETTINGS',
                    data: { searchRadius: 10 },
                },
            });
        }
        this.systemSettingsCache = { data: settings.data, expiry: Date.now() + 30000 };
        return settings.data;
    }
    async updateSystemSettings(data) {
        this.clearCache();
        let settings = await this.prisma.configuration.findFirst({
            where: { type: 'SYSTEM_SETTINGS', name: 'global' },
        });
        if (!settings) {
            return this.prisma.configuration.create({
                data: {
                    name: 'global',
                    type: 'SYSTEM_SETTINGS',
                    data,
                },
            });
        }
        else {
            return this.prisma.configuration.update({
                where: { id: settings.id },
                data: { data },
            });
        }
    }
};
ConfigurationService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ConfigurationService);
export { ConfigurationService };
//# sourceMappingURL=configuration.service.js.map