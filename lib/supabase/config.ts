/**
 * Supabase Configuration
 *
 * This file contains additional configuration options for Supabase
 * that can be customized based on your project needs.
 */

// Auth configuration options
export const authConfig = {
  // Redirect URLs for email confirmations
  redirectUrls: {
    emailConfirmation: "https://your-app.com/auth/confirm",
    passwordReset: "https://your-app.com/auth/reset-password",
  },

  // Session configuration
  session: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Set to true for web apps
  },

  // OAuth providers (if using social auth)
  providers: {
    google: {
      enabled: false,
      // Additional Google OAuth config
    },
    apple: {
      enabled: false,
      // Additional Apple OAuth config
    },
    facebook: {
      enabled: false,
      // Additional Facebook OAuth config
    },
  },
};

// Database configuration
export const dbConfig = {
  // Default pagination settings
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Real-time subscriptions
  realtime: {
    enabled: true,
    // Add table names that should have real-time updates
    tables: [
      // 'users',
      // 'posts',
      // 'messages',
    ],
  },

  // File storage configuration
  storage: {
    // Default bucket for file uploads
    defaultBucket: "uploads",

    // Maximum file size (in bytes)
    maxFileSize: 10 * 1024 * 1024, // 10MB

    // Allowed file types
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
    ],
  },
};

// Error handling configuration
export const errorConfig = {
  // Whether to log errors to console in development
  logToDev: true,

  // Whether to send error reports to external service
  sendReports: false,

  // Custom error messages
  messages: {
    network: "Network error. Please check your connection and try again.",
    timeout: "Request timed out. Please try again.",
    unauthorized: "You are not authorized to perform this action.",
    notFound: "The requested resource was not found.",
    serverError: "Server error. Please try again later.",
  },
};

// Development helpers
export const devConfig = {
  // Enable debug logs
  enableDebugLogs: __DEV__,

  // Show detailed error messages in development
  showDetailedErrors: __DEV__,

  // Mock data for development (if needed)
  useMockData: false,
};
