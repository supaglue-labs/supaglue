#! /bin/bash

set -euo pipefail

if [ -z "${1-}" ]; then
  echo "usage: $0 <workspace_name>"
  exit 1
fi

WORKSPACE_NAME=$1

WORKSPACE_PATH=$(yarn workspaces list --json | jq -r "select(.name == \"${WORKSPACE_NAME}\") | .location")

. "${WORKSPACE_PATH}/.build.config.sh"

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

if [ "${WORKSPACE_NAME}" == "mgmt-ui" ]; then
  if [ -f "${WORKSPACE_PATH}/.env" ]; then
    mv "${WORKSPACE_PATH}/.env" "${WORKSPACE_PATH}/.env.user-bak"
    echo "Your apps/mgmt-ui/.env was set aside"
  fi
  cp "${WORKSPACE_PATH}/.env.build" "${WORKSPACE_PATH}/.env"
  clean_up () {
    if [ -f "${WORKSPACE_PATH}/.env" ]; then
      rm "${WORKSPACE_PATH}/.env"
    fi
    if [ -f "${WORKSPACE_PATH}/.env.user-bak" ]; then
      mv "${WORKSPACE_PATH}/.env.user-bak" "${WORKSPACE_PATH}/.env"
      echo "Restored your previous apps/mgmt-ui/.env"
    fi
  }

  trap clean_up EXIT
  trap clean_up SIGINT
fi

depot build --project "${DEPOT_PROJECT}" \
  --platform linux/amd64,linux/arm64 \
  -f "./${WORKSPACE_PATH}/Dockerfile" \
  --tag "supaglue/${WORKSPACE_NAME}:${VERSION}" \
  --tag "supaglue/${WORKSPACE_NAME}:latest" \
  --label "org.opencontainers.image.source=https://github.com/supaglue-labs/supaglue" \
  --push \
  ${ADDITIONAL_ARGS-} \
  .
