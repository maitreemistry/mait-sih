import { TABLE_NAMES } from "../config";
import { EnhancedBaseService } from "../database";
import { FarmTaskRepository } from "../repositories";
import {
  FarmTask,
  FilterOptions,
  IFarmTaskService,
  ServiceResponse,
} from "../types";

/**
 * Enhanced Farm Task Service with business logic
 */
export class FarmTaskService
  extends EnhancedBaseService<FarmTask>
  implements IFarmTaskService
{
  constructor() {
    super(new FarmTaskRepository(), "FarmTask");
  }

  protected getTableName(): string {
    return TABLE_NAMES.FARM_TASKS;
  }

  async getByFarmer(farmerId: string): Promise<ServiceResponse<FarmTask[]>> {
    try {
      this.logBusinessEvent("getByFarmer", { farmerId });

      const filters: FilterOptions[] = [
        { column: "farmer_id", operator: "eq", value: farmerId },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getByFarmer"
        );
        return this.createResponse<FarmTask[]>(null, serviceError);
      }

      return this.createResponse<FarmTask[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByFarmer");
      return this.createResponse<FarmTask[]>(null, serviceError);
    }
  }

  async getByStatus(status: string): Promise<ServiceResponse<FarmTask[]>> {
    try {
      this.logBusinessEvent("getByStatus", { status });

      const filters: FilterOptions[] = [
        { column: "status", operator: "eq", value: status },
      ];

      const result = await this.repository.findWhere(filters);

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getByStatus"
        );
        return this.createResponse<FarmTask[]>(null, serviceError);
      }

      return this.createResponse<FarmTask[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByStatus");
      return this.createResponse<FarmTask[]>(null, serviceError);
    }
  }

  async getByPriority(priority: string): Promise<ServiceResponse<FarmTask[]>> {
    try {
      this.logBusinessEvent("getByPriority", { priority });

      // Priority field doesn't exist in current schema, return empty array
      return this.createResponse<FarmTask[]>([], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getByPriority");
      return this.createResponse<FarmTask[]>(null, serviceError);
    }
  }

  async updateStatus(
    id: string,
    status: string
  ): Promise<ServiceResponse<FarmTask>> {
    try {
      this.logBusinessEvent("updateStatus", { id, status });

      const updateData = { status };
      return await this.update(id, updateData as Partial<FarmTask>);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "updateStatus");
      return this.createResponse<FarmTask>(null, serviceError);
    }
  }

  async getOverdue(): Promise<ServiceResponse<FarmTask[]>> {
    try {
      this.logBusinessEvent("getOverdue");

      const repository = this.repository as FarmTaskRepository;
      const result = await repository.findOverdue();

      if (result.error) {
        const serviceError = this.handleRepositoryError(
          result.error,
          "getOverdue"
        );
        return this.createResponse<FarmTask[]>(null, serviceError);
      }

      return this.createResponse<FarmTask[]>(result.data || [], null);
    } catch (error) {
      const serviceError = this.handleRepositoryError(error, "getOverdue");
      return this.createResponse<FarmTask[]>(null, serviceError);
    }
  }
}
