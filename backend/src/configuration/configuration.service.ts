import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { MainType } from '@prisma/client';

@Injectable()
export class ConfigurationService {
  private sectorsCache = new Map<string, { data: any; expiry: number }>();
  private systemSettingsCache: { data: any; expiry: number } | null = null;
  private businessTypesCache: { data: any; expiry: number } | null = null;

  constructor(private prisma: PrismaService) {}

  private clearCache() {
    this.sectorsCache.clear();
    this.systemSettingsCache = null;
    this.businessTypesCache = null;
  }

  // --- Business Types ---
  async getBusinessTypes(mainType?: MainType) {
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

  async createBusinessType(data: { mainType: MainType; name: string; description?: string }) {
    this.clearCache();
    return this.prisma.businessType.create({ data });
  }

  // --- Sectors ---
  async getSectors(businessTypeId?: string) {
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

  async createSector(data: { businessTypeId: string; name: string; description?: string }) {
    this.clearCache();
    return this.prisma.sector.create({ data });
  }

  async updateSector(id: string, data: { isActive?: boolean; name?: string; description?: string; parameters?: any }) {
    this.clearCache();
    return this.prisma.sector.update({
      where: { id },
      data,
    });
  }

  // --- Categories ---
  async getCategories(sectorId?: string) {
    return this.prisma.category.findMany({
      where: sectorId ? { sectorId } : undefined,
    });
  }

  async createCategory(data: { sectorId: string; name: string; parentId?: string }) {
    this.clearCache();
    return this.prisma.category.create({ data });
  }

  // --- Workflows ---
  async getWorkflows() {
    return this.prisma.workflow.findMany();
  }

  async createWorkflow(data: { name: string; description?: string; steps: any }) {
    return this.prisma.workflow.create({ data });
  }

  // --- System Settings ---
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
          data: { searchRadius: 10 }, // default 10km
        },
      });
    }

    this.systemSettingsCache = { data: settings.data, expiry: Date.now() + 30000 };
    return settings.data;
  }

  async updateSystemSettings(data: any) {
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
    } else {
      return this.prisma.configuration.update({
        where: { id: settings.id },
        data: { data },
      });
    }
  }
}
