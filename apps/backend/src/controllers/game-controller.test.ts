import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { Category, startGame } from '@tick-panic/domain';
import { InMemoryGameRepository } from '../repositories/InMemoryGameRepository.js';
import { InMemoryPlayerRepository } from '../repositories/InMemoryPlayerRepository.js';
import { InMemoryCategoryRepository } from '../repositories/InMemoryCategoryRepository.js';
import { InMemoryRoundRepository } from '../repositories/InMemoryRoundRepository.js';
import { InMemoryTurnRepository } from '../repositories/InMemoryTurnRepository.js';
import { registerGameRoutes } from './game-controller.js';
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

describe('gameController', () => {
  const createApp = () => {
    const app = Fastify();
    app.setErrorHandler(errorHandler);
    const gameRepo = new InMemoryGameRepository();
    const playerRepo = new InMemoryPlayerRepository();
    const categoryRepo = new InMemoryCategoryRepository();
    const roundRepo = new InMemoryRoundRepository();
    const turnRepo = new InMemoryTurnRepository();
    const { mockIo, emitted } = createMockIo();
    app.register(async (api) => {
      registerGameRoutes(api, gameRepo, playerRepo, categoryRepo, roundRepo, turnRepo, mockIo);
    }, { prefix: '/api' });
    return { app, gameRepo, playerRepo, categoryRepo, roundRepo, turnRepo, mockIo, emitted };
  };

  it('should create a game', async () => {
    const { app } = createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/games',
      payload: { hostName: 'Alice' },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('WAITING');
    expect(body.players).toHaveLength(1);
    expect(body.players[0].name).toBe('Alice');
  });

  it('should allow a player to join and broadcast PLAYER_JOINED', async () => {
    const { app, emitted } = createApp();
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/games',
      payload: { hostName: 'Alice' },
    });
    const gameId = JSON.parse(createResponse.body).id;

    const joinResponse = await app.inject({
      method: 'POST',
      url: `/api/games/${gameId}/join`,
      payload: { playerName: 'Bob' },
    });

    expect(joinResponse.statusCode).toBe(200);
    const body = JSON.parse(joinResponse.body);
    expect(body.players).toHaveLength(2);

    const broadcast = emitted.find((e) => e.event === 'PLAYER_JOINED');
    expect(broadcast).toBeDefined();
    expect(broadcast?.room).toBe(gameId);
    expect((broadcast?.payload as { playerName: string }).playerName).toBe('Bob');
  });

  it('should return 404 for non-existent game', async () => {
    const { app } = createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/games/nonexistent/join',
      payload: { playerName: 'Bob' },
    });

    expect(response.statusCode).toBe(404);
  });

  it('should get game by id', async () => {
    const { app } = createApp();
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/games',
      payload: { hostName: 'Alice' },
    });
    const gameId = JSON.parse(createResponse.body).id;

    const response = await app.inject({
      method: 'GET',
      url: `/api/games/${gameId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe(gameId);
    expect(body.status).toBe('WAITING');
  });

  it('should include timeLimit in turns when game is in progress', async () => {
    const { app, gameRepo, categoryRepo } = createApp();
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/games',
      payload: { hostName: 'Alice' },
    });
    const gameId = JSON.parse(createResponse.body).id;
    await app.inject({
      method: 'POST',
      url: `/api/games/${gameId}/join`,
      payload: { playerName: 'Bob' },
    });

    for (let i = 0; i < 3; i++) {
      categoryRepo.save(new Category(`category-${i}`, []));
    }

    const game = gameRepo.findById(gameId)!;
    startGame(gameId, game.players[0].id, gameRepo, categoryRepo);

    const response = await app.inject({
      method: 'GET',
      url: `/api/games/${gameId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.rounds).toHaveLength(3);
    expect(body.rounds[0].turns[0].timeLimit).toBeGreaterThan(0);
    expect(body.rounds[0].turns[0].startedAt).toBeNull();
  });

  it('should restart a game and emit GAME_RESTARTED', async () => {
    const { app, emitted } = createApp();
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/games',
      payload: { hostName: 'Alice' },
    });
    const gameId = JSON.parse(createResponse.body).id;

    const restartResponse = await app.inject({
      method: 'POST',
      url: `/api/games/${gameId}/restart`,
    });

    expect(restartResponse.statusCode).toBe(201);
    const body = JSON.parse(restartResponse.body);
    expect(body.id).toBeDefined();
    expect(body.id).not.toBe(gameId);

    const broadcast = emitted.find((e) => e.event === 'GAME_RESTARTED');
    expect(broadcast).toBeDefined();
    expect(broadcast?.room).toBe(gameId);
    expect((broadcast?.payload as { gameId: string }).gameId).toBe(body.id);
  });
});
