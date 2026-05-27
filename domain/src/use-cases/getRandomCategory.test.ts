import { describe, it, expect, vi } from 'vitest';
import { getRandomCategory } from './getRandomCategory.js';
import { Category } from '../entities/Category.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

describe('getRandomCategory', () => {
  it('should return a category from the repository', async () => {
    const categories = [new Category('a'), new Category('b'), new Category('c')];
    const categoryRepo: CategoryRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue(categories),
      findById: vi.fn().mockResolvedValue(null)
    };
    const result = await getRandomCategory(categoryRepo);
    expect(categories).toContain(result);
  });

  it('should throw if no categories available', async () => {
    const categoryRepo: CategoryRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null)
    };
    await expect(getRandomCategory(categoryRepo)).rejects.toThrow('No categories available');
  });

  it('should return the only category when repository has one', async () => {
    const only = new Category('unica');
    const categoryRepo: CategoryRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([only]),
      findById: vi.fn().mockResolvedValue(null)
    };
    const result = await getRandomCategory(categoryRepo);
    expect(result).toBe(only);
  });
});
