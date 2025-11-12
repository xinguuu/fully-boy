FROM node:22-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages/ ./packages/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/auth-service/ ./apps/auth-service/

RUN pnpm build --filter=@xingu/auth-service

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
