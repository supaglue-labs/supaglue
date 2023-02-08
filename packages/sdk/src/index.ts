import { developerConfig, DeveloperConfigParams } from './salesforce';

export * from './defaultFieldMapping';
export * as destinations from './destinations';
export * from './retry_policy';
export * as salesforce from './salesforce';
export * from './schema';

export function config(params: DeveloperConfigParams) {
  // eslint-disable-next-line no-console
  return console.log(JSON.stringify(developerConfig(params)));
}
