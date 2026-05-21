import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createUser, loginUser, AuthService } from '@15-seconds/domain';

export function registerAuthRoutes(app: FastifyInstance, authService: AuthService): void {
  app.post('/auth/register', {
    schema: {
      description: 'Register a new user',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['username', 'password', 'role'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'player'] },
        },
      },
      response: {
        201: {
          description: 'User created successfully',
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string' },
          },
        },
        400: {
          description: 'Validation error',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        409: {
          description: 'Username already exists',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: { username: string; password: string; role: 'admin' | 'player' } }>, reply: FastifyReply) => {
    const user = await createUser(request.body.username, request.body.password, request.body.role, new Date(), authService);
    reply.status(201).send({ id: user.id, username: user.username, role: user.role });
  });

  app.post('/auth/login', {
    schema: {
      description: 'Login and receive JWT token',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Login successful',
          type: 'object',
          properties: {
            token: { type: 'string' },
          },
        },
        403: {
          description: 'Invalid credentials',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: { username: string; password: string } }>, reply: FastifyReply) => {
    const token = await loginUser(request.body.username, request.body.password, authService);
    reply.send({ token });
  });
}
