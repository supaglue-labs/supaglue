#/bin/bash

swagger-codegen generate -i ../../openapi/crm/openapi.bundle.json -l java -o ./java --additional-properties=hideGenerationTimestamp=true

swagger-codegen generate -i ../../openapi/crm/openapi.bundle.json -l python -o ./python

swagger-codegen generate -i ../../openapi/crm/openapi.bundle.json -l typescript-axios -o ./typescript
