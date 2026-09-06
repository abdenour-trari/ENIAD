// src/hooks/useInfinitePagination.js
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * A custom React Query wrapper hook for robust infinite list pagination.
 * Handles deduplication, page mapping, loading states, and React Query caching.
 * 
 * @param {object} params { queryKey, fetchFn, size, filters }
 * @returns {object} { items, page, hasMore, loading, error, totalCount, loadMore }
 */
export function useInfinitePagination({ queryKey, fetchFn, size = 12, filters = {} }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    error
  } = useInfiniteQuery({
    // Cache is segmented by queryKey and current filters to avoid mixing cached states
    queryKey: [...queryKey, filters],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchFn({ page: pageParam, size, filters });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.hasMore ? allPages.length : undefined;
    },
  });

  // Flatten fetched pages and perform anti-duplication on product/post IDs
  const items = useMemo(() => {
    if (!data) return [];
    const rawItems = data.pages.flatMap((page) => page?.items || []);
    
    const seen = new Set();
    return rawItems.filter((item) => {
      if (!item || !item.id) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [data]);

  const totalCount = useMemo(() => {
    if (!data || data.pages.length === 0) return 0;
    return data.pages[0]?.totalCount || 0;
  }, [data]);

  const page = data ? data.pages.length : 0;

  return {
    items,
    page,
    hasMore: !!hasNextPage,
    loading: isFetching || isFetchingNextPage,
    error,
    totalCount,
    loadMore: fetchNextPage
  };
}
