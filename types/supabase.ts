// Database types generated from your Krishi Sakhi schema
// This file should be kept in sync with your Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "farmer" | "distributor" | "retailer";
          company_name: string | null;
          full_name: string | null;
          contact_email: string | null;
          phone_number: string | null;
          address: string | null;
          location_gln: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: "farmer" | "distributor" | "retailer";
          company_name?: string | null;
          full_name?: string | null;
          contact_email?: string | null;
          phone_number?: string | null;
          address?: string | null;
          location_gln?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "farmer" | "distributor" | "retailer";
          company_name?: string | null;
          full_name?: string | null;
          contact_email?: string | null;
          phone_number?: string | null;
          address?: string | null;
          location_gln?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          image_url: string | null;
          gtin: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          image_url?: string | null;
          gtin?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          image_url?: string | null;
          gtin?: string | null;
          created_at?: string;
        };
      };
      product_listings: {
        Row: {
          id: string;
          farmer_id: string;
          product_id: string;
          quantity_available: number;
          unit_of_measure: string;
          price_per_unit: number;
          status: "available" | "sold_out" | "delisted";
          harvest_date: string | null;
          quality_report_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          farmer_id: string;
          product_id: string;
          quantity_available: number;
          unit_of_measure: string;
          price_per_unit: number;
          status?: "available" | "sold_out" | "delisted";
          harvest_date?: string | null;
          quality_report_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          farmer_id?: string;
          product_id?: string;
          quantity_available?: number;
          unit_of_measure?: string;
          price_per_unit?: number;
          status?: "available" | "sold_out" | "delisted";
          harvest_date?: string | null;
          quality_report_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          status:
            | "pending"
            | "confirmed"
            | "shipped"
            | "delivered"
            | "cancelled";
          total_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          status?:
            | "pending"
            | "confirmed"
            | "shipped"
            | "delivered"
            | "cancelled";
          total_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          status?:
            | "pending"
            | "confirmed"
            | "shipped"
            | "delivered"
            | "cancelled";
          total_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          listing_id: string;
          quantity: number;
          price_at_purchase: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          listing_id: string;
          quantity: number;
          price_at_purchase: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          listing_id?: string;
          quantity?: number;
          price_at_purchase?: number;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          stripe_charge_id: string | null;
          amount: number;
          status: "succeeded" | "pending" | "failed";
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          stripe_charge_id?: string | null;
          amount: number;
          status?: "succeeded" | "pending" | "failed";
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          stripe_charge_id?: string | null;
          amount?: number;
          status?: "succeeded" | "pending" | "failed";
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          listing_id: string;
          reviewer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          reviewer_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          reviewer_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      certifications: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          issuing_body: string | null;
          valid_until: string | null;
          ipfs_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          issuing_body?: string | null;
          valid_until?: string | null;
          ipfs_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          issuing_body?: string | null;
          valid_until?: string | null;
          ipfs_hash?: string | null;
          created_at?: string;
        };
      };
      quality_reports: {
        Row: {
          id: string;
          listing_id: string;
          ipfs_hash_images: string | null;
          ai_score: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          ipfs_hash_images?: string | null;
          ai_score?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          ipfs_hash_images?: string | null;
          ai_score?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: number;
          sender_id: string;
          receiver_id: string;
          order_id: string | null;
          content: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: number;
          sender_id: string;
          receiver_id: string;
          order_id?: string | null;
          content: string;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: number;
          sender_id?: string;
          receiver_id?: string;
          order_id?: string | null;
          content?: string;
          created_at?: string;
          read_at?: string | null;
        };
      };
      shipments: {
        Row: {
          id: string;
          order_id: string;
          tracking_number: string | null;
          carrier: string | null;
          status: "in_transit" | "delivered" | "delayed";
          shipped_at: string | null;
          estimated_delivery_date: string | null;
          delivered_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          tracking_number?: string | null;
          carrier?: string | null;
          status?: "in_transit" | "delivered" | "delayed";
          shipped_at?: string | null;
          estimated_delivery_date?: string | null;
          delivered_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          tracking_number?: string | null;
          carrier?: string | null;
          status?: "in_transit" | "delivered" | "delayed";
          shipped_at?: string | null;
          estimated_delivery_date?: string | null;
          delivered_at?: string | null;
        };
      };
      retailer_inventory: {
        Row: {
          id: string;
          retailer_id: string;
          listing_id: string;
          quantity_on_hand: number;
          last_updated: string;
        };
        Insert: {
          id?: string;
          retailer_id: string;
          listing_id: string;
          quantity_on_hand: number;
          last_updated?: string;
        };
        Update: {
          id?: string;
          retailer_id?: string;
          listing_id?: string;
          quantity_on_hand?: number;
          last_updated?: string;
        };
      };
      cold_chain_logs: {
        Row: {
          id: number;
          retailer_id: string;
          storage_unit_id: string;
          temperature: number;
          notes: string | null;
          logged_by_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          retailer_id: string;
          storage_unit_id: string;
          temperature: number;
          notes?: string | null;
          logged_by_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          retailer_id?: string;
          storage_unit_id?: string;
          temperature?: number;
          notes?: string | null;
          logged_by_id?: string | null;
          created_at?: string;
        };
      };
      blockchain_tx_references: {
        Row: {
          id: number;
          related_table: string;
          related_id: string;
          tx_hash: string;
          tx_timestamp: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          related_table: string;
          related_id: string;
          tx_hash: string;
          tx_timestamp?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          related_table?: string;
          related_id?: string;
          tx_hash?: string;
          tx_timestamp?: string | null;
          created_at?: string;
        };
      };
      negotiations: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          offered_price: number;
          status: "pending" | "accepted" | "rejected" | "countered";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_id: string;
          offered_price: number;
          status?: "pending" | "accepted" | "rejected" | "countered";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          buyer_id?: string;
          offered_price?: number;
          status?: "pending" | "accepted" | "rejected" | "countered";
          created_at?: string;
          updated_at?: string;
        };
      };
      disputes: {
        Row: {
          id: string;
          order_id: string;
          claimant_id: string;
          respondent_id: string;
          reason: string;
          status: "open" | "under_review" | "resolved" | "closed";
          resolution_notes: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          claimant_id: string;
          respondent_id: string;
          reason: string;
          status?: "open" | "under_review" | "resolved" | "closed";
          resolution_notes?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          claimant_id?: string;
          respondent_id?: string;
          reason?: string;
          status?: "open" | "under_review" | "resolved" | "closed";
          resolution_notes?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
      };
      farm_tasks: {
        Row: {
          id: string;
          farmer_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          status: "pending" | "in_progress" | "completed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          farmer_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          status?: "pending" | "in_progress" | "completed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          farmer_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          status?: "pending" | "in_progress" | "completed";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "farmer" | "distributor" | "retailer";
      product_listing_status: "available" | "sold_out" | "delisted";
      order_status:
        | "pending"
        | "confirmed"
        | "shipped"
        | "delivered"
        | "cancelled";
      shipment_status: "in_transit" | "delivered" | "delayed";
      payment_status: "succeeded" | "pending" | "failed";
      negotiation_status: "pending" | "accepted" | "rejected" | "countered";
      dispute_status: "open" | "under_review" | "resolved" | "closed";
      task_status: "pending" | "in_progress" | "completed";
    };
  };
}

// Convenience type exports
export type UserRole = Database["public"]["Enums"]["user_role"];
export type ProductListingStatus =
  Database["public"]["Enums"]["product_listing_status"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type ShipmentStatus = Database["public"]["Enums"]["shipment_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type NegotiationStatus =
  Database["public"]["Enums"]["negotiation_status"];
export type DisputeStatus = Database["public"]["Enums"]["dispute_status"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];

// Table row types for easier imports
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductListing =
  Database["public"]["Tables"]["product_listings"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Certification =
  Database["public"]["Tables"]["certifications"]["Row"];
export type QualityReport =
  Database["public"]["Tables"]["quality_reports"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Shipment = Database["public"]["Tables"]["shipments"]["Row"];
export type RetailerInventory =
  Database["public"]["Tables"]["retailer_inventory"]["Row"];
export type ColdChainLog =
  Database["public"]["Tables"]["cold_chain_logs"]["Row"];
export type BlockchainTxReference =
  Database["public"]["Tables"]["blockchain_tx_references"]["Row"];
export type Negotiation = Database["public"]["Tables"]["negotiations"]["Row"];
export type Dispute = Database["public"]["Tables"]["disputes"]["Row"];
export type FarmTask = Database["public"]["Tables"]["farm_tasks"]["Row"];
