import { VALIDATION_RULES } from "../config";
import { Product, ValidationError, ValidationResult } from "../types";
import { BaseValidator } from "./BaseValidator";

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
