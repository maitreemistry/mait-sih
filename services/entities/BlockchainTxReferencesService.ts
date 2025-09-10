/**
 * BlockchainTxReferencesService
 * Service layer for blockchain transaction reference operations
 * Provides comprehensive blockchain tracking functionality with business logic
 */

import { TABLE_NAMES } from "../config";
import { EnhancedBaseService } from "../database";
import { logger } from "../logger";
import {
  BlockchainTxReference,
  BlockchainTxReferencesRepository,
} from "../repositories/BlockchainTxReferencesRepository";
import { ServiceErrorCode, ServiceResponse } from "../types";
import {
  BlockchainTxReferencesValidator,
  CreateBlockchainTxReferenceData,
} from "../validators/BlockchainTxReferencesValidator";

export class BlockchainTxReferencesService extends EnhancedBaseService<BlockchainTxReference> {
  private blockchainTxReferencesValidator: BlockchainTxReferencesValidator;

  constructor() {
    const repository = new BlockchainTxReferencesRepository();
    super(repository, "BlockchainTxReference");
    this.blockchainTxReferencesValidator =
      new BlockchainTxReferencesValidator();
  }

  protected getTableName(): string {
    return TABLE_NAMES.BLOCKCHAIN_TX_REFERENCES;
  }

  /**
   * Create new blockchain transaction reference
   */
  async createTxReference(
    createData: CreateBlockchainTxReferenceData,
    userId?: string
  ): Promise<ServiceResponse<BlockchainTxReference>> {
    try {
      // Validate input data
      this.blockchainTxReferencesValidator.validateCreateBlockchainTxReference(
        createData
      );

      // Check for duplicate transaction hash
      const repository = this.repository as BlockchainTxReferencesRepository;
      const existingTx = await repository.findByTxHash(createData.tx_hash);
      if (existingTx) {
        const error = this.createError(
          ServiceErrorCode.DUPLICATE_ERROR,
          `Transaction hash ${createData.tx_hash} already exists`,
          { tx_hash: createData.tx_hash }
        );
        return this.createResponse<BlockchainTxReference>(null, error);
      }

      // Create the blockchain transaction reference
      const txReference = await repository.create(createData as any);

      logger.info(
        `Created blockchain transaction reference for ${createData.related_table}:${createData.related_id}`,
        {
          id: txReference.id,
          tx_hash: createData.tx_hash,
          user_id: userId,
        }
      );

      return this.createResponse<BlockchainTxReference>(
        txReference,
        null,
        "Blockchain transaction reference created successfully"
      );
    } catch (error) {
      logger.error(
        "Error creating blockchain transaction reference:",
        error as Error
      );
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        `Failed to create blockchain transaction reference: ${
          (error as Error).message
        }`,
        { originalError: (error as Error).message }
      );
      return this.createResponse<BlockchainTxReference>(null, serviceError);
    }
  }

  /**
   * Get transaction references for an entity
   */
  async getEntityReferences(
    relatedTable: string,
    relatedId: string,
    limit?: number
  ): Promise<ServiceResponse<BlockchainTxReference[]>> {
    try {
      // Validate input
      this.blockchainTxReferencesValidator.validateEntityReference(
        relatedTable,
        relatedId
      );

      if (limit !== undefined) {
        this.blockchainTxReferencesValidator.validatePaginationParams(limit);
      }

      // Get transaction references
      const repository = this.repository as BlockchainTxReferencesRepository;
      const references = await repository.findByRelatedEntity(
        relatedTable,
        relatedId,
        limit
      );

      return this.createResponse<BlockchainTxReference[]>(
        references,
        null,
        `Found ${references.length} transaction reference(s) for ${relatedTable}:${relatedId}`
      );
    } catch (error) {
      logger.error("Error getting entity references:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        `Failed to get entity references: ${(error as Error).message}`,
        { relatedTable, relatedId, originalError: (error as Error).message }
      );
      return this.createResponse<BlockchainTxReference[]>(null, serviceError);
    }
  }

  /**
   * Get transaction reference by hash
   */
  async getTxReferenceByHash(
    txHash: string
  ): Promise<ServiceResponse<BlockchainTxReference | null>> {
    try {
      // Validate transaction hash
      this.blockchainTxReferencesValidator.validateTxHashFormat(txHash);

      // Find transaction reference
      const repository = this.repository as BlockchainTxReferencesRepository;
      const reference = await repository.findByTxHash(txHash);

      if (!reference) {
        return this.createResponse<BlockchainTxReference | null>(
          null,
          null,
          `No transaction reference found for hash ${txHash}`
        );
      }

      return this.createResponse<BlockchainTxReference | null>(
        reference,
        null,
        "Transaction reference found successfully"
      );
    } catch (error) {
      logger.error(
        "Error getting transaction reference by hash:",
        error as Error
      );
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        `Failed to get transaction reference: ${(error as Error).message}`,
        { txHash, originalError: (error as Error).message }
      );
      return this.createResponse<BlockchainTxReference | null>(
        null,
        serviceError
      );
    }
  }

  /**
   * Update transaction timestamp
   */
  async updateTxTimestamp(
    id: string,
    txTimestamp: string
  ): Promise<ServiceResponse<BlockchainTxReference>> {
    try {
      // Validate input
      this.blockchainTxReferencesValidator.validateUpdateBlockchainTxReference({
        tx_timestamp: txTimestamp,
      });

      // Check if transaction reference exists
      const existing = await this.repository.findById(id);
      if (!existing) {
        const error = this.createError(
          ServiceErrorCode.NOT_FOUND,
          `Transaction reference with ID ${id} not found`,
          { id }
        );
        return this.createResponse<BlockchainTxReference>(null, error);
      }

      // Update timestamp
      const repository = this.repository as BlockchainTxReferencesRepository;
      const updatedTx = await repository.updateTxTimestamp(id, txTimestamp);

      logger.info(`Updated transaction timestamp for ${id}`, {
        id,
        txTimestamp,
      });

      return this.createResponse<BlockchainTxReference>(
        updatedTx,
        null,
        "Transaction timestamp updated successfully"
      );
    } catch (error) {
      logger.error("Error updating transaction timestamp:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        `Failed to update transaction timestamp: ${(error as Error).message}`,
        { id, txTimestamp, originalError: (error as Error).message }
      );
      return this.createResponse<BlockchainTxReference>(null, serviceError);
    }
  }

  /**
   * Get blockchain statistics
   */
  async getBlockchainStats(relatedTable?: string): Promise<
    ServiceResponse<{
      total_transactions: number;
      unique_entities: number;
      latest_transaction?: BlockchainTxReference;
      table_breakdown: { table_name: string; transaction_count: number }[];
    }>
  > {
    try {
      if (relatedTable) {
        this.blockchainTxReferencesValidator.validateEntityReference(
          relatedTable,
          "dummy"
        );
      }

      // Get blockchain statistics
      const repository = this.repository as BlockchainTxReferencesRepository;
      const stats = await repository.getBlockchainStats(relatedTable);

      return this.createResponse<{
        total_transactions: number;
        unique_entities: number;
        latest_transaction?: BlockchainTxReference;
        table_breakdown: { table_name: string; transaction_count: number }[];
      }>(stats, null, "Blockchain statistics retrieved successfully");
    } catch (error) {
      logger.error("Error getting blockchain stats:", error as Error);
      const serviceError = this.createError(
        ServiceErrorCode.INTERNAL_ERROR,
        `Failed to get blockchain statistics: ${(error as Error).message}`,
        { relatedTable, originalError: (error as Error).message }
      );
      return this.createResponse<{
        total_transactions: number;
        unique_entities: number;
        latest_transaction?: BlockchainTxReference;
        table_breakdown: { table_name: string; transaction_count: number }[];
      }>(null, serviceError);
    }
  }
}
