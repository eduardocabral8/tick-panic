import { describe, it, expect, vi } from 'vitest';
import { endGame } from './endGame.js';
import { Game } from '../entities/Game.js';
import { Player } from '../entities/Player.js';
import { Category } from '../entities/Category.js';
import { GameRepository } from '../repositories/GameRepository.js';

describe('endGame', () => {
  it('should finish an in-progress game', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      (cats) => cats[0],
      host.id
    );
    for (let i = 0; i < 5; i++) {
      const round = game.rounds[i];
      round.turns.forEach(t => { t.start(new Date()); t.end(new Date()); });
      if (i < 4) game.startNextRound(new Date());
    }
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const now = new Date();
    const updated = endGame(game.id, now, gameRepo);
    expect(updated.status).toBe('FINISHED');
    expect(updated.finishedAt).toBe(now);
    expect(gameRepo.save).toHaveBeenCalledWith(game);
  });

  it('should throw if game not found', () => {
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => null), findAll: vi.fn() };
    expect(() => endGame('missing', new Date(), gameRepo)).toThrow('Game not found');
  });

  it('should throw if game is not in progress', () => {
    const game = new Game(new Date());
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    expect(() => endGame(game.id, new Date(), gameRepo)).toThrow('Game is not in progress');
  });

  it('should throw if game is already finished', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      (cats) => cats[0],
      host.id
    );
    for (let i = 0; i < 5; i++) {
      const round = game.rounds[i];
      round.turns.forEach(t => { t.start(new Date()); t.end(new Date()); });
      if (i < 4) game.startNextRound(new Date());
    }
    game.finish(new Date());
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    expect(() => endGame(game.id, new Date(), gameRepo)).toThrow('Game is not in progress');
  });
});
