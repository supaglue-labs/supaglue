#!/bin/bash

set -euo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ -z "${1-}" ]; then
  echo "usage: $0 [--skip-tests]"
  exit 1
fi


SKIP_TESTS=false

# Check for the --skip_tests flag
if [ "${1-}" == "--skip-tests" ]; then
  SKIP_TESTS="true"
fi

APPS=(api sync-worker)

# check $HOME/.docker/config.json if we are logged into docker hub
# if not, then fail
if ! grep -q "https://index.docker.io/v1/" "$HOME/.docker/config.json"; then
  echo "Not logged into Docker Hub. Please run 'docker login' and try again."
  exit 1
fi

source $DIR/helpers.sh
if [ "$SKIP_TESTS" == "false" ]; then
  # check_checkly_checks
  check_github_checks
fi

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
  echo "Building and pushing $APP_NAME"
  docker buildx imagetools create supaglue/"$APP_NAME":"$RELEASE_SHA" --tag supaglue/"$APP_NAME":"$VERSION"
done

docker buildx imagetools create supaglue/sync-worker:"$RELEASE_SHA" --tag supaglue/sync-worker:"$VERSION"

git tag v"$VERSION"
git push origin --tags

notify_release $VERSION
