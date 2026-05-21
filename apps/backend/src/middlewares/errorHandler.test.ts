import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { errorHandler } from './errorHandler.js';

describe('errorHandler', () => {
  it('should map Username already exists to 409', async () => {
    const app = Fastify();
    app.setErrorHandler(errorHandler);
    app.get('/test', async () => {
      throw new Error('Username already exists');
    });

    const response = await app.inject({ method: 'GET', url: '/test' });

    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body).error).toBe('Username already exists');
  });

  it('should map Invalid credentials to 403', async () => {
    const app = Fastify();
    app.setErrorHandler(errorHandler);
    app.get('/test', async () => {
      throw new Error('Invalid credentials');
    });

    const response = await app.inject({ method: 'GET', url: '/test' });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).error).toBe('Invalid credentials');
  });

  it('should map Only the host can start the game to 403', async () => {
    const app = Fastify();
    app.setErrorHandler(errorHandler);
    app.get('/test', async () => {
      throw new Error('Only the host can start the game');
    });

    const response = await app.inject({ method: 'GET', url: '/test' });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).error).toBe('Only the host can start the game');
  });

  it('should map Game not found to 404', async () => {
    const app = Fastify();
    app.setErrorHandler(errorHandler);
    app.get('/test', async () => {
      throw new Error('Game not found');
    });

    const response = await app.inject({ method: 'GET', url: '/test' });

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).error).toBe('Game not found');
  });

  it('should map Username is required to 400', async () => {
    const app = Fastify();
    app.setErrorHandler(errorHandler);
    app.get('/test', async () => {
      throw new Error('Username is required');
    });

    const response = await app.inject({ method: 'GET', url: '/test' });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toBe('Username is required');
  });

  it('should map unknown errors to 500', async () => {
    const app = Fastify();
    app.setErrorHandler(errorHandler);
    app.get('/test', async () => {
      throw new Error('Something weird happened');
    });

    const response = await app.inject({ method: 'GET', url: '/test' });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toBe('Internal server error');
  });
});
