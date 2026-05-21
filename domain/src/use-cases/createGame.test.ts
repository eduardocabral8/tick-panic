import { describe, it, expect, vi } from 'vitest';
import { createGame } from './createGame.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { PlayerRepository } from '../repositories/PlayerRepository.js';

describe('createGame', () => {
  it('should create a game with a host player', () => {
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    const playerRepo: PlayerRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    const game = createGame('Alice', new Date(), gameRepo, playerRepo);
    expect(game.status).toBe('WAITING');
    expect(game.players).toHaveLength(1);
    expect(game.players[0].name).toBe('Alice');
    expect(game.players[0].role).toBe('host');
    expect(gameRepo.save).toHaveBeenCalledWith(game);
    expect(playerRepo.save).toHaveBeenCalledWith(game.players[0]);
  });

  it('should throw if host name is empty', () => {
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    const playerRepo: PlayerRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    expect(() => createGame('', new Date(), gameRepo, playerRepo)).toThrow('Player name is required');
  });

  it('should throw if host name exceeds 50 characters', () => {
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    const playerRepo: PlayerRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    expect(() => createGame('a'.repeat(51), new Date(), gameRepo, playerRepo)).toThrow('Player name must be 50 characters or less');
  });
});
