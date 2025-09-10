import { supabase } from "../../lib/supabase/client";
import { logger } from "../logger";
import { BaseRepository } from "./BaseRepository";

export interface Negotiation {
  id: string;
  order_id: string;
  farmer_id: string;
  buyer_id: string;
  product_id: string;
  original_price: number;
  proposed_price: number;
  final_price?: number;
  status: string;
  farmer_notes?: string;
  buyer_notes?: string;
  counter_offer_count: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export class NegotiationsRepository extends BaseRepository<Negotiation> {
  protected tableName = "negotiations";

  /**
   * Find negotiations by order ID
   */
  async findByOrder(orderId: string): Promise<Negotiation[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            status,
            total_amount
          ),
          product:products(
            id,
            name,
            category,
            unit
          ),
          farmer:profiles!negotiations_farmer_id_fkey(
            id,
            name,
            phone
          ),
          buyer:profiles!negotiations_buyer_id_fkey(
            id,
            name,
            phone
          )
        `
        )
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error(`Error finding negotiations by order ${orderId}:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByOrder:`, error as Error);
      throw error;
    }
  }

  /**
   * Find negotiations by farmer ID
   */
  async findByFarmer(
    farmerId: string,
    status?: string,
    limit: number = 50
  ): Promise<Negotiation[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            status
          ),
          product:products(
            id,
            name,
            category,
            price_per_unit,
            unit
          ),
          buyer:profiles!negotiations_buyer_id_fkey(
            id,
            name,
            phone,
            location
          )
        `
        )
        .eq("farmer_id", farmerId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          `Error finding negotiations for farmer ${farmerId}:`,
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByFarmer:`, error as Error);
      throw error;
    }
  }

  /**
   * Find negotiations by buyer ID
   */
  async findByBuyer(
    buyerId: string,
    status?: string,
    limit: number = 50
  ): Promise<Negotiation[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            status
          ),
          product:products(
            id,
            name,
            category,
            price_per_unit,
            unit
          ),
          farmer:profiles!negotiations_farmer_id_fkey(
            id,
            name,
            phone,
            location
          )
        `
        )
        .eq("buyer_id", buyerId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Error finding negotiations for buyer ${buyerId}:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByBuyer:`, error as Error);
      throw error;
    }
  }

  /**
   * Find negotiations by status
   */
  async findByStatus(
    status: string,
    limit: number = 50
  ): Promise<Negotiation[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            status
          ),
          product:products(
            id,
            name,
            category,
            price_per_unit
          ),
          farmer:profiles!negotiations_farmer_id_fkey(
            id,
            name,
            phone
          ),
          buyer:profiles!negotiations_buyer_id_fkey(
            id,
            name,
            phone
          )
        `
        )
        .eq("status", status)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Error finding negotiations by status ${status}:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByStatus:`, error as Error);
      throw error;
    }
  }

  /**
   * Find active negotiations (pending or counter-offered)
   */
  async findActiveNegotiations(limit: number = 100): Promise<Negotiation[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            status
          ),
          product:products(
            id,
            name,
            category
          ),
          farmer:profiles!negotiations_farmer_id_fkey(
            id,
            name
          ),
          buyer:profiles!negotiations_buyer_id_fkey(
            id,
            name
          )
        `
        )
        .in("status", ["pending", "counter_offered"])
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Error finding active negotiations:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findActiveNegotiations:`, error as Error);
      throw error;
    }
  }

  /**
   * Find expired negotiations
   */
  async findExpiredNegotiations(): Promise<Negotiation[]> {
    try {
      const currentTime = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number
          ),
          farmer:profiles!negotiations_farmer_id_fkey(
            id,
            name
          ),
          buyer:profiles!negotiations_buyer_id_fkey(
            id,
            name
          )
        `
        )
        .lt("expires_at", currentTime)
        .in("status", ["pending", "counter_offered"])
        .order("expires_at", { ascending: true });

      if (error) {
        logger.error(`Error finding expired negotiations:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findExpiredNegotiations:`, error as Error);
      throw error;
    }
  }

  /**
   * Update negotiation status
   */
  async updateStatus(
    negotiationId: string,
    status: string,
    finalPrice?: number
  ): Promise<{ data: Negotiation | null; error: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (finalPrice !== undefined) {
        updateData.final_price = finalPrice;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData as never)
        .eq("id", negotiationId)
        .select()
        .single();

      if (error) {
        logger.error(`Error updating negotiation status:`, error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error(`Error in updateStatus:`, error as Error);
      return { data: null, error };
    }
  }

  /**
   * Create counter offer
   */
  async createCounterOffer(
    negotiationId: string,
    newProposedPrice: number,
    notes?: string,
    newExpiresAt?: string
  ): Promise<{ data: Negotiation | null; error: any }> {
    try {
      // First get current counter_offer_count
      const { data: currentData, error: fetchError } = await supabase
        .from(this.tableName)
        .select("counter_offer_count")
        .eq("id", negotiationId)
        .single();

      if (fetchError) {
        logger.error(`Error fetching current negotiation:`, fetchError);
        return { data: null, error: fetchError };
      }

      const newCounterOfferCount =
        ((currentData as any)?.counter_offer_count || 0) + 1;

      const updateData: any = {
        proposed_price: newProposedPrice,
        status: "counter_offered",
        counter_offer_count: newCounterOfferCount,
        updated_at: new Date().toISOString(),
      };

      if (notes) {
        updateData.farmer_notes = notes;
      }

      if (newExpiresAt) {
        updateData.expires_at = newExpiresAt;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData as never)
        .eq("id", negotiationId)
        .select()
        .single();

      if (error) {
        logger.error(`Error creating counter offer:`, error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error(`Error in createCounterOffer:`, error as Error);
      return { data: null, error };
    }
  }

  /**
   * Get negotiation statistics for a date range
   */
  async getNegotiationStats(
    startDate: string,
    endDate: string
  ): Promise<{
    total_negotiations: number;
    accepted: number;
    rejected: number;
    pending: number;
    expired: number;
    average_discount_percentage: number;
    average_rounds: number;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("status, original_price, final_price, counter_offer_count")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) {
        logger.error(`Error getting negotiation stats:`, error);
        throw error;
      }

      const stats = {
        total_negotiations: data.length,
        accepted: 0,
        rejected: 0,
        pending: 0,
        expired: 0,
        average_discount_percentage: 0,
        average_rounds: 0,
      };

      let totalDiscount = 0;
      let discountCount = 0;
      let totalRounds = 0;

      data.forEach((negotiation: any) => {
        switch (negotiation.status) {
          case "accepted":
            stats.accepted++;
            if (negotiation.final_price && negotiation.original_price) {
              const discount =
                ((negotiation.original_price - negotiation.final_price) /
                  negotiation.original_price) *
                100;
              totalDiscount += discount;
              discountCount++;
            }
            break;
          case "rejected":
            stats.rejected++;
            break;
          case "pending":
          case "counter_offered":
            stats.pending++;
            break;
          case "expired":
            stats.expired++;
            break;
        }

        totalRounds += (negotiation.counter_offer_count || 0) + 1;
      });

      if (discountCount > 0) {
        stats.average_discount_percentage = Math.round(
          totalDiscount / discountCount
        );
      }

      if (data.length > 0) {
        stats.average_rounds = Math.round(totalRounds / data.length);
      }

      return stats;
    } catch (error) {
      logger.error(`Error in getNegotiationStats:`, error as Error);
      throw error;
    }
  }

  /**
   * Find negotiations about to expire (within 24 hours)
   */
  async findNegotiationsExpiringSoon(): Promise<Negotiation[]> {
    try {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number
          ),
          product:products(
            id,
            name
          ),
          farmer:profiles!negotiations_farmer_id_fkey(
            id,
            name,
            phone
          ),
          buyer:profiles!negotiations_buyer_id_fkey(
            id,
            name,
            phone
          )
        `
        )
        .gte("expires_at", now.toISOString())
        .lte("expires_at", next24Hours.toISOString())
        .in("status", ["pending", "counter_offered"])
        .order("expires_at", { ascending: true });

      if (error) {
        logger.error(`Error finding negotiations expiring soon:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findNegotiationsExpiringSoon:`, error as Error);
      throw error;
    }
  }

  /**
   * Search negotiations by various criteria
   */
  async searchNegotiations(
    searchTerm: string,
    status?: string,
    farmerId?: string,
    buyerId?: string,
    limit: number = 20
  ): Promise<Negotiation[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number
          ),
          product:products(
            id,
            name,
            category
          ),
          farmer:profiles!negotiations_farmer_id_fkey(
            id,
            name
          ),
          buyer:profiles!negotiations_buyer_id_fkey(
            id,
            name
          )
        `
        )
        .or(
          `farmer_notes.ilike.%${searchTerm}%,buyer_notes.ilike.%${searchTerm}%`
        );

      if (status) {
        query = query.eq("status", status);
      }

      if (farmerId) {
        query = query.eq("farmer_id", farmerId);
      }

      if (buyerId) {
        query = query.eq("buyer_id", buyerId);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Error searching negotiations:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in searchNegotiations:`, error as Error);
      throw error;
    }
  }

  /**
   * Find negotiations by product
   */
  async findByProduct(
    productId: string,
    limit: number = 50
  ): Promise<Negotiation[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            quantity,
            status
          ),
          farmer:profiles!negotiations_farmer_id_fkey(
            id,
            name,
            phone
          ),
          buyer:profiles!negotiations_buyer_id_fkey(
            id,
            name,
            phone
          )
        `
        )
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          `Error finding negotiations for product ${productId}:`,
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByProduct:`, error as Error);
      throw error;
    }
  }
}
