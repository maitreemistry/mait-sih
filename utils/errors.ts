import type { AuthError, PostgrestError } from "@supabase/supabase-js";

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
 * Check if the current environment is development
 */
export function isDevelopment(): boolean {
  return __DEV__;
}

/**
 * Log errors in development environment
 */
export function logError(error: any, context?: string): void {
  if (isDevelopment()) {
    console.error(context ? `[${context}]` : "[Error]", error);
  }
}
