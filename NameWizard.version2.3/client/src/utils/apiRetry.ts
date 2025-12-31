/**
 * Auto-recovery and retry mechanism for API failures
 */
import { logger } from './logger';

export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * Default: 3
   */
  maxRetries?: number;
  
  /**
   * Initial delay between retries in milliseconds
   * Default: 1000 (1 second)
   */
  initialDelay?: number;
  
  /**
   * Backoff factor for exponential backoff
   * Each retry will wait initialDelay * (backoffFactor ^ retryCount)
   * Default: 2
   */
  backoffFactor?: number;
  
  /**
   * Maximum delay between retries in milliseconds
   * Default: 30000 (30 seconds)
   */
  maxDelay?: number;
  
  /**
   * Status codes that should trigger a retry
   * Default: [408, 429, 500, 502, 503, 504]
   */
  retryStatusCodes?: number[];
  
  /**
   * Custom retry condition function
   * Return true to retry, false to stop retrying
   */
  retryCondition?: (error: any, retryCount: number) => boolean;
  
  /**
   * Callback before each retry attempt
   */
  onRetry?: (error: any, retryCount: number, delay: number) => void;
  
  /**
   * Callback when all retries are exhausted
   */
  onMaxRetriesExceeded?: (error: any, maxRetries: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 30000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  retryCondition: (error) => {
    // Retry on network errors or if status code is in retryStatusCodes
    if (!error) return false;
    
    // Network errors don't have status codes
    if (!error.status) return true;
    
    return DEFAULT_OPTIONS.retryStatusCodes.includes(error.status);
  },
  onRetry: (error, retryCount, delay) => {
    logger.warn(`Retrying API call (${retryCount}/${DEFAULT_OPTIONS.maxRetries}) after ${delay}ms`, { error });
  },
  onMaxRetriesExceeded: (error, maxRetries) => {
    logger.error(`Max retries (${maxRetries}) exceeded for API call`, error);
  }
};

/**
 * Calculate delay time for exponential backoff
 */
const calculateDelay = (
  retryCount: number,
  { initialDelay, backoffFactor, maxDelay }: Pick<Required<RetryOptions>, 'initialDelay' | 'backoffFactor' | 'maxDelay'>
): number => {
  // Calculate exponential backoff
  const delay = initialDelay * Math.pow(backoffFactor, retryCount);
  
  // Add jitter to prevent all clients retrying simultaneously
  const jitter = Math.random() * 0.1 * delay;
  
  // Ensure delay doesn't exceed maximum
  return Math.min(delay + jitter, maxDelay);
};

/**
 * Execute an async function with automatic retries on failure
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  // Merge provided options with defaults
  const mergedOptions: Required<RetryOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
    retryStatusCodes: options.retryStatusCodes || DEFAULT_OPTIONS.retryStatusCodes,
    retryCondition: options.retryCondition || DEFAULT_OPTIONS.retryCondition,
    onRetry: options.onRetry || DEFAULT_OPTIONS.onRetry,
    onMaxRetriesExceeded: options.onMaxRetriesExceeded || DEFAULT_OPTIONS.onMaxRetriesExceeded
  };
  
  // Execute with retries
  let lastError: any;
  let retryCount = 0;
  
  while (retryCount <= mergedOptions.maxRetries) {
    try {
      // First attempt or retry
      if (retryCount > 0) {
        // Calculate delay with exponential backoff
        const delay = calculateDelay(retryCount - 1, mergedOptions);
        
        // Notify before retry
        mergedOptions.onRetry(lastError, retryCount, delay);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Try to execute the function
      return await fn();
    } catch (error) {
      // Save the error for potential retry
      lastError = error;
      
      // Check if we should retry
      if (
        retryCount < mergedOptions.maxRetries && 
        mergedOptions.retryCondition(error, retryCount)
      ) {
        retryCount++;
        continue;
      }
      
      // Max retries exceeded or retry condition not met
      if (retryCount === mergedOptions.maxRetries) {
        mergedOptions.onMaxRetriesExceeded(error, mergedOptions.maxRetries);
      }
      
      // Rethrow the original error
      throw error;
    }
  }
  
  // This should never happen (included for TypeScript)
  throw lastError;
}

/**
 * Higher-order function to create a retryable function
 */
export function createRetryableFn<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    return withRetry(() => fn(...args), options);
  }) as T;
}