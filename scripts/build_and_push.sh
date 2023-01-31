#! /bin/bash

set -euo pipefail

if [ -z "${1-}" ]; then
  echo "usage: $0 <workspace_name>"
  exit 1
fi

WORKSPACE_NAME=$1

if [ "$WORKSPACE_NAME" = "api" ]; then
  # fetch the posthog api key from 1password and pass it as an arg
  # to the docker build

  eval "$(op signin supergrain)"

  POSTHOG_API_KEY=$(op get item dl4y3dryfib2huqpultgp7wlcq --fields credential)

  ADDITIONAL_ARGS="--build-arg POSTHOG_API_KEY=${POSTHOG_API_KEY}"
fi

# read version from package.json
VERSION=$(jq -r .version "apps/${WORKSPACE_NAME}/package.json")

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f "./apps/${WORKSPACE_NAME}/Dockerfile" \
  --tag "supaglue/${WORKSPACE_NAME}:${VERSION}" \
  --push \
  --label "org.opencontainers.image.source=https://github.com/supaglue-labs/supaglue" \
  ${ADDITIONAL_ARGS-} \
  .

# add a tag for latest if not pre-release
if [[ $VERSION != *"-"* ]]; then
  docker tag "ghcr.io/supaglue-labs/${WORKSPACE_NAME}:${VERSION}" "ghcr.io/supaglue-labs/${WORKSPACE_NAME}:latest"
  docker push "ghcr.io/supaglue-labs/${WORKSPACE_NAME}:latest"
fi
