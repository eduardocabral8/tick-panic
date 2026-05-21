import { Category } from '../entities/Category.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

export function getAllCategories(categoryRepo: CategoryRepository): Category[] {
  return categoryRepo.findAll();
}
