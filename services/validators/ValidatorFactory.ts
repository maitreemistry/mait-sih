import { BaseValidator } from "./BaseValidator";
import { FarmTaskValidator } from "./FarmTaskValidator";
import { OrderValidator } from "./OrderValidator";
import { ProductValidator } from "./ProductValidator";
import { ProfileValidator } from "./ProfileValidator";

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
