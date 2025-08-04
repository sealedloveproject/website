/**
 * Redis-based cache utility
 * Provides a consistent interface for caching data across multiple server instances
 * Suitable for PM2 cluster environments
 */

import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// Add prefix to all keys to avoid collisions with other applications
const keyPrefix = 'sealed_love:';

/**
 * Cache utility for storing and retrieving data
 */
export const cache = {
  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to store (will be JSON serialized)
   * @param expirySeconds Optional expiration time in seconds
   */
  async set(key: string, value: any, expirySeconds?: number): Promise<void> {
    const prefixedKey = `${keyPrefix}${key}`;
    const serialized = JSON.stringify(value);
    
    if (expirySeconds) {
      await redis.setex(prefixedKey, expirySeconds, serialized);
    } else {
      await redis.set(prefixedKey, serialized);
    }
  },
  
  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The stored value (JSON parsed) or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const prefixedKey = `${keyPrefix}${key}`;
    const value = await redis.get(prefixedKey);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      //console.error(`Failed to parse cached value for key ${key}:`, error);
      return null;
    }
  },
  
  /**
   * Delete a value from the cache
   * @param key Cache key
   */
  async del(key: string): Promise<void> {
    const prefixedKey = `${keyPrefix}${key}`;
    await redis.del(prefixedKey);
  },
  
  /**
   * Check if a key exists in the cache
   * @param key Cache key
   * @returns True if the key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    const prefixedKey = `${keyPrefix}${key}`;
    const result = await redis.exists(prefixedKey);
    return result === 1;
  }
};
