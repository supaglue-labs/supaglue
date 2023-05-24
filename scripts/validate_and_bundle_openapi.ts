import SwaggerParser from '@apidevtools/swagger-parser';
import fs from 'fs';

// get the path to the openapi spec from the command line
const openapiPath = process.argv[2];
const outputPath = process.argv[3];

void (async () => {
  try {
    await SwaggerParser.validate(openapiPath);
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error((err as Error).message);
    process.exit(1);
  }
  const api = await SwaggerParser.dereference(openapiPath, { dereference: { circular: false } });
  console.log('xxx', api);
  // output the bundled spec to the specified path
  fs.writeFileSync(outputPath, JSON.stringify(api, null, 2));
})();
