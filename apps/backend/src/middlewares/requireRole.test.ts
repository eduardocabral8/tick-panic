import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { requireRole } from './requireRole.js';

describe('requireRole', () => {
  it('should allow request with matching role', async () => {
    const app = Fastify();
    app.get('/test', { preHandler: requireRole('admin') }, async () => {
      return { ok: true };
    });

    const response = await app.inject({
      method: 'GET',
      url: '/test',
    });

    expect(response.statusCode).toBe(403);
  });

  it('should allow request when user has required role', async () => {
    const app = Fastify();
    app.addHook('preHandler', async (request) => {
      request.user = { userId: '1', role: 'admin' };
    });
    app.get('/test', { preHandler: requireRole('admin') }, async () => {
      return { ok: true };
    });

    const response = await app.inject({
      method: 'GET',
      url: '/test',
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).ok).toBe(true);
  });

  it('should reject request when user has different role', async () => {
    const app = Fastify();
    app.addHook('preHandler', async (request) => {
      request.user = { userId: '1', role: 'player' };
    });
    app.get('/test', { preHandler: requireRole('admin') }, async () => {
      return { ok: true };
    });

    const response = await app.inject({
      method: 'GET',
      url: '/test',
    });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).error).toBe('Forbidden');
  });
});
