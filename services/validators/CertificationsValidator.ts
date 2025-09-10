import { BUSINESS_RULES } from "../config";
import { logger } from "../logger";
import { ValidationError, ValidationResult } from "../types";
import { BaseValidator } from "./BaseValidator";

export interface CertificationCreateData {
  farmer_id: string;
  certification_type: string;
  certificate_number: string;
  issuing_body: string;
  issue_date: string;
  expiry_date: string;
  document_urls?: string[];
  verification_notes?: string;
}

export interface CertificationUpdateData {
  certification_type?: string;
  certificate_number?: string;
  issuing_body?: string;
  issue_date?: string;
  expiry_date?: string;
  document_urls?: string[];
  verification_notes?: string;
}

export class CertificationsValidator extends BaseValidator {
  private static instance: CertificationsValidator;

  public static getInstance(): CertificationsValidator {
    if (!CertificationsValidator.instance) {
      CertificationsValidator.instance = new CertificationsValidator();
    }
    return CertificationsValidator.instance;
  }

  /**
   * Validate certification creation data
   */
  async validateCreate(
    data: CertificationCreateData
  ): Promise<ValidationResult> {
    try {
      const errors: ValidationError[] = [];

      // Validate required fields
      if (!data.farmer_id?.trim()) {
        errors.push({
          field: "farmer_id",
          message: "Farmer ID is required",
          code: "REQUIRED",
        });
      }

      if (!data.certification_type?.trim()) {
        errors.push({
          field: "certification_type",
          message: "Certification type is required",
          code: "REQUIRED",
        });
      } else if (!this.isValidCertificationType(data.certification_type)) {
        errors.push({
          field: "certification_type",
          message: `Invalid certification type. Must be one of: ${BUSINESS_RULES.CERTIFICATION.ALLOWED_TYPES.join(
            ", "
          )}`,
          code: "INVALID_TYPE",
        });
      }

      if (!data.certificate_number?.trim()) {
        errors.push({
          field: "certificate_number",
          message: "Certificate number is required",
          code: "REQUIRED",
        });
      } else if (!this.isValidCertificateNumber(data.certificate_number)) {
        errors.push({
          field: "certificate_number",
          message:
            "Certificate number must be alphanumeric and between 5-50 characters",
          code: "INVALID_FORMAT",
        });
      }

      if (!data.issuing_body?.trim()) {
        errors.push({
          field: "issuing_body",
          message: "Issuing body is required",
          code: "REQUIRED",
        });
      } else if (
        data.issuing_body.length < 2 ||
        data.issuing_body.length > 100
      ) {
        errors.push({
          field: "issuing_body",
          message: "Issuing body must be between 2-100 characters",
          code: "INVALID_LENGTH",
        });
      }

      if (!data.issue_date) {
        errors.push({
          field: "issue_date",
          message: "Issue date is required",
          code: "REQUIRED",
        });
      } else if (!this.isValidDate(data.issue_date)) {
        errors.push({
          field: "issue_date",
          message: "Invalid issue date format",
          code: "INVALID_FORMAT",
        });
      }

      if (!data.expiry_date) {
        errors.push({
          field: "expiry_date",
          message: "Expiry date is required",
          code: "REQUIRED",
        });
      } else if (!this.isValidDate(data.expiry_date)) {
        errors.push({
          field: "expiry_date",
          message: "Invalid expiry date format",
          code: "INVALID_FORMAT",
        });
      }

      // Validate date logic
      if (data.issue_date && data.expiry_date) {
        const issueDate = new Date(data.issue_date);
        const expiryDate = new Date(data.expiry_date);

        if (expiryDate <= issueDate) {
          errors.push({
            field: "expiry_date",
            message: "Expiry date must be after issue date",
            code: "INVALID_DATE_RANGE",
          });
        }

        // Check if certificate validity period is reasonable
        const validityMonths = this.getMonthsDifference(issueDate, expiryDate);
        if (
          validityMonths >
          BUSINESS_RULES.CERTIFICATION.MAX_VALIDITY_YEARS * 12
        ) {
          errors.push({
            field: "expiry_date",
            message: `Certificate validity cannot exceed ${BUSINESS_RULES.CERTIFICATION.MAX_VALIDITY_YEARS} years`,
            code: "VALIDITY_TOO_LONG",
          });
        }

        if (validityMonths < BUSINESS_RULES.CERTIFICATION.MIN_VALIDITY_MONTHS) {
          errors.push({
            field: "expiry_date",
            message: `Certificate validity must be at least ${BUSINESS_RULES.CERTIFICATION.MIN_VALIDITY_MONTHS} months`,
            code: "VALIDITY_TOO_SHORT",
          });
        }
      }

      // Validate document URLs if provided
      if (data.document_urls && data.document_urls.length > 0) {
        const maxDocs = 10; // Default max documents
        if (data.document_urls.length > maxDocs) {
          errors.push({
            field: "document_urls",
            message: `Maximum ${maxDocs} documents allowed`,
            code: "TOO_MANY_DOCUMENTS",
          });
        }

        data.document_urls.forEach((url, index) => {
          if (!this.isValidUrl(url)) {
            errors.push({
              field: `document_urls[${index}]`,
              message: "Invalid document URL",
              code: "INVALID_URL",
            });
          }
        });
      } else {
        // Check if documents are required for this certification type
        if (this.requiresDocuments(data.certification_type)) {
          errors.push({
            field: "document_urls",
            message: "Document upload is required for this certification type",
            code: "DOCUMENTS_REQUIRED",
          });
        }
      }

      // Validate verification notes if provided
      if (
        data.verification_notes &&
        data.verification_notes.length >
          BUSINESS_RULES.CERTIFICATION.MAX_NOTES_LENGTH
      ) {
        errors.push({
          field: "verification_notes",
          message: `Verification notes cannot exceed ${BUSINESS_RULES.CERTIFICATION.MAX_NOTES_LENGTH} characters`,
          code: "NOTES_TOO_LONG",
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      logger.error("Error validating certification creation:", error as Error);
      return {
        isValid: false,
        errors: [
          {
            field: "general",
            message: "Validation error occurred",
            code: "VALIDATION_ERROR",
          },
        ],
      };
    }
  }

  /**
   * Validate certification update data
   */
  async validateCertificationUpdate(
    certificationId: string,
    data: CertificationUpdateData,
    currentStatus: string
  ): Promise<ValidationResult> {
    try {
      const errors: ValidationError[] = [];

      // Check if certification can be updated in current status
      if (!this.canUpdateInStatus(currentStatus)) {
        errors.push({
          field: "status",
          message: `Cannot update certification in ${currentStatus} status`,
          code: "UPDATE_NOT_ALLOWED",
        });
        return { isValid: false, errors };
      }

      // Validate certification type if provided
      if (data.certification_type !== undefined) {
        if (!data.certification_type.trim()) {
          errors.push({
            field: "certification_type",
            message: "Certification type cannot be empty",
            code: "REQUIRED",
          });
        } else if (!this.isValidCertificationType(data.certification_type)) {
          errors.push({
            field: "certification_type",
            message: `Invalid certification type. Must be one of: ${BUSINESS_RULES.CERTIFICATION.ALLOWED_TYPES.join(
              ", "
            )}`,
            code: "INVALID_TYPE",
          });
        }
      }

      // Validate certificate number if provided
      if (data.certificate_number !== undefined) {
        if (!data.certificate_number.trim()) {
          errors.push({
            field: "certificate_number",
            message: "Certificate number cannot be empty",
            code: "REQUIRED",
          });
        } else if (!this.isValidCertificateNumber(data.certificate_number)) {
          errors.push({
            field: "certificate_number",
            message:
              "Certificate number must be alphanumeric and between 5-50 characters",
            code: "INVALID_FORMAT",
          });
        }
      }

      // Validate issuing body if provided
      if (data.issuing_body !== undefined) {
        if (!data.issuing_body.trim()) {
          errors.push({
            field: "issuing_body",
            message: "Issuing body cannot be empty",
            code: "REQUIRED",
          });
        } else if (
          data.issuing_body.length < 2 ||
          data.issuing_body.length > 100
        ) {
          errors.push({
            field: "issuing_body",
            message: "Issuing body must be between 2-100 characters",
            code: "INVALID_LENGTH",
          });
        }
      }

      // Validate dates if provided
      if (data.issue_date !== undefined && !this.isValidDate(data.issue_date)) {
        errors.push({
          field: "issue_date",
          message: "Invalid issue date format",
          code: "INVALID_FORMAT",
        });
      }

      if (
        data.expiry_date !== undefined &&
        !this.isValidDate(data.expiry_date)
      ) {
        errors.push({
          field: "expiry_date",
          message: "Invalid expiry date format",
          code: "INVALID_FORMAT",
        });
      }

      // Validate date logic if both dates are provided or updated
      if (data.issue_date && data.expiry_date) {
        const issueDate = new Date(data.issue_date);
        const expiryDate = new Date(data.expiry_date);

        if (expiryDate <= issueDate) {
          errors.push({
            field: "expiry_date",
            message: "Expiry date must be after issue date",
            code: "INVALID_DATE_RANGE",
          });
        }

        const validityMonths = this.getMonthsDifference(issueDate, expiryDate);
        if (
          validityMonths >
          BUSINESS_RULES.CERTIFICATION.MAX_VALIDITY_YEARS * 12
        ) {
          errors.push({
            field: "expiry_date",
            message: `Certificate validity cannot exceed ${BUSINESS_RULES.CERTIFICATION.MAX_VALIDITY_YEARS} years`,
            code: "VALIDITY_TOO_LONG",
          });
        }
      }

      // Validate document URLs if provided
      if (data.document_urls !== undefined) {
        const maxDocs = 10;
        if (data.document_urls.length > maxDocs) {
          errors.push({
            field: "document_urls",
            message: `Maximum ${maxDocs} documents allowed`,
            code: "TOO_MANY_DOCUMENTS",
          });
        }

        data.document_urls.forEach((url, index) => {
          if (!this.isValidUrl(url)) {
            errors.push({
              field: `document_urls[${index}]`,
              message: "Invalid document URL",
              code: "INVALID_URL",
            });
          }
        });
      }

      // Validate verification notes if provided
      if (
        data.verification_notes !== undefined &&
        data.verification_notes.length >
          BUSINESS_RULES.CERTIFICATION.MAX_NOTES_LENGTH
      ) {
        errors.push({
          field: "verification_notes",
          message: `Verification notes cannot exceed ${BUSINESS_RULES.CERTIFICATION.MAX_NOTES_LENGTH} characters`,
          code: "NOTES_TOO_LONG",
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      logger.error("Error validating certification update:", error as Error);
      return {
        isValid: false,
        errors: [
          {
            field: "general",
            message: "Validation error occurred",
            code: "VALIDATION_ERROR",
          },
        ],
      };
    }
  }

  /**
   * Validate status transition
   */
  async validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): Promise<ValidationResult> {
    try {
      const errors: ValidationError[] = [];

      if (
        !(
          BUSINESS_RULES.CERTIFICATION.ALLOWED_STATUSES as readonly string[]
        ).includes(newStatus)
      ) {
        errors.push({
          field: "status",
          message: `Invalid status. Must be one of: ${BUSINESS_RULES.CERTIFICATION.ALLOWED_STATUSES.join(
            ", "
          )}`,
          code: "INVALID_STATUS",
        });
      }

      // Check valid status transitions
      const validTransitions = this.getValidStatusTransitions(currentStatus);
      if (!validTransitions.includes(newStatus)) {
        errors.push({
          field: "status",
          message: `Invalid status transition from ${currentStatus} to ${newStatus}`,
          code: "INVALID_TRANSITION",
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      logger.error("Error validating status transition:", error as Error);
      return {
        isValid: false,
        errors: [
          {
            field: "general",
            message: "Validation error occurred",
            code: "VALIDATION_ERROR",
          },
        ],
      };
    }
  }

  /**
   * Validate verification data
   */
  async validateVerification(
    verificationNotes?: string,
    verifiedBy?: string
  ): Promise<ValidationResult> {
    try {
      const errors: ValidationError[] = [];

      if (verifiedBy && verifiedBy.trim().length < 2) {
        errors.push({
          field: "verified_by",
          message: "Verified by must be at least 2 characters",
          code: "INVALID_LENGTH",
        });
      }

      if (
        verificationNotes &&
        verificationNotes.length > BUSINESS_RULES.CERTIFICATION.MAX_NOTES_LENGTH
      ) {
        errors.push({
          field: "verification_notes",
          message: `Verification notes cannot exceed ${BUSINESS_RULES.CERTIFICATION.MAX_NOTES_LENGTH} characters`,
          code: "NOTES_TOO_LONG",
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      logger.error("Error validating verification data:", error as Error);
      return {
        isValid: false,
        errors: [
          {
            field: "general",
            message: "Validation error occurred",
            code: "VALIDATION_ERROR",
          },
        ],
      };
    }
  }

  // Helper methods

  private isValidCertificationType(type: string): boolean {
    return (
      BUSINESS_RULES.CERTIFICATION.ALLOWED_TYPES as readonly string[]
    ).includes(type);
  }

  private isValidCertificateNumber(certificateNumber: string): boolean {
    const regex = /^[A-Za-z0-9\-_]{5,50}$/;
    return regex.test(certificateNumber);
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return (
      !isNaN(date.getTime()) && dateString === date.toISOString().split("T")[0]
    );
  }

  protected isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private getMonthsDifference(startDate: Date, endDate: Date): number {
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    return months + endDate.getMonth() - startDate.getMonth();
  }

  private requiresDocuments(certificationType: string): boolean {
    // All certification types require documents for verification
    return (
      BUSINESS_RULES.CERTIFICATION.ALLOWED_TYPES as readonly string[]
    ).includes(certificationType);
  }

  private canUpdateInStatus(status: string): boolean {
    // Can update in pending status, limited updates in other statuses
    return ["pending", "under_review"].includes(status);
  }

  private getValidStatusTransitions(currentStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      pending: ["verified", "rejected"],
      verified: ["expired", "suspended"],
      rejected: ["pending"],
      expired: ["pending"], // Can re-apply
      suspended: ["verified", "rejected"],
    };

    return transitions[currentStatus] || [];
  }
}
