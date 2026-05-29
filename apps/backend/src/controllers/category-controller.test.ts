import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { InMemoryCategoryRepository } from '../repositories/InMemoryCategoryRepository.js';
import { registerCategoryRoutes } from './category-controller.js';
import { errorHandler } from '../middlewares/errorHandler.js';

describe('categoryController', () => {
  const createApp = () => {
    const app = Fastify();
    app.setErrorHandler(errorHandler);
    const categoryRepo = new InMemoryCategoryRepository();
    app.register(async (api) => {
      registerCategoryRoutes(api, categoryRepo);
    }, { prefix: '/api' });
    return { app, categoryRepo };
  };

  it('should list all categories', async () => {
    const { app, categoryRepo } = createApp();
    const { Category } = await import('@tick-panic/domain');
    const category = new Category('Animals', ['Dog']);
    categoryRepo.save(category);

    const response = await app.inject({
      method: 'GET',
      url: '/api/categories',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe('Animals');
  });

  it('should create a category', async () => {
    const { app } = createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/categories',
      payload: { name: 'Countries', examples: ['Argentina'] },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.name).toBe('Countries');
    expect(body.examples).toEqual(['Argentina']);
  });

  it('should reject empty category name', async () => {
    const { app } = createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/categories',
      payload: { name: '' },
    });

    expect(response.statusCode).toBe(400);
  });
});
