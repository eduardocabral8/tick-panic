import { RoundRepository, Round } from '@tick-panic/domain';

export class InMemoryRoundRepository implements RoundRepository {
  private rounds = new Map<string, Round>();

  save(round: Round): void {
    this.rounds.set(round.id, round);
  }

  findById(id: string): Round | null {
    return this.rounds.get(id) ?? null;
  }

  findByGameId(gameId: string): Round[] {
    const result: Round[] = [];
    for (const round of this.rounds.values()) {
      if (round.gameId === gameId) {
        result.push(round);
      }
    }
    return result;
  }

  findAll(): Round[] {
    return Array.from(this.rounds.values());
  }
}
