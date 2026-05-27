import { Category } from '../entities/Category.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

export async function getAllCategories(categoryRepo: CategoryRepository): Promise<Category[]> {
  return categoryRepo.findAll();
}
