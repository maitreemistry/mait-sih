import { BUSINESS_RULES } from "../config";
import { Payment, ValidationError, ValidationResult } from "../types";
import { BaseValidator } from "./BaseValidator";

export class PaymentValidator extends BaseValidator<Payment> {
  private readonly REQUIRED_FIELDS = ["order_id", "amount"];

  validate(data: Partial<Payment>): ValidationResult {
    const errors: ValidationError[] = [];

    // Amount validation
    if (data.amount !== undefined) {
      if (data.amount < BUSINESS_RULES.PAYMENT.MIN_AMOUNT) {
        errors.push(
          this.createError(
            "amount",
            `Payment amount must be at least ${BUSINESS_RULES.PAYMENT.MIN_AMOUNT}`,
            "AMOUNT_TOO_LOW"
          )
        );
      }
      if (data.amount > BUSINESS_RULES.PAYMENT.MAX_AMOUNT) {
        errors.push(
          this.createError(
            "amount",
            `Payment amount cannot exceed ${BUSINESS_RULES.PAYMENT.MAX_AMOUNT}`,
            "AMOUNT_TOO_HIGH"
          )
        );
      }
    }

    // Status validation
    const validStatuses = ["pending", "succeeded", "failed"];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(
        this.createError("status", "Invalid payment status", "INVALID_STATUS")
      );
    }

    // Stripe charge ID validation (if provided)
    if (data.stripe_charge_id) {
      if (
        !data.stripe_charge_id.startsWith("ch_") &&
        !data.stripe_charge_id.startsWith("pi_")
      ) {
        errors.push(
          this.createError(
            "stripe_charge_id",
            "Invalid Stripe charge ID format",
            "INVALID_STRIPE_ID"
          )
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateRequired(data: Partial<Payment>): ValidationResult {
    return super.validateRequired(data, this.REQUIRED_FIELDS);
  }
}
