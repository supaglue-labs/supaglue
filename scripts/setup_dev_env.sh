#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cp docker-compose.override.dev.yml docker-compose.override.yml
brew install bufbuild/buf/buf
"$DIR"/create_quickstart_env.sh

echo "SUPAGLUE_DATABASE_URL=postgres://postgres:supaglue@localhost:5432/postgres?schema=api" > $DIR/../packages/db/.env

echo "Done! Run 'docker-compose up' to start the dev environment."
