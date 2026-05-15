import { describe, it, expect, vi } from 'vitest';
import { addCategory } from './addCategory.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

describe('addCategory', () => {
  it('should create and save a category', () => {
    const categoryRepo: CategoryRepository = { save: vi.fn(), findAll: vi.fn(), findById: vi.fn() };
    const category = addCategory('frutas', ['manzana', 'pera'], categoryRepo);
    expect(category.name).toBe('frutas');
    expect(category.examples).toEqual(['manzana', 'pera']);
    expect(categoryRepo.save).toHaveBeenCalledWith(category);
  });

  it('should throw if name is empty', () => {
    const categoryRepo: CategoryRepository = { save: vi.fn(), findAll: vi.fn(), findById: vi.fn() };
    expect(() => addCategory('', [], categoryRepo)).toThrow('Category name is required');
  });

  it('should throw if name is only whitespace', () => {
    const categoryRepo: CategoryRepository = { save: vi.fn(), findAll: vi.fn(), findById: vi.fn() };
    expect(() => addCategory('   ', [], categoryRepo)).toThrow('Category name is required');
  });
});
