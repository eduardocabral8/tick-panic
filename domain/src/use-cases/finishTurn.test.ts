import { describe, it, expect, vi } from 'vitest';
import { finishTurn } from './finishTurn.js';
import { Game } from '../entities/Game.js';
import { Player } from '../entities/Player.js';
import { Category } from '../entities/Category.js';
import { TurnRepository } from '../repositories/TurnRepository.js';
import { RoundRepository } from '../repositories/RoundRepository.js';

describe('finishTurn', () => {
  it('should finish turn when answers reach round itemCount', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player'));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      (cats) => cats[0],
      host.id
    );
    const round = game.rounds[0];
    const turn = round.turns[0];
    turn.start(new Date());
    for (let i = 0; i < round.itemCount; i++) {
      turn.submitAnswer(`ans${i}`, new Date());
    }
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(() => turn), findByRoundId: vi.fn(), findAll: vi.fn() };
    const roundRepo: RoundRepository = { save: vi.fn(), findById: vi.fn(() => round), findByGameId: vi.fn(), findAll: vi.fn() };
    const now = new Date();
    const updated = finishTurn(turn.id, now, turnRepo, roundRepo);
    expect(updated.status).toBe('COMPLETED');
    expect(turnRepo.save).toHaveBeenCalledWith(turn);
  });

  it('should finish turn when time limit is exceeded', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player'));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      (cats) => cats[0],
      host.id
    );
    const round = game.rounds[0];
    const turn = round.turns[0];
    const startedAt = new Date('2024-01-01T00:00:00Z');
    turn.start(startedAt);
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(() => turn), findByRoundId: vi.fn(), findAll: vi.fn() };
    const roundRepo: RoundRepository = { save: vi.fn(), findById: vi.fn(() => round), findByGameId: vi.fn(), findAll: vi.fn() };
    const now = new Date(startedAt.getTime() + (turn.timeLimit + 1) * 1000);
    const updated = finishTurn(turn.id, now, turnRepo, roundRepo);
    expect(updated.status).toBe('TIMED_OUT');
    expect(turnRepo.save).toHaveBeenCalledWith(turn);
  });

  it('should mark round as completed when all turns are done', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player'));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      (cats) => cats[0],
      host.id
    );
    const round = game.rounds[0];
    round.turns.slice(0, -1).forEach(t => { t.start(new Date()); t.end(new Date()); });
    const lastTurn = round.turns[round.turns.length - 1];
    lastTurn.start(new Date());
    for (let i = 0; i < round.itemCount; i++) {
      lastTurn.submitAnswer(`ans${i}`, new Date());
    }
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(() => lastTurn), findByRoundId: vi.fn(), findAll: vi.fn() };
    const roundRepo: RoundRepository = { save: vi.fn(), findById: vi.fn(() => round), findByGameId: vi.fn(), findAll: vi.fn() };
    finishTurn(lastTurn.id, new Date(), turnRepo, roundRepo);
    expect(round.status).toBe('COMPLETED');
    expect(roundRepo.save).toHaveBeenCalledWith(round);
  });

  it('should throw if turn not found', () => {
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(() => null), findByRoundId: vi.fn(), findAll: vi.fn() };
    const roundRepo: RoundRepository = { save: vi.fn(), findById: vi.fn(), findByGameId: vi.fn(), findAll: vi.fn() };
    expect(() => finishTurn('missing', new Date(), turnRepo, roundRepo)).toThrow('Turn not found');
  });

  it('should throw if turn is not active', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player'));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      (cats) => cats[0],
      host.id
    );
    const turn = game.rounds[0].turns[0];
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(() => turn), findByRoundId: vi.fn(), findAll: vi.fn() };
    const roundRepo: RoundRepository = { save: vi.fn(), findById: vi.fn(() => game.rounds[0]), findByGameId: vi.fn(), findAll: vi.fn() };
    expect(() => finishTurn(turn.id, new Date(), turnRepo, roundRepo)).toThrow('Turn is not active');
  });

  it('should throw if turn cannot be finished yet', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player'));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      (cats) => cats[0],
      host.id
    );
    const round = game.rounds[0];
    const turn = round.turns[0];
    turn.start(new Date());
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(() => turn), findByRoundId: vi.fn(), findAll: vi.fn() };
    const roundRepo: RoundRepository = { save: vi.fn(), findById: vi.fn(() => round), findByGameId: vi.fn(), findAll: vi.fn() };
    expect(() => finishTurn(turn.id, new Date(), turnRepo, roundRepo)).toThrow('Turn cannot be finished yet');
  });

  it('should throw if turn has not been started', () => {
    const turn = {
      id: 'turn-1',
      roundId: 'round-1',
      playerId: 'player-1',
      timeLimit: 5,
      roundNumber: 1,
      status: 'ACTIVE',
      answers: [],
      startedAt: null,
      endedAt: null,
      score: null,
      end: vi.fn(),
      getRemainingTime: vi.fn(),
    } as unknown as import('../entities/Turn.js').Turn;
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(() => turn), findByRoundId: vi.fn(), findAll: vi.fn() };
    const roundRepo: RoundRepository = { save: vi.fn(), findById: vi.fn(() => ({ id: 'round-1', status: 'PENDING', itemCount: 5 } as unknown as import('../entities/Round.js').Round)), findByGameId: vi.fn(), findAll: vi.fn() };
    expect(() => finishTurn('turn-1', new Date(), turnRepo, roundRepo)).toThrow('Turn has not been started');
  });

  it('should throw if round not found', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player'));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      (cats) => cats[0],
      host.id
    );
    const turn = game.rounds[0].turns[0];
    turn.start(new Date());
    for (let i = 0; i < game.rounds[0].itemCount; i++) {
      turn.submitAnswer(`ans${i}`, new Date());
    }
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(() => turn), findByRoundId: vi.fn(), findAll: vi.fn() };
    const roundRepo: RoundRepository = { save: vi.fn(), findById: vi.fn(() => null), findByGameId: vi.fn(), findAll: vi.fn() };
    expect(() => finishTurn(turn.id, new Date(), turnRepo, roundRepo)).toThrow('Round not found');
  });
});
