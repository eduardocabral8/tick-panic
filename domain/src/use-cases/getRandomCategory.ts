import { Category } from '../entities/Category.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

export async function getRandomCategory(categoryRepo: CategoryRepository): Promise<Category> {
  const categories = await categoryRepo.findAll();
  if (categories.length === 0) {
    throw new Error('No categories available');
  }
  return categories[Math.floor(Math.random() * categories.length)];
}
