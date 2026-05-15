import { Answer } from '../entities/Answer.js';

export interface AnswerRepository {
  save(answer: Answer): void;
  findById(id: string): Answer | null;
  findAll(): Answer[];
}
