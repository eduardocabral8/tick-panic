import { describe, it, expect, beforeEach } from 'vitest';
import { User } from '@15-seconds/domain';
import { InMemoryUserRepository } from './InMemoryUserRepository.js';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  it('saves and finds a user by id', async () => {
    const user = new User('testuser', 'hashedpassword', 'player', new Date());
    await repository.save(user);

    const found = await repository.findById(user.id);

    expect(found).toBe(user);
  });

  it('returns null when user is not found by id', async () => {
    const found = await repository.findById('non-existent-id');

    expect(found).toBeNull();
  });

  it('finds a user by username', async () => {
    const user = new User('testuser', 'hashedpassword', 'player', new Date());
    await repository.save(user);

    const found = await repository.findByUsername('testuser');

    expect(found).toBe(user);
  });

  it('returns null when user is not found by username', async () => {
    const found = await repository.findByUsername('non-existent-user');

    expect(found).toBeNull();
  });

  it('returns all saved users', async () => {
    const user1 = new User('user1', 'hash1', 'player', new Date());
    const user2 = new User('user2', 'hash2', 'admin', new Date());
    await repository.save(user1);
    await repository.save(user2);

    const all = await repository.findAll();

    expect(all).toHaveLength(2);
    expect(all).toContain(user1);
    expect(all).toContain(user2);
  });

  it('returns empty array when no users are saved', async () => {
    const all = await repository.findAll();

    expect(all).toEqual([]);
  });

  it('updates an existing user on save', async () => {
    const user = new User('testuser', 'hashedpassword', 'player', new Date());
    await repository.save(user);
    const updatedUser = new User('updateduser', 'newhash', 'admin', new Date());
    Object.defineProperty(updatedUser, 'id', { value: user.id });
    await repository.save(updatedUser);

    const found = await repository.findById(user.id);

    expect(found).toBe(updatedUser);
    expect(found?.username).toBe('updateduser');
  });
});
