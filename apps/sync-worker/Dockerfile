FROM node:18-bullseye-slim AS builder
WORKDIR /app
COPY . .
RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache yarn dlx turbo prune --scope=sync-worker --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18-bullseye-slim AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY .yarnrc.build.yml .yarnrc.yml
COPY .yarn .yarn
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache yarn install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY openapi ./openapi
COPY scripts ./scripts
COPY turbo.json turbo.json
COPY tsconfig.json tsconfig.json

RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache yarn workspace @supaglue/db prisma generate
RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache yarn dlx turbo run build --filter=sync-worker...
RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache yarn workspaces focus --production sync-worker

FROM node:18-bullseye-slim AS runner
RUN apt-get update && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/* && apt-get clean
WORKDIR /app

ARG POSTHOG_API_KEY
ENV SUPAGLUE_POSTHOG_API_KEY=$POSTHOG_API_KEY

COPY --from=installer /app/apps/sync-worker/dist .
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/sync-worker/package.json .
COPY --from=installer /app/packages/core/dist ./node_modules/@supaglue/core
COPY --from=installer /app/packages/utils/dist ./node_modules/@supaglue/utils
COPY --from=installer /app/packages/types/dist ./node_modules/@supaglue/types
COPY --from=installer /app/packages/db/dist ./node_modules/@supaglue/db
COPY --from=installer /app/packages/db/node_modules ./node_modules/@supaglue/db/node_modules
COPY --from=installer /app/packages/db/prisma ./prisma
COPY --from=installer /app/packages/sync-workflows/dist ./node_modules/@supaglue/sync-workflows

CMD node ./index.js
