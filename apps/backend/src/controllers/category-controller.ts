import { FastifyInstance, FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { getAllCategories, addCategory, CategoryRepository } from '@tick-panic/domain';

export function registerCategoryRoutes(app: FastifyInstance, categoryRepo: CategoryRepository, adminPreHandler?: preHandlerHookHandler): void {
  app.get('/categories', {
    schema: {
      description: 'List all categories',
      tags: ['Categories'],
      response: {
        200: {
          description: 'List of categories',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              examples: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const categories = await getAllCategories(categoryRepo);
    reply.send(categories.map((c) => ({ id: c.id, name: c.name, examples: c.examples })));
  });

  const postOptions: { preHandler?: preHandlerHookHandler[]; schema: object } = {
    schema: {
      description: 'Create a new category (admin only)',
      tags: ['Categories'],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          examples: { type: 'array', items: { type: 'string' } },
        },
      },
      response: {
        201: {
          description: 'Category created',
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            examples: { type: 'array', items: { type: 'string' } },
          },
        },
        400: {
          description: 'Validation error',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  };

  if (adminPreHandler) {
    postOptions.preHandler = [adminPreHandler];
  }

  app.post('/categories', postOptions, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { name: string; examples?: string[] };
    const category = await addCategory(body.name, body.examples ?? [], categoryRepo);
    reply.status(201).send({ id: category.id, name: category.name, examples: category.examples });
  });
}
