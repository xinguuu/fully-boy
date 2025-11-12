FROM node:22-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY apps/ws-service/package.json ./apps/ws-service/
COPY packages/ ./packages/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/ws-service/ ./apps/ws-service/

RUN pnpm build --filter=@xingu/ws-service

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
