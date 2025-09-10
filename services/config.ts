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

// Database table names (ensures consistency with schema)
export const TABLE_NAMES = {
  // Core entities
  PROFILES: "profiles",
  PRODUCTS: "products",
  PRODUCT_LISTINGS: "product_listings",

  // Order management
  ORDERS: "orders",
  ORDER_ITEMS: "order_items",
  PAYMENTS: "payments",

  // Trust & transparency
  REVIEWS: "reviews",
  CERTIFICATIONS: "certifications",
  QUALITY_REPORTS: "quality_reports",

  // Communication & logistics
  MESSAGES: "messages",
  SHIPMENTS: "shipments",

  // Retailer platform
  RETAILER_INVENTORY: "retailer_inventory",
  COLD_CHAIN_LOGS: "cold_chain_logs",

  // Enhancements
  BLOCKCHAIN_TX_REFERENCES: "blockchain_tx_references",
  NEGOTIATIONS: "negotiations",
  DISPUTES: "disputes",
  FARM_TASKS: "farm_tasks",
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
    MAX_QUANTITY_PER_ITEM: 10000,
    MAX_PRICE_PER_UNIT: 50000,
  },
  PAYMENT: {
    MIN_AMOUNT: 1,
    MAX_AMOUNT: 100000,
    REFUND_WINDOW_DAYS: 30,
    PROCESSING_TIMEOUT_MINUTES: 15,
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
    MAX_COMMENT_LENGTH: 1000,
    MIN_COMMENT_LENGTH: 10,
    ALLOWED_STATUSES: ["pending", "approved", "rejected"],
    COOLDOWN_DAYS: 1,
  },

  // Message rules
  MESSAGE: {
    MAX_CONTENT_LENGTH: 2000,
    MIN_CONTENT_LENGTH: 1,
    ALLOWED_STATUSES: ["sent", "delivered", "read"],
    ATTACHMENT_MAX_SIZE: 10485760, // 10MB in bytes
    MAX_ATTACHMENTS: 5,
    SPAM_COOLDOWN_MINUTES: 1,
  },

  // Shipment rules
  SHIPMENT: {
    ALLOWED_STATUSES: [
      "pending",
      "picked_up",
      "in_transit",
      "delivered",
      "returned",
      "cancelled",
    ],
    MAX_TRACKING_NUMBER_LENGTH: 50,
    MAX_NOTES_LENGTH: 500,
    DELIVERY_WINDOW_DAYS: 30,
  },

  // Negotiation rules
  NEGOTIATION: {
    ALLOWED_STATUSES: [
      "pending",
      "accepted",
      "rejected",
      "counter_offered",
      "expired",
    ],
    MAX_COUNTER_OFFERS: 5,
    DEFAULT_EXPIRY_HOURS: 48,
    MIN_PRICE_DIFFERENCE_PERCENT: 1,
    MAX_DISCOUNT_PERCENT: 50,
    MAX_NOTES_LENGTH: 1000,
  },

  // Certification rules
  CERTIFICATION: {
    ALLOWED_TYPES: [
      "organic",
      "fair_trade",
      "gmp",
      "haccp",
      "iso_22000",
      "rainforest_alliance",
    ],
    ALLOWED_STATUSES: [
      "pending",
      "verified",
      "rejected",
      "expired",
      "suspended",
    ],
    MAX_VALIDITY_YEARS: 5,
    MIN_VALIDITY_MONTHS: 6,
    MAX_CERTIFICATE_NUMBER_LENGTH: 50,
    MAX_NOTES_LENGTH: 2000,
    REQUIRED_DOCUMENTS: ["certificate", "inspection_report"],
  },

  // Quality Report rules
  QUALITY_REPORT: {
    ALLOWED_STATUSES: ["pending", "approved", "rejected", "under_review"],
    ALLOWED_GRADES: ["A+", "A", "B+", "B", "C", "D"],
    MIN_SCORE: 0,
    MAX_SCORE: 100,
    MAX_NOTES_LENGTH: 2000,
    REQUIRED_PARAMETERS: [
      "appearance",
      "taste",
      "texture",
      "freshness",
      "packaging",
    ],
    MAX_DEFECT_PERCENTAGE: 20,
  },
} as const;
