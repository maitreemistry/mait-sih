import { BUSINESS_RULES } from "../config";
import { ValidationResult } from "../types";
import { BaseValidator } from "./BaseValidator";

export class MessagesValidator extends BaseValidator {
  /**
   * Validate message creation data
   */
  validateCreate(data: {
    sender_id?: string;
    receiver_id?: string;
    content?: string;
    order_id?: string;
    attachment_urls?: string[];
    status?: string;
  }): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    // Required fields
    if (!data.sender_id) {
      errors.push(
        this.createError("sender_id", "Sender ID is required", "REQUIRED")
      );
    }

    if (!data.receiver_id) {
      errors.push(
        this.createError("receiver_id", "Receiver ID is required", "REQUIRED")
      );
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push(
        this.createError("content", "Message content is required", "REQUIRED")
      );
    }

    // Content validation
    if (data.content) {
      if (data.content.length < BUSINESS_RULES.MESSAGE.MIN_CONTENT_LENGTH) {
        errors.push(
          this.createError(
            "content",
            `Message must be at least ${BUSINESS_RULES.MESSAGE.MIN_CONTENT_LENGTH} character long`,
            "MIN_LENGTH"
          )
        );
      }

      if (data.content.length > BUSINESS_RULES.MESSAGE.MAX_CONTENT_LENGTH) {
        errors.push(
          this.createError(
            "content",
            `Message cannot exceed ${BUSINESS_RULES.MESSAGE.MAX_CONTENT_LENGTH} characters`,
            "MAX_LENGTH"
          )
        );
      }

      // Check for spam patterns
      if (this.containsSpamPatterns(data.content)) {
        errors.push(
          this.createError(
            "content",
            "Message contains spam or inappropriate content",
            "SPAM"
          )
        );
      }
    }

    // Self-messaging validation
    if (
      data.sender_id &&
      data.receiver_id &&
      data.sender_id === data.receiver_id
    ) {
      errors.push(
        this.createError(
          "receiver_id",
          "Cannot send message to yourself",
          "INVALID"
        )
      );
    }

    // Attachment validation
    if (data.attachment_urls && data.attachment_urls.length > 0) {
      if (
        data.attachment_urls.length > BUSINESS_RULES.MESSAGE.MAX_ATTACHMENTS
      ) {
        errors.push(
          this.createError(
            "attachment_urls",
            `Cannot exceed ${BUSINESS_RULES.MESSAGE.MAX_ATTACHMENTS} attachments`,
            "MAX_COUNT"
          )
        );
      }

      // Validate attachment URLs
      data.attachment_urls.forEach((url, index) => {
        if (!this.isValidMessageUrl(url)) {
          errors.push(
            this.createError(
              `attachment_urls[${index}]`,
              "Invalid attachment URL",
              "INVALID"
            )
          );
        }
      });
    }

    // Status validation
    if (
      data.status &&
      !BUSINESS_RULES.MESSAGE.ALLOWED_STATUSES.includes(data.status as any)
    ) {
      errors.push(
        this.createError(
          "status",
          `Status must be one of: ${BUSINESS_RULES.MESSAGE.ALLOWED_STATUSES.join(
            ", "
          )}`,
          "INVALID"
        )
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate message update data
   */
  validateUpdate(data: {
    content?: string;
    status?: string;
    attachment_urls?: string[];
  }): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    // Content validation (if provided)
    if (data.content !== undefined) {
      if (data.content.length < BUSINESS_RULES.MESSAGE.MIN_CONTENT_LENGTH) {
        errors.push(
          this.createError(
            "content",
            `Message must be at least ${BUSINESS_RULES.MESSAGE.MIN_CONTENT_LENGTH} character long`,
            "MIN_LENGTH"
          )
        );
      }

      if (data.content.length > BUSINESS_RULES.MESSAGE.MAX_CONTENT_LENGTH) {
        errors.push(
          this.createError(
            "content",
            `Message cannot exceed ${BUSINESS_RULES.MESSAGE.MAX_CONTENT_LENGTH} characters`,
            "MAX_LENGTH"
          )
        );
      }

      // Check for spam patterns
      if (this.containsSpamPatterns(data.content)) {
        errors.push(
          this.createError(
            "content",
            "Message contains spam or inappropriate content",
            "SPAM"
          )
        );
      }
    }

    // Status validation (if provided)
    if (
      data.status &&
      !BUSINESS_RULES.MESSAGE.ALLOWED_STATUSES.includes(data.status as any)
    ) {
      errors.push(
        this.createError(
          "status",
          `Status must be one of: ${BUSINESS_RULES.MESSAGE.ALLOWED_STATUSES.join(
            ", "
          )}`,
          "INVALID"
        )
      );
    }

    // Attachment validation (if provided)
    if (data.attachment_urls && data.attachment_urls.length > 0) {
      if (
        data.attachment_urls.length > BUSINESS_RULES.MESSAGE.MAX_ATTACHMENTS
      ) {
        errors.push(
          this.createError(
            "attachment_urls",
            `Cannot exceed ${BUSINESS_RULES.MESSAGE.MAX_ATTACHMENTS} attachments`,
            "MAX_COUNT"
          )
        );
      }

      data.attachment_urls.forEach((url, index) => {
        if (!this.isValidMessageUrl(url)) {
          errors.push(
            this.createError(
              `attachment_urls[${index}]`,
              "Invalid attachment URL",
              "INVALID"
            )
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate message search parameters
   */
  validateSearch(data: {
    query?: string;
    limit?: number;
    offset?: number;
  }): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    // Query validation
    if (data.query !== undefined) {
      if (data.query.length < 2) {
        errors.push(
          this.createError(
            "query",
            "Search query must be at least 2 characters long",
            "MIN_LENGTH"
          )
        );
      }

      if (data.query.length > 100) {
        errors.push(
          this.createError(
            "query",
            "Search query cannot exceed 100 characters",
            "MAX_LENGTH"
          )
        );
      }
    }

    // Limit validation
    if (data.limit !== undefined) {
      if (data.limit < 1 || data.limit > 100) {
        errors.push(
          this.createError("limit", "Limit must be between 1 and 100", "RANGE")
        );
      }
    }

    // Offset validation
    if (data.offset !== undefined && data.offset < 0) {
      errors.push(
        this.createError("offset", "Offset cannot be negative", "INVALID")
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate conversation parameters
   */
  validateConversation(data: {
    userId1?: string;
    userId2?: string;
    limit?: number;
    offset?: number;
  }): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    // Required user IDs
    if (!data.userId1) {
      errors.push(
        this.createError("userId1", "First user ID is required", "REQUIRED")
      );
    }

    if (!data.userId2) {
      errors.push(
        this.createError("userId2", "Second user ID is required", "REQUIRED")
      );
    }

    // Same user validation
    if (data.userId1 && data.userId2 && data.userId1 === data.userId2) {
      errors.push(
        this.createError(
          "userId2",
          "Cannot get conversation with yourself",
          "INVALID"
        )
      );
    }

    // Limit validation
    if (data.limit !== undefined) {
      if (data.limit < 1 || data.limit > 100) {
        errors.push(
          this.createError("limit", "Limit must be between 1 and 100", "RANGE")
        );
      }
    }

    // Offset validation
    if (data.offset !== undefined && data.offset < 0) {
      errors.push(
        this.createError("offset", "Offset cannot be negative", "INVALID")
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check for spam patterns in message content
   */
  private containsSpamPatterns(content: string): boolean {
    const spamPatterns = [
      /(.)\1{10,}/, // Repeated characters (more than 10 times)
      /\b(click here|buy now|limited time|act now)\b/i,
      /\b(free money|make money|get rich)\b/i,
      /\b(viagra|casino|lottery|winner)\b/i,
      /[A-Z]{20,}/, // Too many consecutive caps
      /\b\d{10,}\b/, // Long numbers (potential phone/spam)
      /https?:\/\/[^\s]+/g, // Multiple URLs (count separately)
    ];

    // Count URL patterns
    const urlMatches = content.match(/https?:\/\/[^\s]+/g);
    if (urlMatches && urlMatches.length > 3) {
      return true; // Too many URLs
    }

    return spamPatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Validate URL format
   */
  private isValidMessageUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate bulk message operations
   */
  validateBulkOperation(data: {
    messageIds?: string[];
    operation?: string;
  }): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    if (!data.messageIds || data.messageIds.length === 0) {
      errors.push(
        this.createError("messageIds", "Message IDs are required", "REQUIRED")
      );
    }

    if (data.messageIds && data.messageIds.length > 50) {
      errors.push(
        this.createError(
          "messageIds",
          "Cannot process more than 50 messages at once",
          "MAX_COUNT"
        )
      );
    }

    if (!data.operation) {
      errors.push(
        this.createError("operation", "Operation type is required", "REQUIRED")
      );
    }

    if (
      data.operation &&
      !["read", "delete", "archive"].includes(data.operation)
    ) {
      errors.push(
        this.createError(
          "operation",
          "Operation must be one of: read, delete, archive",
          "INVALID"
        )
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
