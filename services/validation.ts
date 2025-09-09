/**
 * Validation service following industrial standards
 * Provides comprehensive data validation with proper error reporting
 */

import { BUSINESS_RULES, VALIDATION_RULES } from "./config";
import {
  FarmTask,
  IValidator,
  Order,
  Product,
  Profile,
  ValidationError,
  ValidationResult,
} from "./types";

export class BaseValidator<T = any> implements IValidator<T> {
  protected createError(
    field: string,
    message: string,
    code: string
  ): ValidationError {
    return { field, message, code };
  }

  protected isValidEmail(email: string): boolean {
    return VALIDATION_RULES.EMAIL.test(email);
  }

  protected isValidPhone(phone: string): boolean {
    return VALIDATION_RULES.PHONE.test(phone);
  }

  protected isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  protected isWithinRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  protected isValidLength(value: string, maxLength: number): boolean {
    return value.length <= maxLength;
  }

  protected isRequired(value: any): boolean {
    return value !== null && value !== undefined && value !== "";
  }

  validate(data: Partial<T>): ValidationResult {
    // Base implementation - override in specific validators
    return { isValid: true, errors: [] };
  }

  validateRequired(
    data: Partial<T>,
    requiredFields: string[]
  ): ValidationResult {
    const errors: ValidationError[] = [];

    requiredFields.forEach((field) => {
      const value = (data as any)[field];
      if (!this.isRequired(value)) {
        errors.push(
          this.createError(field, `${field} is required`, "REQUIRED")
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateUpdate(data: Partial<T>): ValidationResult {
    // For updates, we don't require all fields, just validate what's provided
    return this.validate(data);
  }
}

export class ProfileValidator extends BaseValidator<Profile> {
  private readonly REQUIRED_FIELDS = ["role", "full_name", "contact_email"];

  validate(data: Partial<Profile>): ValidationResult {
    const errors: ValidationError[] = [];

    // Email validation
    if (data.contact_email) {
      if (!this.isValidEmail(data.contact_email)) {
        errors.push(
          this.createError(
            "contact_email",
            "Invalid email format",
            "INVALID_EMAIL"
          )
        );
      }
    }

    // Phone validation
    if (data.phone_number && !this.isValidPhone(data.phone_number)) {
      errors.push(
        this.createError(
          "phone_number",
          "Invalid phone number format",
          "INVALID_PHONE"
        )
      );
    }

    // Name length validation
    if (
      data.full_name &&
      !this.isValidLength(data.full_name, VALIDATION_RULES.NAME_MAX_LENGTH)
    ) {
      errors.push(
        this.createError(
          "full_name",
          `Name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
          "INVALID_LENGTH"
        )
      );
    }

    // Role validation
    if (
      data.role &&
      !["farmer", "distributor", "retailer"].includes(data.role)
    ) {
      errors.push(
        this.createError("role", "Invalid role specified", "INVALID_ROLE")
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateRequired(data: Partial<Profile>): ValidationResult {
    return super.validateRequired(data, this.REQUIRED_FIELDS);
  }
}

export class ProductValidator extends BaseValidator<Product> {
  private readonly REQUIRED_FIELDS = ["name"];

  validate(data: Partial<Product>): ValidationResult {
    const errors: ValidationError[] = [];

    // Name validation
    if (
      data.name &&
      !this.isValidLength(data.name, VALIDATION_RULES.NAME_MAX_LENGTH)
    ) {
      errors.push(
        this.createError(
          "name",
          `Product name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
          "INVALID_LENGTH"
        )
      );
    }

    // Description validation
    if (
      data.description &&
      !this.isValidLength(
        data.description,
        VALIDATION_RULES.DESCRIPTION_MAX_LENGTH
      )
    ) {
      errors.push(
        this.createError(
          "description",
          `Description must be less than ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`,
          "INVALID_LENGTH"
        )
      );
    }

    // Image URL validation
    if (data.image_url && !this.isValidUrl(data.image_url)) {
      errors.push(
        this.createError("image_url", "Invalid image URL format", "INVALID_URL")
      );
    }

    // Category validation (if provided)
    if (data.category) {
      const validCategories = [
        "grains",
        "vegetables",
        "fruits",
        "dairy",
        "poultry",
        "livestock",
        "spices",
        "other",
      ];
      if (!validCategories.includes(data.category)) {
        errors.push(
          this.createError(
            "category",
            "Invalid product category",
            "INVALID_CATEGORY"
          )
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateRequired(data: Partial<Product>): ValidationResult {
    return super.validateRequired(data, this.REQUIRED_FIELDS);
  }
}

export class OrderValidator extends BaseValidator<Order> {
  private readonly REQUIRED_FIELDS = ["buyer_id", "total_amount"];

  validate(data: Partial<Order>): ValidationResult {
    const errors: ValidationError[] = [];

    // Amount validation
    if (data.total_amount !== undefined) {
      if (data.total_amount < BUSINESS_RULES.ORDER.MIN_AMOUNT) {
        errors.push(
          this.createError(
            "total_amount",
            `Order amount must be at least ${BUSINESS_RULES.ORDER.MIN_AMOUNT}`,
            "AMOUNT_TOO_LOW"
          )
        );
      }
      if (data.total_amount > BUSINESS_RULES.ORDER.MAX_AMOUNT) {
        errors.push(
          this.createError(
            "total_amount",
            `Order amount cannot exceed ${BUSINESS_RULES.ORDER.MAX_AMOUNT}`,
            "AMOUNT_TOO_HIGH"
          )
        );
      }
    }

    // Status validation
    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(
        this.createError("status", "Invalid order status", "INVALID_STATUS")
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateRequired(data: Partial<Order>): ValidationResult {
    return super.validateRequired(data, this.REQUIRED_FIELDS);
  }
}

export class FarmTaskValidator extends BaseValidator<FarmTask> {
  private readonly REQUIRED_FIELDS = ["farmer_id", "title"];

  validate(data: Partial<FarmTask>): ValidationResult {
    const errors: ValidationError[] = [];

    // Title validation
    if (
      data.title &&
      !this.isValidLength(data.title, VALIDATION_RULES.NAME_MAX_LENGTH)
    ) {
      errors.push(
        this.createError(
          "title",
          `Task title must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
          "INVALID_LENGTH"
        )
      );
    }

    // Description validation
    if (
      data.description &&
      !this.isValidLength(
        data.description,
        VALIDATION_RULES.DESCRIPTION_MAX_LENGTH
      )
    ) {
      errors.push(
        this.createError(
          "description",
          `Description must be less than ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`,
          "INVALID_LENGTH"
        )
      );
    }

    // Status validation
    const validStatuses = ["pending", "in_progress", "completed"];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(
        this.createError("status", "Invalid task status", "INVALID_STATUS")
      );
    }

    // Due date validation
    if (data.due_date) {
      const dueDate = new Date(data.due_date);
      const now = new Date();
      if (dueDate < now) {
        errors.push(
          this.createError(
            "due_date",
            "Due date cannot be in the past",
            "INVALID_DATE"
          )
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateRequired(data: Partial<FarmTask>): ValidationResult {
    return super.validateRequired(data, this.REQUIRED_FIELDS);
  }
}

// Validator factory
export class ValidatorFactory {
  static getValidator<T>(entityType: string): BaseValidator<T> {
    switch (entityType) {
      case "profiles":
        return new ProfileValidator() as unknown as BaseValidator<T>;
      case "products":
        return new ProductValidator() as unknown as BaseValidator<T>;
      case "orders":
        return new OrderValidator() as unknown as BaseValidator<T>;
      case "farm_tasks":
        return new FarmTaskValidator() as unknown as BaseValidator<T>;
      default:
        return new BaseValidator<T>();
    }
  }
}
