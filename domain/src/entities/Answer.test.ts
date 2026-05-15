import { describe, it, expect } from 'vitest';
import { Answer } from './Answer.js';

describe('Answer', () => {
  it('should create an answer with text and turnId', () => {
    const answer = new Answer('turn-1', 'manzana', new Date('2024-01-01T00:00:00Z'));
    expect(answer.text).toBe('manzana');
    expect(answer.turnId).toBe('turn-1');
  });

  it('should assign a unique id', () => {
    const a1 = new Answer('turn-1', 'manzana', new Date());
    const a2 = new Answer('turn-1', 'pera', new Date());
    expect(a1.id).toBeDefined();
    expect(typeof a1.id).toBe('string');
    expect(a1.id).not.toBe(a2.id);
  });

  it('should start with isValid as null', () => {
    const answer = new Answer('turn-1', 'manzana', new Date());
    expect(answer.isValid).toBeNull();
  });

  it('should trim the text', () => {
    const answer = new Answer('turn-1', '  manzana  ', new Date());
    expect(answer.text).toBe('manzana');
  });

  it('should throw if text is empty', () => {
    expect(() => new Answer('turn-1', '', new Date())).toThrow('Answer text is required');
  });

  it('should throw if text is whitespace only', () => {
    expect(() => new Answer('turn-1', '   ', new Date())).toThrow('Answer text is required');
  });

  it('should record submittedAt', () => {
    const now = new Date('2024-01-01T00:00:00Z');
    const answer = new Answer('turn-1', 'manzana', now);
    expect(answer.submittedAt).toEqual(now);
  });

  it('should validate as valid', () => {
    const answer = new Answer('turn-1', 'manzana', new Date());
    const validatedAt = new Date('2024-01-01T00:00:01Z');
    answer.validate(true, validatedAt);
    expect(answer.isValid).toBe(true);
    expect(answer.validatedAt).toEqual(validatedAt);
  });

  it('should validate as invalid', () => {
    const answer = new Answer('turn-1', 'manzana', new Date());
    answer.validate(false, new Date());
    expect(answer.isValid).toBe(false);
  });

  it('should throw if validating twice', () => {
    const answer = new Answer('turn-1', 'manzana', new Date());
    answer.validate(true, new Date());
    expect(() => answer.validate(false, new Date())).toThrow('Answer has already been validated');
  });
});
