import { describe, it, expect } from 'vitest';
import { JwtTokenGenerator } from './JwtTokenGenerator.js';

describe('JwtTokenGenerator', () => {
  const secret = 'test-secret';
  const generator = new JwtTokenGenerator(secret);

  it('should generate a token', async () => {
    const token = await generator.generate({ userId: '123', role: 'player' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('should verify a valid token', async () => {
    const token = await generator.generate({ userId: '123', role: 'player' });
    const payload = await generator.verify(token);
    expect(payload.userId).toBe('123');
    expect(payload.role).toBe('player');
  });

  it('should throw for invalid token', async () => {
    await expect(generator.verify('invalid-token')).rejects.toThrow();
  });
});
