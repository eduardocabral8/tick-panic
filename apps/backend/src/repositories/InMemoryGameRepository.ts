import { GameRepository, Game } from '@tick-panic/domain';

export class InMemoryGameRepository implements GameRepository {
  private games = new Map<string, Game>();

  save(game: Game): void {
    this.games.set(game.id, game);
  }

  findById(id: string): Game | null {
    return this.games.get(id) ?? null;
  }

  findAll(): Game[] {
    return Array.from(this.games.values());
  }
}
