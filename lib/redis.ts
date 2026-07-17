import Redis from 'ioredis';
import { ENV } from '@/lib/config';

const PREFIX = 'faucet';

// In-memory store for localnet (when Redis is not available)
const localStore = new Map<string, { value: string; expiry: number }>();

// Singleton Redis client
let redisClient: Redis | null = null;

/**
 * Initialize Redis client if configured
 */
function getRedisClient(): Redis | null {
  if (!ENV.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis(ENV.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError(err) {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true;
          }
          return false;
        },
      });

      redisClient.on('error', (err) => {
        console.error('Redis connection error:', err.message);
      });

      redisClient.on('connect', () => {
        console.log('Redis connected successfully');
      });
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      return null;
    }
  }

  return redisClient;
}

function isRedisConfigured(): boolean {
  return !!ENV.REDIS_URL;
}

/**
 * Checks if an address is currently rate limited
 * @param envPrefix - The environment name (localnet/devnet/testnet/mainnet)
 * @param address - The Ethereum address to check
 * @returns Promise<boolean> - True if rate limited, false otherwise
 */
export async function checkRateLimit(envPrefix: string, address: string): Promise<boolean> {
  const key = `${PREFIX}:${envPrefix}:${address.toLowerCase()}`;
  
  // For localnet without Redis, use in-memory store
  if (!isRedisConfigured()) {
    const entry = localStore.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      localStore.delete(key);
      return false;
    }
    return true;
  }

  const redis = getRedisClient();
  if (!redis) {
    console.error('Redis not available, falling back to in-memory store');
    return false;
  }

  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // On error, deny the request as a safety measure
    return true;
  }
}

/**
 * Sets a rate limit for an address
 * @param envPrefix - The environment name (localnet/devnet/testnet/mainnet)
 * @param address - The Ethereum address to rate limit
 * @param ttlSeconds - Time-to-live in seconds
 */
export async function setRateLimit(
  envPrefix: string,
  address: string,
  ttlSeconds: number
): Promise<void> {
  const key = `${PREFIX}:${envPrefix}:${address.toLowerCase()}`;
  
  // For localnet without Redis, use in-memory store
  if (!isRedisConfigured()) {
    localStore.set(key, {
      value: 'claimed',
      expiry: Date.now() + (ttlSeconds * 1000),
    });
    console.log(`[LocalNet] Rate limit set for ${address} (${ttlSeconds}s)`);
    return;
  }

  const redis = getRedisClient();
  if (!redis) {
    console.error('Redis not available for setting rate limit');
    throw new Error('Failed to set rate limit: Redis unavailable');
  }

  try {
    await redis.setex(key, ttlSeconds, 'claimed');
  } catch (error) {
    console.error('Error setting rate limit:', error);
    throw new Error('Failed to set rate limit');
  }
}

/**
 * Gets the remaining TTL for a rate-limited address
 * @param envPrefix - The environment name
 * @param address - The Ethereum address
 * @returns Promise<number> - Remaining seconds, or 0 if not rate limited
 */
export async function getRateLimitTTL(envPrefix: string, address: string): Promise<number> {
  const key = `${PREFIX}:${envPrefix}:${address.toLowerCase()}`;
  
  // For localnet without Redis, use in-memory store
  if (!isRedisConfigured()) {
    const entry = localStore.get(key);
    if (!entry) return 0;
    
    const remaining = Math.max(0, Math.floor((entry.expiry - Date.now()) / 1000));
    if (remaining === 0) {
      localStore.delete(key);
    }
    return remaining;
  }

  const redis = getRedisClient();
  if (!redis) {
    return 0;
  }

  try {
    const ttl = await redis.ttl(key);
    return ttl > 0 ? ttl : 0;
  } catch (error) {
    console.error('Error getting rate limit TTL:', error);
    return 0;
  }
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
