import { BaseSyncConfig } from './base';
import { Destination } from './destinations';

export type SalesforceCredentials = {
  loginUrl: string;
  clientId: string;
  clientSecret: string;
};

export function salesforceCredentials(params: SalesforceCredentials) {
  return params;
}

type InboundSyncConfig = BaseSyncConfig & {
  type: 'inbound';
  destination: Destination;
};

type OutboundSyncConfig = BaseSyncConfig & {
  type: 'outbound';

  // TODO: We will want to abstract this better when we support beyond Salesforce
  salesforceUpsertKey: string;

  source: string; // TODO
};

type SyncConfig = InboundSyncConfig | OutboundSyncConfig;

export function inboundSyncConfig(params: Omit<InboundSyncConfig, 'type'>): InboundSyncConfig {
  return {
    type: 'inbound',
    ...params,
  };
}

export function outboundSyncConfig(params: Omit<OutboundSyncConfig, 'type'>): OutboundSyncConfig {
  return {
    type: 'outbound',
    ...params,
  };
}

export type DeveloperConfigParams = {
  syncConfigs: SyncConfig[];
  salesforceCredentials: SalesforceCredentials;
};

export function developerConfig(params: DeveloperConfigParams) {
  return params;
}
