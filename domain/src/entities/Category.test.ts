import { describe, it, expect } from 'vitest';
import { Category } from './Category.js';

describe('Category', () => {
  it('should create a category with name', () => {
    const cat = new Category('frutas');
    expect(cat.name).toBe('frutas');
  });

  it('should assign a unique id', () => {
    const c1 = new Category('frutas');
    const c2 = new Category('países');
    expect(c1.id).toBeDefined();
    expect(typeof c1.id).toBe('string');
    expect(c1.id).not.toBe(c2.id);
  });

  it('should accept optional examples', () => {
    const cat = new Category('frutas', ['manzana', 'banana']);
    expect(cat.examples).toEqual(['manzana', 'banana']);
  });

  it('should default examples to empty array', () => {
    const cat = new Category('frutas');
    expect(cat.examples).toEqual([]);
  });

  it('should throw if name is empty', () => {
    expect(() => new Category('')).toThrow('Category name is required');
  });

  it('should throw if name is whitespace only', () => {
    expect(() => new Category('   ')).toThrow('Category name is required');
  });

  it('should trim the name', () => {
    const cat = new Category('  frutas  ');
    expect(cat.name).toBe('frutas');
  });
});
