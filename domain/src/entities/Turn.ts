import { Answer } from './Answer.js';
import { Category } from './Category.js';
import { Score } from './Score.js';

export type TurnStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TIMED_OUT';

export class Turn {
  readonly id: string;
  readonly roundId: string;
  readonly playerId: string;
  readonly timeLimit: number;
  readonly roundNumber: number;
  readonly category: Category;
  private _status: TurnStatus = 'PENDING';
  private _answers: Answer[] = [];
  private _startedAt: Date | null = null;
  private _endedAt: Date | null = null;
  private _score: Score | null = null;

  constructor(roundId: string, playerId: string, timeLimit: number, roundNumber: number, category: Category) {
    this.id = crypto.randomUUID();
    this.roundId = roundId;
    this.playerId = playerId;
    this.timeLimit = timeLimit;
    this.roundNumber = roundNumber;
    this.category = category;
  }

  get status(): TurnStatus {
    return this._status;
  }

  get answers(): readonly Answer[] {
    return this._answers;
  }

  get startedAt(): Date | null {
    return this._startedAt;
  }

  get endedAt(): Date | null {
    return this._endedAt;
  }

  get score(): Score | null {
    return this._score;
  }

  start(now: Date): void {
    if (this._status !== 'PENDING') {
      throw new Error('Turn can only be started when pending');
    }
    this._status = 'ACTIVE';
    this._startedAt = now;
  }

  submitAnswer(text: string, now: Date): Answer {
    if (this._status !== 'ACTIVE') {
      throw new Error('Turn is not active');
    }
    if (this._startedAt === null) {
      throw new Error('Turn has not been started');
    }
    if (this._answers.length >= 1) {
      throw new Error('Only one answer per player is allowed');
    }
    const elapsed = now.getTime() - this._startedAt.getTime();
    if (elapsed >= this.timeLimit * 1000 + 500) {
      throw new Error('Time limit exceeded');
    }
    const answer = new Answer(this.id, text, now);
    this._answers.push(answer);
    return answer;
  }

  end(now: Date): void {
    if (this._status !== 'ACTIVE') {
      throw new Error('Turn can only be ended when active');
    }
    if (this._startedAt === null) {
      throw new Error('Turn has not been started');
    }
    const elapsed = (now.getTime() - this._startedAt.getTime()) / 1000;
    if (elapsed >= this.timeLimit) {
      this._status = 'TIMED_OUT';
    } else {
      this._status = 'COMPLETED';
    }
    this._endedAt = now;
    const validCount = this._answers.filter(a => a.isValid === true).length;
    this._score = new Score(this.playerId, this.roundNumber, validCount);
  }

  recalculateScore(): void {
    const validCount = this._answers.filter((a) => a.isValid === true).length;
    this._score = new Score(this.playerId, this.roundNumber, validCount);
  }

  getRemainingTime(now: Date): number {
    if (this._status !== 'ACTIVE' || this._startedAt === null) {
      return 0;
    }
    const elapsed = (now.getTime() - this._startedAt.getTime()) / 1000;
    return this.timeLimit - elapsed;
  }
}
