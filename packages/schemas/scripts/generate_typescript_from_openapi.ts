import { promises as fs } from 'fs';
import openapiTS from 'openapi-typescript';
import path from 'path';

// get input and output from the command line
const openapiPath = process.argv[2];
const outputPath = process.argv[3];

void (async () => {
  const schema = await fs.readFile(path.join(process.cwd(), openapiPath), 'utf8'); // must be OpenAPI JSON
  const output = await openapiTS(JSON.parse(schema), {
    transform(schemaObject, metadata): string | void {
      if ('format' in schemaObject && schemaObject.format === 'date-time') {
        if ('nullable' in schemaObject && schemaObject.nullable) {
          return 'Date | null';
        }
        return 'Date';
      }
    },
    supportArrayLength: true,
  });
  await fs.writeFile(path.join(process.cwd(), outputPath), output);
})();
