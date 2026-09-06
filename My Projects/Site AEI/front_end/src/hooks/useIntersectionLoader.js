// src/hooks/useIntersectionLoader.js
import { useEffect, useRef } from "react";

/**
 * A hook that observes a sentinel HTML element to trigger paginated loading.
 * Features debouncing (500ms) and locks to prevent double-firing requests.
 * 
 * @param {object} params { loadMore, hasMore, loading, debounceMs }
 * @returns {React.RefObject} The ref to attach to the sentinel element at the bottom of the page
 */
export function useIntersectionLoader({ loadMore, hasMore, loading, debounceMs = 500 }) {
  const sentinelRef = useRef(null);
  
  // Keep latest states in refs to avoid rebuilding the observer
  const loadMoreRef = useRef(loadMore);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);
  const timerRef = useRef(null);

  useEffect(() => {
    loadMoreRef.current = loadMore;
    hasMoreRef.current = hasMore;
    loadingRef.current = loading;
  }, [loadMore, hasMore, loading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only load if intersecting, there are more pages, and we are not currently loading
        if (entry.isIntersecting && hasMoreRef.current && !loadingRef.current) {
          // Clear any existing debounce timer to lock/reset
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }

          // Debounce execution
          timerRef.current = setTimeout(() => {
            // Re-verify flags after debounce period to prevent double-firing
            if (hasMoreRef.current && !loadingRef.current) {
              loadMoreRef.current();
            }
          }, debounceMs);
        }
      },
      {
        rootMargin: "250px", // Prefetch next page 250px before entering viewport
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [debounceMs]);

  return sentinelRef;
}
