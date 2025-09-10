import { TABLE_NAMES } from "../config";
import { EnhancedBaseService } from "../database";
import { ProductListingRepository } from "../repositories";
import { FilterOptions, ProductListing, ServiceResponse } from "../types";

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
