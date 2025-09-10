/**
 * Product Service - Handles product and marketplace operations
 * Direct Supabase integration for product management
 */

import { supabase } from "../lib/supabase/client";
import { Product, ProductListing } from "../types/supabase";

export class ProductService {
  private productsTable = "products";
  private listingsTable = "product_listings";

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
   * Get all products with optional filtering
   */
  async getProducts(filters?: { category?: string; search?: string }) {
    try {
      let query = supabase
        .from(this.productsTable)
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Products retrieved successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string) {
    try {
      const { data, error } = await supabase
        .from(this.productsTable)
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Product retrieved successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Create new product
   */
  async createProduct(productData: Omit<Product, "id" | "created_at">) {
    try {
      const { data, error } = await (supabase
        .from(this.productsTable) as any)
        .insert(productData)
        .select()
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Product created successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Get product listings with farmer and product details
   */
  async getProductListings(filters?: {
    farmerId?: string;
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from(this.listingsTable)
        .select(`
          *,
          products:product_id (
            id,
            name,
            description,
            category,
            image_url,
            gtin
          ),
          profiles:farmer_id (
            id,
            full_name,
            company_name,
            is_verified
          )
        `)
        .order("created_at", { ascending: false });

      if (filters?.farmerId) {
        query = query.eq("farmer_id", filters.farmerId);
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

      return this.createResponse(data, null, "Product listings retrieved successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Get product listing by ID with full details
   */
  async getProductListingById(listingId: string) {
    try {
      const { data, error } = await supabase
        .from(this.listingsTable)
        .select(`
          *,
          products:product_id (
            id,
            name,
            description,
            category,
            image_url,
            gtin
          ),
          profiles:farmer_id (
            id,
            full_name,
            company_name,
            is_verified,
            contact_email,
            phone_number
          )
        `)
        .eq("id", listingId)
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Product listing retrieved successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Create product listing
   */
  async createProductListing(listingData: Omit<ProductListing, "id" | "created_at" | "updated_at">) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return this.createResponse(null, {
          code: "UNAUTHENTICATED",
          message: "User not authenticated"
        });
      }

      const { data, error } = await (supabase
        .from(this.listingsTable) as any)
        .insert({
          ...listingData,
          farmer_id: user.id
        })
        .select()
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Product listing created successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Update product listing
   */
  async updateProductListing(listingId: string, updates: Partial<ProductListing>) {
    try {
      const { data, error } = await (supabase
        .from(this.listingsTable) as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", listingId)
        .select()
        .single();

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Product listing updated successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Delete product listing
   */
  async deleteProductListing(listingId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return this.createResponse(null, {
          code: "UNAUTHENTICATED",
          message: "User not authenticated"
        });
      }

      // First check if the listing belongs to the user
      const { data: listing, error: fetchError } = await supabase
        .from(this.listingsTable)
        .select("farmer_id")
        .eq("id", listingId)
        .single();

      if (fetchError) {
        return this.createResponse(null, fetchError);
      }

      if ((listing as any).farmer_id !== user.id) {
        return this.createResponse(null, {
          code: "FORBIDDEN",
          message: "You can only delete your own listings"
        });
      }

      const { error } = await supabase
        .from(this.listingsTable)
        .delete()
        .eq("id", listingId);

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(true, null, "Product listing deleted successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Get available categories
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from(this.productsTable)
        .select("category")
        .not("category", "is", null);

      if (error) {
        return this.createResponse(null, error);
      }

      // Extract unique categories
      const categories = [...new Set(data.map((item: any) => item.category))].filter(Boolean);

      return this.createResponse(categories, null, "Categories retrieved successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  /**
   * Search product listings
   */
  async searchProductListings(searchQuery: string, filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }) {
    try {
      let query = supabase
        .from(this.listingsTable)
        .select(`
          *,
          products:product_id (
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
            is_verified
          )
        `)
        .eq("status", "available")
        .order("created_at", { ascending: false });

      // Add search filter
      if (searchQuery) {
        query = query.or(`products.name.ilike.%${searchQuery}%,products.description.ilike.%${searchQuery}%`);
      }

      // Add category filter
      if (filters?.category) {
        query = query.eq("products.category", filters.category);
      }

      // Add price filters
      if (filters?.minPrice !== undefined) {
        query = query.gte("price_per_unit", filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte("price_per_unit", filters.maxPrice);
      }

      const { data, error } = await query;

      if (error) {
        return this.createResponse(null, error);
      }

      return this.createResponse(data, null, "Search results retrieved successfully");
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
