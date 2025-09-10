/**
 * DisputesRepository
 * Repository for managing dispute operations
 * Handles CRUD operations for order disputes and resolution management
 */

import { supabase } from "../../lib/supabase/client";
import { TABLE_NAMES } from "../config";
import { logger } from "../logger";
import { BaseRepository } from "./BaseRepository";

// Dispute interface matching database schema
export interface Dispute {
  id: string;
  order_id: string;
  claimant_id: string;
  respondent_id: string;
  reason: string;
  status: "open" | "under_review" | "resolved" | "closed";
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export class DisputesRepository extends BaseRepository<Dispute> {
  constructor() {
    super(TABLE_NAMES.DISPUTES);
  }

  /**
   * Find disputes by order ID
   */
  async findByOrderId(orderId: string): Promise<Dispute[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error(`Error finding disputes by order ID:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByOrderId:`, error as Error);
      throw error;
    }
  }

  /**
   * Find disputes by claimant (user who filed the dispute)
   */
  async findByClaimant(claimantId: string, limit?: number): Promise<Dispute[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .eq("claimant_id", claimantId)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding disputes by claimant:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByClaimant:`, error as Error);
      throw error;
    }
  }

  /**
   * Find disputes by respondent (user who dispute is against)
   */
  async findByRespondent(
    respondentId: string,
    limit?: number
  ): Promise<Dispute[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .eq("respondent_id", respondentId)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding disputes by respondent:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByRespondent:`, error as Error);
      throw error;
    }
  }

  /**
   * Find disputes by status
   */
  async findByStatus(
    status: "open" | "under_review" | "resolved" | "closed",
    limit?: number,
    offset?: number
  ): Promise<Dispute[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding disputes by status:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByStatus:`, error as Error);
      throw error;
    }
  }

  /**
   * Find disputes involving a specific user (as either claimant or respondent)
   */
  async findByUser(userId: string, limit?: number): Promise<Dispute[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .or(`claimant_id.eq.${userId},respondent_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding disputes by user:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByUser:`, error as Error);
      throw error;
    }
  }

  /**
   * Find disputes by date range
   */
  async findByDateRange(
    startDate: string,
    endDate: string,
    status?: string,
    limit?: number
  ): Promise<Dispute[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding disputes by date range:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByDateRange:`, error as Error);
      throw error;
    }
  }

  /**
   * Update dispute status
   */
  async updateStatus(
    id: string,
    status: "open" | "under_review" | "resolved" | "closed",
    resolutionNotes?: string
  ): Promise<Dispute> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (resolutionNotes) {
        updateData.resolution_notes = resolutionNotes;
      }

      if (status === "resolved" || status === "closed") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData as never)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error(`Error updating dispute status:`, error);
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from update operation");
      }

      return data;
    } catch (error) {
      logger.error(`Error in updateStatus:`, error as Error);
      throw error;
    }
  }

  /**
   * Add resolution notes to a dispute
   */
  async addResolutionNotes(id: string, notes: string): Promise<Dispute> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          resolution_notes: notes,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error(`Error adding resolution notes:`, error);
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from update operation");
      }

      return data;
    } catch (error) {
      logger.error(`Error in addResolutionNotes:`, error as Error);
      throw error;
    }
  }

  /**
   * Get dispute statistics
   */
  async getDisputeStats(): Promise<{
    total_disputes: number;
    open_disputes: number;
    under_review_disputes: number;
    resolved_disputes: number;
    closed_disputes: number;
    average_resolution_time_days?: number;
  }> {
    try {
      // Get all disputes with status counts
      const { data, error } = await supabase
        .from(this.tableName)
        .select("status, created_at, resolved_at");

      if (error) {
        logger.error(`Error getting dispute stats:`, error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          total_disputes: 0,
          open_disputes: 0,
          under_review_disputes: 0,
          resolved_disputes: 0,
          closed_disputes: 0,
        };
      }

      // Calculate statistics
      const stats = {
        total_disputes: data.length,
        open_disputes: 0,
        under_review_disputes: 0,
        resolved_disputes: 0,
        closed_disputes: 0,
        average_resolution_time_days: undefined as number | undefined,
      };

      let totalResolutionTime = 0;
      let resolvedCount = 0;

      data.forEach((dispute: any) => {
        switch (dispute.status) {
          case "open":
            stats.open_disputes++;
            break;
          case "under_review":
            stats.under_review_disputes++;
            break;
          case "resolved":
            stats.resolved_disputes++;
            break;
          case "closed":
            stats.closed_disputes++;
            break;
        }

        // Calculate resolution time for resolved/closed disputes
        if (
          (dispute.status === "resolved" || dispute.status === "closed") &&
          dispute.resolved_at
        ) {
          const createdAt = new Date(dispute.created_at);
          const resolvedAt = new Date(dispute.resolved_at);
          const resolutionTimeMs = resolvedAt.getTime() - createdAt.getTime();
          const resolutionTimeDays = resolutionTimeMs / (1000 * 60 * 60 * 24);
          totalResolutionTime += resolutionTimeDays;
          resolvedCount++;
        }
      });

      if (resolvedCount > 0) {
        stats.average_resolution_time_days = parseFloat(
          (totalResolutionTime / resolvedCount).toFixed(2)
        );
      }

      return stats;
    } catch (error) {
      logger.error(`Error in getDisputeStats:`, error as Error);
      throw error;
    }
  }

  /**
   * Check if a user has any active disputes for an order
   */
  async hasActiveDisputeForOrder(
    orderId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("order_id", orderId)
        .or(`claimant_id.eq.${userId},respondent_id.eq.${userId}`)
        .in("status", ["open", "under_review"]);

      if (error) {
        logger.error(`Error checking active disputes:`, error);
        throw error;
      }

      return (count || 0) > 0;
    } catch (error) {
      logger.error(`Error in hasActiveDisputeForOrder:`, error as Error);
      throw error;
    }
  }

  /**
   * Get disputes with order and user details (with joins)
   */
  async findWithDetails(filters?: {
    status?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          orders!inner(id, status, total_amount),
          claimant:profiles!claimant_id(id, full_name, company_name),
          respondent:profiles!respondent_id(id, full_name, company_name)
        `
        )
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.userId) {
        query = query.or(
          `claimant_id.eq.${filters.userId},respondent_id.eq.${filters.userId}`
        );
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 50) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding disputes with details:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findWithDetails:`, error as Error);
      throw error;
    }
  }
}
