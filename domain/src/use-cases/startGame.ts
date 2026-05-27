import { Game } from '../entities/Game.js';
import { Category } from '../entities/Category.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';

export async function startGame(gameId: string, hostPlayerId: string, gameRepo: GameRepository, categoryRepo: CategoryRepository): Promise<Game> {
  const game = gameRepo.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  const categories = await categoryRepo.findAll();
  if (categories.length < 5) {
    throw new Error('At least 5 categories are required');
  }
  const randomizer = (cats: Category[]) => cats[Math.floor(Math.random() * cats.length)];
  game.start(categories, randomizer, hostPlayerId);
  gameRepo.save(game);
  return game;
}
