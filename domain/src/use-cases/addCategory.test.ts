import { describe, it, expect, vi } from 'vitest';
import { addCategory } from './addCategory.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

describe('addCategory', () => {
  it('should create and save a category', async () => {
    const categoryRepo: CategoryRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null)
    };
    const category = await addCategory('frutas', ['manzana', 'pera'], categoryRepo);
    expect(category.name).toBe('frutas');
    expect(category.examples).toEqual(['manzana', 'pera']);
    expect(categoryRepo.save).toHaveBeenCalledWith(category);
  });

  it('should throw if name is empty', async () => {
    const categoryRepo: CategoryRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null)
    };
    await expect(addCategory('', [], categoryRepo)).rejects.toThrow('Category name is required');
  });

  it('should throw if name is only whitespace', async () => {
    const categoryRepo: CategoryRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null)
    };
    await expect(addCategory('   ', [], categoryRepo)).rejects.toThrow('Category name is required');
  });
});
