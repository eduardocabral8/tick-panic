import { Game } from '../entities/Game.js';

export class ScoreService {
  getGameScores(game: Game): Map<string, number> {
    return game.getPlayerScores();
  }
}
