#!/bin/bash

set -euo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

APPS=(api sync-worker)

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

source $DIR/checkly.sh
check_checkly_checks

git checkout main
git pull

if ! git log -1 --pretty=%B | grep -q "chore: release"; then
  echo "Commit message at main must start with 'chore: release' to be able to trigger a release"
  exit 1
fi

VERSION=$(jq -r '.version' package.json)

RELEASE_SHA=$(git rev-parse HEAD | cut -c1-7 | xargs -I{} echo "sha-{}")

# build each app in APPS
for APP_NAME in "${APPS[@]}"; do
  WORKSPACE_PATH=$(yarn workspaces list --json | jq -r "select(.name == \"${APP_NAME}\") | .location")

  echo "Building and pushing $APP_NAME"
  yarn dlx --package @sentry/cli sentry-cli releases new --project "$APP_NAME" --org supaglue "$VERSION"
  yarn turbo run build --filter="${APP_NAME}..."
  yarn dlx --package @sentry/cli sentry-cli releases files --project "$APP_NAME" --org supaglue "$VERSION" upload-sourcemaps "${WORKSPACE_PATH}/dist"
  docker buildx imagetools create supaglue/"$APP_NAME":"$RELEASE_SHA" --tag supaglue/"$APP_NAME":"$VERSION"
  yarn dlx --package @sentry/cli sentry-cli releases finalize --project "$APP_NAME" --org supaglue "$VERSION"
done

docker buildx imagetools create supaglue/sync-worker:"$RELEASE_SHA" --tag supaglue/sync-worker:"$VERSION"

git tag v"$VERSION"
git push origin --tags
