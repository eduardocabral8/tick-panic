import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { InMemoryGameRepository } from '../repositories/InMemoryGameRepository.js';
import { InMemoryTurnRepository } from '../repositories/InMemoryTurnRepository.js';
import { InMemoryAnswerRepository } from '../repositories/InMemoryAnswerRepository.js';
import { InMemoryRoundRepository } from '../repositories/InMemoryRoundRepository.js';
import { registerTurnRoutes } from './turn-controller.js';
import { errorHandler } from '../middlewares/errorHandler.js';

function createMockIo() {
  const emitted: { room: string; event: string; payload: unknown }[] = [];
  const mockIo = {
    to: (room: string) => ({
      emit: (event: string, payload: unknown) => {
        emitted.push({ room, event, payload });
      },
    }),
  };
  return { mockIo: mockIo as unknown as import('socket.io').Server, emitted };
}

function createMockTimer() {
  const callbacks: (() => void)[] = [];
  return {
    mockTimer: {
      start: (_durationSeconds: number, onExpire: () => void): string => {
        callbacks.push(onExpire);
        return crypto.randomUUID();
      },
      stop: (): void => {},
    } as import('@15-seconds/domain').TimerPort,
    triggerExpire: () => {
      const cb = callbacks[callbacks.length - 1];
      if (cb) cb();
    },
  };
}

describe('turnController', () => {
  const createApp = () => {
    const app = Fastify();
    app.setErrorHandler(errorHandler);
    const gameRepo = new InMemoryGameRepository();
    const turnRepo = new InMemoryTurnRepository();
    const answerRepo = new InMemoryAnswerRepository();
    const roundRepo = new InMemoryRoundRepository();
    const { mockIo, emitted } = createMockIo();
    const { mockTimer, triggerExpire } = createMockTimer();
    app.register(async (api) => {
      registerTurnRoutes(api, gameRepo, turnRepo, answerRepo, roundRepo, mockIo, mockTimer);
    }, { prefix: '/api' });
    return { app, gameRepo, turnRepo, answerRepo, roundRepo, mockIo, emitted, mockTimer, triggerExpire };
  };

  it('should return 404 for non-existent game on start turn', async () => {
    const { app } = createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/turns/nonexistent/start',
    });

    expect(response.statusCode).toBe(404);
  });

  it('should return 404 for non-existent turn on submit answer', async () => {
    const { app } = createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/turns/nonexistent/answers',
      payload: { text: 'Dog', playerId: 'some-id' },
    });

    expect(response.statusCode).toBe(404);
  });

  it('should start a turn successfully and broadcast TURN_STARTED', async () => {
    const { app, gameRepo, turnRepo, roundRepo, emitted } = createApp();
    const { Game, Player, Category } = await import('@15-seconds/domain');

    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const player2 = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(player2);
    gameRepo.save(game);

    const categories = [
      new Category('Animals', ['Dog']),
      new Category('Fruits', ['Apple']),
      new Category('Colors', ['Red']),
      new Category('Countries', ['USA']),
      new Category('Sports', ['Soccer']),
    ];
    game.start(categories, (cats) => cats[0], host.id);
    gameRepo.save(game);

    const round = game.getCurrentRound();
    if (!round) {
      throw new Error('No round created');
    }
    roundRepo.save(round);

    const turn = round.turns[0];
    turnRepo.save(turn);

    const response = await app.inject({
      method: 'POST',
      url: `/api/turns/${game.id}/start`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ACTIVE');

    const broadcast = emitted.find((e) => e.event === 'TURN_STARTED');
    expect(broadcast).toBeDefined();
    expect(broadcast?.room).toBe(game.id);
    expect((broadcast?.payload as { turnId: string }).turnId).toBe(turn.id);
    expect((broadcast?.payload as { playerId: string }).playerId).toBe(turn.playerId);
    expect((broadcast?.payload as { startedAt: string }).startedAt).toBeDefined();
    expect((broadcast?.payload as { category: { id: string; name: string; examples: string[] } }).category).toBeDefined();
    expect((broadcast?.payload as { category: { id: string; name: string; examples: string[] } }).category.name).toBe(turn.category.name);
  });

  it('should submit an answer successfully and broadcast ANSWER_SUBMITTED', async () => {
    const { app, gameRepo, turnRepo, roundRepo, emitted } = createApp();
    const { Game, Player, Category } = await import('@15-seconds/domain');

    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const player2 = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(player2);
    gameRepo.save(game);

    const categories = [
      new Category('Animals', ['Dog']),
      new Category('Fruits', ['Apple']),
      new Category('Colors', ['Red']),
      new Category('Countries', ['USA']),
      new Category('Sports', ['Soccer']),
    ];
    game.start(categories, (cats) => cats[0], host.id);
    gameRepo.save(game);

    const round = game.getCurrentRound();
    if (!round) {
      throw new Error('No round created');
    }
    roundRepo.save(round);

    const turn = round.turns[0];
    turn.start(new Date());
    turnRepo.save(turn);

    const response = await app.inject({
      method: 'POST',
      url: `/api/turns/${turn.id}/answers`,
      payload: { text: 'Dog', playerId: turn.playerId },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.text).toBe('Dog');
    expect(body.turnId).toBe(turn.id);

    const broadcast = emitted.find((e) => e.event === 'ANSWER_SUBMITTED');
    expect(broadcast).toBeDefined();
    expect(broadcast?.room).toBe(game.id);
    expect((broadcast?.payload as { text: string }).text).toBe('Dog');
  });

  it('should return 403 when player submits answer for another turn', async () => {
    const { app, gameRepo, turnRepo, roundRepo } = createApp();
    const { Game, Player, Category } = await import('@15-seconds/domain');

    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const player2 = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(player2);
    gameRepo.save(game);

    const categories = [
      new Category('Animals', ['Dog']),
      new Category('Fruits', ['Apple']),
      new Category('Colors', ['Red']),
      new Category('Countries', ['USA']),
      new Category('Sports', ['Soccer']),
    ];
    game.start(categories, (cats) => cats[0], host.id);
    gameRepo.save(game);

    const round = game.getCurrentRound();
    if (!round) {
      throw new Error('No round created');
    }
    roundRepo.save(round);

    const turn = round.turns[0];
    turn.start(new Date());
    turnRepo.save(turn);

    const response = await app.inject({
      method: 'POST',
      url: `/api/turns/${turn.id}/answers`,
      payload: { text: 'Dog', playerId: player2.id },
    });

    expect(response.statusCode).toBe(403);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Not your turn');
  });

  it('should auto-finish turn when timer expires and broadcast TURN_ENDED', async () => {
    const { app, gameRepo, turnRepo, roundRepo, emitted, triggerExpire } = createApp();
    const { Game, Player, Category } = await import('@15-seconds/domain');

    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const player2 = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(player2);
    gameRepo.save(game);

    const categories = [
      new Category('Animals', ['Dog']),
      new Category('Fruits', ['Apple']),
      new Category('Colors', ['Red']),
      new Category('Countries', ['USA']),
      new Category('Sports', ['Soccer']),
    ];
    game.start(categories, (cats) => cats[0], host.id);
    gameRepo.save(game);

    const round = game.getCurrentRound();
    if (!round) {
      throw new Error('No round created');
    }
    roundRepo.save(round);

    const turn = round.turns[0];
    turnRepo.save(turn);

    await app.inject({
      method: 'POST',
      url: `/api/turns/${game.id}/start`,
    });

    await app.inject({
      method: 'POST',
      url: `/api/turns/${turn.id}/answers`,
      payload: { text: 'answer', playerId: turn.playerId },
    });

    const startedTurn = turnRepo.findById(turn.id);
    if (startedTurn) {
      (startedTurn as unknown as { _startedAt: Date | null })._startedAt = new Date(Date.now() - 20000);
    }

    triggerExpire();

    const broadcast = emitted.find((e) => e.event === 'TURN_ENDED');
    expect(broadcast).toBeDefined();
    expect(broadcast?.room).toBe(game.id);
    expect((broadcast?.payload as { status: string }).status).toBe('TIMED_OUT');
  });

  it('should return 403 when validating own answer', async () => {
    const { app, gameRepo, turnRepo, roundRepo, answerRepo } = createApp();
    const { Game, Player, Category } = await import('@15-seconds/domain');

    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const player2 = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(player2);
    gameRepo.save(game);

    const categories = [
      new Category('Animals', ['Dog']),
      new Category('Fruits', ['Apple']),
      new Category('Colors', ['Red']),
      new Category('Countries', ['USA']),
      new Category('Sports', ['Soccer']),
    ];
    game.start(categories, (cats) => cats[0], host.id);
    gameRepo.save(game);

    const round = game.getCurrentRound();
    if (!round) {
      throw new Error('No round created');
    }
    roundRepo.save(round);

    const turn = round.turns[0];
    turn.start(new Date());
    const answer = turn.submitAnswer('Dog', new Date());
    turnRepo.save(turn);
    answerRepo.save(answer);

    const response = await app.inject({
      method: 'POST',
      url: `/api/turns/${turn.id}/answers/${answer.id}/validate`,
      payload: { isValid: true, playerId: turn.playerId },
    });

    expect(response.statusCode).toBe(403);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Cannot validate your own answer');
  });

  it('should return 400 when submitting multiple answers for the same turn', async () => {
    const { app, gameRepo, turnRepo, roundRepo } = createApp();
    const { Game, Player, Category } = await import('@15-seconds/domain');

    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const player2 = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(player2);
    gameRepo.save(game);

    const categories = [
      new Category('Animals', ['Dog']),
      new Category('Fruits', ['Apple']),
      new Category('Colors', ['Red']),
      new Category('Countries', ['USA']),
      new Category('Sports', ['Soccer']),
    ];
    game.start(categories, (cats) => cats[0], host.id);
    gameRepo.save(game);

    const round = game.getCurrentRound();
    if (!round) {
      throw new Error('No round created');
    }
    roundRepo.save(round);

    const turn = round.turns[0];
    turn.start(new Date());
    turnRepo.save(turn);

    await app.inject({
      method: 'POST',
      url: `/api/turns/${turn.id}/answers`,
      payload: { text: 'first', playerId: turn.playerId },
    });

    const response = await app.inject({
      method: 'POST',
      url: `/api/turns/${turn.id}/answers`,
      payload: { text: 'second', playerId: turn.playerId },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Player has already submitted an answer for this turn');
  });
});
