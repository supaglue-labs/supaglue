#! /bin/bash
set -euo pipefail

yarn workspace sample-app install
yarn workspace sample-app prisma migrate deploy
yarn workspace sample-app prisma db seed
yarn workspace sample-app dev
