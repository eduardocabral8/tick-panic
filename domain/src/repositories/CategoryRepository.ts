import { Category } from '../entities/Category.js';

export interface CategoryRepository {
  save(category: Category): void;
  findAll(): Category[];
  findById(id: string): Category | null;
}
