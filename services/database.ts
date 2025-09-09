import { supabase } from "../lib/supabase/client";

/**
 * Base database service class with common CRUD operations
 * Note: Using relaxed typing to avoid Supabase type conflicts
 */
export abstract class BaseService {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Get all records from the table
   */
  async getAll() {
    return await supabase.from(this.tableName).select("*");
  }

  /**
   * Get a record by ID
   */
  async getById(id: string) {
    return await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string) {
    return await supabase.from(this.tableName).delete().eq("id", id);
  }

  /**
   * Get records with filtering
   */
  async getWhere(field: string, value: any) {
    return await supabase.from(this.tableName).select("*").eq(field, value);
  }

  /**
   * Count records in the table
   */
  async count() {
    return await supabase
      .from(this.tableName)
      .select("*", { count: "exact", head: true });
  }

  /**
   * Get records with pagination
   */
  async getPaginated(page: number = 0, limit: number = 10) {
    const from = page * limit;
    const to = from + limit - 1;

    return await supabase
      .from(this.tableName)
      .select("*", { count: "exact" })
      .range(from, to);
  }

  /**
   * Search records by a specific column
   */
  async search(column: string, value: any) {
    return await supabase.from(this.tableName).select("*").eq(column, value);
  }
}
