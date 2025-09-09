import { supabase } from "../lib/supabase/client";

// Simple database services without strict typing for now
// This approach avoids TypeScript conflicts with Supabase types

/**
 * Service for managing user profiles
 */
export class ProfileService {
  async getAll() {
    return await supabase.from("profiles").select("*");
  }

  async getById(id: string) {
    return await supabase.from("profiles").select("*").eq("id", id).single();
  }

  async getByRole(role: string) {
    return await supabase.from("profiles").select("*").eq("role", role);
  }

  async getVerifiedFarmers() {
    return await supabase
      .from("profiles")
      .select("*")
      .eq("role", "farmer")
      .eq("is_verified", true);
  }
}

/**
 * Service for managing products
 */
export class ProductService {
  async getAll() {
    return await supabase.from("products").select("*");
  }

  async getById(id: string) {
    return await supabase.from("products").select("*").eq("id", id).single();
  }

  async getByCategory(category: string) {
    return await supabase.from("products").select("*").eq("category", category);
  }

  async searchProducts(query: string) {
    return await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${query}%`);
  }
}

/**
 * Service for managing product listings
 */
export class ProductListingService {
  async getAll() {
    return await supabase.from("product_listings").select("*");
  }

  async getById(id: string) {
    return await supabase
      .from("product_listings")
      .select("*")
      .eq("id", id)
      .single();
  }

  async getByFarmer(farmerId: string) {
    return await supabase
      .from("product_listings")
      .select(
        `
        *,
        products (
          id,
          name,
          description,
          category,
          image_url
        ),
        quality_reports (
          ai_score,
          notes
        )
      `
      )
      .eq("farmer_id", farmerId);
  }

  async getAvailableListings() {
    return await supabase
      .from("product_listings")
      .select(
        `
        *,
        products (
          id,
          name,
          description,
          category,
          image_url
        ),
        profiles!farmer_id (
          full_name,
          location_gln,
          is_verified
        )
      `
      )
      .eq("status", "available")
      .gt("quantity_available", 0);
  }

  async searchByPriceRange(minPrice: number, maxPrice: number) {
    return await supabase
      .from("product_listings")
      .select(
        `
        *,
        products (
          name,
          category,
          image_url
        )
      `
      )
      .gte("price_per_unit", minPrice)
      .lte("price_per_unit", maxPrice)
      .eq("status", "available");
  }
}

/**
 * Service for managing orders
 */
export class OrderService {
  async getAll() {
    return await supabase.from("orders").select("*");
  }

  async getById(id: string) {
    return await supabase.from("orders").select("*").eq("id", id).single();
  }

  async getByBuyer(buyerId: string) {
    return await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          product_listings (
            *,
            products (
              name,
              image_url
            )
          )
        ),
        payments (
          status,
          amount
        )
      `
      )
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false });
  }

  async getByStatus(status: string) {
    return await supabase
      .from("orders")
      .select(
        `
        *,
        profiles!buyer_id (
          full_name,
          contact_email
        )
      `
      )
      .eq("status", status);
  }

  async getOrdersForFarmer(farmerId: string) {
    return await supabase
      .from("order_items")
      .select(
        `
        *,
        orders (
          *,
          profiles!buyer_id (
            full_name,
            contact_email
          )
        ),
        product_listings!listing_id (
          *,
          products (
            name
          )
        )
      `
      )
      .eq("product_listings.farmer_id", farmerId);
  }
}

/**
 * Service for managing farm tasks
 */
export class FarmTaskService {
  async getAll() {
    return await supabase.from("farm_tasks").select("*");
  }

  async getById(id: string) {
    return await supabase.from("farm_tasks").select("*").eq("id", id).single();
  }

  async getByFarmer(farmerId: string) {
    return await supabase
      .from("farm_tasks")
      .select("*")
      .eq("farmer_id", farmerId)
      .order("due_date", { ascending: true });
  }

  async getByStatus(farmerId: string, status: string) {
    return await supabase
      .from("farm_tasks")
      .select("*")
      .eq("farmer_id", farmerId)
      .eq("status", status);
  }

  async getOverdueTasks(farmerId: string) {
    const today = new Date().toISOString().split("T")[0];
    return await supabase
      .from("farm_tasks")
      .select("*")
      .eq("farmer_id", farmerId)
      .lt("due_date", today)
      .neq("status", "completed");
  }

  // Create and update methods removed for now due to typing issues
  // These can be added later when Supabase types are properly configured
}

/**
 * Service for managing negotiations
 */
export class NegotiationService {
  async getAll() {
    return await supabase.from("negotiations").select("*");
  }

  async getById(id: string) {
    return await supabase
      .from("negotiations")
      .select("*")
      .eq("id", id)
      .single();
  }

  async getByListing(listingId: string) {
    return await supabase
      .from("negotiations")
      .select(
        `
        *,
        profiles!buyer_id (
          full_name,
          contact_email
        )
      `
      )
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false });
  }

  async getByBuyer(buyerId: string) {
    return await supabase
      .from("negotiations")
      .select(
        `
        *,
        product_listings (
          *,
          products (
            name,
            image_url
          )
        )
      `
      )
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false });
  }

  // Create and update methods removed for now due to typing issues
}

/**
 * Service for managing reviews
 */
export class ReviewService {
  async getAll() {
    return await supabase.from("reviews").select("*");
  }

  async getById(id: string) {
    return await supabase.from("reviews").select("*").eq("id", id).single();
  }

  async getByListing(listingId: string) {
    return await supabase
      .from("reviews")
      .select(
        `
        *,
        profiles!reviewer_id (
          full_name
        )
      `
      )
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false });
  }

  async getAverageRating(listingId: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("listing_id", listingId);

    if (error || !data) {
      return { averageRating: 0, totalReviews: 0, error };
    }

    const totalReviews = data.length;
    const averageRating =
      totalReviews > 0
        ? data.reduce(
            (sum: number, review: any) => sum + (review.rating || 0),
            0
          ) / totalReviews
        : 0;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      error: null,
    };
  }
}
