import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './AuthService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { PasswordHasherPort } from '../ports/PasswordHasherPort.js';
import { TokenGeneratorPort } from '../ports/TokenGeneratorPort.js';
import { User } from '../entities/User.js';
import { Game } from '../entities/Game.js';
import { Player } from '../entities/Player.js';
import { Category } from '../entities/Category.js';

describe('AuthService', () => {
  let userRepo: UserRepository;
  let passwordHasher: PasswordHasherPort;
  let tokenGenerator: TokenGeneratorPort;
  let service: AuthService;

  beforeEach(() => {
    userRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByUsername: vi.fn(),
      findAll: vi.fn(),
    };
    passwordHasher = {
      hash: vi.fn().mockResolvedValue('hashed_password'),
      compare: vi.fn().mockResolvedValue(true),
    };
    tokenGenerator = {
      generate: vi.fn().mockResolvedValue('jwt_token_123'),
      verify: vi.fn(),
    };
    service = new AuthService(userRepo, passwordHasher, tokenGenerator);
  });

  describe('register', () => {
    it('should register a new user with hashed password', async () => {
      userRepo.findByUsername = vi.fn().mockReturnValue(null);
      const user = await service.register('alice', 'plain_password', 'player', new Date());
      expect(passwordHasher.hash).toHaveBeenCalledWith('plain_password');
      expect(userRepo.save).toHaveBeenCalledWith(expect.any(User));
      expect(user.username).toBe('alice');
      expect(user.role).toBe('player');
      expect(user.passwordHash).toBe('hashed_password');
    });

    it('should throw if username already exists', async () => {
      const existing = new User('alice', 'old_hash', 'player', new Date());
      userRepo.findByUsername = vi.fn().mockReturnValue(existing);
      await expect(service.register('alice', 'pw', 'player', new Date())).rejects.toThrow('Username already exists');
      expect(passwordHasher.hash).not.toHaveBeenCalled();
      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('should allow registering admin role', async () => {
      userRepo.findByUsername = vi.fn().mockReturnValue(null);
      const user = await service.register('admin1', 'pw', 'admin', new Date());
      expect(user.role).toBe('admin');
    });

    it('should trim username before checking duplicates', async () => {
      const existing = new User('alice', 'old_hash', 'player', new Date());
      userRepo.findByUsername = vi.fn().mockReturnValue(existing);
      await expect(service.register('  alice  ', 'pw', 'player', new Date())).rejects.toThrow('Username already exists');
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const user = new User('alice', 'hashed_pw', 'player', new Date());
      userRepo.findByUsername = vi.fn().mockReturnValue(user);
      passwordHasher.compare = vi.fn().mockResolvedValue(true);
      const token = await service.login('alice', 'correct_password');
      expect(passwordHasher.compare).toHaveBeenCalledWith('correct_password', 'hashed_pw');
      expect(tokenGenerator.generate).toHaveBeenCalledWith({ userId: user.id, role: 'player' });
      expect(token).toBe('jwt_token_123');
    });

    it('should throw if username not found', async () => {
      userRepo.findByUsername = vi.fn().mockReturnValue(null);
      await expect(service.login('unknown', 'pw')).rejects.toThrow('Invalid credentials');
      expect(passwordHasher.compare).not.toHaveBeenCalled();
      expect(tokenGenerator.generate).not.toHaveBeenCalled();
    });

    it('should throw if password does not match', async () => {
      const user = new User('alice', 'hashed_pw', 'player', new Date());
      userRepo.findByUsername = vi.fn().mockReturnValue(user);
      passwordHasher.compare = vi.fn().mockResolvedValue(false);
      await expect(service.login('alice', 'wrong_password')).rejects.toThrow('Invalid credentials');
      expect(tokenGenerator.generate).not.toHaveBeenCalled();
    });

    it('should trim username before lookup', async () => {
      const user = new User('alice', 'hashed_pw', 'player', new Date());
      userRepo.findByUsername = vi.fn().mockReturnValue(user);
      passwordHasher.compare = vi.fn().mockResolvedValue(true);
      await service.login('  alice  ', 'correct_password');
      expect(userRepo.findByUsername).toHaveBeenCalledWith('alice');
    });
  });

  describe('canStartGame', () => {
    it('should return true if player is host of the game', () => {
      const game = new Game(new Date());
      const host = new Player('Alice', 'host', new Date());
      game.addPlayer(host);
      game.addPlayer(new Player('Bob', 'player', new Date()));
      expect(service.canStartGame(game, host.id)).toBe(true);
    });

    it('should return false if player is not host', () => {
      const game = new Game(new Date());
      const host = new Player('Alice', 'host', new Date());
      const bob = new Player('Bob', 'player', new Date());
      game.addPlayer(host);
      game.addPlayer(bob);
      expect(service.canStartGame(game, bob.id)).toBe(false);
    });

    it('should return false if player is not in the game', () => {
      const game = new Game(new Date());
      const host = new Player('Alice', 'host', new Date());
      game.addPlayer(host);
      game.addPlayer(new Player('Bob', 'player', new Date()));
      expect(service.canStartGame(game, 'unknown-id')).toBe(false);
    });
  });

  describe('canEndGame', () => {
    it('should return true if player is host', () => {
      const game = new Game(new Date());
      const host = new Player('Alice', 'host', new Date());
      game.addPlayer(host);
      game.addPlayer(new Player('Bob', 'player', new Date()));
      game.start(
        [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
        () => new Category('x'),
        host.id
      );
      expect(service.canEndGame(game, host.id)).toBe(true);
    });

    it('should return false if player is not host', () => {
      const game = new Game(new Date());
      const host = new Player('Alice', 'host', new Date());
      const bob = new Player('Bob', 'player', new Date());
      game.addPlayer(host);
      game.addPlayer(bob);
      game.start(
        [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
        () => new Category('x'),
        host.id
      );
      expect(service.canEndGame(game, bob.id)).toBe(false);
    });
  });

  describe('canAddCategory', () => {
    it('should return true for admin user', () => {
      const admin = new User('admin1', 'hash', 'admin', new Date());
      expect(service.canAddCategory(admin)).toBe(true);
    });

    it('should return false for player user', () => {
      const player = new User('player1', 'hash', 'player', new Date());
      expect(service.canAddCategory(player)).toBe(false);
    });
  });
});
