import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value by a specified delay (default 300ms).
 * Useful for predictive search input bars to avoid expensive computations or API calls on every keystroke.
 *
 * @param value The value to debounce (e.g. search text query)
 * @param delay Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
