import { PlayerRepository, Player } from '@tick-panic/domain';

export class InMemoryPlayerRepository implements PlayerRepository {
  private players = new Map<string, Player>();

  save(player: Player): void {
    this.players.set(player.id, player);
  }

  findById(id: string): Player | null {
    return this.players.get(id) ?? null;
  }

  findAll(): Player[] {
    return Array.from(this.players.values());
  }
}
