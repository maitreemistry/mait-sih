import { TABLE_NAMES } from "../config";
import { EnhancedBaseService } from "../database";
import { logger } from "../logger";
import { ReviewsRepository } from "../repositories/ReviewsRepository";
import { ServiceErrorCode, ServiceResponse } from "../types";
import { ReviewsValidator } from "../validators/ReviewsValidator";

interface CreateReviewData {
  reviewer_id: string;
  listing_id: string;
  rating: number;
  comment?: string;
  status?: string;
}

interface UpdateReviewData {
  rating?: number;
  comment?: string;
  status?: string;
}

export class ReviewsService extends EnhancedBaseService {
  private reviewsValidator: ReviewsValidator;

  constructor() {
    super(new ReviewsRepository(), "Review");
    this.reviewsValidator = new ReviewsValidator();
  }

  protected getTableName(): string {
    return TABLE_NAMES.REVIEWS;
  }

  /**
   * Create a new review
   */
  async createReview(data: CreateReviewData): Promise<ServiceResponse<any>> {
    try {
      this.logBusinessEvent("createReview", { listingId: data.listing_id });

      // Validate input data
      const validation = this.reviewsValidator.validateCreate(data);
      if (!validation.isValid) {
        const serviceError = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          "Invalid review data",
          validation.errors,
          "createReview"
        );
        return this.createResponse(null, serviceError);
      }

      // Check if user has already reviewed this listing
      const repository = this.repository as ReviewsRepository;
      const hasReviewed = await repository.hasUserReviewed(
        data.reviewer_id,
        data.listing_id
      );
      if (hasReviewed) {
        const serviceError = this.handleRepositoryError(
          new Error("You have already reviewed this listing"),
          "createReview"
        );
        return this.createResponse(null, serviceError);
      }

      // Set default status if not provided
      const reviewData = {
        ...data,
        status: data.status || "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await repository.create(reviewData);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "createReview"
        );
        return this.createResponse(null, serviceError);
      }

      logger.info(`Review created successfully for listing ${data.listing_id}`);
      return this.createResponse(result.data, null);
    } catch (error) {
      logger.error("Error creating review:", error as Error);
      const serviceError = this.handleRepositoryError(
        error as Error,
        "createReview"
      );
      return this.createResponse(null, serviceError);
    }
  }

  /**
   * Get reviews for a specific listing
   */
  async getReviewsByListing(listingId: string): Promise<ServiceResponse<any>> {
    try {
      this.logBusinessEvent("getReviewsByListing", { listingId });

      const repository = this.repository as ReviewsRepository;
      const reviews = await repository.findByListing(listingId);
      const averageRating = await repository.getAverageRating(listingId);

      return this.createResponse(
        {
          reviews,
          summary: averageRating,
        },
        null
      );
    } catch (error) {
      logger.error(
        `Error getting reviews for listing ${listingId}:`,
        error as Error
      );
      const serviceError = this.handleRepositoryError(
        error as Error,
        "getReviewsByListing"
      );
      return this.createResponse(null, serviceError);
    }
  }

  /**
   * Get reviews by a specific reviewer
   */
  async getReviewsByReviewer(
    reviewerId: string
  ): Promise<ServiceResponse<any[]>> {
    try {
      this.logBusinessEvent("getReviewsByReviewer", { reviewerId });

      const repository = this.repository as ReviewsRepository;
      const reviews = await repository.findByReviewer(reviewerId);
      return this.createResponse(reviews, null);
    } catch (error) {
      logger.error(
        `Error getting reviews by reviewer ${reviewerId}:`,
        error as Error
      );
      const serviceError = this.handleRepositoryError(
        error as Error,
        "getReviewsByReviewer"
      );
      return this.createResponse<any[]>([], serviceError);
    }
  }

  /**
   * Get all reviews for a farmer's listings
   */
  async getReviewsByFarmer(farmerId: string): Promise<ServiceResponse<any[]>> {
    try {
      this.logBusinessEvent("getReviewsByFarmer", { farmerId });

      const repository = this.repository as ReviewsRepository;
      const reviews = await repository.findByFarmer(farmerId);
      return this.createResponse(reviews, null);
    } catch (error) {
      logger.error(
        `Error getting reviews for farmer ${farmerId}:`,
        error as Error
      );
      const serviceError = this.handleRepositoryError(
        error as Error,
        "getReviewsByFarmer"
      );
      return this.createResponse<any[]>([], serviceError);
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(
    id: string,
    data: UpdateReviewData
  ): Promise<ServiceResponse<any>> {
    try {
      this.logBusinessEvent("updateReview", { id });

      // Validate update data
      const validation = this.reviewsValidator.validateUpdate(data);
      if (!validation.isValid) {
        const serviceError = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          "Invalid update data",
          validation.errors,
          "updateReview"
        );
        return this.createResponse(null, serviceError);
      }

      // Check if review exists
      const existingResult = await this.repository.findById(id);
      if (existingResult.error || !existingResult.data) {
        const serviceError = this.handleRepositoryError(
          new Error("Review not found"),
          "updateReview"
        );
        return this.createResponse(null, serviceError);
      }

      // Update review
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const result = await this.repository.update(id, updateData);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "updateReview"
        );
        return this.createResponse(null, serviceError);
      }

      logger.info(`Review ${id} updated successfully`);
      return this.createResponse(result.data, null);
    } catch (error) {
      logger.error(`Error updating review ${id}:`, error as Error);
      const serviceError = this.handleRepositoryError(
        error as Error,
        "updateReview"
      );
      return this.createResponse(null, serviceError);
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(id: string): Promise<ServiceResponse<boolean>> {
    try {
      this.logBusinessEvent("deleteReview", { id });

      const existsResult = await this.repository.findById(id);
      if (existsResult.error || !existsResult.data) {
        const serviceError = this.handleRepositoryError(
          new Error("Review not found"),
          "deleteReview"
        );
        return this.createResponse<boolean>(false, serviceError);
      }

      const result = await this.repository.delete(id);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "deleteReview"
        );
        return this.createResponse<boolean>(false, serviceError);
      }

      logger.info(`Review ${id} deleted successfully`);
      return this.createResponse<boolean>(true, null);
    } catch (error) {
      logger.error(`Error deleting review ${id}:`, error as Error);
      const serviceError = this.handleRepositoryError(
        error as Error,
        "deleteReview"
      );
      return this.createResponse<boolean>(false, serviceError);
    }
  }

  /**
   * Moderate reviews (admin function)
   */
  async moderateReview(
    id: string,
    data: { status: string; admin_notes?: string }
  ): Promise<ServiceResponse<any>> {
    try {
      this.logBusinessEvent("moderateReview", { id, status: data.status });

      // Validate moderation data
      const validation = this.reviewsValidator.validateModerationUpdate(data);
      if (!validation.isValid) {
        const serviceError = this.createError(
          ServiceErrorCode.VALIDATION_ERROR,
          "Invalid moderation data",
          validation.errors,
          "moderateReview"
        );
        return this.createResponse(null, serviceError);
      }

      // Check if review exists
      const existingResult = await this.repository.findById(id);
      if (existingResult.error || !existingResult.data) {
        const serviceError = this.handleRepositoryError(
          new Error("Review not found"),
          "moderateReview"
        );
        return this.createResponse(null, serviceError);
      }

      // Update review status
      const updateData = {
        ...data,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await this.repository.update(id, updateData);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "moderateReview"
        );
        return this.createResponse(null, serviceError);
      }

      logger.info(`Review ${id} moderated with status: ${data.status}`);
      return this.createResponse(result.data, null);
    } catch (error) {
      logger.error(`Error moderating review ${id}:`, error as Error);
      const serviceError = this.handleRepositoryError(
        error as Error,
        "moderateReview"
      );
      return this.createResponse(null, serviceError);
    }
  }

  /**
   * Get pending reviews for moderation
   */
  async getPendingReviews(): Promise<ServiceResponse<any[]>> {
    try {
      this.logBusinessEvent("getPendingReviews", {});

      const repository = this.repository as ReviewsRepository;
      const reviews = await repository.findPendingReviews();
      return this.createResponse(reviews, null);
    } catch (error) {
      logger.error("Error getting pending reviews:", error as Error);
      const serviceError = this.handleRepositoryError(
        error as Error,
        "getPendingReviews"
      );
      return this.createResponse<any[]>([], serviceError);
    }
  }

  /**
   * Get average rating for a listing
   */
  async getListingRating(
    listingId: string
  ): Promise<ServiceResponse<{ average: number; count: number }>> {
    try {
      this.logBusinessEvent("getListingRating", { listingId });

      const repository = this.repository as ReviewsRepository;
      const rating = await repository.getAverageRating(listingId);
      return this.createResponse(rating, null);
    } catch (error) {
      logger.error(
        `Error getting rating for listing ${listingId}:`,
        error as Error
      );
      const serviceError = this.handleRepositoryError(
        error as Error,
        "getListingRating"
      );
      return this.createResponse<{ average: number; count: number }>(
        { average: 0, count: 0 },
        serviceError
      );
    }
  }

  /**
   * Analyze review patterns for fraud detection
   */
  async analyzeReviewPatterns(
    listingId: string
  ): Promise<ServiceResponse<{ suspicious: boolean; details: string[] }>> {
    try {
      this.logBusinessEvent("analyzeReviewPatterns", { listingId });

      const repository = this.repository as ReviewsRepository;
      const reviews = await repository.findByListing(listingId);
      const ratings = reviews.map((review: any) => review.rating);

      const validation = this.reviewsValidator.validateRatingPattern(ratings);

      return this.createResponse(
        {
          suspicious: !validation.isValid,
          details: validation.errors.map((error) => error.message),
        },
        null
      );
    } catch (error) {
      logger.error(
        `Error analyzing review patterns for listing ${listingId}:`,
        error as Error
      );
      const serviceError = this.handleRepositoryError(
        error as Error,
        "analyzeReviewPatterns"
      );
      return this.createResponse<{ suspicious: boolean; details: string[] }>(
        { suspicious: false, details: [] },
        serviceError
      );
    }
  }
}
