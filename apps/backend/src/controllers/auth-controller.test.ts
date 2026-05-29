import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { AuthService } from '@tick-panic/domain';
import { JwtTokenGenerator } from '../services/JwtTokenGenerator.js';
import { BcryptPasswordHasher } from '../services/BcryptPasswordHasher.js';
import { InMemoryUserRepository } from '../repositories/InMemoryUserRepository.js';
import { registerAuthRoutes } from './auth-controller.js';
import { errorHandler } from '../middlewares/errorHandler.js';

describe('authController', () => {
  const createApp = () => {
    const app = Fastify();
    app.setErrorHandler(errorHandler);
    const userRepo = new InMemoryUserRepository();
    const passwordHasher = new BcryptPasswordHasher();
    const tokenGenerator = new JwtTokenGenerator('test-secret');
    const authService = new AuthService(userRepo, passwordHasher, tokenGenerator);
    app.register(async (api) => {
      registerAuthRoutes(api, authService);
    }, { prefix: '/api' });
    return app;
  };

  it('should register a new user', async () => {
    const app = createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { username: 'player1', password: 'secret123', role: 'player' },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.username).toBe('player1');
    expect(body.role).toBe('player');
    expect(body.id).toBeDefined();
  });

  it('should reject duplicate username', async () => {
    const app = createApp();
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { username: 'player1', password: 'secret123', role: 'player' },
    });
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { username: 'player1', password: 'secret123', role: 'player' },
    });

    expect(response.statusCode).toBe(409);
  });

  it('should login with valid credentials', async () => {
    const app = createApp();
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { username: 'player1', password: 'secret123', role: 'player' },
    });
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'player1', password: 'secret123' },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.token).toBeDefined();
  });

  it('should reject login with invalid credentials', async () => {
    const app = createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'unknown', password: 'wrong' },
    });

    expect(response.statusCode).toBe(403);
  });
});
