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
import { RedisService } from '../redis/redis.service.js';
let SystemConfigService = class SystemConfigService {
    prisma;
    redis;
    SEO_CACHE_KEY = 'config:seo';
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async getSeoConfig() {
        const cached = await this.redis.get(this.SEO_CACHE_KEY);
        if (cached)
            return cached;
        const titleConfig = await this.prisma.systemConfig.findUnique({ where: { key: 'SEO_TITLE' } });
        const descConfig = await this.prisma.systemConfig.findUnique({ where: { key: 'SEO_DESCRIPTION' } });
        const result = {
            title: titleConfig?.value || 'MARKATVERSE - Everything. Everyone. Everywhere.',
            description: descConfig?.value || 'The global marketplace connecting people, businesses and opportunities.',
        };
        await this.redis.set(this.SEO_CACHE_KEY, result, 600);
        return result;
    }
    async updateSeoConfig(data) {
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
            enableEmail: email?.value !== 'false',
            enablePhone: phone?.value === 'true',
            enableGoogle: google?.value === 'true',
            require2FA: twofa?.value === 'true',
        };
    }
    async updateAuthConfig(data) {
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
    async getQueueConfig() {
        const speed = await this.prisma.systemConfig.findUnique({ where: { key: 'QUEUE_TRAVEL_SPEED_KMH' } });
        const buffer = await this.prisma.systemConfig.findUnique({ where: { key: 'QUEUE_NOTIFICATION_BUFFER_MIN' } });
        return {
            travelSpeedKmh: speed?.value ? parseInt(speed.value) : 30,
            notificationBufferMin: buffer?.value ? parseInt(buffer.value) : 5,
        };
    }
    async updateQueueConfig(data) {
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
    async getPaymentMethods() {
        const record = await this.prisma.systemConfig.findUnique({ where: { key: 'PAYMENT_METHODS' } });
        if (!record)
            return [];
        try {
            return JSON.parse(record.value);
        }
        catch {
            return [];
        }
    }
    async savePaymentMethods(methods) {
        await this.prisma.systemConfig.upsert({
            where: { key: 'PAYMENT_METHODS' },
            update: { value: JSON.stringify(methods) },
            create: { key: 'PAYMENT_METHODS', value: JSON.stringify(methods), description: 'Dynamic Payment Methods' },
        });
        return methods;
    }
    async addPaymentMethod(data) {
        const methods = await this.getPaymentMethods();
        const newMethod = {
            ...data,
            id: 'PMT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
            updatedAt: new Date().toISOString()
        };
        methods.push(newMethod);
        return this.savePaymentMethods(methods);
    }
    async updatePaymentMethod(id, data) {
        const methods = await this.getPaymentMethods();
        const index = methods.findIndex((m) => m.id === id);
        if (index === -1)
            throw new Error('Payment method not found');
        methods[index] = { ...methods[index], ...data, id, updatedAt: new Date().toISOString() };
        return this.savePaymentMethods(methods);
    }
    async deletePaymentMethod(id) {
        const methods = await this.getPaymentMethods();
        const filtered = methods.filter((m) => m.id !== id);
        return this.savePaymentMethods(filtered);
    }
    async getTaxRules() {
        return this.prisma.taxRule.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async addTaxRule(data) {
        const rate = parseFloat(data.rate) || 0;
        return this.prisma.taxRule.create({ data: { ...data, rate } });
    }
    async updateTaxRule(id, data) {
        const updateData = { ...data };
        if (updateData.rate !== undefined) {
            updateData.rate = parseFloat(updateData.rate) || 0;
        }
        return this.prisma.taxRule.update({ where: { id }, data: updateData });
    }
    async deleteTaxRule(id) {
        return this.prisma.taxRule.delete({ where: { id } });
    }
};
SystemConfigService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        RedisService])
], SystemConfigService);
export { SystemConfigService };
//# sourceMappingURL=system-config.service.js.map