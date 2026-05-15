import { Round } from '../entities/Round.js';

export interface RoundRepository {
  save(round: Round): void;
  findById(id: string): Round | null;
  findByGameId(gameId: string): Round[];
  findAll(): Round[];
}
