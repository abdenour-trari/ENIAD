import { useEffect, useState, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class PrefetchCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingPromises = new Map<string, Promise<any>>();
  private defaultTtlMs = 10 * 60 * 1000; // 10 minutes

  async prefetch<T>(key: string, fetcher: () => Promise<T>, ttlMs = this.defaultTtlMs): Promise<T> {
    const existing = this.cache.get(key);
    if (existing && Date.now() - existing.timestamp < ttlMs) {
      return existing.data;
    }
    if (this.pendingPromises.has(key)) {
      return this.pendingPromises.get(key)!;
    }

    const promise = fetcher()
      .then((data) => {
        this.cache.set(key, { data, timestamp: Date.now() });
        this.pendingPromises.delete(key);
        return data;
      })
      .catch((err) => {
        this.pendingPromises.delete(key);
        throw err;
      });

    this.pendingPromises.set(key, promise);
    return promise;
  }

  get<T>(key: string, ttlMs = this.defaultTtlMs): T | undefined {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < ttlMs) {
      return entry.data;
    }
    return undefined;
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
      this.pendingPromises.delete(key);
    } else {
      this.cache.clear();
      this.pendingPromises.clear();
    }
  }
}

export const prefetchCache = new PrefetchCacheManager();

export interface UsePrefetchOptions {
  enabled?: boolean;
  ttlMs?: number;
}

/**
 * Reusable usePrefetch Hook for Expo Router Navigation Flow.
 * Allows prefetching data for probable upcoming screens (e.g. payment data from cart, tracking data from payment).
 */
export function usePrefetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UsePrefetchOptions = { enabled: true }
) {
  const [data, setData] = useState<T | undefined>(() => prefetchCache.get<T>(key, options.ttlMs));
  const [isLoading, setIsLoading] = useState<boolean>(!data);
  const [isPrefetched, setIsPrefetched] = useState<boolean>(!!data);

  const executePrefetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await prefetchCache.prefetch(key, fetcher, options.ttlMs);
      setData(result);
      setIsPrefetched(true);
      return result;
    } catch (error) {
      console.warn(`[usePrefetch] Failed prefetching key "${key}":`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, options.ttlMs]);

  useEffect(() => {
    if (options.enabled && !data) {
      executePrefetch();
    }
  }, [options.enabled, key, executePrefetch]);

  return {
    data,
    isLoading,
    isPrefetched,
    prefetch: executePrefetch,
    getCachedData: () => prefetchCache.get<T>(key, options.ttlMs),
  };
}

export default usePrefetch;
