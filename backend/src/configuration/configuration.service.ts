import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { MainType } from '@prisma/client';

@Injectable()
export class ConfigurationService {
  constructor(private prisma: PrismaService) {}

  // --- Business Types ---
  async getBusinessTypes(mainType?: MainType) {
    return this.prisma.businessType.findMany({
      where: mainType ? { mainType } : undefined,
      include: { sectors: true },
    });
  }

  async createBusinessType(data: { mainType: MainType; name: string; description?: string }) {
    return this.prisma.businessType.create({ data });
  }

  // --- Sectors ---
  async getSectors(businessTypeId?: string) {
    return this.prisma.sector.findMany({
      where: businessTypeId ? { businessTypeId } : undefined,
      include: { categories: true, businessType: true },
    });
  }

  async createSector(data: { businessTypeId: string; name: string; description?: string }) {
    return this.prisma.sector.create({ data });
  }

  async updateSector(id: string, data: { isActive?: boolean; name?: string; description?: string; parameters?: any }) {
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
    return settings.data;
  }

  async updateSystemSettings(data: any) {
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
