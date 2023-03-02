FROM node:18-slim AS builder
WORKDIR /app
COPY . .
RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache yarn dlx turbo prune --scope=@supaglue/db --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18-slim AS runner
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY .yarnrc.build.yml .yarnrc.yml
COPY .yarn .yarn
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN --mount=type=cache,mode=0777,target=/app/.yarn/cache yarn workspaces focus @supaglue/db

CMD /bin/sh -c "yarn workspace @supaglue/db prisma migrate dev && yarn workspace @supaglue/db prisma db seed"
