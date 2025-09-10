import { TABLE_NAMES } from "../config";
import { EnhancedBaseService } from "../database";
import { OrderItemsRepository } from "../repositories";
import { IOrderItemsService, OrderItem, ServiceResponse } from "../types";

/**
 * Enhanced Order Items Service with business logic
 */
export class OrderItemsService
  extends EnhancedBaseService<OrderItem>
  implements IOrderItemsService
{
  constructor() {
    super(new OrderItemsRepository(), "OrderItem");
  }

  protected getTableName(): string {
    return TABLE_NAMES.ORDER_ITEMS;
  }

  async getByOrder(orderId: string): Promise<ServiceResponse<OrderItem[]>> {
    try {
      this.logBusinessEvent("getByOrder", { orderId });

      const repository = this.repository as OrderItemsRepository;
      const result = await repository.findByOrder(orderId);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getByOrder"
        );
        return this.createResponse<OrderItem[]>(null, serviceError);
      }

      return this.createResponse<OrderItem[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByOrder");
      return this.createResponse<OrderItem[]>(null, serviceError);
    }
  }

  async getByListing(listingId: string): Promise<ServiceResponse<OrderItem[]>> {
    try {
      this.logBusinessEvent("getByListing", { listingId });

      const repository = this.repository as OrderItemsRepository;
      const result = await repository.findByListing(listingId);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getByListing"
        );
        return this.createResponse<OrderItem[]>(null, serviceError);
      }

      return this.createResponse<OrderItem[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByListing");
      return this.createResponse<OrderItem[]>(null, serviceError);
    }
  }

  async calculateOrderTotal(orderId: string): Promise<ServiceResponse<number>> {
    try {
      this.logBusinessEvent("calculateOrderTotal", { orderId });

      const repository = this.repository as OrderItemsRepository;
      const result = await repository.calculateOrderTotal(orderId);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "calculateOrderTotal"
        );
        return this.createResponse<number>(null, serviceError);
      }

      const total = result.data?.[0]?.total || 0;
      return this.createResponse<number>(Number(total), null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(
        error,
        "calculateOrderTotal"
      );
      return this.createResponse<number>(null, serviceError);
    }
  }
}
