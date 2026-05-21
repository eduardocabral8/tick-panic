import { TurnRepository, Turn } from '@15-seconds/domain';

export class InMemoryTurnRepository implements TurnRepository {
  private turns = new Map<string, Turn>();

  save(turn: Turn): void {
    this.turns.set(turn.id, turn);
  }

  findById(id: string): Turn | null {
    return this.turns.get(id) ?? null;
  }

  findByRoundId(roundId: string): Turn[] {
    const result: Turn[] = [];
    for (const turn of this.turns.values()) {
      if (turn.roundId === roundId) {
        result.push(turn);
      }
    }
    return result;
  }

  findAll(): Turn[] {
    return Array.from(this.turns.values());
  }
}
