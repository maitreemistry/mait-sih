/**
 * BlockchainTxReferencesValidator
 * Validation for blockchain transaction reference operations
 * Implements comprehensive validation rules for blockchain tracking
 */

import { ServiceErrorCode } from "../types";

export interface CreateBlockchainTxReferenceData {
  related_table: string;
  related_id: string;
  tx_hash: string;
  tx_timestamp?: string;
}

export interface UpdateBlockchainTxReferenceData {
  tx_hash?: string;
  tx_timestamp?: string;
}

export class BlockchainTxReferencesValidator {
  private errors: {
    code: ServiceErrorCode;
    message: string;
    field?: string;
  }[] = [];
  private warnings: { message: string; field?: string }[] = [];

  private clearErrors(): void {
    this.errors = [];
    this.warnings = [];
  }

  private addError(
    code: ServiceErrorCode,
    message: string,
    field?: string
  ): void {
    this.errors.push({ code, message, field });
  }

  private addWarning(message: string, field?: string): void {
    this.warnings.push({ message, field });
  }

  private throwIfErrors(): void {
    if (this.errors.length > 0) {
      const primaryError = this.errors[0];
      const error = new Error(primaryError.message) as any;
      error.code = primaryError.code;
      error.field = primaryError.field;
      error.validationErrors = this.errors;
      error.validationWarnings = this.warnings;
      throw error;
    }
  }

  /**
   * Validate data for creating blockchain transaction reference
   */
  validateCreateBlockchainTxReference(
    data: CreateBlockchainTxReferenceData
  ): void {
    this.clearErrors();

    // Validate required fields
    if (!data.related_table?.trim()) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Related table is required",
        "related_table"
      );
    }

    if (!data.related_id?.trim()) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Related ID is required",
        "related_id"
      );
    }

    if (!data.tx_hash?.trim()) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Transaction hash is required",
        "tx_hash"
      );
    }

    // Validate field formats and constraints
    if (data.related_table) {
      this.validateRelatedTable(data.related_table);
    }

    if (data.related_id) {
      this.validateRelatedId(data.related_id);
    }

    if (data.tx_hash) {
      this.validateTxHash(data.tx_hash);
    }

    if (data.tx_timestamp) {
      this.validateTxTimestamp(data.tx_timestamp);
    }

    this.throwIfErrors();
  }

  /**
   * Validate data for updating blockchain transaction reference
   */
  validateUpdateBlockchainTxReference(
    data: UpdateBlockchainTxReferenceData
  ): void {
    this.clearErrors();

    // At least one field must be provided for update
    if (!data.tx_hash && !data.tx_timestamp) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "At least one field must be provided for update"
      );
    }

    // Validate provided fields
    if (data.tx_hash) {
      this.validateTxHash(data.tx_hash);
    }

    if (data.tx_timestamp) {
      this.validateTxTimestamp(data.tx_timestamp);
    }

    this.throwIfErrors();
  }

  /**
   * Validate related table name
   */
  private validateRelatedTable(relatedTable: string): void {
    // Check length
    if (relatedTable.length > 255) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Related table name cannot exceed 255 characters",
        "related_table"
      );
      return;
    }

    // Check format (alphanumeric, underscores, hyphens only)
    const tableNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!tableNameRegex.test(relatedTable)) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Related table name can only contain letters, numbers, underscores, and hyphens",
        "related_table"
      );
    }
  }

  /**
   * Validate related ID
   */
  private validateRelatedId(relatedId: string): void {
    // Check length
    if (relatedId.length > 255) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Related ID cannot exceed 255 characters",
        "related_id"
      );
      return;
    }

    // Check for empty or whitespace-only ID
    if (!relatedId.trim()) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Related ID cannot be empty or contain only whitespace",
        "related_id"
      );
      return;
    }
  }

  /**
   * Validate transaction hash
   */
  private validateTxHash(txHash: string): void {
    // Check length
    if (txHash.length > 255) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Transaction hash cannot exceed 255 characters",
        "tx_hash"
      );
      return;
    }

    // Check for empty hash
    if (!txHash.trim()) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Transaction hash cannot be empty",
        "tx_hash"
      );
      return;
    }

    // Check for hexadecimal format (common for blockchain hashes)
    const hexRegex = /^(0x)?[a-fA-F0-9]+$/;
    if (!hexRegex.test(txHash)) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Transaction hash must be in hexadecimal format",
        "tx_hash"
      );
      return;
    }
  }

  /**
   * Validate transaction timestamp
   */
  private validateTxTimestamp(txTimestamp: string): void {
    try {
      const timestamp = new Date(txTimestamp);

      // Check if valid date
      if (isNaN(timestamp.getTime())) {
        this.addError(
          ServiceErrorCode.VALIDATION_ERROR,
          "Transaction timestamp must be a valid ISO 8601 date string",
          "tx_timestamp"
        );
        return;
      }

      // Check if timestamp is not in the future (blockchain transactions can't be in future)
      const now = new Date();
      if (timestamp > now) {
        this.addError(
          ServiceErrorCode.VALIDATION_ERROR,
          "Transaction timestamp cannot be in the future",
          "tx_timestamp"
        );
        return;
      }
    } catch {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Transaction timestamp must be a valid date string",
        "tx_timestamp"
      );
    }
  }

  /**
   * Validate transaction hash format
   */
  validateTxHashFormat(txHash: string): void {
    this.clearErrors();

    if (!txHash) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Transaction hash is required"
      );
    } else {
      this.validateTxHash(txHash);
    }

    this.throwIfErrors();
  }

  /**
   * Validate entity reference
   */
  validateEntityReference(relatedTable: string, relatedId: string): void {
    this.clearErrors();

    if (!relatedTable) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Related table is required"
      );
    }

    if (!relatedId) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Related ID is required"
      );
    }

    if (relatedTable) {
      this.validateRelatedTable(relatedTable);
    }

    if (relatedId) {
      this.validateRelatedId(relatedId);
    }

    this.throwIfErrors();
  }

  /**
   * Validate pagination parameters
   */
  validatePaginationParams(limit?: number, offset?: number): void {
    this.clearErrors();

    if (limit !== undefined) {
      if (!Number.isInteger(limit) || limit < 1) {
        this.addError(
          ServiceErrorCode.VALIDATION_ERROR,
          "Limit must be a positive integer",
          "limit"
        );
      } else if (limit > 1000) {
        this.addError(
          ServiceErrorCode.VALIDATION_ERROR,
          "Limit cannot exceed 1000 records",
          "limit"
        );
      }
    }

    if (offset !== undefined) {
      if (!Number.isInteger(offset) || offset < 0) {
        this.addError(
          ServiceErrorCode.VALIDATION_ERROR,
          "Offset must be a non-negative integer",
          "offset"
        );
      }
    }

    this.throwIfErrors();
  }

  /**
   * Validate days old parameter for cleanup operations
   */
  validateDaysOld(daysOld: number): void {
    this.clearErrors();

    if (!Number.isInteger(daysOld) || daysOld < 1) {
      this.addError(
        ServiceErrorCode.VALIDATION_ERROR,
        "Days old must be a positive integer",
        "days_old"
      );
    }

    this.throwIfErrors();
  }
}
