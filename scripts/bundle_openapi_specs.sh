#!/bin/bash

set -euo pipefail

APIS=(crm engagement mgmt actions metadata data enrichment marketing-automation)

for api in "${APIS[@]}"; do
    yarn tsx scripts/validate_and_bundle_openapi.ts "openapi/v2/$api/openapi.yaml" "openapi/v2/$api/openapi.bundle.json"
done
