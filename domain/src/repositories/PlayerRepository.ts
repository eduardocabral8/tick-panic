import { Player } from '../entities/Player.js';

export interface PlayerRepository {
  save(player: Player): void;
  findById(id: string): Player | null;
  findAll(): Player[];
}
