import { Field, SalesforceObject } from '.';

type SalesforceCustomerIntegrationParams = {
  // If the developer allows the salesforce object to be selectable by the customer,
  // this should be set. Otherwise, it should not.
  // TODO: We may want to spend some time thinking about how to generalize this for all settings
  // between `SyncConfig` and `Sync`.
  object?: SalesforceObject;

  // Tell Supaglue not to call the Salesforce API if customer is at more than this percentage
  // of their daily API quota.
  // TODO: We need to define another level of abstraction later if we want to do
  // triggered syncs and not just syncs periodically run on a schedule.
  apiUsageLimitPercentage?: number; // e.g. 0.8
};

type SalesforceCustomerSourceParams = SalesforceCustomerIntegrationParams;
type CustomerSourceParams = SalesforceCustomerSourceParams;

type SalesforceCustomerDestinationParams = SalesforceCustomerIntegrationParams;
type CustomerDestinationParams = SalesforceCustomerDestinationParams;

export type CustomerFieldMapping = Record<string, string>;

type BaseSyncUpdateParams = {
  // TODO: Consider moving `enabled` elsewhere when/if we allow syncs to be triggered.
  enabled?: boolean;
  fieldMapping?: CustomerFieldMapping;
  // TODO: cast json column values to correct types when reading from db
  customProperties?: Field[]; // Customer-, rather than developer-defined
};

type BaseSyncCreateParams = {
  syncConfigName: string;
  customerId: string;
  enabled: boolean;
  fieldMapping?: CustomerFieldMapping;
  // TODO: cast json column values to correct types when reading from db
  customProperties?: Record<string, string>[]; // Customer-, rather than developer-defined
};

type BaseSync = BaseSyncCreateParams & {
  id: string;
};

type InboundSyncCore = { type: 'inbound'; source?: CustomerSourceParams };
export type InboundSyncUpdateParams = BaseSyncUpdateParams & InboundSyncCore;
export type InboundSyncCreateParams = BaseSyncCreateParams & InboundSyncCore;
export type InboundSync = BaseSync & InboundSyncCore;

type OutboundSyncCore = { type: 'outbound'; destination?: CustomerDestinationParams };
export type OutboundSyncUpdateParams = BaseSyncUpdateParams & OutboundSyncCore;
export type OutboundSyncCreateParams = BaseSyncCreateParams & OutboundSyncCore;
export type OutboundSync = BaseSync & OutboundSyncCore;

type RealtimeInboundSyncCore = { type: 'realtime_inbound'; source?: CustomerSourceParams };
export type RealtimeInboundSyncUpdateParams = BaseSyncUpdateParams & RealtimeInboundSyncCore;
export type RealtimeInboundSyncCreateParams = BaseSyncCreateParams & RealtimeInboundSyncCore;
export type RealtimeInboundSync = BaseSync & RealtimeInboundSyncCore;

export type SyncUpdateParams = InboundSyncUpdateParams | OutboundSyncUpdateParams | RealtimeInboundSyncUpdateParams;
export type SyncCreateParams = InboundSyncCreateParams | OutboundSyncCreateParams | RealtimeInboundSyncCreateParams;
export type Sync = InboundSync | OutboundSync | RealtimeInboundSync;
