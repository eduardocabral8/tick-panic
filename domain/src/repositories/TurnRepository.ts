import { Turn } from '../entities/Turn.js';

export interface TurnRepository {
  save(turn: Turn): void;
  findById(id: string): Turn | null;
  findByRoundId(roundId: string): Turn[];
  findAll(): Turn[];
}
