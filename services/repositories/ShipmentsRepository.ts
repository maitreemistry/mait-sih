import { supabase } from "../../lib/supabase/client";
import { logger } from "../logger";
import { BaseRepository } from "./BaseRepository";

export interface Shipment {
  id: string;
  order_id: string;
  carrier_name: string;
  tracking_number?: string;
  status: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  shipping_address: any;
  pickup_address?: any;
  weight_kg?: number;
  dimensions?: any;
  shipping_cost?: number;
  insurance_value?: number;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export class ShipmentsRepository extends BaseRepository<Shipment> {
  protected tableName = "shipments";

  /**
   * Find shipments by order ID
   */
  async findByOrder(orderId: string): Promise<Shipment[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            buyer_id,
            farmer_id,
            status
          )
        `
        )
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error(`Error finding shipments by order ${orderId}:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByOrder:`, error as Error);
      throw error;
    }
  }

  /**
   * Find shipments by status
   */
  async findByStatus(status: string, limit: number = 50): Promise<Shipment[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            buyer_id,
            farmer_id,
            total_amount
          )
        `
        )
        .eq("status", status)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Error finding shipments by status ${status}:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByStatus:`, error as Error);
      throw error;
    }
  }

  /**
   * Find shipments by carrier
   */
  async findByCarrier(
    carrierName: string,
    limit: number = 50
  ): Promise<Shipment[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            buyer_id,
            farmer_id
          )
        `
        )
        .eq("carrier_name", carrierName)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          `Error finding shipments by carrier ${carrierName}:`,
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByCarrier:`, error as Error);
      throw error;
    }
  }

  /**
   * Find shipments by tracking number
   */
  async findByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            buyer_id,
            farmer_id,
            status,
            total_amount
          )
        `
        )
        .eq("tracking_number", trackingNumber)
        .single();

      if (error && error.code !== "PGRST116") {
        logger.error(
          `Error finding shipment by tracking number ${trackingNumber}:`,
          error
        );
        throw error;
      }

      return data || null;
    } catch (error) {
      logger.error(`Error in findByTrackingNumber:`, error as Error);
      throw error;
    }
  }

  /**
   * Find shipments for a farmer
   */
  async findByFarmer(
    farmerId: string,
    status?: string,
    limit: number = 50
  ): Promise<Shipment[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders!inner(
            id,
            order_number,
            buyer_id,
            farmer_id,
            status,
            total_amount
          )
        `
        )
        .eq("order.farmer_id", farmerId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Error finding shipments for farmer ${farmerId}:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByFarmer:`, error as Error);
      throw error;
    }
  }

  /**
   * Find shipments for a buyer
   */
  async findByBuyer(
    buyerId: string,
    status?: string,
    limit: number = 50
  ): Promise<Shipment[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders!inner(
            id,
            order_number,
            buyer_id,
            farmer_id,
            status,
            total_amount
          )
        `
        )
        .eq("order.buyer_id", buyerId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Error finding shipments for buyer ${buyerId}:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findByBuyer:`, error as Error);
      throw error;
    }
  }

  /**
   * Update shipment status
   */
  async updateStatus(
    shipmentId: string,
    status: string,
    actualDeliveryDate?: string
  ): Promise<{ data: Shipment | null; error: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (actualDeliveryDate) {
        updateData.actual_delivery_date = actualDeliveryDate;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData as never)
        .eq("id", shipmentId)
        .select()
        .single();

      if (error) {
        logger.error(`Error updating shipment status:`, error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error(`Error in updateStatus:`, error as Error);
      return { data: null, error };
    }
  }

  /**
   * Find overdue shipments
   */
  async findOverdueShipments(): Promise<Shipment[]> {
    try {
      const currentDate = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            buyer_id,
            farmer_id
          )
        `
        )
        .lt("estimated_delivery_date", currentDate)
        .in("status", ["shipped", "in_transit"])
        .order("estimated_delivery_date", { ascending: true });

      if (error) {
        logger.error(`Error finding overdue shipments:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findOverdueShipments:`, error as Error);
      throw error;
    }
  }

  /**
   * Find shipments due for delivery today
   */
  async findDeliveriesToday(): Promise<Shipment[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            buyer_id,
            farmer_id
          )
        `
        )
        .gte("estimated_delivery_date", today.toISOString())
        .lt("estimated_delivery_date", tomorrow.toISOString())
        .in("status", ["shipped", "in_transit"])
        .order("estimated_delivery_date", { ascending: true });

      if (error) {
        logger.error(`Error finding deliveries for today:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in findDeliveriesToday:`, error as Error);
      throw error;
    }
  }

  /**
   * Get shipping statistics for a date range
   */
  async getShippingStats(
    startDate: string,
    endDate: string
  ): Promise<{
    total_shipments: number;
    delivered: number;
    in_transit: number;
    pending: number;
    average_delivery_time_days: number;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("status, created_at, actual_delivery_date")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) {
        logger.error(`Error getting shipping stats:`, error);
        throw error;
      }

      const stats = {
        total_shipments: data.length,
        delivered: 0,
        in_transit: 0,
        pending: 0,
        average_delivery_time_days: 0,
      };

      let totalDeliveryTime = 0;
      let deliveredCount = 0;

      data.forEach((shipment: any) => {
        switch (shipment.status) {
          case "delivered":
            stats.delivered++;
            if (shipment.actual_delivery_date) {
              const deliveryTime =
                new Date(shipment.actual_delivery_date).getTime() -
                new Date(shipment.created_at).getTime();
              totalDeliveryTime += deliveryTime / (1000 * 60 * 60 * 24); // Convert to days
              deliveredCount++;
            }
            break;
          case "in_transit":
          case "shipped":
            stats.in_transit++;
            break;
          case "pending":
          case "preparing":
            stats.pending++;
            break;
        }
      });

      if (deliveredCount > 0) {
        stats.average_delivery_time_days = Math.round(
          totalDeliveryTime / deliveredCount
        );
      }

      return stats;
    } catch (error) {
      logger.error(`Error in getShippingStats:`, error as Error);
      throw error;
    }
  }

  /**
   * Search shipments by various criteria
   */
  async searchShipments(
    searchTerm: string,
    status?: string,
    limit: number = 20
  ): Promise<Shipment[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          order:orders(
            id,
            order_number,
            buyer_id,
            farmer_id
          )
        `
        )
        .or(
          `tracking_number.ilike.%${searchTerm}%,carrier_name.ilike.%${searchTerm}%,special_instructions.ilike.%${searchTerm}%`
        );

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(`Error searching shipments:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`Error in searchShipments:`, error as Error);
      throw error;
    }
  }
}
