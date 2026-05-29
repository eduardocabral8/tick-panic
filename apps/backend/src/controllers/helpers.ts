import { TurnRepository, RoundRepository, GameRepository, getGameById } from '@tick-panic/domain';
import { Server as SocketIOServer } from 'socket.io';
import { broadcastEvent } from '../websocket/gameSocket.js';

export function getGameIdFromTurn(
  turnId: string,
  turnRepo: TurnRepository,
  roundRepo: RoundRepository,
): string | null {
  const turn = turnRepo.findById(turnId);
  if (!turn) return null;
  const round = roundRepo.findById(turn.roundId);
  return round?.gameId ?? null;
}

export function broadcastTurnStarted(
  io: SocketIOServer,
  gameId: string,
  turnId: string,
  timeLimit: number,
  playerId: string,
  startedAt: string,
  category: { id: string; name: string; examples: string[] },
): void {
  broadcastEvent(io, gameId, 'TURN_STARTED', { turnId, timeLimit, playerId, startedAt, category });
}

export function broadcastAnswerSubmitted(
  io: SocketIOServer,
  gameId: string,
  answerId: string,
  text: string,
  turnId: string,
): void {
  broadcastEvent(io, gameId, 'ANSWER_SUBMITTED', { answerId, text, turnId });
}

export function broadcastTurnEnded(
  io: SocketIOServer,
  gameId: string,
  turnId: string,
  status: string,
  score: unknown,
): void {
  broadcastEvent(io, gameId, 'TURN_ENDED', { turnId, status, score });
}

export function broadcastRoundEnded(
  io: SocketIOServer,
  gameId: string,
  roundRepo: RoundRepository,
  turnId: string,
): void {
  const round = roundRepo.findAll().find((r) => r.turns.some((t) => t.id === turnId));
  if (round && round.status === 'COMPLETED') {
    broadcastEvent(io, gameId, 'ROUND_ENDED', { roundId: round.id, roundNumber: round.roundNumber });
  }
}

export function broadcastNextTurn(
  io: SocketIOServer,
  gameId: string,
  turnId: string,
  playerId: string,
): void {
  broadcastEvent(io, gameId, 'NEXT_TURN', { nextPlayerId: playerId });
}

export function broadcastAnswerValidated(
  io: SocketIOServer,
  gameId: string,
  answerId: string,
  isValid: boolean,
  turnId: string,
): void {
  broadcastEvent(io, gameId, 'ANSWER_VALIDATED', { answerId, isValid, turnId });
}

export function broadcastGameFinished(
  io: SocketIOServer,
  gameId: string,
  gameRepo: GameRepository,
): void {
  const game = getGameById(gameId, gameRepo);
  const scores = game.getPlayerScores();
  const ranking = Array.from(scores.entries()).map(([playerId, points]) => ({ playerId, points }));
  broadcastEvent(io, gameId, 'GAME_FINISHED', { gameId, winner: game.winner ? { id: game.winner.id, name: game.winner.name, role: game.winner.role } : null, ranking });
}
