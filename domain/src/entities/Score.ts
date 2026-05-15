export class Score {
  readonly playerId: string;
  readonly roundNumber: number;
  readonly points: number;

  constructor(playerId: string, roundNumber: number, points: number) {
    this.playerId = playerId;
    this.roundNumber = roundNumber;
    this.points = points;
  }
}
