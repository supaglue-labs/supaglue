type BaseSyncUpdateParams = {
  // TODO: Consider moving `enabled` elsewhere when/if we allow syncs to be triggered.
  enabled: boolean;
  syncConfigName: string;
  fieldMapping?: Record<string, string>;

  // TODO: We need to define another level of abstraction later if we want to do
  // triggered syncs and not just syncs periodically run on a schedule.
  salesforceAPIUsageLimitPercentage?: number; // e.g. 0.8
};

type BaseSyncCreateParams = BaseSyncUpdateParams & {
  customerId: string;
};

type BaseSync = BaseSyncCreateParams & {
  id: string;
};

type InboundSyncCore = { type: 'inbound' };
export type InboundSyncUpdateParams = BaseSyncUpdateParams & InboundSyncCore;
export type InboundSyncCreateParams = BaseSyncCreateParams & InboundSyncCore;
export type InboundSync = BaseSync & InboundSyncCore;

type OutboundSyncCore = { type: 'outbound' };
export type OutboundSyncUpdateParams = BaseSyncUpdateParams & OutboundSyncCore;
export type OutboundSyncCreateParams = BaseSyncCreateParams & OutboundSyncCore;
export type OutboundSync = BaseSync & OutboundSyncCore;

export type SyncUpdateParams = InboundSyncUpdateParams | OutboundSyncUpdateParams;
export type SyncCreateParams = InboundSyncCreateParams | OutboundSyncCreateParams;
export type Sync = InboundSync | OutboundSync;
