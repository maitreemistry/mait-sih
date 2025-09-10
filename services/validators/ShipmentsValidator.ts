import { BUSINESS_RULES } from "../config";
import { ValidationError, ValidationResult } from "../types";
import { BaseValidator } from "./BaseValidator";

export interface CreateShipmentData {
  order_id: string;
  carrier_name: string;
  tracking_number?: string;
  status?: string;
  estimated_delivery_date?: string;
  shipping_address: any;
  pickup_address?: any;
  weight_kg?: number;
  dimensions?: any;
  shipping_cost?: number;
  insurance_value?: number;
  special_instructions?: string;
}

export interface UpdateShipmentData {
  carrier_name?: string;
  tracking_number?: string;
  status?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  shipping_address?: any;
  pickup_address?: any;
  weight_kg?: number;
  dimensions?: any;
  shipping_cost?: number;
  insurance_value?: number;
  special_instructions?: string;
}

export interface ShipmentSearchData {
  query: string;
  limit?: number;
  status?: string;
}

export interface TrackingData {
  trackingNumber: string;
}

export interface StatusUpdateData {
  status: string;
  actualDeliveryDate?: string;
}

export class ShipmentsValidator extends BaseValidator {
  private readonly validStatuses = BUSINESS_RULES.SHIPMENT.ALLOWED_STATUSES;
  private readonly maxWeightKg = 10000; // 10 tons default limit

  /**
   * Validate shipment creation data
   */
  validateCreate(data: CreateShipmentData): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields validation
    if (!data.order_id) {
      errors.push({
        field: "order_id",
        message: "Order ID is required",
        code: "REQUIRED_FIELD",
      });
    }

    if (!data.carrier_name?.trim()) {
      errors.push({
        field: "carrier_name",
        message: "Carrier name is required",
        code: "REQUIRED_FIELD",
      });
    }

    if (!data.shipping_address) {
      errors.push({
        field: "shipping_address",
        message: "Shipping address is required",
        code: "REQUIRED_FIELD",
      });
    }

    // Validate carrier name length
    if (data.carrier_name && data.carrier_name.trim().length < 2) {
      errors.push({
        field: "carrier_name",
        message: "Carrier name must be at least 2 characters long",
        code: "MIN_LENGTH",
      });
    }

    if (data.carrier_name && data.carrier_name.trim().length > 100) {
      errors.push({
        field: "carrier_name",
        message: "Carrier name must not exceed 100 characters",
        code: "MAX_LENGTH",
      });
    }

    // Validate tracking number format if provided
    if (
      data.tracking_number &&
      !this.isValidTrackingNumber(data.tracking_number)
    ) {
      errors.push({
        field: "tracking_number",
        message: "Invalid tracking number format",
        code: "INVALID_FORMAT",
      });
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

    // Validate dates
    if (
      data.estimated_delivery_date &&
      !this.isValidDateString(data.estimated_delivery_date)
    ) {
      errors.push({
        field: "estimated_delivery_date",
        message: "Invalid estimated delivery date format",
        code: "INVALID_DATE",
      });
    }

    // Validate estimated delivery is in the future
    if (data.estimated_delivery_date) {
      const estimatedDate = new Date(data.estimated_delivery_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (estimatedDate < today) {
        errors.push({
          field: "estimated_delivery_date",
          message: "Estimated delivery date cannot be in the past",
          code: "INVALID_DATE_RANGE",
        });
      }
    }

    // Validate weight if provided
    if (data.weight_kg !== undefined) {
      if (typeof data.weight_kg !== "number" || data.weight_kg <= 0) {
        errors.push({
          field: "weight_kg",
          message: "Weight must be a positive number",
          code: "INVALID_NUMBER",
        });
      }

      if (data.weight_kg > this.maxWeightKg) {
        errors.push({
          field: "weight_kg",
          message: `Weight cannot exceed ${this.maxWeightKg} kg`,
          code: "MAX_VALUE_EXCEEDED",
        });
      }
    }

    // Validate shipping cost if provided
    if (data.shipping_cost !== undefined) {
      if (typeof data.shipping_cost !== "number" || data.shipping_cost < 0) {
        errors.push({
          field: "shipping_cost",
          message: "Shipping cost must be a non-negative number",
          code: "INVALID_NUMBER",
        });
      }
    }

    // Validate insurance value if provided
    if (data.insurance_value !== undefined) {
      if (
        typeof data.insurance_value !== "number" ||
        data.insurance_value < 0
      ) {
        errors.push({
          field: "insurance_value",
          message: "Insurance value must be a non-negative number",
          code: "INVALID_NUMBER",
        });
      }
    }

    // Validate special instructions length
    if (data.special_instructions && data.special_instructions.length > 1000) {
      errors.push({
        field: "special_instructions",
        message: "Special instructions must not exceed 1000 characters",
        code: "MAX_LENGTH",
      });
    }

    // Validate shipping address structure
    if (
      data.shipping_address &&
      !this.isValidShippingAddress(data.shipping_address)
    ) {
      errors.push({
        field: "shipping_address",
        message:
          "Shipping address must include street, city, state, country, and postal_code",
        code: "INVALID_ADDRESS",
      });
    }

    // Validate pickup address structure if provided
    if (
      data.pickup_address &&
      !this.isValidShippingAddress(data.pickup_address)
    ) {
      errors.push({
        field: "pickup_address",
        message:
          "Pickup address must include street, city, state, country, and postal_code",
        code: "INVALID_ADDRESS",
      });
    }

    // Validate dimensions if provided
    if (data.dimensions && !this.isValidDimensions(data.dimensions)) {
      errors.push({
        field: "dimensions",
        message: "Dimensions must include length, width, and height in cm",
        code: "INVALID_DIMENSIONS",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate shipment update data
   */
  validateUpdate(data: UpdateShipmentData): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate carrier name if provided
    if (data.carrier_name !== undefined) {
      if (!data.carrier_name?.trim()) {
        errors.push({
          field: "carrier_name",
          message: "Carrier name cannot be empty",
          code: "REQUIRED_FIELD",
        });
      } else if (data.carrier_name.trim().length < 2) {
        errors.push({
          field: "carrier_name",
          message: "Carrier name must be at least 2 characters long",
          code: "MIN_LENGTH",
        });
      } else if (data.carrier_name.trim().length > 100) {
        errors.push({
          field: "carrier_name",
          message: "Carrier name must not exceed 100 characters",
          code: "MAX_LENGTH",
        });
      }
    }

    // Validate tracking number if provided
    if (
      data.tracking_number !== undefined &&
      data.tracking_number &&
      !this.isValidTrackingNumber(data.tracking_number)
    ) {
      errors.push({
        field: "tracking_number",
        message: "Invalid tracking number format",
        code: "INVALID_FORMAT",
      });
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

    // Validate dates
    if (
      data.estimated_delivery_date &&
      !this.isValidDateString(data.estimated_delivery_date)
    ) {
      errors.push({
        field: "estimated_delivery_date",
        message: "Invalid estimated delivery date format",
        code: "INVALID_DATE",
      });
    }

    if (
      data.actual_delivery_date &&
      !this.isValidDateString(data.actual_delivery_date)
    ) {
      errors.push({
        field: "actual_delivery_date",
        message: "Invalid actual delivery date format",
        code: "INVALID_DATE",
      });
    }

    // Validate that actual delivery date is not in the future
    if (data.actual_delivery_date) {
      const actualDate = new Date(data.actual_delivery_date);
      const now = new Date();

      if (actualDate > now) {
        errors.push({
          field: "actual_delivery_date",
          message: "Actual delivery date cannot be in the future",
          code: "INVALID_DATE_RANGE",
        });
      }
    }

    // Validate weight if provided
    if (data.weight_kg !== undefined) {
      if (typeof data.weight_kg !== "number" || data.weight_kg <= 0) {
        errors.push({
          field: "weight_kg",
          message: "Weight must be a positive number",
          code: "INVALID_NUMBER",
        });
      }

      if (data.weight_kg > this.maxWeightKg) {
        errors.push({
          field: "weight_kg",
          message: `Weight cannot exceed ${this.maxWeightKg} kg`,
          code: "MAX_VALUE_EXCEEDED",
        });
      }
    }

    // Validate shipping cost if provided
    if (data.shipping_cost !== undefined) {
      if (typeof data.shipping_cost !== "number" || data.shipping_cost < 0) {
        errors.push({
          field: "shipping_cost",
          message: "Shipping cost must be a non-negative number",
          code: "INVALID_NUMBER",
        });
      }
    }

    // Validate insurance value if provided
    if (data.insurance_value !== undefined) {
      if (
        typeof data.insurance_value !== "number" ||
        data.insurance_value < 0
      ) {
        errors.push({
          field: "insurance_value",
          message: "Insurance value must be a non-negative number",
          code: "INVALID_NUMBER",
        });
      }
    }

    // Validate special instructions length
    if (
      data.special_instructions !== undefined &&
      data.special_instructions &&
      data.special_instructions.length > 1000
    ) {
      errors.push({
        field: "special_instructions",
        message: "Special instructions must not exceed 1000 characters",
        code: "MAX_LENGTH",
      });
    }

    // Validate shipping address structure if provided
    if (
      data.shipping_address &&
      !this.isValidShippingAddress(data.shipping_address)
    ) {
      errors.push({
        field: "shipping_address",
        message:
          "Shipping address must include street, city, state, country, and postal_code",
        code: "INVALID_ADDRESS",
      });
    }

    // Validate pickup address structure if provided
    if (
      data.pickup_address &&
      !this.isValidShippingAddress(data.pickup_address)
    ) {
      errors.push({
        field: "pickup_address",
        message:
          "Pickup address must include street, city, state, country, and postal_code",
        code: "INVALID_ADDRESS",
      });
    }

    // Validate dimensions if provided
    if (data.dimensions && !this.isValidDimensions(data.dimensions)) {
      errors.push({
        field: "dimensions",
        message: "Dimensions must include length, width, and height in cm",
        code: "INVALID_DIMENSIONS",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate search parameters
   */
  validateSearch(data: ShipmentSearchData): ValidationResult {
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
   * Validate tracking number format
   */
  validateTracking(data: TrackingData): ValidationResult {
    const errors: ValidationError[] = [];

    if (!data.trackingNumber?.trim()) {
      errors.push({
        field: "trackingNumber",
        message: "Tracking number is required",
        code: "REQUIRED_FIELD",
      });
    } else if (!this.isValidTrackingNumber(data.trackingNumber)) {
      errors.push({
        field: "trackingNumber",
        message: "Invalid tracking number format",
        code: "INVALID_FORMAT",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate status update data
   */
  validateStatusUpdate(data: StatusUpdateData): ValidationResult {
    const errors: ValidationError[] = [];

    if (!data.status) {
      errors.push({
        field: "status",
        message: "Status is required",
        code: "REQUIRED_FIELD",
      });
    } else if (
      !(this.validStatuses as readonly string[]).includes(data.status)
    ) {
      errors.push({
        field: "status",
        message: `Status must be one of: ${this.validStatuses.join(", ")}`,
        code: "INVALID_VALUE",
      });
    }

    // If status is delivered, actual delivery date should be provided
    if (data.status === "delivered" && !data.actualDeliveryDate) {
      errors.push({
        field: "actualDeliveryDate",
        message: "Actual delivery date is required when status is delivered",
        code: "REQUIRED_FIELD",
      });
    }

    if (data.actualDeliveryDate) {
      if (!this.isValidDateString(data.actualDeliveryDate)) {
        errors.push({
          field: "actualDeliveryDate",
          message: "Invalid actual delivery date format",
          code: "INVALID_DATE",
        });
      } else {
        const actualDate = new Date(data.actualDeliveryDate);
        const now = new Date();

        if (actualDate > now) {
          errors.push({
            field: "actualDeliveryDate",
            message: "Actual delivery date cannot be in the future",
            code: "INVALID_DATE_RANGE",
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if tracking number format is valid
   * Supports common carrier formats
   */
  private isValidTrackingNumber(trackingNumber: string): boolean {
    const trimmed = trackingNumber.trim();

    // Minimum length check
    if (trimmed.length < 6 || trimmed.length > 35) {
      return false;
    }

    // Common tracking number patterns
    const patterns = [
      /^[A-Z0-9]{10,35}$/, // General alphanumeric
      /^[0-9]{12,22}$/, // Numeric only (common for many carriers)
      /^1Z[A-Z0-9]{16}$/, // UPS format
      /^[0-9]{14}$/, // FedEx Express
      /^[0-9]{12}$/, // FedEx Ground
      /^9[0-9]{21}$/, // USPS
      /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/, // International postal formats
    ];

    return patterns.some((pattern) => pattern.test(trimmed));
  }

  /**
   * Check if date string is valid
   */
  private isValidDateString(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Validate shipping address structure
   */
  private isValidShippingAddress(address: any): boolean {
    if (!address || typeof address !== "object") {
      return false;
    }

    const requiredFields = [
      "street",
      "city",
      "state",
      "country",
      "postal_code",
    ];
    return requiredFields.every(
      (field) =>
        address[field] &&
        typeof address[field] === "string" &&
        address[field].trim().length > 0
    );
  }

  /**
   * Validate dimensions structure
   */
  private isValidDimensions(dimensions: any): boolean {
    if (!dimensions || typeof dimensions !== "object") {
      return false;
    }

    const requiredFields = ["length", "width", "height"];
    return requiredFields.every(
      (field) => typeof dimensions[field] === "number" && dimensions[field] > 0
    );
  }
}
