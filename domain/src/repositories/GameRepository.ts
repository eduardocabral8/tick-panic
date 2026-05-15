import { Game } from '../entities/Game.js';

export interface GameRepository {
  save(game: Game): void;
  findById(id: string): Game | null;
  findAll(): Game[];
}
