import { developerConfig, DeveloperConfigParams } from './salesforce';

export * from './defaultFieldMapping';
export * as destinations from './destinations';
export * as internalIntegrations from './internalIntegrations';
export * from './retry_policy';
export * as salesforce from './salesforce';
export * from './schema';
export * as sources from './sources';

export function config(params: DeveloperConfigParams) {
  // eslint-disable-next-line no-console
  return console.log(JSON.stringify(developerConfig(params)));
}
