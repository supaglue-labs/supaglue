#!/bin/bash

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../"

curl -s https://supaglue-public-config.s3.us-west-2.amazonaws.com/quickstart.env > "$ROOT_DIR/.env"

echo ".env created!"
