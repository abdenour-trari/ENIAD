// src/hooks/useInfiniteScroll.js
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * A custom hook to handle client-side infinite scrolling of a filtered array.
 * 
 * @param {Array} allItems The full list of filtered/sorted items
 * @param {number} itemsPerPage Amount of items to display per page (default: 12)
 * @returns {object} { displayedItems, hasMore, loadMore, loaderRef, resetScroll }
 */
export function useInfiniteScroll(allItems = [], itemsPerPage = 12) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const loaderRef = useRef(null);

  // Reset visible limit whenever items length or array contents change (e.g. filters applied)
  useEffect(() => {
    setVisibleCount(itemsPerPage);
  }, [allItems.length, itemsPerPage]);

  const hasMore = visibleCount < allItems.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + itemsPerPage, allItems.length));
  }, [itemsPerPage, allItems.length]);

  const resetScroll = useCallback(() => {
    setVisibleCount(itemsPerPage);
  }, [itemsPerPage]);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: "250px", // Trigger loading more before user fully reaches the bottom
      }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loadMore]);

  const displayedItems = allItems.slice(0, visibleCount);

  return {
    displayedItems,
    hasMore,
    loadMore,
    loaderRef,
    resetScroll
  };
}
