/**
 * Enhanced entity services following industrial standard practices
 * Uses the Service Layer pattern with proper separation of concerns
 */

import { TABLE_NAMES } from "./config";
import { EnhancedBaseService } from "./database";
import {
  FarmTaskRepository,
  OrderRepository,
  ProductListingRepository,
  ProductRepository,
  ProfileRepository,
} from "./repository";
import {
  FarmTask,
  FilterOptions,
  IFarmTaskService,
  IOrderService,
  IProductService,
  IProfileService,
  Order,
  Product,
  ProductListing,
  Profile,
  ServiceResponse,
} from "./types";

/**
 * Enhanced Profile Service with business logic
 */
export class ProfileService
  extends EnhancedBaseService<Profile>
  implements IProfileService
{
  constructor() {
    super(new ProfileRepository(), "Profile");
  }

  protected getTableName(): string {
    return TABLE_NAMES.PROFILES;
  }

  async getByRole(role: string): Promise<ServiceResponse<Profile[]>> {
    try {
      this.logBusinessEvent("getByRole", { role });

      const filters: FilterOptions[] = [
        { column: "role", operator: "eq", value: role },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getByRole"
        );
        return this.createResponse<Profile[]>(null, serviceError);
      }

      return this.createResponse<Profile[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByRole");
      return this.createResponse<Profile[]>(null, serviceError);
    }
  }

  async getVerifiedFarmers(): Promise<ServiceResponse<Profile[]>> {
    try {
      this.logBusinessEvent("getVerifiedFarmers");

      const filters: FilterOptions[] = [
        { column: "role", operator: "eq", value: "farmer" },
        { column: "is_verified", operator: "eq", value: true },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getVerifiedFarmers"
        );
        return this.createResponse<Profile[]>(null, serviceError);
      }

      return this.createResponse<Profile[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(
        error,
        "getVerifiedFarmers"
      );
      return this.createResponse<Profile[]>(null, serviceError);
    }
  }

  async updateVerificationStatus(
    id: string,
    verified: boolean
  ): Promise<ServiceResponse<Profile>> {
    try {
      this.logBusinessEvent("updateVerificationStatus", { id, verified });

      const updateData = { is_verified: verified };
      return await this.update(id, updateData as Partial<Profile>);
    } catch (error) {
      const serviceError = this.handleRepositoryError(
        error,
        "updateVerificationStatus"
      );
      return this.createResponse<Profile>(null, serviceError);
    }
  }
}

/**
 * Enhanced Product Service with business logic
 */
export class ProductService
  extends EnhancedBaseService<Product>
  implements IProductService
{
  constructor() {
    super(new ProductRepository(), "Product");
  }

  protected getTableName(): string {
    return TABLE_NAMES.PRODUCTS;
  }

  async getByCategory(category: string): Promise<ServiceResponse<Product[]>> {
    try {
      this.logBusinessEvent("getByCategory", { category });

      const filters: FilterOptions[] = [
        { column: "category", operator: "eq", value: category },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getByCategory"
        );
        return this.createResponse<Product[]>(null, serviceError);
      }

      return this.createResponse<Product[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByCategory");
      return this.createResponse<Product[]>(null, serviceError);
    }
  }

  async searchProducts(query: string): Promise<ServiceResponse<Product[]>> {
    try {
      this.logBusinessEvent("searchProducts", { query });

      const filters: FilterOptions[] = [
        { column: "name", operator: "ilike", value: `%${query}%` },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "searchProducts"
        );
        return this.createResponse<Product[]>(null, serviceError);
      }

      return this.createResponse<Product[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "searchProducts");
      return this.createResponse<Product[]>(null, serviceError);
    }
  }

  async getByFarmer(farmerId: string): Promise<ServiceResponse<Product[]>> {
    try {
      this.logBusinessEvent("getByFarmer", { farmerId });

      // This would require a join or separate query through product listings
      // For now, return empty array - would need to implement through ProductListingService
      return this.createResponse<Product[]>([], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByFarmer");
      return this.createResponse<Product[]>(null, serviceError);
    }
  }
}

/**
 * Enhanced Product Listing Service
 */
export class ProductListingService extends EnhancedBaseService<ProductListing> {
  constructor() {
    super(new ProductListingRepository(), "ProductListing");
  }

  protected getTableName(): string {
    return TABLE_NAMES.PRODUCT_LISTINGS;
  }

  async getByFarmer(
    farmerId: string
  ): Promise<ServiceResponse<ProductListing[]>> {
    try {
      this.logBusinessEvent("getByFarmer", { farmerId });

      const repository = this.repository as ProductListingRepository;
      const result = await repository.findByFarmer(farmerId);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getByFarmer"
        );
        return this.createResponse<ProductListing[]>(null, serviceError);
      }

      return this.createResponse<ProductListing[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByFarmer");
      return this.createResponse<ProductListing[]>(null, serviceError);
    }
  }

  async getAvailable(): Promise<ServiceResponse<ProductListing[]>> {
    try {
      this.logBusinessEvent("getAvailable");

      const filters: FilterOptions[] = [
        { column: "status", operator: "eq", value: "available" },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getAvailable"
        );
        return this.createResponse<ProductListing[]>(null, serviceError);
      }

      return this.createResponse<ProductListing[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getAvailable");
      return this.createResponse<ProductListing[]>(null, serviceError);
    }
  }
}

/**
 * Enhanced Order Service with business logic
 */
export class OrderService
  extends EnhancedBaseService<Order>
  implements IOrderService
{
  constructor() {
    super(new OrderRepository(), "Order");
  }

  protected getTableName(): string {
    return TABLE_NAMES.ORDERS;
  }

  async getByBuyer(buyerId: string): Promise<ServiceResponse<Order[]>> {
    try {
      this.logBusinessEvent("getByBuyer", { buyerId });

      const filters: FilterOptions[] = [
        { column: "buyer_id", operator: "eq", value: buyerId },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getByBuyer"
        );
        return this.createResponse<Order[]>(null, serviceError);
      }

      return this.createResponse<Order[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByBuyer");
      return this.createResponse<Order[]>(null, serviceError);
    }
  }

  async getBySeller(sellerId: string): Promise<ServiceResponse<Order[]>> {
    try {
      this.logBusinessEvent("getBySeller", { sellerId });

      // This would require joining with product_listings to find orders for a seller
      // For now, return empty array - would need more complex query
      return this.createResponse<Order[]>([], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getBySeller");
      return this.createResponse<Order[]>(null, serviceError);
    }
  }

  async updateStatus(
    id: string,
    status: string
  ): Promise<ServiceResponse<Order>> {
    try {
      this.logBusinessEvent("updateStatus", { id, status });

      const updateData = { status };
      return await this.update(id, updateData as Partial<Order>);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "updateStatus");
      return this.createResponse<Order>(null, serviceError);
    }
  }

  async getByStatus(status: string): Promise<ServiceResponse<Order[]>> {
    try {
      this.logBusinessEvent("getByStatus", { status });

      const filters: FilterOptions[] = [
        { column: "status", operator: "eq", value: status },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getByStatus"
        );
        return this.createResponse<Order[]>(null, serviceError);
      }

      return this.createResponse<Order[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByStatus");
      return this.createResponse<Order[]>(null, serviceError);
    }
  }
}

/**
 * Enhanced Farm Task Service with business logic
 */
export class FarmTaskService
  extends EnhancedBaseService<FarmTask>
  implements IFarmTaskService
{
  constructor() {
    super(new FarmTaskRepository(), "FarmTask");
  }

  protected getTableName(): string {
    return TABLE_NAMES.FARM_TASKS;
  }

  async getByFarmer(farmerId: string): Promise<ServiceResponse<FarmTask[]>> {
    try {
      this.logBusinessEvent("getByFarmer", { farmerId });

      const filters: FilterOptions[] = [
        { column: "farmer_id", operator: "eq", value: farmerId },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getByFarmer"
        );
        return this.createResponse<FarmTask[]>(null, serviceError);
      }

      return this.createResponse<FarmTask[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByFarmer");
      return this.createResponse<FarmTask[]>(null, serviceError);
    }
  }

  async getByStatus(status: string): Promise<ServiceResponse<FarmTask[]>> {
    try {
      this.logBusinessEvent("getByStatus", { status });

      const filters: FilterOptions[] = [
        { column: "status", operator: "eq", value: status },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getByStatus"
        );
        return this.createResponse<FarmTask[]>(null, serviceError);
      }

      return this.createResponse<FarmTask[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByStatus");
      return this.createResponse<FarmTask[]>(null, serviceError);
    }
  }

  async getByPriority(priority: string): Promise<ServiceResponse<FarmTask[]>> {
    try {
      this.logBusinessEvent("getByPriority", { priority });

      // Priority field doesn't exist in current schema, return empty array
      return this.createResponse<FarmTask[]>([], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByPriority");
      return this.createResponse<FarmTask[]>(null, serviceError);
    }
  }

  async updateStatus(
    id: string,
    status: string
  ): Promise<ServiceResponse<FarmTask>> {
    try {
      this.logBusinessEvent("updateStatus", { id, status });

      const updateData = { status };
      return await this.update(id, updateData as Partial<FarmTask>);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "updateStatus");
      return this.createResponse<FarmTask>(null, serviceError);
    }
  }

  async getOverdue(): Promise<ServiceResponse<FarmTask[]>> {
    try {
      this.logBusinessEvent("getOverdue");

      const repository = this.repository as FarmTaskRepository;
      const result = await repository.findOverdue();

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getOverdue"
        );
        return this.createResponse<FarmTask[]>(null, serviceError);
      }

      return this.createResponse<FarmTask[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getOverdue");
      return this.createResponse<FarmTask[]>(null, serviceError);
    }
  }
}

// Export service instances for easy use
export const profileService = new ProfileService();
export const productService = new ProductService();
export const productListingService = new ProductListingService();
export const orderService = new OrderService();
export const farmTaskService = new FarmTaskService();
