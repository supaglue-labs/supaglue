#/bin/bash

swagger-codegen generate -i ../../openapi/crm/openapi.bundle.json -l java -o ./java

swagger-codegen generate -i ../../openapi/crm/openapi.bundle.json -l python -o ./python

swagger-codegen generate -i ../../openapi/crm/openapi.bundle.json -l typescript-axios -o ./typescript
