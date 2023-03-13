#! /bin/bash

set -euo pipefail

if [ -z "${1-}" ]; then
  echo "usage: $0 <workspace_name>"
  exit 1
fi

WORKSPACE_NAME=$1

WORKSPACE_PATH=$(yarn workspaces list --json | jq -r "select(.name == \"${WORKSPACE_NAME}\") | .location")

# fetch the posthog api key from 1password and pass it as an arg
# to the docker build

eval "$(op signin supaglue)"

POSTHOG_API_KEY=$(op get item dl4y3dryfib2huqpultgp7wlcq --fields credential)

ADDITIONAL_ARGS="--build-arg POSTHOG_API_KEY=${POSTHOG_API_KEY}"

# read version from package.json
VERSION=$(jq -r .version "${WORKSPACE_PATH}/package.json")

depot build --project 2bljgst1rr \
  --platform linux/amd64,linux/arm64 \
  -f "./${WORKSPACE_PATH}/Dockerfile" \
  --tag "supaglue/${WORKSPACE_NAME}:${VERSION}" \
  --tag "supaglue/${WORKSPACE_NAME}:latest" \
  --label "org.opencontainers.image.source=https://github.com/supaglue-labs/supaglue" \
  --push \
  ${ADDITIONAL_ARGS-} \
  .
