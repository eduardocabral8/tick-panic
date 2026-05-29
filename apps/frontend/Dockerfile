# Frontend Dockerfile
# Multi-stage: build static files → serve with nginx

FROM node:20-alpine AS builder

RUN npm install -g pnpm@9.0.0

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY domain/package.json ./domain/
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY domain/ ./domain/
COPY apps/frontend/ ./apps/frontend/

RUN pnpm --filter @tick-panic/domain build
RUN pnpm --filter @tick-panic/frontend build

FROM nginx:alpine

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
