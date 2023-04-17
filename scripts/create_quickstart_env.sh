#!/bin/bash

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../"

curl -s https://d379ao5oasu7j7.cloudfront.net/quickstart.env > "$ROOT_DIR/.env"

echo ".env created!"
