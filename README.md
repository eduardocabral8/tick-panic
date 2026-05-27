# 15 Segundos

Juego multijugador en tiempo real — velocidad mental, turnos cronometrados y mucha presión.

---

## Qué es esto

Un juego competitivo donde el tiempo no perdona. Dos modalidades: jugás con alguien en el mismo dispositivo, o te conectás online con una sala de amigos y el servidor hace de árbitro.

La mecánica es simple: elegís una categoría, el otro jugador tiene *N* segundos para decir en voz alta todo lo que pueda, vos validás. Los turnos se invierten. La tensión sube.

---

## Modos de juego

**Local — un dispositivo, dos jugadores**

Se pasan el teléfono o la compu. Un jugador elige la categoría, el otro adivina contra el reloj, el primero valida. Los roles rotan automáticamente.

La dificultad escala por ronda con la fórmula `6 - ronda` segundos:

| Ronda | Tiempo |
|-------|--------|
| 1     | 5s     |
| 2     | 4s     |
| 3     | 3s     |
| 4     | 2s     |
| 5     | 1s     |

Sin conexión, el juego sigue funcionando con un catálogo offline precargado. Si hay servidor, descarga las categorías reales.

---

**Multijugador — online, tiempo real**

Un jugador crea una sala y comparte el código. El resto se une. El servidor es la única fuente de verdad: controla el cronómetro, valida las respuestas y calcula el puntaje. Las respuestas que llegan tarde son rechazadas automáticamente. Todo vía WebSockets.

---

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite, Tailwind CSS v3 |
| Backend | Node.js, Fastify, Socket.io |
| Base de datos | PostgreSQL, Prisma ORM |
| Tests | Vitest |
| Infraestructura | Docker, Docker Compose |
| Lenguaje | TypeScript 5 (ESM nativo) |
| Monorepo | pnpm workspaces v9 |

---

## Arquitectura

Monorepo con Clean Architecture. La lógica de negocio vive en `domain/` y no sabe nada de Fastify, Prisma ni React.

```
15-seconds/
├── domain/                  # Lógica de negocio pura
│   └── src/
│       ├── entities/        # User, Category, Game...
│       ├── use-cases/       # createUser, startGame...
│       ├── services/        # AuthService y similares
│       └── repositories/    # Interfaces (puertos)
│
└── apps/
    ├── backend/             # Infraestructura de red y persistencia
    │   ├── prisma/          # Esquema y migraciones
    │   └── src/
    │       ├── controllers/ # Rutas HTTP REST
    │       ├── repositories/# Implementaciones Prisma / InMemory
    │       └── websocket/   # Handlers y emisores Socket.io
    │
    └── frontend/            # Cliente React
        └── src/
            ├── pages/       # Local, Lobby, GameRoom, Login
            ├── components/  # Componentes reutilizables
            └── services/    # Conectores API y red
```

---

## Levantar el proyecto

### Requisitos

- Node.js v20+
- pnpm v9
- Docker y Docker Compose

---

### Desarrollo local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar solo la base de datos
docker compose up -d postgres

# 3. Configurar variables de entorno
cp .env.example .env
cp .env apps/backend/.env

# 4. Correr migraciones
pnpm --filter @15-seconds/backend exec prisma migrate dev --name init

# 5. Iniciar frontend + backend en paralelo
pnpm run dev
```

- Frontend → `http://localhost:5173`
- Backend → `http://localhost:3000`

---

### Producción (todo en un comando)

Nginx como reverse proxy, frontend estático, backend compilado y PostgreSQL con volumen persistente.

```bash
docker compose up --build
```

Abrí `http://localhost` y listo.

---

## Tests

```bash
# Todos los tests del monorepo
pnpm test

# Watch mode (desarrollo)
pnpm --filter domain test:watch

# Linter
pnpm lint

# Verificación de tipos
pnpm build
```
