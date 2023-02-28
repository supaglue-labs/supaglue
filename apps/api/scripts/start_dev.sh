#! /bin/bash
set -euo pipefail

yarn workspace api install
yarn workspace @supaglue/core prisma migrate deploy
yarn workspace @supaglue/core prisma db seed
yarn workspace api start
