import { VALIDATION_RULES } from "../config";
import { Profile, ValidationError, ValidationResult } from "../types";
import { BaseValidator } from "./BaseValidator";

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
