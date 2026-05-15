import { Category } from '../entities/Category.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

export function addCategory(name: string, examples: string[] = [], categoryRepo: CategoryRepository): Category {
  const category = new Category(name, examples);
  categoryRepo.save(category);
  return category;
}
