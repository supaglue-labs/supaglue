#/bin/bash

swagger-codegen generate -i ../../openapi/crm/openapi.bundle.json -l java -o ./crm/java --additional-properties=hideGenerationTimestamp=true

swagger-codegen generate -i ../../openapi/crm/openapi.bundle.json -l python -o ./crm/python

swagger-codegen generate -i ../../openapi/crm/openapi.bundle.json -l typescript-axios -o ./crm/typescript

swagger-codegen generate -i ../../openapi/mgmt/openapi.bundle.json -l java -o ./mgmt/java --additional-properties=hideGenerationTimestamp=true

swagger-codegen generate -i ../../openapi/mgmt/openapi.bundle.json -l python -o ./mgmt/python

swagger-codegen generate -i ../../openapi/mgmt/openapi.bundle.json -l typescript-axios -o ./mgmt/typescript
