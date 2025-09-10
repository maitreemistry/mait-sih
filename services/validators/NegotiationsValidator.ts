import { BUSINESS_RULES } from "../config";
import { ValidationError, ValidationResult } from "../types";
import { BaseValidator } from "./BaseValidator";

export interface CreateNegotiationData {
  order_id: string;
  farmer_id: string;
  buyer_id: string;
  product_id: string;
  original_price: number;
  proposed_price: number;
  farmer_notes?: string;
  buyer_notes?: string;
  expires_at?: string;
}

export interface UpdateNegotiationData {
  proposed_price?: number;
  final_price?: number;
  status?: string;
  farmer_notes?: string;
  buyer_notes?: string;
  expires_at?: string;
}

export interface CounterOfferData {
  proposed_price: number;
  notes?: string;
  expires_at?: string;
}

export interface SearchNegotiationData {
  query: string;
  status?: string;
  farmerId?: string;
  buyerId?: string;
  limit?: number;
}

export interface AcceptNegotiationData {
  final_price: number;
}

export class NegotiationsValidator extends BaseValidator {
  private readonly validStatuses = BUSINESS_RULES.NEGOTIATION.ALLOWED_STATUSES;
  private readonly maxCounterOffers =
    BUSINESS_RULES.NEGOTIATION.MAX_COUNTER_OFFERS;
  private readonly maxDiscountPercent =
    BUSINESS_RULES.NEGOTIATION.MAX_DISCOUNT_PERCENT;
  private readonly minPriceDifferencePercent =
    BUSINESS_RULES.NEGOTIATION.MIN_PRICE_DIFFERENCE_PERCENT;

  /**
   * Validate negotiation creation data
   */
  validateCreate(data: CreateNegotiationData): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields validation
    if (!data.order_id) {
      errors.push({
        field: "order_id",
        message: "Order ID is required",
        code: "REQUIRED_FIELD",
      });
    }

    if (!data.farmer_id) {
      errors.push({
        field: "farmer_id",
        message: "Farmer ID is required",
        code: "REQUIRED_FIELD",
      });
    }

    if (!data.buyer_id) {
      errors.push({
        field: "buyer_id",
        message: "Buyer ID is required",
        code: "REQUIRED_FIELD",
      });
    }

    if (!data.product_id) {
      errors.push({
        field: "product_id",
        message: "Product ID is required",
        code: "REQUIRED_FIELD",
      });
    }

    // Price validation
    if (typeof data.original_price !== "number" || data.original_price <= 0) {
      errors.push({
        field: "original_price",
        message: "Original price must be a positive number",
        code: "INVALID_NUMBER",
      });
    }

    if (typeof data.proposed_price !== "number" || data.proposed_price <= 0) {
      errors.push({
        field: "proposed_price",
        message: "Proposed price must be a positive number",
        code: "INVALID_NUMBER",
      });
    }

    // Validate price difference
    if (data.original_price > 0 && data.proposed_price > 0) {
      const discountPercent =
        ((data.original_price - data.proposed_price) / data.original_price) *
        100;

      if (discountPercent > this.maxDiscountPercent) {
        errors.push({
          field: "proposed_price",
          message: `Discount cannot exceed ${this.maxDiscountPercent}%`,
          code: "MAX_DISCOUNT_EXCEEDED",
        });
      }

      if (
        Math.abs(discountPercent) < this.minPriceDifferencePercent &&
        data.proposed_price !== data.original_price
      ) {
        errors.push({
          field: "proposed_price",
          message: `Price difference must be at least ${this.minPriceDifferencePercent}%`,
          code: "MIN_PRICE_DIFFERENCE",
        });
      }
    }

    // Validate notes length
    if (
      data.farmer_notes &&
      data.farmer_notes.length > BUSINESS_RULES.NEGOTIATION.MAX_NOTES_LENGTH
    ) {
      errors.push({
        field: "farmer_notes",
        message: `Farmer notes must not exceed ${BUSINESS_RULES.NEGOTIATION.MAX_NOTES_LENGTH} characters`,
        code: "MAX_LENGTH",
      });
    }

    if (
      data.buyer_notes &&
      data.buyer_notes.length > BUSINESS_RULES.NEGOTIATION.MAX_NOTES_LENGTH
    ) {
      errors.push({
        field: "buyer_notes",
        message: `Buyer notes must not exceed ${BUSINESS_RULES.NEGOTIATION.MAX_NOTES_LENGTH} characters`,
        code: "MAX_LENGTH",
      });
    }

    // Validate expiry date
    if (data.expires_at && !this.isValidDateString(data.expires_at)) {
      errors.push({
        field: "expires_at",
        message: "Invalid expiry date format",
        code: "INVALID_DATE",
      });
    }

    // Validate expiry date is in the future
    if (data.expires_at) {
      const expiryDate = new Date(data.expires_at);
      const now = new Date();

      if (expiryDate <= now) {
        errors.push({
          field: "expires_at",
          message: "Expiry date must be in the future",
          code: "INVALID_DATE_RANGE",
        });
      }

      // Check if expiry is too far in the future (more than 30 days)
      const maxExpiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (expiryDate > maxExpiryDate) {
        errors.push({
          field: "expires_at",
          message: "Expiry date cannot be more than 30 days in the future",
          code: "INVALID_DATE_RANGE",
        });
      }
    }

    // Validate that farmer and buyer are different
    if (data.farmer_id === data.buyer_id) {
      errors.push({
        field: "buyer_id",
        message: "Farmer and buyer cannot be the same person",
        code: "INVALID_RELATIONSHIP",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate negotiation update data
   */
  validateUpdate(data: UpdateNegotiationData): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate proposed price if provided
    if (data.proposed_price !== undefined) {
      if (typeof data.proposed_price !== "number" || data.proposed_price <= 0) {
        errors.push({
          field: "proposed_price",
          message: "Proposed price must be a positive number",
          code: "INVALID_NUMBER",
        });
      }
    }

    // Validate final price if provided
    if (data.final_price !== undefined) {
      if (typeof data.final_price !== "number" || data.final_price <= 0) {
        errors.push({
          field: "final_price",
          message: "Final price must be a positive number",
          code: "INVALID_NUMBER",
        });
      }
    }

    // Validate status if provided
    if (
      data.status &&
      !(this.validStatuses as readonly string[]).includes(data.status)
    ) {
      errors.push({
        field: "status",
        message: `Status must be one of: ${this.validStatuses.join(", ")}`,
        code: "INVALID_VALUE",
      });
    }

    // Validate notes length
    if (
      data.farmer_notes !== undefined &&
      data.farmer_notes &&
      data.farmer_notes.length > BUSINESS_RULES.NEGOTIATION.MAX_NOTES_LENGTH
    ) {
      errors.push({
        field: "farmer_notes",
        message: `Farmer notes must not exceed ${BUSINESS_RULES.NEGOTIATION.MAX_NOTES_LENGTH} characters`,
        code: "MAX_LENGTH",
      });
    }

    if (
      data.buyer_notes !== undefined &&
      data.buyer_notes &&
      data.buyer_notes.length > BUSINESS_RULES.NEGOTIATION.MAX_NOTES_LENGTH
    ) {
      errors.push({
        field: "buyer_notes",
        message: `Buyer notes must not exceed ${BUSINESS_RULES.NEGOTIATION.MAX_NOTES_LENGTH} characters`,
        code: "MAX_LENGTH",
      });
    }

    // Validate expiry date if provided
    if (data.expires_at && !this.isValidDateString(data.expires_at)) {
      errors.push({
        field: "expires_at",
        message: "Invalid expiry date format",
        code: "INVALID_DATE",
      });
    }

    // Validate expiry date is in the future
    if (data.expires_at) {
      const expiryDate = new Date(data.expires_at);
      const now = new Date();

      if (expiryDate <= now) {
        errors.push({
          field: "expires_at",
          message: "Expiry date must be in the future",
          code: "INVALID_DATE_RANGE",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate counter offer data
   */
  validateCounterOffer(
    data: CounterOfferData,
    currentCounterOffers: number,
    originalPrice: number
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Check counter offer limit
    if (currentCounterOffers >= this.maxCounterOffers) {
      errors.push({
        field: "counter_offers",
        message: `Maximum ${this.maxCounterOffers} counter offers allowed`,
        code: "MAX_COUNTER_OFFERS_EXCEEDED",
      });
    }

    // Validate proposed price
    if (typeof data.proposed_price !== "number" || data.proposed_price <= 0) {
      errors.push({
        field: "proposed_price",
        message: "Proposed price must be a positive number",
        code: "INVALID_NUMBER",
      });
    }

    // Validate price against original price
    if (originalPrice > 0 && data.proposed_price > 0) {
      const discountPercent =
        ((originalPrice - data.proposed_price) / originalPrice) * 100;

      if (discountPercent > this.maxDiscountPercent) {
        errors.push({
          field: "proposed_price",
          message: `Discount cannot exceed ${this.maxDiscountPercent}%`,
          code: "MAX_DISCOUNT_EXCEEDED",
        });
      }
    }

    // Validate notes length
    if (
      data.notes &&
      data.notes.length > BUSINESS_RULES.NEGOTIATION.MAX_NOTES_LENGTH
    ) {
      errors.push({
        field: "notes",
        message: `Notes must not exceed ${BUSINESS_RULES.NEGOTIATION.MAX_NOTES_LENGTH} characters`,
        code: "MAX_LENGTH",
      });
    }

    // Validate expiry date
    if (data.expires_at && !this.isValidDateString(data.expires_at)) {
      errors.push({
        field: "expires_at",
        message: "Invalid expiry date format",
        code: "INVALID_DATE",
      });
    }

    if (data.expires_at) {
      const expiryDate = new Date(data.expires_at);
      const now = new Date();

      if (expiryDate <= now) {
        errors.push({
          field: "expires_at",
          message: "Expiry date must be in the future",
          code: "INVALID_DATE_RANGE",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate search parameters
   */
  validateSearch(data: SearchNegotiationData): ValidationResult {
    const errors: ValidationError[] = [];

    if (!data.query?.trim()) {
      errors.push({
        field: "query",
        message: "Search query is required",
        code: "REQUIRED_FIELD",
      });
    }

    if (data.query && data.query.trim().length < 2) {
      errors.push({
        field: "query",
        message: "Search query must be at least 2 characters long",
        code: "MIN_LENGTH",
      });
    }

    if (data.limit !== undefined) {
      if (typeof data.limit !== "number" || data.limit <= 0) {
        errors.push({
          field: "limit",
          message: "Limit must be a positive number",
          code: "INVALID_NUMBER",
        });
      }

      if (data.limit > 100) {
        errors.push({
          field: "limit",
          message: "Limit cannot exceed 100",
          code: "MAX_VALUE_EXCEEDED",
        });
      }
    }

    if (
      data.status &&
      !(this.validStatuses as readonly string[]).includes(data.status)
    ) {
      errors.push({
        field: "status",
        message: `Status must be one of: ${this.validStatuses.join(", ")}`,
        code: "INVALID_VALUE",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate negotiation acceptance
   */
  validateAcceptance(data: AcceptNegotiationData): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof data.final_price !== "number" || data.final_price <= 0) {
      errors.push({
        field: "final_price",
        message: "Final price must be a positive number",
        code: "INVALID_NUMBER",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate price change parameters
   */
  validatePriceChange(
    originalPrice: number,
    newPrice: number
  ): ValidationResult {
    const errors: ValidationError[] = [];

    if (originalPrice <= 0 || newPrice <= 0) {
      errors.push({
        field: "price",
        message: "Prices must be positive numbers",
        code: "INVALID_NUMBER",
      });
      return { isValid: false, errors };
    }

    const changePercent =
      Math.abs((originalPrice - newPrice) / originalPrice) * 100;

    if (
      changePercent < this.minPriceDifferencePercent &&
      originalPrice !== newPrice
    ) {
      errors.push({
        field: "price",
        message: `Price change must be at least ${this.minPriceDifferencePercent}%`,
        code: "MIN_PRICE_DIFFERENCE",
      });
    }

    const discountPercent = ((originalPrice - newPrice) / originalPrice) * 100;
    if (discountPercent > this.maxDiscountPercent) {
      errors.push({
        field: "price",
        message: `Discount cannot exceed ${this.maxDiscountPercent}%`,
        code: "MAX_DISCOUNT_EXCEEDED",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate negotiation status transition
   */
  validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): ValidationResult {
    const errors: ValidationError[] = [];

    const validTransitions: Record<string, string[]> = {
      pending: ["accepted", "rejected", "counter_offered", "expired"],
      counter_offered: ["accepted", "rejected", "counter_offered", "expired"],
      accepted: [], // Final state
      rejected: [], // Final state
      expired: ["pending"], // Can be reopened
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      errors.push({
        field: "status",
        message: `Invalid status transition from ${currentStatus} to ${newStatus}`,
        code: "INVALID_STATUS_TRANSITION",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if date string is valid
   */
  private isValidDateString(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
}
