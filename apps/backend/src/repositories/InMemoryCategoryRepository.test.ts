import { describe, it, expect, beforeEach } from 'vitest';
import { Category } from '@15-seconds/domain';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository.js';

describe('InMemoryCategoryRepository', () => {
  let repository: InMemoryCategoryRepository;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
  });

  it('saves and finds a category by id', () => {
    const category = new Category('Animals', ['Dog', 'Cat']);
    repository.save(category);

    const found = repository.findById(category.id);

    expect(found).toBe(category);
  });

  it('returns null when category is not found by id', () => {
    const found = repository.findById('non-existent-id');

    expect(found).toBeNull();
  });

  it('returns all saved categories', () => {
    const category1 = new Category('Animals', ['Dog']);
    const category2 = new Category('Countries', ['Argentina']);
    repository.save(category1);
    repository.save(category2);

    const all = repository.findAll();

    expect(all).toHaveLength(2);
    expect(all).toContain(category1);
    expect(all).toContain(category2);
  });

  it('returns empty array when no categories are saved', () => {
    const all = repository.findAll();

    expect(all).toEqual([]);
  });

  it('updates an existing category on save', () => {
    const category = new Category('Animals', ['Dog']);
    repository.save(category);
    const updatedCategory = new Category('Plants', ['Rose']);
    Object.defineProperty(updatedCategory, 'id', { value: category.id });
    repository.save(updatedCategory);

    const found = repository.findById(category.id);

    expect(found).toBe(updatedCategory);
    expect(found?.name).toBe('Plants');
  });
});
