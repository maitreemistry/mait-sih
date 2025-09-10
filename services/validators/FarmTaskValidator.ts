import { VALIDATION_RULES } from "../config";
import { FarmTask, ValidationError, ValidationResult } from "../types";
import { BaseValidator } from "./BaseValidator";

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
