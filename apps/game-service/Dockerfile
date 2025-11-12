FROM node:24-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY turbo.json ./
COPY tsconfig.json ./
COPY apps/game-service/package.json ./apps/game-service/
COPY packages/ ./packages/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/game-service/ ./apps/game-service/

RUN pnpm --filter=@xingu/database db:generate && \
    pnpm --filter=@xingu/shared build && \
    pnpm --filter=@xingu/database build && \
    pnpm --filter=@xingu/game-service build

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:nodejs /app/apps/game-service/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/apps/game-service/package.json ./
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/packages ./packages

USER expressjs

EXPOSE 3003

ENV PORT=3003

CMD ["node", "dist/index.js"]
