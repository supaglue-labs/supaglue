#!/bin/bash

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f ./docker/init/Dockerfile \
  --tag supaglue/init:latest \
  --label "org.opencontainers.image.source=https://github.com/supaglue-labs/supaglue" \
  --push \
  .
