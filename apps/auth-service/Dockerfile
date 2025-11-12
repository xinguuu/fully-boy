FROM node:24-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY turbo.json ./
COPY tsconfig.json ./
COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages/ ./packages/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/auth-service/ ./apps/auth-service/

RUN pnpm --filter=@xingu/database db:generate && \
    pnpm --filter=@xingu/shared build && \
    pnpm --filter=@xingu/database build && \
    pnpm --filter=@xingu/auth-service build

FROM base AS runner
ENV NODE_ENV=production

RUN apk add --no-cache curl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/auth-service/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/auth-service/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages

USER nestjs

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/main.js"]
