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
    memoryCache = new Map();
    onModuleInit() {
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
            try {
                this.client = new Redis(redisUrl, {
                    lazyConnect: true,
                    enableOfflineQueue: false,
                    connectTimeout: 1000,
                    maxRetriesPerRequest: 1,
                    retryStrategy(times) {
                        if (times > 2)
                            return null;
                        return Math.min(times * 100, 1000);
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
            this.logger.log('Operating in high-speed local memory cache mode.');
        }
    }
    async get(key) {
        if (this.client && this.isConnected) {
            try {
                const data = await this.client.get(key);
                if (data)
                    return JSON.parse(data);
            }
            catch (e) {
            }
        }
        const cached = this.memoryCache.get(key);
        if (cached) {
            if (Date.now() < cached.expiry) {
                return cached.value;
            }
            this.memoryCache.delete(key);
        }
        return null;
    }
    async set(key, value, ttlSeconds = 300) {
        this.memoryCache.set(key, {
            value,
            expiry: Date.now() + ttlSeconds * 1000,
        });
        if (this.client && this.isConnected) {
            try {
                await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
            }
            catch (e) {
            }
        }
    }
    async del(key) {
        this.memoryCache.delete(key);
        if (this.client && this.isConnected) {
            try {
                await this.client.del(key);
            }
            catch (e) {
            }
        }
    }
    onModuleDestroy() {
        this.memoryCache.clear();
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