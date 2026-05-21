import { describe, it, expect, vi } from 'vitest';
import { startTurn } from './startTurn.js';
import { Game } from '../entities/Game.js';
import { Player } from '../entities/Player.js';
import { Category } from '../entities/Category.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { TurnRepository } from '../repositories/TurnRepository.js';

describe('startTurn', () => {
  it('should start the first pending turn of the current round', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      (cats) => cats[0],
      host.id
    );
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(), findByRoundId: vi.fn(), findAll: vi.fn() };
    const now = new Date();
    const turn = startTurn(game.id, now, gameRepo, turnRepo);
    expect(turn.status).toBe('ACTIVE');
    expect(turn.startedAt).toBe(now);
    expect(turnRepo.save).toHaveBeenCalledWith(turn);
  });

  it('should throw if game not found', () => {
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => null), findAll: vi.fn() };
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(), findByRoundId: vi.fn(), findAll: vi.fn() };
    expect(() => startTurn('missing', new Date(), gameRepo, turnRepo)).toThrow('Game not found');
  });

  it('should throw if game is not in progress', () => {
    const game = new Game(new Date());
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(), findByRoundId: vi.fn(), findAll: vi.fn() };
    expect(() => startTurn(game.id, new Date(), gameRepo, turnRepo)).toThrow('Game is not in progress');
  });

  it('should throw if no pending turns', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      (cats) => cats[0],
      host.id
    );
    game.rounds[0].turns.forEach(t => { t.start(new Date()); t.end(new Date()); });
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(), findByRoundId: vi.fn(), findAll: vi.fn() };
    expect(() => startTurn(game.id, new Date(), gameRepo, turnRepo)).toThrow('No pending turns');
  });
});
