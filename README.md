# TickPanic

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

Un jugador crea una sala y comparte el código. El resto se une. A diferencia del modo local (que consta de 5 rondas), el modo multijugador online consta de **3 rondas** (con límites de tiempo de 5s, 4s y 3s, respectivamente). En cada turno de cada ronda, el jugador puede enviar **múltiples respuestas** (hasta el límite de cantidad marcado por el tiempo disponible de esa ronda: 5 respuestas en la ronda 1, 4 en la 2, y 3 en la 3). Además, se ha reducido el requisito de categorías mínimas de 5 a 3 para agilizar el inicio de partidas online.

El servidor es la única fuente de verdad: controla el cronómetro, valida las respuestas y calcula el puntaje. Las respuestas que llegan tarde (cuyo envío exceda el límite del turno) son rechazadas automáticamente. Todo vía WebSockets.

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
tick-panic/
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
pnpm --filter @tick-panic/backend exec prisma migrate dev --name init

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

---

## Reflexión sobre el Proceso de Desarrollo y Buenas Prácticas (Evolución Histórica)

### 1. ¿Cómo la Arquitectura Limpia y TDD ayudaron a mantener un código limpio a lo largo del proyecto?
La historia completa del desarrollo de este proyecto demuestra la inmensa utilidad de estas metodologías en cada una de sus fases evolutivas:
- **Fase Inicial (Diseño de Entidades y Servicios de Dominio)**: El proyecto inició puramente en `domain/` estableciendo la base de datos conceptual del juego (Player, Category, Game) y sus servicios críticos (AuthService, ScoreService, RankingService, GameTimerService) enteramente bajo el flujo de **TDD**. Esto nos permitió diseñar reglas robustas y lógicas matemáticas sólidas (como la escala de tiempo `6 - round` y la prevención de puntajes negativos) antes de escribir una sola línea de código de red o interfaz.
- **Fase de Integración de Infraestructura (Full-stack & Websockets)**: Cuando llegó el momento de añadir la base de datos Postgres/Prisma, el servidor Fastify y la comunicación en tiempo real con Socket.io, la **Arquitectura Limpia** brilló con luz propia. Como el dominio estaba totalmente desacoplado y no dependía de la infraestructura de red ni persistencia, pudimos implementar los controladores HTTP, los eventos de WebSocket y el ciclo de turnos alternados sin alterar una sola entidad ni romper las reglas de negocio preexistentes. El servidor actúa simplemente como un árbitro que coordina los use-cases puros de dominio.
- **Fase de Adaptación y Nuevas Reglas (El estado actual)**: Recientemente, al redefinir las mecánicas multijugador online (pasar de 5 a 3 rondas, reducir el requisito mínimo de categorías de 5 a 3 y habilitar múltiples respuestas consecutivas por turno), la combinación de Arquitectura Limpia y TDD sirvió de red de seguridad. Modificar las reglas en el dominio fue directo, y la batería de más de 280 pruebas unitarias e integración en cascada nos alertó al instante sobre qué componentes y controladores del backend o del frontend se veían impactados. Esto nos permitió hacer la transición de forma segura sin romper la lógica del juego local.

### 2. Dificultades del proceso y cómo se resolvieron
- **Lo más desafiante**: 
  - La adaptación de las pruebas preexistentes que dependían de simulaciones de partidas a 5 rondas completas (como `endGame.test.ts` y `nextTurn.test.ts`). Estos tests realizaban aserciones complejas sobre el final del juego o empates.
  - **El contador de las rondas**: Aunque parecía un cambio sumamente sencillo e inofensivo de implementar, la parametrización dinámica del indicador del total de rondas en el temporizador (`TimerDisplay.tsx`) presentó múltiples bugs y sutiles inconsistencias entre el flujo multijugador online (3 rondas) y el modo local (5 rondas). Costó bastante trabajo de depuración asegurar que ambos modos convivieran perfectamente.
- **Resolución**: Requirió una lectura atenta de los flujos de las pruebas preexistentes para mapear los bucles de 5 rondas y aserciones de error al nuevo límite de 3 rondas y categorías mínimas, además de desacoplar por completo el total de rondas en el componente visual del temporizador, garantizando su flexibilidad por medio de props parametrizadas.

### 3. Descubrimientos de último momento (UX y consistencia visual)
Cuando la lógica de negocio y las pruebas principales estaban en verde, surgieron dos detalles críticos al probar la interfaz de usuario:
1. **La Optimización del Foco al Escribir**: Al presionar Enter, el campo de entrada (`AnswerInput.tsx`) se deshabilitaba brevemente por el estado `submitting`. Esto provocaba que el navegador le quitara el foco (`blur`) al input, interrumpiendo la escritura fluida de múltiples respuestas seguidas. Se resolvió eliminando el bloqueo en el input para que el cursor permanezca enfocado todo el tiempo, permitiendo envíos ultrarápidos en ráfaga.
2. **El Temporizador de Rondas**: `TimerDisplay.tsx` tenía el total de rondas hardcodeado como "de 5". En el modo online a 3 rondas, mostraba "ronda X de 5", lo cual era inconsistente. Lo resolvimos parametrizando `totalRounds` dinámicamente en el componente para que muestre "de 3" en online y mantenga "de 5" en el modo local de manera limpia.

---

## Consideraciones para Hosting y Despliegue en Producción

### 1. Características para Hostear Docker Compose en un Servidor
Para desplegar esta aplicación en un servidor de producción (por ejemplo, una instancia VPS en AWS, DigitalOcean o Hetzner), debemos considerar:
- **Puertos expuestos**: En producción no debemos abrir los puertos internos de la base de datos o de las APIs directamente a internet. Solo el puerto HTTP (80) y HTTPS (443) deben ser accesibles externamente.
- **Persistencia de Datos**: El volumen de base de datos SQLite/PostgreSQL debe configurarse correctamente apuntando a un directorio seguro en el host para asegurar que los datos no se pierdan al reconstruir los contenedores.
- **Políticas de Reinicio**: Configurar `restart: always` o `unless-stopped` en cada servicio del `docker-compose.yml` para garantizar que la app se recupere automáticamente ante fallos del servidor o del proceso.

### 2. Dominio y Certificados HTTPS (SSL/TLS)
- Es mandatorio que todo el tráfico viaje encriptado (HTTPS) para proteger credenciales y sesiones WebSocket.
- **Let's Encrypt y Renovación**: Se pueden generar certificados gratuitos de Let's Encrypt de forma automática utilizando **Certbot** o delegándolos en reverse proxies con automatización SSL integrada como **Caddy** o **Traefik**.
- **Configuración en Compose**: El contenedor de Nginx del docker-compose se configura para escuchar en el puerto 443, apuntando los certificados generados al bloque de configuración de servidores TLS, y redirigiendo automáticamente todo el tráfico del puerto 80 (HTTP) hacia el 443 (HTTPS).

### 3. Manejo de Secretos y Configuración Segura
- **No subir secretos**: Los archivos `.env` reales con contraseñas de bases de datos, claves JWT o credenciales sensibles jamás deben subirse al repositorio Git.
- **Inyección segura**: En el servidor de producción, las variables sensibles deben inyectarse mediante:
  1. Configuración manual del archivo `.env` local en la máquina host con permisos restringidos (`chmod 600 .env`).
  2. Uso de **Docker Secrets** o variables inyectadas de forma segura desde la herramienta de CI/CD (GitHub Actions, GitLab Secrets).
  3. Gestores de llaves en la nube (AWS Secrets Manager, HashiCorp Vault).

### 4. ¿Qué es un Reverse Proxy?
Un **Reverse Proxy** (como Nginx, Caddy o Traefik) es un servidor intermedio que recibe las peticiones de los clientes desde internet y las distribuye a los contenedores internos apropiados.
- **Funciones en este proyecto**:
  - Escucha las peticiones públicas en los puertos 80 y 443.
  - Dirige las peticiones de la API (`/api/*`) y conexiones en tiempo real (`/socket.io/*`) de forma segura hacia el backend Fastify.
  - Sirve de manera eficiente los archivos estáticos HTML/JS/CSS del frontend React sin saturar el backend de Node.js.
  - Se encarga de la **terminación SSL/TLS** (descifrar la conexión HTTPS y enviar tráfico HTTP plano dentro de la red privada de Docker, reduciendo el consumo de CPU de la app de Node.js).
  - Oculta la topología interna del servidor, actuando como una capa de defensa contra ataques externos.

