import { describe, it, expect } from 'vitest';
import { Player } from './Player.js';

describe('Player', () => {
  it('should create a player with name and role', () => {
    const player = new Player('Alice', 'player');
    expect(player.name).toBe('Alice');
    expect(player.role).toBe('player');
  });

  it('should assign a unique id', () => {
    const p1 = new Player('Alice', 'player');
    const p2 = new Player('Bob', 'player');
    expect(p1.id).toBeDefined();
    expect(typeof p1.id).toBe('string');
    expect(p1.id).not.toBe(p2.id);
  });

  it('should record joinedAt date', () => {
    const before = new Date();
    const player = new Player('Alice', 'player');
    const after = new Date();
    expect(player.joinedAt).toBeInstanceOf(Date);
    expect(player.joinedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(player.joinedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should throw if name is empty', () => {
    expect(() => new Player('', 'player')).toThrow('Player name is required');
  });

  it('should throw if name is whitespace only', () => {
    expect(() => new Player('   ', 'player')).toThrow('Player name is required');
  });

  it('should throw if name exceeds 50 characters', () => {
    const longName = 'A'.repeat(51);
    expect(() => new Player(longName, 'player')).toThrow('Player name must be 50 characters or less');
  });

  it('should accept host role', () => {
    const host = new Player('Alice', 'host');
    expect(host.role).toBe('host');
  });

  it('should accept player role', () => {
    const player = new Player('Bob', 'player');
    expect(player.role).toBe('player');
  });

  it('should only allow host or player role', () => {
    expect(() => new Player('Alice', 'spectator' as any)).toThrow('Role must be host or player');
  });
});
