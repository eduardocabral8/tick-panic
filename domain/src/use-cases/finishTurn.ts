import { Turn } from '../entities/Turn.js';
import { TurnRepository } from '../repositories/TurnRepository.js';
import { RoundRepository } from '../repositories/RoundRepository.js';

export function finishTurn(turnId: string, now: Date, turnRepo: TurnRepository, roundRepo: RoundRepository): Turn {
  const turn = turnRepo.findById(turnId);
  if (!turn) {
    throw new Error('Turn not found');
  }
  if (turn.status !== 'ACTIVE') {
    throw new Error('Turn is not active');
  }
  const round = roundRepo.findById(turn.roundId);
  if (!round) {
    throw new Error('Round not found');
  }
  if (turn.startedAt === null) {
    throw new Error('Turn has not been started');
  }
  const elapsed = (now.getTime() - turn.startedAt.getTime()) / 1000;
  const canFinish = turn.answers.length >= round.itemCount || elapsed >= turn.timeLimit;
  if (!canFinish) {
    throw new Error('Turn cannot be finished yet');
  }
  turn.end(now);
  turnRepo.save(turn);
  round.checkCompleted();
  if (round.status === 'COMPLETED') {
    roundRepo.save(round);
  }
  return turn;
}
