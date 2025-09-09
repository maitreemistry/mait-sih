import type { AuthError, PostgrestError } from "@supabase/supabase-js";
import type { ServiceError } from "../services/types";

/**
 * Unified error formatter that handles both ServiceError and AuthError
 */
export function formatError(
  error: ServiceError | AuthError | PostgrestError | null
): string | null {
  if (!error) return null;

  // Handle ServiceError
  if ("code" in error && "timestamp" in error) {
    const serviceError = error as ServiceError;
    return serviceError.message || "An error occurred";
  }

  // Handle AuthError
  if ("__isAuthError" in error || "status" in error) {
    const authError = error as AuthError;
    return formatAuthError(authError);
  }

  // Handle PostgrestError
  if ("code" in error && "details" in error) {
    const dbError = error as PostgrestError;
    return formatDatabaseError(dbError);
  }

  // Fallback
  return (error as any).message || "An unexpected error occurred";
}

/**
 * Format auth errors for user-friendly display
 */
export function formatAuthError(error: AuthError | null): string | null {
  if (!error) return null;

  switch (error.message) {
    case "Invalid login credentials":
      return "Invalid email or password. Please try again.";
    case "Email not confirmed":
      return "Please check your email and click the confirmation link.";
    case "User already registered":
      return "An account with this email already exists.";
    case "Password should be at least 6 characters":
      return "Password must be at least 6 characters long.";
    case "Unable to validate email address: invalid format":
      return "Please enter a valid email address.";
    case "signup is disabled":
      return "Account registration is currently disabled.";
    default:
      return error.message || "An unexpected error occurred. Please try again.";
  }
}

/**
 * Format database errors for user-friendly display
 */
export function formatDatabaseError(
  error: PostgrestError | null
): string | null {
  if (!error) return null;

  switch (error.code) {
    case "PGRST116":
      return "No data found for the requested operation.";
    case "PGRST301":
      return "You do not have permission to perform this action.";
    case "23505":
      return "This record already exists.";
    case "23503":
      return "Cannot delete this record as it is referenced by other data.";
    case "42501":
      return "Insufficient permissions to access this resource.";
    default:
      return error.message || "A database error occurred. Please try again.";
  }
}

/**
 * Enhanced error logging with context
 */
export function logError(
  error: any,
  context?: string,
  metadata?: Record<string, any>
): void {
  if (__DEV__) {
    const prefix = context ? `[${context}]` : "[Error]";
    console.error(prefix, error);
    if (metadata) {
      console.error("Context:", metadata);
    }
  }
}

/**
 * Create user-friendly error messages for common scenarios
 */
export const ErrorMessages = {
  NETWORK: "Network error. Please check your connection and try again.",
  TIMEOUT: "Request timed out. Please try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION: "Please check your input and try again.",
} as const;
