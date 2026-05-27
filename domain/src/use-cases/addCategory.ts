import { Category } from '../entities/Category.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

export async function addCategory(name: string, examples: string[] = [], categoryRepo: CategoryRepository): Promise<Category> {
  const category = new Category(name, examples);
  await categoryRepo.save(category);
  return category;
}
