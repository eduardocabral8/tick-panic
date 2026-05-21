import { describe, it, expect, vi } from 'vitest';
import { getAllCategories } from './getAllCategories.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

describe('getAllCategories', () => {
  it('should return all categories', () => {
    const category1 = { id: '1', name: 'Animals', examples: ['Dog'] };
    const category2 = { id: '2', name: 'Countries', examples: ['Argentina'] };
    const categoryRepo: CategoryRepository = {
      save: vi.fn(),
      findAll: vi.fn().mockReturnValue([category1, category2]),
      findById: vi.fn(),
    };

    const result = getAllCategories(categoryRepo);

    expect(result).toEqual([category1, category2]);
    expect(categoryRepo.findAll).toHaveBeenCalled();
  });

  it('should return empty array when no categories exist', () => {
    const categoryRepo: CategoryRepository = {
      save: vi.fn(),
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn(),
    };

    const result = getAllCategories(categoryRepo);

    expect(result).toEqual([]);
  });

  it('should return a single category', () => {
    const category = { id: '1', name: 'Animals', examples: ['Dog'] };
    const categoryRepo: CategoryRepository = {
      save: vi.fn(),
      findAll: vi.fn().mockReturnValue([category]),
      findById: vi.fn(),
    };

    const result = getAllCategories(categoryRepo);

    expect(result).toEqual([category]);
  });
});
