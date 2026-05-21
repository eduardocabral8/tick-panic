export { Player, type PlayerRole } from './entities/Player.js';
export { Category } from './entities/Category.js';
export { Answer } from './entities/Answer.js';
export { Turn, type TurnStatus } from './entities/Turn.js';
export { Round, type RoundStatus } from './entities/Round.js';
export { Game, type GameStatus } from './entities/Game.js';
export { Score } from './entities/Score.js';
export { User, type UserRole } from './entities/User.js';

export { GameRepository } from './repositories/GameRepository.js';
export { PlayerRepository } from './repositories/PlayerRepository.js';
export { RoundRepository } from './repositories/RoundRepository.js';
export { TurnRepository } from './repositories/TurnRepository.js';
export { AnswerRepository } from './repositories/AnswerRepository.js';
export { CategoryRepository } from './repositories/CategoryRepository.js';
export { UserRepository } from './repositories/UserRepository.js';

export { TimerPort } from './ports/TimerPort.js';
export { PasswordHasherPort } from './ports/PasswordHasherPort.js';
export { TokenGeneratorPort } from './ports/TokenGeneratorPort.js';

export { GameTimerService } from './services/GameTimerService.js';
export { AuthService } from './services/AuthService.js';
export { ScoreService } from './services/ScoreService.js';
export { RankingService, type RankEntry } from './services/RankingService.js';

export { createGame } from './use-cases/createGame.js';
export { joinGame } from './use-cases/joinGame.js';
export { startGame } from './use-cases/startGame.js';
export { endGame } from './use-cases/endGame.js';
export { startTurn } from './use-cases/startTurn.js';
export { submitAnswer } from './use-cases/submitAnswer.js';
export { finishTurn } from './use-cases/finishTurn.js';
export { nextTurn } from './use-cases/nextTurn.js';
export { getRandomCategory } from './use-cases/getRandomCategory.js';
export { addCategory } from './use-cases/addCategory.js';
export { createUser } from './use-cases/createUser.js';
export { loginUser } from './use-cases/loginUser.js';
export { getAllCategories } from './use-cases/getAllCategories.js';
export { getGameById } from './use-cases/getGameById.js';
export { validateAnswer } from './use-cases/validateAnswer.js';
