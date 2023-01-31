#! /bin/bash
set -euo pipefail

yarn workspace api install
yarn workspace api prisma migrate deploy
yarn workspace api start
