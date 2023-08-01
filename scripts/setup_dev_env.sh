#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cp docker-compose.override.dev.yml docker-compose.override.yml
brew install bufbuild/buf/buf
cp apps/mgmt-ui/.env.sample apps/mgmt-ui/.env
"$DIR"/create_quickstart_env.sh
