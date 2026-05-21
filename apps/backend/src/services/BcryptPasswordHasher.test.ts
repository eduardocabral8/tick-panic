import { describe, it, expect } from 'vitest';
import { BcryptPasswordHasher } from './BcryptPasswordHasher.js';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  it('should hash a plain password', async () => {
    const hash = await hasher.hash('plain123');
    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(0);
    expect(hash).not.toBe('plain123');
  });

  it('should return true for matching passwords', async () => {
    const hash = await hasher.hash('plain123');
    const matches = await hasher.compare('plain123', hash);
    expect(matches).toBe(true);
  });

  it('should return false for non-matching passwords', async () => {
    const hash = await hasher.hash('plain123');
    const matches = await hasher.compare('wrongpass', hash);
    expect(matches).toBe(false);
  });
});
