#!/bin/bash

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../"

cp "$ROOT_DIR/.env.sample" "$ROOT_DIR/.env"
curl -s https://supaglue-public-config.s3.us-west-2.amazonaws.com/sample-app.env >> "$ROOT_DIR/.env"

echo "Done!"
