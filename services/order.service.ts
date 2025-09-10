/**
 * Order Service - Handles order management operations
 * Direct Supabase integration for order processing
 */

import { supabase } from "../lib/supabase/client";
import { Order, Payment, Shipment } from "../types/supabase";

export class OrderService {
  private ordersTable = "orders";
  private orderItemsTable = "order_items";
  private paymentsTable = "payments";
  private shipmentsTable = "shipments";

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
   * Create new order with items
   */
  async createOrder(orderData: {
    buyer_id: string;
    items: Array<{
      listing_id: string;
      quantity: number;
      price_at_purchase: number;
    }>;
    total_amount: number;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return this.createResponse(null, {
          code: "UNAUTHENTICATED",
          message: "User not authenticated"
        });
      }

      // Start transaction by creating order first
      const { data: order, error: orderError } = await (supabase
        .from(this.ordersTable) as any)
        .insert({
          buyer_id: orderData.buyer_id,
          total_amount: orderData.total_amount,
          status: "pending"
        })
        .select()
        .single();

      if (orderError) {
        return this.createResponse(null, orderError);
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        listing_id: item.listing_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase
      }));

      const { error: itemsError } = await (supabase
        .from(this.orderItemsTable) as any)
        .insert(orderItems);

      if (itemsError) {
        // If items creation fails, we should ideally rollback the order
        // For now, we'll just return the error
        return this.createResponse(null, itemsError);
      }

      return this.createResponse(order, null, "Order created successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Get orders for current user (buyer or seller)
   */
  async getUserOrders(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
    asSeller?: boolean;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return this.createResponse(null, {
          code: "UNAUTHENTICATED",
          message: "User not authenticated"
        });
      }

      let query = supabase
        .from(this.ordersTable)
        .select(`
          *,
          order_items (
            *,
            product_listings (
              *,
              products (
                id,
                name,
                description,
                category,
                image_url
              ),
              profiles:farmer_id (
                id,
                full_name,
                company_name
              )
            )
          ),
          profiles:buyer_id (
            id,
            full_name,
            company_name,
            contact_email,
            phone_number
          ),
          payments (
            id,
            amount,
            status,
            stripe_charge_id
          ),
          shipments (
            id,
            tracking_number,
            carrier,
            status,
            estimated_delivery_date
          )
        `)
        .order("created_at", { ascending: false });

      // Filter by user role
      if (filters?.asSeller) {
        // Get orders where user is the seller (through product listings)
        query = query.eq("order_items.product_listings.farmer_id", user.id);
      } else {
        // Get orders where user is the buyer
        query = query.eq("buyer_id", user.id);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Orders retrieved successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Get order by ID with full details
   */
  async getOrderById(orderId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return this.createResponse(null, {
          code: "UNAUTHENTICATED",
          message: "User not authenticated"
        });
      }

      const { data, error } = await supabase
        .from(this.ordersTable)
        .select(`
          *,
          order_items (
            *,
            product_listings (
              *,
              products (
                id,
                name,
                description,
                category,
                image_url
              ),
              profiles:farmer_id (
                id,
                full_name,
                company_name,
                contact_email,
                phone_number
              )
            )
          ),
          profiles:buyer_id (
            id,
            full_name,
            company_name,
            contact_email,
            phone_number
          ),
          payments (
            id,
            amount,
            status,
            stripe_charge_id
          ),
          shipments (
            id,
            tracking_number,
            carrier,
            status,
            estimated_delivery_date,
            delivered_at
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      // Check if user has permission to view this order
      const isBuyer = (data as any).buyer_id === user.id;
      const isSeller = (data as any).order_items?.some((item: any) =>
        item.product_listings?.farmer_id === user.id
      );

      if (!isBuyer && !isSeller) {
        return this.createResponse(null, {
          code: "FORBIDDEN",
          message: "You don't have permission to view this order"
        });
      }

      return this.createResponse(data, null, "Order retrieved successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: Order["status"]) {
    try {
      const { data, error } = await (supabase
        .from(this.ordersTable) as any)
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Order status updated successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Create payment record
   */
  async createPayment(paymentData: Omit<Payment, "id" | "created_at">) {
    try {
      const { data, error } = await (supabase
        .from(this.paymentsTable) as any)
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Payment record created successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId: string, status: Payment["status"]) {
    try {
      const { data, error } = await (supabase
        .from(this.paymentsTable) as any)
        .update({ status })
        .eq("id", paymentId)
        .select()
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Payment status updated successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Create shipment record
   */
  async createShipment(shipmentData: Omit<Shipment, "id">) {
    try {
      const { data, error } = await (supabase
        .from(this.shipmentsTable) as any)
        .insert(shipmentData)
        .select()
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Shipment record created successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Update shipment status
   */
  async updateShipmentStatus(shipmentId: string, updates: Partial<Shipment>) {
    try {
      const { data, error } = await (supabase
        .from(this.shipmentsTable) as any)
        .update({
          ...updates,
          // Don't update id and order_id
          id: undefined,
          order_id: undefined
        })
        .eq("id", shipmentId)
        .select()
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Shipment status updated successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Cancel order (if in pending status)
   */
  async cancelOrder(orderId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return this.createResponse(null, {
          code: "UNAUTHENTICATED",
          message: "User not authenticated"
        });
      }

      // First check if order belongs to user and is cancellable
      const { data: order, error: fetchError } = await supabase
        .from(this.ordersTable)
        .select("buyer_id, status")
        .eq("id", orderId)
        .single();

      if (fetchError) {
        return this.createResponse(null, fetchError);
      }

      if ((order as any).buyer_id !== user.id) {
        return this.createResponse(null, {
          code: "FORBIDDEN",
          message: "You can only cancel your own orders"
        });
      }

      if ((order as any).status !== "pending") {
        return this.createResponse(null, {
          code: "INVALID_OPERATION",
          message: "Only pending orders can be cancelled"
        });
      }

      const { data, error } = await (supabase
        .from(this.ordersTable) as any)
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Order cancelled successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Get order statistics for dashboard
   */
  async getOrderStats(userId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        return this.createResponse(null, {
          code: "UNAUTHENTICATED",
          message: "User not authenticated"
        });
      }

      // Get order counts by status for buyer
      const { data: buyerStats, error: buyerError } = await supabase
        .from(this.ordersTable)
        .select("status")
        .eq("buyer_id", targetUserId);

      if (buyerError) {
        return this.createResponse(null, buyerError);
      }

      // Get order counts by status for seller (through product listings)
      const { data: sellerOrders, error: sellerError } = await supabase
        .from(this.orderItemsTable)
        .select(`
          order_id,
          orders!inner (
            status,
            buyer_id
          ),
          product_listings!inner (
            farmer_id
          )
        `)
        .eq("product_listings.farmer_id", targetUserId);

      if (sellerError) {
        return this.createResponse(null, sellerError);
      }

      // Calculate statistics
      const buyerOrderCounts = buyerStats.reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      const sellerOrderCounts = sellerOrders.reduce((acc: any, item: any) => {
        const status = item.orders.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        buyer: {
          total: buyerStats.length,
          ...buyerOrderCounts
        },
        seller: {
          total: sellerOrders.length,
          ...sellerOrderCounts
        }
      };

      return this.createResponse(stats, null, "Order statistics retrieved successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();
