import { Answer } from '../entities/Answer.js';
import { AnswerRepository } from '../repositories/AnswerRepository.js';
import { TurnRepository } from '../repositories/TurnRepository.js';

export function validateAnswer(answerId: string, valid: boolean, validatedByPlayerId: string, now: Date, answerRepo: AnswerRepository, turnRepo: TurnRepository): Answer {
  const answer = answerRepo.findById(answerId);
  if (!answer) {
    throw new Error('Answer not found');
  }
  const turn = turnRepo.findById(answer.turnId);
  if (!turn) {
    throw new Error('Turn not found');
  }
  if (turn.playerId === validatedByPlayerId) {
    throw new Error('Cannot validate your own answer');
  }
  answer.validate(valid, now);
  answerRepo.save(answer);
  turn.recalculateScore();
  turnRepo.save(turn);

  return answer;
}
