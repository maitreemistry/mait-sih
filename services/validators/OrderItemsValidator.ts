import { BUSINESS_RULES } from "../config";
import { OrderItem, ValidationError, ValidationResult } from "../types";
import { BaseValidator } from "./BaseValidator";

export class OrderItemsValidator extends BaseValidator<OrderItem> {
  private readonly REQUIRED_FIELDS = [
    "order_id",
    "listing_id",
    "quantity",
    "price_at_purchase",
  ];

  validate(data: Partial<OrderItem>): ValidationResult {
    const errors: ValidationError[] = [];

    // Quantity validation
    if (data.quantity !== undefined) {
      if (data.quantity <= 0) {
        errors.push(
          this.createError(
            "quantity",
            "Quantity must be greater than 0",
            "INVALID_QUANTITY"
          )
        );
      }
      if (data.quantity > BUSINESS_RULES.ORDER.MAX_QUANTITY_PER_ITEM) {
        errors.push(
          this.createError(
            "quantity",
            `Quantity cannot exceed ${BUSINESS_RULES.ORDER.MAX_QUANTITY_PER_ITEM}`,
            "QUANTITY_TOO_HIGH"
          )
        );
      }
    }

    // Price validation
    if (data.price_at_purchase !== undefined) {
      if (data.price_at_purchase <= 0) {
        errors.push(
          this.createError(
            "price_at_purchase",
            "Price must be greater than 0",
            "INVALID_PRICE"
          )
        );
      }
      if (data.price_at_purchase > BUSINESS_RULES.ORDER.MAX_PRICE_PER_UNIT) {
        errors.push(
          this.createError(
            "price_at_purchase",
            `Price per unit cannot exceed ${BUSINESS_RULES.ORDER.MAX_PRICE_PER_UNIT}`,
            "PRICE_TOO_HIGH"
          )
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateRequired(data: Partial<OrderItem>): ValidationResult {
    return super.validateRequired(data, this.REQUIRED_FIELDS);
  }
}
