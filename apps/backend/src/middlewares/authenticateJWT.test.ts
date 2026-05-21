import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { JwtTokenGenerator } from '../services/JwtTokenGenerator.js';
import { authenticateJWT } from './authenticateJWT.js';

describe('authenticateJWT', () => {
  const tokenGenerator = new JwtTokenGenerator('test-secret');

  it('should allow request with valid token', async () => {
    const token = await tokenGenerator.generate({ userId: '123', role: 'player' });
    const app = Fastify();
    app.get('/test', async (request, reply) => {
      await authenticateJWT(request, reply, tokenGenerator);
      return { user: request.user };
    });

    const response = await app.inject({
      method: 'GET',
      url: '/test',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).user).toEqual({ userId: '123', role: 'player' });
  });

  it('should reject request without authorization header', async () => {
    const app = Fastify();
    app.get('/test', async (request, reply) => {
      await authenticateJWT(request, reply, tokenGenerator);
      return { user: request.user };
    });

    const response = await app.inject({
      method: 'GET',
      url: '/test',
    });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).error).toBe('Unauthorized');
  });

  it('should reject request with invalid token', async () => {
    const app = Fastify();
    app.get('/test', async (request, reply) => {
      await authenticateJWT(request, reply, tokenGenerator);
      return { user: request.user };
    });

    const response = await app.inject({
      method: 'GET',
      url: '/test',
      headers: { authorization: 'Bearer invalid-token' },
    });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).error).toBe('Invalid token');
  });
});
