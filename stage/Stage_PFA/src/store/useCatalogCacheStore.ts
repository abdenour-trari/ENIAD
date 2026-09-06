import { create } from 'zustand';

// Cache TTL constant: 5 minutes (300 000 milliseconds)
export const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;

export interface CatalogCacheEntry {
  pages: Record<number, any[]>; // Maps page number to array of loaded items
  currentPage: number;
  hasMore: boolean;
  totalCount: number;
  timestamp: number;
}

interface CatalogCacheState {
  cache: Record<string, CatalogCacheEntry>;
  getValidCacheEntry: (cacheKey: string) => CatalogCacheEntry | null;
  setCachePage: (
    cacheKey: string,
    page: number,
    items: any[],
    hasMore: boolean,
    totalCount: number
  ) => void;
  invalidateCacheKey: (cacheKey: string) => void;
  clearAllCache: () => void;
}

export const useCatalogCacheStore = create<CatalogCacheState>((set, get) => ({
  cache: {},

  getValidCacheEntry: (cacheKey: string) => {
    const entry = get().cache[cacheKey];
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age >= CATALOG_CACHE_TTL_MS) {
      // Cache TTL expired (5 min reached) -> invalidate entry
      get().invalidateCacheKey(cacheKey);
      return null;
    }

    return entry;
  },

  setCachePage: (cacheKey, page, items, hasMore, totalCount) => {
    set((state) => {
      const existing = state.cache[cacheKey];
      const now = Date.now();

      if (page === 1 || !existing) {
        return {
          cache: {
            ...state.cache,
            [cacheKey]: {
              pages: { [page]: items },
              currentPage: page,
              hasMore,
              totalCount,
              timestamp: now,
            },
          },
        };
      }

      return {
        cache: {
          ...state.cache,
          [cacheKey]: {
            ...existing,
            pages: {
              ...existing.pages,
              [page]: items,
            },
            currentPage: page,
            hasMore,
            totalCount,
            timestamp: now,
          },
        },
      };
    });
  },

  invalidateCacheKey: (cacheKey: string) => {
    set((state) => {
      const newCache = { ...state.cache };
      delete newCache[cacheKey];
      return { cache: newCache };
    });
  },

  clearAllCache: () => set({ cache: {} }),
}));

/**
 * Builds a deterministic cache key string based on active search parameters and filters.
 */
export function buildCatalogCacheKey(
  category: string,
  query: string,
  filters: {
    priceLevel: string | null;
    maxDistance: number | null;
    minRating: number | null;
    maxDeliveryTime: number | null;
  }
): string {
  const q = query.trim().toLowerCase();
  const cat = category || 'all';
  const p = filters.priceLevel || 'all';
  const d = filters.maxDistance !== null ? filters.maxDistance : 'all';
  const r = filters.minRating !== null ? filters.minRating : 'all';
  const t = filters.maxDeliveryTime !== null ? filters.maxDeliveryTime : 'all';

  return `cat:${cat}|q:${q}|p:${p}|d:${d}|r:${r}|t:${t}`;
}

export default useCatalogCacheStore;
