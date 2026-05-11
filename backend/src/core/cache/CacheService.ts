import Redis from 'ioredis';
import env from '@config/env';
import { logger } from '../logger/logger';

/**
 * Cache Service
 * Manages Redis operations including caching, sessions, rate limiting, and real-time features
 */
export class CacheService {
  private static instance: Redis | null = null;
  private static subscriber: Redis | null = null;
  private static disabled: boolean = false;


  /**
   * Disable Redis (for development without Redis running)
   */
  static disableCache(): void {
    this.disabled = true;
    logger.info('Redis cache disabled (running without cache)');
  }

  /**
   * Check if cache is disabled
   */
  static isDisabled(): boolean {
    return this.disabled;
  }

  /**
   * Initialize Redis connection
   */
  static async initialize(): Promise<Redis | null> {
    if (this.disabled) {
      return null;
    }

    if (this.instance) {
      return this.instance;
    }

    try {
      // Parse redis://host:port from REDIS_URL
      const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
      const urlMatch = redisUrl.match(/redis:\/\/([^:]+):(\d+)/);
      const host = urlMatch?.[1] || 'localhost';
      const port = parseInt(urlMatch?.[2] || '6379');

      const redisConfig: any = {
        host,
        port,
        password: env.REDIS_PASSWORD,
        retryStrategy: (times: number) => Math.min(times * 50, 2000),
        enableReadyCheck: false,
        enableOfflineQueue: true,
        connectTimeout: 5000,
        maxRetriesPerRequest: 3,
      };

      // Remove password if not set
      if (!redisConfig.password) {
        delete redisConfig.password;
      }

      console.error('[CacheService] Connecting to Redis - host:', host, 'port:', port);

      this.instance = new Redis(redisConfig);

      this.instance.on('connect', () => {
        logger.info('Redis connected');
      });

      this.instance.on('error', (error) => {
        logger.error('Redis error', error);
      });

      this.instance.on('close', () => {
        logger.warn('Redis connection closed');
      });

      // Test connection with timeout
      const pingPromise = this.instance.ping();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis ping timeout')), 5000)
      );
      
      await Promise.race([pingPromise, timeoutPromise]);
      logger.info('Redis connection verified');

      return this.instance;
    } catch (error) {
      logger.error('Redis initialization failed', error);
      throw error;
    }
  }

  /**
   * Get Redis instance
   */
  static getInstance(): Redis | null {
    if (this.disabled) {
      return null;
    }
    if (!this.instance) {
      throw new Error('Redis not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const instance = this.getInstance();
      if (!instance) return null;
      
      const value = await instance.get(key);
      if (!value) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  static async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const instance = this.getInstance();
      if (!instance) return;
      
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);

      if (ttlSeconds) {
        await instance.setex(key, ttlSeconds, serialized);
      } else {
        await instance.set(key, serialized);
      }
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  }

  /**
   * Delete key from cache
   */
  static async delete(key: string): Promise<void> {
    try {
      const instance = this.getInstance();
      if (!instance) return;
      
      await instance.del(key);
    } catch (error) {
      logger.error('Cache delete error', { key, error });
    }
  }

  /**
   * Delete multiple keys (pattern matching)
   */
  static async deletePattern(pattern: string): Promise<void> {
    try {
      const instance = this.getInstance();
      if (!instance) return;
      
      const keys = await instance.keys(pattern);
      if (keys.length > 0) {
        await instance.del(...keys);
        logger.info('Cache keys deleted', { pattern, count: keys.length });
      }
    } catch (error) {
      logger.error('Cache deletePattern error', { pattern, error });
    }
  }

  /**
   * Clear entire cache
   */
  static async clear(): Promise<void> {
    try {
      const instance = this.getInstance();
      if (!instance) return;
      
      await instance.flushdb();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error', error);
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const instance = this.getInstance();
      if (!instance) return false;
      
      const result = await instance.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error });
      return false;
    }
  }

  /**
   * Increment counter (for rate limiting, analytics)
   */
  static async increment(key: string, amount: number = 1, ttlSeconds?: number): Promise<number> {
    try {
      const redis = this.getInstance();
      if (!redis) return 1;
      
      let result: number;

      if (amount === 1) {
        result = await redis.incr(key);
      } else {
        result = await redis.incrby(key, amount);
      }

      if (ttlSeconds) {
        await redis.expire(key, ttlSeconds);
      }

      return result;
    } catch (error) {
      logger.error('Cache increment error', { key, error });
      throw error;
    }
  }

  /**
   * Get TTL of key (in seconds)
   */
  static async getTTL(key: string): Promise<number> {
    try {
      const instance = this.getInstance();
      if (!instance) return -1;
      
      return await instance.ttl(key);
    } catch (error) {
      logger.error('Cache getTTL error', { key, error });
      return -1;
    }
  }

  /**
   * Session management - Store session
   */
  static async setSession(sessionId: string, sessionData: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.set(key, sessionData, ttlSeconds);
    } catch (error) {
      logger.error('Session set error', { sessionId, error });
    }
  }

  /**
   * Session management - Get session
   */
  static async getSession(sessionId: string): Promise<any | null> {
    try {
      const key = `session:${sessionId}`;
      return await this.get(key);
    } catch (error) {
      logger.error('Session get error', { sessionId, error });
      return null;
    }
  }

  /**
   * Rate limiting - Check if limit exceeded
   */
  static async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    try {
      const count = await this.increment(key, 1, windowSeconds);
      return count <= limit;
    } catch (error) {
      logger.error('Rate limit check error', { key, error });
      return false; // Fail secure
    }
  }

  /**
   * Pub/Sub - Subscribe to channel
   */
  static async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      if (this.disabled) {
        logger.debug('Redis disabled, skipping subscription', { channel });
        return;
      }

      if (!this.subscriber) {
        const redisConfig: any = {
          url: env.REDIS_URL,
          password: env.REDIS_PASSWORD,
          enableReadyCheck: false,
          enableOfflineQueue: true,
        };

        if (!redisConfig.password) {
          delete redisConfig.password;
        }

        this.subscriber = new Redis(redisConfig);
      }

      this.subscriber.on('message', (chan, message) => {
        if (chan === channel) {
          callback(message);
        }
      });

      await this.subscriber.subscribe(channel);
      logger.info('Subscribed to Redis channel', { channel });
    } catch (error) {
      logger.error('Subscribe error', { channel, error });
    }
  }

  /**
   * Pub/Sub - Publish message
   */
  static async publish(channel: string, message: any): Promise<void> {
    try {
      const instance = this.getInstance();
      if (!instance) return;
      
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      await instance.publish(channel, payload);
    } catch (error) {
      logger.error('Publish error', { channel, error });
    }
  }

  /**
   * Batch operations
   */
  static async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      const instance = this.getInstance();
      if (!instance) return keys.map(() => null);
      
      return await instance.mget(keys);
    } catch (error) {
      logger.error('mget error', { keys, error });
      return [];
    }
  }

  /**
   * Batch set
   */
  static async mset(keyValues: Record<string, any>): Promise<void> {
    try {
      const instance = this.getInstance();
      if (!instance) return;
      
      const args = Object.entries(keyValues).flatMap(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]);
      await instance.mset(...args);
    } catch (error) {
      logger.error('mset error', { error });
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      if (this.disabled) {
        return false;
      }
      const instance = this.getInstance();
      if (!instance) return false;
      
      const pong = await instance.ping();
      return pong === 'PONG';
    } catch (error) {
      logger.error('Cache health check failed', error);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  static async close(): Promise<void> {
    try {
      if (this.instance) {
        await this.instance.quit();
        logger.info('Redis connection closed');
      }
      if (this.subscriber) {
        await this.subscriber.quit();
      }
    } catch (error) {
      logger.error('Cache close error', error);
    }
  }
}

export default CacheService;
