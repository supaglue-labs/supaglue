import fs from 'fs';
import OASNormalize from 'oas-normalize';
import path from 'path';

// get the path to the openapi spec from the command line
const openapiPath = process.argv[2];
const outputPath = process.argv[3];

// save the current working directory
const cwd = process.cwd();

// set current working directory to the directory containing the openapi spec
process.chdir(fs.realpathSync(path.dirname(openapiPath)));

const oas = new OASNormalize(path.basename(openapiPath), {
  colorizeErrors: true,
  enablePaths: true,
});
void (async () => {
  try {
    await oas.validate();
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error((err as Error).message);
    process.exit(1);
  }
  const api = await oas.bundle();

  // output the bundled spec to the specified path
  // change back to the original working directory
  process.chdir(cwd);
  fs.writeFileSync(outputPath, JSON.stringify(api, null, 2));
})();
