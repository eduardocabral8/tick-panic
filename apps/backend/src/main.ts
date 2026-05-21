import { Server as SocketIOServer } from 'socket.io';
import Fastify, { FastifyInstance, preHandlerHookHandler } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { AuthService, addCategory, getAllCategories } from '@15-seconds/domain';
import { InMemoryUserRepository } from './repositories/InMemoryUserRepository.js';
import { InMemoryGameRepository } from './repositories/InMemoryGameRepository.js';
import { InMemoryPlayerRepository } from './repositories/InMemoryPlayerRepository.js';
import { InMemoryCategoryRepository } from './repositories/InMemoryCategoryRepository.js';
import { InMemoryTurnRepository } from './repositories/InMemoryTurnRepository.js';
import { InMemoryAnswerRepository } from './repositories/InMemoryAnswerRepository.js';
import { InMemoryRoundRepository } from './repositories/InMemoryRoundRepository.js';
import { BcryptPasswordHasher } from './services/BcryptPasswordHasher.js';
import { JwtTokenGenerator } from './services/JwtTokenGenerator.js';
import { NodeTurnTimer } from './services/NodeTurnTimer.js';
import { JWT_SECRET, PORT } from './constants.js';
import { registerAuthRoutes } from './controllers/auth-controller.js';
import { registerCategoryRoutes } from './controllers/category-controller.js';
import { registerGameRoutes } from './controllers/game-controller.js';
import { registerTurnRoutes } from './controllers/turn-controller.js';
import { authenticateJWT } from './middlewares/authenticateJWT.js';
import { requireRole } from './middlewares/requireRole.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { createGameSocket } from './websocket/gameSocket.js';

const app: FastifyInstance = Fastify({ logger: false });

app.setErrorHandler(errorHandler);

await app.register(swagger, {
  swagger: {
    info: {
      title: '15 Segundos API',
      description: 'API REST del juego multijugador 15 segundos',
      version: '1.0.0',
    },
    host: `localhost:${PORT}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  },
});

await app.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
});

const userRepo = new InMemoryUserRepository();
const gameRepo = new InMemoryGameRepository();
const playerRepo = new InMemoryPlayerRepository();
const categoryRepo = new InMemoryCategoryRepository();
const turnRepo = new InMemoryTurnRepository();
const answerRepo = new InMemoryAnswerRepository();
const roundRepo = new InMemoryRoundRepository();

const passwordHasher = new BcryptPasswordHasher();
const tokenGenerator = new JwtTokenGenerator(JWT_SECRET);
const authService = new AuthService(userRepo, passwordHasher, tokenGenerator);
const timer = new NodeTurnTimer();

const existingCategories = getAllCategories(categoryRepo);
if (existingCategories.length === 0) {
  addCategory('animales', ['perro', 'gato', 'elefante'], categoryRepo);
  addCategory('colores', ['rojo', 'azul', 'verde'], categoryRepo);
  addCategory('paises', ['argentina', 'brasil', 'españa'], categoryRepo);
  addCategory('frutas', ['manzana', 'banana', 'naranja'], categoryRepo);
  addCategory('deportes', ['futbol', 'baloncesto', 'tenis'], categoryRepo);
}

const adminPreHandler: preHandlerHookHandler = async (request, reply) => {
  await authenticateJWT(request, reply, tokenGenerator);
  await requireRole('admin')(request, reply);
};

const server = app.server;
const io = new SocketIOServer(server, { cors: { origin: '*' } });

createGameSocket(io);

app.register(async (api) => {
  registerAuthRoutes(api, authService);
  registerCategoryRoutes(api, categoryRepo, adminPreHandler);

  registerGameRoutes(api, gameRepo, playerRepo, categoryRepo, roundRepo, turnRepo, io);
  registerTurnRoutes(api, gameRepo, turnRepo, answerRepo, roundRepo, io, timer);
}, { prefix: '/api' });

app.get('/health', async () => {
  return { status: 'ok' };
});

await app.ready();

server.listen(PORT, '0.0.0.0');
