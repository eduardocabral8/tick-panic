# 15 Segundos - Juego Multijugador

"15 segundos" es un juego dinámico, rápido y competitivo en tiempo real. Está diseñado bajo una **Arquitectura Limpia (Clean Architecture)** en un monorepo TypeScript utilizando `pnpm` workspaces, React 19, Fastify, WebSockets (Socket.io) y persistencia real mediante PostgreSQL y Prisma ORM.

---

## 🎮 Dinámica del Juego

El juego gira en torno a la velocidad mental y la agilidad de los jugadores bajo un límite de tiempo estricto. Cuenta con dos modalidades de juego principales:

### 1. Modo Local (Offline / Un solo dispositivo)
* **Dispositivo compartido**: Dos jugadores juegan físicamente utilizando el mismo teléfono o computadora pasándose el dispositivo.
* **Flujo estricto de turnos alternantes**:
  1. El **Jugador A** elige una categoría (de manera manual o aleatoria).
  2. El dispositivo se pasa al **Jugador B** (el adivinador).
  3. El **Jugador B** tiene una cuenta regresiva para decir en voz alta tantas palabras relacionadas con la categoría como pueda.
  4. El **Jugador A** valida en pantalla cuántas palabras fueron correctas.
  5. En el siguiente turno, los roles se invierten de forma automática y equitativa.
* **Dificultad progresiva**: La cuenta regresiva se vuelve más difícil en cada ronda según la fórmula `6 - ronda` segundos (Ronda 1 = 5s, Ronda 5 = 1s).
* **Resiliencia de conexión**: Funciona de forma híbrida. Al abrir la pantalla, intenta descargar categorías reales del servidor PostgreSQL; si no hay conexión, hace un *fallback* automático a un catálogo estático precargado en memoria de manera offline.

### 2. Modo Multijugador (Online / Tiempo Real)
* **Salas multijugador**: Un jugador crea una sala de juego actuando como "Anfitrión" (`host`) y los demás jugadores se unen mediante un código de sala único.
* **Estado centralizado**: El servidor del backend actúa como única fuente de verdad para el estado de la partida y el cronómetro de los turnos (`NodeTurnTimer`).
* **WebSockets en tiempo real**: Se utiliza Socket.io para emitir los cambios de estado (inicio de partida, cambio de turno, fin de tiempo) en tiempo real a todos los clientes.
* **Flujo de juego**:
  - Los jugadores se turnan para asignarse categorías entre sí.
  - El jugador adivinador envía sus respuestas que son validadas en tiempo real por el resto de la sala.
  - Las respuestas enviadas fuera del límite de tiempo del servidor son rechazadas automáticamente.
  - El sistema calcula puntuaciones en tiempo real y declara un ganador tras finalizar las 5 rondas.

---

## 🛠️ Arquitectura y Tecnologías Utilizadas

El proyecto está estructurado como un **Monorepo** con límites de capas estrictos. La lógica del negocio es totalmente pura e independiente de la infraestructura.

### Ecosistema Tecnológico
* **Lenguaje principal**: TypeScript 5 con módulos nativos ESM (`"type": "module"`).
* **Gestor de paquetes**: `pnpm` workspaces (versión 9).
* **Capa de Frontend**: React 19, Vite, Tailwind CSS v3, Axios, Socket.io-client.
* **Capa de Backend**: Node.js, Fastify (rutas REST, middlewares, controladores rápidos), Socket.io (servidor WebSocket).
* **Persistencia de Datos**: PostgreSQL y Prisma ORM para persistencia real y estructurada.
* **Pruebas Automatizadas**: Vitest para pruebas unitarias e integración en todas las capas.
* **Orquestación**: Docker y Docker Compose para levantar el sistema completo en producción.

### Estructura de Carpetas

```
15-seconds/
├── package.json                    # Configuración raíz de dependencias y scripts
├── pnpm-workspace.yaml             # Definición de paquetes del monorepo
├── tsconfig.json                   # Configuración base de TypeScript
├── domain/                         # Capa de Dominio (Pura e independiente de infra)
│   └── src/
│       ├── entities/               # Entidades de negocio (User, Category, Game, etc.)
│       ├── use-cases/              # Reglas de negocio (createUser, startGame, etc.)
│       ├── services/               # Servicios del dominio puro (AuthService, etc.)
│       └── repositories/           # Puertos/Interfaces de Repositorios
├── apps/
│   ├── backend/                    # Capa del Servidor (Infraestructura de red y persistencia)
│   │   ├── prisma/                 # Esquema de base de datos y migraciones
│   │   └── src/
│   │       ├── controllers/        # Controladores de rutas HTTP REST
│   │       ├── repositories/       # Implementaciones reales (Prisma) e InMemory de los repositorios
│   │       └── websocket/          # Handlers y emisores de eventos WebSocket
│   └── frontend/                   # Capa del Cliente (Interfaz de usuario React 19)
│       └── src/
│           ├── pages/              # Páginas principales (Local, Lobby, GameRoom, Login)
│           ├── components/         # Componentes visuales reutilizables
│           └── services/           # Conectores de red y servicios API
```

---

## 🚀 Cómo Levantar el Proyecto

Puedes levantar el proyecto en modo de desarrollo local o mediante Docker para producción.

### Requisitos Previos
* Node.js v20 o superior
* pnpm v9
* Docker y Docker Compose

---

### Opción A: Modo de Desarrollo Local (Con conexión a base de datos PostgreSQL)

1. **Instalar dependencias**:
   Instala todas las dependencias del monorepo desde la raíz:
   ```bash
   pnpm install
   ```

2. **Levantar PostgreSQL en Docker**:
   Levanta únicamente el contenedor de la base de datos PostgreSQL:
   ```bash
   docker compose up -d postgres
   ```

3. **Configurar variables de entorno**:
   Copia el archivo de variables de entorno de ejemplo a `.env` tanto en la raíz como en el backend:
   ```bash
   cp .env.example .env
   cp .env apps/backend/.env
   ```

4. **Correr las migraciones de Prisma**:
   Aplica las migraciones para crear las tablas de `User` y `Category` en tu PostgreSQL:
   ```bash
   pnpm --filter @15-seconds/backend exec prisma migrate dev --name init
   ```

5. **Iniciar los servidores de desarrollo**:
   Levanta el frontend y backend en paralelo en modo *watch*:
   ```bash
   pnpm run dev
   ```
   * Accede al Frontend en: `http://localhost:5173`
   * Accede a la API del Backend en: `http://localhost:3000`

---

### Opción B: Producción Completa en un Solo Comando (Docker Compose)

Puedes levantar todo el ecosistema compilado y orquestado (Nginx actuando como Reverse Proxy en el puerto 80, Frontend estático, Backend Node de producción y PostgreSQL) con un solo comando:

```bash
docker compose up --build
```

Una vez que el build y los contenedores terminen de iniciar:
* Abre tu navegador en **`http://localhost`** para disfrutar del juego completo.
* La base de datos persistirá de forma segura en un volumen de Docker.

---

## 🧪 Pruebas y Validación

El proyecto cuenta con una sólida cobertura de pruebas mediante **Vitest** en todas sus capas:

* **Ejecutar todos los tests del monorepo**:
  ```bash
  pnpm test
  ```
* **Ejecutar tests en modo watch (desarrollo)**:
  ```bash
  pnpm --filter domain test:watch
  ```
* **Comprobar reglas de código y formateo (Linter)**:
  ```bash
  pnpm lint
  ```
* **Verificar tipado estático completo de TypeScript**:
  ```bash
  pnpm build
  ```
