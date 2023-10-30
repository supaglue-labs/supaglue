#!/bin/bash

set -euo pipefail

APIS=(crm engagement mgmt actions metadata data enrichment marketing-automation ticketing)

for api in "${APIS[@]}"; do
    echo "Bundling openapi/v2/$api/openapi.yaml"
    yarn tsx scripts/validate_and_bundle_openapi.ts "openapi/v2/$api/openapi.yaml" "openapi/v2/$api/openapi.bundle.json"
    echo "Validating openapi/v2/$api/openapi.bundle.json"
    set +eo pipefail
    yarn vacuum lint "openapi/v2/$api/openapi.bundle.json" || echo "openapi/v2/$api/openapi.bundle.json is not valid. Run yarn vacuum html-report openapi/v2/$api/openapi.bundle.json to see the errors."
    set -eo pipefail
done
