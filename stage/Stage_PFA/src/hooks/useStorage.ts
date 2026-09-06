import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/utils/storage';

export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStoredValue() {
      try {
        const item = await storage.getItem<T>(key);
        if (item !== null) {
          setStoredValue(item);
        }
      } catch (error) {
        console.error(`Error loading key ${key}:`, error);
      } finally {
        setLoading(false);
      }
    }
    loadStoredValue();
  }, [key]);

  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        await storage.setItem(key, valueToStore);
      } catch (error) {
        console.error(`Error setting key ${key}:`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue, loading] as const;
}
