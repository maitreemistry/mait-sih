import { TABLE_NAMES } from "../config";
import { BaseRepository } from "./BaseRepository";

export class ProfileRepository extends BaseRepository {
  constructor() {
    super(TABLE_NAMES.PROFILES);
  }

  async findByRole(role: string): Promise<any> {
    return this.findWhere([{ column: "role", operator: "eq", value: role }]);
  }

  async findVerifiedFarmers(): Promise<any> {
    return this.findWhere([
      { column: "role", operator: "eq", value: "farmer" },
      { column: "is_verified", operator: "eq", value: true },
    ]);
  }
}
