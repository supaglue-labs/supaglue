#!/bin/bash

set -euo pipefail

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

eval $(op signin --account supaglue.1password.com)

source $DIR/checkly.sh
check_checkly_checks

git checkout main
git pull

VERSION=$(jq -r '.version' package.json)

RELEASE_SHA=$(git rev-parse HEAD | cut -c1-7 | xargs -I{} echo "sha-{}")

docker buildx imagetools create supaglue/api:"$RELEASE_SHA" --tag supaglue/api:"$VERSION"

docker buildx imagetools create supaglue/sync-worker:"$RELEASE_SHA" --tag supaglue/sync-worker:"$VERSION"

git tag v"$VERSION"
git push origin --tags
