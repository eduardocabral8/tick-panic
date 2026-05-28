import { describe, it, expect, vi } from 'vitest';
import { joinGame } from './joinGame.js';
import { Game } from '../entities/Game.js';
import { Player } from '../entities/Player.js';
import { Category } from '../entities/Category.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { PlayerRepository } from '../repositories/PlayerRepository.js';

describe('joinGame', () => {
  it('should add a player to a waiting game', () => {
    const game = new Game(new Date());
    game.addPlayer(new Player('Alice', 'host', new Date()));
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const playerRepo: PlayerRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    const updated = joinGame(game.id, 'Bob', new Date(), gameRepo, playerRepo);
    expect(updated.players).toHaveLength(2);
    expect(updated.players[1].name).toBe('Bob');
    expect(playerRepo.save).toHaveBeenCalledWith(updated.players[1]);
    expect(gameRepo.save).toHaveBeenCalledWith(game);
  });

  it('should throw if game not found', () => {
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => null), findAll: vi.fn() };
    const playerRepo: PlayerRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    expect(() => joinGame('missing', 'Bob', new Date(), gameRepo, playerRepo)).toThrow('Game not found');
  });

  it('should throw if game is not waiting', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c')],
      (cats) => cats[0],
      host.id
    );
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const playerRepo: PlayerRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    expect(() => joinGame(game.id, 'Charlie', new Date(), gameRepo, playerRepo)).toThrow('Cannot add players after game has started');
  });

  it('should throw if player name is empty', () => {
    const game = new Game(new Date());
    game.addPlayer(new Player('Alice', 'host', new Date()));
    const gameRepo: GameRepository = { save: vi.fn(), findById: vi.fn(() => game), findAll: vi.fn() };
    const playerRepo: PlayerRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    expect(() => joinGame(game.id, '', new Date(), gameRepo, playerRepo)).toThrow('Player name is required');
  });

});
