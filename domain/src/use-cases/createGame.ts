import { Game } from '../entities/Game.js';
import { Player } from '../entities/Player.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { PlayerRepository } from '../repositories/PlayerRepository.js';

export function createGame(hostName: string, now: Date, gameRepo: GameRepository, playerRepo: PlayerRepository): Game {
  const game = new Game(now);
  const host = new Player(hostName, 'host', now);
  game.addPlayer(host);
  playerRepo.save(host);
  gameRepo.save(game);
  return game;
}
