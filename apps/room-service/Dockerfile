FROM node:22-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY apps/room-service/package.json ./apps/room-service/
COPY packages/ ./packages/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/room-service/ ./apps/room-service/

RUN pnpm build --filter=@xingu/room-service

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:nodejs /app/apps/room-service/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/apps/room-service/package.json ./
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/packages ./packages

USER expressjs

EXPOSE 3004

ENV PORT=3004

CMD ["node", "dist/index.js"]
