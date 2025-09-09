/**
 * Service configuration and constants
 * Centralized configuration management following industrial standards
 */

import { ServiceConfig, ServiceErrorCode } from "./types";

// Service configuration with environment-based defaults
export const serviceConfig: ServiceConfig = {
  enableCaching: process.env.NODE_ENV === "production",
  enableLogging: true,
  enableValidation: true,
  defaultPageSize: 20,
  maxPageSize: 100,
  cacheDefaultTTL: 300, // 5 minutes
  requestTimeout: 30000, // 30 seconds
};

// Database table names (ensures consistency)
export const TABLE_NAMES = {
  PROFILES: "profiles",
  PRODUCTS: "products",
  PRODUCT_LISTINGS: "product_listings",
  ORDERS: "orders",
  ORDER_ITEMS: "order_items",
  FARM_TASKS: "farm_tasks",
  NEGOTIATIONS: "negotiations",
  REVIEWS: "reviews",
  QUALITY_REPORTS: "quality_reports",
  LOGISTICS: "logistics",
  LOGISTICS_ROUTES: "logistics_routes",
  PAYMENTS: "payments",
  NOTIFICATIONS: "notifications",
  SUPPORT_TICKETS: "support_tickets",
  AUDIT_LOGS: "audit_logs",
  USER_SESSIONS: "user_sessions",
} as const;

// API response messages
export const RESPONSE_MESSAGES = {
  SUCCESS: {
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",
    RETRIEVED: "Resource retrieved successfully",
  },
  ERROR: {
    NOT_FOUND: "Resource not found",
    VALIDATION_FAILED: "Validation failed",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Access forbidden",
    INTERNAL_ERROR: "Internal server error",
    NETWORK_ERROR: "Network connection error",
    TIMEOUT: "Request timeout",
    DUPLICATE: "Resource already exists",
  },
} as const;

// Validation rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  PRICE_MIN: 0,
  QUANTITY_MIN: 0,
} as const;

// Cache keys templates
export const CACHE_KEYS = {
  PROFILE: (id: string) => `profile:${id}`,
  PRODUCTS: (farmerId?: string) =>
    farmerId ? `products:farmer:${farmerId}` : "products:all",
  PRODUCT_LISTINGS: (status?: string) =>
    status ? `listings:${status}` : "listings:all",
  ORDERS: (userId: string, role: string) => `orders:${role}:${userId}`,
  FARM_TASKS: (farmerId: string) => `tasks:farmer:${farmerId}`,
} as const;

// Error code mappings for better error handling
export const ERROR_CODE_MAPPINGS = {
  "23505": ServiceErrorCode.DUPLICATE_ERROR, // PostgreSQL unique violation
  "23503": ServiceErrorCode.DEPENDENCY_ERROR, // Foreign key violation
  "42P01": ServiceErrorCode.INTERNAL_ERROR, // Table does not exist
  PGRST301: ServiceErrorCode.NOT_FOUND, // PostgREST not found
  PGRST204: ServiceErrorCode.PERMISSION_DENIED, // PostgREST permission denied
} as const;

// Feature flags for gradual rollout
export const FEATURE_FLAGS = {
  ENABLE_CACHING: process.env.EXPO_PUBLIC_ENABLE_CACHING === "true",
  ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === "true",
  ENABLE_PUSH_NOTIFICATIONS:
    process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === "true",
  ENABLE_OFFLINE_MODE: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === "true",
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  DEFAULT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit auth attempts
  },
  SEARCH: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // limit search requests
  },
} as const;

// Business logic constants
export const BUSINESS_RULES = {
  ORDER: {
    MIN_AMOUNT: 10,
    MAX_AMOUNT: 100000,
    CANCELLATION_WINDOW_HOURS: 24,
  },
  TASK: {
    MAX_PRIORITY_TASKS: 5,
    AUTO_COMPLETE_DAYS: 30,
  },
  LISTING: {
    MAX_IMAGES: 10,
    MAX_DESCRIPTION_LENGTH: 2000,
    MIN_PRICE: 1,
  },
  REVIEW: {
    MIN_RATING: 1,
    MAX_RATING: 5,
    COOLDOWN_DAYS: 1,
  },
} as const;
