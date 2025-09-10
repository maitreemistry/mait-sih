import { supabase } from "../../lib/supabase/client";
import { logger } from "../logger";
import { BaseRepository } from "./BaseRepository";

export interface Certification {
  id: string;
  farmer_id: string;
  certification_type: string;
  certificate_number: string;
  issuing_body: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  verification_notes?: string;
  document_urls?: string[];
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export class CertificationsRepository extends BaseRepository<Certification> {
  protected tableName = "certifications";

  /**
   * Find certifications by farmer ID
   */
  async findByFarmer(
    farmerId: string,
    status?: string,
    certificationType?: string
  ): Promise<Certification[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          farmer:profiles!certifications_farmer_id_fkey(
            id,
            name,
            phone,
            location
          )
        `
        )
        .eq("farmer_id", farmerId);

      if (status) {
        query = query.eq("status", status);
      }

      if (certificationType) {
        query = query.eq("certification_type", certificationType);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        logger.error(
          `Error finding certifications for farmer ${farmerId}:`,
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
   * Find certifications by type
   */
  async findByType(
    certificationType: string,
    status?: string,
    limit: number = 50
  ): Promise<Certification[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          farmer:profiles!certifications_farmer_id_fkey(
            id,
            name,
            phone,
            location
          )
        `
        )
        .eq("certification_type", certificationType);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          `Error finding certifications by type ${certificationType}:`,
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByType:`, error as Error);
      throw error;
    }
  }

  /**
   * Find certifications by status
   */
  async findByStatus(
    status: string,
    limit: number = 50
  ): Promise<Certification[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          farmer:profiles!certifications_farmer_id_fkey(
            id,
            name,
            phone,
            location
          )
        `
        )
        .eq("status", status)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          `Error finding certifications by status ${status}:`,
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
   * Find certifications by certificate number
   */
  async findByCertificateNumber(
    certificateNumber: string
  ): Promise<Certification | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          farmer:profiles!certifications_farmer_id_fkey(
            id,
            name,
            phone,
            location
          )
        `
        )
        .eq("certificate_number", certificateNumber)
        .single();

      if (error && error.code !== "PGRST116") {
        logger.error(
          `Error finding certification by certificate number ${certificateNumber}:`,
          error
        );
        throw error;
      }

      return data || null;
    } catch (error) {
      logger.error(`Error in findByCertificateNumber:`, error as Error);
      throw error;
    }
  }

  /**
   * Find expiring certifications
   */
  async findExpiringCertifications(
    daysAhead: number = 30
  ): Promise<Certification[]> {
    try {
      const currentDate = new Date();
      const futureDate = new Date(
        currentDate.getTime() + daysAhead * 24 * 60 * 60 * 1000
      );

      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          farmer:profiles!certifications_farmer_id_fkey(
            id,
            name,
            phone,
            email
          )
        `
        )
        .gte("expiry_date", currentDate.toISOString())
        .lte("expiry_date", futureDate.toISOString())
        .eq("status", "verified")
        .order("expiry_date", { ascending: true });

      if (error) {
        logger.error(`Error finding expiring certifications:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findExpiringCertifications:`, error as Error);
      throw error;
    }
  }

  /**
   * Find expired certifications
   */
  async findExpiredCertifications(): Promise<Certification[]> {
    try {
      const currentDate = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          farmer:profiles!certifications_farmer_id_fkey(
            id,
            name,
            phone
          )
        `
        )
        .lt("expiry_date", currentDate)
        .eq("status", "verified")
        .order("expiry_date", { ascending: true });

      if (error) {
        logger.error(`Error finding expired certifications:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findExpiredCertifications:`, error as Error);
      throw error;
    }
  }

  /**
   * Find certifications by issuing body
   */
  async findByIssuingBody(
    issuingBody: string,
    limit: number = 50
  ): Promise<Certification[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          farmer:profiles!certifications_farmer_id_fkey(
            id,
            name,
            location
          )
        `
        )
        .eq("issuing_body", issuingBody)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          `Error finding certifications by issuing body ${issuingBody}:`,
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByIssuingBody:`, error as Error);
      throw error;
    }
  }

  /**
   * Update certification status
   */
  async updateStatus(
    certificationId: string,
    status: string,
    verifiedBy?: string,
    verificationNotes?: string
  ): Promise<{ data: Certification | null; error: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "verified" && verifiedBy) {
        updateData.verified_by = verifiedBy;
        updateData.verified_at = new Date().toISOString();
      }

      if (verificationNotes) {
        updateData.verification_notes = verificationNotes;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData as never)
        .eq("id", certificationId)
        .select()
        .single();

      if (error) {
        logger.error(`Error updating certification status:`, error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error(`Error in updateStatus:`, error as Error);
      return { data: null, error };
    }
  }

  /**
   * Get certification statistics
   */
  async getCertificationStats(): Promise<{
    total_certifications: number;
    verified: number;
    pending: number;
    rejected: number;
    expired: number;
    expiring_soon: number;
    by_type: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("status, certification_type, expiry_date");

      if (error) {
        logger.error(`Error getting certification stats:`, error);
        throw error;
      }

      const currentDate = new Date();
      const next30Days = new Date(
        currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      const stats = {
        total_certifications: data.length,
        verified: 0,
        pending: 0,
        rejected: 0,
        expired: 0,
        expiring_soon: 0,
        by_type: {} as Record<string, number>,
      };

      data.forEach((cert: any) => {
        // Count by status
        switch (cert.status) {
          case "verified":
            stats.verified++;
            break;
          case "pending":
            stats.pending++;
            break;
          case "rejected":
            stats.rejected++;
            break;
          case "expired":
            stats.expired++;
            break;
        }

        // Count by type
        if (cert.certification_type) {
          stats.by_type[cert.certification_type] =
            (stats.by_type[cert.certification_type] || 0) + 1;
        }

        // Check for expiring soon
        if (cert.status === "verified" && cert.expiry_date) {
          const expiryDate = new Date(cert.expiry_date);
          if (expiryDate >= currentDate && expiryDate <= next30Days) {
            stats.expiring_soon++;
          }
        }
      });

      return stats;
    } catch (error) {
      logger.error(`Error in getCertificationStats:`, error as Error);
      throw error;
    }
  }

  /**
   * Search certifications
   */
  async searchCertifications(
    searchTerm: string,
    certificationType?: string,
    status?: string,
    limit: number = 20
  ): Promise<Certification[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          farmer:profiles!certifications_farmer_id_fkey(
            id,
            name,
            phone
          )
        `
        )
        .or(
          `certificate_number.ilike.%${searchTerm}%,issuing_body.ilike.%${searchTerm}%,verification_notes.ilike.%${searchTerm}%`
        );

      if (certificationType) {
        query = query.eq("certification_type", certificationType);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Error searching certifications:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in searchCertifications:`, error as Error);
      throw error;
    }
  }

  /**
   * Find valid certifications for a farmer
   */
  async findValidCertifications(farmerId: string): Promise<Certification[]> {
    try {
      const currentDate = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("farmer_id", farmerId)
        .eq("status", "verified")
        .gt("expiry_date", currentDate)
        .order("expiry_date", { ascending: true });

      if (error) {
        logger.error(
          `Error finding valid certifications for farmer ${farmerId}:`,
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findValidCertifications:`, error as Error);
      throw error;
    }
  }

  /**
   * Auto-expire certifications
   */
  async autoExpireCertifications(): Promise<number> {
    try {
      const currentDate = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: "expired",
          updated_at: currentDate,
        } as never)
        .lt("expiry_date", currentDate)
        .eq("status", "verified")
        .select("id");

      if (error) {
        logger.error(`Error auto-expiring certifications:`, error);
        throw error;
      }

      return data?.length || 0;
    } catch (error) {
      logger.error(`Error in autoExpireCertifications:`, error as Error);
      throw error;
    }
  }

  /**
   * Find certifications due for renewal
   */
  async findDueForRenewal(daysAhead: number = 60): Promise<Certification[]> {
    try {
      const currentDate = new Date();
      const futureDate = new Date(
        currentDate.getTime() + daysAhead * 24 * 60 * 60 * 1000
      );

      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          farmer:profiles!certifications_farmer_id_fkey(
            id,
            name,
            phone,
            email
          )
        `
        )
        .lte("expiry_date", futureDate.toISOString())
        .eq("status", "verified")
        .order("expiry_date", { ascending: true });

      if (error) {
        logger.error(`Error finding certifications due for renewal:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findDueForRenewal:`, error as Error);
      throw error;
    }
  }
}
