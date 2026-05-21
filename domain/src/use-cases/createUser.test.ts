import { describe, it, expect, vi } from 'vitest';
import { createUser } from './createUser.js';
import { AuthService } from '../services/AuthService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { PasswordHasherPort } from '../ports/PasswordHasherPort.js';
import { TokenGeneratorPort } from '../ports/TokenGeneratorPort.js';

describe('createUser', () => {
  it('should register a new user and return it', async () => {
    const userRepo: UserRepository = { save: vi.fn(), findById: vi.fn(), findByUsername: vi.fn().mockReturnValue(null), findAll: vi.fn() };
    const passwordHasher: PasswordHasherPort = { hash: vi.fn().mockResolvedValue('hashed'), compare: vi.fn() };
    const tokenGenerator: TokenGeneratorPort = { generate: vi.fn(), verify: vi.fn() };
    const authService = new AuthService(userRepo, passwordHasher, tokenGenerator);

    const user = await createUser('player1', 'secret123', 'player', new Date(), authService);

    expect(user.username).toBe('player1');
    expect(user.role).toBe('player');
    expect(userRepo.save).toHaveBeenCalledWith(user);
  });

  it('should throw if username already exists', async () => {
    const existingUser = { id: '123', username: 'player1', passwordHash: 'hash', role: 'player' as const, createdAt: new Date() };
    const userRepo: UserRepository = { save: vi.fn(), findById: vi.fn(), findByUsername: vi.fn().mockReturnValue(existingUser), findAll: vi.fn() };
    const passwordHasher: PasswordHasherPort = { hash: vi.fn(), compare: vi.fn() };
    const tokenGenerator: TokenGeneratorPort = { generate: vi.fn(), verify: vi.fn() };
    const authService = new AuthService(userRepo, passwordHasher, tokenGenerator);

    await expect(createUser('player1', 'secret123', 'player', new Date(), authService)).rejects.toThrow('Username already exists');
  });

  it('should throw if username is empty', async () => {
    const userRepo: UserRepository = { save: vi.fn(), findById: vi.fn(), findByUsername: vi.fn().mockReturnValue(null), findAll: vi.fn() };
    const passwordHasher: PasswordHasherPort = { hash: vi.fn(), compare: vi.fn() };
    const tokenGenerator: TokenGeneratorPort = { generate: vi.fn(), verify: vi.fn() };
    const authService = new AuthService(userRepo, passwordHasher, tokenGenerator);

    await expect(createUser('', 'secret123', 'player', new Date(), authService)).rejects.toThrow('Username is required');
  });

  it('should throw if password hash is empty', async () => {
    const userRepo: UserRepository = { save: vi.fn(), findById: vi.fn(), findByUsername: vi.fn().mockReturnValue(null), findAll: vi.fn() };
    const passwordHasher: PasswordHasherPort = { hash: vi.fn().mockResolvedValue(''), compare: vi.fn() };
    const tokenGenerator: TokenGeneratorPort = { generate: vi.fn(), verify: vi.fn() };
    const authService = new AuthService(userRepo, passwordHasher, tokenGenerator);

    await expect(createUser('player1', '', 'player', new Date(), authService)).rejects.toThrow('Password hash is required');
  });
});
