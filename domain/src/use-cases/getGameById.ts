import { Game } from '../entities/Game.js';
import { GameRepository } from '../repositories/GameRepository.js';

export function getGameById(gameId: string, gameRepo: GameRepository): Game {
  const game = gameRepo.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  return game;
}
