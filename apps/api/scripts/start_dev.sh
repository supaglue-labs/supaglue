#! /bin/bash
set -euo pipefail

yarn workspace api install
yarn workspace api start
