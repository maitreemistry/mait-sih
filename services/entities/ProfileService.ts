/**
 * Profile Service - Enhanced profile management with business logic
 * Following industrial standard practices with proper separation of concerns
 */

import { TABLE_NAMES } from "../config";
import { EnhancedBaseService } from "../database";
import { ProfileRepository } from "../repositories";
import {
  FilterOptions,
  IProfileService,
  Profile,
  ServiceResponse,
} from "../types";

/**
 * Enhanced Profile Service with business logic
 */
export class ProfileService
  extends EnhancedBaseService<Profile>
  implements IProfileService
{
  constructor() {
    super(new ProfileRepository(), "Profile");
  }

  protected getTableName(): string {
    return TABLE_NAMES.PROFILES;
  }

  async getByRole(role: string): Promise<ServiceResponse<Profile[]>> {
    try {
      this.logBusinessEvent("getByRole", { role });

      const filters: FilterOptions[] = [
        { column: "role", operator: "eq", value: role },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getByRole"
        );
        return this.createResponse<Profile[]>(null, serviceError);
      }

      return this.createResponse<Profile[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByRole");
      return this.createResponse<Profile[]>(null, serviceError);
    }
  }

  async getVerifiedFarmers(): Promise<ServiceResponse<Profile[]>> {
    try {
      this.logBusinessEvent("getVerifiedFarmers");

      const filters: FilterOptions[] = [
        { column: "role", operator: "eq", value: "farmer" },
        { column: "is_verified", operator: "eq", value: true },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getVerifiedFarmers"
        );
        return this.createResponse<Profile[]>(null, serviceError);
      }

      return this.createResponse<Profile[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(
        error,
        "getVerifiedFarmers"
      );
      return this.createResponse<Profile[]>(null, serviceError);
    }
  }

  async updateVerificationStatus(
    id: string,
    verified: boolean
  ): Promise<ServiceResponse<Profile>> {
    try {
      this.logBusinessEvent("updateVerificationStatus", { id, verified });

      const updateData = { is_verified: verified };
      return await this.update(id, updateData as Partial<Profile>);
    } catch (error) {
      const serviceError = this.handleRepositoryError(
        error,
        "updateVerificationStatus"
      );
      return this.createResponse<Profile>(null, serviceError);
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();
