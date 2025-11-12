FROM node:24-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY turbo.json ./
COPY tsconfig.json ./
COPY apps/result-service/package.json ./apps/result-service/
COPY packages/ ./packages/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/result-service/ ./apps/result-service/

RUN pnpm --filter=@xingu/database db:generate && \
    pnpm --filter=@xingu/shared build && \
    pnpm --filter=@xingu/database build && \
    pnpm --filter=@xingu/result-service build

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:nodejs /app/apps/result-service/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/apps/result-service/package.json ./
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/packages ./packages

USER expressjs

EXPOSE 3006

ENV PORT=3006

CMD ["node", "dist/index.js"]
