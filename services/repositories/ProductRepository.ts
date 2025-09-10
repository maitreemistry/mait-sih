import { TABLE_NAMES } from "../config";
import { BaseRepository } from "./BaseRepository";

export class ProductRepository extends BaseRepository {
  constructor() {
    super(TABLE_NAMES.PRODUCTS);
  }

  async findByCategory(category: string): Promise<any> {
    return this.findWhere([
      { column: "category", operator: "eq", value: category },
    ]);
  }

  async searchByName(query: string): Promise<any> {
    return this.findWhere([
      { column: "name", operator: "ilike", value: `%${query}%` },
    ]);
  }
}
