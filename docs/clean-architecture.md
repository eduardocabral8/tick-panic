# Clean Architecture

Dependency direction: inward. Domain is the center. Nothing knows about the domain except what the domain exports.

## Diagram

```
┌─────────────────────────────────────────────┐
│           apps/frontend                     │
│  React, Vite, hooks, components, pages     │
│  ───► calls HTTP API and WebSocket         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           apps/backend                      │
│  Fastify, routes, WS handlers, SQLite      │
│  ───► imports domain (use-cases, entities) │
│  ───► implements repositories (ports)      │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           domain/                           │
│  entities, value objects, use-cases,       │
│  services, repositories/interfaces          │
│  ───► imports NOTHING from nobody          │
│  ───► pure TypeScript only                 │
└─────────────────────────────────────────────┘
```

## Rules

### Domain Layer
- Knows nothing about Fastify, React, SQLite, WebSocket, HTTP, or the file system
- Defines repository interfaces (ports) that other layers implement
- Defines service interfaces (like `TimerPort`) that infrastructure implements
- Throws `Error` for business violations

### Backend Layer
- Knows about the domain (imports from it)
- Implements domain repository interfaces with SQLite
- Implements domain service interfaces with Node.js APIs (`setTimeout`)
- Handles HTTP requests and WebSocket connections
- Maps domain errors to HTTP status codes
- Does NOT know about React or frontend internals

### Frontend Layer
- Knows about the backend (calls its HTTP API and WebSocket)
- Does NOT know about the domain directly
- Does NOT import entities, use cases, or value objects from `domain/`
- Receives plain JSON from backend
- Defines its own types for API responses

## Examples

### Allowed

```typescript
// backend/src/repositories/SqliteGameRepository.ts
import { GameRepository } from '@15-seconds/domain';
// ✅ Implements a domain port

// backend/src/routes/gameRoutes.ts
import { CreateGame } from '@15-seconds/domain';
// ✅ Uses a domain use case

// frontend/src/hooks/useWebSocket.ts
const ws = new WebSocket('ws://localhost:3000');
// ✅ Frontend uses browser APIs

// domain/src/entities/Game.ts
import { Player } from './Player.js';
// ✅ Domain imports from domain
```

### Forbidden

```typescript
// domain/src/entities/Game.ts
import { Database } from 'better-sqlite3';
// ❌ Domain cannot import SQLite

// domain/src/use-cases/CreateGame.ts
import { FastifyRequest } from 'fastify';
// ❌ Domain cannot import Fastify

// frontend/src/components/TimerDisplay.tsx
import { Game } from '@15-seconds/domain';
// ❌ Frontend cannot import domain entities

// backend/src/server.ts
import App from '../../frontend/src/App.tsx';
// ❌ Backend cannot import frontend

// domain/src/entities/Player.ts
const dbPath = process.env.DB_PATH;
// ❌ Domain cannot read env vars
```

## Ports and Adapters

| Port (Domain Interface) | Adapter (Backend Implementation) |
|------------------------|----------------------------------|
| `TimerPort` | `NodeTurnTimer.ts` (uses `setTimeout`) |
| `GameRepository` | `SqliteGameRepository.ts` |
| `PlayerRepository` | `SqlitePlayerRepository.ts` |
| `TurnRepository` | `SqliteTurnRepository.ts` |
| `AnswerRepository` | `SqliteAnswerRepository.ts` |
| `RoundRepository` | `SqliteRoundRepository.ts` |
| `CategoryRepository` | `SqliteCategoryRepository.ts` |

The domain defines the contract. The backend fulfills it.
