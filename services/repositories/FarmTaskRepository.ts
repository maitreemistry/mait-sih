import { TABLE_NAMES } from "../config";
import { BaseRepository } from "./BaseRepository";

export class FarmTaskRepository extends BaseRepository {
  constructor() {
    super(TABLE_NAMES.FARM_TASKS);
  }

  async findByFarmer(farmerId: string): Promise<any> {
    return this.findWhere([
      { column: "farmer_id", operator: "eq", value: farmerId },
    ]);
  }

  async findByStatus(status: string): Promise<any> {
    return this.findWhere([
      { column: "status", operator: "eq", value: status },
    ]);
  }

  async findOverdue(): Promise<any> {
    return this.findWhere([
      { column: "due_date", operator: "lt", value: new Date().toISOString() },
      { column: "status", operator: "neq", value: "completed" },
    ]);
  }
}
