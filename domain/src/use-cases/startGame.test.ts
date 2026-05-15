import { describe, it, expect, vi } from 'vitest';
import { startGame } from './startGame.js';
import { Game } from '../entities/Game.js';
import { Player } from '../entities/Player.js';
import { Category } from '../entities/Category.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

describe('startGame', () => {
  it('should start a waiting game with enough players and categories', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player'));
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const categoryRepo: CategoryRepository = {
      save: vi.fn(),
      findAll: vi.fn(() => [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')]),
      findById: vi.fn(),
    };
    const updated = startGame(game.id, host.id, gameRepo, categoryRepo);
    expect(updated.status).toBe('IN_PROGRESS');
    expect(updated.rounds).toHaveLength(5);
    expect(gameRepo.save).toHaveBeenCalledWith(game);
  });

  it('should throw if game not found', () => {
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => null), findAll: vi.fn() };
    const categoryRepo: CategoryRepository = { save: vi.fn(), findAll: vi.fn(() => []), findById: vi.fn() };
    expect(() => startGame('missing', 'host', gameRepo, categoryRepo)).toThrow('Game not found');
  });

  it('should throw if caller is not the host', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    const bob = new Player('Bob', 'player');
    game.addPlayer(host);
    game.addPlayer(bob);
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const categoryRepo: CategoryRepository = {
      save: vi.fn(),
      findAll: vi.fn(() => [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')]),
      findById: vi.fn(),
    };
    expect(() => startGame(game.id, bob.id, gameRepo, categoryRepo)).toThrow('Only the host can start the game');
  });

  it('should throw if less than 2 players', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    game.addPlayer(host);
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const categoryRepo: CategoryRepository = {
      save: vi.fn(),
      findAll: vi.fn(() => [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')]),
      findById: vi.fn(),
    };
    expect(() => startGame(game.id, host.id, gameRepo, categoryRepo)).toThrow('At least 2 players are required');
  });

  it('should throw if less than 5 categories', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player'));
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const categoryRepo: CategoryRepository = {
      save: vi.fn(),
      findAll: vi.fn(() => [new Category('a'), new Category('b'), new Category('c'), new Category('d')]),
      findById: vi.fn(),
    };
    expect(() => startGame(game.id, host.id, gameRepo, categoryRepo)).toThrow('At least 5 categories are required');
  });

  it('should throw if game already started', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player'));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      (cats) => cats[0],
      host.id
    );
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const categoryRepo: CategoryRepository = {
      save: vi.fn(),
      findAll: vi.fn(() => [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')]),
      findById: vi.fn(),
    };
    expect(() => startGame(game.id, host.id, gameRepo, categoryRepo)).toThrow('Game has already started');
  });
});
