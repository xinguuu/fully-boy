FROM node:24-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY turbo.json ./
COPY tsconfig.json ./
COPY apps/ws-service/package.json ./apps/ws-service/
COPY packages/ ./packages/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/ws-service/ ./apps/ws-service/

RUN pnpm --filter=@xingu/database db:generate && \
    pnpm --filter=@xingu/shared build && \
    pnpm --filter=@xingu/database build && \
    pnpm --filter=@xingu/ws-service build

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 socketio

COPY --from=builder --chown=socketio:nodejs /app/apps/ws-service/dist ./dist
COPY --from=builder --chown=socketio:nodejs /app/apps/ws-service/package.json ./
COPY --from=builder --chown=socketio:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=socketio:nodejs /app/packages ./packages

USER socketio

EXPOSE 3005

ENV PORT=3005

CMD ["node", "dist/index.js"]
