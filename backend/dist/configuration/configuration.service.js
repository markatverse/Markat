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
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBusinessTypes(mainType) {
        return this.prisma.businessType.findMany({
            where: mainType ? { mainType } : undefined,
            include: { sectors: true },
        });
    }
    async createBusinessType(data) {
        return this.prisma.businessType.create({ data });
    }
    async getSectors(businessTypeId) {
        return this.prisma.sector.findMany({
            where: businessTypeId ? { businessTypeId } : undefined,
            include: { categories: true, businessType: true },
        });
    }
    async createSector(data) {
        return this.prisma.sector.create({ data });
    }
    async updateSector(id, data) {
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
        return this.prisma.category.create({ data });
    }
    async getWorkflows() {
        return this.prisma.workflow.findMany();
    }
    async createWorkflow(data) {
        return this.prisma.workflow.create({ data });
    }
    async getSystemSettings() {
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
        return settings.data;
    }
    async updateSystemSettings(data) {
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