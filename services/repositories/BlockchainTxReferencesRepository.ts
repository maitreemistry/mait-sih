/**
 * BlockchainTxReferencesRepository
 * Repository for managing blockchain transaction reference operations
 * Handles CRUD operations and business logic for blockchain transaction tracking
 */

import { supabase } from "../../lib/supabase/client";
import { TABLE_NAMES } from "../config";
import { logger } from "../logger";
import { BaseRepository } from "./BaseRepository";

// BlockchainTxReference interface matching database schema
export interface BlockchainTxReference {
  id: string;
  related_table: string;
  related_id: string;
  tx_hash: string;
  tx_timestamp?: string;
  created_at: string;
}

export class BlockchainTxReferencesRepository extends BaseRepository<BlockchainTxReference> {
  constructor() {
    super(TABLE_NAMES.BLOCKCHAIN_TX_REFERENCES);
  }

  /**
   * Find transaction references by related entity
   */
  async findByRelatedEntity(
    relatedTable: string,
    relatedId: string,
    limit?: number
  ): Promise<BlockchainTxReference[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .eq("related_table", relatedTable)
        .eq("related_id", relatedId)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding tx references by related entity:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByRelatedEntity:`, error as Error);
      throw error;
    }
  }

  /**
   * Find transaction reference by transaction hash
   */
  async findByTxHash(txHash: string): Promise<BlockchainTxReference | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("tx_hash", txHash)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No data found
        }
        logger.error(`Error finding tx reference by hash:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Error in findByTxHash:`, error as Error);
      throw error;
    }
  }

  /**
   * Find transaction references by table
   */
  async findByTable(
    relatedTable: string,
    limit?: number,
    offset?: number
  ): Promise<BlockchainTxReference[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .eq("related_table", relatedTable)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding tx references by table:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByTable:`, error as Error);
      throw error;
    }
  }

  /**
   * Find transaction references by date range
   */
  async findByDateRange(
    startDate: string,
    endDate: string,
    relatedTable?: string,
    limit?: number
  ): Promise<BlockchainTxReference[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false });

      if (relatedTable) {
        query = query.eq("related_table", relatedTable);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding tx references by date range:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByDateRange:`, error as Error);
      throw error;
    }
  }

  /**
   * Find transaction references by transaction timestamp range
   */
  async findByTxTimestampRange(
    startTimestamp: string,
    endTimestamp: string,
    relatedTable?: string,
    limit?: number
  ): Promise<BlockchainTxReference[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .gte("tx_timestamp", startTimestamp)
        .lte("tx_timestamp", endTimestamp)
        .order("tx_timestamp", { ascending: false });

      if (relatedTable) {
        query = query.eq("related_table", relatedTable);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(
          `Error finding tx references by tx timestamp range:`,
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByTxTimestampRange:`, error as Error);
      throw error;
    }
  }

  /**
   * Get blockchain statistics
   */
  async getBlockchainStats(relatedTable?: string): Promise<{
    total_transactions: number;
    unique_entities: number;
    latest_transaction?: BlockchainTxReference;
    table_breakdown: { table_name: string; transaction_count: number }[];
  }> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("related_table, related_id, created_at");

      if (relatedTable) {
        query = query.eq("related_table", relatedTable);
      }

      const { data, error } = (await query) as {
        data:
          | {
              related_table: string;
              related_id: string;
              created_at: string;
            }[]
          | null;
        error: any;
      };

      if (error) {
        logger.error(`Error getting blockchain stats:`, error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          total_transactions: 0,
          unique_entities: 0,
          table_breakdown: [],
        };
      }

      // Calculate stats
      const totalTransactions = data.length;
      const uniqueEntities = new Set(
        data.map((item) => `${item.related_table}:${item.related_id}`)
      ).size;

      // Get table breakdown
      const tableBreakdown: { [key: string]: number } = {};
      data.forEach((item) => {
        tableBreakdown[item.related_table] =
          (tableBreakdown[item.related_table] || 0) + 1;
      });

      const tableBreakdownArray = Object.entries(tableBreakdown).map(
        ([table, count]) => ({
          table_name: table,
          transaction_count: count,
        })
      );

      // Get latest transaction
      const latestResult = await supabase
        .from(this.tableName)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      const latestTransaction = latestResult.data?.[0] || undefined;

      return {
        total_transactions: totalTransactions,
        unique_entities: uniqueEntities,
        latest_transaction: latestTransaction,
        table_breakdown: tableBreakdownArray,
      };
    } catch (error) {
      logger.error(`Error in getBlockchainStats:`, error as Error);
      throw error;
    }
  }

  /**
   * Get transaction count for an entity
   */
  async getTransactionCount(
    relatedTable: string,
    relatedId: string
  ): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("related_table", relatedTable)
        .eq("related_id", relatedId);

      if (error) {
        logger.error(`Error getting transaction count:`, error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      logger.error(`Error in getTransactionCount:`, error as Error);
      throw error;
    }
  }

  /**
   * Check if transaction hash already exists
   */
  async txHashExists(txHash: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("tx_hash", txHash);

      if (error) {
        logger.error(`Error checking tx hash existence:`, error);
        throw error;
      }

      return (count || 0) > 0;
    } catch (error) {
      logger.error(`Error in txHashExists:`, error as Error);
      throw error;
    }
  }

  /**
   * Get all supported table names
   */
  async getSupportedTables(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("related_table")
        .order("related_table");

      if (error) {
        logger.error(`Error getting supported tables:`, error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Get unique table names
      const uniqueTables = [
        ...new Set(data.map((item) => (item as any).related_table)),
      ];
      return uniqueTables;
    } catch (error) {
      logger.error(`Error in getSupportedTables:`, error as Error);
      throw error;
    }
  }

  /**
   * Delete references older than specified days
   */
  async deleteOldReferences(
    daysOld: number,
    relatedTable?: string
  ): Promise<{ deleted_count: number }> {
    try {
      const cutoffDate = new Date(
        Date.now() - daysOld * 24 * 60 * 60 * 1000
      ).toISOString();

      let query = supabase
        .from(this.tableName)
        .delete()
        .lt("created_at", cutoffDate);

      if (relatedTable) {
        query = query.eq("related_table", relatedTable);
      }

      const { count, error } = await query;

      if (error) {
        logger.error(`Error deleting old references:`, error);
        throw error;
      }

      const deletedCount = count || 0;

      logger.info(
        `Deleted ${deletedCount} old blockchain references older than ${daysOld} days`
      );

      return { deleted_count: deletedCount };
    } catch (error) {
      logger.error(`Error in deleteOldReferences:`, error as Error);
      throw error;
    }
  }

  /**
   * Update transaction timestamp
   */
  async updateTxTimestamp(
    id: string,
    txTimestamp: string
  ): Promise<BlockchainTxReference> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          tx_timestamp: txTimestamp,
        } as never)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error(`Error updating tx timestamp:`, error);
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from update operation");
      }

      return data;
    } catch (error) {
      logger.error(`Error in updateTxTimestamp:`, error as Error);
      throw error;
    }
  }
}
