# Backend Dockerfile
# Multi-stage build for the monorepo

FROM node:20-alpine AS builder

RUN npm install -g pnpm@9.0.0

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY domain/package.json ./domain/
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile

COPY domain/ ./domain/
COPY apps/backend/ ./apps/backend/

RUN pnpm --filter @15-seconds/domain build
RUN pnpm --filter @15-seconds/backend build

FROM node:20-alpine AS production

RUN npm install -g pnpm@9.0.0

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY domain/package.json ./domain/
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/domain/dist ./domain/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY domain/package.json ./domain/
COPY apps/backend/package.json ./apps/backend/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

WORKDIR /app/apps/backend

CMD ["node", "dist/main.js"]
