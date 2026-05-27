import { Category } from '../entities/Category.js';

export interface CategoryRepository {
  save(category: Category): Promise<void>;
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
}
