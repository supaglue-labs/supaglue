FROM node:18-bullseye-slim AS base

FROM base AS builder
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache turbo prune --scope=api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
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

RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache yarn workspace @supaglue/db prisma generate
RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache yarn workspace api ts-patch install -s
RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache --mount=type=secret,id=TURBO_TOKEN --mount=type=secret,id=TURBO_TEAM \
    TURBO_TOKEN=$(cat /run/secrets/TURBO_TOKEN) TURBO_TEAM=$(cat /run/secrets/TURBO_TEAM) yarn turbo run build --filter=api...
RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache yarn workspaces focus --production api

FROM base AS runner
RUN apt-get update && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/* && apt-get clean
WORKDIR /app

ARG POSTHOG_API_KEY
ENV SUPAGLUE_POSTHOG_API_KEY=$POSTHOG_API_KEY

COPY --from=installer /app/apps/api/dist .
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/api/package.json .
COPY --from=installer /app/packages/core/dist ./node_modules/@supaglue/core
COPY --from=installer /app/packages/utils/dist ./node_modules/@supaglue/utils
COPY --from=installer /app/packages/types/dist ./node_modules/@supaglue/types
COPY --from=installer /app/packages/db/dist ./node_modules/@supaglue/db
COPY --from=installer /app/packages/db/node_modules ./node_modules/@supaglue/db/node_modules
COPY --from=installer /app/packages/db/prisma ./prisma
COPY --from=installer /app/packages/sync-workflows/dist ./node_modules/@supaglue/sync-workflows
COPY --from=installer /app/openapi ./openapi

CMD node ./index.js
