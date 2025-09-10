/**
 * Base Validator class following industrial standards
 * Provides comprehensive data validation with proper error reporting
 */

import { VALIDATION_RULES } from "../config";
import { IValidator, ValidationError, ValidationResult } from "../types";

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
