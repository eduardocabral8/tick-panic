import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import {
  createGame,
  joinGame,
  startGame,
  endGame,
  getGameById,
  Game,
  GameRepository,
  PlayerRepository,
  CategoryRepository,
  RoundRepository,
  TurnRepository,
} from '@tick-panic/domain';
import { broadcastEvent } from '../websocket/gameSocket.js';
import { broadcastGameFinished } from './helpers.js';

function mapGameToResponse(game: Game) {
  return {
    id: game.id,
    status: game.status,
    players: game.players.map((p) => ({ id: p.id, name: p.name, role: p.role, score: game.getPlayerTotalScore(p.id) })),
    rounds: game.rounds.map((r) => ({
      id: r.id,
      roundNumber: r.roundNumber,
      status: r.status,
      category: { id: r.category.id, name: r.category.name, examples: r.category.examples },
      turns: r.turns.map((t) => ({ id: t.id, playerId: t.playerId, status: t.status, timeLimit: t.timeLimit, startedAt: t.startedAt ? t.startedAt.toISOString() : null, category: { id: t.category.id, name: t.category.name, examples: t.category.examples } })),
    })),
    currentRoundIndex: game.currentRoundIndex,
    winner: game.winner ? { id: game.winner.id, name: game.winner.name, role: game.winner.role } : null,
  };
}

function broadcastPlayerJoined(io: SocketIOServer, game: Game, playerName: string) {
  const player = game.players.find((p) => p.name === playerName);
  if (player) {
    broadcastEvent(io, game.id, 'PLAYER_JOINED', { playerId: player.id, playerName: player.name });
  }
}

function broadcastGameStarted(io: SocketIOServer, game: Game) {
  broadcastEvent(io, game.id, 'GAME_STARTED', { gameId: game.id, status: game.status });
}

export function registerGameRoutes(
  app: FastifyInstance,
  gameRepo: GameRepository,
  playerRepo: PlayerRepository,
  categoryRepo: CategoryRepository,
  roundRepo: RoundRepository,
  turnRepo: TurnRepository,
  io?: SocketIOServer,
): void {
  app.post('/games', {
    schema: {
      description: 'Create a new game',
      tags: ['Games'],
      body: {
        type: 'object',
        required: ['hostName'],
        properties: {
          hostName: { type: 'string' },
        },
      },
      response: {
        201: {
          description: 'Game created',
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
            players: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: { hostName: string } }>, reply: FastifyReply) => {
    const game = createGame(request.body.hostName, new Date(), gameRepo, playerRepo);
    reply.status(201).send(mapGameToResponse(game));
  });

  app.post('/games/:id/join', {
    schema: {
      description: 'Join an existing game',
      tags: ['Games'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['playerName'],
        properties: {
          playerName: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Joined game',
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
            players: { type: 'array' },
          },
        },
        404: {
          description: 'Game not found',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        409: {
          description: 'Conflict',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: { playerName: string } }>, reply: FastifyReply) => {
    const game = joinGame(request.params.id, request.body.playerName, new Date(), gameRepo, playerRepo);
    if (io) broadcastPlayerJoined(io, game, request.body.playerName);
    reply.send(mapGameToResponse(game));
  });

  app.post('/games/:id/start', {
    schema: {
      description: 'Start the game (host only)',
      tags: ['Games'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['hostPlayerId'],
        properties: {
          hostPlayerId: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Game started',
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
          },
        },
        403: {
          description: 'Only host can start',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        400: {
          description: 'Validation error',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: { hostPlayerId: string } }>, reply: FastifyReply) => {
    const game = await startGame(request.params.id, request.body.hostPlayerId, gameRepo, categoryRepo);
    for (const round of game.rounds) {
      roundRepo.save(round);
      for (const turn of round.turns) {
        turnRepo.save(turn);
      }
    }
    if (io) broadcastGameStarted(io, game);
    reply.send({ id: game.id, status: game.status });
  });

  app.get('/games/:id', {
    schema: {
      description: 'Get current game state',
      tags: ['Games'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Game state',
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
            players: { type: 'array' },
            rounds: { type: 'array' },
            currentRoundIndex: { type: 'number' },
          },
        },
        404: {
          description: 'Game not found',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const game = getGameById(request.params.id, gameRepo);
    reply.send(mapGameToResponse(game));
  });

  app.post('/games/:id/end', {
    schema: {
      description: 'End the game (host only)',
      tags: ['Games'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Game ended',
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
            winner: { type: 'object' },
          },
        },
        400: {
          description: 'Validation error',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const game = endGame(request.params.id, new Date(), gameRepo);
    if (io) broadcastGameFinished(io, game.id, gameRepo);
    reply.send({ id: game.id, status: game.status, winner: game.winner ? { id: game.winner.id, name: game.winner.name, role: game.winner.role } : null });
  });

  app.post('/games/:id/restart', {
    schema: {
      description: 'Restart the game with a new game room',
      tags: ['Games'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        201: {
          description: 'Game restarted',
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
            players: { type: 'array' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const oldGame = getGameById(request.params.id, gameRepo);
    const host = oldGame.players.find((p) => p.role === 'host');
    if (!host) {
      reply.status(400).send({ error: 'No host found in game' });
      return;
    }
    const newGame = createGame(host.name, new Date(), gameRepo, playerRepo);
    if (io) {
      broadcastEvent(io, oldGame.id, 'GAME_RESTARTED', { gameId: newGame.id });
    }
    reply.status(201).send(mapGameToResponse(newGame));
  });
}
