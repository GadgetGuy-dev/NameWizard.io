import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
/**
 * Merges Tailwind CSS classes with conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats bytes to a human-readable string (e.g. 1024 => 1KB)
 */
export function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Generates a UUID v4
 */
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 */
export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Creates a throttled function that only invokes the provided function at most once per
 * every `limit` milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  let lastContext: any = null;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
        
        if (lastArgs) {
          const callFunc = func.apply.bind(func, lastContext, lastArgs);
          lastArgs = null;
          lastContext = null;
          callFunc();
        }
      }, limit);
    } else {
      lastArgs = args;
      lastContext = this;
    }
  };
}

/**
 * Formats a date as a string using options
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
}

/**
 * Returns a random element from an array
 */
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Waits for the specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retries a function until it succeeds or reaches the maximum number of retries
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { 
    retries = 3, 
    delay = 300, 
    backoff = 2,
    onRetry = () => {}
  } = options;
  
  let lastError: Error;
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      attempt++;
      
      if (attempt >= retries) {
        break;
      }
      
      onRetry(attempt, lastError);
      
      // Wait with exponential backoff
      await sleep(delay * Math.pow(backoff, attempt - 1));
    }
  }
  
  throw lastError!;
}