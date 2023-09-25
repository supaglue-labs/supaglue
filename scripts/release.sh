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

CHECKLY_API_KEY=$(op read op://engineering/2zhaab3p357nz7jtp5efssb6ce/credential)
CHECKLY_ACCOUNT_ID=$(op read op://engineering/2zhaab3p357nz7jtp5efssb6ce/username)

# get ids of checkly checks that should be successful
# paginate if we have more than 100 checks
PAGE=1
CHECKLY_CHECKS=()
while true; do
  CHECKS=$(curl -s -H "Authorization: Bearer $CHECKLY_API_KEY" -H "X-Checkly-Account: $CHECKLY_ACCOUNT_ID" "https://api.checklyhq.com/v1/checks?limit=100&page=${PAGE}" | jq -r '.[] | select((.tags[]? | contains("staging")) and (.activated == true) and (.muted == false) and (.shouldFail == false)) | .id')
  if [ "$CHECKS" == "" ]; then
    break
  fi
  PAGE=$((PAGE+1))
  CHECKLY_CHECKS+=($CHECKS)
done

# get ids of checkly checks that are failing
FAILING_CHECKS=$(curl -s -H "Authorization: Bearer $CHECKLY_API_KEY" -H "X-Checkly-Account: $CHECKLY_ACCOUNT_ID" https://api.checklyhq.com/v1/check-statuses | jq -rc '.[] | select(.hasFailures == true)')

FAILING_CHECK_OUTPUT=""

while read -r FAILING_CHECK; do
  CHECK_ID=($(echo $FAILING_CHECK | jq -r '.checkId'))
  if [[ " ${CHECKLY_CHECKS[@]} " =~ " ${CHECK_ID} " ]]; then
    FAILING_CHECK_OUTPUT+="* $(echo "$FAILING_CHECK" | jq -r .name)"$'\n'
  fi
done <<< "$FAILING_CHECKS"

if [ -n "$FAILING_CHECK_OUTPUT" ]; then
  echo
  echo "Failing staging Checkly checks found:"
  echo "$FAILING_CHECK_OUTPUT"
  echo "Aborting release due to failing staging Checkly checks."
  exit 1
fi

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
