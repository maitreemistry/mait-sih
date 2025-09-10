import { BUSINESS_RULES } from "../config";
import { logger } from "../logger";
import { ValidationError, ValidationResult } from "../types";
import { BaseValidator } from "./BaseValidator";

export interface QualityReportCreateData {
  product_id: string;
  inspector_id: string;
  farmer_id: string;
  report_date: string;
  overall_grade: string;
  overall_score: number;
  parameters: Record<string, any>;
  defects_found?: string[];
  defect_percentage: number;
  quality_notes: string;
  recommendations?: string;
}

export interface QualityReportUpdateData {
  overall_grade?: string;
  overall_score?: number;
  parameters?: Record<string, any>;
  defects_found?: string[];
  defect_percentage?: number;
  quality_notes?: string;
  recommendations?: string;
}

export class QualityReportsValidator extends BaseValidator {
  private static instance: QualityReportsValidator;

  public static getInstance(): QualityReportsValidator {
    if (!QualityReportsValidator.instance) {
      QualityReportsValidator.instance = new QualityReportsValidator();
    }
    return QualityReportsValidator.instance;
  }

  /**
   * Validate quality report creation data
   */
  async validateCreate(
    data: QualityReportCreateData
  ): Promise<ValidationResult> {
    try {
      const errors: ValidationError[] = [];

      // Validate required fields
      if (!data.product_id?.trim()) {
        errors.push({
          field: "product_id",
          message: "Product ID is required",
          code: "REQUIRED",
        });
      }

      if (!data.inspector_id?.trim()) {
        errors.push({
          field: "inspector_id",
          message: "Inspector ID is required",
          code: "REQUIRED",
        });
      }

      if (!data.farmer_id?.trim()) {
        errors.push({
          field: "farmer_id",
          message: "Farmer ID is required",
          code: "REQUIRED",
        });
      }

      if (!data.report_date) {
        errors.push({
          field: "report_date",
          message: "Report date is required",
          code: "REQUIRED",
        });
      } else if (!this.isValidDate(data.report_date)) {
        errors.push({
          field: "report_date",
          message: "Invalid report date format",
          code: "INVALID_FORMAT",
        });
      } else if (this.isFutureDate(data.report_date)) {
        errors.push({
          field: "report_date",
          message: "Report date cannot be in the future",
          code: "INVALID_DATE",
        });
      }

      // Validate grade
      if (!data.overall_grade?.trim()) {
        errors.push({
          field: "overall_grade",
          message: "Overall grade is required",
          code: "REQUIRED",
        });
      } else if (!this.isValidGrade(data.overall_grade)) {
        errors.push({
          field: "overall_grade",
          message: `Invalid grade. Must be one of: ${BUSINESS_RULES.QUALITY_REPORT.ALLOWED_GRADES.join(
            ", "
          )}`,
          code: "INVALID_GRADE",
        });
      }

      // Validate score
      if (data.overall_score === undefined || data.overall_score === null) {
        errors.push({
          field: "overall_score",
          message: "Overall score is required",
          code: "REQUIRED",
        });
      } else if (!this.isValidScore(data.overall_score)) {
        errors.push({
          field: "overall_score",
          message: `Score must be between ${BUSINESS_RULES.QUALITY_REPORT.MIN_SCORE} and ${BUSINESS_RULES.QUALITY_REPORT.MAX_SCORE}`,
          code: "INVALID_SCORE",
        });
      }

      // Validate grade-score consistency
      if (data.overall_grade && data.overall_score !== undefined) {
        if (
          !this.isGradeScoreConsistent(data.overall_grade, data.overall_score)
        ) {
          errors.push({
            field: "overall_score",
            message: "Score is not consistent with the assigned grade",
            code: "INCONSISTENT_GRADE_SCORE",
          });
        }
      }

      // Validate parameters
      if (!data.parameters || typeof data.parameters !== "object") {
        errors.push({
          field: "parameters",
          message: "Parameters object is required",
          code: "REQUIRED",
        });
      } else {
        const paramValidation = this.validateParameters(data.parameters);
        if (!paramValidation.isValid) {
          errors.push(...paramValidation.errors);
        }
      }

      // Validate defect percentage
      if (
        data.defect_percentage === undefined ||
        data.defect_percentage === null
      ) {
        errors.push({
          field: "defect_percentage",
          message: "Defect percentage is required",
          code: "REQUIRED",
        });
      } else if (data.defect_percentage < 0 || data.defect_percentage > 100) {
        errors.push({
          field: "defect_percentage",
          message: "Defect percentage must be between 0 and 100",
          code: "INVALID_PERCENTAGE",
        });
      } else if (
        data.defect_percentage >
        BUSINESS_RULES.QUALITY_REPORT.MAX_DEFECT_PERCENTAGE
      ) {
        errors.push({
          field: "defect_percentage",
          message: `Defect percentage cannot exceed ${BUSINESS_RULES.QUALITY_REPORT.MAX_DEFECT_PERCENTAGE}%`,
          code: "EXCESSIVE_DEFECTS",
        });
      }

      // Validate defects found array if provided
      if (data.defects_found && Array.isArray(data.defects_found)) {
        if (data.defects_found.length > 20) {
          errors.push({
            field: "defects_found",
            message: "Maximum 20 defect types allowed",
            code: "TOO_MANY_DEFECTS",
          });
        }

        data.defects_found.forEach((defect, index) => {
          if (
            !defect ||
            typeof defect !== "string" ||
            defect.trim().length === 0
          ) {
            errors.push({
              field: `defects_found[${index}]`,
              message: "Defect description cannot be empty",
              code: "EMPTY_DEFECT",
            });
          } else if (defect.length > 100) {
            errors.push({
              field: `defects_found[${index}]`,
              message: "Defect description cannot exceed 100 characters",
              code: "DEFECT_TOO_LONG",
            });
          }
        });
      }

      // Validate quality notes
      if (!data.quality_notes?.trim()) {
        errors.push({
          field: "quality_notes",
          message: "Quality notes are required",
          code: "REQUIRED",
        });
      } else if (
        data.quality_notes.length >
        BUSINESS_RULES.QUALITY_REPORT.MAX_NOTES_LENGTH
      ) {
        errors.push({
          field: "quality_notes",
          message: `Quality notes cannot exceed ${BUSINESS_RULES.QUALITY_REPORT.MAX_NOTES_LENGTH} characters`,
          code: "NOTES_TOO_LONG",
        });
      }

      // Validate recommendations if provided
      if (
        data.recommendations &&
        data.recommendations.length >
          BUSINESS_RULES.QUALITY_REPORT.MAX_NOTES_LENGTH
      ) {
        errors.push({
          field: "recommendations",
          message: `Recommendations cannot exceed ${BUSINESS_RULES.QUALITY_REPORT.MAX_NOTES_LENGTH} characters`,
          code: "RECOMMENDATIONS_TOO_LONG",
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      logger.error("Error validating quality report creation:", error as Error);
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
   * Validate quality report update data
   */
  async validateReportUpdate(
    reportId: string,
    data: QualityReportUpdateData,
    currentStatus: string
  ): Promise<ValidationResult> {
    try {
      const errors: ValidationError[] = [];

      // Check if report can be updated in current status
      if (!this.canUpdateInStatus(currentStatus)) {
        errors.push({
          field: "status",
          message: `Cannot update report in ${currentStatus} status`,
          code: "UPDATE_NOT_ALLOWED",
        });
        return { isValid: false, errors };
      }

      // Validate grade if provided
      if (data.overall_grade !== undefined) {
        if (!data.overall_grade.trim()) {
          errors.push({
            field: "overall_grade",
            message: "Overall grade cannot be empty",
            code: "REQUIRED",
          });
        } else if (!this.isValidGrade(data.overall_grade)) {
          errors.push({
            field: "overall_grade",
            message: `Invalid grade. Must be one of: ${BUSINESS_RULES.QUALITY_REPORT.ALLOWED_GRADES.join(
              ", "
            )}`,
            code: "INVALID_GRADE",
          });
        }
      }

      // Validate score if provided
      if (data.overall_score !== undefined) {
        if (!this.isValidScore(data.overall_score)) {
          errors.push({
            field: "overall_score",
            message: `Score must be between ${BUSINESS_RULES.QUALITY_REPORT.MIN_SCORE} and ${BUSINESS_RULES.QUALITY_REPORT.MAX_SCORE}`,
            code: "INVALID_SCORE",
          });
        }
      }

      // Validate grade-score consistency if both provided
      if (data.overall_grade && data.overall_score !== undefined) {
        if (
          !this.isGradeScoreConsistent(data.overall_grade, data.overall_score)
        ) {
          errors.push({
            field: "overall_score",
            message: "Score is not consistent with the assigned grade",
            code: "INCONSISTENT_GRADE_SCORE",
          });
        }
      }

      // Validate parameters if provided
      if (data.parameters !== undefined) {
        if (!data.parameters || typeof data.parameters !== "object") {
          errors.push({
            field: "parameters",
            message: "Parameters must be a valid object",
            code: "INVALID_PARAMETERS",
          });
        } else {
          const paramValidation = this.validateParameters(data.parameters);
          if (!paramValidation.isValid) {
            errors.push(...paramValidation.errors);
          }
        }
      }

      // Validate defect percentage if provided
      if (data.defect_percentage !== undefined) {
        if (data.defect_percentage < 0 || data.defect_percentage > 100) {
          errors.push({
            field: "defect_percentage",
            message: "Defect percentage must be between 0 and 100",
            code: "INVALID_PERCENTAGE",
          });
        }
      }

      // Validate defects found if provided
      if (
        data.defects_found !== undefined &&
        Array.isArray(data.defects_found)
      ) {
        if (data.defects_found.length > 20) {
          errors.push({
            field: "defects_found",
            message: "Maximum 20 defect types allowed",
            code: "TOO_MANY_DEFECTS",
          });
        }

        data.defects_found.forEach((defect, index) => {
          if (
            !defect ||
            typeof defect !== "string" ||
            defect.trim().length === 0
          ) {
            errors.push({
              field: `defects_found[${index}]`,
              message: "Defect description cannot be empty",
              code: "EMPTY_DEFECT",
            });
          }
        });
      }

      // Validate quality notes if provided
      if (data.quality_notes !== undefined) {
        if (!data.quality_notes.trim()) {
          errors.push({
            field: "quality_notes",
            message: "Quality notes cannot be empty",
            code: "REQUIRED",
          });
        } else if (
          data.quality_notes.length >
          BUSINESS_RULES.QUALITY_REPORT.MAX_NOTES_LENGTH
        ) {
          errors.push({
            field: "quality_notes",
            message: `Quality notes cannot exceed ${BUSINESS_RULES.QUALITY_REPORT.MAX_NOTES_LENGTH} characters`,
            code: "NOTES_TOO_LONG",
          });
        }
      }

      // Validate recommendations if provided
      if (
        data.recommendations !== undefined &&
        data.recommendations.length >
          BUSINESS_RULES.QUALITY_REPORT.MAX_NOTES_LENGTH
      ) {
        errors.push({
          field: "recommendations",
          message: `Recommendations cannot exceed ${BUSINESS_RULES.QUALITY_REPORT.MAX_NOTES_LENGTH} characters`,
          code: "RECOMMENDATIONS_TOO_LONG",
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      logger.error("Error validating quality report update:", error as Error);
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
          BUSINESS_RULES.QUALITY_REPORT.ALLOWED_STATUSES as readonly string[]
        ).includes(newStatus)
      ) {
        errors.push({
          field: "status",
          message: `Invalid status. Must be one of: ${BUSINESS_RULES.QUALITY_REPORT.ALLOWED_STATUSES.join(
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
   * Validate approval data
   */
  async validateApproval(approvedBy?: string): Promise<ValidationResult> {
    try {
      const errors: ValidationError[] = [];

      if (approvedBy && approvedBy.trim().length < 2) {
        errors.push({
          field: "approved_by",
          message: "Approved by must be at least 2 characters",
          code: "INVALID_LENGTH",
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      logger.error("Error validating approval data:", error as Error);
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

  private isValidGrade(grade: string): boolean {
    return (
      BUSINESS_RULES.QUALITY_REPORT.ALLOWED_GRADES as readonly string[]
    ).includes(grade);
  }

  private isValidScore(score: number): boolean {
    return (
      score >= BUSINESS_RULES.QUALITY_REPORT.MIN_SCORE &&
      score <= BUSINESS_RULES.QUALITY_REPORT.MAX_SCORE
    );
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return (
      !isNaN(date.getTime()) && dateString === date.toISOString().split("T")[0]
    );
  }

  private isFutureDate(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  }

  private isGradeScoreConsistent(grade: string, score: number): boolean {
    // Define score ranges for each grade
    const gradeRanges: Record<string, { min: number; max: number }> = {
      "A+": { min: 95, max: 100 },
      A: { min: 85, max: 94 },
      "B+": { min: 75, max: 84 },
      B: { min: 65, max: 74 },
      C: { min: 50, max: 64 },
      D: { min: 0, max: 49 },
    };

    const range = gradeRanges[grade];
    if (!range) return false;

    return score >= range.min && score <= range.max;
  }

  private validateParameters(
    parameters: Record<string, any>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const requiredParams = BUSINESS_RULES.QUALITY_REPORT.REQUIRED_PARAMETERS;

    // Check if all required parameters are present
    requiredParams.forEach((param) => {
      if (!(param in parameters)) {
        errors.push({
          field: `parameters.${param}`,
          message: `Required parameter '${param}' is missing`,
          code: "MISSING_PARAMETER",
        });
      } else if (
        parameters[param] === null ||
        parameters[param] === undefined ||
        parameters[param] === ""
      ) {
        errors.push({
          field: `parameters.${param}`,
          message: `Parameter '${param}' cannot be empty`,
          code: "EMPTY_PARAMETER",
        });
      }
    });

    // Validate parameter values (assuming they should be numbers between 0-100)
    Object.keys(parameters).forEach((key) => {
      const value = parameters[key];
      if (typeof value === "number") {
        if (value < 0 || value > 100) {
          errors.push({
            field: `parameters.${key}`,
            message: `Parameter '${key}' must be between 0 and 100`,
            code: "INVALID_PARAMETER_VALUE",
          });
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private canUpdateInStatus(status: string): boolean {
    // Can update in pending and under_review statuses
    return ["pending", "under_review"].includes(status);
  }

  private getValidStatusTransitions(currentStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      pending: ["under_review", "rejected"],
      under_review: ["approved", "rejected", "pending"],
      approved: [], // Final status, no transitions
      rejected: ["pending"], // Can re-submit
    };

    return transitions[currentStatus] || [];
  }
}
