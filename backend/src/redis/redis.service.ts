import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;
  // High-performance in-memory fallback cache (sub-millisecond data fetching)
  private memoryCache = new Map<string, { value: any; expiry: number }>();

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        this.client = new Redis(redisUrl, {
          maxRetriesPerRequest: 2,
          retryStrategy(times) {
            if (times > 3) return null; // stop retrying if offline
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
      } catch (err) {
        this.logger.warn(`Could not initialize Redis: ${err}`);
      }
    } else {
      this.logger.log('Operating in high-speed local memory cache mode.');
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    // 1. Try Redis if connected
    if (this.client && this.isConnected) {
      try {
        const data = await this.client.get(key);
        if (data) return JSON.parse(data);
      } catch (e) {
        // Fall through to memoryCache
      }
    }

    // 2. High-speed in-memory cache lookup
    const cached = this.memoryCache.get(key);
    if (cached) {
      if (Date.now() < cached.expiry) {
        return cached.value as T;
      }
      this.memoryCache.delete(key);
    }
    return null;
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    // 1. Store in high-speed in-memory cache
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });

    // 2. Also replicate to Redis if connected
    if (this.client && this.isConnected) {
      try {
        await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      } catch (e) {
        // Ignore cache set failures gracefully
      }
    }
  }

  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
    if (this.client && this.isConnected) {
      try {
        await this.client.del(key);
      } catch (e) {
        // Ignore cache del failures
      }
    }
  }

  onModuleDestroy() {
    this.memoryCache.clear();
    if (this.client) {
      this.client.disconnect();
    }
  }
}
