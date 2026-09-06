import { useState, useCallback } from 'react';
import { AutomationRun, CodePayload } from '../types';

const API_BASE = '/api/automation';

interface UseAutomationReturn {
  isLoading: boolean;
  error: string | null;
  startAutomation: () => Promise<void>;
  stopAutomation: () => Promise<void>;
  fetchHistory: () => Promise<AutomationRun[]>;
  fetchLatestCode: () => Promise<CodePayload | null>;
}

export function useAutomation(): UseAutomationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAutomation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/start`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopAutomation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/stop`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (): Promise<AutomationRun[]> => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch {
      return [];
    }
  }, []);

  const fetchLatestCode = useCallback(async (): Promise<CodePayload | null> => {
    try {
      const res = await fetch(`${API_BASE}/latest-code`);
      const data = await res.json();
      return data.success ? data.data : null;
    } catch {
      return null;
    }
  }, []);

  return {
    isLoading,
    error,
    startAutomation,
    stopAutomation,
    fetchHistory,
    fetchLatestCode,
  };
}
