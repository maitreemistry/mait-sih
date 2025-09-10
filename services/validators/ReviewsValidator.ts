import { BUSINESS_RULES } from "../config";
import { ValidationResult } from "../types";
import { BaseValidator } from "./BaseValidator";

export class ReviewsValidator extends BaseValidator {
  /**
   * Validate review creation data
   */
  validateCreate(data: {
    reviewer_id?: string;
    listing_id?: string;
    rating?: number;
    comment?: string;
    status?: string;
  }): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    // Required fields
    if (!data.reviewer_id) {
      errors.push(
        this.createError("reviewer_id", "Reviewer ID is required", "REQUIRED")
      );
    }

    if (!data.listing_id) {
      errors.push(
        this.createError("listing_id", "Listing ID is required", "REQUIRED")
      );
    }

    if (data.rating === undefined || data.rating === null) {
      errors.push(this.createError("rating", "Rating is required", "REQUIRED"));
    } else {
      // Rating validation
      if (
        data.rating < BUSINESS_RULES.REVIEW.MIN_RATING ||
        data.rating > BUSINESS_RULES.REVIEW.MAX_RATING
      ) {
        errors.push(
          this.createError(
            "rating",
            `Rating must be between ${BUSINESS_RULES.REVIEW.MIN_RATING} and ${BUSINESS_RULES.REVIEW.MAX_RATING}`,
            "RANGE"
          )
        );
      }

      if (!Number.isInteger(data.rating)) {
        errors.push(
          this.createError("rating", "Rating must be a whole number", "INVALID")
        );
      }
    }

    // Comment validation
    if (data.comment) {
      if (data.comment.length < BUSINESS_RULES.REVIEW.MIN_COMMENT_LENGTH) {
        errors.push(
          this.createError(
            "comment",
            `Comment must be at least ${BUSINESS_RULES.REVIEW.MIN_COMMENT_LENGTH} characters long`,
            "MIN_LENGTH"
          )
        );
      }

      if (data.comment.length > BUSINESS_RULES.REVIEW.MAX_COMMENT_LENGTH) {
        errors.push(
          this.createError(
            "comment",
            `Comment cannot exceed ${BUSINESS_RULES.REVIEW.MAX_COMMENT_LENGTH} characters`,
            "MAX_LENGTH"
          )
        );
      }

      // Check for inappropriate content patterns
      if (this.containsInappropriateContent(data.comment)) {
        errors.push(
          this.createError(
            "comment",
            "Comment contains inappropriate content",
            "INAPPROPRIATE"
          )
        );
      }
    }

    // Status validation
    if (
      data.status &&
      !BUSINESS_RULES.REVIEW.ALLOWED_STATUSES.includes(data.status as any)
    ) {
      errors.push(
        this.createError(
          "status",
          `Status must be one of: ${BUSINESS_RULES.REVIEW.ALLOWED_STATUSES.join(
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
   * Validate review update data
   */
  validateUpdate(data: {
    rating?: number;
    comment?: string;
    status?: string;
  }): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    // Rating validation (if provided)
    if (data.rating !== undefined && data.rating !== null) {
      if (
        data.rating < BUSINESS_RULES.REVIEW.MIN_RATING ||
        data.rating > BUSINESS_RULES.REVIEW.MAX_RATING
      ) {
        errors.push(
          this.createError(
            "rating",
            `Rating must be between ${BUSINESS_RULES.REVIEW.MIN_RATING} and ${BUSINESS_RULES.REVIEW.MAX_RATING}`,
            "RANGE"
          )
        );
      }

      if (!Number.isInteger(data.rating)) {
        errors.push(
          this.createError("rating", "Rating must be a whole number", "INVALID")
        );
      }
    }

    // Comment validation (if provided)
    if (data.comment !== undefined) {
      if (
        data.comment &&
        data.comment.length < BUSINESS_RULES.REVIEW.MIN_COMMENT_LENGTH
      ) {
        errors.push(
          this.createError(
            "comment",
            `Comment must be at least ${BUSINESS_RULES.REVIEW.MIN_COMMENT_LENGTH} characters long`,
            "MIN_LENGTH"
          )
        );
      }

      if (
        data.comment &&
        data.comment.length > BUSINESS_RULES.REVIEW.MAX_COMMENT_LENGTH
      ) {
        errors.push(
          this.createError(
            "comment",
            `Comment cannot exceed ${BUSINESS_RULES.REVIEW.MAX_COMMENT_LENGTH} characters`,
            "MAX_LENGTH"
          )
        );
      }

      // Check for inappropriate content patterns
      if (data.comment && this.containsInappropriateContent(data.comment)) {
        errors.push(
          this.createError(
            "comment",
            "Comment contains inappropriate content",
            "INAPPROPRIATE"
          )
        );
      }
    }

    // Status validation (if provided)
    if (
      data.status &&
      !BUSINESS_RULES.REVIEW.ALLOWED_STATUSES.includes(data.status as any)
    ) {
      errors.push(
        this.createError(
          "status",
          `Status must be one of: ${BUSINESS_RULES.REVIEW.ALLOWED_STATUSES.join(
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
   * Validate review moderation data
   */
  validateModerationUpdate(data: {
    status?: string;
    admin_notes?: string;
  }): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    // Status validation
    if (!data.status) {
      errors.push(
        this.createError(
          "status",
          "Status is required for moderation",
          "REQUIRED"
        )
      );
    } else if (
      !BUSINESS_RULES.REVIEW.ALLOWED_STATUSES.includes(data.status as any)
    ) {
      errors.push(
        this.createError(
          "status",
          `Status must be one of: ${BUSINESS_RULES.REVIEW.ALLOWED_STATUSES.join(
            ", "
          )}`,
          "INVALID"
        )
      );
    }

    // Admin notes validation
    if (data.admin_notes && data.admin_notes.length > 500) {
      errors.push(
        this.createError(
          "admin_notes",
          "Admin notes cannot exceed 500 characters",
          "MAX_LENGTH"
        )
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check for inappropriate content patterns
   */
  private containsInappropriateContent(text: string): boolean {
    const inappropriatePatterns = [
      /\b(spam|fake|scam|fraud)\b/i,
      /\b(hate|offensive|inappropriate)\b/i,
      /(.)\1{4,}/, // Repeated characters (spammy)
      /[A-Z]{5,}/, // All caps words (shouting)
    ];

    return inappropriatePatterns.some((pattern) => pattern.test(text));
  }

  /**
   * Validate rating distribution for suspicious patterns
   */
  validateRatingPattern(ratings: number[]): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    if (ratings.length === 0) {
      return { isValid: true, errors: [] };
    }

    // Check for suspicious rating patterns
    const uniqueRatings = new Set(ratings);

    // Too many identical ratings might indicate fake reviews
    if (ratings.length >= 5 && uniqueRatings.size === 1) {
      errors.push(
        this.createError(
          "ratings",
          "Suspicious rating pattern detected: all identical ratings",
          "SUSPICIOUS"
        )
      );
    }

    // Sudden spike in very high or very low ratings
    const highRatings = ratings.filter((r) => r >= 4).length;
    const lowRatings = ratings.filter((r) => r <= 2).length;
    const highRatio = highRatings / ratings.length;
    const lowRatio = lowRatings / ratings.length;

    if (ratings.length >= 10 && (highRatio > 0.9 || lowRatio > 0.9)) {
      errors.push(
        this.createError(
          "ratings",
          "Suspicious rating pattern detected: unusual distribution",
          "SUSPICIOUS"
        )
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
