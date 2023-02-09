import { developerConfig, DeveloperConfigParams as DeveloperConfig } from './developer_config';

export * as customer from './customer';
export * from './field_mapping';
export * as internal from './internal';
export * from './retry_policy';
export * from './schema';
export * as syncConfigs from './sync_config';

export function config(params: DeveloperConfig) {
  // eslint-disable-next-line no-console
  return console.log(JSON.stringify(developerConfig(params)));
}
