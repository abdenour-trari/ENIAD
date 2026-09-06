import { useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkStore } from '@/store/useNetworkStore';

const CATALOG_CACHE_KEY = 'jiblina-offline-catalog';
const CATALOG_CACHE_TS_KEY = 'jiblina-offline-catalog-ts';

/**
 * Offline-first catalog hook.
 *
 * Strategy:
 * 1. On mount, immediately load the last cached catalog from AsyncStorage (instant display).
 * 2. If online, fetch fresh data from the server, update state & persist to AsyncStorage.
 * 3. If offline, serve the cached data and set `isOfflineData = true`.
 * 4. On reconnection, automatically re-fetches fresh data from the server.
 */
export function useOfflineCatalog<T>(
  fetchFn: () => Promise<{ success: boolean; data?: T | null }>,

  cacheKey: string = CATALOG_CACHE_KEY
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const [lastCachedAt, setLastCachedAt] = useState<number | null>(null);

  const isConnected = useNetworkStore((s) => s.isConnected);
  const prevConnectedRef = useRef(isConnected);

  // Load cached data from AsyncStorage
  const loadFromCache = useCallback(async (): Promise<T | null> => {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      const ts = await AsyncStorage.getItem(cacheKey + '-ts');
      if (cached) {
        const parsed = JSON.parse(cached) as T;
        setLastCachedAt(ts ? Number(ts) : null);
        return parsed;
      }
    } catch (err) {
      console.warn('useOfflineCatalog: cache read error', err);
    }
    return null;
  }, [cacheKey]);

  // Persist data to AsyncStorage
  const saveToCache = useCallback(async (freshData: T) => {
    try {
      const now = Date.now();
      await AsyncStorage.setItem(cacheKey, JSON.stringify(freshData));
      await AsyncStorage.setItem(cacheKey + '-ts', String(now));
      setLastCachedAt(now);
    } catch (err) {
      console.warn('useOfflineCatalog: cache write error', err);
    }
  }, [cacheKey]);

  // Fetch from server and update cache
  const fetchFromServer = useCallback(async () => {
    try {
      const res = await fetchFn();
      if (res.success && res.data) {
        setData(res.data);
        setIsOfflineData(false);
        await saveToCache(res.data);
        return true;
      }
    } catch (err) {
      console.warn('useOfflineCatalog: fetch error', err);
    }
    return false;
  }, [fetchFn, saveToCache]);

  // Initial load: cache first, then server if online
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      // Step 1: Load from cache for instant display
      const cached = await loadFromCache();
      if (cached && !cancelled) {
        setData(cached);
        setIsOfflineData(!isConnected);
      }

      // Step 2: If online, fetch fresh from server
      if (isConnected) {
        const fetched = await fetchFromServer();
        if (!fetched && cached && !cancelled) {
          // Server fetch failed but we have cache
          setIsOfflineData(true);
        }
      } else if (!cached && !cancelled) {
        // Offline with no cache
        setIsOfflineData(true);
      }

      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, []); // Run once on mount

  // On reconnection: auto re-fetch fresh data
  useEffect(() => {
    if (!prevConnectedRef.current && isConnected) {
      // Just came back online
      (async () => {
        await fetchFromServer();
      })();
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected, fetchFromServer]);

  // Manual refresh (for pull-to-refresh)
  const refresh = useCallback(async () => {
    if (isConnected) {
      await fetchFromServer();
    }
  }, [isConnected, fetchFromServer]);

  return {
    data,
    loading,
    isOfflineData,
    lastCachedAt,
    refresh,
  };
}

export default useOfflineCatalog;
