FROM node:22-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package*.json ./
COPY turbo.json ./
COPY apps/game-service/package*.json ./apps/game-service/
COPY packages/ ./packages/

RUN npm ci

COPY apps/game-service/ ./apps/game-service/

RUN npm run build --filter=@xingu/game-service

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:nodejs /app/apps/game-service/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/apps/game-service/package*.json ./
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/packages ./packages

USER expressjs

EXPOSE 3003

ENV PORT=3003

CMD ["node", "dist/index.js"]
