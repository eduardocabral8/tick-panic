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

RUN cd apps/backend && npx prisma generate
RUN pnpm --filter @tick-panic/domain build
RUN pnpm --filter @tick-panic/backend build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/domain/node_modules ./domain/node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/domain/dist ./domain/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY domain/package.json ./domain/
COPY apps/backend/package.json ./apps/backend/
COPY package.json pnpm-workspace.yaml ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

WORKDIR /app/apps/backend

CMD ["node", "dist/main.js"]
