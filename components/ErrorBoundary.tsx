/**
 * Error Boundary component for React error handling in React Native
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { logger } from "../services/logger";
import {
  ErrorCategory,
  ErrorReporter,
  ErrorSeverity,
} from "../utils/error-utils";

/**
 * Error boundary props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: "app" | "screen" | "component";
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary component for React error handling
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error
    logger.error("React Error Boundary caught an error", error);

    // Report error
    ErrorReporter.reportError(error, {
      category: ErrorCategory.UI,
      severity: ErrorSeverity.HIGH,
      userFriendlyMessage: "Something went wrong with the interface",
      retryable: true,
      metadata: {
        componentStack: errorInfo.componentStack,
        level: this.props.level,
      },
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.state.errorInfo!);
      }

      return (
        <DefaultErrorFallback
          error={this.state.error!}
          level={this.props.level || "component"}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
interface DefaultErrorFallbackProps {
  error: Error;
  level: "app" | "screen" | "component";
  onRetry: () => void;
}

function DefaultErrorFallback({
  error,
  level,
  onRetry,
}: DefaultErrorFallbackProps) {
  const getMessage = () => {
    switch (level) {
      case "app":
        return "The application encountered an unexpected error. Please restart the app.";
      case "screen":
        return "This screen encountered an error. Please try again.";
      case "component":
        return "A component failed to load. Please refresh.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        Oops! Something went wrong
      </Text>
      <Text
        style={{
          fontSize: 14,
          textAlign: "center",
          marginBottom: 20,
          color: "#666",
        }}
      >
        {getMessage()}
      </Text>
      {__DEV__ && (
        <View
          style={{
            marginBottom: 20,
            padding: 10,
            backgroundColor: "#f5f5f5",
            borderRadius: 5,
          }}
        >
          <Text style={{ fontSize: 12, color: "#333" }}>
            Error Details (Development Mode):{"\n"}
            {error.message}
            {error.stack && "\n\nStack Trace:\n" + error.stack}
          </Text>
        </View>
      )}
      <TouchableOpacity
        onPress={onRetry}
        style={{
          backgroundColor: "#007AFF",
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}
