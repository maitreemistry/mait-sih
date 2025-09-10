import { TABLE_NAMES } from "../config";
import { BaseRepository } from "./BaseRepository";

export class PaymentRepository extends BaseRepository {
  constructor() {
    super(TABLE_NAMES.PAYMENTS);
  }

  async findByOrder(orderId: string): Promise<any> {
    return this.findWhere([
      { column: "order_id", operator: "eq", value: orderId },
    ]);
  }

  async findByStatus(status: string): Promise<any> {
    return this.findWhere([
      { column: "status", operator: "eq", value: status },
    ]);
  }

  async findByStripeId(stripeChargeId: string): Promise<any> {
    return this.findWhere([
      { column: "stripe_charge_id", operator: "eq", value: stripeChargeId },
    ]);
  }

  async findPendingPayments(): Promise<any> {
    return this.findWhere([
      { column: "status", operator: "eq", value: "pending" },
    ]);
  }
}
