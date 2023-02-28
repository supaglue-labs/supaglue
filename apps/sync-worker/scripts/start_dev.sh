#! /bin/bash
set -euo pipefail

yarn workspace sync-worker install
yarn workspace sync-worker start
