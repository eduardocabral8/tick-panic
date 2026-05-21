import { UserRepository } from '../repositories/UserRepository.js';
import { PasswordHasherPort } from '../ports/PasswordHasherPort.js';
import { TokenGeneratorPort } from '../ports/TokenGeneratorPort.js';
import { User } from '../entities/User.js';
import { Game } from '../entities/Game.js';

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private passwordHasher: PasswordHasherPort,
    private tokenGenerator: TokenGeneratorPort
  ) {}

  async register(username: string, password: string, role: 'admin' | 'player', now: Date): Promise<User> {
    const trimmed = username.trim();
    const existing = this.userRepo.findByUsername(trimmed);
    if (existing) {
      throw new Error('Username already exists');
    }
    const passwordHash = await this.passwordHasher.hash(password);
    const user = new User(trimmed, passwordHash, role, now);
    this.userRepo.save(user);
    return user;
  }

  async login(username: string, password: string): Promise<string> {
    const user = this.userRepo.findByUsername(username.trim());
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const matches = await this.passwordHasher.compare(password, user.passwordHash);
    if (!matches) {
      throw new Error('Invalid credentials');
    }
    const token = await this.tokenGenerator.generate({ userId: user.id, role: user.role });
    return token;
  }

  canStartGame(game: Game, playerId: string): boolean {
    const player = game.players.find(p => p.id === playerId);
    return player !== undefined && player.role === 'host';
  }

  canEndGame(game: Game, playerId: string): boolean {
    return this.canStartGame(game, playerId);
  }

  canAddCategory(user: User): boolean {
    return user.role === 'admin';
  }
}
