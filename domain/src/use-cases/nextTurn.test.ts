import { describe, it, expect, vi } from 'vitest';
import { nextTurn } from './nextTurn.js';
import { Game } from '../entities/Game.js';
import { Player } from '../entities/Player.js';
import { Category } from '../entities/Category.js';
import { GameRepository } from '../repositories/GameRepository.js';

describe('nextTurn', () => {
  it('should return the next pending turn in the current round', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c')],
      (cats) => cats[0],
      host.id
    );
    const turn0 = game.rounds[0].turns[0];
    turn0.start(new Date());
    turn0.end(new Date());
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const result = nextTurn(game.id, new Date(), gameRepo);
    expect(result).not.toBeNull();
    expect(result?.status).toBe('PENDING');
  });

  it('should advance to next round when no pending turns remain', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c')],
      (cats) => cats[0],
      host.id
    );
    game.rounds[0].turns.forEach(t => { t.start(new Date()); t.end(new Date()); });
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const result = nextTurn(game.id, new Date(), gameRepo);
    expect(game.currentRoundIndex).toBe(1);
    expect(result).not.toBeNull();
    expect(gameRepo.save).toHaveBeenCalledWith(game);
  });

  it('should finish game after 3rd round and return null', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c')],
      (cats) => cats[0],
      host.id
    );
    for (let i = 0; i < 3; i++) {
      game.rounds[i].turns.forEach(t => { t.start(new Date()); t.end(new Date()); });
      if (i < 2) game.startNextRound(new Date());
    }
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const result = nextTurn(game.id, new Date(), gameRepo);
    expect(game.status).toBe('FINISHED');
    expect(result).toBeNull();
    expect(gameRepo.save).toHaveBeenCalledWith(game);
  });

  it('should throw if game not found', () => {
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => null), findAll: vi.fn() };
    expect(() => nextTurn('missing', new Date(), gameRepo)).toThrow('Game not found');
  });

  it('should throw if game is not in progress', () => {
    const game = new Game(new Date());
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    expect(() => nextTurn(game.id, new Date(), gameRepo)).toThrow('Game is not in progress');
  });

  it('should throw if current round has active turn and no pending turns', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c')],
      (cats) => cats[0],
      host.id
    );
    game.rounds[0].turns.forEach(t => t.start(new Date()));
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    expect(() => nextTurn(game.id, new Date(), gameRepo)).toThrow('Current round is not completed');
  });
});
