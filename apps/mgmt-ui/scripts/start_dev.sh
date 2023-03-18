#! /bin/bash
set -euo pipefail

yarn workspace mgmt-ui install
yarn workspace mgmt-ui dev
