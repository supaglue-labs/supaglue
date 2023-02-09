import { SalesforceCredentials } from './customer';
import { SyncConfig } from './sync_config';

export type DeveloperConfigParams = {
  syncConfigs: SyncConfig[];
  salesforceCredentials: SalesforceCredentials;
};

export function developerConfig(params: DeveloperConfigParams) {
  return params;
}
