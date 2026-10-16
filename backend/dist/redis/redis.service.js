var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedisService_1;
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
let RedisService = RedisService_1 = class RedisService {
    logger = new Logger(RedisService_1.name);
    client = null;
    isConnected = false;
    onModuleInit() {
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
            try {
                this.client = new Redis(redisUrl, {
                    maxRetriesPerRequest: 2,
                    retryStrategy(times) {
                        if (times > 3)
                            return null;
                        return Math.min(times * 200, 2000);
                    },
                });
                this.client.on('connect', () => {
                    this.isConnected = true;
                    this.logger.log('Redis client successfully connected');
                });
                this.client.on('error', (err) => {
                    this.isConnected = false;
                    this.logger.warn(`Redis connection note: ${err.message}`);
                });
            }
            catch (err) {
                this.logger.warn(`Could not initialize Redis: ${err}`);
            }
        }
        else {
            this.logger.log('No REDIS_URL configured; operating in local cache-fallback mode.');
        }
    }
    async get(key) {
        if (!this.client || !this.isConnected)
            return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (e) {
            return null;
        }
    }
    async set(key, value, ttlSeconds = 300) {
        if (!this.client || !this.isConnected)
            return;
        try {
            await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        }
        catch (e) {
        }
    }
    async del(key) {
        if (!this.client || !this.isConnected)
            return;
        try {
            await this.client.del(key);
        }
        catch (e) {
        }
    }
    onModuleDestroy() {
        if (this.client) {
            this.client.disconnect();
        }
    }
};
RedisService = RedisService_1 = __decorate([
    Injectable()
], RedisService);
export { RedisService };
//# sourceMappingURL=redis.service.js.map