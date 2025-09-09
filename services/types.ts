/**
 * Service layer types and interfaces
 * Following industrial standard practices for type safety and maintainability
 */

import type { PostgrestResponse } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Base service response types
export interface ServiceResponse<T = any> {
  data: T | null;
  error: ServiceError | null;
  success: boolean;
  message?: string;
  metadata?: ResponseMetadata;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  context?: string;
}

export interface ResponseMetadata {
  total?: number;
  page?: number;
  limit?: number;
  executionTime?: number;
  cached?: boolean;
}

// Pagination and filtering types
export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
}

export interface FilterOptions {
  column: string;
  operator:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "like"
    | "ilike"
    | "in"
    | "is";
  value: any;
}

export interface SortOptions {
  column: string;
  ascending: boolean;
}

export interface QueryOptions {
  pagination?: PaginationOptions;
  filters?: FilterOptions[];
  sorts?: SortOptions[];
  select?: string;
}

// Base service interface contract
export interface IBaseService<T = any> {
  getAll(options?: QueryOptions): Promise<ServiceResponse<T[]>>;
  getById(id: string): Promise<ServiceResponse<T>>;
  create(data: Partial<T>): Promise<ServiceResponse<T>>;
  update(id: string, data: Partial<T>): Promise<ServiceResponse<T>>;
  delete(id: string): Promise<ServiceResponse<boolean>>;
  count(filters?: FilterOptions[]): Promise<ServiceResponse<number>>;
}

// Repository pattern interfaces
export interface IRepository<T = any> {
  findAll(options?: QueryOptions): Promise<PostgrestResponse<T[]>>;
  findById(id: string): Promise<PostgrestResponse<T>>;
  findWhere(filters: FilterOptions[]): Promise<PostgrestResponse<T[]>>;
  create(data: Partial<T>): Promise<PostgrestResponse<T>>;
  update(id: string, data: Partial<T>): Promise<PostgrestResponse<T>>;
  delete(id: string): Promise<PostgrestResponse<null>>;
  count(filters?: FilterOptions[]): Promise<PostgrestResponse<number>>;
}

// Validation interface
export interface IValidator<T = any> {
  validate(data: Partial<T>): ValidationResult;
  validateRequired(
    data: Partial<T>,
    requiredFields: string[]
  ): ValidationResult;
  validateUpdate(data: Partial<T>): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Logger interface
export interface ILogger {
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, error?: Error, context?: any): void;
  debug(message: string, context?: any): void;
}

// Database table type mappings
export type Tables = Database["public"]["Tables"];
export type TableName = keyof Tables;

// Entity-specific types
export type Profile = Tables["profiles"]["Row"];
export type ProfileInsert = Tables["profiles"]["Insert"];
export type ProfileUpdate = Tables["profiles"]["Update"];

export type Product = Tables["products"]["Row"];
export type ProductInsert = Tables["products"]["Insert"];
export type ProductUpdate = Tables["products"]["Update"];

export type ProductListing = Tables["product_listings"]["Row"];
export type ProductListingInsert = Tables["product_listings"]["Insert"];
export type ProductListingUpdate = Tables["product_listings"]["Update"];

export type Order = Tables["orders"]["Row"];
export type OrderInsert = Tables["orders"]["Insert"];
export type OrderUpdate = Tables["orders"]["Update"];

export type FarmTask = Tables["farm_tasks"]["Row"];
export type FarmTaskInsert = Tables["farm_tasks"]["Insert"];
export type FarmTaskUpdate = Tables["farm_tasks"]["Update"];

export type Review = Tables["reviews"]["Row"];
export type ReviewInsert = Tables["reviews"]["Insert"];
export type ReviewUpdate = Tables["reviews"]["Update"];

// Service configuration
export interface ServiceConfig {
  enableCaching: boolean;
  enableLogging: boolean;
  enableValidation: boolean;
  defaultPageSize: number;
  maxPageSize: number;
  cacheDefaultTTL: number;
  requestTimeout: number;
}

// API error codes
export enum ServiceErrorCode {
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  DUPLICATE_ERROR = "DUPLICATE_ERROR",
  DEPENDENCY_ERROR = "DEPENDENCY_ERROR",
}

// Business logic interfaces
export interface IProfileService extends IBaseService<Profile> {
  getByRole(role: string): Promise<ServiceResponse<Profile[]>>;
  getVerifiedFarmers(): Promise<ServiceResponse<Profile[]>>;
  updateVerificationStatus(
    id: string,
    verified: boolean
  ): Promise<ServiceResponse<Profile>>;
}

export interface IProductService extends IBaseService<Product> {
  getByCategory(category: string): Promise<ServiceResponse<Product[]>>;
  searchProducts(query: string): Promise<ServiceResponse<Product[]>>;
  getByFarmer(farmerId: string): Promise<ServiceResponse<Product[]>>;
}

export interface IOrderService extends IBaseService<Order> {
  getByBuyer(buyerId: string): Promise<ServiceResponse<Order[]>>;
  getBySeller(sellerId: string): Promise<ServiceResponse<Order[]>>;
  updateStatus(id: string, status: string): Promise<ServiceResponse<Order>>;
  getByStatus(status: string): Promise<ServiceResponse<Order[]>>;
}

export interface IFarmTaskService extends IBaseService<FarmTask> {
  getByFarmer(farmerId: string): Promise<ServiceResponse<FarmTask[]>>;
  getByStatus(status: string): Promise<ServiceResponse<FarmTask[]>>;
  getByPriority(priority: string): Promise<ServiceResponse<FarmTask[]>>;
  updateStatus(id: string, status: string): Promise<ServiceResponse<FarmTask>>;
}
