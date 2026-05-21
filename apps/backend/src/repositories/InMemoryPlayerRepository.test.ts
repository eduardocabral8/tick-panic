import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '@15-seconds/domain';
import { InMemoryPlayerRepository } from './InMemoryPlayerRepository.js';

describe('InMemoryPlayerRepository', () => {
  let repository: InMemoryPlayerRepository;

  beforeEach(() => {
    repository = new InMemoryPlayerRepository();
  });

  it('saves and finds a player by id', () => {
    const player = new Player('Alice', 'host', new Date());
    repository.save(player);

    const found = repository.findById(player.id);

    expect(found).toBe(player);
  });

  it('returns null when player is not found by id', () => {
    const found = repository.findById('non-existent-id');

    expect(found).toBeNull();
  });

  it('returns all saved players', () => {
    const player1 = new Player('Alice', 'host', new Date());
    const player2 = new Player('Bob', 'player', new Date());
    repository.save(player1);
    repository.save(player2);

    const all = repository.findAll();

    expect(all).toHaveLength(2);
    expect(all).toContain(player1);
    expect(all).toContain(player2);
  });

  it('returns empty array when no players are saved', () => {
    const all = repository.findAll();

    expect(all).toEqual([]);
  });

  it('updates an existing player on save', () => {
    const player = new Player('Alice', 'host', new Date());
    repository.save(player);
    const updatedPlayer = new Player('Alicia', 'player', new Date());
    Object.defineProperty(updatedPlayer, 'id', { value: player.id });
    repository.save(updatedPlayer);

    const found = repository.findById(player.id);

    expect(found).toBe(updatedPlayer);
    expect(found?.name).toBe('Alicia');
  });
});
