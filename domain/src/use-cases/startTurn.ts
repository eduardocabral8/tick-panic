import { Turn } from '../entities/Turn.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { TurnRepository } from '../repositories/TurnRepository.js';

export function startTurn(gameId: string, now: Date, gameRepo: GameRepository, turnRepo: TurnRepository): Turn {
  const game = gameRepo.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  if (game.status !== 'IN_PROGRESS') {
    throw new Error('Game is not in progress');
  }
  const round = game.getCurrentRound();
  if (!round) {
    throw new Error('No active round');
  }
  const turn = round.turns.find(t => t.status === 'PENDING') ?? null;
  if (!turn) {
    throw new Error('No pending turns');
  }
  turn.start(now);
  turnRepo.save(turn);
  return turn;
}
