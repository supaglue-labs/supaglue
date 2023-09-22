FROM node:18-bullseye-slim AS base

FROM base AS builder
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN --mount=type=cache,target=/app/.yarn/cache turbo prune --scope=mgmt-ui --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/* && apt-get clean

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY .yarnrc.build.yml .yarnrc.yml
COPY .yarn .yarn
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN --mount=type=cache,target=/app/.yarn/cache yarn install

# Build the project
COPY --from=builder /app/out/full/ .
COPY scripts/validate_and_bundle_openapi.ts scripts/validate_and_bundle_openapi.ts
COPY scripts/bundle_openapi_specs.sh scripts/bundle_openapi_specs.sh
COPY openapi openapi

RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache --mount=type=secret,id=TURBO_TOKEN --mount=type=secret,id=TURBO_TEAM \
    TURBO_TOKEN=$(cat /run/secrets/TURBO_TOKEN) TURBO_TEAM=$(cat /run/secrets/TURBO_TEAM) yarn turbo run build --filter=mgmt-ui...

FROM base AS runner
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/* && apt-get clean
WORKDIR /app

COPY --from=installer /app/apps/mgmt-ui/next.config.js .
COPY --from=installer /app/apps/mgmt-ui/package.json .

# Leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer /app/apps/mgmt-ui/.next/standalone ./
COPY --from=installer /app/apps/mgmt-ui/.next/static ./apps/mgmt-ui/.next/static

CMD node apps/mgmt-ui/server.js
