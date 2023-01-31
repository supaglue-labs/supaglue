FROM node:18-slim AS builder
# Set working directory
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/app/.yarn/cache yarn dlx turbo prune --scope=sample-app --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18-slim AS installer
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY .yarnrc.yml .yarnrc.yml
COPY .yarn .yarn
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN --mount=type=cache,target=/app/.yarn/cache yarn install --immutable

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

WORKDIR /app/apps/sample-app
RUN --mount=type=cache,target=/app/.yarn/cache yarn dlx prisma generate

WORKDIR /app
RUN --mount=type=cache,target=/app/.yarn/cache yarn dlx turbo run build --filter=sample-app...

FROM node:18-slim AS runner
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/* && apt-get clean
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/sample-app/next.config.js .
COPY --from=installer /app/apps/sample-app/package.json .

# Leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/sample-app/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/sample-app/.next/static ./apps/sample-app/.next/static

COPY --from=installer /app/apps/sample-app/prisma ./prisma

CMD node apps/sample-app/server.js
