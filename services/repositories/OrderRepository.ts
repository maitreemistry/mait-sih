import { TABLE_NAMES } from "../config";
import { BaseRepository } from "./BaseRepository";

export class OrderRepository extends BaseRepository {
  constructor() {
    super(TABLE_NAMES.ORDERS);
  }

  async findByBuyer(buyerId: string): Promise<any> {
    return this.findWhere([
      { column: "buyer_id", operator: "eq", value: buyerId },
    ]);
  }

  async findByStatus(status: string): Promise<any> {
    return this.findWhere([
      { column: "status", operator: "eq", value: status },
    ]);
  }
}
