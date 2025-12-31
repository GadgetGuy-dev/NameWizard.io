/**
 * Logging utility for consistent logging across the application
 */

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log message with optional metadata
interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  category: string;
  metadata?: Record<string, any>;
}

// Base logger class
class Logger {
  private category: string;
  private isProduction: boolean;
  
  constructor(category: string) {
    this.category = category;
    this.isProduction = import.meta.env.PROD || false;
  }
  
  // Log a message with the given level
  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    // Create log entry
    const logEntry: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      category: this.category,
      metadata
    };
    
    // Skip debug logs in production
    if (this.isProduction && level === 'debug') {
      return;
    }
    
    // Determine console method based on level
    let consoleMethod: (message?: any, ...optionalParams: any[]) => void;
    
    switch (level) {
      case 'debug':
        consoleMethod = console.debug;
        break;
      case 'info':
        consoleMethod = console.info;
        break;
      case 'warn':
        consoleMethod = console.warn;
        break;
      case 'error':
        consoleMethod = console.error;
        break;
      default:
        consoleMethod = console.log;
    }
    
    // Format the log message
    const formattedMessage = `[${logEntry.timestamp.split('T')[1].split('.')[0]}] [${logEntry.level.toUpperCase()}] [${logEntry.category}] ${logEntry.message}`;
    
    // Log to console
    if (metadata) {
      consoleMethod(formattedMessage, metadata);
    } else {
      consoleMethod(formattedMessage);
    }
    
    // In a more sophisticated implementation, we could send logs to a service here
  }
  
  // Debug level logging
  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }
  
  // Info level logging
  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }
  
  // Warning level logging
  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }
  
  // Error level logging
  error(message: string, metadata?: Record<string, any>): void {
    this.log('error', message, metadata);
  }
}

// Create specific loggers for different parts of the application
export const appLogger = new Logger('App');
export const fileLogger = new Logger('Files');
export const authLogger = new Logger('Auth');
export const apiLogger = new Logger('API');
export const uiLogger = new Logger('UI');
export const aiLogger = new Logger('AI');

// Default export for convenience
export default {
  appLogger,
  fileLogger,
  authLogger,
  apiLogger,
  uiLogger,
  aiLogger
};