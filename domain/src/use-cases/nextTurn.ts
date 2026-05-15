import { Turn } from '../entities/Turn.js';
import { GameRepository } from '../repositories/GameRepository.js';

export function nextTurn(gameId: string, now: Date, gameRepo: GameRepository): Turn | null {
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
  const pendingTurn = round.turns.find(t => t.status === 'PENDING') ?? null;
  if (pendingTurn) {
    return pendingTurn;
  }
  game.startNextRound(now);
  gameRepo.save(game);
  const nextRound = game.getCurrentRound();
  if (!nextRound) {
    return null;
  }
  return nextRound.turns.find(t => t.status === 'PENDING') ?? null;
}
