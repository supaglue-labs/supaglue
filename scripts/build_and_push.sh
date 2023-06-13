#! /bin/bash

set -euo pipefail

if [ -z "${1-}" ]; then
  echo "usage: $0 <workspace_name>"
  exit 1
fi

clean_up () {
    mv "${WORKSPACE_PATH}/.env.user-bak" "${WORKSPACE_PATH}/.env"
    echo "Restored your previous apps/mgmt-ui/.env"
    exit 1
}

WORKSPACE_NAME=$1

WORKSPACE_PATH=$(yarn workspaces list --json | jq -r "select(.name == \"${WORKSPACE_NAME}\") | .location")

# fetch the posthog api key from 1password and pass it as an arg
# to the docker build

if [ "$(op -v | cut -d. -f1)" -lt 2 ]; then
  echo "op version must be >= 2.0.0"
  echo "run: brew update && brew upgrade 1password-cli"
  exit 1
fi

eval "$(op signin --account supaglue.1password.com)"

POSTHOG_API_KEY=$(op read op://engineering/dl4y3dryfib2huqpultgp7wlcq/credential)

ADDITIONAL_ARGS="--build-arg POSTHOG_API_KEY=${POSTHOG_API_KEY}"

# read version from package.json
VERSION=$(jq -r .version "${WORKSPACE_PATH}/package.json")

if [ $WORKSPACE_NAME == "mgmt-ui" ]; then
  echo "Setting aside your apps/mgmt-ui/.env and using apps/mgmt-ui/.env.build"
  mv "${WORKSPACE_PATH}/.env" "${WORKSPACE_PATH}/.env.user-bak"
  cp "${WORKSPACE_PATH}/.env.build" "${WORKSPACE_PATH}/.env"
  trap clean_up EXIT
fi

depot build --project 2bljgst1rr \
  --platform linux/amd64,linux/arm64 \
  -f "./${WORKSPACE_PATH}/Dockerfile" \
  --tag "supaglue/${WORKSPACE_NAME}:${VERSION}" \
  --tag "supaglue/${WORKSPACE_NAME}:latest" \
  --label "org.opencontainers.image.source=https://github.com/supaglue-labs/supaglue" \
  --push \
  ${ADDITIONAL_ARGS-} \
  .

if [ $WORKSPACE_NAME == "mgmt-ui" ]; then
  echo "Restored your previous apps/mgmt-ui/.env"
  mv "${WORKSPACE_PATH}/.env.user-bak" "${WORKSPACE_PATH}/.env"
fi
