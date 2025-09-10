/**
 * RetailerInventoryRepository
 * Repository for managing retailer inventory operations
 * Handles CRUD operations and business logic for retailer stock management
 */

import { supabase } from "../../lib/supabase/client";
import { TABLE_NAMES } from "../config";
import { logger } from "../logger";
import { BaseRepository } from "./BaseRepository";

// RetailerInventory interface matching database schema
export interface RetailerInventory {
  id: string;
  retailer_id: string;
  listing_id: string;
  quantity_on_hand: number;
  last_updated: string;

  // Joined data from related tables
  listing?: {
    id: string;
    title: string;
    price_per_unit: number;
    unit: string;
    farmer_id: string;
    status: string;
  };
  retailer?: {
    id: string;
    full_name: string;
    business_name: string;
    email: string;
  };
}

export class RetailerInventoryRepository extends BaseRepository<RetailerInventory> {
  constructor() {
    super(TABLE_NAMES.RETAILER_INVENTORY);
  }

  /**
   * Find inventory items by retailer ID
   */
  async findByRetailer(
    retailerId: string,
    includeDetails: boolean = false,
    limit?: number
  ): Promise<RetailerInventory[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          includeDetails
            ? `
              *,
              listing:product_listings(
                id,
                title,
                price_per_unit,
                unit,
                farmer_id,
                status
              ),
              retailer:profiles(
                id,
                full_name,
                business_name,
                email
              )
            `
            : "*"
        )
        .eq("retailer_id", retailerId)
        .order("last_updated", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding inventory by retailer:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByRetailer:`, error as Error);
      throw error;
    }
  }

  /**
   * Find inventory items by listing ID
   */
  async findByListing(
    listingId: string,
    includeDetails: boolean = false
  ): Promise<RetailerInventory[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          includeDetails
            ? `
              *,
              listing:product_listings(
                id,
                title,
                price_per_unit,
                unit,
                farmer_id,
                status
              ),
              retailer:profiles(
                id,
                full_name,
                business_name,
                email
              )
            `
            : "*"
        )
        .eq("listing_id", listingId)
        .order("quantity_on_hand", { ascending: false });

      if (error) {
        logger.error(`Error finding inventory by listing:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByListing:`, error as Error);
      throw error;
    }
  }

  /**
   * Find specific inventory item by retailer and listing
   */
  async findByRetailerAndListing(
    retailerId: string,
    listingId: string,
    includeDetails: boolean = false
  ): Promise<RetailerInventory | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          includeDetails
            ? `
              *,
              listing:product_listings(
                id,
                title,
                price_per_unit,
                unit,
                farmer_id,
                status
              ),
              retailer:profiles(
                id,
                full_name,
                business_name,
                email
              )
            `
            : "*"
        )
        .eq("retailer_id", retailerId)
        .eq("listing_id", listingId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No data found
        }
        logger.error(`Error finding inventory by retailer and listing:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Error in findByRetailerAndListing:`, error as Error);
      throw error;
    }
  }

  /**
   * Find low stock items for a retailer
   */
  async findLowStock(
    retailerId: string,
    threshold: number = 10,
    includeDetails: boolean = false
  ): Promise<RetailerInventory[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          includeDetails
            ? `
              *,
              listing:product_listings(
                id,
                title,
                price_per_unit,
                unit,
                farmer_id,
                status
              ),
              retailer:profiles(
                id,
                full_name,
                business_name,
                email
              )
            `
            : "*"
        )
        .eq("retailer_id", retailerId)
        .lt("quantity_on_hand", threshold)
        .order("quantity_on_hand", { ascending: true });

      if (error) {
        logger.error(`Error finding low stock items:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findLowStock:`, error as Error);
      throw error;
    }
  }

  /**
   * Update inventory quantity
   */
  async updateQuantity(
    id: string,
    quantityOnHand: number
  ): Promise<RetailerInventory> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          quantity_on_hand: quantityOnHand,
          last_updated: new Date().toISOString(),
        } as never)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error(`Error updating inventory quantity:`, error);
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from update operation");
      }

      return data;
    } catch (error) {
      logger.error(`Error in updateQuantity:`, error as Error);
      throw error;
    }
  }

  /**
   * Adjust inventory quantity (add or subtract)
   */
  async adjustQuantity(
    id: string,
    adjustment: number
  ): Promise<RetailerInventory> {
    try {
      // First get current quantity
      const current = await this.findById(id);
      if (!current) {
        throw new Error("Inventory item not found");
      }

      const newQuantity = Math.max(0, current.quantity_on_hand + adjustment);

      return await this.updateQuantity(id, newQuantity);
    } catch (error) {
      logger.error(`Error in adjustQuantity:`, error as Error);
      throw error;
    }
  }

  /**
   * Get inventory statistics for a retailer
   */
  async getInventoryStats(retailerId: string): Promise<{
    total_items: number;
    low_stock_items: number;
    out_of_stock_items: number;
    total_value: number;
  }> {
    try {
      const { data, error } = (await supabase
        .from(this.tableName)
        .select(
          `
          quantity_on_hand,
          listing:product_listings(price_per_unit)
        `
        )
        .eq("retailer_id", retailerId)) as {
        data:
          | {
              quantity_on_hand: number;
              listing: {
                price_per_unit: number;
              };
            }[]
          | null;
        error: any;
      };

      if (error) {
        logger.error(`Error getting inventory stats:`, error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          total_items: 0,
          low_stock_items: 0,
          out_of_stock_items: 0,
          total_value: 0,
        };
      }

      const totalItems = data.length;
      const lowStockItems = data.filter(
        (item) => item.quantity_on_hand > 0 && item.quantity_on_hand <= 10
      ).length;
      const outOfStockItems = data.filter(
        (item) => item.quantity_on_hand === 0
      ).length;
      const totalValue = data.reduce((sum, item) => {
        return (
          sum + item.quantity_on_hand * (item.listing?.price_per_unit || 0)
        );
      }, 0);

      return {
        total_items: totalItems,
        low_stock_items: lowStockItems,
        out_of_stock_items: outOfStockItems,
        total_value: Math.round(totalValue * 100) / 100,
      };
    } catch (error) {
      logger.error(`Error in getInventoryStats:`, error as Error);
      throw error;
    }
  }

  /**
   * Get popular products for a retailer based on quantity movement
   */
  async getPopularProducts(
    retailerId: string,
    limit: number = 10
  ): Promise<
    {
      listing_id: string;
      listing_title: string;
      total_quantity: number;
    }[]
  > {
    try {
      const { data, error } = (await supabase
        .from(this.tableName)
        .select(
          `
          listing_id,
          quantity_on_hand,
          listing:product_listings(title)
        `
        )
        .eq("retailer_id", retailerId)
        .order("quantity_on_hand", { ascending: false })
        .limit(limit)) as {
        data:
          | {
              listing_id: string;
              quantity_on_hand: number;
              listing: {
                title: string;
              };
            }[]
          | null;
        error: any;
      };

      if (error) {
        logger.error(`Error getting popular products:`, error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((item) => ({
        listing_id: item.listing_id,
        listing_title: item.listing?.title || "Unknown Product",
        total_quantity: item.quantity_on_hand,
      }));
    } catch (error) {
      logger.error(`Error in getPopularProducts:`, error as Error);
      throw error;
    }
  }

  /**
   * Bulk update inventory quantities
   */
  async bulkUpdateQuantities(
    updates: { id: string; quantity_on_hand: number }[]
  ): Promise<RetailerInventory[]> {
    try {
      const results: RetailerInventory[] = [];

      for (const update of updates) {
        const result = await this.updateQuantity(
          update.id,
          update.quantity_on_hand
        );
        results.push(result);
      }

      return results;
    } catch (error) {
      logger.error(`Error in bulkUpdateQuantities:`, error as Error);
      throw error;
    }
  }
}
