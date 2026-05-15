import { describe, it, expect, vi } from 'vitest';
import { submitAnswer } from './submitAnswer.js';
import { Game } from '../entities/Game.js';
import { Player } from '../entities/Player.js';
import { Category } from '../entities/Category.js';
import { TurnRepository } from '../repositories/TurnRepository.js';
import { AnswerRepository } from '../repositories/AnswerRepository.js';

describe('submitAnswer', () => {
  it('should submit an answer on an active turn', () => {
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
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(() => turn), findByRoundId: vi.fn(), findAll: vi.fn() };
    const answerRepo: AnswerRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    const now = new Date();
    const answer = submitAnswer(turn.id, 'respuesta', now, turnRepo, answerRepo);
    expect(answer.text).toBe('respuesta');
    expect(answerRepo.save).toHaveBeenCalledWith(answer);
  });

  it('should throw if turn not found', () => {
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(() => null), findByRoundId: vi.fn(), findAll: vi.fn() };
    const answerRepo: AnswerRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    expect(() => submitAnswer('missing', 'text', new Date(), turnRepo, answerRepo)).toThrow('Turn not found');
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
    const answerRepo: AnswerRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    expect(() => submitAnswer(turn.id, 'text', new Date(), turnRepo, answerRepo)).toThrow('Turn is not active');
  });

  it('should throw if answer text is empty', () => {
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
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(() => turn), findByRoundId: vi.fn(), findAll: vi.fn() };
    const answerRepo: AnswerRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    expect(() => submitAnswer(turn.id, '   ', new Date(), turnRepo, answerRepo)).toThrow('Answer text is required');
  });

  it('should throw if time limit exceeded', () => {
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
    const startedAt = new Date('2024-01-01T00:00:00Z');
    turn.start(startedAt);
    const turnRepo: TurnRepository = { save: vi.fn(), findById: vi.fn(() => turn), findByRoundId: vi.fn(), findAll: vi.fn() };
    const answerRepo: AnswerRepository = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn() };
    const now = new Date(startedAt.getTime() + (turn.timeLimit + 1) * 1000);
    expect(() => submitAnswer(turn.id, 'respuesta', now, turnRepo, answerRepo)).toThrow('Time limit exceeded');
  });
});
