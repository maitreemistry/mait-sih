/**
 * ColdChainLogsService
 * Service layer for cold chain temperature monitoring
 * Handles business logic and orchestrates repository operations
 */

import { TABLE_NAMES } from "../config";
import { EnhancedBaseService } from "../database";
import { logger } from "../logger";
import {
  ColdChainLog,
  ColdChainLogsRepository,
} from "../repositories/ColdChainLogsRepository";
import { ServiceErrorCode, ServiceResponse } from "../types";
import {
  ColdChainLogCreateData,
  ColdChainLogsValidator,
  ColdChainLogUpdateData,
  TemperatureRangeData,
} from "../validators/ColdChainLogsValidator";

export class ColdChainLogsService extends EnhancedBaseService<ColdChainLog> {
  private coldChainLogsValidator: ColdChainLogsValidator;

  constructor() {
    const repository = new ColdChainLogsRepository();
    super(repository, "ColdChainLog");
    this.coldChainLogsValidator = new ColdChainLogsValidator();
  }

  protected getTableName(): string {
    return TABLE_NAMES.COLD_CHAIN_LOGS;
  }

  /**
   * Create new temperature log
   */
  async createTemperatureLog(
    createData: ColdChainLogCreateData,
    userId?: string
  ): Promise<ServiceResponse<ColdChainLog>> {
    try {
      // Validate input data
      const validation = this.coldChainLogsValidator.validateCreate(createData);
      if (!validation.isValid) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Validation failed: ${validation.errors.join(", ")}`,
          validation.errors
        );
        return this.createResponse<ColdChainLog>(null, error);
      }

      // Verify retailer authorization if userId provided
      if (userId && createData.retailer_id !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot create temperature logs for other retailers"
        );
        return this.createResponse<ColdChainLog>(null, error);
      }

      // Create temperature log
      const createResult = await this.repository.create({
        ...createData,
        created_at: new Date().toISOString(),
      });

      if (createResult.error) {
        logger.error("Error creating temperature log:", createResult.error);
        const error = this.handleRepositoryError(createResult.error, "create");
        return this.createResponse<ColdChainLog>(null, error);
      }

      logger.info(`Temperature log created:`, {
        logId: createResult.data?.id,
        retailerId: createData.retailer_id,
        storageUnitId: createData.storage_unit_id,
        temperature: createData.temperature,
      });

      return this.createResponse<ColdChainLog>(
        createResult.data,
        null,
        "Temperature log created successfully"
      );
    } catch (error) {
      logger.error("Error creating temperature log:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<ColdChainLog>(null, serviceError);
    }
  }

  /**
   * Get temperature logs for a retailer
   */
  async getRetailerLogs(
    retailerId: string,
    includeDetails: boolean = false,
    userId?: string,
    limit?: number,
    offset?: number
  ): Promise<ServiceResponse<ColdChainLog[]>> {
    try {
      // Verify retailer authorization if userId provided
      if (userId && retailerId !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot access temperature logs for other retailers"
        );
        return this.createResponse<ColdChainLog[]>(null, error);
      }

      // Validate limit if provided
      if (limit !== undefined) {
        const limitValidation =
          this.coldChainLogsValidator.validateLimit(limit);
        if (!limitValidation.isValid) {
          const error = this.createError(
            ServiceErrorCode.VALIDATION_ERROR,
            `Invalid limit: ${limitValidation.errors.join(", ")}`
          );
          return this.createResponse<ColdChainLog[]>(null, error);
        }
      }

      const logs = await (
        this.repository as ColdChainLogsRepository
      ).findByRetailer(retailerId, includeDetails, limit, offset);

      return this.createResponse<ColdChainLog[]>(
        logs,
        null,
        "Retailer temperature logs retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting retailer logs:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<ColdChainLog[]>(null, serviceError);
    }
  }

  /**
   * Get temperature logs by storage unit
   */
  async getStorageUnitLogs(
    storageUnitId: string,
    retailerId?: string,
    includeDetails: boolean = false,
    userId?: string,
    limit?: number
  ): Promise<ServiceResponse<ColdChainLog[]>> {
    try {
      // Validate storage unit ID
      const unitValidation =
        this.coldChainLogsValidator.validateStorageUnitId(storageUnitId);
      if (!unitValidation.isValid) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Invalid storage unit ID: ${unitValidation.errors.join(", ")}`
        );
        return this.createResponse<ColdChainLog[]>(null, error);
      }

      // Verify retailer authorization if userId provided and retailerId specified
      if (userId && retailerId && retailerId !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot access temperature logs for other retailers"
        );
        return this.createResponse<ColdChainLog[]>(null, error);
      }

      // If userId provided but no retailerId, use userId as retailerId
      const effectiveRetailerId = retailerId || userId;

      const logs = await (
        this.repository as ColdChainLogsRepository
      ).findByStorageUnit(
        storageUnitId,
        effectiveRetailerId,
        includeDetails,
        limit
      );

      return this.createResponse<ColdChainLog[]>(
        logs,
        null,
        "Storage unit temperature logs retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting storage unit logs:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<ColdChainLog[]>(null, serviceError);
    }
  }

  /**
   * Get temperature logs by temperature range
   */
  async getLogsByTemperatureRange(
    rangeData: TemperatureRangeData,
    retailerId?: string,
    storageUnitId?: string,
    includeDetails: boolean = false,
    userId?: string,
    limit?: number
  ): Promise<ServiceResponse<ColdChainLog[]>> {
    try {
      // Validate temperature range
      const rangeValidation =
        this.coldChainLogsValidator.validateTemperatureRange(rangeData);
      if (!rangeValidation.isValid) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Invalid temperature range: ${rangeValidation.errors.join(", ")}`
        );
        return this.createResponse<ColdChainLog[]>(null, error);
      }

      // Verify retailer authorization if userId provided and retailerId specified
      if (userId && retailerId && retailerId !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot access temperature logs for other retailers"
        );
        return this.createResponse<ColdChainLog[]>(null, error);
      }

      // If userId provided but no retailerId, use userId as retailerId
      const effectiveRetailerId = retailerId || userId;

      const logs = await (
        this.repository as ColdChainLogsRepository
      ).findByTemperatureRange(
        rangeData.min_temp,
        rangeData.max_temp,
        effectiveRetailerId,
        storageUnitId,
        includeDetails,
        limit
      );

      return this.createResponse<ColdChainLog[]>(
        logs,
        null,
        "Temperature range logs retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting logs by temperature range:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<ColdChainLog[]>(null, serviceError);
    }
  }

  /**
   * Get temperature logs by date range
   */
  async getLogsByDateRange(
    startDate: string,
    endDate: string,
    retailerId?: string,
    storageUnitId?: string,
    includeDetails: boolean = false,
    userId?: string,
    limit?: number
  ): Promise<ServiceResponse<ColdChainLog[]>> {
    try {
      // Validate date range
      const dateValidation = this.coldChainLogsValidator.validateDateRange(
        startDate,
        endDate
      );
      if (!dateValidation.isValid) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Invalid date range: ${dateValidation.errors.join(", ")}`
        );
        return this.createResponse<ColdChainLog[]>(null, error);
      }

      // Verify retailer authorization if userId provided and retailerId specified
      if (userId && retailerId && retailerId !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot access temperature logs for other retailers"
        );
        return this.createResponse<ColdChainLog[]>(null, error);
      }

      // If userId provided but no retailerId, use userId as retailerId
      const effectiveRetailerId = retailerId || userId;

      const logs = await (
        this.repository as ColdChainLogsRepository
      ).findByDateRange(
        startDate,
        endDate,
        effectiveRetailerId,
        storageUnitId,
        includeDetails,
        limit
      );

      return this.createResponse<ColdChainLog[]>(
        logs,
        null,
        "Date range logs retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting logs by date range:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<ColdChainLog[]>(null, serviceError);
    }
  }

  /**
   * Get temperature violations
   */
  async getTemperatureViolations(
    safeMinTemp: number,
    safeMaxTemp: number,
    retailerId?: string,
    storageUnitId?: string,
    includeDetails: boolean = false,
    userId?: string,
    limit?: number
  ): Promise<ServiceResponse<ColdChainLog[]>> {
    try {
      // Validate safe temperature range
      const rangeValidation =
        this.coldChainLogsValidator.validateTemperatureRange({
          min_temp: safeMinTemp,
          max_temp: safeMaxTemp,
        });
      if (!rangeValidation.isValid) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Invalid safe temperature range: ${rangeValidation.errors.join(", ")}`
        );
        return this.createResponse<ColdChainLog[]>(null, error);
      }

      // Verify retailer authorization if userId provided and retailerId specified
      if (userId && retailerId && retailerId !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot access temperature logs for other retailers"
        );
        return this.createResponse<ColdChainLog[]>(null, error);
      }

      // If userId provided but no retailerId, use userId as retailerId
      const effectiveRetailerId = retailerId || userId;

      const violations = await (
        this.repository as ColdChainLogsRepository
      ).findTemperatureViolations(
        safeMinTemp,
        safeMaxTemp,
        effectiveRetailerId,
        storageUnitId,
        includeDetails,
        limit
      );

      return this.createResponse<ColdChainLog[]>(
        violations,
        null,
        "Temperature violations retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting temperature violations:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<ColdChainLog[]>(null, serviceError);
    }
  }

  /**
   * Get temperature statistics for a storage unit
   */
  async getTemperatureStats(
    storageUnitId: string,
    retailerId?: string,
    hoursBack?: number,
    userId?: string
  ): Promise<
    ServiceResponse<{
      avg_temperature: number;
      min_temperature: number;
      max_temperature: number;
      reading_count: number;
      latest_reading?: ColdChainLog;
    }>
  > {
    try {
      // Validate storage unit ID
      const unitValidation =
        this.coldChainLogsValidator.validateStorageUnitId(storageUnitId);
      if (!unitValidation.isValid) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Invalid storage unit ID: ${unitValidation.errors.join(", ")}`
        );
        return this.createResponse<{
          avg_temperature: number;
          min_temperature: number;
          max_temperature: number;
          reading_count: number;
          latest_reading?: ColdChainLog;
        }>(null, error);
      }

      // Verify retailer authorization if userId provided and retailerId specified
      if (userId && retailerId && retailerId !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot access temperature stats for other retailers"
        );
        return this.createResponse<{
          avg_temperature: number;
          min_temperature: number;
          max_temperature: number;
          reading_count: number;
          latest_reading?: ColdChainLog;
        }>(null, error);
      }

      // If userId provided but no retailerId, use userId as retailerId
      const effectiveRetailerId = retailerId || userId;

      const stats = await (
        this.repository as ColdChainLogsRepository
      ).getTemperatureStats(storageUnitId, effectiveRetailerId, hoursBack);

      return this.createResponse<{
        avg_temperature: number;
        min_temperature: number;
        max_temperature: number;
        reading_count: number;
        latest_reading?: ColdChainLog;
      }>(stats, null, "Temperature statistics retrieved successfully");
    } catch (error) {
      logger.error("Error getting temperature stats:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<{
        avg_temperature: number;
        min_temperature: number;
        max_temperature: number;
        reading_count: number;
        latest_reading?: ColdChainLog;
      }>(null, serviceError);
    }
  }

  /**
   * Get storage units for a retailer
   */
  async getStorageUnits(
    retailerId: string,
    userId?: string
  ): Promise<
    ServiceResponse<
      {
        storage_unit_id: string;
        latest_temperature?: number;
        latest_reading_time?: string;
        reading_count: number;
      }[]
    >
  > {
    try {
      // Verify retailer authorization if userId provided
      if (userId && retailerId !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot access storage units for other retailers"
        );
        return this.createResponse<
          {
            storage_unit_id: string;
            latest_temperature?: number;
            latest_reading_time?: string;
            reading_count: number;
          }[]
        >(null, error);
      }

      const storageUnits = await (
        this.repository as ColdChainLogsRepository
      ).getStorageUnits(retailerId);

      return this.createResponse<
        {
          storage_unit_id: string;
          latest_temperature?: number;
          latest_reading_time?: string;
          reading_count: number;
        }[]
      >(storageUnits, null, "Storage units retrieved successfully");
    } catch (error) {
      logger.error("Error getting storage units:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<
        {
          storage_unit_id: string;
          latest_temperature?: number;
          latest_reading_time?: string;
          reading_count: number;
        }[]
      >(null, serviceError);
    }
  }

  /**
   * Update temperature log
   */
  async updateTemperatureLog(
    logId: string,
    updateData: ColdChainLogUpdateData,
    userId?: string
  ): Promise<ServiceResponse<ColdChainLog>> {
    try {
      // Validate input data
      const validation = this.coldChainLogsValidator.validateUpdate(updateData);
      if (!validation.isValid) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Validation failed: ${validation.errors.join(", ")}`,
          validation.errors
        );
        return this.createResponse<ColdChainLog>(null, error);
      }

      // Check if log exists and get current data
      const existingLogResult = await this.repository.findById(logId);
      if (existingLogResult.error || !existingLogResult.data) {
        const error = this.createError(
          ServiceErrorCode.NOT_FOUND,
          "Temperature log not found"
        );
        return this.createResponse<ColdChainLog>(null, error);
      }

      const existingLog = existingLogResult.data;

      // Verify retailer authorization if userId provided
      if (userId && existingLog.retailer_id !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot update temperature logs for other retailers"
        );
        return this.createResponse<ColdChainLog>(null, error);
      }

      // Update log
      const updateResult = await this.repository.update(logId, updateData);

      if (updateResult.error) {
        logger.error("Error updating temperature log:", updateResult.error);
        const error = this.handleRepositoryError(updateResult.error, "update");
        return this.createResponse<ColdChainLog>(null, error);
      }

      logger.info(`Temperature log updated:`, {
        logId,
        retailerId: existingLog.retailer_id,
        changes: updateData,
      });

      return this.createResponse<ColdChainLog>(
        updateResult.data,
        null,
        "Temperature log updated successfully"
      );
    } catch (error) {
      logger.error("Error updating temperature log:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<ColdChainLog>(null, serviceError);
    }
  }

  /**
   * Delete old temperature logs
   */
  async deleteOldLogs(
    daysOld: number,
    retailerId?: string,
    userId?: string
  ): Promise<ServiceResponse<{ deleted_count: number }>> {
    try {
      // Validate days parameter
      const daysValidation =
        this.coldChainLogsValidator.validateDaysParameter(daysOld);
      if (!daysValidation.isValid) {
        const error = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Invalid days parameter: ${daysValidation.errors.join(", ")}`
        );
        return this.createResponse<{ deleted_count: number }>(null, error);
      }

      // Verify retailer authorization if userId provided and retailerId specified
      if (userId && retailerId && retailerId !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot delete temperature logs for other retailers"
        );
        return this.createResponse<{ deleted_count: number }>(null, error);
      }

      // If userId provided but no retailerId, use userId as retailerId
      const effectiveRetailerId = retailerId || userId;

      const result = await (
        this.repository as ColdChainLogsRepository
      ).deleteOldLogs(daysOld, effectiveRetailerId);

      logger.info(`Old temperature logs deleted:`, {
        daysOld,
        retailerId: effectiveRetailerId,
        deletedCount: result.deleted_count,
      });

      return this.createResponse<{ deleted_count: number }>(
        result,
        null,
        "Old temperature logs deleted successfully"
      );
    } catch (error) {
      logger.error("Error deleting old logs:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<{ deleted_count: number }>(null, serviceError);
    }
  }

  /**
   * Delete temperature log
   */
  async deleteTemperatureLog(
    logId: string,
    userId?: string
  ): Promise<ServiceResponse<void>> {
    try {
      // Check if log exists
      const existingLogResult = await this.repository.findById(logId);
      if (existingLogResult.error || !existingLogResult.data) {
        const error = this.createError(
          ServiceErrorCode.NOT_FOUND,
          "Temperature log not found"
        );
        return this.createResponse<void>(null, error);
      }

      const existingLog = existingLogResult.data;

      // Verify retailer authorization if userId provided
      if (userId && existingLog.retailer_id !== userId) {
        const error = this.createError(
          ServiceErrorCode.PERMISSION_DENIED,
          "Cannot delete temperature logs for other retailers"
        );
        return this.createResponse<void>(null, error);
      }

      // Delete log
      const deleteResult = await this.repository.delete(logId);

      if (deleteResult.error) {
        logger.error("Error deleting temperature log:", deleteResult.error);
        const error = this.handleRepositoryError(deleteResult.error, "delete");
        return this.createResponse<void>(null, error);
      }

      logger.info(`Temperature log deleted:`, {
        logId,
        retailerId: existingLog.retailer_id,
        storageUnitId: existingLog.storage_unit_id,
      });

      return this.createResponse<void>(
        undefined,
        null,
        "Temperature log deleted successfully"
      );
    } catch (error) {
      logger.error("Error deleting temperature log:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        "Internal server error"
      );
      return this.createResponse<void>(null, serviceError);
    }
  }
}
