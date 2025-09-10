import { supabase } from "../../lib/supabase/client";
import { logger } from "../logger";
import { BaseRepository } from "./BaseRepository";

export interface QualityReport {
  id: string;
  product_id: string;
  inspector_id: string;
  farmer_id: string;
  report_date: string;
  overall_grade: string;
  overall_score: number;
  parameters: Record<string, any>;
  defects_found: string[];
  defect_percentage: number;
  quality_notes: string;
  recommendations: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export class QualityReportsRepository extends BaseRepository<QualityReport> {
  protected tableName = "quality_reports";

  /**
   * Find quality reports by product ID
   */
  async findByProduct(
    productId: string,
    status?: string,
    limit: number = 50
  ): Promise<QualityReport[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          product:products!quality_reports_product_id_fkey(
            id,
            name,
            category,
            farmer_id
          ),
          inspector:profiles!quality_reports_inspector_id_fkey(
            id,
            name,
            role
          ),
          farmer:profiles!quality_reports_farmer_id_fkey(
            id,
            name,
            location
          )
        `
        )
        .eq("product_id", productId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query
        .order("report_date", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          `Error finding quality reports for product ${productId}:`,
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByProduct:`, error as Error);
      throw error;
    }
  }

  /**
   * Find quality reports by farmer ID
   */
  async findByFarmer(
    farmerId: string,
    status?: string,
    limit: number = 50
  ): Promise<QualityReport[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          product:products!quality_reports_product_id_fkey(
            id,
            name,
            category
          ),
          inspector:profiles!quality_reports_inspector_id_fkey(
            id,
            name,
            role
          )
        `
        )
        .eq("farmer_id", farmerId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query
        .order("report_date", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          `Error finding quality reports for farmer ${farmerId}:`,
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByFarmer:`, error as Error);
      throw error;
    }
  }

  /**
   * Find quality reports by inspector ID
   */
  async findByInspector(
    inspectorId: string,
    status?: string,
    limit: number = 50
  ): Promise<QualityReport[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          product:products!quality_reports_product_id_fkey(
            id,
            name,
            category,
            farmer_id
          ),
          farmer:profiles!quality_reports_farmer_id_fkey(
            id,
            name,
            location
          )
        `
        )
        .eq("inspector_id", inspectorId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query
        .order("report_date", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          `Error finding quality reports for inspector ${inspectorId}:`,
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByInspector:`, error as Error);
      throw error;
    }
  }

  /**
   * Find quality reports by grade
   */
  async findByGrade(
    grade: string,
    limit: number = 50
  ): Promise<QualityReport[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          product:products!quality_reports_product_id_fkey(
            id,
            name,
            category
          ),
          farmer:profiles!quality_reports_farmer_id_fkey(
            id,
            name,
            location
          )
        `
        )
        .eq("overall_grade", grade)
        .order("report_date", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Error finding quality reports by grade ${grade}:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByGrade:`, error as Error);
      throw error;
    }
  }

  /**
   * Find quality reports by status
   */
  async findByStatus(
    status: string,
    limit: number = 50
  ): Promise<QualityReport[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          product:products!quality_reports_product_id_fkey(
            id,
            name,
            category
          ),
          farmer:profiles!quality_reports_farmer_id_fkey(
            id,
            name,
            location
          ),
          inspector:profiles!quality_reports_inspector_id_fkey(
            id,
            name,
            role
          )
        `
        )
        .eq("status", status)
        .order("report_date", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          `Error finding quality reports by status ${status}:`,
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByStatus:`, error as Error);
      throw error;
    }
  }

  /**
   * Find quality reports by score range
   */
  async findByScoreRange(
    minScore: number,
    maxScore: number,
    limit: number = 50
  ): Promise<QualityReport[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          product:products!quality_reports_product_id_fkey(
            id,
            name,
            category
          ),
          farmer:profiles!quality_reports_farmer_id_fkey(
            id,
            name,
            location
          )
        `
        )
        .gte("overall_score", minScore)
        .lte("overall_score", maxScore)
        .order("overall_score", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          `Error finding quality reports by score range ${minScore}-${maxScore}:`,
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByScoreRange:`, error as Error);
      throw error;
    }
  }

  /**
   * Find recent quality reports
   */
  async findRecent(
    days: number = 30,
    limit: number = 50
  ): Promise<QualityReport[]> {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          product:products!quality_reports_product_id_fkey(
            id,
            name,
            category
          ),
          farmer:profiles!quality_reports_farmer_id_fkey(
            id,
            name,
            location
          )
        `
        )
        .gte("report_date", fromDate.toISOString())
        .order("report_date", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Error finding recent quality reports:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findRecent:`, error as Error);
      throw error;
    }
  }

  /**
   * Update quality report status
   */
  async updateStatus(
    reportId: string,
    status: string,
    approvedBy?: string
  ): Promise<{ data: QualityReport | null; error: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "approved" && approvedBy) {
        updateData.approved_by = approvedBy;
        updateData.approved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData as never)
        .eq("id", reportId)
        .select()
        .single();

      if (error) {
        logger.error(`Error updating quality report status:`, error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error(`Error in updateStatus:`, error as Error);
      return { data: null, error };
    }
  }

  /**
   * Get quality report statistics
   */
  async getQualityStats(): Promise<{
    total_reports: number;
    pending: number;
    approved: number;
    rejected: number;
    under_review: number;
    average_score: number;
    by_grade: Record<string, number>;
    by_status: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("status, overall_grade, overall_score");

      if (error) {
        logger.error(`Error getting quality report stats:`, error);
        throw error;
      }

      const stats = {
        total_reports: data.length,
        pending: 0,
        approved: 0,
        rejected: 0,
        under_review: 0,
        average_score: 0,
        by_grade: {} as Record<string, number>,
        by_status: {} as Record<string, number>,
      };

      let totalScore = 0;
      let scoreCount = 0;

      data.forEach((report: any) => {
        // Count by status
        switch (report.status) {
          case "pending":
            stats.pending++;
            break;
          case "approved":
            stats.approved++;
            break;
          case "rejected":
            stats.rejected++;
            break;
          case "under_review":
            stats.under_review++;
            break;
        }

        // Count by status for general stats
        stats.by_status[report.status] =
          (stats.by_status[report.status] || 0) + 1;

        // Count by grade
        if (report.overall_grade) {
          stats.by_grade[report.overall_grade] =
            (stats.by_grade[report.overall_grade] || 0) + 1;
        }

        // Calculate average score
        if (
          report.overall_score !== null &&
          report.overall_score !== undefined
        ) {
          totalScore += report.overall_score;
          scoreCount++;
        }
      });

      if (scoreCount > 0) {
        stats.average_score = Math.round((totalScore / scoreCount) * 100) / 100;
      }

      return stats;
    } catch (error) {
      logger.error(`Error in getQualityStats:`, error as Error);
      throw error;
    }
  }

  /**
   * Search quality reports
   */
  async searchReports(
    searchTerm: string,
    status?: string,
    grade?: string,
    limit: number = 20
  ): Promise<QualityReport[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          product:products!quality_reports_product_id_fkey(
            id,
            name,
            category
          ),
          farmer:profiles!quality_reports_farmer_id_fkey(
            id,
            name,
            location
          )
        `
        )
        .or(
          `quality_notes.ilike.%${searchTerm}%,recommendations.ilike.%${searchTerm}%`
        );

      if (status) {
        query = query.eq("status", status);
      }

      if (grade) {
        query = query.eq("overall_grade", grade);
      }

      const { data, error } = await query
        .order("report_date", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Error searching quality reports:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in searchReports:`, error as Error);
      throw error;
    }
  }

  /**
   * Get quality report summary for product
   */
  async getProductQualitySummary(productId: string): Promise<{
    latest_report?: QualityReport;
    average_score: number;
    report_count: number;
    latest_grade?: string;
  }> {
    try {
      const { data, error } = (await supabase
        .from(this.tableName)
        .select("overall_score, overall_grade, report_date")
        .eq("product_id", productId)
        .eq("status", "approved")
        .order("report_date", { ascending: false })) as {
        data:
          | {
              overall_score: number;
              overall_grade: string;
              report_date: string;
            }[]
          | null;
        error: any;
      };

      if (error) {
        logger.error(`Error getting product quality summary:`, error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          average_score: 0,
          report_count: 0,
        };
      }

      // Get latest report
      const latestResult = await this.findByProduct(productId, "approved", 1);
      const latestReport =
        latestResult.length > 0 ? latestResult[0] : undefined;

      // Calculate average score
      const totalScore = data.reduce(
        (sum: number, report) => sum + (report.overall_score || 0),
        0
      );
      const averageScore =
        data.length > 0
          ? Math.round((totalScore / data.length) * 100) / 100
          : 0;

      return {
        latest_report: latestReport,
        average_score: averageScore,
        report_count: data.length,
        latest_grade: data[0]?.overall_grade,
      };
    } catch (error) {
      logger.error(`Error in getProductQualitySummary:`, error as Error);
      throw error;
    }
  }

  /**
   * Get farmer quality statistics
   */
  async getFarmerQualityStats(farmerId: string): Promise<{
    total_reports: number;
    average_score: number;
    latest_grade?: string;
    grade_distribution: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("overall_score, overall_grade")
        .eq("farmer_id", farmerId)
        .eq("status", "approved");

      if (error) {
        logger.error(`Error getting farmer quality stats:`, error);
        throw error;
      }

      const stats = {
        total_reports: data.length,
        average_score: 0,
        latest_grade: undefined as string | undefined,
        grade_distribution: {} as Record<string, number>,
      };

      if (data.length > 0) {
        // Calculate average score
        const totalScore = data.reduce(
          (sum: number, report: any) => sum + (report.overall_score || 0),
          0
        );
        stats.average_score =
          Math.round((totalScore / data.length) * 100) / 100;

        // Get latest grade
        const latestReports = await this.findByFarmer(farmerId, "approved", 1);
        if (latestReports.length > 0) {
          stats.latest_grade = latestReports[0].overall_grade;
        }

        // Calculate grade distribution
        data.forEach((report: any) => {
          if (report.overall_grade) {
            stats.grade_distribution[report.overall_grade] =
              (stats.grade_distribution[report.overall_grade] || 0) + 1;
          }
        });
      }

      return stats;
    } catch (error) {
      logger.error(`Error in getFarmerQualityStats:`, error as Error);
      throw error;
    }
  }
}
