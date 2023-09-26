#!/bin/bash

set -euo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ -z "${1-}" ]; then
  echo "usage: $0 <version>"
  exit 1
fi

OLD_VERSION=$(jq -r .version ./package.json)
VERSION=$1

# fail if not clean working directory
if [ -n "$(git status --porcelain)" ]; then
  echo "Working directory not clean. Please stash all changes before running this script."
  exit 1
fi

source $DIR/checkly.sh
check_checkly_checks

echo "Release version: ${VERSION}"

echo "Checking out latest main branch..."
git checkout main
git pull origin main
git checkout -b "release/${VERSION}"

echo "Installing dependencies..."
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
yarn install > /dev/null

echo "Updating package.json versions (except docs)..."
yarn workspaces foreach --all --exclude docs version "$VERSION" > /dev/null

echo "Updating versions in other files..."
# escape `.` in OLD_VERSION since we are using it as a regex
OLD_VERSION_ESCAPED=$(echo $OLD_VERSION | sed 's/\./\\./g')
find . -type d -name node_modules -prune -o -path ./docs/versions.json -prune -o -name "package\.json" -prune -o -type d -path ./docs/versioned_docs -prune -o -name "openapi\.bundle\.json" -prune -o \( -name '*\.yml' -o -name '*\.yaml' -o -name '*\.json' -o -name '*\.mdx' -o -name '*\.md' \) -print0 | xargs -0 sed -I '' -e "s/${OLD_VERSION_ESCAPED}/${VERSION}/g"

echo "Versioning docs..."
yarn workspace docs docusaurus docs:version "$VERSION" > /dev/null
yarn workspace docs version "$VERSION" > /dev/null

echo "Running yarn generate..."
yarn generate > /dev/null

echo "Deleting old docs..."
OLD_DOCS_VERSIONS=$(jq -r '.[]' docs/versions.json | tail -n +3)
for OLD_DOCS_VERSION in $OLD_DOCS_VERSIONS; do
  rm -rf "docs/versioned_docs/version-${OLD_DOCS_VERSION}"
  rm "docs/versioned_sidebars/version-${OLD_DOCS_VERSION}-sidebars.json"
done
jq '.[0:2]' docs/versions.json > docs/versions.json.tmp && mv docs/versions.json.tmp docs/versions.json

echo "Committing changes..."
git add -A
git commit -m "chore: release $VERSION"

echo "Creating a pull request..."
gh pr create --fill --web

echo "Done!"
echo "Please review the changes and merge the pull request, then move on to running ./scripts/release.sh"
