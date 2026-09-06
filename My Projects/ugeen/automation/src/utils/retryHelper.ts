import { LogFn } from '../types';

/**
 * Retry Helper
 * Generic retry wrapper with exponential backoff.
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff.
 *
 * @param fn - The async function to retry
 * @param log - Logger function
 * @param options - Retry configuration
 * @returns The result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  log: LogFn,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 2000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt === maxAttempts) {
        log('error', `All ${maxAttempts} attempts failed: ${error.message}`);
        throw error;
      }

      const waitTime = delayMs * Math.pow(backoffMultiplier, attempt - 1);
      log('warn', `Attempt ${attempt}/${maxAttempts} failed: ${error.message}. Retrying in ${waitTime}ms...`);

      if (onRetry) {
        onRetry(attempt, error);
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

/**
 * Check if an AbortSignal has been triggered, and throw if so.
 */
export function checkAbort(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const error = new Error('Automation cancelled');
    error.name = 'AbortError';
    throw error;
  }
}
