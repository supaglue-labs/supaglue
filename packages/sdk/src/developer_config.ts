import { SalesforceCredentials, SyncConfig } from '@supaglue/types';

export type DeveloperConfigParams = {
  syncConfigs: SyncConfig[];
  salesforceCredentials: SalesforceCredentials;
};

export function developerConfig(params: DeveloperConfigParams) {
  return params;
}
