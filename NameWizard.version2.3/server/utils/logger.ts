/**
 * Logger utility for consistent logging throughout the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

// Environment-aware logging (different behavior in production vs development)
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Format log entry for consistent output
 */
const formatLogEntry = (entry: LogEntry): string => {
  const { timestamp, level, message, context } = entry;
  let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (context) {
    formattedMessage += `\nContext: ${JSON.stringify(context, null, 2)}`;
  }
  
  return formattedMessage;
};

/**
 * Main logger object with methods for different log levels
 */
export const logger = {
  /**
   * Log debug messages (only in non-production)
   */
  debug: (message: string, context?: Record<string, any>) => {
    if (!isProduction) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        context
      };
      console.debug(formatLogEntry(entry));
    }
  },
  
  /**
   * Log informational messages
   */
  info: (message: string, context?: Record<string, any>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context
    };
    console.info(formatLogEntry(entry));
  },
  
  /**
   * Log warning messages
   */
  warn: (message: string, context?: Record<string, any>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context
    };
    console.warn(formatLogEntry(entry));
  },
  
  /**
   * Log error messages
   */
  error: (message: string, error?: Error, context?: Record<string, any>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context: {
        ...(context || {}),
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      }
    };
    console.error(formatLogEntry(entry));
  },
  
  /**
   * Create a child logger with predefined context
   */
  createChildLogger: (baseContext: Record<string, any>) => {
    return {
      debug: (message: string, additionalContext?: Record<string, any>) => 
        logger.debug(message, { ...baseContext, ...additionalContext }),
      
      info: (message: string, additionalContext?: Record<string, any>) => 
        logger.info(message, { ...baseContext, ...additionalContext }),
      
      warn: (message: string, additionalContext?: Record<string, any>) => 
        logger.warn(message, { ...baseContext, ...additionalContext }),
      
      error: (message: string, error?: Error, additionalContext?: Record<string, any>) => 
        logger.error(message, error, { ...baseContext, ...additionalContext })
    };
  }
};

// Export a performance monitoring utility
export const performance = {
  /**
   * Measure execution time of an async function
   */
  measureAsync: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = Date.now();
    try {
      return await fn();
    } finally {
      const duration = Date.now() - start;
      logger.debug(`Performance [${name}]: ${duration}ms`);
    }
  },
  
  /**
   * Create a timer for measuring code execution
   */
  startTimer: (name: string) => {
    const start = Date.now();
    return {
      stop: () => {
        const duration = Date.now() - start;
        logger.debug(`Performance [${name}]: ${duration}ms`);
        return duration;
      }
    };
  }
};