import { Game } from '../entities/Game.js';

export interface RankEntry {
  playerId: string;
  totalScore: number;
  rank: number;
}

export class RankingService {
  getFinalRanking(game: Game): RankEntry[] {
    const scores = game.getPlayerScores();
    if (scores.size === 0) {
      return [];
    }

    const entries: { playerId: string; totalScore: number }[] = [];
    for (const [playerId, totalScore] of scores.entries()) {
      entries.push({ playerId, totalScore });
    }

    entries.sort((a, b) => b.totalScore - a.totalScore);

    const ranking: RankEntry[] = [];
    let currentRank = 1;
    let currentScore = entries[0].totalScore;

    for (let i = 0; i < entries.length; i++) {
      if (i > 0 && entries[i].totalScore < currentScore) {
        currentRank = i + 1;
        currentScore = entries[i].totalScore;
      }
      ranking.push({
        playerId: entries[i].playerId,
        totalScore: entries[i].totalScore,
        rank: currentRank,
      });
    }

    return ranking;
  }
}
