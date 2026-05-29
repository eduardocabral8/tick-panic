import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import {
  startTurn,
  submitAnswer,
  finishTurn,
  nextTurn,
  validateAnswer,
  GameRepository,
  TurnRepository,
  AnswerRepository,
  RoundRepository,
  TimerPort,
} from '@tick-panic/domain';
import {
  getGameIdFromTurn,
  broadcastTurnStarted,
  broadcastAnswerSubmitted,
  broadcastTurnEnded,
  broadcastRoundEnded,
  broadcastNextTurn,
  broadcastGameFinished,
  broadcastAnswerValidated,
} from './helpers.js';

const activeTimers = new Map<string, string>();

function startTimer(
  timer: TimerPort,
  gameId: string,
  turnId: string,
  timeLimit: number,
  turnRepo: TurnRepository,
  roundRepo: RoundRepository,
  io: SocketIOServer,
): void {
  const timerId = timer.start(timeLimit, () => {
    try {
      finishTurn(turnId, new Date(), turnRepo, roundRepo);
      const turn = turnRepo.findById(turnId);
      broadcastTurnEnded(io, gameId, turnId, 'TIMED_OUT', turn?.score ?? null);
      broadcastRoundEnded(io, gameId, roundRepo, turnId);
    } catch {
      return;
    } finally {
      activeTimers.delete(turnId);
    }
  });
  activeTimers.set(turnId, timerId);
}

function stopTimer(timer: TimerPort, turnId: string): void {
  const timerId = activeTimers.get(turnId);
  if (timerId) {
    timer.stop(timerId);
    activeTimers.delete(turnId);
  }
}

function mapScoreToResponse(score: { playerId: string; roundNumber: number; points: number } | null) {
  return score ? { playerId: score.playerId, roundNumber: score.roundNumber, points: score.points } : null;
}

function broadcastAndReplyTurnStarted(
  reply: FastifyReply,
  io: SocketIOServer | undefined,
  gameId: string,
  turn: { id: string; status: string; timeLimit: number; playerId: string; startedAt: Date | null; category: { id: string; name: string; examples: string[] } },
) {
  if (io && turn.startedAt) broadcastTurnStarted(io, gameId, turn.id, turn.timeLimit, turn.playerId, turn.startedAt.toISOString(), turn.category);
  reply.send({ id: turn.id, status: turn.status, timeLimit: turn.timeLimit, category: turn.category });
}

function broadcastAndReplyAnswerSubmitted(
  reply: FastifyReply,
  io: SocketIOServer | undefined,
  gameId: string | null,
  answer: { id: string; text: string; turnId: string },
) {
  if (io && gameId) broadcastAnswerSubmitted(io, gameId, answer.id, answer.text, answer.turnId);
  reply.status(201).send({ id: answer.id, text: answer.text, turnId: answer.turnId });
}

function broadcastAndReplyTurnFinished(
  reply: FastifyReply,
  io: SocketIOServer | undefined,
  timer: TimerPort | undefined,
  gameId: string | null,
  turn: { id: string; status: string; score: { playerId: string; roundNumber: number; points: number } | null },
  roundRepo: RoundRepository,
) {
  if (timer) stopTimer(timer, turn.id);
  if (io && gameId) {
    broadcastTurnEnded(io, gameId, turn.id, turn.status, mapScoreToResponse(turn.score));
    broadcastRoundEnded(io, gameId, roundRepo, turn.id);
  }
  reply.send({ id: turn.id, status: turn.status, score: mapScoreToResponse(turn.score) });
}

function broadcastAndReplyNextTurn(
  reply: FastifyReply,
  io: SocketIOServer | undefined,
  gameId: string,
  turn: { id: string; status: string; playerId: string } | null,
  gameRepo: GameRepository,
) {
  if (!turn) {
    if (io) broadcastGameFinished(io, gameId, gameRepo);
    reply.status(204).send();
    return;
  }
  if (io) broadcastNextTurn(io, gameId, turn.id, turn.playerId);
  reply.send({ id: turn.id, status: turn.status });
}

function handleStartTurn(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
  gameRepo: GameRepository,
  turnRepo: TurnRepository,
  roundRepo: RoundRepository,
  io?: SocketIOServer,
  timer?: TimerPort,
): void {
  const turn = startTurn(request.params.id, new Date(), gameRepo, turnRepo);
  if (io && timer) startTimer(timer, request.params.id, turn.id, turn.timeLimit, turnRepo, roundRepo, io);
  broadcastAndReplyTurnStarted(reply, io, request.params.id, turn);
}

function handleSubmitAnswer(
  request: FastifyRequest<{ Params: { id: string }; Body: { text: string; playerId: string } }>,
  reply: FastifyReply,
  turnRepo: TurnRepository,
  answerRepo: AnswerRepository,
  roundRepo: RoundRepository,
  io?: SocketIOServer,
): void {
  const turn = turnRepo.findById(request.params.id);
  if (!turn) {
    reply.status(404).send({ error: 'Turn not found' });
    return;
  }
  if (turn.playerId !== request.body.playerId) {
    reply.status(403).send({ error: 'Not your turn' });
    return;
  }
  const answer = submitAnswer(request.params.id, request.body.text, new Date(), turnRepo, answerRepo);
  const gameId = getGameIdFromTurn(answer.turnId, turnRepo, roundRepo);
  broadcastAndReplyAnswerSubmitted(reply, io, gameId, answer);
}

function handleFinishTurn(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
  turnRepo: TurnRepository,
  roundRepo: RoundRepository,
  io?: SocketIOServer,
  timer?: TimerPort,
): void {
  const turn = finishTurn(request.params.id, new Date(), turnRepo, roundRepo);
  const gameId = getGameIdFromTurn(turn.id, turnRepo, roundRepo);
  broadcastAndReplyTurnFinished(reply, io, timer, gameId, turn, roundRepo);
}

function handleNextTurn(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
  gameRepo: GameRepository,
  roundRepo: RoundRepository,
  turnRepo: TurnRepository,
  io?: SocketIOServer,
): void {
  const game = gameRepo.findById(request.params.id);
  if (!game) {
    throw new Error('Game not found');
  }
  const prevRoundIndex = game.currentRoundIndex;
  const turn = nextTurn(request.params.id, new Date(), gameRepo);
  if (game.currentRoundIndex !== prevRoundIndex) {
    const newRound = game.getCurrentRound();
    if (newRound) {
      roundRepo.save(newRound);
      for (const t of newRound.turns) {
        turnRepo.save(t);
      }
    }
  }
  broadcastAndReplyNextTurn(reply, io, request.params.id, turn, gameRepo);
}

function handleValidateAnswer(
  request: FastifyRequest<{ Params: { turnId: string; answerId: string }; Body: { isValid: boolean; playerId: string } }>,
  reply: FastifyReply,
  turnRepo: TurnRepository,
  answerRepo: AnswerRepository,
  roundRepo: RoundRepository,
  io?: SocketIOServer,
): void {
  const answer = validateAnswer(request.params.answerId, request.body.isValid, request.body.playerId, new Date(), answerRepo, turnRepo);
  const gameId = getGameIdFromTurn(answer.turnId, turnRepo, roundRepo);
  if (io && gameId) {
    broadcastAnswerValidated(io, gameId, answer.id, answer.isValid ?? false, answer.turnId);
  }
  reply.send({ id: answer.id, isValid: answer.isValid });
}

export function registerTurnRoutes(
  app: FastifyInstance,
  gameRepo: GameRepository,
  turnRepo: TurnRepository,
  answerRepo: AnswerRepository,
  roundRepo: RoundRepository,
  io?: SocketIOServer,
  timer?: TimerPort,
): void {
  app.post('/turns/:id/start', {
    schema: {
      description: 'Start a turn',
      tags: ['Turns'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Turn started',
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
            timeLimit: { type: 'number' },
            category: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                examples: { type: 'array', items: { type: 'string' } },
              },
            },
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
    handleStartTurn(request, reply, gameRepo, turnRepo, roundRepo, io, timer);
  });

  app.post('/turns/:id/answers', {
    schema: {
      description: 'Submit an answer for a turn',
      tags: ['Turns'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['text', 'playerId'],
        properties: {
          text: { type: 'string' },
          playerId: { type: 'string' },
        },
      },
      response: {
        201: {
          description: 'Answer submitted',
          type: 'object',
          properties: {
            id: { type: 'string' },
            text: { type: 'string' },
            turnId: { type: 'string' },
          },
        },
        400: {
          description: 'Validation error',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        403: {
          description: 'Not your turn',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: { text: string; playerId: string } }>, reply: FastifyReply) => {
    handleSubmitAnswer(request, reply, turnRepo, answerRepo, roundRepo, io);
  });

  app.post('/turns/:id/finish', {
    schema: {
      description: 'Finish a turn',
      tags: ['Turns'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Turn finished',
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
            score: { type: 'object' },
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
    handleFinishTurn(request, reply, turnRepo, roundRepo, io, timer);
  });

  app.post('/turns/:id/next', {
    schema: {
      description: 'Move to next turn or round',
      tags: ['Turns'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Next turn',
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
          },
        },
        204: {
          type: 'null',
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    handleNextTurn(request, reply, gameRepo, roundRepo, turnRepo, io);
  });

  app.post('/turns/:turnId/answers/:answerId/validate', {
    schema: {
      description: 'Validate an answer',
      tags: ['Turns'],
      params: {
        type: 'object',
        required: ['turnId', 'answerId'],
        properties: {
          turnId: { type: 'string' },
          answerId: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['isValid', 'playerId'],
        properties: {
          isValid: { type: 'boolean' },
          playerId: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Answer validated',
          type: 'object',
          properties: {
            id: { type: 'string' },
            isValid: { type: 'boolean' },
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
  }, async (request: FastifyRequest<{ Params: { turnId: string; answerId: string }; Body: { isValid: boolean; playerId: string } }>, reply: FastifyReply) => {
    handleValidateAnswer(request, reply, turnRepo, answerRepo, roundRepo, io);
  });
}
