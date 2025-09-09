/**
 * Logger service following industrial standards
 * Provides structured logging with different levels and contexts
 */

import { ILogger } from "./types";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class Logger implements ILogger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isProduction = process.env.NODE_ENV === "production";

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: any,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      // Add user context if available
      userId: context?.userId,
      sessionId: context?.sessionId,
    };
  }

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    if (context && Object.keys(context).length > 0) {
      formatted += `\nContext: ${JSON.stringify(context, null, 2)}`;
    }

    if (error) {
      formatted += `\nError: ${error.message}`;
      if (error.stack && this.isDevelopment) {
        formatted += `\nStack: ${error.stack}`;
      }
    }

    return formatted;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isProduction) {
      // In production, only log warnings and errors
      return level === LogLevel.WARN || level === LogLevel.ERROR;
    }
    // In development, log everything
    return true;
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formatted = this.formatMessage(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }

    // In production, you might want to send logs to an external service
    if (this.isProduction) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // TODO: Implement external logging service integration
    // Examples: Sentry, LogRocket, Crashlytics, etc.
    // This is where you would send logs to your monitoring service
  }

  debug(message: string, context?: any): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.writeLog(entry);
  }

  info(message: string, context?: any): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.writeLog(entry);
  }

  warn(message: string, context?: any): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.writeLog(entry);
  }

  error(message: string, error?: Error, context?: any): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    this.writeLog(entry);
  }

  // Specialized logging methods for common scenarios
  apiRequest(method: string, url: string, context?: any): void {
    this.debug(`API Request: ${method} ${url}`, context);
  }

  apiResponse(
    method: string,
    url: string,
    status: number,
    duration: number
  ): void {
    this.debug(`API Response: ${method} ${url} - ${status} (${duration}ms)`);
  }

  apiError(method: string, url: string, error: Error, context?: any): void {
    this.error(`API Error: ${method} ${url}`, error, context);
  }

  authEvent(event: string, userId?: string, success: boolean = true): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    const entry = this.createLogEntry(level, `Auth Event: ${event}`, {
      userId,
      success,
    });
    this.writeLog(entry);
  }

  businessEvent(event: string, context?: any): void {
    this.info(`Business Event: ${event}`, context);
  }

  performanceLog(operation: string, duration: number, context?: any): void {
    const level = duration > 5000 ? LogLevel.WARN : LogLevel.DEBUG;
    const entry = this.createLogEntry(
      level,
      `Performance: ${operation} took ${duration}ms`,
      context
    );
    this.writeLog(entry);
  }
}

// Singleton logger instance
export const logger = new Logger();

// Performance timing decorator
export function logPerformance(
  target: any,
  propertyName: string,
  descriptor: PropertyDescriptor
) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = Date.now();
    const className = target.constructor.name;
    const methodName = `${className}.${propertyName}`;

    try {
      logger.debug(`Starting ${methodName}`, { args: args.length });
      const result = await method.apply(this, args);
      const duration = Date.now() - start;

      logger.performanceLog(methodName, duration, {
        success: true,
        resultType: typeof result,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`Error in ${methodName}`, error as Error, {
        duration,
        args: args.length,
      });
      throw error;
    }
  };

  return descriptor;
}
