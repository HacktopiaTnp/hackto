import Redis, { Cluster } from 'ioredis';
import env from './env';

/**
 * Redis Configuration
 * Single instance for development, cluster for production
 */

// Determine if using cluster
const isCluster = process.env.REDIS_CLUSTER === 'true';

export let redisClient: Redis | Cluster;

if (isCluster) {
  // Redis Cluster for production
  const nodes = env.REDIS_URL.split(',').map(url => {
    const match = url.match(/redis:\/\/([^:]+):(\d+)/);
    return { host: match?.[1] || 'localhost', port: parseInt(match?.[2] || '6379') };
  });

  redisClient = new Cluster(nodes, {
    enableReadyCheck: false,
    enableOfflineQueue: true,
    password: env.REDIS_PASSWORD,
  });
} else {
  // Single Redis instance for development
  redisClient = new Redis({
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    reconnectOnError: (err) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true; // Reconnect when readonly
      }
      return false;
    },
  });
}

// Event handlers
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('disconnect', () => {
  console.log('⚠️  Disconnected from Redis');
});

/**
 * Cache Layer Utilities
 */
export const cacheConfig = {
  // TTLs (in seconds)
  CACHE_TTL: {
    SESSION: 3600, // 1 hour
    USER_PROFILE: 1800, // 30 minutes
    ELIGIBILITY: 3600, // 1 hour
    COMPANY_READINESS: 86400, // 1 day
    DASHBOARD: 1800, // 30 minutes
    SEARCH_RESULTS: 300, // 5 minutes
    STATIC_DATA: 604800, // 7 days
  },

  // Cache keys patterns
  KEYS: {
    SESSION: (sessionId: string) => `session:${sessionId}`,
    USER: (userId: string) => `user:${userId}`,
    ELIGIBILITY: (studentId: string, jobId: string) => `eligible:${studentId}:${jobId}`,
    COMPANY_READINESS: (studentId: string, companyId: string) => `readiness:${studentId}:${companyId}`,
    DASHBOARD: (studentId: string) => `dashboard:${studentId}`,
    SEARCH: (query: string, type: string) => `search:${type}:${query}`,
    RATE_LIMIT: (id: string, action: string) => `ratelimit:${action}:${id}`,
  },
};

/**
 * Cache operations
 */
export async function setCache(key: string, value: any, ttl?: number) {
  const serialized = JSON.stringify(value);
  
  if (ttl) {
    await redisClient.setex(key, ttl, serialized);
  } else {
    await redisClient.set(key, serialized);
  }
}

export async function getCache<T = any>(key: string): Promise<T | null> {
  const value = await redisClient.get(key);
  return value ? JSON.parse(value) : null;
}

export async function deleteCache(key: string) {
  await redisClient.del(key);
}

export async function invalidatePattern(pattern: string) {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
}

/**
 * Atomic operations for rate limiting
 */
export async function incrementRateLimit(key: string, limit: number, windowMs: number) {
  const current = await redisClient.incr(key);
  
  if (current === 1) {
    await redisClient.expire(key, Math.ceil(windowMs / 1000));
  }

  return current > limit;
}

/**
 * Session management
 */
export async function storeSession(sessionId: string, data: Record<string, any>) {
  await setCache(
    cacheConfig.KEYS.SESSION(sessionId),
    data,
    cacheConfig.CACHE_TTL.SESSION
  );
}

export async function getSession(sessionId: string) {
  return getCache(cacheConfig.KEYS.SESSION(sessionId));
}

export async function destroySession(sessionId: string) {
  await deleteCache(cacheConfig.KEYS.SESSION(sessionId));
}

/**
 * Health check
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}

export default redisClient;
