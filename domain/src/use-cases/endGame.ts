import { Game } from '../entities/Game.js';
import { GameRepository } from '../repositories/GameRepository.js';

export function endGame(gameId: string, now: Date, gameRepo: GameRepository): Game {
  const game = gameRepo.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  game.finish(now);
  gameRepo.save(game);
  return game;
}
