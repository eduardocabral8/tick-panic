import { Turn } from './Turn.js';
import { Category } from './Category.js';

export type RoundStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';

export class Round {
  readonly id: string;
  readonly gameId: string;
  readonly roundNumber: number;
  readonly category: Category;
  readonly itemCount: number;
  readonly timeLimit: number;
  private _status: RoundStatus = 'PENDING';
  private _turns: Turn[] = [];

  constructor(gameId: string, roundNumber: number, category: Category) {
    if (roundNumber < 1 || roundNumber > 5) {
      throw new Error('Round number must be between 1 and 5');
    }
    this.id = crypto.randomUUID();
    this.gameId = gameId;
    this.roundNumber = roundNumber;
    this.category = category;
    this.itemCount = 6 - roundNumber;
    this.timeLimit = this.itemCount;
  }

  get status(): RoundStatus {
    return this._status;
  }

  get turns(): readonly Turn[] {
    return this._turns;
  }

  createTurn(playerId: string): Turn {
    if (this._turns.some(t => t.playerId === playerId)) {
      throw new Error('Player already has a turn in this round');
    }
    const turn = new Turn(this.id, playerId, this.timeLimit, this.roundNumber);
    this._turns.push(turn);
    return turn;
  }

  getTurnByPlayer(playerId: string): Turn | null {
    return this._turns.find(t => t.playerId === playerId) ?? null;
  }

  checkCompleted(): void {
    if (this._turns.length === 0) return;
    const allDone = this._turns.every(
      t => t.status === 'COMPLETED' || t.status === 'TIMED_OUT'
    );
    if (allDone) {
      this._status = 'COMPLETED';
    }
  }

  isActive(): boolean {
    return this._turns.some(t => t.status === 'ACTIVE');
  }
}
