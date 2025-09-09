/**
 * Enhanced error handling utilities for Krishi Sakhi application
 * Provides error boundaries, reporting, and standardized error management
 */

import { Alert } from "react-native";
import { logger } from "../services/logger";
import type { ServiceError, ServiceResponse } from "../services/types";

/**
 * Error types for different categories of errors
 */
export enum ErrorCategory {
  AUTHENTICATION = "AUTHENTICATION",
  NETWORK = "NETWORK",
  VALIDATION = "VALIDATION",
  BUSINESS_LOGIC = "BUSINESS_LOGIC",
  SYSTEM = "SYSTEM",
  UI = "UI",
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * Enhanced error interface with additional metadata
 */
export interface EnhancedError extends ServiceError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  userFriendlyMessage: string;
  retryable: boolean;
  metadata?: Record<string, any>;
}

/**
 * Error utility functions
 */
export class ErrorUtils {
  /**
   * Create an enhanced error from a service error
   */
  static enhanceError(
    serviceError: ServiceError,
    category: ErrorCategory,
    severity: ErrorSeverity,
    userFriendlyMessage: string,
    retryable = false,
    metadata?: Record<string, any>
  ): EnhancedError {
    return {
      ...serviceError,
      category,
      severity,
      userFriendlyMessage,
      retryable,
      metadata,
    };
  }

  /**
   * Create a standardized error response
   */
  static createErrorResponse<T>(
    code: string,
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    userFriendlyMessage: string,
    details?: any
  ): ServiceResponse<T> {
    const error: EnhancedError = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      category,
      severity,
      userFriendlyMessage,
      retryable: false,
    };

    return {
      data: null,
      error,
      success: false,
    };
  }

  /**
   * Check if an error is retryable
   */
  static isRetryable(error: ServiceError | EnhancedError): boolean {
    if ("retryable" in error) {
      return error.retryable;
    }

    // Default retryable patterns
    const retryablePatterns = [
      "NETWORK_ERROR",
      "TIMEOUT",
      "SERVER_ERROR",
      "RATE_LIMIT",
    ];

    return retryablePatterns.some((pattern) => error.code.includes(pattern));
  }

  /**
   * Get user-friendly message
   */
  static getUserFriendlyMessage(error: ServiceError | EnhancedError): string {
    if ("userFriendlyMessage" in error) {
      return error.userFriendlyMessage;
    }

    // Default messages based on error codes
    const messageMap: Record<string, string> = {
      NETWORK_ERROR: "Please check your internet connection and try again.",
      VALIDATION_ERROR: "Please check your input and try again.",
      AUTH_ERROR: "Please check your credentials and try again.",
      PERMISSION_ERROR: "You do not have permission to perform this action.",
      NOT_FOUND: "The requested resource was not found.",
      SERVER_ERROR:
        "The server is currently unavailable. Please try again later.",
      TIMEOUT: "The request timed out. Please try again.",
      RATE_LIMIT: "Too many requests. Please wait a moment and try again.",
    };

    for (const [code, message] of Object.entries(messageMap)) {
      if (error.code.includes(code)) {
        return message;
      }
    }

    return "An unexpected error occurred. Please try again.";
  }

  /**
   * Show error alert to user
   */
  static showErrorAlert(
    error: ServiceError | EnhancedError,
    options: {
      title?: string;
      showRetry?: boolean;
      onRetry?: () => void;
      onCancel?: () => void;
    } = {}
  ) {
    const { title = "Error", showRetry = false, onRetry, onCancel } = options;

    const message = this.getUserFriendlyMessage(error);
    const buttons: any[] = [];

    if (showRetry && this.isRetryable(error)) {
      buttons.push({
        text: "Retry",
        onPress: onRetry,
      });
    }

    buttons.push({
      text: "OK",
      onPress: onCancel,
    });

    Alert.alert(title, message, buttons);
  }
}

/**
 * Error reporter for logging and analytics
 */
export class ErrorReporter {
  private static errorQueue: EnhancedError[] = [];
  private static isProcessing = false;

  /**
   * Report an error
   */
  static reportError(
    error: Error | ServiceError,
    enhancementData?: Partial<EnhancedError>
  ): void {
    const enhancedError: EnhancedError = {
      code: error instanceof Error ? "UNKNOWN_ERROR" : error.code,
      message: error.message,
      details: error instanceof Error ? { stack: error.stack } : error.details,
      timestamp: new Date().toISOString(),
      category: enhancementData?.category || ErrorCategory.SYSTEM,
      severity: enhancementData?.severity || ErrorSeverity.MEDIUM,
      userFriendlyMessage:
        enhancementData?.userFriendlyMessage || "An error occurred",
      retryable: enhancementData?.retryable || false,
      metadata: enhancementData?.metadata,
    };

    // Log to console/file
    logger.error("Error reported", new Error(enhancedError.message));

    // Add to queue for batch processing
    this.errorQueue.push(enhancedError);

    // Process queue
    this.processErrorQueue();
  }

  /**
   * Process error queue
   */
  private static async processErrorQueue(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const errors = [...this.errorQueue];
      this.errorQueue = [];

      // In a real app, you would send to analytics service
      // await this.sendToAnalytics(errors);

      logger.info(`Processed ${errors.length} errors`);
    } catch (processingError) {
      logger.error(
        "Failed to process error queue",
        processingError instanceof Error
          ? processingError
          : new Error(String(processingError))
      );
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get error statistics
   */
  static getErrorStats() {
    return {
      queueLength: this.errorQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}

/**
 * Retry utility for handling retryable operations
 */
export class RetryUtils {
  static async withRetry<T>(
    operation: () => Promise<ServiceResponse<T>>,
    options: {
      maxAttempts?: number;
      delay?: number;
      backoff?: boolean;
      shouldRetry?: (error: ServiceError) => boolean;
    } = {}
  ): Promise<ServiceResponse<T>> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = true,
      shouldRetry = ErrorUtils.isRetryable,
    } = options;

    let lastResult: ServiceResponse<T>;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();

        if (result.success) {
          return result;
        }

        lastResult = result;

        // Don't retry if error is not retryable
        if (!result.error || !shouldRetry(result.error)) {
          break;
        }

        // Don't delay on last attempt
        if (attempt < maxAttempts) {
          const delayMs = backoff ? delay * Math.pow(2, attempt - 1) : delay;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        lastResult = {
          data: null,
          error: {
            code: "RETRY_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
            details: { attempt, originalError: error },
            timestamp: new Date().toISOString(),
          },
          success: false,
        };
      }
    }

    return lastResult!;
  }
}

/**
 * Hook for error handling in components
 */
export function useErrorHandler() {
  const handleError = (error: Error | ServiceError, context?: string): void => {
    ErrorReporter.reportError(error, {
      category: ErrorCategory.UI,
      severity: ErrorSeverity.MEDIUM,
      userFriendlyMessage: "Something went wrong",
      retryable: true,
      metadata: { context },
    });
  };

  const showError = (
    error: ServiceError | EnhancedError,
    options?: Parameters<typeof ErrorUtils.showErrorAlert>[1]
  ): void => {
    ErrorUtils.showErrorAlert(error, options);
  };

  return {
    handleError,
    showError,
    ErrorUtils,
    RetryUtils,
  };
}
