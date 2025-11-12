FROM node:24-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY turbo.json ./
COPY tsconfig.json ./
COPY apps/template-service/package.json ./apps/template-service/
COPY packages/ ./packages/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/template-service/ ./apps/template-service/

RUN pnpm --filter=@xingu/database db:generate && \
    pnpm --filter=@xingu/shared build && \
    pnpm --filter=@xingu/database build && \
    pnpm --filter=@xingu/template-service build

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:nodejs /app/apps/template-service/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/apps/template-service/package.json ./
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/packages ./packages

USER expressjs

EXPOSE 3002

ENV PORT=3002

CMD ["node", "dist/index.js"]
