import { Game } from '../entities/Game.js';
import { Player } from '../entities/Player.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { PlayerRepository } from '../repositories/PlayerRepository.js';

export function joinGame(gameId: string, playerName: string, now: Date, gameRepo: GameRepository, playerRepo: PlayerRepository): Game {
  const game = gameRepo.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  const player = new Player(playerName, 'player', now);
  game.addPlayer(player);
  playerRepo.save(player);
  gameRepo.save(game);
  return game;
}
