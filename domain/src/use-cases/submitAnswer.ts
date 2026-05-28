import { Answer } from '../entities/Answer.js';
import { TurnRepository } from '../repositories/TurnRepository.js';
import { AnswerRepository } from '../repositories/AnswerRepository.js';

export function submitAnswer(turnId: string, text: string, now: Date, turnRepo: TurnRepository, answerRepo: AnswerRepository): Answer {
  const turn = turnRepo.findById(turnId);
  if (!turn) {
    throw new Error('Turn not found');
  }
  if (turn.status !== 'ACTIVE') {
    throw new Error('Turn is not active');
  }
  if (turn.answers.length >= turn.timeLimit) {
    throw new Error('Maximum answers reached for this turn');
  }
  const answer = turn.submitAnswer(text, now);
  answerRepo.save(answer);
  return answer;
}
