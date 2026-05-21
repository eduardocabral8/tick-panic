import { describe, it, expect, vi } from 'vitest';
import { loginUser } from './loginUser.js';
import { AuthService } from '../services/AuthService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { PasswordHasherPort } from '../ports/PasswordHasherPort.js';
import { TokenGeneratorPort } from '../ports/TokenGeneratorPort.js';

describe('loginUser', () => {
  it('should return a token for valid credentials', async () => {
    const existingUser = { id: '123', username: 'player1', passwordHash: 'hashed', role: 'player' as const, createdAt: new Date() };
    const userRepo: UserRepository = { save: vi.fn(), findById: vi.fn(), findByUsername: vi.fn().mockReturnValue(existingUser), findAll: vi.fn() };
    const passwordHasher: PasswordHasherPort = { hash: vi.fn(), compare: vi.fn().mockResolvedValue(true) };
    const tokenGenerator: TokenGeneratorPort = { generate: vi.fn().mockResolvedValue('jwt-token-123'), verify: vi.fn() };
    const authService = new AuthService(userRepo, passwordHasher, tokenGenerator);

    const token = await loginUser('player1', 'secret123', authService);

    expect(token).toBe('jwt-token-123');
    expect(tokenGenerator.generate).toHaveBeenCalledWith({ userId: '123', role: 'player' });
  });

  it('should throw for invalid username', async () => {
    const userRepo: UserRepository = { save: vi.fn(), findById: vi.fn(), findByUsername: vi.fn().mockReturnValue(null), findAll: vi.fn() };
    const passwordHasher: PasswordHasherPort = { hash: vi.fn(), compare: vi.fn() };
    const tokenGenerator: TokenGeneratorPort = { generate: vi.fn(), verify: vi.fn() };
    const authService = new AuthService(userRepo, passwordHasher, tokenGenerator);

    await expect(loginUser('unknown', 'secret123', authService)).rejects.toThrow('Invalid credentials');
  });

  it('should throw for invalid password', async () => {
    const existingUser = { id: '123', username: 'player1', passwordHash: 'hashed', role: 'player' as const, createdAt: new Date() };
    const userRepo: UserRepository = { save: vi.fn(), findById: vi.fn(), findByUsername: vi.fn().mockReturnValue(existingUser), findAll: vi.fn() };
    const passwordHasher: PasswordHasherPort = { hash: vi.fn(), compare: vi.fn().mockResolvedValue(false) };
    const tokenGenerator: TokenGeneratorPort = { generate: vi.fn(), verify: vi.fn() };
    const authService = new AuthService(userRepo, passwordHasher, tokenGenerator);

    await expect(loginUser('player1', 'wrongpass', authService)).rejects.toThrow('Invalid credentials');
  });
});
