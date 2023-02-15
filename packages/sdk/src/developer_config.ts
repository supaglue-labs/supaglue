import { SalesforceCredentials, SyncConfig } from '@supaglue/types';

export type SalesforceRateLimitConfig = {
  batchAllocationPerHour?: number; // max: 15,000/24 hours = 625/hour
  concurrentApiRequest?: number; // max:: developer: 5, production: 25
  apiRequestAllocation?: number; // max: 100K + (number license x license type)
};

export type DeveloperConfigParams = {
  syncConfigs: SyncConfig[];
  salesforceCredentials: SalesforceCredentials;
  salesforceRateLimitConfig?: SalesforceRateLimitConfig;
};

export function developerConfig(params: DeveloperConfigParams) {
  return params;
}
