import { describe, it, expect, vi } from 'vitest';
import { getAllCategories } from './getAllCategories.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { Category } from '../entities/Category.js';

describe('getAllCategories', () => {
  it('should return all categories', async () => {
    const category1 = new Category('Animals', ['Dog']);
    const category2 = new Category('Countries', ['Argentina']);
    const categoryRepo: CategoryRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([category1, category2]),
      findById: vi.fn().mockResolvedValue(null),
    };

    const result = await getAllCategories(categoryRepo);

    expect(result).toEqual([category1, category2]);
    expect(categoryRepo.findAll).toHaveBeenCalled();
  });

  it('should return empty array when no categories exist', async () => {
    const categoryRepo: CategoryRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null),
    };

    const result = await getAllCategories(categoryRepo);

    expect(result).toEqual([]);
  });

  it('should return a single category', async () => {
    const category = new Category('Animals', ['Dog']);
    const categoryRepo: CategoryRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([category]),
      findById: vi.fn().mockResolvedValue(null),
    };

    const result = await getAllCategories(categoryRepo);

    expect(result).toEqual([category]);
  });
});
