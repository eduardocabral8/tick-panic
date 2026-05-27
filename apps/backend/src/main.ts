import { Server as SocketIOServer } from 'socket.io';
import Fastify, { FastifyInstance, preHandlerHookHandler } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { AuthService, addCategory, getAllCategories } from '@15-seconds/domain';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from './repositories/PrismaUserRepository.js';
import { InMemoryGameRepository } from './repositories/InMemoryGameRepository.js';
import { InMemoryPlayerRepository } from './repositories/InMemoryPlayerRepository.js';
import { PrismaCategoryRepository } from './repositories/PrismaCategoryRepository.js';
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
    docExpansion: 'list', deepLinking: false,
  },
});

const prisma = new PrismaClient();
const userRepo = new PrismaUserRepository(prisma);
const gameRepo = new InMemoryGameRepository();
const playerRepo = new InMemoryPlayerRepository();
const categoryRepo = new PrismaCategoryRepository(prisma);
const turnRepo = new InMemoryTurnRepository();
const answerRepo = new InMemoryAnswerRepository();
const roundRepo = new InMemoryRoundRepository();

const passwordHasher = new BcryptPasswordHasher();
const tokenGenerator = new JwtTokenGenerator(JWT_SECRET);
const authService = new AuthService(userRepo, passwordHasher, tokenGenerator);
const timer = new NodeTurnTimer();

const seeds = [
  { name: 'animales', examples: ['perro', 'gato', 'elefante'] },
  { name: 'colores', examples: ['rojo', 'azul', 'verde'] },
  { name: 'países', examples: ['argentina', 'brasil', 'españa'] },
  { name: 'frutas', examples: ['manzana', 'banana', 'naranja'] },
  { name: 'deportes', examples: ['futbol', 'baloncesto', 'tenis'] },
  { name: 'marcas de auto', examples: ['toyota', 'ford', 'ferrari'] },
  { name: 'películas', examples: ['titanic', 'inception', 'avatar'] },
  { name: 'profesiones', examples: ['médico', 'ingeniero', 'profesor'] },
  { name: 'comidas', examples: ['pizza', 'hamburguesa', 'sushi'] },
  { name: 'instrumentos musicales', examples: ['guitarra', 'piano', 'batería'] },
  { name: 'superhéroes', examples: ['batman', 'spiderman', 'superman'] },
  { name: 'series de TV', examples: ['friends', 'breaking bad', 'los simpson'] },
  { name: 'capitales', examples: ['buenos aires', 'madrid', 'paris'] },
  { name: 'bebidas', examples: ['agua', 'coca cola', 'cerveza'] },
  { name: 'ropa', examples: ['pantalón', 'camisa', 'remera'] },
  { name: 'personaje', examples: ['harry potter', 'sherlock holmes', 'don quijote'] },
  { name: 'apellido', examples: ['gonzález', 'rodríguez', 'pérez'] },
  { name: 'lugar', examples: ['playa', 'montaña', 'parque'] },
  { name: 'musica', examples: ['rock', 'pop', 'jazz'] },
  { name: 'artista', examples: ['picasso', 'van gogh', 'da vinci'] },
  { name: 'palabra de 4 letras', examples: ['casa', 'tren', 'azul'] },
  { name: 'sabor de helado', examples: ['chocolate', 'frutilla', 'dulce de leche'] },
  { name: 'cosas que hay en una cocina', examples: ['sartén', 'licuadora', 'cuchillo'] },
  { name: 'cosas que hay en un baño', examples: ['jabón', 'toalla', 'cepillo de dientes'] },
  { name: 'objetos con botones', examples: ['control remoto', 'teléfono', 'ascensor'] },
  { name: 'cosas que den asco', examples: ['basura', 'insecto', 'comida podrida'] },
];

const existingCategories = await getAllCategories(categoryRepo);
const existingNames = new Set(existingCategories.map((c) => c.name.toLowerCase()));

for (const seed of seeds) {
  if (!existingNames.has(seed.name.toLowerCase())) {
    await addCategory(seed.name, seed.examples, categoryRepo);
  }
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
