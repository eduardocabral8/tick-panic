import { describe, it, expect } from 'vitest';
import { User, type UserRole } from './User.js';

describe('User', () => {
  it('should create a user with username, passwordHash and role', () => {
    const user = new User('alice', 'hashed_pw', 'player', new Date());
    expect(user.username).toBe('alice');
    expect(user.passwordHash).toBe('hashed_pw');
    expect(user.role).toBe('player');
  });

  it('should assign a unique id', () => {
    const u1 = new User('alice', 'h1', 'player', new Date());
    const u2 = new User('bob', 'h2', 'player', new Date());
    expect(u1.id).toBeDefined();
    expect(typeof u1.id).toBe('string');
    expect(u1.id).not.toBe(u2.id);
  });

  it('should record createdAt date', () => {
    const before = new Date();
    const user = new User('alice', 'h', 'player', new Date());
    const after = new Date();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should throw if username is empty', () => {
    expect(() => new User('', 'hash', 'player', new Date())).toThrow('Username is required');
  });

  it('should throw if username is whitespace only', () => {
    expect(() => new User('   ', 'hash', 'player', new Date())).toThrow('Username is required');
  });

  it('should throw if username exceeds 50 characters', () => {
    const longName = 'A'.repeat(51);
    expect(() => new User(longName, 'hash', 'player', new Date())).toThrow('Username must be 50 characters or less');
  });

  it('should throw if passwordHash is empty', () => {
    expect(() => new User('alice', '', 'player', new Date())).toThrow('Password hash is required');
  });

  it('should accept admin role', () => {
    const admin = new User('admin1', 'hash', 'admin', new Date());
    expect(admin.role).toBe('admin');
  });

  it('should accept player role', () => {
    const player = new User('player1', 'hash', 'player', new Date());
    expect(player.role).toBe('player');
  });

  it('should only allow admin or player role', () => {
    expect(() => new User('alice', 'hash', 'guest' as unknown as UserRole, new Date())).toThrow('Role must be admin or player');
  });
});
