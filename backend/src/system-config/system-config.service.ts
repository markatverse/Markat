import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class SystemConfigService {
  private readonly SEO_CACHE_KEY = 'config:seo';

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getSeoConfig() {
    const cached = await this.redis.get(this.SEO_CACHE_KEY);
    if (cached) return cached;

    const titleConfig = await this.prisma.systemConfig.findUnique({ where: { key: 'SEO_TITLE' } });
    const descConfig = await this.prisma.systemConfig.findUnique({ where: { key: 'SEO_DESCRIPTION' } });

    const result = {
      title: titleConfig?.value || 'MARKATVERSE - Everything. Everyone. Everywhere.',
      description: descConfig?.value || 'The global marketplace connecting people, businesses and opportunities.',
    };

    await this.redis.set(this.SEO_CACHE_KEY, result, 600); // 10 minutes cache
    return result;
  }

  async updateSeoConfig(data: { title: string; description: string }) {
    await this.prisma.systemConfig.upsert({
      where: { key: 'SEO_TITLE' },
      update: { value: data.title },
      create: { key: 'SEO_TITLE', value: data.title, description: 'Global SEO Title' },
    });

    await this.prisma.systemConfig.upsert({
      where: { key: 'SEO_DESCRIPTION' },
      update: { value: data.description },
      create: { key: 'SEO_DESCRIPTION', value: data.description, description: 'Global SEO Description' },
    });

    await this.redis.del(this.SEO_CACHE_KEY);
    return this.getSeoConfig();
  }

  async getAuthConfig() {
    const email = await this.prisma.systemConfig.findUnique({ where: { key: 'AUTH_ENABLE_EMAIL' } });
    const phone = await this.prisma.systemConfig.findUnique({ where: { key: 'AUTH_ENABLE_PHONE' } });
    const google = await this.prisma.systemConfig.findUnique({ where: { key: 'AUTH_ENABLE_GOOGLE' } });
    const twofa = await this.prisma.systemConfig.findUnique({ where: { key: 'AUTH_REQUIRE_2FA' } });

    return {
      enableEmail: email?.value !== 'false', // Default true
      enablePhone: phone?.value === 'true',  // Default false
      enableGoogle: google?.value === 'true', // Default false
      require2FA: twofa?.value === 'true',   // Default false
    };
  }

  async updateAuthConfig(data: { enableEmail: boolean; enablePhone: boolean; enableGoogle: boolean; require2FA: boolean }) {
    const updates = [
      { key: 'AUTH_ENABLE_EMAIL', value: String(data.enableEmail) },
      { key: 'AUTH_ENABLE_PHONE', value: String(data.enablePhone) },
      { key: 'AUTH_ENABLE_GOOGLE', value: String(data.enableGoogle) },
      { key: 'AUTH_REQUIRE_2FA', value: String(data.require2FA) },
    ];

    for (const item of updates) {
      await this.prisma.systemConfig.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value, description: 'Auth config ' + item.key },
      });
    }

    return this.getAuthConfig();
  }

  // --- Queue & Smart Notifications Config ---
  async getQueueConfig() {
    const speed = await this.prisma.systemConfig.findUnique({ where: { key: 'QUEUE_TRAVEL_SPEED_KMH' } });
    const buffer = await this.prisma.systemConfig.findUnique({ where: { key: 'QUEUE_NOTIFICATION_BUFFER_MIN' } });

    return {
      travelSpeedKmh: speed?.value ? parseInt(speed.value) : 30, // Default 30 km/h
      notificationBufferMin: buffer?.value ? parseInt(buffer.value) : 5, // Default 5 mins buffer
    };
  }

  async updateQueueConfig(data: { travelSpeedKmh: number; notificationBufferMin: number }) {
    await this.prisma.systemConfig.upsert({
      where: { key: 'QUEUE_TRAVEL_SPEED_KMH' },
      update: { value: String(data.travelSpeedKmh) },
      create: { key: 'QUEUE_TRAVEL_SPEED_KMH', value: String(data.travelSpeedKmh), description: 'Average city travel speed (km/h)' },
    });

    await this.prisma.systemConfig.upsert({
      where: { key: 'QUEUE_NOTIFICATION_BUFFER_MIN' },
      update: { value: String(data.notificationBufferMin) },
      create: { key: 'QUEUE_NOTIFICATION_BUFFER_MIN', value: String(data.notificationBufferMin), description: 'Buffer time (minutes) for queue notifications' },
    });

    return this.getQueueConfig();
  }

  // --- Payment Config (Dynamic JSON) ---

  async getPaymentMethods() {
    const record = await this.prisma.systemConfig.findUnique({ where: { key: 'PAYMENT_METHODS' } });
    if (!record) return [];
    try {
      return JSON.parse(record.value);
    } catch {
      return [];
    }
  }

  async savePaymentMethods(methods: any[]) {
    await this.prisma.systemConfig.upsert({
      where: { key: 'PAYMENT_METHODS' },
      update: { value: JSON.stringify(methods) },
      create: { key: 'PAYMENT_METHODS', value: JSON.stringify(methods), description: 'Dynamic Payment Methods' },
    });
    return methods;
  }

  async addPaymentMethod(data: any) {
    const methods = await this.getPaymentMethods();
    const newMethod = {
      ...data,
      id: 'PMT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      updatedAt: new Date().toISOString()
    };
    methods.push(newMethod);
    return this.savePaymentMethods(methods);
  }

  async updatePaymentMethod(id: string, data: any) {
    const methods = await this.getPaymentMethods();
    const index = methods.findIndex((m: any) => m.id === id);
    if (index === -1) throw new Error('Payment method not found');
    methods[index] = { ...methods[index], ...data, id, updatedAt: new Date().toISOString() };
    return this.savePaymentMethods(methods);
  }

  async deletePaymentMethod(id: string) {
    const methods = await this.getPaymentMethods();
    const filtered = methods.filter((m: any) => m.id !== id);
    return this.savePaymentMethods(filtered);
  }

  // --- Tax Config ---
  async getTaxRules() {
    return this.prisma.taxRule.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async addTaxRule(data: { name: string; rate: number; status?: string }) {
    // Make rate a float properly
    const rate = parseFloat(data.rate as any) || 0;
    return this.prisma.taxRule.create({ data: { ...data, rate } });
  }

  async updateTaxRule(id: string, data: { name?: string; rate?: number; status?: string }) {
    const updateData: any = { ...data };
    if (updateData.rate !== undefined) {
      updateData.rate = parseFloat(updateData.rate) || 0;
    }
    return this.prisma.taxRule.update({ where: { id }, data: updateData });
  }

  async deleteTaxRule(id: string) {
    return this.prisma.taxRule.delete({ where: { id } });
  }
}
