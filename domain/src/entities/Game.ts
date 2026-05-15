import { Player } from './Player.js';
import { Round } from './Round.js';
import { Category } from './Category.js';

export type GameStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED';

export class Game {
  readonly id: string;
  private _status: GameStatus = 'WAITING';
  private _players: Player[] = [];
  private _rounds: Round[] = [];
  private _currentRoundIndex: number = -1;
  readonly createdAt: Date;
  private _finishedAt: Date | null = null;
  private _winner: Player | null = null;

  constructor() {
    this.id = crypto.randomUUID();
    this.createdAt = new Date();
  }

  get status(): GameStatus {
    return this._status;
  }

  get players(): readonly Player[] {
    return this._players;
  }

  get rounds(): readonly Round[] {
    return this._rounds;
  }

  get currentRoundIndex(): number {
    return this._currentRoundIndex;
  }

  get finishedAt(): Date | null {
    return this._finishedAt;
  }

  get winner(): Player | null {
    return this._winner;
  }

  addPlayer(player: Player): void {
    if (this._status !== 'WAITING') {
      throw new Error('Cannot add players after game has started');
    }
    if (this._players.some(p => p.id === player.id)) {
      throw new Error('Player already in game');
    }
    this._players.push(player);
  }

  start(
    categories: Category[],
    randomizer: (categories: Category[]) => Category,
    hostPlayerId: string
  ): void {
    if (this._status !== 'WAITING') {
      throw new Error('Game has already started');
    }
    const host = this._players.find(p => p.id === hostPlayerId);
    if (!host || host.role !== 'host') {
      throw new Error('Only the host can start the game');
    }
    if (this._players.length < 2) {
      throw new Error('At least 2 players are required');
    }
    if (categories.length < 5) {
      throw new Error('At least 5 categories are required');
    }

    for (let i = 1; i <= 5; i++) {
      const category = randomizer(categories);
      this._rounds.push(new Round(this.id, i, category));
    }

    this._status = 'IN_PROGRESS';
    this._currentRoundIndex = 0;
    this._createTurnsForRound(0);
  }

  startNextRound(now: Date): void {
    if (this._status !== 'IN_PROGRESS') {
      throw new Error('Game is not in progress');
    }
    const currentRound = this._rounds[this._currentRoundIndex];
    currentRound.checkCompleted();
    if (currentRound.status !== 'COMPLETED') {
      throw new Error('Current round is not completed');
    }

    this._currentRoundIndex += 1;
    if (this._currentRoundIndex >= 5) {
      this.finish(now);
    } else {
      this._createTurnsForRound(this._currentRoundIndex);
    }
  }

  finish(now: Date): void {
    if (this._status !== 'IN_PROGRESS') {
      throw new Error('Game is not in progress');
    }
    const scores = this.getPlayerScores();
    let maxScore = -1;
    let winners: Player[] = [];
    for (const player of this._players) {
      const score = scores.get(player.id) ?? 0;
      if (score > maxScore) {
        maxScore = score;
        winners = [player];
      } else if (score === maxScore) {
        winners.push(player);
      }
    }
    this._winner = winners.length === 1 ? winners[0] : null;
    this._status = 'FINISHED';
    this._finishedAt = now;
  }

  getCurrentRound(): Round | null {
    if (this._currentRoundIndex < 0 || this._currentRoundIndex >= this._rounds.length) {
      return null;
    }
    return this._rounds[this._currentRoundIndex];
  }

  getPlayerTotalScore(playerId: string): number {
    let total = 0;
    for (const round of this._rounds) {
      for (const turn of round.turns) {
        if (turn.playerId === playerId && turn.score) {
          total += turn.score.points;
        }
      }
    }
    return total;
  }

  getPlayerScores(): Map<string, number> {
    const scores = new Map<string, number>();
    for (const player of this._players) {
      scores.set(player.id, this.getPlayerTotalScore(player.id));
    }
    return scores;
  }

  private _createTurnsForRound(roundIndex: number): void {
    const round = this._rounds[roundIndex];
    for (const player of this._players) {
      round.createTurn(player.id);
    }
  }
}
