import { BUSINESS_RULES } from "../config";
import { Order, ValidationError, ValidationResult } from "../types";
import { BaseValidator } from "./BaseValidator";

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
