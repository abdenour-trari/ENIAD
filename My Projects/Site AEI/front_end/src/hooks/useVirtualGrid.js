// src/hooks/useVirtualGrid.js
import { useState, useEffect, useRef } from "react";

/**
 * A custom virtualization hook for responsive grids.
 * Renders only the items visible in the viewport to maintain 60FPS scrolling with 200+ cards.
 * 
 * @param {object} options
 * @param {Array} options.items The array of items to render
 * @param {number} options.itemHeight Estimated height of a single row in pixels (default: 480)
 * @param {number} options.overscan Number of extra rows to render above and below viewport (default: 2)
 */
export function useVirtualGrid({ items = [], itemHeight = 480, overscan = 2 }) {
  const [columns, setColumns] = useState(3);
  const [scrollTop, setScrollTop] = useState(0);
  const [windowHeight, setWindowHeight] = useState(800);
  const containerRef = useRef(null);
  const [containerOffsetTop, setContainerOffsetTop] = useState(0);

  // 1. Monitor viewport size to determine column count
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const width = window.innerWidth;
      let cols = 3;
      if (width < 640) {
        cols = 1; // mobile
      } else if (width < 1024) {
        cols = 2; // tablet
      }
      setColumns(cols);
      setWindowHeight(window.innerHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Track window scroll position
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setScrollTop(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial read

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. Track the absolute offset top of the grid in the document
  useEffect(() => {
    const updateOffset = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerOffsetTop(rect.top + window.scrollY);
      }
    };

    updateOffset();
    
    // Recalculate slightly after updates to catch layout shifts
    const timer = setTimeout(updateOffset, 150);

    window.addEventListener("resize", updateOffset);
    return () => {
      window.removeEventListener("resize", updateOffset);
      clearTimeout(timer);
    };
  }, [items.length]);

  // Group items into rows of columns size
  const rows = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }

  const totalHeight = rows.length * itemHeight;

  // Calculate indices of rows to display
  const startRowIndex = Math.max(
    0,
    Math.floor((scrollTop - containerOffsetTop) / itemHeight) - overscan
  );
  
  const endRowIndex = Math.min(
    rows.length - 1,
    Math.floor((scrollTop - containerOffsetTop + windowHeight) / itemHeight) + overscan
  );

  const visibleRows = [];
  for (let i = startRowIndex; i <= endRowIndex; i++) {
    if (rows[i]) {
      visibleRows.push({
        rowIndex: i,
        offsetTop: i * itemHeight,
        items: rows[i],
      });
    }
  }

  const isVirtual = items.length > 30;

  return {
    containerRef,
    totalHeight,
    visibleRows,
    columns,
    isVirtual,
  };
}
