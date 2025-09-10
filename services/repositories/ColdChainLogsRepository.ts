/**
 * ColdChainLogsRepository
 * Repository for managing cold chain temperature log operations
 * Handles CRUD operations and business logic for cold storage monitoring
 */

import { supabase } from "../../lib/supabase/client";
import { TABLE_NAMES } from "../config";
import { logger } from "../logger";
import { BaseRepository } from "./BaseRepository";

// ColdChainLog interface matching database schema
export interface ColdChainLog {
  id: string;
  retailer_id: string;
  storage_unit_id: string;
  temperature: number;
  notes?: string;
  logged_by_id?: string;
  created_at: string;

  // Joined data from related tables
  retailer?: {
    id: string;
    full_name: string;
    business_name: string;
    email: string;
  };
  logged_by?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export class ColdChainLogsRepository extends BaseRepository<ColdChainLog> {
  constructor() {
    super(TABLE_NAMES.COLD_CHAIN_LOGS);
  }

  /**
   * Find logs by retailer ID
   */
  async findByRetailer(
    retailerId: string,
    includeDetails: boolean = false,
    limit?: number,
    offset?: number
  ): Promise<ColdChainLog[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          includeDetails
            ? `
              *,
              retailer:profiles!retailer_id(
                id,
                full_name,
                business_name,
                email
              ),
              logged_by:profiles!logged_by_id(
                id,
                full_name,
                email
              )
            `
            : "*"
        )
        .eq("retailer_id", retailerId)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding logs by retailer:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByRetailer:`, error as Error);
      throw error;
    }
  }

  /**
   * Find logs by storage unit
   */
  async findByStorageUnit(
    storageUnitId: string,
    retailerId?: string,
    includeDetails: boolean = false,
    limit?: number
  ): Promise<ColdChainLog[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          includeDetails
            ? `
              *,
              retailer:profiles!retailer_id(
                id,
                full_name,
                business_name,
                email
              ),
              logged_by:profiles!logged_by_id(
                id,
                full_name,
                email
              )
            `
            : "*"
        )
        .eq("storage_unit_id", storageUnitId)
        .order("created_at", { ascending: false });

      if (retailerId) {
        query = query.eq("retailer_id", retailerId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding logs by storage unit:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByStorageUnit:`, error as Error);
      throw error;
    }
  }

  /**
   * Find logs by temperature range
   */
  async findByTemperatureRange(
    minTemp: number,
    maxTemp: number,
    retailerId?: string,
    storageUnitId?: string,
    includeDetails: boolean = false,
    limit?: number
  ): Promise<ColdChainLog[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          includeDetails
            ? `
              *,
              retailer:profiles!retailer_id(
                id,
                full_name,
                business_name,
                email
              ),
              logged_by:profiles!logged_by_id(
                id,
                full_name,
                email
              )
            `
            : "*"
        )
        .gte("temperature", minTemp)
        .lte("temperature", maxTemp)
        .order("created_at", { ascending: false });

      if (retailerId) {
        query = query.eq("retailer_id", retailerId);
      }

      if (storageUnitId) {
        query = query.eq("storage_unit_id", storageUnitId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding logs by temperature range:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByTemperatureRange:`, error as Error);
      throw error;
    }
  }

  /**
   * Find logs within date range
   */
  async findByDateRange(
    startDate: string,
    endDate: string,
    retailerId?: string,
    storageUnitId?: string,
    includeDetails: boolean = false,
    limit?: number
  ): Promise<ColdChainLog[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          includeDetails
            ? `
              *,
              retailer:profiles!retailer_id(
                id,
                full_name,
                business_name,
                email
              ),
              logged_by:profiles!logged_by_id(
                id,
                full_name,
                email
              )
            `
            : "*"
        )
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false });

      if (retailerId) {
        query = query.eq("retailer_id", retailerId);
      }

      if (storageUnitId) {
        query = query.eq("storage_unit_id", storageUnitId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding logs by date range:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByDateRange:`, error as Error);
      throw error;
    }
  }

  /**
   * Find temperature violations (outside safe range)
   */
  async findTemperatureViolations(
    safeMinTemp: number,
    safeMaxTemp: number,
    retailerId?: string,
    storageUnitId?: string,
    includeDetails: boolean = false,
    limit?: number
  ): Promise<ColdChainLog[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          includeDetails
            ? `
              *,
              retailer:profiles!retailer_id(
                id,
                full_name,
                business_name,
                email
              ),
              logged_by:profiles!logged_by_id(
                id,
                full_name,
                email
              )
            `
            : "*"
        )
        .or(`temperature.lt.${safeMinTemp},temperature.gt.${safeMaxTemp}`)
        .order("created_at", { ascending: false });

      if (retailerId) {
        query = query.eq("retailer_id", retailerId);
      }

      if (storageUnitId) {
        query = query.eq("storage_unit_id", storageUnitId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error finding temperature violations:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findTemperatureViolations:`, error as Error);
      throw error;
    }
  }

  /**
   * Get temperature statistics for a storage unit
   */
  async getTemperatureStats(
    storageUnitId: string,
    retailerId?: string,
    hoursBack?: number
  ): Promise<{
    avg_temperature: number;
    min_temperature: number;
    max_temperature: number;
    reading_count: number;
    latest_reading?: ColdChainLog;
  }> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("temperature, created_at")
        .eq("storage_unit_id", storageUnitId)
        .order("created_at", { ascending: false });

      if (retailerId) {
        query = query.eq("retailer_id", retailerId);
      }

      if (hoursBack) {
        const cutoffTime = new Date(
          Date.now() - hoursBack * 60 * 60 * 1000
        ).toISOString();
        query = query.gte("created_at", cutoffTime);
      }

      const { data, error } = (await query) as {
        data:
          | {
              temperature: number;
              created_at: string;
            }[]
          | null;
        error: any;
      };

      if (error) {
        logger.error(`Error getting temperature stats:`, error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          avg_temperature: 0,
          min_temperature: 0,
          max_temperature: 0,
          reading_count: 0,
        };
      }

      const temperatures = data.map((item) => item.temperature);
      const avgTemp =
        temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
      const minTemp = Math.min(...temperatures);
      const maxTemp = Math.max(...temperatures);

      // Get latest reading with full details
      const latestResult = await this.findByStorageUnit(
        storageUnitId,
        retailerId,
        true,
        1
      );
      const latestReading =
        latestResult.length > 0 ? latestResult[0] : undefined;

      return {
        avg_temperature: Math.round(avgTemp * 100) / 100,
        min_temperature: minTemp,
        max_temperature: maxTemp,
        reading_count: data.length,
        latest_reading: latestReading,
      };
    } catch (error) {
      logger.error(`Error in getTemperatureStats:`, error as Error);
      throw error;
    }
  }

  /**
   * Get storage units for a retailer
   */
  async getStorageUnits(retailerId: string): Promise<
    {
      storage_unit_id: string;
      latest_temperature?: number;
      latest_reading_time?: string;
      reading_count: number;
    }[]
  > {
    try {
      const { data, error } = (await supabase
        .from(this.tableName)
        .select("storage_unit_id")
        .eq("retailer_id", retailerId)) as {
        data:
          | {
              storage_unit_id: string;
            }[]
          | null;
        error: any;
      };

      if (error) {
        logger.error(`Error getting storage units:`, error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Get unique storage units
      const uniqueUnits = [
        ...new Set(data.map((item) => item.storage_unit_id)),
      ];

      // Get latest reading for each unit
      const storageUnitsData = await Promise.all(
        uniqueUnits.map(async (unitId) => {
          const stats = await this.getTemperatureStats(unitId, retailerId);
          return {
            storage_unit_id: unitId,
            latest_temperature: stats.latest_reading?.temperature,
            latest_reading_time: stats.latest_reading?.created_at,
            reading_count: stats.reading_count,
          };
        })
      );

      return storageUnitsData;
    } catch (error) {
      logger.error(`Error in getStorageUnits:`, error as Error);
      throw error;
    }
  }

  /**
   * Delete logs older than specified days
   */
  async deleteOldLogs(
    daysOld: number,
    retailerId?: string
  ): Promise<{ deleted_count: number }> {
    try {
      const cutoffDate = new Date(
        Date.now() - daysOld * 24 * 60 * 60 * 1000
      ).toISOString();

      let query = supabase
        .from(this.tableName)
        .delete()
        .lt("created_at", cutoffDate);

      if (retailerId) {
        query = query.eq("retailer_id", retailerId);
      }

      const { count, error } = await query;

      if (error) {
        logger.error(`Error deleting old logs:`, error);
        throw error;
      }

      const deletedCount = count || 0;

      logger.info(
        `Deleted ${deletedCount} old cold chain logs older than ${daysOld} days`
      );

      return { deleted_count: deletedCount };
    } catch (error) {
      logger.error(`Error in deleteOldLogs:`, error as Error);
      throw error;
    }
  }
}
