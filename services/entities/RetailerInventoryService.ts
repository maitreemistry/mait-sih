/**
 * RetailerInventoryService
 * Service layer for retailer inventory management
 * Handles business logic and orchestrates repository operations
 */

import { TABLE_NAMES } from "../config";
import { EnhancedBaseService } from "../database";
import { logger } from "../logger";
import {
  RetailerInventory,
  RetailerInventoryRepository,
} from "../repositories/RetailerInventoryRepository";
import { ServiceErrorCode, ServiceResponse } from "../types";
import {
  RetailerInventoryAdjustmentData,
  RetailerInventoryCreateData,
  RetailerInventoryValidator,
} from "../validators/RetailerInventoryValidator";

export class RetailerInventoryService extends EnhancedBaseService<RetailerInventory> {
  private retailerInventoryValidator: RetailerInventoryValidator;

  constructor() {
    const repository = new RetailerInventoryRepository();
    super(repository, "RetailerInventory");
    this.retailerInventoryValidator = new RetailerInventoryValidator();
  }

  protected getTableName(): string {
    return TABLE_NAMES.RETAILER_INVENTORY;
  }

  /**
   * Create new inventory item
   */
  async createInventoryItem(
    createData: RetailerInventoryCreateData,
    userId?: string
  ): Promise<ServiceResponse<RetailerInventory>> {
    try {
      // Validate input data
      const validation =
        this.retailerInventoryValidator.validateCreate(createData);
      if (!validation.isValid) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Validation failed: ${validation.errors.join(", ")}`,
          validation.errors
        );
        return this.createResponse<RetailerInventory>(null, error);
      }

      // Check if inventory item already exists
      const existingItem = await (
        this.repository as RetailerInventoryRepository
      ).findByRetailerAndListing(createData.retailer_id, createData.listing_id);

      if (existingItem) {
        const error = this.createError(
          ServiceErrorCode.DUPLICATE_ERROR,
          "Inventory item for this listing already exists",
          ["Use update operation to modify existing inventory"]
        );
        return this.createResponse<RetailerInventory>(null, error);
      }

      // Verify retailer authorization if userId provided
      if (userId && createData.retailer_id !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot create inventory for other retailers"
        );
        return this.createResponse<RetailerInventory>(null, error);
      }

      // Create inventory item
      const createResult = await this.repository.create({
        ...createData,
        last_updated: new Date().toISOString(),
      });

      if (createResult.error) {
        logger.error("Error creating inventory item:", createResult.error);
        const error = this.handleRepositoryError(createResult.error, "create");
        return this.createResponse<RetailerInventory>(null, error);
      }

      logger.info(`Inventory item created:`, {
        itemId: createResult.data?.id,
        retailerId: createData.retailer_id,
        listingId: createData.listing_id,
        quantity: createData.quantity_on_hand,
      });

      return this.createResponse<RetailerInventory>(
        createResult.data,
        null,
        "Inventory item created successfully"
      );
    } catch (error) {
      logger.error("Error creating inventory item:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<RetailerInventory>(null, serviceError);
    }
  }

  /**
   * Get retailer inventory
   */
  async getRetailerInventory(
    retailerId: string,
    includeDetails: boolean = false,
    userId?: string,
    limit?: number
  ): Promise<ServiceResponse<RetailerInventory[]>> {
    try {
      // Verify retailer authorization if userId provided
      if (userId && retailerId !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot access inventory for other retailers"
        );
        return this.createResponse<RetailerInventory[]>(null, error);
      }

      const inventory = await (
        this.repository as RetailerInventoryRepository
      ).findByRetailer(retailerId, includeDetails, limit);

      return this.createResponse<RetailerInventory[]>(
        inventory,
        null,
        "Retailer inventory retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting retailer inventory:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<RetailerInventory[]>(null, serviceError);
    }
  }

  /**
   * Update inventory quantity
   */
  async updateQuantity(
    itemId: string,
    quantityOnHand: number,
    userId?: string
  ): Promise<ServiceResponse<RetailerInventory>> {
    try {
      // Validate quantity
      const validation = this.retailerInventoryValidator.validateUpdate({
        quantity_on_hand: quantityOnHand,
      });
      if (!validation.isValid) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Validation failed: ${validation.errors.join(", ")}`,
          validation.errors
        );
        return this.createResponse<RetailerInventory>(null, error);
      }

      // Check if item exists and get current data
      const existingItemResult = await this.repository.findById(itemId);
      if (existingItemResult.error || !existingItemResult.data) {
        const error = this.createError(
          ServiceErrorCode.NOT_FOUND,
          "Inventory item not found"
        );
        return this.createResponse<RetailerInventory>(null, error);
      }

      const existingItem = existingItemResult.data;

      // Verify retailer authorization if userId provided
      if (userId && existingItem.retailer_id !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot update inventory for other retailers"
        );
        return this.createResponse<RetailerInventory>(null, error);
      }

      // Update quantity
      const updatedItem = await (
        this.repository as RetailerInventoryRepository
      ).updateQuantity(itemId, quantityOnHand);

      logger.info(`Inventory quantity updated:`, {
        itemId,
        retailerId: existingItem.retailer_id,
        oldQuantity: existingItem.quantity_on_hand,
        newQuantity: quantityOnHand,
      });

      return this.createResponse<RetailerInventory>(
        updatedItem,
        null,
        "Inventory quantity updated successfully"
      );
    } catch (error) {
      logger.error("Error updating inventory quantity:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<RetailerInventory>(null, serviceError);
    }
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(
    retailerId: string,
    threshold: number = 10,
    includeDetails: boolean = false,
    userId?: string
  ): Promise<ServiceResponse<RetailerInventory[]>> {
    try {
      // Verify retailer authorization if userId provided
      if (userId && retailerId !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot access inventory for other retailers"
        );
        return this.createResponse<RetailerInventory[]>(null, error);
      }

      // Validate threshold
      const thresholdValidation =
        this.retailerInventoryValidator.validateLowStockThreshold(threshold);
      if (!thresholdValidation.isValid) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Invalid threshold: ${thresholdValidation.errors.join(", ")}`
        );
        return this.createResponse<RetailerInventory[]>(null, error);
      }

      const lowStockItems = await (
        this.repository as RetailerInventoryRepository
      ).findLowStock(retailerId, threshold, includeDetails);

      return this.createResponse<RetailerInventory[]>(
        lowStockItems,
        null,
        "Low stock items retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting low stock items:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<RetailerInventory[]>(null, serviceError);
    }
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats(
    retailerId: string,
    userId?: string
  ): Promise<
    ServiceResponse<{
      total_items: number;
      low_stock_items: number;
      out_of_stock_items: number;
      total_value: number;
    }>
  > {
    try {
      // Verify retailer authorization if userId provided
      if (userId && retailerId !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot access inventory stats for other retailers"
        );
        return this.createResponse<{
          total_items: number;
          low_stock_items: number;
          out_of_stock_items: number;
          total_value: number;
        }>(null, error);
      }

      const stats = await (
        this.repository as RetailerInventoryRepository
      ).getInventoryStats(retailerId);

      return this.createResponse<{
        total_items: number;
        low_stock_items: number;
        out_of_stock_items: number;
        total_value: number;
      }>(stats, null, "Inventory statistics retrieved successfully");
    } catch (error) {
      logger.error("Error getting inventory stats:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<{
        total_items: number;
        low_stock_items: number;
        out_of_stock_items: number;
        total_value: number;
      }>(null, serviceError);
    }
  }

  /**
   * Adjust inventory quantity (add or subtract)
   */
  async adjustQuantity(
    itemId: string,
    adjustmentData: RetailerInventoryAdjustmentData,
    userId?: string
  ): Promise<ServiceResponse<RetailerInventory>> {
    try {
      // Validate adjustment data
      const validation =
        this.retailerInventoryValidator.validateAdjustment(adjustmentData);
      if (!validation.isValid) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Validation failed: ${validation.errors.join(", ")}`,
          validation.errors
        );
        return this.createResponse<RetailerInventory>(null, error);
      }

      // Check if item exists
      const existingItemResult = await this.repository.findById(itemId);
      if (existingItemResult.error || !existingItemResult.data) {
        const error = this.createError(
          ServiceErrorCode.NOT_FOUND,
          "Inventory item not found"
        );
        return this.createResponse<RetailerInventory>(null, error);
      }

      const existingItem = existingItemResult.data;

      // Verify retailer authorization if userId provided
      if (userId && existingItem.retailer_id !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot adjust inventory for other retailers"
        );
        return this.createResponse<RetailerInventory>(null, error);
      }

      // Check if adjustment would result in negative inventory
      const newQuantity =
        existingItem.quantity_on_hand + adjustmentData.adjustment;
      if (newQuantity < 0) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Insufficient inventory. Current: ${existingItem.quantity_on_hand}, Adjustment: ${adjustmentData.adjustment}`
        );
        return this.createResponse<RetailerInventory>(null, error);
      }

      // Apply adjustment
      const updatedItem = await (
        this.repository as RetailerInventoryRepository
      ).adjustQuantity(itemId, adjustmentData.adjustment);

      logger.info(`Inventory quantity adjusted:`, {
        itemId,
        retailerId: existingItem.retailer_id,
        oldQuantity: existingItem.quantity_on_hand,
        adjustment: adjustmentData.adjustment,
        newQuantity: updatedItem.quantity_on_hand,
        reason: adjustmentData.reason,
      });

      return this.createResponse<RetailerInventory>(
        updatedItem,
        null,
        "Inventory quantity adjusted successfully"
      );
    } catch (error) {
      logger.error("Error adjusting inventory quantity:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<RetailerInventory>(null, serviceError);
    }
  }

  /**
   * Delete inventory item
   */
  async deleteInventoryItem(
    itemId: string,
    userId?: string
  ): Promise<ServiceResponse<void>> {
    try {
      // Check if item exists
      const existingItemResult = await this.repository.findById(itemId);
      if (existingItemResult.error || !existingItemResult.data) {
        const error = this.createError(
          ServiceErrorCode.NOT_FOUND,
          "Inventory item not found"
        );
        return this.createResponse<void>(null, error);
      }

      const existingItem = existingItemResult.data;

      // Verify retailer authorization if userId provided
      if (userId && existingItem.retailer_id !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot delete inventory for other retailers"
        );
        return this.createResponse<void>(null, error);
      }

      // Delete inventory item
      const deleteResult = await this.repository.delete(itemId);

      if (deleteResult.error) {
        logger.error("Error deleting inventory item:", deleteResult.error);
        const error = this.handleRepositoryError(deleteResult.error, "delete");
        return this.createResponse<void>(null, error);
      }

      logger.info(`Inventory item deleted:`, {
        itemId,
        retailerId: existingItem.retailer_id,
        listingId: existingItem.listing_id,
      });

      return this.createResponse<void>(
        undefined,
        null,
        "Inventory item deleted successfully"
      );
    } catch (error) {
      logger.error("Error deleting inventory item:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<void>(null, serviceError);
    }
  }
}
