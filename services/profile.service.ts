/**
 * Profile Service - Handles user profile operations
 * Direct Supabase integration for profile management
 */

import { supabase } from "../lib/supabase/client";
import { Profile } from "../types/supabase";

export class ProfileService {
  private tableName = "profiles";

  /**
   * Create standardized response
   */
  private createResponse(data: any, error: any = null, message?: string) {
    return {
      data,
      error,
      success: !error,
      message: message || (error ? "Operation failed" : "Operation successful")
    };
  }

  /**
   * Get current user's profile
   */
  async getCurrentProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return this.createResponse(null, {
          code: "UNAUTHENTICATED",
          message: "User not authenticated"
        });
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Profile retrieved successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Create or update profile for authenticated user
   */
  async upsertProfile(profileData: Partial<Profile>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return this.createResponse(null, {
          code: "UNAUTHENTICATED",
          message: "User not authenticated"
        });
      }

      const { data, error } = await (supabase
        .from(this.tableName) as any)
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Profile updated successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Get profiles by role
   */
  async getProfilesByRole(role: string) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("role", role)
        .order("created_at", { ascending: false });

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, `${role} profiles retrieved successfully`);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Search profiles by name or company
   */
  async searchProfiles(query: string) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .or(`full_name.ilike.%${query}%,company_name.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Profiles found successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Update profile verification status (admin only)
   */
  async updateVerificationStatus(profileId: string, isVerified: boolean) {
    try {
      const { data, error } = await (supabase
        .from(this.tableName) as any)
        .update({
          is_verified: isVerified,
          updated_at: new Date().toISOString()
        })
        .eq("id", profileId)
        .select()
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Verification status updated successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();
