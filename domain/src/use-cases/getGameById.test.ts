import { describe, it, expect, vi } from 'vitest';
import { getGameById } from './getGameById.js';
import { GameRepository } from '../repositories/GameRepository.js';

describe('getGameById', () => {
  it('should return the game when found', () => {
    const game = { id: 'game-1', status: 'WAITING' };
    const gameRepo: GameRepository = {
      save: vi.fn(),
      findById: vi.fn().mockReturnValue(game),
      findAll: vi.fn(),
    };

    const result = getGameById('game-1', gameRepo);

    expect(result).toBe(game);
    expect(gameRepo.findById).toHaveBeenCalledWith('game-1');
  });

  it('should throw when game is not found', () => {
    const gameRepo: GameRepository = {
      save: vi.fn(),
      findById: vi.fn().mockReturnValue(null),
      findAll: vi.fn(),
    };

    expect(() => getGameById('non-existent', gameRepo)).toThrow('Game not found');
  });

  it('should throw when gameId is empty', () => {
    const gameRepo: GameRepository = {
      save: vi.fn(),
      findById: vi.fn().mockReturnValue(null),
      findAll: vi.fn(),
    };

    expect(() => getGameById('', gameRepo)).toThrow('Game not found');
  });
});
