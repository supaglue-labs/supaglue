#!/bin/bash

set -euo pipefail

APPS=(api sync-worker salesforce-pub-sub)
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ -z "${1-}" ]; then
  echo "usage: $0 <version>"
  exit 1
fi

VERSION=$1

# check $HOME/.docker/config.json if we are logged into docker hub
# if not, then fail
if ! grep -q "https://index.docker.io/v1/" "$HOME/.docker/config.json"; then
  echo "Not logged into Docker Hub. Please run 'docker login' and try again."
  exit 1
fi

# check if  ~/.sentryclirc exists, if not fail
if [ ! -f "$HOME/.sentryclirc" ]; then
  cat <<EOF
Not logged into Sentry. Please go to https://sentry.io/settings/account/api/auth-tokens/, create a token and add it to your ~/.sentryclirc:

[auth]
token=your-auth-token
EOF
  exit 1
fi

echo "Logging into 1password..."
eval $(op signin --account supaglue.1password.com)

git checkout main
git pull

VERSION=$(jq -r '.version' package.json)

# build each app in APPS
for APP_NAME in "${APPS[@]}"; do
  WORKSPACE_PATH=$(yarn workspaces list --json | jq -r "select(.name == \"${APP_NAME}\") | .location")

  echo "Building and pushing $APP_NAME"
  yarn dlx --package @sentry/cli sentry-cli releases new --project "$APP_NAME" --org supaglue "$VERSION"
  yarn turbo run build --filter="${APP_NAME}..."
  yarn dlx --package @sentry/cli sentry-cli releases files --project "$APP_NAME" --org supaglue "$VERSION" upload-sourcemaps "${WORKSPACE_PATH}/dist"
  "${DIR}/build_and_push.sh" "$APP_NAME"
  yarn dlx --package @sentry/cli sentry-cli releases finalize --project "$APP_NAME" --org supaglue "$VERSION"
done


echo "Building and pushing mgmt-ui"
"${DIR}/build_and_push.sh" mgmt-ui

git tag v"$VERSION"
git push origin --tags
