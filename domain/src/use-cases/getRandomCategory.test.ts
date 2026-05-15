import { describe, it, expect, vi } from 'vitest';
import { getRandomCategory } from './getRandomCategory.js';
import { Category } from '../entities/Category.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

describe('getRandomCategory', () => {
  it('should return a category from the repository', () => {
    const categories = [new Category('a'), new Category('b'), new Category('c')];
    const categoryRepo: CategoryRepository = { save: vi.fn(), findAll: vi.fn(() => categories), findById: vi.fn() };
    const result = getRandomCategory(categoryRepo);
    expect(categories).toContain(result);
  });

  it('should throw if no categories available', () => {
    const categoryRepo: CategoryRepository = { save: vi.fn(), findAll: vi.fn(() => []), findById: vi.fn() };
    expect(() => getRandomCategory(categoryRepo)).toThrow('No categories available');
  });

  it('should return the only category when repository has one', () => {
    const only = new Category('unica');
    const categoryRepo: CategoryRepository = { save: vi.fn(), findAll: vi.fn(() => [only]), findById: vi.fn() };
    const result = getRandomCategory(categoryRepo);
    expect(result).toBe(only);
  });
});
