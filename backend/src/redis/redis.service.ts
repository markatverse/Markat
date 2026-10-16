import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

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
      this.logger.log('No REDIS_URL configured; operating in local cache-fallback mode.');
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (e) {
      // Ignore cache set failures gracefully
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (e) {
      // Ignore cache del failures
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }
}
