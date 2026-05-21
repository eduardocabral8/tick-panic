import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '@15-seconds/domain';
import { InMemoryGameRepository } from './InMemoryGameRepository.js';

describe('InMemoryGameRepository', () => {
  let repository: InMemoryGameRepository;

  beforeEach(() => {
    repository = new InMemoryGameRepository();
  });

  it('saves and finds a game by id', () => {
    const game = new Game(new Date());
    repository.save(game);

    const found = repository.findById(game.id);

    expect(found).toBe(game);
  });

  it('returns null when game is not found by id', () => {
    const found = repository.findById('non-existent-id');

    expect(found).toBeNull();
  });

  it('returns all saved games', () => {
    const game1 = new Game(new Date());
    const game2 = new Game(new Date());
    repository.save(game1);
    repository.save(game2);

    const all = repository.findAll();

    expect(all).toHaveLength(2);
    expect(all).toContain(game1);
    expect(all).toContain(game2);
  });

  it('returns empty array when no games are saved', () => {
    const all = repository.findAll();

    expect(all).toEqual([]);
  });

  it('updates an existing game on save', () => {
    const game = new Game(new Date());
    repository.save(game);
    const updatedGame = new Game(new Date());
    Object.defineProperty(updatedGame, 'id', { value: game.id });
    repository.save(updatedGame);

    const found = repository.findById(game.id);

    expect(found).toBe(updatedGame);
  });
});
