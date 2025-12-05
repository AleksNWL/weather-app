/**
 * Cache utility with TTL (Time To Live) support
 * Uses localStorage for persistence across page reloads
 */

const CACHE_PREFIX = 'weather_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Generate cache key from parameters
 */
const getCacheKey = (key: string): string => {
  return `${CACHE_PREFIX}${key}`;
};

/**
 * Check if cache entry is still valid
 */
const isCacheValid = <T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> => {
  if (!entry) return false;
  const now = Date.now();
  const age = now - entry.timestamp;
  return age < entry.ttl;
};

/**
 * Get cached data if valid, otherwise return null
 */
export const getCache = <T>(key: string): T | null => {
  try {
    const cacheKey = getCacheKey(key);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const entry: CacheEntry<T> = JSON.parse(cached);
    
    if (isCacheValid(entry)) {
      return entry.data;
    } else {
      // Remove expired cache
      localStorage.removeItem(cacheKey);
      return null;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * Set cache entry with TTL
 */
export const setCache = <T>(key: string, data: T, ttl: number = DEFAULT_TTL): void => {
  try {
    const cacheKey = getCacheKey(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.error('Cache set error:', error);
    // If storage is full, try to clear old entries
    clearExpiredCache();
  }
};

/**
 * Remove specific cache entry
 */
export const removeCache = (key: string): void => {
  try {
    const cacheKey = getCacheKey(key);
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Cache remove error:', error);
  }
};

/**
 * Clear all expired cache entries
 */
export const clearExpiredCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        const cached = localStorage.getItem(key);
        if (cached) {
          try {
            const entry: CacheEntry<unknown> = JSON.parse(cached);
            if (!isCacheValid(entry)) {
              localStorage.removeItem(key);
            }
          } catch {
            // Invalid entry, remove it
            localStorage.removeItem(key);
          }
        }
      }
    });
  } catch (error) {
    console.error('Clear expired cache error:', error);
  }
};

/**
 * Clear all cache entries
 */
export const clearAllCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Clear all cache error:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): { total: number; valid: number; expired: number } => {
  try {
    const keys = Object.keys(localStorage);
    let total = 0;
    let valid = 0;
    let expired = 0;

    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        total++;
        const cached = localStorage.getItem(key);
        if (cached) {
          try {
            const entry: CacheEntry<unknown> = JSON.parse(cached);
            if (isCacheValid(entry)) {
              valid++;
            } else {
              expired++;
            }
          } catch {
            expired++;
          }
        }
      }
    });

    return { total, valid, expired };
  } catch (error) {
    console.error('Cache stats error:', error);
    return { total: 0, valid: 0, expired: 0 };
  }
};

